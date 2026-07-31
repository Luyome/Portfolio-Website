"use client";

import { useEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const DRAG_THRESHOLD = 3;

export function useMapPanZoom(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number; moved: boolean } | null>(null);
  const justPannedRef = useRef(false);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));
    }
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [viewportRef]);

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    const vp = viewportRef.current;
    if (!vp) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: vp.scrollLeft, scrollTop: vp.scrollTop, moved: false };
  }

  function onMouseMove(e: React.MouseEvent) {
    const drag = dragRef.current;
    const vp = viewportRef.current;
    if (!drag || !vp) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) drag.moved = true;
    if (drag.moved) {
      vp.scrollLeft = drag.scrollLeft - dx;
      vp.scrollTop = drag.scrollTop - dy;
    }
  }

  function onMouseUp() {
    if (dragRef.current?.moved) {
      justPannedRef.current = true;
      setTimeout(() => {
        justPannedRef.current = false;
      }, 0);
    }
    dragRef.current = null;
  }

  function wasPanning() {
    return justPannedRef.current;
  }

  return { zoom, setZoom, onMouseDown, onMouseMove, onMouseUp, wasPanning };
}
