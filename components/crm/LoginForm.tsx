"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REMEMBER_KEY = "qs_crm_email";

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c5 0 9 4.5 10 7a12.3 12.3 0 0 1-2.4 3.5M6.6 6.6C4.3 8 2.7 10.2 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
      </>
    ) : (
      <>
        <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false); // unchecked unless the user turned it on before

  // A previously remembered email (only saved when "Remember email" was ticked).
  // Read after the first paint, since the server can't see this browser's storage.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(REMEMBER_KEY);
        if (saved) {
          setEmail(saved);
          setRemember(true);
        }
      } catch {
        /* storage unavailable */
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/crm/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error || "Sign-in failed. Please try again.");
        return;
      }
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* storage unavailable */
      }
      router.replace("/crm");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="crm-login-form" onSubmit={submit} noValidate>
      <label className="crm-field">
        <span className="crm-label">Email or username</span>
        <input
          className="crm-input"
          type="text"
          autoCapitalize="none"
          spellCheck={false}
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@quickuppsoftech.us or username"
        />
      </label>
      <label className="crm-field">
        <span className="crm-label">Password</span>
        <span className="crm-pass">
          <input
            className="crm-input"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="crm-pass-toggle"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            title={show ? "Hide password" : "Show password"}
          >
            <EyeIcon off={show} />
          </button>
        </span>
      </label>
      <label className="crm-check">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span className="crm-check-box" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <span>Remember me</span>
      </label>
      {error && (
        <p className="crm-alert" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="crm-act crm-act-dark crm-act-block" disabled={busy || !email || !password}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
