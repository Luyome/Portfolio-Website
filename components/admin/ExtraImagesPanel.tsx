import ImageUploadField from "./ImageUploadField";
import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";
import AdminSection from "./AdminSection";

export default function ExtraImagesPanel({
  images,
  createAction,
  updateAction,
  deleteAction,
}: {
  images: { id: number; url: string; caption?: string | null; sortOrder: number }[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <AdminSection
      title="Gallery Images"
      description="Extra images shown stacked (with fullscreen zoom) below the main image, in addition to it. Order controls where each one lands relative to Content and Videos (lower number = earlier). Caption is an optional short line shown under the image in the lightbox."
    >
      {images.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-col-sm">Preview</th>
                <th>Caption</th>
                <th className="adm-col-xs">Order</th>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => {
                const updateWithId = updateAction.bind(null, img.id);
                const formId = `image-form-${img.id}`;
                return (
                  <tr key={img.id}>
                    <td><img src={img.url} alt="" className="adm-img-preview" style={{ maxHeight: 60 }} /></td>
                    <td>
                      <form id={formId} action={updateWithId}>
                        <input type="text" name="caption" defaultValue={img.caption ?? ""} placeholder="Optional short caption" />
                      </form>
                    </td>
                    <td>
                      <OrderPicker name="sortOrder" defaultValue={img.sortOrder} formId={formId} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={img.id} />
                          <DeleteButton confirmText="Delete this image?" />
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

      <h3 className="adm-subhead">Add Image</h3>
      <form action={createAction} className="adm-form">
        <ImageUploadField name="url" label="Image" />
        <div className="adm-field">
          <label>Caption (optional)</label>
          <input type="text" name="caption" placeholder="Short line shown under the image" />
        </div>
        <div className="adm-field">
          <label>Order</label>
          <OrderPicker name="sortOrder" defaultValue={Math.min(images.length + 1, 10)} />
        </div>
        <SaveButton>Add Image</SaveButton>
      </form>
    </AdminSection>
  );
}
