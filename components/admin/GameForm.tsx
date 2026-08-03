"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import ContentEditor from "./ContentEditor";
import OrderPicker from "./OrderPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import GamePreviewCard from "./GamePreviewCard";
import SaveButton from "./SaveButton";
import type { games } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";

type GameRow = typeof games.$inferSelect;

type PreviewState = {
  title: string;
  status: string;
  engine: string;
  desc: string;
  tags: string;
  target: string;
  img: string;
  styles: StylesMap;
};

export default function GameForm({
  action,
  item,
  pageVars = {},
}: {
  action: (formData: FormData) => void;
  item?: GameRow;
  pageVars?: CSSProperties;
}) {
  const [state, setState] = useState<PreviewState>({
    title: item?.title ?? "",
    status: item?.status ?? "",
    engine: item?.engine ?? "",
    desc: item?.desc ?? "",
    tags: item?.tags.join(", ") ?? "",
    target: item?.target ?? "",
    img: item?.img ?? "",
    styles: item?.styles ?? {},
  });

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "title" || name === "status" || name === "engine" || name === "desc" || name === "tags" || name === "target") {
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
    <PreviewToggle renderPreview={() => <GamePreviewCard state={state} pageVars={pageVars} />}>
      <form action={action} className="adm-form" onChange={handleFormChange}>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="title">Title</label>
            <FieldStyleControls fieldKey="title" current={item?.styles?.title} onStyleChange={(p) => updateStyle("title", p)} />
          </div>
          <input id="title" name="title" defaultValue={item?.title} required />
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="status">Status</label>
            <FieldStyleControls fieldKey="status" current={item?.styles?.status} onStyleChange={(p) => updateStyle("status", p)} />
          </div>
          <input id="status" name="status" defaultValue={item?.status} required placeholder="In Development — Solo" />
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="engine">Engine</label>
            <FieldStyleControls fieldKey="engine" current={item?.styles?.engine} onStyleChange={(p) => updateStyle("engine", p)} />
          </div>
          <input id="engine" name="engine" defaultValue={item?.engine} required placeholder="Unreal Engine 5" />
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
          <textarea id="desc" name="desc" defaultValue={item?.desc} required />
          <div className="adm-hint">Short summary shown on the Games list card.</div>
        </div>
        <div className="adm-field">
          <label htmlFor="tags">Tags</label>
          <input id="tags" name="tags" defaultValue={item?.tags.join(", ")} />
          <div className="adm-hint">Comma separated, e.g. Horror, First-Person, Solo Dev</div>
        </div>
        <div className="adm-field">
          <label htmlFor="feats">Features</label>
          <textarea id="feats" name="feats" defaultValue={item?.feats.join("\n")} />
          <div className="adm-hint">One feature per line</div>
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="target">Target</label>
            <FieldStyleControls fieldKey="target" current={item?.styles?.target} onStyleChange={(p) => updateStyle("target", p)} />
          </div>
          <input id="target" name="target" defaultValue={item?.target} required placeholder="Steam — June 2026" />
        </div>
        <ImageUploadField name="img" initialUrl={item?.img} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
        <ContentEditor name="content" defaultValue={item?.content} />
        <div className="adm-field">
          <label>Content Order</label>
          <div className="adm-hint" style={{ marginBottom: 8 }}>
            Where Content lands relative to Gallery Images and Videos (lower number = earlier).
          </div>
          <OrderPicker name="contentOrder" defaultValue={item?.contentOrder ?? 0} />
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
