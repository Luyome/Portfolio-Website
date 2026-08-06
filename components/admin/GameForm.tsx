"use client";

import { useActionState, useState } from "react";
import type { CSSProperties } from "react";
import ImageUploadField from "./ImageUploadField";
import YearPicker from "./YearPicker";
import ContentEditor from "./ContentEditor";
import OrderPicker from "./OrderPicker";
import FieldStyleControls from "./FieldStyleControls";
import PreviewToggle from "./PreviewToggle";
import GamePreviewCard from "./GamePreviewCard";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
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
  action: (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
  item?: GameRow;
  pageVars?: CSSProperties;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
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
        <Field
          id="status"
          label="Status"
          required
          labelExtra={<FieldStyleControls fieldKey="status" current={item?.styles?.status} onStyleChange={(p) => updateStyle("status", p)} />}
        >
          <input name="status" defaultValue={item?.status} required placeholder="In Development — Solo" />
        </Field>
        <Field
          id="engine"
          label="Engine"
          required
          labelExtra={<FieldStyleControls fieldKey="engine" current={item?.styles?.engine} onStyleChange={(p) => updateStyle("engine", p)} />}
        >
          <input name="engine" defaultValue={item?.engine} required placeholder="Unreal Engine 5" />
        </Field>
        <div className="adm-field">
          <label htmlFor="year">Year</label>
          <YearPicker id="year" name="year" defaultValue={item?.year} />
        </div>
        <Field
          id="desc"
          label="Description"
          required
          hint="Short summary shown on the Games list card."
          labelExtra={<FieldStyleControls fieldKey="desc" current={item?.styles?.desc} onStyleChange={(p) => updateStyle("desc", p)} />}
        >
          <textarea name="desc" defaultValue={item?.desc} required />
        </Field>
        <Field id="tags" label="Tags" required={false} hint="Comma separated, e.g. Horror, First-Person, Solo Dev">
          <input name="tags" defaultValue={item?.tags.join(", ")} />
        </Field>
        <Field id="feats" label="Features" required={false} hint="One feature per line">
          <textarea name="feats" defaultValue={item?.feats.join("\n")} />
        </Field>
        <Field
          id="target"
          label="Target"
          required
          labelExtra={<FieldStyleControls fieldKey="target" current={item?.styles?.target} onStyleChange={(p) => updateStyle("target", p)} />}
        >
          <input name="target" defaultValue={item?.target} required placeholder="Steam — June 2026" />
        </Field>
        <ImageUploadField name="img" initialUrl={item?.img} onValueChange={(v) => setState((s) => ({ ...s, img: v }))} />
        <ContentEditor name="content" defaultValue={item?.content} />
        <div className="adm-field">
          <label>Content Order</label>
          <div className="adm-hint" style={{ marginBottom: 8 }}>
            Where Content lands relative to Gallery Images and Videos (lower number = earlier).
          </div>
          <OrderPicker name="contentOrder" defaultValue={item?.contentOrder ?? 0} />
        </div>
        <Field id="sortOrder" label="Sort Order" required={false}>
          <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        </Field>
        <FormActions cancelHref="/admin/games" />
      </form>
    </PreviewToggle>
  );
}
