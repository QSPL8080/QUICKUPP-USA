"use client";

export default function AddLeadButton() {
  return (
    <button
      type="button"
      className="crm-act crm-act-dark"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("crm:open-new-lead"));
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add lead
    </button>
  );
}
