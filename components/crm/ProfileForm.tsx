"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { name: string; username: string; email: string; isSuperAdmin: boolean; superAdminEmail?: string };

export default function ProfileForm({ name, username, email, isSuperAdmin }: Props) {
  const router = useRouter();

  // Profile details state
  const [form, setForm] = useState({ name, username, email });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Password change state
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);
  const [passBusy, setPassBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const setPass = (k: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((p) => ({ ...p, [k]: e.target.value }));
    setPassSaved(false);
    if (passErrors[k]) setPassErrors((p) => ({ ...p, [k]: "" }));
  };

  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);
  const passErr = (k: string) => (passErrors[k] ? <span className="crm-field-error">{passErrors[k]}</span> : null);

  const saveProfile = async (e: React.FormEvent) => {
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

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pe: Record<string, string> = {};
    if (!passwords.password) pe.password = "Please enter a new password.";
    else if (passwords.password.length < 8) pe.password = "Password must be at least 8 characters.";
    if (passwords.password !== passwords.confirm) pe.confirm = "Passwords do not match.";

    if (Object.keys(pe).length) {
      setPassErrors(pe);
      return;
    }

    setPassBusy(true);
    setPassErrors({});
    setPassError("");
    const res = await fetch("/api/crm/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, password: passwords.password }),
    }).catch(() => null);
    setPassBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      if (json.errors) setPassErrors(json.errors);
      else setPassError(json.error || "Couldn't update your password. Please try again.");
      return;
    }
    setPassSaved(true);
    setPasswords({ password: "", confirm: "" });
    router.refresh();
  };

  return (
    <div className="crm-grid-2 crm-profile">
      {/* Profile Details Card */}
      <form className="crm-card" onSubmit={saveProfile} noValidate>
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
            <span className="crm-label">Email *</span>
            <input className="crm-input" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
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
            Profile saved successfully.
          </p>
        )}
        <div className="crm-modal-foot">
          <span />
          <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <form className="crm-card" onSubmit={savePassword} noValidate>
        <div className="crm-card-head">
          <h2 className="crm-card-title">Change password</h2>
        </div>
        <p className="crm-note" style={{ marginBottom: "16px" }}>
          Set a new password for your account. Once saved in the database, you can immediately use your new password.
        </p>
        <div className="crm-form-grid">
          <label className="crm-field crm-span-2">
            <span className="crm-label">New password *</span>
            <input
              className="crm-input"
              type="password"
              value={passwords.password}
              onChange={setPass("password")}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            {passErr("password")}
          </label>
          <label className="crm-field crm-span-2">
            <span className="crm-label">Confirm new password *</span>
            <input
              className="crm-input"
              type="password"
              value={passwords.confirm}
              onChange={setPass("confirm")}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            {passErr("confirm")}
          </label>
        </div>
        {passError && (
          <p className="crm-alert" role="alert">
            {passError}
          </p>
        )}
        {passSaved && (
          <p className="crm-alert crm-alert-ok" role="status">
            Password updated in database! You can now use your new password.
          </p>
        )}
        <div className="crm-modal-foot">
          <span />
          <button type="submit" className="crm-act crm-act-dark" disabled={passBusy}>
            {passBusy ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
