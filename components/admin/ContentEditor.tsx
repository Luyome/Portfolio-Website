"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export default function ContentEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleImageInsert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/admin/blob-upload" });
      const markdown = `![${file.name}](${blob.url})`;
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? value.length;
      const next = `${value.slice(0, start)}\n${markdown}\n${value.slice(end)}`;
      setValue(next);
      requestAnimationFrame(() => {
        if (!textarea) return;
        textarea.focus();
        const pos = start + markdown.length + 2;
        textarea.setSelectionRange(pos, pos);
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
        side navigation. Use the button below to insert an image at the cursor.
      </div>
      <label className="adm-content-img-btn">
        {uploading ? "Uploading…" : "+ Insert Image"}
        <input type="file" accept="image/*" onChange={handleImageInsert} disabled={uploading} hidden />
      </label>
    </div>
  );
}
