import { auditViewerView } from "@/lib/crm/audit";
import { isSuperAdmin, requireArea } from "@/lib/crm/auth";
import { listUsers } from "@/lib/crm/users";
import UsersView from "@/components/crm/UsersView";

/* Team & Users: the Super Admin and Admins manage accounts (only the Super Admin sees passwords); Viewers look */
export default async function UsersPage() {
  const me = await requireArea("users");
  await auditViewerView(me, "team accounts");
  const superAdmin = isSuperAdmin(me);
  const users = await listUsers({ withPasswords: superAdmin });
  return <UsersView users={users} meId={me.id} meRole={me.role} />;
}
