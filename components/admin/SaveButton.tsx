"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { CSSProperties, ReactNode } from "react";

// Two usage modes:
// - Nested directly inside the <form> it saves (the common case): pending/
//   success is read from the real form status via useFormStatus.
// - Associated with a form elsewhere in the DOM via the `formId` prop (the
//   per-row admin tables, where the button lives in an "Actions" cell outside
//   the row's own <form>) — useFormStatus can't see that form's status since
//   it only tracks a React-tree ancestor, so this path shows the confirmation
//   optimistically shortly after the click instead.
export default function SaveButton({
  children = "Save",
  className = "adm-btn",
  style,
  formId,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  formId?: string;
}) {
  const status = useFormStatus();
  const [clicking, setClicking] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const wasPending = useRef(false);

  const pending = formId ? clicking : status.pending;

  useEffect(() => {
    if (formId) return;
    if (wasPending.current && !status.pending) {
      setShowDot(true);
      const t = setTimeout(() => setShowDot(false), 500);
      return () => clearTimeout(t);
    }
    wasPending.current = status.pending;
  }, [status.pending, formId]);

  function handleOptimisticClick() {
    setClicking(true);
    setTimeout(() => {
      setClicking(false);
      setShowDot(true);
      setTimeout(() => setShowDot(false), 500);
    }, 400);
  }

  return (
    <span className="save-btn-wrap">
      <button
        type="submit"
        form={formId}
        className={className}
        style={style}
        disabled={pending}
        onClick={formId ? handleOptimisticClick : undefined}
      >
        {children}
      </button>
      <span className={`save-btn-dot ${showDot ? "on" : ""}`} aria-hidden="true" />
    </span>
  );
}
