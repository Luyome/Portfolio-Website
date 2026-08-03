"use client";

import ImageUploadField from "./ImageUploadField";
import OrderPicker from "./OrderPicker";
import SaveButton from "./SaveButton";
import type { WorldMap } from "@/lib/map-types";

export default function WorldMapForm({
  action,
  item,
  otherMaps,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item?: WorldMap;
  otherMaps: WorldMap[];
}) {
  return (
    <form action={action} className="adm-form">
      <div className="adm-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={item?.title} required placeholder="Krupni Central Realm" />
      </div>
      <div className="adm-field">
        <label htmlFor="parentMapId">Parent Map</label>
        <select id="parentMapId" name="parentMapId" defaultValue={item?.parentMapId ?? ""}>
          <option value="">— none (root / main map) —</option>
          {otherMaps.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        <div className="adm-hint">Leave empty for the main map. Otherwise this becomes a sub-map reached via a pin.</div>
      </div>
      <ImageUploadField name="imageUrl" initialUrl={item?.imageUrl} label="Map Image" />
      <div className="adm-field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={item?.description} />
      </div>
      <div className="adm-field">
        <label>Sort Order</label>
        <OrderPicker name="sortOrder" defaultValue={item?.sortOrder ?? 1} />
      </div>
      <SaveButton>{item ? "Save Map" : "Create Map"}</SaveButton>
    </form>
  );
}
