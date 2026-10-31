import { redirect } from "next/navigation";
import { isSuperAdmin, requireUser } from "@/lib/crm/auth";
import { listUsers } from "@/lib/crm/users";
import UsersView from "@/components/crm/UsersView";

export default async function UsersPage() {
  const me = await requireUser();
  if (!isSuperAdmin(me)) redirect("/crm/profile");
  const users = await listUsers();
  return <UsersView users={users} meId={me.id} />;
}
