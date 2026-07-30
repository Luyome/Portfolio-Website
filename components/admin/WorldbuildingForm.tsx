import ImageUploadField from "./ImageUploadField";
import type { worldbuildingEntries } from "@/db/schema";

type WorldbuildingRow = typeof worldbuildingEntries.$inferSelect;

export default function WorldbuildingForm({
  action,
  item,
}: {
  action: (formData: FormData) => void;
  item?: WorldbuildingRow;
}) {
  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={item?.title} required />
      </div>
      <div className="adm-field">
        <label htmlFor="cat">Category</label>
        <input id="cat" name="cat" defaultValue={item?.cat} required placeholder="Characters, Cities, Lore, Events" />
      </div>
      <div className="adm-field">
        <label htmlFor="year">Year</label>
        <input id="year" name="year" type="number" defaultValue={item?.year} required />
      </div>
      <div className="adm-field">
        <label htmlFor="date">Display Date</label>
        <input id="date" name="date" defaultValue={item?.date} required placeholder="Jan 15, 2025" />
      </div>
      <div className="adm-field">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" name="excerpt" defaultValue={item?.excerpt} required />
      </div>
      <div className="adm-field">
        <label htmlFor="chips">Chips</label>
        <input id="chips" name="chips" defaultValue={item?.chips.join(", ")} />
        <div className="adm-hint">Comma separated, e.g. Aethermoor, Lore, Cities</div>
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
