"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import SketchPreviewCard from "./SketchPreviewCard";
import SaveButton from "./SaveButton";
import type { sketches } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";

type SketchRow = typeof sketches.$inferSelect;

type PreviewState = {
  label: string;
  desc: string;
  img: string;
  colorHex: string;
  styles: StylesMap;
};

export default function SketchForm({
  action,
  item,
  pageVars = {},
}: {
  action: (formData: FormData) => void;
  item?: SketchRow;
  pageVars?: CSSProperties;
}) {
  const [state, setState] = useState<PreviewState>({
    label: item?.label ?? "",
    desc: item?.desc ?? "",
    img: item?.img ?? "",
    colorHex: item?.colorHex ?? "#151010",
    styles: item?.styles ?? {},
  });

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "label" || name === "desc" || name === "colorHex") {
      setState((s) => ({ ...s, [name]: value }));
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
    <PreviewToggle renderPreview={() => <SketchPreviewCard state={state} pageVars={pageVars} />}>
      <form action={action} className="adm-form" onChange={handleFormChange}>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="label">Label</label>
            <FieldStyleControls fieldKey="label" current={item?.styles?.label} onStyleChange={(p) => updateStyle("label", p)} />
          </div>
          <input id="label" name="label" defaultValue={item?.label} required placeholder="2026.02 — figure study" />
        </div>
        <div className="adm-field">
          <label htmlFor="year">Year</label>
          <YearPicker id="year" name="year" defaultValue={item?.year} />
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="desc">Description</label>
            <FieldStyleControls fieldKey="desc" current={item?.styles?.desc} onStyleChange={(p) => updateStyle("desc", p)} />
          </div>
          <textarea id="desc" name="desc" defaultValue={item?.desc} />
        </div>
        <ImageUploadField name="img" initialUrl={item?.img ?? undefined} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
        <div className="adm-field">
          <label htmlFor="link">Link (optional — e.g. social media / source)</label>
          <input id="link" name="link" type="text" defaultValue={item?.link ?? ""} placeholder="https://..." />
        </div>
        <div className="adm-field">
          <label htmlFor="colorHex">Placeholder Color (used when no image)</label>
          <input id="colorHex" name="colorHex" type="text" defaultValue={item?.colorHex ?? "#151010"} />
        </div>
        <div className="adm-field">
          <label htmlFor="sortOrder">Sort Order</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        </div>
        <SaveButton />
      </form>
    </PreviewToggle>
  );
}
