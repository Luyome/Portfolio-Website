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
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import AdminSection from "./AdminSection";
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
        <FormError message={actionState?.error} />

        <AdminSection title="Basic Information">
          <div className="adm-form-row">
            <Field
              id="title"
              label="Title"
              required
              labelExtra={<FieldStyleControls fieldKey="title" current={item?.styles?.title} onStyleChange={(p) => updateStyle("title", p)} />}
            >
              <input name="title" defaultValue={item?.title} required />
            </Field>
            <Field id="cat" label="Category" required>
              <select name="cat" defaultValue={item?.cat ?? CATEGORIES[0]} required>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label htmlFor="year">Year</label>
              <YearPicker id="year" name="year" defaultValue={item?.year} />
            </div>
            <div className="adm-field">
              <label htmlFor="date">Display Date</label>
              <DatePicker id="date" name="date" defaultValue={item?.date} onValueChange={(v) => setState((s) => ({ ...s, date: v }))} />
            </div>
          </div>
          <Field
            id="excerpt"
            label="Excerpt"
            required
            labelExtra={<FieldStyleControls fieldKey="excerpt" current={item?.styles?.excerpt} onStyleChange={(p) => updateStyle("excerpt", p)} />}
          >
            <textarea name="excerpt" defaultValue={item?.excerpt} required />
          </Field>
          <Field id="chips" label="Chips" required={false} hint="Comma separated, e.g. Aethermoor, Lore, Cities">
            <input name="chips" defaultValue={item?.chips.join(", ")} />
          </Field>
        </AdminSection>

        <AdminSection title="Content & Media">
          <ImageUploadField name="img" initialUrl={item?.img} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
          <ContentEditor name="content" defaultValue={item?.content} />
          <div className="adm-field">
            <label>Content Order</label>
            <div className="adm-hint" style={{ marginBottom: 8 }}>
              Where Content lands relative to Gallery Images and Videos (lower number = earlier).
            </div>
            <OrderPicker name="contentOrder" defaultValue={item?.contentOrder ?? 0} />
          </div>
        </AdminSection>

        <AdminSection title="Display">
          <Field id="sortOrder" label="Sort Order" required={false}>
            <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
          </Field>
        </AdminSection>

        <FormActions cancelHref="/admin/worldbuilding" />
      </form>
    </PreviewToggle>
  );
}
