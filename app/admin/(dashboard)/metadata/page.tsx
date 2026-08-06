import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { metadataOptions } from "@/db/schema";
import {
  createMetadataOption,
  updateMetadataOption,
  toggleMetadataOptionActive,
  updateMetadataOptionSortOrder,
  deleteMetadataOption,
} from "@/lib/actions/metadata";
import { getMetadataUsageCount } from "@/lib/metadata-usage";
import { METADATA_TYPES, METADATA_TYPE_LABELS, isMetadataType, type MetadataType } from "@/lib/metadata";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import MetadataForm from "@/components/admin/MetadataForm";
import NumberPicker from "@/components/admin/NumberPicker";
import SaveButton from "@/components/admin/SaveButton";

export default async function AdminMetadataPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const activeType: MetadataType = sp.type && isMetadataType(sp.type) ? sp.type : "medium";

  const items = await db
    .select()
    .from(metadataOptions)
    .where(eq(metadataOptions.type, activeType))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const usageCounts = await Promise.all(items.map((item) => getMetadataUsageCount(item.id, activeType)));

  let editItem: (typeof items)[number] | undefined;
  const editId = sp.edit ? Number(sp.edit) : NaN;
  if (Number.isInteger(editId)) {
    editItem = items.find((item) => item.id === editId);
  }

  const updateAction = editItem ? updateMetadataOption.bind(null, editItem.id) : createMetadataOption;

  return (
    <div>
      <div className="adm-title">Metadata</div>
      <p className="adm-sub">
        Manage the controlled Medium, Subject Matter, Software, and Tag options used across content. Portfolio
        selectors and legacy migration are handled separately (Task 2.10).
      </p>

      <div className="adm-chart-filters" style={{ marginTop: 24, flexWrap: "wrap" }}>
        {METADATA_TYPES.map((t) => (
          <Link key={t} href={`/admin/metadata?type=${t}`} className={`adm-chart-chip ${t === activeType ? "on" : ""}`}>
            {METADATA_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <AdminEmptyState label={`No ${METADATA_TYPE_LABELS[activeType]} options yet.`} />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                {activeType === "software" && <th>Icon</th>}
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Order</th>
                <th>Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const sortFormId = `metadata-sort-${item.id}`;
                return (
                  <tr key={item.id}>
                    {activeType === "software" && (
                      <td>
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
                    <td>{item.name}</td>
                    <td>{item.slug}</td>
                    <td>
                      <form action={toggleMetadataOptionActive}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={`adm-toggle-btn ${item.isActive ? "on" : ""}`} aria-pressed={item.isActive}>
                          <span className="adm-toggle-dot" />
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form id={sortFormId} action={updateMetadataOptionSortOrder}>
                        <input type="hidden" name="id" value={item.id} />
                        <NumberPicker name="sortOrder" defaultValue={item.sortOrder} formId={sortFormId} />
                      </form>
                    </td>
                    <td>{usageCounts[i]}</td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={sortFormId} style={{ padding: "8px 14px" }} />
                        <Link href={`/admin/metadata?type=${activeType}&edit=${item.id}`}>Edit</Link>
                        <form action={deleteMetadataOption}>
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
        {editItem ? `Edit ${METADATA_TYPE_LABELS[activeType]}` : `Add ${METADATA_TYPE_LABELS[activeType]}`}
      </p>
      <MetadataForm
        key={editItem?.id ?? `new-${activeType}`}
        type={activeType}
        item={editItem}
        action={updateAction}
        cancelHref={editItem ? `/admin/metadata?type=${activeType}` : undefined}
      />
    </div>
  );
}
