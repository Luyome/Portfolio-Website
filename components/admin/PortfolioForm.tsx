"use client";

import { useActionState, useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import PortfolioPreviewCard from "./PortfolioPreviewCard";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import type { portfolioItems } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";

type PortfolioRow = typeof portfolioItems.$inferSelect;

type PreviewState = {
  title: string;
  cat: string;
  year: number;
  desc: string;
  tags: string;
  img: string;
  styles: StylesMap;
};

export default function PortfolioForm({
  action,
  item,
  pageVars = {},
}: {
  action: (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
  item?: PortfolioRow;
  pageVars?: CSSProperties;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  const [state, setState] = useState<PreviewState>({
    title: item?.title ?? "",
    cat: item?.cat ?? "",
    year: item?.year ?? new Date().getFullYear(),
    desc: item?.desc ?? "",
    tags: item?.tags.join(", ") ?? "",
    img: item?.img ?? "",
    styles: item?.styles ?? {},
  });

  function handleFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name === "title" || name === "cat" || name === "desc" || name === "tags") {
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
    <PreviewToggle renderPreview={() => <PortfolioPreviewCard state={state} pageVars={pageVars} />}>
      <form action={formAction} className="adm-form" onChange={handleFormChange}>
        <FormError message={actionState?.error} />
        <Field
          id="title"
          label="Title"
          required
          labelExtra={<FieldStyleControls fieldKey="title" current={item?.styles?.title} onStyleChange={(p) => updateStyle("title", p)} />}
        >
          <input name="title" defaultValue={item?.title} required />
        </Field>
        <Field id="cat" label="Category" required>
          <input name="cat" defaultValue={item?.cat} required />
        </Field>
        <div className="adm-field">
          <label htmlFor="year">Year</label>
          <YearPicker id="year" name="year" defaultValue={item?.year} onValueChange={(v) => setState((s) => ({ ...s, year: v }))} />
        </div>
        <Field
          id="desc"
          label="Description"
          required
          labelExtra={<FieldStyleControls fieldKey="desc" current={item?.styles?.desc} onStyleChange={(p) => updateStyle("desc", p)} />}
        >
          <textarea name="desc" defaultValue={item?.desc} required />
        </Field>
        <Field id="tags" label="Tags" required={false} hint="Comma separated, e.g. ZBrush, Substance, Game Ready">
          <input name="tags" defaultValue={item?.tags.join(", ")} />
        </Field>
        <Field id="medium" label="Medium" required>
          <input name="medium" defaultValue={item?.medium} required />
        </Field>
        <Field id="software" label="Software" required>
          <input name="software" defaultValue={item?.software} required />
        </Field>
        <Field id="link" label="External Link" required={false}>
          <input name="link" defaultValue={item?.link} placeholder="https://www.artstation.com/..." />
        </Field>
        <ImageUploadField name="img" initialUrl={item?.img} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
        <Field id="sortOrder" label="Sort Order" required={false}>
          <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        </Field>
        <FormActions cancelHref="/admin/portfolio" />
      </form>
    </PreviewToggle>
  );
}
