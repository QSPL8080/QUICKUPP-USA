import { requireArea } from "@/lib/crm/auth";
import { listTrash } from "@/lib/crm/trash";
import TrashView from "@/components/crm/TrashView";
import { PageHead } from "@/components/crm/ListTools";

export const dynamic = "force-dynamic";

/* The Deleted bin: what Admins deleted, for the Super Admin to restore or remove for good */
export default async function DeletedPage() {
  await requireArea("trash");
  const items = await listTrash();
  return (
    <>
      <PageHead
        title="Deleted"
        sub="Everything deleted in the CRM waits here. Restore puts it back exactly as it was; Delete forever removes it for good after a second, typed confirmation. Payments that received money and leads that became clients are kept for your records."
      />
      <div className="crm-card crm-card-flush">
        <TrashView items={items} />
      </div>
    </>
  );
}
