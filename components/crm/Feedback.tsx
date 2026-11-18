"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/*
 * CRM feedback: an "Are you sure?" dialog before anything is deleted (or an
 * account is switched off), and a short message in the corner once an action
 * is done. Replaces the browser's own confirm boxes.
 */

type ConfirmOptions = {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "default";
};

/* a confirmation that also asks for a line of text: a reason, or a word to type to confirm */
type AskOptions = ConfirmOptions & {
  input: { label: React.ReactNode; placeholder?: string; mustType?: string; optional?: boolean };
};

type Toast = { id: number; text: string; tone: "ok" | "error" };

type Feedback = {
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  /** like confirm, with a text box: the text, or null when cancelled */
  ask: (o: AskOptions) => Promise<string | null>;
  toast: (text: string, tone?: "ok" | "error") => void;
};

const Ctx = createContext<Feedback | null>(null);

export function useFeedback(): Feedback {
  const ctx = useContext(Ctx);
  // outside the provider (shouldn't happen): fall back to the browser's own boxes
  return (
    ctx || {
      confirm: async (o) => window.confirm(`${o.title}\n\n${typeof o.message === "string" ? o.message : ""}`),
      ask: async (o) => window.prompt(`${o.title}\n\n${typeof o.message === "string" ? o.message : ""}`) ?? null,
      toast: () => {},
    }
  );
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOptions & { input?: AskOptions["input"]; resolve: (ok: boolean, text?: string) => void }) | null>(null);
  const [text, setText] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const okRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);

  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), []);
  const ask = useCallback(
    (o: AskOptions) =>
      new Promise<string | null>((resolve) => {
        setText("");
        setDialog({
          ...o,
          resolve: (ok, t) => {
            if (!ok) return resolve(null);
            const trimmed = (t ?? "").trim();
            if (o.input.mustType && trimmed.toUpperCase() === o.input.mustType.toUpperCase()) {
              return resolve(o.input.mustType);
            }
            return resolve(trimmed);
          },
        });
      }),
    []
  );

  const toast = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const answer = useCallback(
    (ok: boolean) => {
      dialog?.resolve(ok, text);
      setDialog(null);
    },
    [dialog, text]
  );
  // a word to type (e.g. DELETE) must match before the button works; a required reason can't be empty
  const inputOk =
    !dialog?.input ||
    (dialog.input.mustType
      ? text.trim().toUpperCase() === dialog.input.mustType.toUpperCase()
      : dialog.input.optional || text.trim().length > 0);

  useEffect(() => {
    if (!dialog) return;
    if (!dialog.input) okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, answer]);

  const danger = (dialog?.tone || "danger") === "danger";

  return (
    <Ctx.Provider value={{ confirm, ask, toast }}>
      {children}

      {dialog && (
        <div className="crm-modal-wrap crm-confirm-wrap" onClick={() => answer(false)}>
          <div className="crm-confirm" role="alertdialog" aria-modal="true" aria-labelledby="crm-confirm-title" onClick={(e) => e.stopPropagation()}>
            <span className={`crm-confirm-icon${danger ? " is-danger" : ""}`} aria-hidden="true">
              {danger ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              )}
            </span>
            <h2 id="crm-confirm-title" className="crm-confirm-title">
              {dialog.title}
            </h2>
            {dialog.message && (
              typeof dialog.message === "string" ? (
                <p className="crm-confirm-text">{dialog.message}</p>
              ) : (
                <div className="crm-confirm-text">{dialog.message}</div>
              )
            )}
            {dialog.input && (
              <label className="crm-confirm-input">
                <span className="crm-confirm-input-label">{dialog.input.label}</span>
                <input
                  className={`crm-input ${dialog.input.mustType ? "crm-confirm-must-type" : ""}`}
                  autoFocus
                  value={text}
                  placeholder={dialog.input.placeholder}
                  maxLength={255}
                  onChange={(e) => {
                    const val = dialog.input?.mustType ? e.target.value.toUpperCase() : e.target.value;
                    setText(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputOk) answer(true);
                  }}
                />
              </label>
            )}
            <div className="crm-confirm-actions">
              <button type="button" className="crm-act crm-act-ghost" onClick={() => answer(false)}>
                Cancel
              </button>
              <button
                ref={okRef}
                type="button"
                className={`crm-act ${danger ? "crm-act-red" : "crm-act-dark"}`}
                disabled={!inputOk}
                onClick={() => answer(true)}
              >
                {dialog.confirmLabel || (danger ? "Yes, delete" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="crm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`crm-toast crm-toast-${t.tone}`} role="status">
            <span className="crm-toast-icon" aria-hidden="true">
              {t.tone === "ok" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M12 7v6M12 17h.01" />
                </svg>
              )}
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
