import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { metadataOptions } from "@/db/schema";
import {
  createArtMetadataOption,
  updateArtMetadataOption,
  toggleArtMetadataOptionActiveOn2d,
  toggleArtMetadataOptionActiveOn3d,
  updateArtMetadataOptionSortOrder,
  deleteArtMetadataOption,
} from "@/lib/actions/art-metadata";
import { getArtMetadataUsageCount } from "@/lib/art-metadata";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import ArtMetadataForm from "@/components/admin/ArtMetadataForm";
import NumberPicker from "@/components/admin/NumberPicker";
import SaveButton from "@/components/admin/SaveButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminArtMetadataPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;

  const items = await db
    .select()
    .from(metadataOptions)
    .where(eq(metadataOptions.type, "art_category"))
    .orderBy(asc(metadataOptions.sortOrder), asc(metadataOptions.name), asc(metadataOptions.id));

  const usageCounts = await Promise.all(items.map((item) => getArtMetadataUsageCount(item.id)));

  let editItem: (typeof items)[number] | undefined;
  const editId = sp.edit ? Number(sp.edit) : NaN;
  if (Number.isInteger(editId)) {
    editItem = items.find((item) => item.id === editId);
  }

  const updateAction = editItem ? updateArtMetadataOption.bind(null, editItem.id) : createArtMetadataOption;

  return (
    <div>
      <AdminPageHeader
        title="2D & 3D Categories"
        description="Manage the shared Character / Environment / Sketches / Prop-Item categories used by both the 2D and 3D pages."
      />

      {items.length === 0 ? (
        <AdminEmptyState label="No categories yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="adm-col-md">Slug</th>
                <th className="adm-col-sm">Status (2D)</th>
                <th className="adm-col-sm">Status (3D)</th>
                <th className="adm-col-xs">Order</th>
                <th className="adm-col-xs">Usage</th>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const sortFormId = `art-metadata-sort-${item.id}`;
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.slug}</td>
                    <td>
                      <form action={toggleArtMetadataOptionActiveOn2d}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={`adm-toggle-btn ${item.activeOn2d ? "on" : ""}`} aria-pressed={item.activeOn2d}>
                          <span className="adm-toggle-dot" />
                          {item.activeOn2d ? "Active" : "Inactive"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form action={toggleArtMetadataOptionActiveOn3d}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={`adm-toggle-btn ${item.activeOn3d ? "on" : ""}`} aria-pressed={item.activeOn3d}>
                          <span className="adm-toggle-dot" />
                          {item.activeOn3d ? "Active" : "Inactive"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form id={sortFormId} action={updateArtMetadataOptionSortOrder}>
                        <input type="hidden" name="id" value={item.id} />
                        <NumberPicker name="sortOrder" defaultValue={item.sortOrder} formId={sortFormId} />
                      </form>
                    </td>
                    <td>{usageCounts[i]}</td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={sortFormId} style={{ padding: "8px 14px" }} />
                        <Link href={`/admin/art/metadata?edit=${item.id}`}>Edit</Link>
                        <form action={deleteArtMetadataOption}>
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
        {editItem ? "Edit Category" : "Add Category"}
      </p>
      <ArtMetadataForm
        key={editItem?.id ?? "new"}
        type="art_category"
        item={editItem}
        action={updateAction}
        cancelHref={editItem ? "/admin/art/metadata" : undefined}
      />
    </div>
  );
}
