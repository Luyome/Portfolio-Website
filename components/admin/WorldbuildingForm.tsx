"use client";

import { useActionState, useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import DatePicker from "./DatePicker";
import ContentEditor from "./ContentEditor";
import OrderPicker from "./OrderPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import WorldbuildingPreviewCard from "./WorldbuildingPreviewCard";
import MultiSelect from "./MultiSelect";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import AdminSection from "./AdminSection";
import AdminEditorLayout from "./AdminEditorLayout";
import type { worldbuildingEntries } from "@/db/schema";
import { DISPLAY_TEMPLATES } from "@/db/schema";
import type { StylesMap, FieldStyle } from "@/lib/style-fields";
import type { WbMetadataOptionChoice } from "@/lib/worldbuilding-metadata";

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
  entityTypeOptions,
  categoryOptions,
  chipOptions,
  selectedEntityType,
  selectedCategory,
  selectedChips,
}: {
  action: (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
  item?: WorldbuildingRow;
  pageVars?: CSSProperties;
  /** Active options for each Phase 2 metadata-driven group — see `lib/worldbuilding-metadata.ts`. */
  entityTypeOptions: WbMetadataOptionChoice[];
  categoryOptions: WbMetadataOptionChoice[];
  chipOptions: WbMetadataOptionChoice[];
  /** This entry's current selection per group (may include an inactive option so it isn't silently dropped). */
  selectedEntityType?: WbMetadataOptionChoice;
  selectedCategory?: WbMetadataOptionChoice;
  selectedChips: WbMetadataOptionChoice[];
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  const [entityTypeId, setEntityTypeId] = useState<string>(selectedEntityType ? String(selectedEntityType.id) : "");
  const [displayTemplate, setDisplayTemplate] = useState(item?.displayTemplate ?? "gallery");
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
    if (name === "title" || name === "excerpt") {
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
            <Field
              id="catOptionId"
              label="Category (legacy)"
              required
              hint={
                categoryOptions.length === 0
                  ? "No options yet — add some in Admin → Worldbuilding Metadata."
                  : "Preserved for existing records — Entity Type below is the canonical taxonomy."
              }
            >
              <select
                name="catOptionId"
                defaultValue={selectedCategory ? String(selectedCategory.id) : ""}
                onChange={(e) => {
                  const opt = categoryOptions.find((o) => String(o.id) === e.target.value);
                  setState((s) => ({ ...s, cat: opt?.name ?? "" }));
                }}
                required
              >
                <option value="" disabled>— choose —</option>
                {selectedCategory && !categoryOptions.some((o) => o.id === selectedCategory.id) && (
                  <option value={selectedCategory.id}>{selectedCategory.name} (inactive)</option>
                )}
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="adm-form-row">
            <Field
              id="entityTypeOptionId"
              label="Entity Type"
              required={false}
              hint="Legacy/unclassified — stays valid and editable — until a type is chosen. Options are managed in Admin → Worldbuilding Metadata."
            >
              <select
                name="entityTypeOptionId"
                value={entityTypeId}
                onChange={(e) => setEntityTypeId(e.target.value)}
              >
                <option value="">— Legacy / Unclassified —</option>
                {selectedEntityType && !entityTypeOptions.some((o) => o.id === selectedEntityType.id) && (
                  <option value={selectedEntityType.id}>{selectedEntityType.name} (inactive)</option>
                )}
                {entityTypeOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field
              id="displayTemplate"
              label="Display Template"
              required={false}
              hint="Gallery: media-first viewer with a side info rail. Blog: full-page long-form article reader. Independent of Entity Type — e.g. a Location can still publish as a Blog article."
            >
              <select name="displayTemplate" value={displayTemplate} onChange={(e) => setDisplayTemplate(e.target.value)}>
                {DISPLAY_TEMPLATES.map((t) => (
                  <option key={t} value={t}>{t === "gallery" ? "Gallery (media viewer)" : "Blog (article reader)"}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label htmlFor="date">Date</label>
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
          <Field id="chipOptionIds" label="Chips" required={false} hint="Selected from managed options — add new ones in Admin → Worldbuilding Metadata.">
            <MultiSelect
              id="chipOptionIds"
              name="chipOptionIds"
              options={chipOptions}
              initialSelected={selectedChips}
              metadataType="wb_chip"
              manageHref="/admin/worldbuilding/metadata?type=wb_chip"
              placeholder="Search chips…"
              onSelectionChange={(selected) => setState((s) => ({ ...s, chips: selected.map((c) => c.name).join(", ") }))}
            />
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
