"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateMapLocationInfo, deleteMapLocation } from "@/lib/actions/map";
import type { IconType, MapLocation, PinType, WorldMap } from "@/lib/map-types";

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

const ICON_TYPES: IconType[] = ["default", "city", "character", "landmark", "hazard"];

export default function MapPinEditPanel({
  location,
  maps,
  entries,
  onClose,
  onSaved,
  onDeleted,
}: {
  location: MapLocation;
  maps: WorldMap[];
  entries: { id: number; title: string }[];
  onClose: () => void;
  onSaved: (loc: MapLocation) => void;
  onDeleted: (id: number) => void;
}) {
  const [name, setName] = useState(location.name);
  const [info, setInfo] = useState(location.info);
  const [img, setImg] = useState(location.img ?? "");
  const [pinType, setPinType] = useState<PinType>(location.pinType as PinType);
  const [targetMapId, setTargetMapId] = useState<number | null>(location.targetMapId);
  const [entryId, setEntryId] = useState<number | null>(location.entryId);
  const [iconType, setIconType] = useState<IconType>(location.iconType as IconType);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const otherMaps = maps.filter((m) => m.id !== location.mapId);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/admin/blob-upload" });
      setImg(blob.url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const fields = {
      name,
      info,
      img: img || null,
      pinType,
      targetMapId: pinType === "submap" ? targetMapId : null,
      entryId: pinType === "lore" ? entryId : null,
      iconType,
    };
    await updateMapLocationInfo(location.id, fields);
    setSaving(false);
    onSaved({ ...location, ...fields });
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${location.name}"?`)) return;
    await deleteMapLocation(location.id);
    onDeleted(location.id);
  }

  return (
    <div
      className="gm-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gm-panel">
        <div className="gm-img-side">
          <img src={img || NO_IMAGE_SVG} alt={name} />
        </div>
        <div className="gm-info">
          <div className="gm-bar">
            <span className="gm-cat-lbl">Pin</span>
            <button type="button" className="gm-close" onClick={onClose}>✕ &nbsp; Close</button>
          </div>
          <div className="adm-field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Pin Type</label>
            <select value={pinType} onChange={(e) => setPinType(e.target.value as PinType)}>
              <option value="lore">Open Lore Entry</option>
              <option value="submap">Zoom to Sub-Map</option>
            </select>
          </div>
          {pinType === "submap" ? (
            <div className="adm-field">
              <label>Target Map</label>
              <select
                value={targetMapId ?? ""}
                onChange={(e) => setTargetMapId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— choose a map —</option>
                {otherMaps.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="adm-field">
              <label>Linked Lore Entry</label>
              <select
                value={entryId ?? ""}
                onChange={(e) => setEntryId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— none (use freeform Info/Image below) —</option>
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.title}</option>
                ))}
              </select>
            </div>
          )}
          <div className="adm-field">
            <label>Icon Type</label>
            <select value={iconType} onChange={(e) => setIconType(e.target.value as IconType)}>
              {ICON_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label>Info</label>
            <div className="adm-hint" style={{ marginBottom: 8 }}>
              Fallback text shown when this pin isn&apos;t linked to a Lore Entry above.
            </div>
            <textarea value={info} onChange={(e) => setInfo(e.target.value)} style={{ minHeight: 100 }} />
          </div>
          <div className="adm-field">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
            {uploading && <div className="adm-hint">Uploading…</div>}
          </div>
          <div className="adm-actions" style={{ marginTop: 20 }}>
            <button type="button" className="adm-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="danger" onClick={handleDelete}>Delete Pin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
