"use client";

import type { ReactNode } from "react";

export default function PreviewPane({ render }: { render: () => ReactNode }) {
  return (
    <div className="prev-pane">
      <div className="prev-col">
        <div className="prev-label">Dark Theme</div>
        <div className="theme-scope" data-theme="dark">{render()}</div>
      </div>
      <div className="prev-col">
        <div className="prev-label">Light Theme</div>
        <div className="theme-scope" data-theme="light">{render()}</div>
      </div>
    </div>
  );
}
