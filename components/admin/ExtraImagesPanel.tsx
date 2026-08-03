import ImageUploadField from "./ImageUploadField";
import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";

export default function ExtraImagesPanel({
  images,
  createAction,
  updateAction,
  deleteAction,
}: {
  images: { id: number; url: string; sortOrder: number }[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div>
      <p className="adm-sub" style={{ marginTop: 48 }}>Gallery Images</p>
      <p className="adm-sub" style={{ marginTop: 0 }}>
        Extra images shown stacked (with fullscreen zoom) below the main image, in addition to it. Order controls
        where each one lands relative to Content and Videos (lower number = earlier).
      </p>
      {images.length > 0 && (
        <table className="adm-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Order</th>
              <th>Actions</th>
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
                      <OrderPicker name="sortOrder" defaultValue={img.sortOrder} />
                    </form>
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
      )}

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Image</p>
      <form action={createAction} className="adm-form">
        <ImageUploadField name="url" label="Image" />
        <div className="adm-field">
          <label>Order</label>
          <OrderPicker name="sortOrder" defaultValue={Math.min(images.length + 1, 10)} />
        </div>
        <SaveButton>Add Image</SaveButton>
      </form>
    </div>
  );
}
