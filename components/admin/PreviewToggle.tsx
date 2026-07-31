"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import PreviewPane from "./PreviewPane";

export default function PreviewToggle({
  children,
  renderPreview,
}: {
  children: ReactNode;
  renderPreview: () => ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`adm-edit-layout ${show ? "" : "adm-edit-layout-solo"}`}>
      <div className="adm-edit-main">
        <button type="button" className="adm-preview-toggle" onClick={() => setShow((s) => !s)}>
          {show ? "✕ Hide Preview" : "◎ Preview"}
        </button>
        {children}
      </div>
      {show && <PreviewPane render={renderPreview} />}
    </div>
  );
}
