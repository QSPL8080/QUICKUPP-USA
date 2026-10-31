import { SUPER_ADMIN_EMAIL, isSuperAdmin, requireUser } from "@/lib/crm/auth";
import ProfileForm from "@/components/crm/ProfileForm";
import { PageHead } from "@/components/crm/ListTools";

export default async function ProfilePage() {
  const me = await requireUser();
  return (
    <>
      <PageHead title="My Profile" sub={isSuperAdmin(me) ? "Super Admin" : "Admin"} />
      <ProfileForm name={me.name} username={me.username} email={me.email} isSuperAdmin={isSuperAdmin(me)} superAdminEmail={SUPER_ADMIN_EMAIL} />
    </>
  );
}
