import type { Metadata } from "next";
import { requireUser } from "@/lib/crm/auth";
import { dashboardStats } from "@/lib/crm/data";
import CrmSidebar from "@/components/crm/Sidebar";
import "./crm.css";

export const metadata: Metadata = {
  title: "CRM | Quickupp Softech",
  robots: { index: false, follow: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { perSource } = await dashboardStats();
  const newCounts = Object.fromEntries(perSource.map((s) => [s.key, s.fresh]));
  return (
    <div className="crm-root">
      <CrmSidebar user={user} newCounts={newCounts} />
      <main className="crm-main">{children}</main>
    </div>
  );
}
