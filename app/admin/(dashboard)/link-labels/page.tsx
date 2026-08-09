import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { linkLabelOptions } from "@/db/schema";
import {
  createLinkLabelOption,
  updateLinkLabelOption,
  toggleLinkLabelOptionActive,
  updateLinkLabelOptionSortOrder,
  deleteLinkLabelOption,
} from "@/lib/actions/link-labels";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import DeleteButton from "@/components/admin/DeleteButton";
import LinkLabelOptionForm from "@/components/admin/LinkLabelOptionForm";
import NumberPicker from "@/components/admin/NumberPicker";
import SaveButton from "@/components/admin/SaveButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminLinkLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;

  const items = await db
    .select()
    .from(linkLabelOptions)
    .orderBy(asc(linkLabelOptions.sortOrder), asc(linkLabelOptions.label), asc(linkLabelOptions.id));

  let editItem: (typeof items)[number] | undefined;
  const editId = sp.edit ? Number(sp.edit) : NaN;
  if (Number.isInteger(editId)) {
    editItem = items.find((item) => item.id === editId);
  }

  const updateAction = editItem ? updateLinkLabelOption.bind(null, editItem.id) : createLinkLabelOption;

  return (
    <div>
      <AdminPageHeader
        title="Link Labels"
        description="Controlled Label options for the Links picker used across Portfolio, Sketches, 3D, Games, and Worldbuilding. Existing links keep their saved label even if it isn't in this list."
      />

      {items.length === 0 ? (
        <AdminEmptyState label="No link label options yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Label</th>
                <th className="adm-col-md">Slug</th>
                <th className="adm-col-sm">Status</th>
                <th className="adm-col-xs">Order</th>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const sortFormId = `link-label-sort-${item.id}`;
                return (
                  <tr key={item.id}>
                    <td>{item.label}</td>
                    <td>{item.slug}</td>
                    <td>
                      <form action={toggleLinkLabelOptionActive}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={`adm-toggle-btn ${item.isActive ? "on" : ""}`} aria-pressed={item.isActive}>
                          <span className="adm-toggle-dot" />
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form id={sortFormId} action={updateLinkLabelOptionSortOrder}>
                        <input type="hidden" name="id" value={item.id} />
                        <NumberPicker name="sortOrder" defaultValue={item.sortOrder} formId={sortFormId} />
                      </form>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={sortFormId} style={{ padding: "8px 14px" }} />
                        <Link href={`/admin/link-labels?edit=${item.id}`}>Edit</Link>
                        <form action={deleteLinkLabelOption}>
                          <input type="hidden" name="id" value={item.id} />
                          <DeleteButton confirmText={`Delete "${item.label}"? Existing links keep this label as saved text.`} />
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

      <p className="adm-sub" style={{ marginTop: 32 }}>{editItem ? "Edit Label" : "Add Label"}</p>
      <LinkLabelOptionForm
        key={editItem?.id ?? "new"}
        item={editItem}
        action={updateAction}
        cancelHref={editItem ? "/admin/link-labels" : undefined}
      />
    </div>
  );
}
