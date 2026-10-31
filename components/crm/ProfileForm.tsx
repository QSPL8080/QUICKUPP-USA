"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { name: string; username: string; email: string; isSuperAdmin: boolean; superAdminEmail: string };

export default function ProfileForm({ name, username, email, isSuperAdmin, superAdminEmail }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name, username, email });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };
  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError("");
    const res = await fetch("/api/crm/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      if (json.errors) setErrors(json.errors);
      else setError(json.error || "Couldn't save your profile. Please try again.");
      return;
    }
    setSaved(true);
    router.refresh();
  };

  const mail = `mailto:${superAdminEmail}?subject=${encodeURIComponent("CRM password change request")}&body=${encodeURIComponent(
    `Hi,\n\nPlease change the CRM password for my account.\n\nName: ${name}\nUsername: ${username}\nEmail: ${email}\n\nThank you.`
  )}`;

  return (
    <div className="crm-grid-2 crm-profile">
      <form className="crm-card" onSubmit={save} noValidate>
        <div className="crm-card-head">
          <h2 className="crm-card-title">Profile details</h2>
        </div>
        <div className="crm-form-grid">
          <label className="crm-field crm-span-2">
            <span className="crm-label">Full name *</span>
            <input className="crm-input" value={form.name} onChange={set("name")} autoComplete="name" />
            {err("name")}
          </label>
          <label className="crm-field crm-span-2">
            <span className="crm-label">Username *</span>
            <input className="crm-input" value={form.username} onChange={set("username")} autoCapitalize="none" autoComplete="username" />
            {err("username")}
          </label>
          <label className="crm-field crm-span-2">
            <span className="crm-label">Email {isSuperAdmin ? "(locked)" : "*"}</span>
            <input className="crm-input" type="email" value={form.email} onChange={set("email")} disabled={isSuperAdmin} autoComplete="email" />
            {err("email")}
          </label>
        </div>
        {error && (
          <p className="crm-alert" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="crm-alert crm-alert-ok" role="status">
            Profile saved.
          </p>
        )}
        <div className="crm-modal-foot">
          <span />
          <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>

      <div className="crm-card">
        <div className="crm-card-head">
          <h2 className="crm-card-title">Password</h2>
        </div>
        {isSuperAdmin ? (
          <p className="crm-note">The super admin account is locked: its sign-in email ({superAdminEmail}) and password are fixed and can&apos;t be changed from the CRM.</p>
        ) : (
          <>
            <p className="crm-note">
              For security, passwords are changed by the super admin. Email <strong>{superAdminEmail}</strong> and ask for a new password — it will be set for you in Team &amp;
              Users.
            </p>
            <a href={mail} className="crm-act crm-act-ghost crm-act-sm">
              Email the super admin
            </a>
          </>
        )}
      </div>
    </div>
  );
}
