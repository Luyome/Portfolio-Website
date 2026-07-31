import type { CSSProperties } from "react";

export type ServicePreviewState = {
  icon: string;
  title: string;
  desc: string;
};

export default function ServicePreviewCard({
  state,
  pageVars,
}: {
  state: ServicePreviewState;
  pageVars: CSSProperties;
}) {
  return (
    <div className="page" style={pageVars}>
      <div className="hs-grid" style={{ padding: 20, gridTemplateColumns: "1fr" }}>
        <div className="hs-card">
          <div className="hs-icon">{state.icon}</div>
          <div className="hs-card-title">{state.title}</div>
          <div className="hs-card-desc">{state.desc}</div>
        </div>
      </div>
    </div>
  );
}
