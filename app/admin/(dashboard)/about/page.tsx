import { asc } from "drizzle-orm";
import { db } from "@/db";
import { aboutContent, timelineEntries } from "@/db/schema";
import {
  updateAboutContent,
  createTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
} from "@/lib/actions/about";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminAboutPage() {
  const [aboutRows, timeline] = await Promise.all([
    db.select().from(aboutContent).limit(1),
    db.select().from(timelineEntries).orderBy(asc(timelineEntries.sortOrder)),
  ]);
  const about = aboutRows[0];

  return (
    <div>
      <div className="adm-title">About</div>

      <p className="adm-sub">Who I Am &amp; Tools</p>
      <form action={updateAboutContent} className="adm-form">
        <div className="adm-field">
          <label htmlFor="whoIAmParagraphs">Who I Am (paragraphs)</label>
          <textarea
            id="whoIAmParagraphs"
            name="whoIAmParagraphs"
            defaultValue={about?.whoIAmParagraphs.join("\n")}
            style={{ minHeight: 160 }}
          />
          <div className="adm-hint">One paragraph per line.</div>
        </div>
        <div className="adm-field">
          <label htmlFor="tools">Tools</label>
          <input id="tools" name="tools" defaultValue={about?.tools.join(", ")} />
          <div className="adm-hint">Comma separated, e.g. Unreal Engine 5, Blender, ZBrush</div>
        </div>
        <button type="submit" className="adm-btn">Save</button>
      </form>

      <p className="adm-sub" style={{ marginTop: 48 }}>Timeline</p>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Text</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((t) => {
            const updateWithId = updateTimelineEntry.bind(null, t.id);
            return (
              <tr key={t.id}>
                <td colSpan={4}>
                  <form action={updateWithId} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <input name="year" defaultValue={t.year} style={{ width: 70 }} />
                    <input name="text" defaultValue={t.text} style={{ flex: 1 }} />
                    <input name="sortOrder" type="number" defaultValue={t.sortOrder} style={{ width: 70 }} />
                    <button type="submit" className="adm-btn" style={{ padding: "10px 16px" }}>Save</button>
                  </form>
                  <form action={deleteTimelineEntry} className="adm-actions" style={{ marginTop: 6 }}>
                    <input type="hidden" name="id" value={t.id} />
                    <DeleteButton confirmText="Delete this timeline entry?" />
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Timeline Entry</p>
      <form action={createTimelineEntry} className="adm-form">
        <div className="adm-field">
          <label htmlFor="year">Year</label>
          <input id="year" name="year" defaultValue="" required placeholder="2026 or →" />
        </div>
        <div className="adm-field">
          <label htmlFor="text">Text</label>
          <textarea id="text" name="text" required />
        </div>
        <div className="adm-field">
          <label htmlFor="sortOrder">Sort Order</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={timeline.length} />
        </div>
        <button type="submit" className="adm-btn">Add Entry</button>
      </form>
    </div>
  );
}
