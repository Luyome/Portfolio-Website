"use client";

import { useActionState, useState } from "react";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import ImageUploadField from "./ImageUploadField";
import NumberPicker from "./NumberPicker";
import type { metadataOptions } from "@/db/schema";
import { METADATA_TYPE_LABELS, type MetadataType } from "@/lib/metadata";

type MetadataRow = typeof metadataOptions.$inferSelect;
type ActionState = { error?: string } | undefined;

export default function MetadataForm({
  type,
  item,
  action,
  cancelHref,
}: {
  /** The group this option belongs to — fixed by the page/tab, never a user-editable field. */
  type: MetadataType;
  item?: MetadataRow;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  cancelHref?: string;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const isSoftware = type === "software";

  return (
    <form action={formAction} className="adm-form">
      <FormError message={actionState?.error} />
      <input type="hidden" name="type" value={type} />
      <div className="adm-hint">Group: {METADATA_TYPE_LABELS[type]}</div>

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
      <div className="adm-field">
        <label>Status</label>
        <input type="hidden" name="isActive" value={isActive ? "on" : "off"} />
        <button
          type="button"
          className={`adm-toggle-btn ${isActive ? "on" : ""}`}
          aria-pressed={isActive}
          onClick={() => setIsActive((v) => !v)}
        >
          <span className="adm-toggle-dot" />
          {isActive ? "Active" : "Inactive"}
        </button>
      </div>

      {isSoftware && (
        <>
          <ImageUploadField name="iconUrl" label="Icon / Logo" initialUrl={item?.iconUrl ?? undefined} />
          <Field id="websiteUrl" label="Website URL" required={false} hint="https:// links only.">
            <input name="websiteUrl" type="url" defaultValue={item?.websiteUrl ?? ""} placeholder="https://..." />
          </Field>
        </>
      )}

      <FormActions cancelHref={cancelHref} />
    </form>
  );
}
