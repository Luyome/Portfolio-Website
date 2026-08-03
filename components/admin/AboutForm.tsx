"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import AboutPreviewCard from "./AboutPreviewCard";
import SaveButton from "./SaveButton";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";

export default function AboutForm({
  action,
  whoIAmParagraphs,
  tools,
  timeline,
  styles,
  pageVars = {},
}: {
  action: (formData: FormData) => void;
  whoIAmParagraphs: string;
  tools: string;
  timeline: { id: number; year: string; text: string }[];
  styles?: StylesMap;
  pageVars?: CSSProperties;
}) {
  const [state, setState] = useState({
    whoIAmParagraphs,
    styles: styles ?? {},
  });
  const [toolsList, setToolsList] = useState(
    tools.split(",").map((t) => t.trim()).filter(Boolean)
  );

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "whoIAmParagraphs") {
      setState((s) => ({ ...s, whoIAmParagraphs: value }));
    }
    if (name === "tools") {
      setToolsList(value.split(",").map((t) => t.trim()).filter(Boolean));
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
      const nextStyles: StylesMap = { ...s.styles, [key]: next };
      return { ...s, styles: nextStyles };
    });
  }

  return (
    <PreviewToggle renderPreview={() => <AboutPreviewCard state={state} tools={toolsList} timeline={timeline} pageVars={pageVars} />}>
      <form action={action} className="adm-form" onChange={handleFormChange}>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="whoIAmParagraphs">Who I Am (paragraphs)</label>
            <FieldStyleControls fieldKey="whoIAmParagraphs" current={styles?.whoIAmParagraphs} onStyleChange={(p) => updateStyle("whoIAmParagraphs", p)} />
          </div>
          <textarea
            id="whoIAmParagraphs"
            name="whoIAmParagraphs"
            defaultValue={whoIAmParagraphs}
            style={{ minHeight: 160 }}
          />
          <div className="adm-hint">One paragraph per line.</div>
        </div>
        <div className="adm-field">
          <label htmlFor="tools">Tools</label>
          <input id="tools" name="tools" defaultValue={tools} />
          <div className="adm-hint">Comma separated, e.g. Unreal Engine 5, Blender, ZBrush</div>
        </div>
        <SaveButton />
      </form>
    </PreviewToggle>
  );
}
