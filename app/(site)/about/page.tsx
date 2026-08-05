import { asc } from "drizzle-orm";
import { db } from "@/db";
import { aboutContent, timelineEntries, cvContent } from "@/db/schema";
import { fieldStyle } from "@/lib/style-fields";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { downloadUrl } from "@/lib/download-url";
import PageHeader from "@/components/PageHeader";
import ActionLink from "@/components/ActionLink";

export default async function AboutPage() {
  const [aboutRows, timeline, appearance, cvRows] = await Promise.all([
    db.select().from(aboutContent).limit(1),
    db.select().from(timelineEntries).orderBy(asc(timelineEntries.sortOrder)),
    getPageAppearance("about"),
    db.select().from(cvContent).limit(1),
  ]);
  const about = aboutRows[0];
  const cv = cvRows[0];

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <PageHeader
        watermark="自己"
        eyebrow="Profile & Credentials"
        title="About"
        subtitle="Designer, storyteller, worldbuilder."
      />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <section className="mb-20">
          <div className="ab-t">Bio &amp; Vision</div>
          {about?.whoIAmParagraphs.map((p, i) => (
            <p className="ab-p" key={i} style={fieldStyle(about.styles, "whoIAmParagraphs")}>
              {p}
            </p>
          ))}
        </section>

        {timeline.length > 0 && (
          <section className="mb-20">
            <div className="ab-t">Experience &amp; Selected Projects</div>
            <div className="tl">
              {timeline.map((t) => (
                <div className="tl-row" key={t.id}>
                  <div className="tl-yr">{t.year}</div>
                  <div className="tl-t">{t.text}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="ab-t">Technical Stack &amp; Resume</div>
          {about?.tools && about.tools.length > 0 && (
            <div className="ab-tools">
              {about.tools.map((t) => (
                <span className="ab-tool" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {cv?.img && (
            <ActionLink href={downloadUrl(cv.img, "CV")} style={{ display: "inline-block", marginTop: 28 }}>
              Download CV (PDF)
            </ActionLink>
          )}
        </section>
      </div>
    </div>
  );
}
