import type { ReactNode } from "react";

/** Shared structural wrapper for content create/edit forms. */
export default function AdminEditorLayout({ main, rail }: { main: ReactNode; rail: ReactNode }) {
  return (
    <div className="adm-editor-layout">
      <div className="adm-editor-main">{main}</div>
      <aside className="adm-editor-rail" aria-label="Entry settings">{rail}</aside>
    </div>
  );
}
