import type { CSSProperties } from "react";
import InlineBold from "../InlineBold";
import { fieldStyle } from "@/lib/style-fields";
import type { StylesMap } from "@/lib/style-fields";

export type HomePreviewState = {
  heroEyebrow: string;
  name: string;
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
          <div className="home-glow" />
          <div className="h-eyebrow" style={fieldStyle(state.styles, "heroEyebrow")}>{state.heroEyebrow}</div>
          <h1 className="h-name">{state.name.toLocaleUpperCase("tr-TR")}</h1>
          <div className="h-jp" style={fieldStyle(state.styles, "heroJpLine")}>{state.heroJpLine}</div>
          <div className="h-rule" />
          <p className="h-bio" style={fieldStyle(state.styles, "heroBio")}>
            <InlineBold text={state.heroBio} />
          </p>
        </div>
      </div>
    </div>
  );
}
