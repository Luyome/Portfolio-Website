import type { CSSProperties } from "react";
import InlineBold from "../InlineBold";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type HomePreviewState = {
  heroEyebrow: string;
  name: string;
  handle?: string;
  heroJpLine: string;
  heroBio: string;
  homeBgImage: string;
  homeBgOpacity: number;
  styles: StylesMap;
};

export default function HomePreviewCard({
  state,
  pageVars,
}: {
  state: HomePreviewState;
  pageVars: CSSProperties;
}) {
  return (
    <div className="page home-page" style={pageVars}>
      <div className="home-hero-band">
        {state.homeBgImage && (
          <div
            className="home-bg-image"
            style={{ backgroundImage: `url(${state.homeBgImage})`, opacity: state.homeBgOpacity / 100 }}
          />
        )}
        <div className="home-hero">
          <div className="home-glow" aria-hidden="true" />
          <div className="home-hero-copy">
            <div className="h-eyebrow" style={fieldStyle(state.styles, "heroEyebrow")}>{state.heroEyebrow}</div>
            <h1 className="h-name">{state.handle || "/ TETSUNARU"}</h1>
            <div className="h-identity"><span className="h-identity-label">Creator / Designer</span><span className="h-identity-name">{state.name}</span></div>
          </div>
          <div className="home-hero-context">
            <div className="h-jp" style={fieldStyle(state.styles, "heroJpLine")}>{state.heroJpLine}</div>
            <div className="h-rule" aria-hidden="true" />
            <p className="h-bio" style={fieldStyle(state.styles, "heroBio")}><InlineBold text={state.heroBio} /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
