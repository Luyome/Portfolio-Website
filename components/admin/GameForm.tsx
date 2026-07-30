import ImageUploadField from "./ImageUploadField";
import type { games } from "@/db/schema";

type GameRow = typeof games.$inferSelect;

export default function GameForm({
  action,
  item,
}: {
  action: (formData: FormData) => void;
  item?: GameRow;
}) {
  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={item?.title} required />
      </div>
      <div className="adm-field">
        <label htmlFor="status">Status</label>
        <input id="status" name="status" defaultValue={item?.status} required placeholder="In Development — Solo" />
      </div>
      <div className="adm-field">
        <label htmlFor="engine">Engine</label>
        <input id="engine" name="engine" defaultValue={item?.engine} required placeholder="Unreal Engine 5" />
      </div>
      <div className="adm-field">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" name="desc" defaultValue={item?.desc} required />
      </div>
      <div className="adm-field">
        <label htmlFor="tags">Tags</label>
        <input id="tags" name="tags" defaultValue={item?.tags.join(", ")} />
        <div className="adm-hint">Comma separated, e.g. Horror, First-Person, Solo Dev</div>
      </div>
      <div className="adm-field">
        <label htmlFor="feats">Features</label>
        <textarea id="feats" name="feats" defaultValue={item?.feats.join("\n")} />
        <div className="adm-hint">One feature per line</div>
      </div>
      <div className="adm-field">
        <label htmlFor="target">Target</label>
        <input id="target" name="target" defaultValue={item?.target} required placeholder="Steam — June 2026" />
      </div>
      <ImageUploadField name="img" initialUrl={item?.img} />
      <div className="adm-field">
        <label htmlFor="sortOrder">Sort Order</label>
        <input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
      </div>
      <button type="submit" className="adm-btn">Save</button>
    </form>
  );
}
