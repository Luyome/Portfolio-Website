"use client";

import { useState, useTransition } from "react";
import { setForceDarkMode } from "@/lib/actions/settings";

export default function ForceDarkModeToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      await setForceDarkMode(next);
    });
  }

  return (
    <div className="adm-section-panel adm-darkmode-card">
      <div className="adm-chart-title">Dark Mode Only</div>
      <p className="adm-hint" style={{ marginBottom: 16 }}>
        When enabled, the whole site and admin panel are locked to dark mode — the light/dark
        switch icon is hidden everywhere. Turn it off to restore normal theme switching.
      </p>
      <button
        type="button"
        className={`adm-toggle-btn ${on ? "on" : ""}`}
        onClick={toggle}
        disabled={pending}
        aria-pressed={on}
      >
        <span className="adm-toggle-dot" />
        Dark Mode Only: {on ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}
