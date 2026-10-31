"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import type { TeamUser } from "@/lib/crm/users";

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never";

type Form = { name: string; username: string; email: string; password: string; isActive: boolean };

export default function UsersView({ users, meId }: { users: TeamUser[]; meId: number }) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [editing, setEditing] = useState<TeamUser | "new" | null>(null);
  const [form, setForm] = useState<Form>({ name: "", username: "", email: "", password: "", isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSA = (u: TeamUser | "new" | null) => u !== "new" && u !== null && u.role === "super_admin";

  const openForm = (u: TeamUser | "new") => {
    setForm(u === "new" ? { name: "", username: "", email: "", password: "", isActive: true } : { name: u.name, username: u.username, email: u.email, password: "", isActive: u.isActive });
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
    if (!(await confirm({ title: `Delete ${u.name}'s account?`, message: "They will no longer be able to sign in. This can't be undone." }))) return;
    const res = await fetch(`/api/crm/users/${u.id}`, { method: "DELETE" }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok && res?.status !== 404) return setListError(json.error || "Couldn't delete the account. Please try again.");
    if (editing !== null) setEditing(null);
    toast("Account deleted");
    router.refresh();
  };

  return (
    <>
      <div className="crm-bulk">
        <div className="crm-bulk-start">
          <span className="crm-muted">
            {users.length} {users.length === 1 ? "account" : "accounts"}
          </span>
        </div>
        <div className="crm-bulk-end">
          <button type="button" className="crm-act crm-act-dark crm-act-sm" onClick={() => openForm("new")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add user
          </button>
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
              <th>Last sign-in</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const locked = u.role === "super_admin";
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
                    <span className={`crm-pill ${locked ? "crm-pill-paid" : "crm-pill-pending"}`}>{locked ? "Super Admin" : "Admin"}</span>
                  </td>
                  <td data-label="Last sign-in" className="crm-nowrap">
                    {fmtDate(u.lastLoginAt)}
                  </td>
                  <td data-label="Account">
                    {locked ? (
                      <span className="crm-lock" title="The super admin account is locked">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="4" y="11" width="16" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                        Locked
                      </span>
                    ) : (
                      <span className={`crm-pill ${u.isActive ? "crm-pill-paid" : "crm-pill-failed"}`}>{u.isActive ? "Active" : "Deactivated"}</span>
                    )}
                  </td>
                  <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                    <span className="crm-row-acts">
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
                      {!locked && (
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

      {editing && (
        <div className="crm-modal-wrap" onClick={() => setEditing(null)}>
          <form className="crm-modal" onClick={(e) => e.stopPropagation()} onSubmit={save} noValidate role="dialog" aria-label={editing === "new" ? "Add user" : "Edit user"}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{editing === "new" ? "Team & Users" : isSA(editing) ? "Super Admin · locked account" : "Admin account"}</p>
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
                <span className="crm-label">Email *{isSA(editing) && " (locked)"}</span>
                <input className="crm-input" type="email" value={form.email} onChange={set("email")} disabled={isSA(editing)} autoComplete="off" />
                {err("email")}
              </label>
              {isSA(editing) ? (
                <p className="crm-note crm-span-2">The super admin&apos;s sign-in email and password are fixed and can&apos;t be changed here. You can change the name and username.</p>
              ) : (
                <>
                  <label className="crm-field crm-span-2">
                    <span className="crm-label">{editing === "new" ? "Password *" : "New password (leave empty to keep the current one)"}</span>
                    <input className="crm-input" type="text" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="At least 8 characters" />
                    {err("password")}
                  </label>
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
                </>
              )}
            </div>

            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              {editing !== "new" && !isSA(editing) ? (
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
