import type { Metadata } from "next";
import { requireUser } from "@/lib/crm/auth";
import { dashboardStats } from "@/lib/crm/data";
import { newApplicationCount } from "@/lib/crm/applications";
import { getNotifications } from "@/lib/crm/notifications";
import NotifyCenter from "@/components/crm/NotifyCenter";
import TableFit from "@/components/crm/TableFit";
import { FeedbackProvider } from "@/components/crm/Feedback";
import CrmSidebar from "@/components/crm/Sidebar";
import IdleLogout from "@/components/crm/IdleLogout";
import { IDLE_MINUTES } from "@/lib/crm/auth";
import "./crm.css";

export const metadata: Metadata = {
  title: "CRM | Quickupp Softech",
  robots: { index: false, follow: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [{ perSource }, applications, notifications] = await Promise.all([dashboardStats(), newApplicationCount(), getNotifications(user.id)]);
  const newCounts = { leads: perSource.reduce((a, s) => a + s.fresh, 0), applications };
  return (
    <div className="crm-root">
      <FeedbackProvider>
        <CrmSidebar user={user} newCounts={newCounts} />
        <main className="crm-main">{children}</main>
        <NotifyCenter data={notifications} />
        <TableFit />
        <IdleLogout idleMinutes={IDLE_MINUTES} />
      </FeedbackProvider>
    </div>
  );
}
