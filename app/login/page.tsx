import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/crm/auth";
import LoginForm from "@/components/crm/LoginForm";
import "@/app/crm/crm.css";

export const metadata: Metadata = {
  title: "Sign in | Quickupp Softech CRM",
  robots: { index: false, follow: false },
};

const NOTICE: Record<string, string> = {
  idle: "You were signed out because the CRM wasn't used for a while. Please sign in again.",
  expired: "Your session has ended. Please sign in again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  if (await getCurrentUser()) redirect("/crm");
  const notice = NOTICE[(await searchParams).reason ?? ""];
  return (
    <div className="crm-root crm-login">
      <div className="crm-login-photo" aria-hidden="true">
        <img src="/images/contact-tech-discussion.jpg" alt="" />
      </div>
      <div className="crm-login-body">
        <div className="crm-login-inner">
          <img src="/images/logo-black.png" alt="Quickupp Softech" className="crm-login-logo" />
          <h1 className="crm-title">Sign in</h1>
          <p className="crm-sub">Use your Quickupp Softech team account.</p>
          {notice && (
            <p className="crm-notice" role="status">
              {notice}
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
