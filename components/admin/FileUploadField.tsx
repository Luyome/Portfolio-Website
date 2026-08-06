"use client";

import { useId, useState } from "react";
import { upload } from "@vercel/blob/client";
import { acceptAttrFor, checkUpload, describeUploadPolicy, type UploadCategory } from "@/lib/upload-policy";

export default function FileUploadField({
  name,
  initialUrl,
  label = "File",
  formId,
  hideUrlInput = false,
  category,
}: {
  name: string;
  initialUrl?: string;
  label?: string;
  formId?: string;
  hideUrlInput?: boolean;
  /** Which upload-policy category this field accepts — picks the server route's allow-list and size limit. */
  category: UploadCategory;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file after a failed attempt.
    e.target.value = "";
    if (!file) return;
    setError(null);
    const check = checkUpload(category, file.name, file.size);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(check.fileName, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload-file",
        contentType: check.contentType,
        clientPayload: category,
      });
      setUrl(blob.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      <input type="hidden" name={name} value={url} form={formId} readOnly />
      <input
        type="file"
        accept={acceptAttrFor(category)}
        onChange={handleFile}
        disabled={uploading}
        aria-describedby={error ? errorId : undefined}
      />
      <div className="adm-hint">{describeUploadPolicy(category)}</div>
      {uploading && <div className="adm-hint">Uploading…</div>}
      {error && <div id={errorId} className="adm-error" role="alert">{error}</div>}
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
