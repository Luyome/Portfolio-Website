"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import HomePreviewCard from "./HomePreviewCard";
import SaveButton from "./SaveButton";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";

type PreviewState = {
  heroEyebrow: string;
  name: string;
  heroJpLine: string;
  heroBio: string;
  homeBgImage: string;
  homeBgOpacity: number;
  styles: StylesMap;
};

export default function HomeHeroForm({
  action,
  settings,
  pageVars = {},
}: {
  action: (formData: FormData) => void;
  settings: {
    name: string;
    heroEyebrow: string;
    heroJpLine: string;
    heroBio: string;
    homeBgImage: string;
    homeBgOpacity: number;
    homeBgWidth: number | null;
    homeBgHeight: number | null;
    contactBgImage: string;
    contactBgOpacity: number;
    styles: StylesMap;
  };
  pageVars?: CSSProperties;
}) {
  const [state, setState] = useState<PreviewState>({
    heroEyebrow: settings.heroEyebrow,
    name: settings.name,
    heroJpLine: settings.heroJpLine,
    heroBio: settings.heroBio,
    homeBgImage: settings.homeBgImage,
    homeBgOpacity: settings.homeBgOpacity,
    styles: settings.styles ?? {},
  });

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "heroEyebrow" || name === "heroJpLine" || name === "heroBio") {
      setState((s) => ({ ...s, [name]: value }));
    }
    if (name === "homeBgOpacity") {
      setState((s) => ({ ...s, homeBgOpacity: Number(value) }));
    }
  }

  function updateStyle(key: string, patch: Partial<{ colorDark: string; colorLight: string; fontSize: string }>) {
    setState((s) => {
      const current: FieldStyle = s.styles[key] ?? {};
      const color = { ...current.color };
      if (patch.colorDark !== undefined) {
        if (patch.colorDark) color.dark = patch.colorDark; else delete color.dark;
      }
      if (patch.colorLight !== undefined) {
        if (patch.colorLight) color.light = patch.colorLight; else delete color.light;
      }
      const next: FieldStyle = { color, fontSize: patch.fontSize !== undefined ? (patch.fontSize || undefined) : current.fontSize };
      const styles: StylesMap = { ...s.styles, [key]: next };
      return { ...s, styles };
    });
  }

  return (
    <PreviewToggle renderPreview={() => <HomePreviewCard state={state} pageVars={pageVars} />}>
      <form action={action} className="adm-form" onChange={handleFormChange}>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="heroEyebrow">Eyebrow</label>
            <FieldStyleControls fieldKey="heroEyebrow" current={settings.styles?.heroEyebrow} onStyleChange={(p) => updateStyle("heroEyebrow", p)} />
          </div>
          <input id="heroEyebrow" name="heroEyebrow" defaultValue={settings.heroEyebrow} placeholder="Istanbul, Turkey — 2026" />
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="heroJpLine">Japanese Subtitle</label>
            <FieldStyleControls fieldKey="heroJpLine" current={settings.styles?.heroJpLine} onStyleChange={(p) => updateStyle("heroJpLine", p)} />
          </div>
          <input id="heroJpLine" name="heroJpLine" defaultValue={settings.heroJpLine} />
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="heroBio">Bio</label>
            <FieldStyleControls fieldKey="heroBio" current={settings.styles?.heroBio} onStyleChange={(p) => updateStyle("heroBio", p)} />
          </div>
          <textarea id="heroBio" name="heroBio" defaultValue={settings.heroBio} style={{ minHeight: 110 }} />
          <div className="adm-hint">Wrap words in **double asterisks** to bold them, e.g. **The Abyss**.</div>
        </div>
        <ImageUploadField
          name="homeBgImage"
          initialUrl={settings.homeBgImage}
          label="Hero Background Image"
          sizeFieldName="homeBg"
          initialSize={{ width: settings.homeBgWidth, height: settings.homeBgHeight }}
          onValueChange={(v) => setState((s) => ({ ...s, homeBgImage: v }))}
        />
        <div className="adm-hint" style={{ marginTop: -8 }}>
          The hero image always spans the full page width. Width/Height above let you force an exact tiled/cropped size instead of auto-cover; leave both at 0 for the default behavior.
        </div>
        <div className="adm-field">
          <label htmlFor="homeBgOpacity">Hero Background Opacity ({settings.homeBgOpacity}%)</label>
          <input id="homeBgOpacity" name="homeBgOpacity" type="range" min={0} max={100} defaultValue={settings.homeBgOpacity} />
        </div>
        <ImageUploadField name="contactBgImage" initialUrl={settings.contactBgImage} label="Let's Work Together Background Image" />
        <div className="adm-field">
          <label htmlFor="contactBgOpacity">Let&apos;s Work Together Background Opacity ({settings.contactBgOpacity}%)</label>
          <input id="contactBgOpacity" name="contactBgOpacity" type="range" min={0} max={100} defaultValue={settings.contactBgOpacity} />
        </div>
        <SaveButton />
      </form>
    </PreviewToggle>
  );
}
