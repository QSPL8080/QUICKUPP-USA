"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHead } from "@/components/crm/ListTools";
import { useFeedback } from "@/components/crm/Feedback";
import type { TeamUser } from "@/lib/crm/users";
import { ASSIGNABLE_ROLES, ROLE_ACCESS, roleName, type AssignableRole, type CrmRole } from "@/lib/crm/roles";

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never";

type Form = { name: string; username: string; email: string; password: string; isActive: boolean; role: AssignableRole };
const asRole = (r: string): AssignableRole => ((ASSIGNABLE_ROLES as readonly string[]).includes(r) ? (r as AssignableRole) : "admin");

/* what each role does, under the Role picker */
const ROLE_HELP: Record<AssignableRole, string> = {
  admin: "Can do everything in every tab, Team & Users included. Deletes go to the Deleted bin, where only the Super Admin restores them or removes them for good.",
  bdm: "Sees only the enquiries assigned to them and the meetings they schedule or are assigned to; schedules meetings and adds meeting notes. Gets an email and a CRM alert for every lead or meeting assigned to them.",
  bde: "Sees only the enquiries assigned to them and the meetings they schedule; schedules meetings for their leads. Gets an email and a CRM alert for every lead assigned to them.",
  accountant: "Works in Payments (payment links, payments, receipts) and Clients, including uploading quotations and NDAs; looks at enquiries without changing them.",
  viewer: "Can open every tab, but only to look: can't add, edit, delete, send or export anything. Can change their own profile and password.",
  seo: "Can view and edit the website's blogs and job openings, and their own profile and password.",
  hr: "Can view and edit job openings and job applications, and their own profile and password.",
};

