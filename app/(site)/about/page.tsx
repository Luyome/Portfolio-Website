import { asc } from "drizzle-orm";
import { db } from "@/db";
import { aboutContent, timelineEntries } from "@/db/schema";
import { fieldStyle } from "@/lib/style-fields";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function AboutPage() {
  const [aboutRows, timeline, appearance] = await Promise.all([
    db.select().from(aboutContent).limit(1),
    db.select().from(timelineEntries).orderBy(asc(timelineEntries.sortOrder)),
    getPageAppearance("about"),
  ]);
  const about = aboutRows[0];

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <div className="ph">
        <div className="ph-wm">自己</div>
        <div className="ph-eyebrow">Profile</div>
        <h2 className="ph-title">About</h2>
        <p className="ph-sub">Designer, storyteller, worldbuilder.</p>
      </div>
      <div className="about-wrap">
        <div className="about-grid">
          <div className="ab-block ab-full">
            <div className="ab-t">Who I Am</div>
            {about?.whoIAmParagraphs.map((p, i) => (
              <p className="ab-p" key={i} style={fieldStyle(about.styles, "whoIAmParagraphs")}>{p}</p>
            ))}
          </div>
          <div className="ab-block">
            <div className="ab-t">Tools</div>
            <div className="ab-tools">
              {about?.tools.map((t) => (
                <span className="ab-tool" key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="ab-block">
            <div className="ab-t">Timeline</div>
            <div className="tl">
              {timeline.map((t) => (
                <div className="tl-row" key={t.id}>
                  <div className="tl-yr">{t.year}</div>
                  <div className="tl-t">{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
