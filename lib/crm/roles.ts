/*
 * CRM roles and what each may open or do. No server code here, so the CRM
 * screens can use the same rules as the server.
 */

export type CrmRole = "super_admin" | "admin" | "seo" | "viewer" | "hr" | "bdm" | "bde" | "accountant";

/*
 * What each role may open.
 * - Super Admin and Admin: everything, Team & Users included. Only the Super
 *   Admin deletes for good and has the Bin; an Admin's delete moves the
 *   record to that bin.
 * - Viewer: every tab, only to look (every change is refused in proxy.ts), plus
 *   their own profile and password.
 * - BDM and BDE: All Enquiries (only the leads assigned to them) and Calendly
 *   Meetings (only the meetings they scheduled, or that are assigned to them).
 * - Accountant: Payments (payment links included), Clients, and All Enquiries
 *   to look at (no editing, assigning or deleting leads).
 * - SEO: only the website's Blogs and Job Openings. HR: only Job Openings and
 *   Job Applications, with full editing there.
 * Everyone has their own profile.
 */
export type CrmArea = "dashboard" | "leads" | "meetings" | "payments" | "clients" | "applications" | "jobs" | "blogs" | "profile" | "users" | "trash";
const SEO_AREAS: readonly CrmArea[] = ["blogs", "jobs", "profile"];
/** HR: only the Careers tabs (job openings and job applications), with full editing there */
const HR_AREAS: readonly CrmArea[] = ["jobs", "applications", "profile"];
/** BDM and BDE: their own leads and meetings */
const SALES_AREAS: readonly CrmArea[] = ["leads", "meetings", "profile"];
/** Accountant: payments and clients, and the leads to look at */
const ACCOUNTANT_AREAS: readonly CrmArea[] = ["leads", "payments", "clients", "profile"];

export const ROLES: readonly CrmRole[] = ["super_admin", "admin", "bdm", "bde", "accountant", "viewer", "seo", "hr"];
/** The roles a team account can be given on Team & Users (the Super Admin account is made once, at setup) */
export const ASSIGNABLE_ROLES = ["admin", "bdm", "bde", "accountant", "viewer", "seo", "hr"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/** Super Admin and Admin: can do everything in every tab */
export const isAdminLike = (u: { role: string } | null | undefined) => u?.role === "super_admin" || u?.role === "admin";
/** BDM and BDE: see only the leads assigned to them and their own meetings */
export const isSalesRole = (u: { role: string } | null | undefined) => u?.role === "bdm" || u?.role === "bde";
/** Who may change leads (status, details): Admins, and BDMs/BDEs on their own leads. Accountants and Viewers only look. */
export const canEditLeads = (u: { role: string } | null | undefined) => isAdminLike(u) || isSalesRole(u);
/** Who may delete records: Admins (to the Bin) and the Super Admin (for good); Accountants their payments */
export const canDelete = (u: { role: string } | null | undefined, area: CrmArea) =>
  isAdminLike(u) || (u?.role === "accountant" && area === "payments") || ((u?.role === "seo" || u?.role === "hr") && (area === "blogs" || area === "jobs" || area === "applications"));
/** Only the Super Admin deletes for good; everyone else's delete goes to the Bin */
/** Removing something for good: only the Super Admin, and only from the Bin */
export const deletesForGood = (u: { role: string } | null | undefined) => u?.role === "super_admin";

/** What a user may do on All Enquiries (the screen and the API use the same rules) */
export type LeadPerms = {
  /** add new leads by hand (Admins only) */
  add: boolean;
  /** change a lead's details and statuses (a BDM/BDE: only their own leads) */
  edit: boolean;
  /** assign leads to a BDM or BDE */
  assign: boolean;
  /** delete leads (an Admin's delete goes to the Bin) */
  remove: boolean;
  /** the delete goes to the Bin, not for good */
  toBin: boolean;
  /** see and make payment links from a lead */
  payLinks: boolean;
  /** add files to a lead (a BDM/BDE: general files on their own leads, not client documents) */
  files: boolean;
  /** add client documents (quotation, NDA…): Admins and the Accountant */
  clientDocs: boolean;
  /** open the Clients tab (a converted lead links to its client) */
  clients: boolean;
  /** schedule a call for a lead (Calendly Meetings) */
  meetings: boolean;
  /** a BDM or BDE: only their own leads */
  ownOnly: boolean;
};
export function leadPermsFor(u: { role: string } | null | undefined): LeadPerms {
  const admin = isAdminLike(u);
  const sales = isSalesRole(u);
  const accountant = u?.role === "accountant";
  return {
    add: admin,
    edit: admin || sales,
    assign: admin,
    remove: admin,
    toBin: admin,
    payLinks: admin || accountant,
    files: admin || sales || accountant,
    clientDocs: admin || accountant,
    clients: admin || accountant || u?.role === "viewer",
    meetings: admin || sales || u?.role === "viewer",
    ownOnly: sales,
  };
}

/** What a user may do on Calendly Meetings */
export type MeetingPerms = {
  /** arrange meetings (Calendly, for a lead or typed in) */
  schedule: boolean;
  /** reschedule, edit, cancel and add notes (a BDM/BDE: their own meetings) */
  work: boolean;
  /** assign a meeting to a BDM */
  assign: boolean;
  /** delete meetings from the CRM list */
  remove: boolean;
  /** the delete goes to the Bin, not for good */
  toBin: boolean;
  /** a BDM or BDE: only the meetings they scheduled or that are assigned to them */
  ownOnly: boolean;
};
export function meetingPermsFor(u: { role: string } | null | undefined): MeetingPerms {
  const admin = isAdminLike(u);
  const sales = isSalesRole(u);
  return { schedule: admin || sales, work: admin || sales, assign: admin, remove: admin, toBin: admin, ownOnly: sales };
}

export const canAccess = (u: { role: string } | null, area: CrmArea) => {
  if (!u) return false;
  if (area === "trash") return u.role === "super_admin";
  if (u.role === "seo") return SEO_AREAS.includes(area);
  if (u.role === "hr") return HR_AREAS.includes(area);
  if (u.role === "bdm" || u.role === "bde") return SALES_AREAS.includes(area);
  if (u.role === "accountant") return ACCOUNTANT_AREAS.includes(area);
  // super admin, admin, viewer: every tab
  return true;
};

/** Where a user lands after signing in (and when they open a page they can't use) */
export const homeFor = (u: { role: string }) =>
  u.role === "seo"
    ? "/crm/blogs"
    : u.role === "hr"
    ? "/crm/applications"
    : u.role === "bdm" || u.role === "bde"
    ? "/crm/enquiries"
    : u.role === "accountant"
    ? "/crm/payments"
    : "/crm";

const ROLE_NAMES: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  bdm: "BDM",
  bde: "BDE",
  accountant: "Accountant",
  viewer: "Viewer",
  seo: "SEO",
  hr: "HR",
};
export const roleName = (role: string | null | undefined) => ROLE_NAMES[String(role)] || "Admin";

/** What each role can do, in a line (Team & Users and its export) */
export const ROLE_ACCESS: Record<CrmRole, string> = {
  super_admin: "Everything in every tab; the only one who deletes for good (Bin)",
  admin: "Everything in every tab, Team & Users included; deletes go to the Bin",
  bdm: "Own assigned enquiries and meetings; takes the meetings assigned to them",
  bde: "Own assigned enquiries and the meetings they schedule",
  accountant: "Payments, payment links and Clients; looks at enquiries",
  viewer: "Sees every tab; can't change anything",
  seo: "Blogs and job openings only",
  hr: "Job openings and job applications only",
};
