import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import AddLinkForm from "./AddLinkForm";
import SaveButton from "./SaveButton";

export type ExtraLink = { id: number; label: string; href: string; kind: string; sortOrder: number };

export default function ExtraLinksPanel({
  links,
  createAction,
  updateAction,
  deleteAction,
}: {
  links: ExtraLink[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div>
      <p className="adm-sub" style={{ marginTop: 48 }}>Links</p>
      <p className="adm-sub" style={{ marginTop: 0 }}>
        Shown in the item&apos;s detail panel. Either an external link (Steam, itch.io, ArtStation…) or a direct download — visitors download files without leaving the site.
      </p>
      {links.length > 0 && (
        <table className="adm-table" style={{ marginTop: 16 }}>
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
              return (
                <tr key={l.id}>
                  <td>
                    <form id={formId} action={updateWithId}>
                      <input name="label" defaultValue={l.label} placeholder="Steam" required />
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
      )}

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Link</p>
      <AddLinkForm action={createAction} defaultSortOrder={links.length} />
    </div>
  );
}
