import type { CSSProperties } from "react";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type SketchPreviewState = {
  label: string;
  desc: string;
  img: string;
  colorHex: string;
  styles: StylesMap;
};

export default function SketchPreviewCard({
  state,
  pageVars,
}: {
  state: SketchPreviewState;
  pageVars: CSSProperties;
}) {
  return (
    <div className="page" style={pageVars}>
      <div className="sk-grid" style={{ padding: 20, gridTemplateColumns: "1fr" }}>
        {state.img ? (
          <div className="sk-item">
            <div className="sk-thumb">
              <img src={state.img} alt={state.label} />
            </div>
            <div className="sk-lbl" style={fieldStyle(state.styles, "label")}>{state.label}</div>
          </div>
        ) : (
          <div
            className="sk-item"
            style={{
              background: state.colorHex || "#151010",
              minHeight: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily: "var(--M)",
                fontSize: "0.55rem",
                color: "var(--muted)",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: 1.6,
                ...fieldStyle(state.styles, "label"),
              }}
            >
              {state.label}
            </div>
            <div style={{ marginTop: 12, fontSize: "2rem", opacity: 0.1 }}>✎</div>
          </div>
        )}
      </div>
      {state.desc && (
        <div style={{ padding: "0 20px 20px" }}>
          <div className="gm-desc" style={fieldStyle(state.styles, "desc")}>{state.desc}</div>
        </div>
      )}
    </div>
  );
}
