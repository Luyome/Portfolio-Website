"use client";

import { useActionState, useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import Model3DPreviewCard from "./Model3DPreviewCard";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import AdminSection from "./AdminSection";
import AdminEditorLayout from "./AdminEditorLayout";
import type { models3d } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";

type Model3DRow = typeof models3d.$inferSelect;

type PreviewState = {
  label: string;
  desc: string;
  img: string;
  colorHex: string;
  styles: StylesMap;
};

export default function Model3DForm({
  action,
  item,
  pageVars = {},
}: {
  action: (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
  item?: Model3DRow;
  pageVars?: CSSProperties;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
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
    <PreviewToggle renderPreview={() => <Model3DPreviewCard state={state} pageVars={pageVars} />}>
      <form action={formAction} className="adm-form" onChange={handleFormChange}>
        <FormError message={actionState?.error} />

        <AdminEditorLayout main={<>
        <AdminSection title="Basic Information">
          <div className="adm-form-row">
            <Field
              id="label"
              label="Label"
              required
              labelExtra={<FieldStyleControls fieldKey="label" current={item?.styles?.label} onStyleChange={(p) => updateStyle("label", p)} />}
            >
              <input name="label" defaultValue={item?.label} required placeholder="2026.02 — prop study" />
            </Field>
            <div className="adm-field">
              <label htmlFor="year">Year</label>
              <YearPicker id="year" name="year" defaultValue={item?.year} />
            </div>
          </div>
          <Field
            id="desc"
            label="Description"
            required={false}
            labelExtra={<FieldStyleControls fieldKey="desc" current={item?.styles?.desc} onStyleChange={(p) => updateStyle("desc", p)} />}
          >
            <textarea name="desc" defaultValue={item?.desc} />
          </Field>
        </AdminSection>

        </>} rail={<>
        <AdminSection title="Media & Display">
          <ImageUploadField name="img" initialUrl={item?.img ?? undefined} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
          <div className="adm-form-row">
            <Field id="link" label="Link — e.g. social media / source" required={false}>
              <input name="link" type="text" defaultValue={item?.link ?? ""} placeholder="https://..." />
            </Field>
            <Field id="colorHex" label="Placeholder Color (used when no image)" required={false}>
              <input name="colorHex" type="text" defaultValue={item?.colorHex ?? "#151010"} />
            </Field>
          </div>
          <Field id="displayTemplate" label="Display Template" required={false} hint="Gallery: media viewer. Blog: full-page article reader.">
            <select name="displayTemplate" defaultValue={item?.displayTemplate ?? "gallery"}>
              <option value="gallery">Gallery (media viewer)</option>
              <option value="blog">Blog (article reader)</option>
            </select>
          </Field>
          <Field id="sortOrder" label="Sort Order" required={false}>
            <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
          </Field>
        </AdminSection>

        <div className="adm-editor-save"><FormActions cancelHref="/admin/3d" /></div>
        </>} />
      </form>
    </PreviewToggle>
  );
}
