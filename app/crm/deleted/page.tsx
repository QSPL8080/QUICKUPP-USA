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
        sub="Items moved to the bin are kept here. Restore returns an item to its original location, while Delete Permanently removes it after typing DELETE. Records with payments or client conversions are preserved for accounting records."
      />
      <div className="crm-card crm-card-flush">
        <TrashView items={items} />
      </div>
    </>
  );
}
