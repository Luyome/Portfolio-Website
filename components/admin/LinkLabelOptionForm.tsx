"use client";

import { useActionState, useState } from "react";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import NumberPicker from "./NumberPicker";
import type { linkLabelOptions } from "@/db/schema";

type LinkLabelOptionRow = typeof linkLabelOptions.$inferSelect;
type ActionState = { error?: string } | undefined;

export default function LinkLabelOptionForm({
  item,
  action,
  cancelHref,
}: {
  item?: LinkLabelOptionRow;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  cancelHref?: string;
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  return (
    <form action={formAction} className="adm-form">
      <FormError message={actionState?.error} />

      <Field id="label" label="Label" required>
        <input name="label" defaultValue={item?.label} placeholder="ArtStation" required />
      </Field>
      <Field id="slug" label="Stable Key / Slug" required={false} hint="Leave blank to generate automatically from Label. Used to key a future logo/icon lookup — see Task 4.7 scope note.">
        <input name="slug" defaultValue={item?.slug} placeholder="auto-generated-from-label" />
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

      <FormActions cancelHref={cancelHref} />
    </form>
  );
}
