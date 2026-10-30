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
      <div className="crm-login-photo" aria-hidden="true">
        <img src="/images/contact-tech-discussion.jpg" alt="" />
      </div>
      <div className="crm-login-body">
        <div className="crm-login-inner">
          <img src="/images/logo-black.png" alt="Quickupp Softech" className="crm-login-logo" />
          <h1 className="crm-title">Sign in</h1>
          <p className="crm-sub">Use your Quickupp Softech team account.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
