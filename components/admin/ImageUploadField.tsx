"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function ImageUploadField({
  name,
  initialUrl,
  label = "Image",
}: {
  name: string;
  initialUrl?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    </div>
  );
}
