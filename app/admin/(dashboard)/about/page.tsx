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
import TimelineYearPicker from "@/components/admin/TimelineYearPicker";
import NumberPicker from "@/components/admin/NumberPicker";
import AboutForm from "@/components/admin/AboutForm";
import SaveButton from "@/components/admin/SaveButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function AdminAboutPage() {
  const [aboutRows, timeline, appearance] = await Promise.all([
    db.select().from(aboutContent).limit(1),
    db.select().from(timelineEntries).orderBy(asc(timelineEntries.sortOrder)),
    getPageAppearance("about"),
  ]);
  const about = aboutRows[0];

  return (
    <div>
      <AdminPageHeader title="About" description="Who I Am &amp; Tools" />
      <AboutForm
        action={updateAboutContent}
        whoIAmParagraphs={about?.whoIAmParagraphs.join("\n") ?? ""}
        tools={about?.tools.join(", ") ?? ""}
        timeline={timeline}
        styles={about?.styles}
        pageVars={pageAppearanceVars(appearance)}
      />

      <p className="adm-sub" style={{ marginTop: 48 }}>Timeline</p>
      <div className="adm-table-wrap">
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
              const formId = `timeline-form-${t.id}`;
              return (
                <tr key={t.id}>
                  <td>
                    <form id={formId} action={updateWithId}>
                      <TimelineYearPicker name="year" defaultValue={t.year} />
                    </form>
                  </td>
                  <td>
                    <input name="text" form={formId} defaultValue={t.text} />
                  </td>
                  <td>
                    <NumberPicker name="sortOrder" defaultValue={t.sortOrder} formId={formId} />
                  </td>
                  <td>
                    <div className="adm-actions">
                      <SaveButton formId={formId} style={{ padding: "8px 14px" }} />
                      <form action={deleteTimelineEntry}>
                        <input type="hidden" name="id" value={t.id} />
                        <DeleteButton confirmText="Delete this timeline entry?" />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Timeline Entry</p>
      <form action={createTimelineEntry} className="adm-form">
        <div className="adm-field">
          <label>Year</label>
          <TimelineYearPicker name="year" />
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