/* current password, hidden until the eye is pressed (super admin only) */
function PasswordCell({ value }: { value: string | null | undefined }) {
  const [shown, setShown] = useState(false);
  if (!value) {
    return (
      <span className="crm-pw-none" title="Shown here once this person signs in, or set a new password in Edit to see it now.">
        Shown after their next sign-in
      </span>
    );
  }
  return (
    <span className="crm-pw">
      <span className="crm-pw-text">{shown ? value : "••••••••"}</span>
      <button type="button" className="crm-pw-btn" onClick={() => setShown((v) => !v)} aria-label={shown ? "Hide password" : "Show password"} title={shown ? "Hide password" : "Show password"}>
        {shown ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
      {shown && (
        <button
          type="button"
          className="crm-pw-btn"
          onClick={() => navigator.clipboard?.writeText(value)}
          aria-label="Copy password"
          title="Copy password"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      )}
    </span>
  );
}

export default function UsersView({ users, meId, meRole }: { users: TeamUser[]; meId: number; meRole: CrmRole }) {
  const superAdmin = meRole === "super_admin";
  const readOnly = meRole === "viewer";
  const router = useRouter();
  const { confirm, toast, ask } = useFeedback();
  const [editing, setEditing] = useState<TeamUser | "new" | null>(null);
  const [form, setForm] = useState<Form>({ name: "", username: "", email: "", password: "", isActive: true, role: "admin" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSA = (u: TeamUser | "new" | null) => u !== "new" && u !== null && u.role === "super_admin";

  const openForm = (u: TeamUser | "new") => {
    // only the Super Admin changes the Super Admin account; a Viewer only looks
    if (readOnly || (u !== "new" && u.role === "super_admin" && !superAdmin)) return;
    setForm(
      u === "new"
        ? { name: "", username: "", email: "", password: "", isActive: true, role: "admin" }
        : { name: u.name, username: u.username, email: u.email, password: "", isActive: u.isActive, role: asRole(u.role) }
    );
    setErrors({});
    setError("");
    setEditing(u);
  };
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };
  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError("");
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/crm/users" : `/api/crm/users/${(editing as TeamUser).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      if (json.errors) setErrors(json.errors);
      else setError(json.error || "Couldn't save. Please try again.");
      return;
    }
    setEditing(null);
    toast(isNew ? "User added" : "Changes saved");
    router.refresh();
  };

  const toggleActive = async (u: TeamUser) => {
    setListError("");
    if (u.isActive && !(await confirm({ title: `Deactivate ${u.name}?`, message: "They will be signed out straight away and can't sign in until you activate the account again.", confirmLabel: "Deactivate", tone: "default" }))) return;
    const res = await fetch(`/api/crm/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    }).catch(() => null);
    if (!res?.ok) return setListError("Couldn't update the account. Please try again.");
    toast(u.isActive ? `${u.name} deactivated` : `${u.name} activated`);
    router.refresh();
  };

  const remove = async (u: TeamUser) => {
    setListError("");
    const reason = await ask({
      title: `Delete ${u.name}'s account?`,
      message: superAdmin
        ? "They will be signed out and can't sign in. The account goes to the Deleted bin, where you can restore it or remove it for good."
        : "They will be signed out and can't sign in. The account goes to the Deleted bin, where the Super Admin can restore it.",
      input: { label: "Reason (optional)", placeholder: "e.g. duplicate, test entry, spam", optional: true },
      confirmLabel: "Yes, delete",
    });
    if (reason === null) return;
    const res = await fetch(`/api/crm/users/${u.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok && res?.status !== 404) return setListError(json.error || "Couldn't delete the account. Please try again.");
    if (editing !== null) setEditing(null);
    toast(json.trashed ? "Account moved to the Deleted bin" : "Account deleted");
    router.refresh();
  };

  return (
    <>
      <PageHead
        title="Team & Users"
        sub="Add team members (Admin, BDM, BDE, Accountant, Viewer, SEO, HR), change names, usernames, emails, roles or passwords, and activate, deactivate or delete accounts. Changes to an account are emailed to info@quickuppsoftech.us."
      >
        {!readOnly && <a href="/api/crm/users/export" className="crm-act crm-act-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </a>}
        {!readOnly && <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add user
        </button>}
      </PageHead>

      <div className="crm-card crm-card-flush">
        <div className="crm-bulk">
          <div className="crm-bulk-start">
            <span className="crm-muted">
              {users.length} {users.length === 1 ? "account" : "accounts"}
            </span>
          </div>
        </div>
      {listError && (
        <p className="crm-alert crm-alert-inset" role="alert">
          {listError}
        </p>
      )}

      <div className="crm-table-wrap">
        <table className="crm-table crm-stack">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              {superAdmin && <th>Password</th>}
              <th>Last sign-in</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const locked = u.role === "super_admin";
              // Admins don't change the Super Admin account; Viewers only look
              const canEdit = !readOnly && (!locked || superAdmin);
              return (
                <tr key={u.id} className="crm-row" onClick={() => openForm(u)}>
                  <td data-label="Name" className="crm-cell-main">
                    <span className="crm-user-cell">
                      <span className="crm-avatar crm-avatar-soft" aria-hidden="true">
                        {u.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <span className="crm-strong">{u.name}</span>
                        {u.id === meId && <span className="crm-cell-sub">You</span>}
                      </span>
                    </span>
                  </td>
                  <td data-label="Username">@{u.username}</td>
                  <td data-label="Email" className="crm-nowrap">
                    {u.email}
                  </td>
                  <td data-label="Role">
                    <span className={`crm-pill ${locked ? "crm-pill-paid" : "crm-pill-pending"}`} title={ROLE_ACCESS[u.role]}>{roleName(u.role)}</span>
                  </td>
                  {superAdmin && (
                    <td data-label="Password" className="crm-nowrap" onClick={(e) => e.stopPropagation()}>
                      <PasswordCell value={u.password} />
                      {u.passwordChangedAt && <span className="crm-cell-sub">Changed {fmtDate(u.passwordChangedAt)}</span>}
                    </td>
                  )}
                  <td data-label="Last sign-in" className="crm-nowrap">
                    {fmtDate(u.lastLoginAt)}
                  </td>
                  <td data-label="Account">
                    <span className={`crm-pill ${u.isActive ? "crm-pill-paid" : "crm-pill-failed"}`}>{u.isActive ? "Active" : "Deactivated"}</span>
                  </td>
                  <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                    <span className="crm-row-acts">
                      {canEdit && (
                      <button
                        type="button"
                        className="crm-act-btn crm-act-edit"
                        title="Edit user"
                        aria-label="Edit user"
                        onClick={() => openForm(u)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      )}
                      {!locked && canEdit && u.id !== meId && (
                        <>
                          <button
                            type="button"
                            className={`crm-act-btn ${u.isActive ? "crm-act-deactivate" : "crm-act-activate"}`}
                            title={u.isActive ? "Deactivate account" : "Activate account"}
                            aria-label={u.isActive ? "Deactivate account" : "Activate account"}
                            onClick={() => toggleActive(u)}
                          >
                            {u.isActive ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="18" y1="8" x2="23" y2="13" />
                                <line x1="23" y1="8" x2="18" y2="13" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <polyline points="17 11 19 13 23 9" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            className="crm-act-btn crm-act-delete"
                            title="Delete user"
                            aria-label="Delete user"
                            onClick={() => remove(u)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>

      {editing && (
        <div className="crm-modal-wrap" onClick={() => setEditing(null)}>
          <form className="crm-modal" onClick={(e) => e.stopPropagation()} onSubmit={save} noValidate role="dialog" aria-label={editing === "new" ? "Add user" : "Edit user"}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{editing === "new" ? "Team & Users" : `${roleName(editing.role)} account`}</p>
                <h2 className="crm-drawer-title">{editing === "new" ? "Add user" : `Edit ${editing.name}`}</h2>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setEditing(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-form-grid">
              <label className="crm-field">
                <span className="crm-label">Full name *</span>
                <input className="crm-input" value={form.name} onChange={set("name")} autoComplete="off" />
                {err("name")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Username *</span>
                <input className="crm-input" value={form.username} onChange={set("username")} autoComplete="off" autoCapitalize="none" placeholder="e.g. rahul.s" />
                {err("username")}
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Email *</span>
                <input className="crm-input" type="email" value={form.email} onChange={set("email")} autoComplete="off" />
                {err("email")}
              </label>
              {editing !== "new" && superAdmin && (
                <div className="crm-field crm-span-2">
                  <span className="crm-label">Current password</span>
                  <PasswordCell value={editing.password} />
                </div>
              )}
              <label className="crm-field crm-span-2">
                <span className="crm-label">{editing === "new" ? "Password *" : "New password (leave empty to keep the current one)"}</span>
                <input className="crm-input" type="text" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="At least 8 characters" />
                {err("password")}
              </label>
              {!isSA(editing) && (
                <div className="crm-field crm-span-2">
                  <span className="crm-label">Role *</span>
                  <select
                    className="crm-input crm-select"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: asRole(e.target.value) }))}
                  >
                    <option value="admin">Admin - the whole CRM</option>
                    <option value="bdm">BDM - Business Development Manager</option>
                    <option value="bde">BDE - Business Development Executive</option>
                    <option value="accountant">Accountant - Payments and Clients</option>
                    <option value="viewer">Viewer - can view everything, can&apos;t change anything</option>
                    <option value="seo">SEO - Blogs and Job Openings only</option>
                    <option value="hr">HR - Job Openings and Job Applications only</option>
                  </select>
                  <span className="crm-cell-sub">{ROLE_HELP[form.role]}</span>
                </div>
              )}
              {!isSA(editing) && (
                <label className="crm-check crm-check-row crm-span-2">
                  <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                  <span className="crm-check-box" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="crm-check-text">
                    <span className="crm-strong">Account active</span>
                    <span className="crm-cell-sub">{form.isActive ? "This user can sign in to the CRM." : "This user can't sign in until the account is activated."}</span>
                  </span>
                </label>
              )}
            </div>

            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              {editing !== "new" && !isSA(editing) && editing.id !== meId ? (
                <button type="button" className="crm-act crm-act-danger" onClick={() => remove(editing as TeamUser)} disabled={busy}>
                  Delete account
                </button>
              ) : (
                <span />
              )}
              <span className="crm-modal-foot-end">
                <button type="button" className="crm-act crm-act-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {busy ? "Saving…" : editing === "new" ? "Add user" : "Save changes"}
                </button>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
