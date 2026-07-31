"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateMapLocationInfo, deleteMapLocation } from "@/lib/actions/map";
import type { MapLocation } from "@/lib/map-types";

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

export default function MapPinEditPanel({
  location,
  onClose,
  onSaved,
  onDeleted,
}: {
  location: MapLocation;
  onClose: () => void;
  onSaved: (loc: MapLocation) => void;
  onDeleted: (id: number) => void;
}) {
  const [name, setName] = useState(location.name);
  const [info, setInfo] = useState(location.info);
  const [img, setImg] = useState(location.img ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const fields = { name, info, img: img || null };
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
            <span className="gm-cat-lbl">Location</span>
            <button type="button" className="gm-close" onClick={onClose}>✕ &nbsp; Close</button>
          </div>
          <div className="adm-field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Info</label>
            <textarea value={info} onChange={(e) => setInfo(e.target.value)} style={{ minHeight: 140 }} />
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
