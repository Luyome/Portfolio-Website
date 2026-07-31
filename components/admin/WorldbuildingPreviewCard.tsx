import type { CSSProperties } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type WorldbuildingPreviewState = {
  title: string;
  cat: string;
  date: string;
  excerpt: string;
  chips: string;
  img: string;
  styles: StylesMap;
};

export default function WorldbuildingPreviewCard({
  state,
  pageVars,
}: {
  state: WorldbuildingPreviewState;
  pageVars: CSSProperties;
}) {
  const chips = state.chips.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="page" style={pageVars}>
      <div className="wb-grid" style={{ padding: 20, gridTemplateColumns: "1fr" }}>
        <div className="wb-card">
          <div className="wb-card-img">
            {state.img ? <img src={state.img} alt={state.title} /> : null}
            <div className="wb-card-date">{state.date}</div>
          </div>
          <div className="wb-card-body">
            <span className="wb-card-cat">{state.cat}</span>
            <div className="wb-card-title" style={fieldStyle(state.styles, "title")}>{state.title}</div>
            <div className="wb-card-excerpt" style={fieldStyle(state.styles, "excerpt")}>{state.excerpt}</div>
            {chips.length > 0 && (
              <div className="wb-card-chips">
                {chips.map((c) => (
                  <span className="wb-chip" key={c}>{c}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
