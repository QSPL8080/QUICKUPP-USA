import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/crm/auth";
import LoginForm from "@/components/crm/LoginForm";
import "@/app/crm/crm.css";

export const metadata: Metadata = {
  title: "Sign in | Quickupp Softech CRM",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/crm");
  return (
    <div className="crm-root crm-login">
      <div className="crm-login-card">
        <div className="crm-login-brand">
          <img src="/images/logo-white.png" alt="Quickupp Softech" />
        </div>
        <div className="crm-login-body">
          <h1 className="crm-title">Sign in to the CRM</h1>
          <p className="crm-sub">Use your Quickupp Softech team account.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
