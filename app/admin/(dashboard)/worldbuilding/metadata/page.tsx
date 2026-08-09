import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { metadataOptions } from "@/db/schema";
import {
  createWorldbuildingMetadataOption,
  updateWorldbuildingMetadataOption,
  toggleWorldbuildingMetadataOptionActive,
  updateWorldbuildingMetadataOptionSortOrder,
  deleteWorldbuildingMetadataOption,
} from "@/lib/actions/worldbuilding-metadata";
import { getWbMetadataUsageCount } from "@/lib/worldbuilding-metadata";
import { WB_METADATA_TYPES, WB_METADATA_TYPE_LABELS, isWbMetadataType, type WbMetadataType } from "@/lib/worldbuilding-metadata";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import WorldbuildingMetadataForm from "@/components/admin/WorldbuildingMetadataForm";
import NumberPicker from "@/components/admin/NumberPicker";
import SaveButton from "@/components/admin/SaveButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminWorldbuildingMetadataPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const activeType: WbMetadataType = sp.type && isWbMetadataType(sp.type) ? sp.type : "wb_entity_type";

  const items = await db
    .select()
    .from(metadataOptions)
    .where(eq(metadataOptions.type, activeType))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const usageCounts = await Promise.all(items.map((item) => getWbMetadataUsageCount(item.id)));

  let editItem: (typeof items)[number] | undefined;
  const editId = sp.edit ? Number(sp.edit) : NaN;
  if (Number.isInteger(editId)) {
    editItem = items.find((item) => item.id === editId);
  }

  const updateAction = editItem ? updateWorldbuildingMetadataOption.bind(null, editItem.id) : createWorldbuildingMetadataOption;

  return (
    <div>
      <AdminPageHeader
        title="Worldbuilding Metadata"
        description="Manage the controlled Entity Type, Category, and Chip options used on Worldbuilding entries — replaces free-text entry with a managed, reusable list."
      />

      <div className="adm-chart-filters" style={{ flexWrap: "wrap" }}>
        {WB_METADATA_TYPES.map((t) => (
          <Link key={t} href={`/admin/worldbuilding/metadata?type=${t}`} className={`adm-chart-chip ${t === activeType ? "on" : ""}`}>
            {WB_METADATA_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <AdminEmptyState label={`No ${WB_METADATA_TYPE_LABELS[activeType]} options yet.`} />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="adm-col-md">Slug</th>
                <th className="adm-col-sm">Status</th>
                <th className="adm-col-xs">Order</th>
                <th className="adm-col-xs">Usage</th>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const sortFormId = `wb-metadata-sort-${item.id}`;
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.slug}</td>
                    <td>
                      <form action={toggleWorldbuildingMetadataOptionActive}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={`adm-toggle-btn ${item.isActive ? "on" : ""}`} aria-pressed={item.isActive}>
                          <span className="adm-toggle-dot" />
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form id={sortFormId} action={updateWorldbuildingMetadataOptionSortOrder}>
                        <input type="hidden" name="id" value={item.id} />
                        <NumberPicker name="sortOrder" defaultValue={item.sortOrder} formId={sortFormId} />
                      </form>
                    </td>
                    <td>{usageCounts[i]}</td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={sortFormId} style={{ padding: "8px 14px" }} />
                        <Link href={`/admin/worldbuilding/metadata?type=${activeType}&edit=${item.id}`}>Edit</Link>
                        <form action={deleteWorldbuildingMetadataOption}>
                          <input type="hidden" name="id" value={item.id} />
                          <DeleteButton
                            confirmText={
                              usageCounts[i] > 0
                                ? `"${item.name}" is in use and can't be deleted.`
                                : `Delete "${item.name}"?`
                            }
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="adm-sub" style={{ marginTop: 32 }}>
        {editItem ? `Edit ${WB_METADATA_TYPE_LABELS[activeType]}` : `Add ${WB_METADATA_TYPE_LABELS[activeType]}`}
      </p>
      <WorldbuildingMetadataForm
        key={editItem?.id ?? `new-${activeType}`}
        type={activeType}
        item={editItem}
        action={updateAction}
        cancelHref={editItem ? `/admin/worldbuilding/metadata?type=${activeType}` : undefined}
      />
    </div>
  );
}
