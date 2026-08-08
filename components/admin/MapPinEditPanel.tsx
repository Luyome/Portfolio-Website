"use client";

import { useId, useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateMapLocationInfo, updateMapLocationZoom, deleteMapLocation } from "@/lib/actions/map";
import { acceptAttrFor, checkUpload } from "@/lib/upload-policy";
import { MAP_ZOOM_MIN, MAP_ZOOM_MAX, MAP_PRIORITY_MIN, MAP_PRIORITY_MAX } from "@/lib/map-zoom";
import type { IconType, MapLocation, PinType, WorldMap } from "@/lib/map-types";

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

const ICON_TYPES: IconType[] = ["default", "city", "character", "landmark", "hazard"];

/** Clamps a raw number input to [min, max], falling back to `fallback` for empty/non-numeric input (e.g. the field cleared mid-edit) instead of committing NaN. */
function clampedNumber(raw: string, min: number, max: number, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || raw.trim() === "") return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

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
  const [priority, setPriority] = useState(location.priority);
  const [minZoom, setMinZoom] = useState(location.minZoom);
  const [maxZoom, setMaxZoom] = useState(location.maxZoom);
  const [zoomError, setZoomError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const uploadErrorId = useId();
  const zoomErrorId = useId();

  const otherMaps = maps.filter((m) => m.id !== location.mapId);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    const check = checkUpload("image", file.name, file.size);
    if (!check.ok) {
      setUploadError(check.error);
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(check.fileName, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
        contentType: check.contentType,
      });
      setImg(blob.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (minZoom > maxZoom) {
      setZoomError("Min zoom must not be greater than max zoom.");
      return;
    }
    setZoomError(null);
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
    const zoomFields = { priority, minZoom, maxZoom };
    await Promise.all([
      updateMapLocationInfo(location.id, fields),
      updateMapLocationZoom(location.id, zoomFields),
    ]);
    setSaving(false);
    onSaved({ ...location, ...fields, ...zoomFields });
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
            <input
              type="file"
              accept={acceptAttrFor("image")}
              onChange={handleFile}
              disabled={uploading}
              aria-describedby={uploadError ? uploadErrorId : undefined}
            />
            {uploading && <div className="adm-hint">Uploading…</div>}
            {uploadError && <div id={uploadErrorId} className="adm-error" role="alert">{uploadError}</div>}
          </div>

          <div className="adm-field">
            <label>Priority</label>
            <div className="adm-hint" style={{ marginBottom: 8 }}>
              Breaks ties when several pins are visible at once (0–{MAP_PRIORITY_MAX}, higher shows/orders first).
            </div>
            <input
              type="number"
              min={MAP_PRIORITY_MIN}
              max={MAP_PRIORITY_MAX}
              value={priority}
              onChange={(e) => setPriority(clampedNumber(e.target.value, MAP_PRIORITY_MIN, MAP_PRIORITY_MAX, priority))}
            />
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label>Min Zoom</label>
              <div className="adm-hint" style={{ marginBottom: 8 }}>
                {MAP_ZOOM_MIN} = far/world view.
              </div>
              <input
                type="number"
                min={MAP_ZOOM_MIN}
                max={MAP_ZOOM_MAX}
                value={minZoom}
                aria-describedby={zoomError ? zoomErrorId : undefined}
                onChange={(e) => setMinZoom(clampedNumber(e.target.value, MAP_ZOOM_MIN, MAP_ZOOM_MAX, minZoom))}
              />
            </div>
            <div className="adm-field">
              <label>Max Zoom</label>
              <div className="adm-hint" style={{ marginBottom: 8 }}>
                {MAP_ZOOM_MAX} = near/detail view.
              </div>
              <input
                type="number"
                min={MAP_ZOOM_MIN}
                max={MAP_ZOOM_MAX}
                value={maxZoom}
                aria-describedby={zoomError ? zoomErrorId : undefined}
                onChange={(e) => setMaxZoom(clampedNumber(e.target.value, MAP_ZOOM_MIN, MAP_ZOOM_MAX, maxZoom))}
              />
            </div>
          </div>
          {zoomError && <div id={zoomErrorId} className="adm-error" role="alert">{zoomError}</div>}

          <div className="adm-actions" style={{ marginTop: 20 }}>
            <button type="button" className="adm-btn" onClick={handleSave} disabled={saving || uploading}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="danger" onClick={handleDelete}>Delete Pin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
