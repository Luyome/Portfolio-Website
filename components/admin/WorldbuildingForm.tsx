"use client";

import { useActionState, useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import DatePicker from "./DatePicker";
import ContentEditor from "./ContentEditor";
import OrderPicker from "./OrderPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import WorldbuildingPreviewCard from "./WorldbuildingPreviewCard";
import SaveButton from "./SaveButton";
import type { worldbuildingEntries } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";
import { CATEGORIES } from "@/types/worldbuilding";

type WorldbuildingRow = typeof worldbuildingEntries.$inferSelect;

type PreviewState = {
  title: string;
  cat: string;
  date: string;
  excerpt: string;
  chips: string;
  img: string;
  styles: StylesMap;
};

export default function WorldbuildingForm({
  action,
  item,
  pageVars = {},
}: {
  action: (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
  item?: WorldbuildingRow;
  pageVars?: CSSProperties;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  const [state, setState] = useState<PreviewState>({
    title: item?.title ?? "",
    cat: item?.cat ?? "",
    date: item?.date ?? "",
    excerpt: item?.excerpt ?? "",
    chips: item?.chips.join(", ") ?? "",
    img: item?.img ?? "",
    styles: item?.styles ?? {},
  });

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "title" || name === "cat" || name === "excerpt" || name === "chips") {
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
    <PreviewToggle renderPreview={() => <WorldbuildingPreviewCard state={state} pageVars={pageVars} />}>
      <form action={formAction} className="adm-form" onChange={handleFormChange}>
        {actionState?.error && <div className="adm-error">{actionState.error}</div>}
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="title">Title</label>
            <FieldStyleControls fieldKey="title" current={item?.styles?.title} onStyleChange={(p) => updateStyle("title", p)} />
          </div>
          <input id="title" name="title" defaultValue={item?.title} required />
        </div>
        <div className="adm-field">
          <label htmlFor="cat">Category</label>
          <select id="cat" name="cat" defaultValue={item?.cat ?? CATEGORIES[0]} required>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="adm-field">
          <label htmlFor="year">Year</label>
          <YearPicker id="year" name="year" defaultValue={item?.year} />
        </div>
        <div className="adm-field">
          <label htmlFor="date">Display Date</label>
          <DatePicker id="date" name="date" defaultValue={item?.date} onValueChange={(v) => setState((s) => ({ ...s, date: v }))} />
        </div>
        <div className="adm-field">
          <div className="adm-field-label-row">
            <label htmlFor="excerpt">Excerpt</label>
            <FieldStyleControls fieldKey="excerpt" current={item?.styles?.excerpt} onStyleChange={(p) => updateStyle("excerpt", p)} />
          </div>
          <textarea id="excerpt" name="excerpt" defaultValue={item?.excerpt} required />
        </div>
        <div className="adm-field">
          <label htmlFor="chips">Chips</label>
          <input id="chips" name="chips" defaultValue={item?.chips.join(", ")} />
          <div className="adm-hint">Comma separated, e.g. Aethermoor, Lore, Cities</div>
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
