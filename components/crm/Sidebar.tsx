"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavUser = { name: string; email: string; role: "super_admin" | "admin" };

const I = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  contact: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
  payments: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 10h20M6 15h4",
  jobs: "M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM2 12h20",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M4 6h16M4 12h16M4 18h16",
  site: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
};

const Icon = ({ d }: { d: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);


export default function CrmSidebar({ user, newCounts }: { user: NavUser; newCounts: Record<string, number> }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const on = (href: string) => (href === "/crm" ? pathname === "/crm" : pathname.startsWith(href));

  const logout = async () => {
    setLeaving(true);
    await fetch("/api/crm/logout", { method: "POST" }).catch(() => null);
    try {
      localStorage.setItem("qs_crm_signed_out", String(Date.now()));
    } catch {
      /* storage unavailable */
    }
    router.replace("/login");
    router.refresh();
  };

  const badge = (key: string) => (newCounts[key] ? <span className="crm-nav-badge">{newCounts[key]}</span> : null);

  return (
    <>
      <div className="crm-topbar">
        <button type="button" className="crm-icon-act" onClick={() => setOpen((o) => !o)} aria-label="Open menu" aria-expanded={open}>
          <Icon d={I.menu} />
        </button>
        <img src="/images/logo-white.png" alt="Quickupp Softech" className="crm-topbar-logo" />
      </div>

      <aside className={`crm-side${open ? " is-open" : ""}`}>
        <div className="crm-side-brand">
          <img src="/images/logo-white.png" alt="Quickupp Softech" />
        </div>

        <nav className="crm-nav" aria-label="CRM" onClick={() => setOpen(false)}>
          <Link href="/crm" className={`crm-nav-link${on("/crm") ? " is-on" : ""}`}>
            <Icon d={I.dashboard} />
            <span>Dashboard</span>
          </Link>
          <Link href="/crm/enquiries" className={`crm-nav-link${on("/crm/enquiries") ? " is-on" : ""}`}>
            <Icon d={I.contact} />
            <span>All Enquiries</span>
            {badge("leads")}
          </Link>

          <Link href="/crm/payments" className={`crm-nav-link${on("/crm/payments") ? " is-on" : ""}`}>
            <Icon d={I.payments} />
            <span>Payments</span>
          </Link>

          <p className="crm-nav-group">
            <Icon d={I.jobs} />
            <span>Careers</span>
          </p>
          <div className="crm-nav-sub">
            <Link href="/crm/jobs" className={`crm-nav-link crm-nav-sublink${on("/crm/jobs") ? " is-on" : ""}`}>
              <span className="crm-nav-dot" aria-hidden="true" />
              <span>Job Openings (Website)</span>
            </Link>
            <Link href="/crm/applications" className={`crm-nav-link crm-nav-sublink${on("/crm/applications") ? " is-on" : ""}`}>
              <span className="crm-nav-dot" aria-hidden="true" />
              <span>Job Applications</span>
              {badge("applications")}
            </Link>
          </div>

          {user.role === "super_admin" && (
            <Link href="/crm/users" className={`crm-nav-link${on("/crm/users") ? " is-on" : ""}`}>
              <Icon d={I.users} />
              <span>Team &amp; Users</span>
            </Link>
          )}
        </nav>

        <div className="crm-side-foot">
          <a href="/" className="crm-nav-link crm-nav-site" target="_blank" rel="noreferrer">
            <Icon d={I.site} />
            <span>View website</span>
          </a>
          <div className={`crm-user${on("/crm/profile") ? " is-on" : ""}`}>
            <Link href="/crm/profile" className="crm-user-link" onClick={() => setOpen(false)} title="My profile">
              <span className="crm-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="crm-user-text">
                <span className="crm-user-name">{user.name}</span>
                <span className="crm-user-role">{user.role === "super_admin" ? "Super Admin" : "Admin"}</span>
              </span>
            </Link>
            <button type="button" className="crm-icon-act crm-logout" onClick={logout} disabled={leaving} aria-label="Sign out" title="Sign out">
              <Icon d={I.logout} />
            </button>
          </div>
        </div>
      </aside>
      {open && <div className="crm-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
