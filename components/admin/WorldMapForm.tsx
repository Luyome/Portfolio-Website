"use client";

import { useActionState } from "react";
import ImageUploadField from "./ImageUploadField";
import OrderPicker from "./OrderPicker";
import SaveButton from "./SaveButton";
import Field from "./Field";
import FormError from "./FormError";
import FormActions from "./FormActions";
import type { WorldMap } from "@/lib/map-types";

export default function WorldMapForm({
  action,
  item,
  otherMaps,
}: {
  action: (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string } | undefined>;
  item?: WorldMap;
  otherMaps: WorldMap[];
}) {
  const [actionState, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="adm-form">
      <FormError message={actionState?.error} />
      <Field id="title" label="Title" required>
        <input name="title" defaultValue={item?.title} required placeholder="Krupni Central Realm" />
      </Field>
      <Field
        id="parentMapId"
        label="Parent Map"
        required={false}
        hint="Leave empty for the main map. Otherwise this becomes a sub-map reached via a pin."
      >
        <select name="parentMapId" defaultValue={item?.parentMapId ?? ""}>
          <option value="">— none (root / main map) —</option>
          {otherMaps.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </Field>
      <ImageUploadField name="imageUrl" initialUrl={item?.imageUrl} label="Map Image" />
      <Field id="description" label="Description" required={false}>
        <textarea name="description" defaultValue={item?.description} />
      </Field>
      <div className="adm-field">
        <label>Sort Order</label>
        <OrderPicker name="sortOrder" defaultValue={item?.sortOrder ?? 1} />
      </div>
      <FormActions cancelHref="/admin/worldbuilding/maps">
        <SaveButton>{item ? "Save Map" : "Create Map"}</SaveButton>
      </FormActions>
    </form>
  );
}
