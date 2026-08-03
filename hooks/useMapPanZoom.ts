"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MAX_ZOOM = 3;
const MIN_ZOOM = 1;
const DRAG_THRESHOLD = 3;

export function useMapPanZoom(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [zoom, setZoomRaw] = useState(MIN_ZOOM);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number; moved: boolean } | null>(null);
  const justPannedRef = useRef(false);
  // Captured right before a zoom change so the layout effect below can keep
  // the same canvas-space point pinned under the same viewport-space point
  // (the cursor for wheel zoom, the viewport center for the +/-/reset buttons)
  // instead of letting the browser reset scroll to whatever it feels like.
  const zoomAnchorRef = useRef<{ vpX: number; vpY: number; scrollLeft: number; scrollTop: number; zoom: number } | null>(null);
  // The wheel listener below is attached once and never re-subscribed, so it
  // can't close over a fresh `zoom` each render — read it from a ref instead.
  const zoomRef = useRef(zoom);
  useLayoutEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  function captureZoomAnchor(vpX: number, vpY: number) {
    const vp = viewportRef.current;
    if (!vp) return;
    zoomAnchorRef.current = { vpX, vpY, scrollLeft: vp.scrollLeft, scrollTop: vp.scrollTop, zoom: zoomRef.current };
  }

  function setZoom(updater: React.SetStateAction<number>) {
    const vp = viewportRef.current;
    if (vp) captureZoomAnchor(vp.clientWidth / 2, vp.clientHeight / 2);
    setZoomRaw(updater);
  }

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    const anchor = zoomAnchorRef.current;
    zoomAnchorRef.current = null;
    if (!vp || !anchor || anchor.zoom === zoom) return;
    const canvasX = (anchor.scrollLeft + anchor.vpX) / anchor.zoom;
    const canvasY = (anchor.scrollTop + anchor.vpY) / anchor.zoom;
    vp.scrollLeft = canvasX * zoom - anchor.vpX;
    vp.scrollTop = canvasY * zoom - anchor.vpY;
  }, [zoom, viewportRef]);

  // The viewport's own box is shaped to match the image's aspect ratio
  // (applied by the consumer as CSS `aspect-ratio`), rather than fitting the
  // image into a fixed-shape box — so it always fills edge-to-edge with no
  // letterbox gap on either axis, regardless of the image's proportions.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function computeAspectRatio() {
      const img = vp!.querySelector<HTMLImageElement>("img.map-image");
      if (!img || !img.naturalWidth || !img.naturalHeight) return;
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }

    const img = vp.querySelector("img.map-image") as HTMLImageElement | null;
    if (img && !img.complete) {
      img.addEventListener("load", computeAspectRatio);
    } else {
      computeAspectRatio();
    }
    return () => {
      if (img) img.removeEventListener("load", computeAspectRatio);
    };
  }, [viewportRef]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = vp!.getBoundingClientRect();
      captureZoomAnchor(e.clientX - rect.left, e.clientY - rect.top);
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomRaw((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));
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

  return { zoom, setZoom, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, aspectRatio, onMouseDown, onMouseMove, onMouseUp, wasPanning };
}
