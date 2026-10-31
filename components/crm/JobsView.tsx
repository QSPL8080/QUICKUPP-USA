"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import { EMPLOYMENT_TYPES, JOB_DEPARTMENTS, type Job } from "@/lib/jobs";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

type FormState = {
  title: string;
  department: string;
  employmentType: string;
  location: string;
  experience: string;
  responsibilities: string;
  skills: string;
  deadline: string;
  isOpen: boolean;
};

const blank = (): FormState => ({
  title: "",
  department: "",
  employmentType: "",
  location: "",
  experience: "",
  responsibilities: "",
  skills: "",
  deadline: "",
  isOpen: true,
});

const fromJob = (j: Job): FormState => ({
  title: j.title,
  department: j.department,
  employmentType: j.employmentType,
  location: j.location,
  experience: j.experience,
  responsibilities: j.responsibilities.join("\n"),
  skills: j.skills.join("\n"),
  deadline: j.deadline || "",
  isOpen: j.isOpen,
});

/** Live on the Careers page: open and not past its deadline */
const liveState = (j: Job) => (!j.isOpen ? "closed" : j.deadline && j.deadline < todayStr() ? "expired" : "live");
const STATE_LABEL = { live: "Live", closed: "Closed", expired: "Deadline passed" } as const;

export default function JobsView({ rows, openNew }: { rows: Job[]; openNew: boolean }) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [editing, setEditing] = useState<Job | "new" | null>(openNew ? "new" : null);
  const [form, setForm] = useState<FormState>(blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const sel = useSelection(rows.map((j) => j.id));

  const openForm = (j: Job | "new") => {
    setForm(j === "new" ? blank() : fromJob(j));
    setErrors({});
    setError("");
    setEditing(j);
  };
  const close = () => setEditing(null);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError("");
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/crm/jobs" : `/api/crm/jobs/${(editing as Job).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      if (json.errors) setErrors(json.errors);
      else setError(json.error || "Couldn't save the job opening. Please try again.");
      return;
    }
    close();
    toast(isNew ? "Job opening published" : "Changes saved");
    router.refresh();
  };

  const toggleOpen = async (j: Job) => {
    setListError("");
    const res = await fetch(`/api/crm/jobs/${j.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !j.isOpen }),
    }).catch(() => null);
    if (!res?.ok) return setListError("Couldn't update the job opening. Please try again.");
    toast(j.isOpen ? "Opening closed — hidden from the Careers page" : "Opening reopened on the Careers page");
    router.refresh();
  };

  const remove = async () => {
    if (editing === "new" || !editing) return;
    if (!(await confirm({ title: `Delete the "${editing.title}" opening?`, message: "It will be removed from the Careers page and the CRM. Applications already received are kept. This can't be undone." }))) return;
    setBusy(true);
    const res = await fetch(`/api/crm/jobs/${editing.id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (!res?.ok && res?.status !== 404) return setError("Couldn't delete the job opening. Please try again.");
    close();
    toast("Job opening deleted");
    router.refresh();
  };

  const removeOne = async (j: Job) => {
    if (!(await confirm({ title: `Delete the "${j.title}" opening?`, message: "It will be removed from the Careers page and the CRM. Applications already received are kept. This can't be undone." }))) return;
    setListError("");
    const res = await fetch(`/api/crm/jobs/${j.id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok && res?.status !== 404) return setListError("Couldn't delete the job opening. Please try again.");
    toast("Job opening deleted");
    router.refresh();
  };

  const removeSelected = async () => {
    const ids = sel.selected;
    if (!ids.length) return;
    const what = ids.length === 1 ? "this job opening" : `these ${ids.length} job openings`;
    if (!(await confirm({ title: `Delete ${what}?`, message: "They will be removed from the Careers page and the CRM. This can't be undone." }))) return;
    setBusy(true);
    setListError("");
    const res = await fetch("/api/crm/jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setListError("Couldn't delete the selected job openings. Please try again.");
    sel.clear();
    toast(ids.length === 1 ? "Job opening deleted" : `${ids.length} job openings deleted`);
    router.refresh();
  };

  const addButton = (
    <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add job opening
    </button>
  );

  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);

  return (
    <>
      {rows.length ? (
        <BulkBar sel={sel} noun={["job opening", "job openings"]} busy={busy} onDelete={removeSelected}>
          {addButton}
        </BulkBar>
      ) : (
        <div className="crm-toolbar-end">{addButton}</div>
      )}
      {listError && (
        <p className="crm-alert crm-alert-inset" role="alert">
          {listError}
        </p>
      )}

      {rows.length ? (
        <div className="crm-table-wrap">
          <table className="crm-table crm-stack crm-selectable">
            <thead>
              <tr>
                <th className="crm-col-check">
                  <SelectBox checked={sel.all} mixed={sel.some} onChange={sel.toggleAll} label="Select all" />
                </th>
                <th>Job title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Applications</th>
                <th>On careers page</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const state = liveState(j);
                return (
                  <tr key={j.id} className={`crm-row${sel.has(j.id) ? " is-picked" : ""}`} onClick={() => openForm(j)}>
                    <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                      <SelectBox checked={sel.has(j.id)} onChange={(on) => sel.toggle(j.id, on)} label={`Select ${j.title}`} />
                    </td>
                    <td data-label="Job title" className="crm-cell-main">
                      <span className="crm-strong">{j.title}</span>
                      <span className="crm-cell-sub">{j.experience}</span>
                    </td>
                    <td data-label="Department">{j.department}</td>
                    <td data-label="Type">{j.employmentType}</td>
                    <td data-label="Location">{j.location}</td>
                    <td data-label="Deadline" className="crm-nowrap">
                      {fmtDate(j.deadline)}
                    </td>
                    <td data-label="Applications" onClick={(e) => e.stopPropagation()}>
                      {j.applications ? (
                        <a className="crm-link-btn" href={`/crm/applications?job=${j.id}`}>
                          {j.applications} {j.applications === 1 ? "application" : "applications"}
                        </a>
                      ) : (
                        <span className="crm-muted">None yet</span>
                      )}
                    </td>
                    <td data-label="On careers page">
                      <span className={`crm-pill crm-pill-${state === "live" ? "paid" : state === "closed" ? "failed" : "pending"}`}>{STATE_LABEL[state]}</span>
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                      <span className="crm-row-acts">
                        <button
                          type="button"
                          className="crm-act-btn crm-act-edit"
                          title="Edit job opening"
                          aria-label="Edit job opening"
                          onClick={() => openForm(j)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={`crm-act-btn ${j.isOpen ? "crm-act-deactivate" : "crm-act-activate"}`}
                          title={j.isOpen ? "Close job opening" : "Reopen job opening"}
                          aria-label={j.isOpen ? "Close job opening" : "Reopen job opening"}
                          onClick={() => toggleOpen(j)}
                        >
                          {j.isOpen ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className="crm-act-btn crm-act-delete"
                          title="Delete job opening"
                          aria-label="Delete job opening"
                          onClick={() => removeOne(j)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="crm-empty">
          <p className="crm-empty-title">No job openings yet</p>
          <p className="crm-muted">Use “Add job opening” to publish a vacancy on the Careers page.</p>
        </div>
      )}

      {editing && (
        <div className="crm-modal-wrap" onClick={close}>
          <form className="crm-modal" onClick={(e) => e.stopPropagation()} onSubmit={save} noValidate role="dialog" aria-label={editing === "new" ? "Add job opening" : "Edit job opening"}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{editing === "new" ? "Careers page" : `Job #${editing.id}`}</p>
                <h2 className="crm-drawer-title">{editing === "new" ? "Add job opening" : "Edit job opening"}</h2>
              </div>
              <button type="button" className="crm-icon-act" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-form-grid">
              <label className="crm-field crm-span-2">
                <span className="crm-label">Job title *</span>
                <input className="crm-input" value={form.title} onChange={set("title")} />
                {err("title")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Department *</span>
                <select className="crm-input crm-select" value={form.department} onChange={set("department")}>
                  <option value="">Select department</option>
                  {JOB_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {err("department")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Employment type *</span>
                <select className="crm-input crm-select" value={form.employmentType} onChange={set("employmentType")}>
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {err("employmentType")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Work location *</span>
                <input className="crm-input" value={form.location} onChange={set("location")} placeholder="e.g. Remote, Pune, Dover" />
                {err("location")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Experience required *</span>
                <input className="crm-input" value={form.experience} onChange={set("experience")} placeholder="e.g. 2–4 years, Fresher" />
                {err("experience")}
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Key responsibilities * (one per line)</span>
                <textarea className="crm-input crm-textarea" rows={5} value={form.responsibilities} onChange={set("responsibilities")} />
                {err("responsibilities")}
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Required skills * (one per line)</span>
                <textarea className="crm-input crm-textarea" rows={4} value={form.skills} onChange={set("skills")} />
                {err("skills")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Application deadline (optional)</span>
                <input className="crm-input" type="date" value={form.deadline} onChange={set("deadline")} />
                {err("deadline")}
              </label>
              <label className="crm-check crm-check-row crm-job-open">
                <input type="checkbox" checked={form.isOpen} onChange={set("isOpen")} />
                <span className="crm-check-box" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="crm-check-text">
                  <span className="crm-strong">Show on the Careers page</span>
                  <span className="crm-cell-sub">{form.isOpen ? "Visible under Current Job Openings" : "Hidden from the website"}</span>
                </span>
              </label>
            </div>

            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              {editing !== "new" ? (
                <button type="button" className="crm-act crm-act-danger" onClick={remove} disabled={busy}>
                  Delete
                </button>
              ) : (
                <span />
              )}
              <span className="crm-modal-foot-end">
                <button type="button" className="crm-act crm-act-ghost" onClick={close}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {busy ? "Saving…" : editing === "new" ? "Publish opening" : "Save changes"}
                </button>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
