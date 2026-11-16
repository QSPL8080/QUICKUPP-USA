import type { Metadata } from "next";
import { canAccess, isSalesRole, isViewOnly, requireUser } from "@/lib/crm/auth";
import { ViewOnlyProvider } from "@/components/crm/ViewOnly";
import SideToggle from "@/components/crm/SideToggle";
import { cookies } from "next/headers";
import { dashboardStats } from "@/lib/crm/data";
import { newApplicationCount } from "@/lib/crm/applications";
import { notificationsForRole } from "@/lib/crm/notifications";
import { assignedNewCount } from "@/lib/crm/data";
import { trashCount } from "@/lib/crm/trash";
import NotifyCenter from "@/components/crm/NotifyCenter";
import TableFit from "@/components/crm/TableFit";
import { FeedbackProvider } from "@/components/crm/Feedback";
import CrmSidebar from "@/components/crm/Sidebar";
import IdleLogout from "@/components/crm/IdleLogout";
import TimeZoneCookie from "@/components/crm/TimeZoneCookie";
import { viewerTimeZone } from "@/lib/crm/crmTime";
import { IDLE_MINUTES } from "@/lib/crm/auth";
import "./crm.css";

export const metadata: Metadata = {
  title: "CRM | Quickupp Softech",
  robots: { index: false, follow: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // each role gets the counts and alerts for its own tabs (see lib/crm/roles and lib/crm/notifications):
  // all new leads for Admins and Viewers, a BDM/BDE's own new leads, applications for those with Careers
  const sales = isSalesRole(user);
  const [{ perSource }, applications, notifications, ownNew, trash] = await Promise.all([
    canAccess(user, "dashboard") ? dashboardStats() : { perSource: [] as { fresh: number }[] },
    canAccess(user, "applications") ? newApplicationCount() : 0,
    notificationsForRole(user.id, user.role),
    sales ? assignedNewCount(user.id) : 0,
    canAccess(user, "trash") ? trashCount() : 0,
  ]);
  const zone = await viewerTimeZone();
  const viewOnly = isViewOnly(user);
  // the left menu hidden or shown on laptops and desktops, as this user left it (SideToggle)
  const sideClosed = (await cookies()).get(`crm_side_u${user.id}`)?.value === "closed";
  const newCounts = { leads: sales ? ownNew : perSource.reduce((a, s) => a + s.fresh, 0), applications, trash };
  return (
    <div className={`crm-root${viewOnly ? " crm-viewonly" : ""}${sideClosed ? " crm-side-closed" : ""}`}>
      <ViewOnlyProvider viewOnly={viewOnly}>
      <FeedbackProvider>
        <CrmSidebar user={user} newCounts={newCounts} />
        <div className="crm-body">
          <header className="crm-header-bar">
            <div className="crm-header-bar-start">
              <SideToggle userId={user.id} initialClosed={sideClosed} />
              <span className="crm-header-portal">Quickupp Softech &middot; CRM</span>
              {viewOnly && (
                <span className="crm-viewonly-tag" title="You can look at everything in the CRM but can't make changes. You can still change your own profile and password.">
                  View only
                </span>
              )}
            </div>
            <NotifyCenter data={notifications} user={{ name: user.name, email: user.email, role: user.role }} />
          </header>
          <main className="crm-main">{children}</main>
        </div>
        <TableFit />
        <IdleLogout idleMinutes={IDLE_MINUTES} />
        <TimeZoneCookie serverZone={zone} />
      </FeedbackProvider>
      </ViewOnlyProvider>
    </div>
  );
}
