import type { CSSProperties } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type AboutPreviewState = {
  whoIAmParagraphs: string;
  styles: StylesMap;
};

export default function AboutPreviewCard({
  state,
  tools,
  timeline,
  pageVars,
}: {
  state: AboutPreviewState;
  tools: string[];
  timeline: { id: number; year: string; text: string }[];
  pageVars: CSSProperties;
}) {
  const paragraphs = state.whoIAmParagraphs.split("\n").map((p) => p.trim()).filter(Boolean);

  return (
    <div className="page" style={pageVars}>
      <div className="about-wrap" style={{ padding: 20 }}>
        <div className="about-grid">
          <div className="ab-block ab-full">
            <div className="ab-t">Who I Am</div>
            {paragraphs.map((p, i) => (
              <p className="ab-p" key={i} style={fieldStyle(state.styles, "whoIAmParagraphs")}>{p}</p>
            ))}
          </div>
          {tools.length > 0 && (
            <div className="ab-block">
              <div className="ab-t">Tools</div>
              <div className="ab-tools">
                {tools.map((t) => (
                  <span className="ab-tool" key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {timeline.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
