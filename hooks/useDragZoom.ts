"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const DRAG_THRESHOLD = 3;
const EDGE_SLACK = 60;

// Shared translate+scale pan/zoom mechanics: wheel = zoom in/out, holding
// the left mouse button drags the content and it stays exactly wherever
// released (no momentum). Pan is clamped so the content can never be
// dragged entirely out of view. Used by both the gallery image lightbox
// (ImageZoomOverlay) and the worldbuilding atlas (WorldbuildingAtlas).
export function useDragZoom(
  refs: { viewportRef: RefObject<HTMLElement | null>; contentRef: RefObject<HTMLElement | null> },
  { minZoom = 1, maxZoom = 5, step = 0.15 } = {}
) {
  const [zoom, setZoomState] = useState(minZoom);
  const [pan, setPanState] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(null);
  const justDraggedRef = useRef(false);
  // Two-finger pinch-to-zoom (touch only — mouse/pen never produce a second
  // simultaneous pointer). Tracked separately from dragRef: a pinch takes
  // over as soon as a second pointer lands, cancelling any single-finger
  // drag in progress, and hands back to plain single-finger panning once a
  // pointer lifts back down to one.
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{
    startDist: number;
    startZoom: number;
    startMid: { x: number; y: number };
    startPan: { x: number; y: number };
  } | null>(null);

  function clampZoom(z: number) {
    return Math.min(maxZoom, Math.max(minZoom, +z.toFixed(2)));
  }

  // Clamp so the content's scaled box can be dragged past the viewport edge
  // by at most EDGE_SLACK px — enough to inspect a corner, never enough to
  // lose the image entirely (and unrecoverably, since zooming back out alone
  // wouldn't otherwise re-center an over-panned position).
  function clampPan(x: number, y: number, z: number) {
    // `minZoom` is the canonical fitted state: the canvas itself already
    // matches the viewport and its media uses object-fit. Leaving even the
    // normal edge slack here lets an old pan survive after zooming back out,
    // which crops the supposedly full-map framing.
    if (z <= minZoom) return { x: 0, y: 0 };
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

  // Attached as a native, non-passive listener rather than JSX `onWheel` —
  // React attaches wheel listeners passively at the root by default, so
  // `e.preventDefault()` inside a synthetic onWheel handler is silently
  // ignored and the page scrolls underneath the zoomed content. zoomBy only
  // reads state through functional updaters / stable refs, so it stays
  // correct even though this effect subscribes once on mount.
  useEffect(() => {
    const vp = refs.viewportRef.current;
    if (!vp) return;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? -step : step);
    }
    vp.addEventListener("wheel", handleWheel, { passive: false });
    return () => vp.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- zoomBy/step are stable in effect via functional updaters; see comment above
  }, []);

  // A fullscreen viewer can resize while open (orientation changes, browser
  // chrome changes, desktop window resize). Re-clamp against the current box;
  // at the fit scale this also deterministically restores the centred frame.
  useEffect(() => {
    const vp = refs.viewportRef.current;
    if (!vp || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setPanState((p) => clampPan(p.x, p.y, zoom));
    });
    observer.observe(vp);
    return () => observer.disconnect();
  // `zoom` intentionally drives the latest canonical fit/bounds.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  function beginDrag(clientX: number, clientY: number) {
    if (zoom <= minZoom) return;
    dragRef.current = { startX: clientX, startY: clientY, panX: pan.x, panY: pan.y, moved: false };
  }

  function moveDrag(clientX: number, clientY: number, primaryPressed: boolean) {
    const drag = dragRef.current;
    if (!drag) return;
    if (!primaryPressed) {
      dragRef.current = null;
      return;
    }
    const dx = clientX - drag.startX;
    const dy = clientY - drag.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) drag.moved = true;
    setPan(drag.panX + dx, drag.panY + dy, zoom);
  }

  function onMouseDown(e: React.MouseEvent) { beginDrag(e.clientX, e.clientY); }
  function onMouseMove(e: React.MouseEvent) { moveDrag(e.clientX, e.clientY, (e.buttons & 1) !== 0); }

  function pointerDist(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function pointerMid(a: { x: number; y: number }, b: { x: number; y: number }) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointersRef.current.size === 2) {
      dragRef.current = null;
      const [a, b] = [...activePointersRef.current.values()];
      pinchRef.current = { startDist: pointerDist(a, b), startZoom: zoom, startMid: pointerMid(a, b), startPan: { ...pan } };
      return;
    }
    beginDrag(e.clientX, e.clientY);
    if (zoom > minZoom) e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (activePointersRef.current.has(e.pointerId)) activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointersRef.current.size === 2 && pinchRef.current) {
      const { startDist, startZoom, startMid, startPan } = pinchRef.current;
      const [a, b] = [...activePointersRef.current.values()];
      const newZoom = clampZoom(startZoom * (pointerDist(a, b) / startDist));
      setZoomState(newZoom);
      const mid = pointerMid(a, b);
      setPan(startPan.x + (mid.x - startMid.x), startPan.y + (mid.y - startMid.y), newZoom);
      return;
    }
    moveDrag(e.clientX, e.clientY, e.buttons !== 0 || e.pointerType === "touch");
  }
  function onPointerUp(e: React.PointerEvent) {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) pinchRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    onMouseUp();
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

  return { zoom, pan, zoomBy, reset, onMouseDown, onMouseMove, onMouseUp, onPointerDown, onPointerMove, onPointerUp, wasDragging, minZoom, maxZoom };
}
