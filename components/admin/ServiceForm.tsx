import type { services } from "@/db/schema";

type ServiceRow = typeof services.$inferSelect;

export default function ServiceForm({
  action,
  item,
}: {
  action: (formData: FormData) => void;
  item?: ServiceRow;
}) {
  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label htmlFor="icon">Icon</label>
        <input id="icon" name="icon" defaultValue={item?.icon} required placeholder="◆" />
        <div className="adm-hint">A single character/symbol, e.g. ◆ ◈ ◬ ▶ △ ■</div>
      </div>
      <div className="adm-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={item?.title} required />
      </div>
      <div className="adm-field">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" name="desc" defaultValue={item?.desc} required />
      </div>
      <div className="adm-field">
        <label htmlFor="sortOrder">Sort Order</label>
        <input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
      </div>
      <button type="submit" className="adm-btn">Save</button>
    </form>
  );
}
