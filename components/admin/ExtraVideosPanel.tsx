import OrderPicker from "./OrderPicker";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";

export default function ExtraVideosPanel({
  videos,
  createAction,
  updateAction,
  deleteAction,
}: {
  videos: { id: number; url: string; sortOrder: number }[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (id: number, formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div>
      <p className="adm-sub" style={{ marginTop: 48 }}>Videos</p>
      <p className="adm-sub" style={{ marginTop: 0 }}>
        YouTube or Vimeo links — shown as an embedded player. Order controls where each one lands relative to
        Content and Gallery Images (lower number = earlier).
      </p>
      {videos.length > 0 && (
        <div className="adm-table-wrap" style={{ marginTop: 16 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => {
                const updateWithId = updateAction.bind(null, v.id);
                const formId = `video-form-${v.id}`;
                return (
                  <tr key={v.id}>
                    <td>{v.url}</td>
                    <td>
                      <form id={formId} action={updateWithId}>
                        <OrderPicker name="sortOrder" defaultValue={v.sortOrder} />
                      </form>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={v.id} />
                          <DeleteButton confirmText="Delete this video?" />
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

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Video</p>
      <form action={createAction} className="adm-form">
        <div className="adm-field">
          <label htmlFor="video-url">YouTube / Vimeo URL</label>
          <input id="video-url" name="url" placeholder="https://www.youtube.com/watch?v=..." required />
        </div>
        <div className="adm-field">
          <label>Order</label>
          <OrderPicker name="sortOrder" defaultValue={Math.min(videos.length + 1, 10)} />
        </div>
        <SaveButton>Add Video</SaveButton>
      </form>
    </div>
  );
}
