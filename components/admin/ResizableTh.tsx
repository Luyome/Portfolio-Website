"use client";

import { useRef } from "react";

export default function ResizableTh({ children }: { children: React.ReactNode }) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLSpanElement>) {
    const th = thRef.current;
    if (!th) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: th.getBoundingClientRect().width };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (!dragRef.current || !thRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    thRef.current.style.width = `${Math.max(60, dragRef.current.startWidth + delta)}px`;
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <th ref={thRef} className="adm-th-resizable">
      {children}
      <span
        className="adm-col-resize-handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </th>
  );
}
