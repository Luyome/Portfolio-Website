import { asc } from "drizzle-orm";
import { db } from "@/db";
import { archiveCategories } from "@/db/schema";
import { createArchiveCategory, updateArchiveCategory, deleteArchiveCategory } from "@/lib/actions/archive-categories";
import DeleteButton from "@/components/admin/DeleteButton";
import NumberPicker from "@/components/admin/NumberPicker";
import SaveButton from "@/components/admin/SaveButton";
import Field from "@/components/admin/Field";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminArchivePage() {
  const categories = await db.select().from(archiveCategories).orderBy(asc(archiveCategories.sortOrder), asc(archiveCategories.id));

  return (
    <div>
      <AdminPageHeader
        title="Archive"
        description="Manage the category filter chips shown on the public Archive page. Year and Project Type filters are derived automatically from your content and don't need management here."
      />

      <p className="adm-sub" style={{ marginTop: 0 }}>Category Chips</p>
      {categories.length === 0 ? (
        <AdminEmptyState label="No category chips yet." />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const updateWithId = updateArchiveCategory.bind(null, c.id);
                const formId = `archive-cat-form-${c.id}`;
                return (
                  <tr key={c.id}>
                    <td>
                      <form id={formId} action={updateWithId}>
                        <input name="label" defaultValue={c.label} required />
                      </form>
                    </td>
                    <td>
                      <NumberPicker name="sortOrder" defaultValue={c.sortOrder} formId={formId} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                        <form action={deleteArchiveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <DeleteButton confirmText={`Delete "${c.label}" category?`} />
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

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Category Chip</p>
      <form action={createArchiveCategory} className="adm-form">
        <Field id="label" label="Label" required>
          <input name="label" placeholder="Character Design" required />
        </Field>
        <div className="adm-field">
          <label>Sort Order</label>
          <NumberPicker name="sortOrder" defaultValue={categories.length} />
        </div>
        <SaveButton>Add Category</SaveButton>
      </form>
    </div>
  );
}
