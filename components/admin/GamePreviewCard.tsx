import type { CSSProperties } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type GamePreviewState = {
  title: string;
  status: string;
  engine: string;
  desc: string;
  tags: string;
  target: string;
  img: string;
  styles: StylesMap;
};

export default function GamePreviewCard({
  state,
  pageVars,
}: {
  state: GamePreviewState;
  pageVars: CSSProperties;
}) {
  const tags = state.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="page" style={pageVars}>
      <div className="games-wrap" style={{ padding: 20 }}>
        <div className="game-row">
          <div className="game-row-media">
            {state.img ? <img src={state.img} alt={state.title} /> : null}
          </div>
          <div className="game-row-content">
            <div className="gr-index">01</div>
            <div className="gr-status">
              <span style={fieldStyle(state.styles, "status")}>{state.status}</span>
              {" — "}
              <span style={fieldStyle(state.styles, "engine")}>{state.engine}</span>
            </div>
            <h3 className="gr-title" style={fieldStyle(state.styles, "title")}>{state.title}</h3>
            <p className="gr-desc" style={fieldStyle(state.styles, "desc")}>{state.desc}</p>
            {tags.length > 0 && (
              <div className="gr-tags">
                {tags.map((t) => (
                  <span className="gr-tag" key={t}>{t}</span>
                ))}
              </div>
            )}
            <button type="button" className="gr-btn">View Details</button>
          </div>
        </div>
        <div className="gdo-side-section" style={{ marginTop: 24 }}>
          <div className="gdo-side-lbl">Target</div>
          <div className="gdo-side-val" style={fieldStyle(state.styles, "target")}>{state.target}</div>
        </div>
      </div>
    </div>
  );
}
