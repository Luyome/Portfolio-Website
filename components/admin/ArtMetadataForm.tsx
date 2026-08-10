"use client";

import { useActionState, useState } from "react";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import NumberPicker from "./NumberPicker";
import type { metadataOptions } from "@/db/schema";
import type { ArtMetadataType } from "@/lib/art-metadata-shared";

type MetadataRow = typeof metadataOptions.$inferSelect;
type ActionState = { error?: string } | undefined;

export default function ArtMetadataForm({
  type,
  item,
  action,
  cancelHref,
}: {
  /** Always `"art_category"` today — fixed by the page, never a user-editable field. */
  type: ArtMetadataType;
  item?: MetadataRow;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  cancelHref?: string;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  const [activeOn2d, setActiveOn2d] = useState(item?.activeOn2d ?? true);
  const [activeOn3d, setActiveOn3d] = useState(item?.activeOn3d ?? true);

  return (
    <form action={formAction} className="adm-form">
      <FormError message={actionState?.error} />
      <input type="hidden" name="type" value={type} />

      <Field id="name" label="Name" required>
        <input name="name" defaultValue={item?.name} required />
      </Field>
      <Field id="slug" label="Slug" required={false} hint="Leave blank to generate automatically from Name.">
        <input name="slug" defaultValue={item?.slug} placeholder="auto-generated-from-name" />
      </Field>
      <div className="adm-field">
        <label>Sort Order</label>
        <NumberPicker name="sortOrder" defaultValue={item?.sortOrder ?? 0} />
      </div>
      <div className="adm-form-row">
        <div className="adm-field">
          <label>Status on 2D</label>
          <input type="hidden" name="activeOn2d" value={activeOn2d ? "on" : "off"} />
          <button
            type="button"
            className={`adm-toggle-btn ${activeOn2d ? "on" : ""}`}
            aria-pressed={activeOn2d}
            onClick={() => setActiveOn2d((v) => !v)}
          >
            <span className="adm-toggle-dot" />
            {activeOn2d ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="adm-field">
          <label>Status on 3D</label>
          <input type="hidden" name="activeOn3d" value={activeOn3d ? "on" : "off"} />
          <button
            type="button"
            className={`adm-toggle-btn ${activeOn3d ? "on" : ""}`}
            aria-pressed={activeOn3d}
            onClick={() => setActiveOn3d((v) => !v)}
          >
            <span className="adm-toggle-dot" />
            {activeOn3d ? "Active" : "Inactive"}
          </button>
        </div>
      </div>

      <FormActions cancelHref={cancelHref} />
    </form>
  );
}
