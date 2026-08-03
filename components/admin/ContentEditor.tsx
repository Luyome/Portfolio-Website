"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { toEmbedUrl } from "@/lib/video-embed";

export default function ContentEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [videoInputOpen, setVideoInputOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertAtCursor(line: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}\n${line}\n${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const pos = start + line.length + 2;
      textarea.setSelectionRange(pos, pos);
    });
  }

  async function handleImageInsert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/admin/blob-upload" });
      insertAtCursor(`![${file.name}](${blob.url})`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleVideoInsert() {
    if (!toEmbedUrl(videoUrl)) {
      setVideoError("Doesn't look like a YouTube or Vimeo link");
      return;
    }
    insertAtCursor(`video: ${videoUrl}`);
    setVideoUrl("");
    setVideoError(null);
    setVideoInputOpen(false);
  }

  return (
    <div className="adm-field">
      <label htmlFor="content">Content</label>
      <textarea
        id="content"
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ minHeight: 260, fontFamily: "var(--M)" }}
      />
      <div className="adm-hint">
        Start a line with # to make it a heading — headings automatically show up in the reading page&apos;s
        side navigation. Use the buttons below to insert an image or a YouTube/Vimeo video at the cursor.
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
        <label className="adm-content-img-btn">
          {uploading ? "Uploading…" : "+ Insert Image"}
          <input type="file" accept="image/*" onChange={handleImageInsert} disabled={uploading} hidden />
        </label>
        {videoInputOpen ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{ width: 240 }}
            />
            <button type="button" className="adm-content-img-btn" onClick={handleVideoInsert}>Insert</button>
            <button
              type="button"
              className="adm-content-img-btn"
              onClick={() => {
                setVideoInputOpen(false);
                setVideoUrl("");
                setVideoError(null);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="adm-content-img-btn" onClick={() => setVideoInputOpen(true)}>
            + Insert Video
          </button>
        )}
      </div>
      {videoError && <div className="adm-error">{videoError}</div>}
    </div>
  );
}
