"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";

const DRAG_THRESHOLD = 3;
const EDGE_SLACK = 60;

// Shared translate+scale pan/zoom mechanics for fullscreen image viewers:
// wheel = zoom in/out, holding the left mouse button drags the image and it
// stays exactly wherever released (no momentum). Pan is clamped so the
// content can never be dragged entirely out of view. Used by both the
// gallery image lightbox (ImageZoomOverlay) and the map explorer
// (MapZoomOverlay).
export function useDragZoom(
  refs: { viewportRef: RefObject<HTMLElement | null>; contentRef: RefObject<HTMLElement | null> },
  { minZoom = 1, maxZoom = 5, step = 0.15 } = {}
) {
  const [zoom, setZoomState] = useState(minZoom);
  const [pan, setPanState] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(null);
  const justDraggedRef = useRef(false);

  function clampZoom(z: number) {
    return Math.min(maxZoom, Math.max(minZoom, +z.toFixed(2)));
  }

  // Clamp so the content's scaled box can be dragged past the viewport edge
  // by at most EDGE_SLACK px — enough to inspect a corner, never enough to
  // lose the image entirely (and unrecoverably, since zooming back out alone
  // wouldn't otherwise re-center an over-panned position).
  function clampPan(x: number, y: number, z: number) {
    const vp = refs.viewportRef.current;
    const content = refs.contentRef.current;
    if (!vp || !content) return { x, y };
    const overflowX = Math.max(0, (content.offsetWidth * z - vp.clientWidth) / 2) + EDGE_SLACK;
    const overflowY = Math.max(0, (content.offsetHeight * z - vp.clientHeight) / 2) + EDGE_SLACK;
    return {
      x: Math.min(overflowX, Math.max(-overflowX, x)),
      y: Math.min(overflowY, Math.max(-overflowY, y)),
    };
  }

  function setPan(x: number, y: number, z: number) {
    setPanState(clampPan(x, y, z));
  }

  function reset() {
    setZoomState(minZoom);
    setPanState({ x: 0, y: 0 });
  }

  function zoomBy(delta: number) {
    setZoomState((z) => {
      const next = clampZoom(z + delta);
      // Re-clamp the existing pan against the new zoom level — without this,
      // panning near the edge at high zoom and then zooming back out could
      // leave the content stuck outside the viewport with no way back.
      setPanState((p) => clampPan(p.x, p.y, next));
      return next;
    });
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? -step : step);
  }

  function onMouseDown(e: React.MouseEvent) {
    if (zoom <= minZoom) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false };
  }

  function onMouseMove(e: React.MouseEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    if ((e.buttons & 1) === 0) {
      dragRef.current = null;
      return;
    }
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) drag.moved = true;
    setPan(drag.panX + dx, drag.panY + dy, zoom);
  }

  function onMouseUp() {
    if (dragRef.current?.moved) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
    }
    dragRef.current = null;
  }

  function wasDragging() {
    return justDraggedRef.current;
  }

  return { zoom, pan, zoomBy, reset, onWheel, onMouseDown, onMouseMove, onMouseUp, wasDragging, minZoom, maxZoom };
}
