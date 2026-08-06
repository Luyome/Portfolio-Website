import ImageUploadField from "./ImageUploadField";
import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";

export type HeroSlideRow = {
  id: number;
  url: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  sortOrder: number;
};

export default function HeroSlidesPanel({
  slides,
  createAction,
  updateAction,
  deleteAction,
}: {
  slides: HeroSlideRow[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div>
      <p className="adm-sub" style={{ marginTop: 48 }}>Hero Slides</p>
      <p className="adm-sub" style={{ marginTop: 0 }}>
        Add multiple images to auto-rotate the homepage hero every 4 seconds. Title, subtitle, and link are optional
        per slide.
      </p>
      {slides.length > 0 && (
        <div className="adm-table-wrap" style={{ marginTop: 16 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Subtitle</th>
                <th>Link</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide) => {
                const updateWithId = updateAction.bind(null, slide.id);
                const formId = `hero-slide-form-${slide.id}`;
                return (
                  <tr key={slide.id}>
                    <td>
                      <img src={slide.url} alt="" className="adm-img-preview" style={{ maxHeight: 60 }} />
                    </td>
                    <td>
                      <form id={formId} action={updateWithId}>
                        <input name="title" defaultValue={slide.title ?? ""} placeholder="Optional title" />
                      </form>
                    </td>
                    <td>
                      <input name="subtitle" defaultValue={slide.subtitle ?? ""} placeholder="Optional subtitle" form={formId} />
                    </td>
                    <td>
                      <input name="linkUrl" defaultValue={slide.linkUrl ?? ""} placeholder="/portfolio" form={formId} />
                    </td>
                    <td>
                      <OrderPicker name="sortOrder" defaultValue={slide.sortOrder} formId={formId} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={slide.id} />
                          <DeleteButton confirmText="Delete this hero slide?" />
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

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Hero Slide</p>
      <form action={createAction} className="adm-form">
        <ImageUploadField name="url" label="Image" />
        <div className="adm-field">
          <label>Title (optional)</label>
          <input name="title" placeholder="Optional title shown on the slide" />
        </div>
        <div className="adm-field">
          <label>Subtitle (optional)</label>
          <input name="subtitle" placeholder="Optional subtitle" />
        </div>
        <div className="adm-field">
          <label>Link (optional)</label>
          <input name="linkUrl" placeholder="/portfolio" />
        </div>
        <div className="adm-field">
          <label>Order</label>
          <OrderPicker name="sortOrder" defaultValue={Math.min(slides.length + 1, 10)} />
        </div>
        <SaveButton>Add Slide</SaveButton>
      </form>
    </div>
  );
}
