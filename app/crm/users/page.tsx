import { redirect } from "next/navigation";
import { isSuperAdmin, requireUser } from "@/lib/crm/auth";
import { listUsers } from "@/lib/crm/users";
import UsersView from "@/components/crm/UsersView";
import { PageHead } from "@/components/crm/ListTools";

export default async function UsersPage() {
  const me = await requireUser();
  if (!isSuperAdmin(me)) redirect("/crm/profile");
  const users = await listUsers();
  return (
    <>
      <PageHead
        title="Team & Users"
        sub="Add admins, change their name, username, email or password, and activate, deactivate or delete accounts. The super admin account is locked."
      />
      <div className="crm-card crm-card-flush">
        <UsersView users={users} meId={me.id} />
      </div>
    </>
  );
}
