import type { CSSProperties } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type PortfolioPreviewState = {
  title: string;
  cat: string;
  year: number;
  desc: string;
  tags: string;
  img: string;
  styles: StylesMap;
};

export default function PortfolioPreviewCard({
  state,
  pageVars,
}: {
  state: PortfolioPreviewState;
  pageVars: CSSProperties;
}) {
  const tags = state.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="page" style={pageVars}>
      <div className="port-list" style={{ padding: 20 }}>
        <div className="port-card">
          <div className="port-img-wrap">
            {state.img ? <img src={state.img} alt={state.title} /> : null}
            <div className="port-yr-badge">{state.year}</div>
            <div className="port-img-open" style={{ opacity: 1 }}>View Full →</div>
          </div>
          <div className="port-info">
            <div className="pi-cat">{state.cat}</div>
            <div className="pi-title" style={fieldStyle(state.styles, "title")}>{state.title}</div>
            <p className="pi-desc" style={fieldStyle(state.styles, "desc")}>{state.desc}</p>
            {tags.length > 0 && (
              <div className="pi-tags">
                {tags.map((t) => (
                  <span className="pi-tag" key={t}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
