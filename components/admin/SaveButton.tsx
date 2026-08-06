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
  // Synchronous guard against a fast double-click: React's `pending` state
  // (from useFormStatus, or from the `clicking` state below) only takes
  // effect after a re-render, which leaves a brief window where a second
  // click can submit the same action again before the button visually
  // disables. This ref is set on the very first click, in the same event,
  // so a near-simultaneous second click is blocked outright.
  const submitting = useRef(false);

  const pending = formId ? clicking : status.pending;

  useEffect(() => {
    if (formId) return;
    if (wasPending.current && !status.pending) {
      setShowDot(true);
      const t = setTimeout(() => setShowDot(false), 500);
      return () => clearTimeout(t);
    }
    wasPending.current = status.pending;
    if (!status.pending) submitting.current = false;
  }, [status.pending, formId]);

  function handleOptimisticClick() {
    setClicking(true);
    setTimeout(() => {
      setClicking(false);
      setShowDot(true);
      setTimeout(() => setShowDot(false), 500);
      submitting.current = false;
    }, 400);
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (submitting.current) {
      e.preventDefault();
      return;
    }
    submitting.current = true;
    if (formId) handleOptimisticClick();
  }

  return (
    <span className="save-btn-wrap">
      <button
        type="submit"
        form={formId}
        className={className}
        style={style}
        disabled={pending}
        onClick={handleClick}
      >
        {children}
      </button>
      <span className={`save-btn-dot ${showDot ? "on" : ""}`} aria-hidden="true" />
    </span>
  );
}
