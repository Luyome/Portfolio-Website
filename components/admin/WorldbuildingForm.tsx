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
import AdminEditorLayout from "./AdminEditorLayout";
import type { worldbuildingEntries } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";
import { CATEGORIES, WORLDBUILDING_ENTITY_TYPES, ENTITY_TYPE_LABELS, type WorldbuildingEntityType } from "@/types/worldbuilding";

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
  const [entityType, setEntityType] = useState<WorldbuildingEntityType | "">(
    (item?.entityType as WorldbuildingEntityType | null) ?? ""
  );
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

        <AdminEditorLayout main={<>
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
            <Field id="cat" label="Category (legacy)" required hint="Preserved for existing records — Entity Type below is the canonical Sprint 4 taxonomy.">
              <select name="cat" defaultValue={item?.cat ?? CATEGORIES[0]} required>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="adm-form-row">
            <Field
              id="entityType"
              label="Entity Type"
              required={false}
              hint={
                entityType === "lore"
                  ? "Publishes through the Lore Reader (article/reading view)."
                  : entityType
                    ? "Publishes through the Artwork/Entity Detail view."
                    : "Legacy/unclassified — stays valid and editable, publishes through the Artwork/Entity Detail view until a type is chosen."
              }
            >
              <select
                name="entityType"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as WorldbuildingEntityType | "")}
              >
                <option value="">— Legacy / Unclassified —</option>
                {WORLDBUILDING_ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>{ENTITY_TYPE_LABELS[t]}</option>
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
          <ContentEditor name="content" defaultValue={item?.content} />
          <div className="adm-field">
            <label>Content Order</label>
            <div className="adm-hint" style={{ marginBottom: 8 }}>
              Where Content lands relative to Gallery Images and Videos (lower number = earlier).
            </div>
            <OrderPicker name="contentOrder" defaultValue={item?.contentOrder ?? 0} />
          </div>
        </AdminSection>

        </>} rail={<>
        <AdminSection title="Cover Media" description="Primary artwork or article cover for this entry.">
          <ImageUploadField name="img" initialUrl={item?.img} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
        </AdminSection>
        <AdminSection title="Display">
          <Field id="sortOrder" label="Sort Order" required={false}>
            <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
          </Field>
        </AdminSection>

        <div className="adm-editor-save"><FormActions cancelHref="/admin/worldbuilding" /></div>
        </>} />
      </form>
    </PreviewToggle>
  );
}
