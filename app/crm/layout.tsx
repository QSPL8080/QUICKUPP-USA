import type { Metadata } from "next";
import { isViewOnly, requireUser } from "@/lib/crm/auth";
import { ViewOnlyProvider } from "@/components/crm/ViewOnly";
import { dashboardStats } from "@/lib/crm/data";
import { newApplicationCount } from "@/lib/crm/applications";
import { getNotifications } from "@/lib/crm/notifications";
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
  // the SEO role only works on blogs and job openings: no lead, payment or application counts or alerts
  const seo = user.role === "seo";
  const [{ perSource }, applications, notifications] = seo
    ? [{ perSource: [] as { fresh: number }[] }, 0, { asOf: "", unread: 0, items: [] }]
    : await Promise.all([dashboardStats(), newApplicationCount(), getNotifications(user.id)]);
  const zone = await viewerTimeZone();
  const viewOnly = isViewOnly(user);
  const newCounts = { leads: perSource.reduce((a, s) => a + s.fresh, 0), applications };
  return (
    <div className={`crm-root${viewOnly ? " crm-viewonly" : ""}`}>
      <ViewOnlyProvider viewOnly={viewOnly}>
      <FeedbackProvider>
        <CrmSidebar user={user} newCounts={newCounts} />
        <div className="crm-body">
          <header className="crm-header-bar">
            <div className="crm-header-bar-start">
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
