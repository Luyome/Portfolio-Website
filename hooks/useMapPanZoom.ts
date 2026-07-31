"use client";

import { useEffect, useRef, useState } from "react";

const MAX_ZOOM = 3;
const MIN_ZOOM = 1;
const DRAG_THRESHOLD = 3;

export function useMapPanZoom(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [fitSize, setFitSize] = useState<{ width: number; height: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number; moved: boolean } | null>(null);
  const justPannedRef = useRef(false);

  // At 100% zoom the whole map image must fit entirely inside the viewport
  // (contain-fit against the image's real aspect ratio), so it's computed
  // from the image's natural size rather than relying on a fixed CSS width.
  // Zooming only ever goes up from there — 100% is the floor.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function computeFit() {
      const img = vp!.querySelector<HTMLImageElement>("img.map-image");
      if (!img || !img.naturalWidth || !img.naturalHeight) return;
      const availW = vp!.clientWidth - 80;
      const availH = vp!.clientHeight - 80;
      const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
      setFitSize({ width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale) });
    }

    const img = vp.querySelector("img.map-image") as HTMLImageElement | null;
    if (img && !img.complete) {
      img.addEventListener("load", computeFit);
    } else {
      computeFit();
    }
    window.addEventListener("resize", computeFit);
    return () => {
      if (img) img.removeEventListener("load", computeFit);
      window.removeEventListener("resize", computeFit);
    };
  }, [viewportRef]);

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
    if ((e.buttons & 1) === 0) {
      // Left button was released without a mouseup ever reaching us (e.g. released
      // outside the window) — stop panning instead of continuing to drag forever.
      dragRef.current = null;
      return;
    }
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

  return { zoom, setZoom, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, fitSize, onMouseDown, onMouseMove, onMouseUp, wasPanning };
}
