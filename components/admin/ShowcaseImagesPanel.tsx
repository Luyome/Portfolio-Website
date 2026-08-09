import ImageUploadField from "./ImageUploadField";
import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";
import HeroLinkPicker from "./HeroLinkPicker";

export type ShowcaseRow = {
  id: number;
  url: string;
  title: string;
  linkHref: string;
  sortOrder: number;
};

const MAX_ITEMS = 12;

export default function ShowcaseImagesPanel({
  items,
  createAction,
  updateAction,
  deleteAction,
}: {
  items: ShowcaseRow[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const atMax = items.length >= MAX_ITEMS;

  return (
    <div>
      <p className="adm-sub" style={{ marginTop: 48 }}>Showcase Images</p>
      <p className="adm-sub" style={{ marginTop: 0 }}>
        Horizontal auto-advancing strip on the homepage (max {MAX_ITEMS} images, advances every 5 seconds). Each
        image links to the page you pick below.
      </p>
      {items.length > 0 && (
        <div className="adm-table-wrap" style={{ marginTop: 16 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-col-sm">Preview</th>
                <th>Title</th>
                <th>Links To</th>
                <th className="adm-col-xs">Order</th>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const updateWithId = updateAction.bind(null, item.id);
                const formId = `showcase-form-${item.id}`;
                return (
                  <tr key={item.id}>
                    <td>
                      <img src={item.url} alt="" className="adm-img-preview" style={{ maxHeight: 60 }} />
                    </td>
                    <td>
                      <input name="title" defaultValue={item.title} placeholder="Title shown on hover" form={formId} />
                    </td>
                    <td>
                      <form id={formId} action={updateWithId}>
                        <HeroLinkPicker labelName="linkPickerLabel" hrefName="linkHref" defaultHref={item.linkHref} />
                      </form>
                    </td>
                    <td>
                      <OrderPicker name="sortOrder" defaultValue={item.sortOrder} formId={formId} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <DeleteButton confirmText="Delete this showcase image?" />
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

      {!atMax ? (
        <>
          <p className="adm-sub" style={{ marginTop: 32 }}>Add Showcase Image</p>
          <form action={createAction} className="adm-form">
            <ImageUploadField name="url" label="Image" />
            <div className="adm-field">
              <label>Title</label>
              <input name="title" placeholder="Shown on hover" />
            </div>
            <div className="adm-field">
              <label>Links To</label>
              <HeroLinkPicker labelName="linkPickerLabel" hrefName="linkHref" />
            </div>
            <div className="adm-field">
              <label>Order</label>
              <OrderPicker name="sortOrder" defaultValue={Math.min(items.length + 1, 10)} />
            </div>
            <SaveButton>Add Image</SaveButton>
          </form>
        </>
      ) : (
        <p className="adm-hint" style={{ marginTop: 32 }}>
          Maximum of {MAX_ITEMS} images reached — delete one to add another.
        </p>
      )}
    </div>
  );
}
