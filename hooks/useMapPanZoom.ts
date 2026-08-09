"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MAX_ZOOM = 3;
const MIN_ZOOM = 1;
// A real mouse/trackpad click, unlike a scripted zero-motion one, almost
// always carries a few pixels of incidental movement between press and
// release. 3px was tight enough that an ordinary click could occasionally
// get misclassified as a pan, which — for MapEditor's "click to place a new
// pin" flow (gated on this same drag/click distinction) — silently dropped
// the click with no error and no visible feedback. Widened to a still-small
// but more forgiving distance that doesn't make deliberate small pans feel
// unresponsive.
const DRAG_THRESHOLD = 6;

export function useMapPanZoom(viewportRef: React.RefObject<HTMLDivElement | null>, imageUrl?: string | null) {
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

    // Reset first so switching maps never leaves the previous map's ratio
    // (and the stale, differently-shaped canvas it produces) applied while
    // the new <img> is still loading. Zoom/scroll reset the same way -- a
    // zoomed-in, panned view of Map A must not carry over and silently
    // misplace where a click on Map B lands.
    setAspectRatio(null);
    setZoomRaw(MIN_ZOOM);
    vp.scrollLeft = 0;
    vp.scrollTop = 0;

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
  }, [viewportRef, imageUrl]);

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

  // Pointer Events (not mouse-only) so viewport pan/zoom works with touch —
  // matching the pin drag/place handlers on the same canvas, which already
  // used Pointer Events (Task 4.1 finding; Task 4.7 fixes this gap). Pointer
  // capture keeps the drag tracking even if the finger/cursor leaves the
  // viewport mid-gesture, same guarantee `onMouseUp`'s window-release check
  // used to approximate for mouse only.
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const vp = viewportRef.current;
    if (!vp) return;
    // setPointerCapture can throw (e.g. the pointer was already released by
    // the time this handler runs) — an uncaught throw here would abort the
    // rest of this handler, silently leaving dragRef unset and breaking the
    // press that triggered it.
    try {
      vp.setPointerCapture(e.pointerId);
    } catch {
      // Fall through — panning/click-through-viewport still works without
      // capture, it just won't survive the pointer leaving the viewport.
    }
    dragRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: vp.scrollLeft, scrollTop: vp.scrollTop, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
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

  function onPointerUp(e: React.PointerEvent) {
    const vp = viewportRef.current;
    if (vp?.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
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

  return {
    zoom,
    setZoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    aspectRatio,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    wasPanning,
  };
}
