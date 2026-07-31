import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import type { sketches } from "@/db/schema";

type SketchRow = typeof sketches.$inferSelect;

export default function SketchForm({
  action,
  item,
}: {
  action: (formData: FormData) => void;
  item?: SketchRow;
}) {
  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label htmlFor="label">Label</label>
        <input id="label" name="label" defaultValue={item?.label} required placeholder="2026.02 — figure study" />
      </div>
      <div className="adm-field">
        <label htmlFor="year">Year</label>
        <YearPicker id="year" name="year" defaultValue={item?.year} required />
      </div>
      <div className="adm-field">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" name="desc" defaultValue={item?.desc} />
      </div>
      <ImageUploadField name="img" initialUrl={item?.img ?? undefined} />
      <div className="adm-field">
        <label htmlFor="colorHex">Placeholder Color (used when no image)</label>
        <input id="colorHex" name="colorHex" type="text" defaultValue={item?.colorHex ?? "#151010"} />
      </div>
      <div className="adm-field">
        <label htmlFor="sortOrder">Sort Order</label>
        <input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
      </div>
      <button type="submit" className="adm-btn">Save</button>
    </form>
  );
}
