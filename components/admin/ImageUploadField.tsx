"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import NumberPicker from "./NumberPicker";

export default function ImageUploadField({
  name,
  initialUrl,
  label = "Image",
  sizeFieldName,
  initialSize,
  onValueChange,
}: {
  name: string;
  initialUrl?: string;
  label?: string;
  sizeFieldName?: string;
  initialSize?: { width?: number | null; height?: number | null };
  onValueChange?: (value: string) => void;
}) {
  const [url, setUrlState] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setUrl(v: string) {
    setUrlState(v);
    onValueChange?.(v);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
      });
      setUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} />
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      {uploading && <div className="adm-hint">Uploading…</div>}
      {error && <div className="adm-error">{error}</div>}
      <div className="adm-hint">…or paste an image URL directly:</div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
      />
      {url && <img src={url} alt="" className="adm-img-preview" />}
      {sizeFieldName && (
        <div className="aif-size-row">
          <div className="aif-size-field">
            <div className="adm-hint">Width (px) — 0 = auto</div>
            <NumberPicker name={`${sizeFieldName}Width`} defaultValue={initialSize?.width ?? 0} min={0} max={4000} />
          </div>
          <div className="aif-size-field">
            <div className="adm-hint">Height (px) — 0 = auto</div>
            <NumberPicker name={`${sizeFieldName}Height`} defaultValue={initialSize?.height ?? 0} min={0} max={4000} />
          </div>
        </div>
      )}
    </div>
  );
}
