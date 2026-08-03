"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function FileUploadField({
  name,
  initialUrl,
  label = "File",
  formId,
  hideUrlInput = false,
  accept,
}: {
  name: string;
  initialUrl?: string;
  label?: string;
  formId?: string;
  hideUrlInput?: boolean;
  accept?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
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
        handleUploadUrl: "/api/admin/blob-upload-file",
      });
      setUrl(blob.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} form={formId} readOnly />
      <input type="file" accept={accept} onChange={handleFile} disabled={uploading} />
      {uploading && <div className="adm-hint">Uploading…</div>}
      {error && <div className="adm-error">{error}</div>}
      {!hideUrlInput && (
        <>
          <div className="adm-hint">…or paste a download URL directly:</div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setFileName(null);
            }}
            placeholder="https://... or upload a file above"
          />
        </>
      )}
      {fileName && <div className="adm-hint">Uploaded: {fileName}</div>}
    </div>
  );
}
