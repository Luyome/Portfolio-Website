"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export default function PreviewToggle({
  children,
  renderPreview,
}: {
  children: ReactNode;
  renderPreview: () => ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <>
      <div className="adm-edit-solo">
        <div className="adm-edit-main">
          <button
            type="button"
            className="adm-preview-toggle"
            onClick={() => {
              setTheme("dark");
              setShow(true);
            }}
          >
            ◎ Preview
          </button>
          {children}
        </div>
      </div>
      {show && (
        <div className="prev-overlay">
          <div className="prev-overlay-bar">
            <div className="prev-overlay-theme">
              <button type="button" className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>
                Dark
              </button>
              <button type="button" className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>
                Light
              </button>
            </div>
            <button type="button" className="adm-preview-toggle" onClick={() => setShow(false)}>
              ✕ Close Preview
            </button>
          </div>
          <div className="prev-overlay-body theme-scope" data-theme={theme}>
            {renderPreview()}
          </div>
        </div>
      )}
    </>
  );
}
