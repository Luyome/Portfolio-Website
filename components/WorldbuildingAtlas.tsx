"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDragZoom } from "@/hooks/useDragZoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

export default function WorldbuildingAtlas({
  maps,
  locations,
  onOpenLore,
}: {
  maps: WorldMap[];
  locations: MapLocation[];
  onOpenLore: (entryId: number) => void;
}) {
  const rootMap = useMemo(() => maps.find((m) => m.parentMapId === null) ?? maps[0] ?? null, [maps]);
  const [currentMapId, setCurrentMapId] = useState<number | null>(rootMap?.id ?? null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onMouseDown, onMouseMove, onMouseUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: 1, maxZoom: 4 }
  );
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<{ w: number; h: number; pad: number } | null>(null);
  const [pinDetail, setPinDetail] = useState<MapLocation | null>(null);

  const mapsById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);
  const currentMap = currentMapId !== null ? mapsById.get(currentMapId) ?? null : null;

  // Reset so the previous map's size/ratio never gets briefly applied to a
  // new, differently-shaped one before its own image reports in. Can't do
  // the "already loaded/cached" check here keyed off currentMapId: with
  // AnimatePresence mode="wait", the new map's <img> doesn't mount until the
  // old one's exit animation finishes, so at the moment this fires the ref
  // would still point at the OLD (exiting) image. Use a stable ref callback
  // on the <img> itself instead (below) -- React invokes it exactly on that
  // element's own mount/unmount, not on every render, so it can't loop.
  //
  // Skip the very first run: this effect also fires on initial mount (any
  // useEffect with deps does), but ref callbacks commit *before* useEffect
  // runs -- so if the first map's image is already cached/complete,
  // handleImgRef below will have already set naturalSize correctly by the
  // time this runs, and unconditionally clearing here would immediately
  // wipe that out.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setNaturalSize(null);
    setFrame(null);
  }, [currentMapId]);

  const handleImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth && el.naturalHeight) {
      setNaturalSize((prev) => (prev && prev.w === el.naturalWidth && prev.h === el.naturalHeight ? prev : { w: el.naturalWidth, h: el.naturalHeight }));
    }
  }, []);

  // The frame's own box (not just the image inside it) has to be sized in
  // JS, not pure CSS: an equal pixel gap on all four sides only works out to
  // an exact (no-letterbox) fit if the frame's *outer* aspect ratio already
  // accounts for the padding being subtracted from it -- and that relationship
  // depends on the actual available width, so a static CSS aspect-ratio can't
  // express it. Solve `(availW - 2*pad) / (availH - 2*pad) = imageRatio` for
  // the frame's height (or, once capped by maxH, for its width instead).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!naturalSize || !wrap) return;
    function recompute() {
      const cs = getComputedStyle(wrap!);
      const availW = wrap!.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!availW) return;
      const pad = Math.min(48, Math.max(20, availW * 0.035));
      const maxH = window.innerHeight * 0.7;
      const ratio = naturalSize!.w / naturalSize!.h;
      let w = availW;
      let h = (availW - 2 * pad) / ratio + 2 * pad;
      if (h > maxH) {
        h = maxH;
        w = (maxH - 2 * pad) * ratio + 2 * pad;
      }
      // Bail out with the same object reference when nothing actually moved
      // (rounding to whole px) -- ResizeObserver firing on a computed style
      // change that happens to round to the same size would otherwise still
      // produce a "new" state object and re-render forever.
      setFrame((prev) => {
        if (prev && Math.round(prev.w) === Math.round(w) && Math.round(prev.h) === Math.round(h) && Math.round(prev.pad) === Math.round(pad)) {
          return prev;
        }
        return { w, h, pad };
      });
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrap);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [naturalSize]);

  const pins = useMemo(
    () => (currentMapId === null ? [] : locations.filter((l) => l.mapId === currentMapId)),
    [locations, currentMapId]
  );

  const breadcrumb = useMemo(() => {
    const chain: WorldMap[] = [];
    let m = currentMap;
    while (m) {
      chain.unshift(m);
      m = m.parentMapId !== null ? mapsById.get(m.parentMapId) ?? null : null;
    }
    return chain;
  }, [currentMap, mapsById]);

  function goToMap(id: number) {
    reset();
    setCurrentMapId(id);
  }

  function handlePinClick(loc: MapLocation) {
    if (wasDragging()) return;
    if (loc.pinType === "submap" && loc.targetMapId !== null) {
      goToMap(loc.targetMapId);
    } else if (loc.entryId !== null) {
      onOpenLore(loc.entryId);
    } else if (loc.info.trim() || loc.img) {
      // Lore pins can skip linking to a formal Lore Entry and just carry
      // freeform info/image instead — show that here since onOpenLore only
      // knows how to open entries by id.
      setPinDetail(loc);
    }
  }

  if (!currentMap) {
    return <div className="wa-empty">No map has been configured yet.</div>;
  }

  return (
    <div className="wa-wrap" ref={wrapRef}>
      <div className="wa-topbar">
        <nav className="wa-breadcrumb">
          {breadcrumb.map((m, i) => (
            <span className="wa-crumb-item" key={m.id}>
              {i > 0 && <span className="wa-crumb-sep">›</span>}
              {i === breadcrumb.length - 1 ? (
                <span className="wa-crumb-current">{m.title}</span>
              ) : (
                <button type="button" className="wa-crumb-link" onClick={() => goToMap(m.id)}>
                  {m.title}
                </button>
              )}
            </span>
          ))}
        </nav>
        <div className="wa-controls">
          {currentMap.parentMapId !== null && (
            <button type="button" className="wa-zoom-out" onClick={() => goToMap(currentMap.parentMapId!)}>
              ← Zoom Out
            </button>
          )}
          <button type="button" onClick={() => zoomBy(-0.25)}>−</button>
          <span className="wa-zoom-label">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomBy(0.25)}>+</button>
        </div>
      </div>

      <div
        className="wa-viewport"
        ref={viewportRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          cursor: zoom > minZoom ? "grab" : "default",
          width: frame ? frame.w : undefined,
          height: frame ? frame.h : undefined,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentMap.id}
            className="wa-transition"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="wa-frame-inner" style={{ inset: frame ? frame.pad : undefined }}>
              <div
                className="wa-canvas"
                ref={contentRef}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              >
                {currentMap.imageUrl ? (
                  <img
                    src={currentMap.imageUrl}
                    alt={currentMap.title}
                    className="wa-img"
                    draggable={false}
                    ref={handleImgRef}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth && img.naturalHeight) {
                        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                      }
                    }}
                  />
                ) : (
                  <div className="wa-img-empty">No map image uploaded yet.</div>
                )}
                {pins.map((loc) => (
                  <button
                    type="button"
                    key={loc.id}
                    className={`map-pin map-pin-${loc.pinType} map-pin-icon-${loc.iconType}`}
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                    onClick={() => handlePinClick(loc)}
                  >
                    <span className="map-pin-dot" />
                    <span className="map-pin-label">{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {pinDetail && (
        <div
          className="gm-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPinDetail(null);
          }}
        >
          <div className="pin-panel">
            <div className="pin-img-side">
              <img src={pinDetail.img || NO_IMAGE_SVG} alt={pinDetail.name} />
            </div>
            <div className="gm-info pin-info-side">
              <div className="gm-bar">
                <span className="gm-cat-lbl">Location</span>
                <button type="button" className="gm-close" onClick={() => setPinDetail(null)}>✕ &nbsp; Close</button>
              </div>
              <div className="gm-title">{pinDetail.name}</div>
              {pinDetail.info.trim() && (
                <div className="gm-desc-wrap">
                  <div className="gm-desc">{pinDetail.info}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
