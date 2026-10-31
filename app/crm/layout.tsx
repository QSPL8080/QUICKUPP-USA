import type { Metadata } from "next";
import { requireUser } from "@/lib/crm/auth";
import { dashboardStats } from "@/lib/crm/data";
import { newApplicationCount } from "@/lib/crm/applications";
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
  const [{ perSource }, applications] = await Promise.all([dashboardStats(), newApplicationCount()]);
  const newCounts = { ...Object.fromEntries(perSource.map((s) => [s.key, s.fresh])), applications };
  return (
    <div className="crm-root">
      <CrmSidebar user={user} newCounts={newCounts} />
      <main className="crm-main">{children}</main>
      <IdleLogout idleMinutes={IDLE_MINUTES} />
    </div>
  );
}
