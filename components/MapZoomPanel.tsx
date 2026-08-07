"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDragZoom } from "@/hooks/useDragZoom";
import { useModalFocus } from "@/hooks/useModalFocus";
import type { MapLocation, WorldMap } from "@/lib/map-types";

const NO_IMAGE_SVG =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23151010"/><text fill="%23555" x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".35em">No Image</text></svg>';

// Fullscreen pan/zoom exploration for the world map -- opened by clicking the
// static preview in WorldbuildingAtlas. All the interactive map behavior
// (submap navigation, pin clicks, wheel-zoom/drag-pan) lives here now; the
// embedded preview on the page is just a static, non-interactive thumbnail.
export default function MapZoomPanel({
  maps,
  locations,
  initialMapId,
  onOpenLore,
  onClose,
}: {
  maps: WorldMap[];
  locations: MapLocation[];
  initialMapId: number;
  onOpenLore: (entryId: number) => void;
  onClose: () => void;
}) {
  const [currentMapId, setCurrentMapId] = useState(initialMapId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pinPanelRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onPointerDown, onPointerMove, onPointerUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: 1, maxZoom: 4 }
  );
  const [pinDetail, setPinDetail] = useState<MapLocation | null>(null);

  // Focus goes to the pin-detail panel while it's open (it visually and
  // functionally sits on top), and back to the map panel once it closes.
  useModalFocus(!pinDetail, overlayRef);
  useModalFocus(!!pinDetail, pinPanelRef);

  const mapsById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);
  const currentMap = mapsById.get(currentMapId) ?? null;

  const pins = useMemo(() => locations.filter((l) => l.mapId === currentMapId), [locations, currentMapId]);

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
      setPinDetail(loc);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (pinDetail) setPinDetail(null);
        else onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pinDetail]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!currentMap) return null;

  return (
    <div
      className="mz-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${currentMap.title} map`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <nav className="mzp-breadcrumb">
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

      <div className="iz-controls">
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-0.25)}>−</button>
        <span className="iz-zoom-label">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.25)}>+</button>
        <button type="button" onClick={reset}>Reset</button>
        <button type="button" className="iz-close" onClick={onClose}>✕ Close</button>
      </div>

      <div
        className="mzp-viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: zoom > minZoom ? "grab" : "default" }}
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
            <div
              className="mzp-canvas"
              ref={contentRef}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              {currentMap.imageUrl ? (
                <img src={currentMap.imageUrl} alt={currentMap.title} className="mzp-img" draggable={false} />
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
          <div className="pin-panel" ref={pinPanelRef} role="dialog" aria-modal="true" aria-labelledby="pin-detail-title">
            <div className="pin-img-side">
              <img src={pinDetail.img || NO_IMAGE_SVG} alt={pinDetail.img ? pinDetail.name : ""} />
            </div>
            <div className="gm-info pin-info-side">
              <div className="gm-bar">
                <span className="gm-cat-lbl">Location</span>
                <button type="button" className="gm-close" onClick={() => setPinDetail(null)}>✕ &nbsp; Close</button>
              </div>
              <div className="gm-title" id="pin-detail-title">{pinDetail.name}</div>
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
