import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import type { portfolioItems } from "@/db/schema";

type PortfolioRow = typeof portfolioItems.$inferSelect;

export default function PortfolioForm({
  action,
  item,
}: {
  action: (formData: FormData) => void;
  item?: PortfolioRow;
}) {
  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={item?.title} required />
      </div>
      <div className="adm-field">
        <label htmlFor="cat">Category</label>
        <input id="cat" name="cat" defaultValue={item?.cat} required />
      </div>
      <div className="adm-field">
        <label htmlFor="year">Year</label>
        <YearPicker id="year" name="year" defaultValue={item?.year} />
      </div>
      <div className="adm-field">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" name="desc" defaultValue={item?.desc} required />
      </div>
      <div className="adm-field">
        <label htmlFor="tags">Tags</label>
        <input id="tags" name="tags" defaultValue={item?.tags.join(", ")} />
        <div className="adm-hint">Comma separated, e.g. ZBrush, Substance, Game Ready</div>
      </div>
      <div className="adm-field">
        <label htmlFor="medium">Medium</label>
        <input id="medium" name="medium" defaultValue={item?.medium} required />
      </div>
      <div className="adm-field">
        <label htmlFor="software">Software</label>
        <input id="software" name="software" defaultValue={item?.software} required />
      </div>
      <div className="adm-field">
        <label htmlFor="link">External Link</label>
        <input id="link" name="link" defaultValue={item?.link} placeholder="https://www.artstation.com/..." />
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
