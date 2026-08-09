import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import AddLinkForm from "./AddLinkForm";
import SaveButton from "./SaveButton";
import AdminSection from "./AdminSection";
import type { LinkLabelOptionLite } from "@/lib/link-label-options";

export type ExtraLink = { id: number; label: string; href: string; kind: string; sortOrder: number };

export default function ExtraLinksPanel({
  links,
  createAction,
  updateAction,
  deleteAction,
  labelOptions,
}: {
  links: ExtraLink[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  labelOptions: LinkLabelOptionLite[];
}) {
  return (
    <AdminSection
      title="Links"
      description="Shown in the item's detail panel. Either an external link (Steam, itch.io, ArtStation…) or a direct download — visitors download files without leaving the site."
    >
      {links.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>URL</th>
                <th>Type</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => {
                const updateWithId = updateAction.bind(null, l.id);
                const formId = `link-form-${l.id}`;
                // A link saved before this label existed in the controlled
                // list (or entered under an older free-text value) must
                // remain selected/editable without being silently dropped —
                // it's injected as its own option, once, alongside the
                // controlled list.
                const knownLabel = labelOptions.some((o) => o.label === l.label);
                return (
                  <tr key={l.id}>
                    <td>
                      <form id={formId} action={updateWithId}>
                        <select name="label" defaultValue={l.label} required>
                          {!knownLabel && <option value={l.label}>{l.label} (legacy)</option>}
                          {labelOptions.map((o) => (
                            <option key={o.id} value={o.label}>{o.label}</option>
                          ))}
                        </select>
                      </form>
                    </td>
                    <td>
                      <input name="href" form={formId} defaultValue={l.href} placeholder="https://..." required />
                    </td>
                    <td>
                      <input type="hidden" name="kind" form={formId} value={l.kind} readOnly />
                      {l.kind === "download" ? "Download" : "Link"}
                    </td>
                    <td>
                      <OrderPicker name="sortOrder" defaultValue={l.sortOrder} formId={formId} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={l.id} />
                          <DeleteButton confirmText={`Delete "${l.label}" link?`} />
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

      <h3 className="adm-subhead">Add Link</h3>
      <AddLinkForm action={createAction} defaultSortOrder={links.length} labelOptions={labelOptions} />
    </AdminSection>
  );
}
