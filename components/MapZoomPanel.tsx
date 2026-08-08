"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDragZoom } from "@/hooks/useDragZoom";
import { useModalFocus } from "@/hooks/useModalFocus";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MAP_ZOOM_MAX, MAP_ZOOM_MIN, getChildMaps, groupByIconType, visibleMarkersAtZoom } from "@/lib/map-zoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// This panel's own pixel zoom range (wheel/pinch/+/-), independent of the
// abstract 1-5 semantic scale markers are authored against — see
// lib/map-zoom.ts. Normalized to that scale below before any
// visibility/priority decision, per Task 4.5's documented contract.
const EXPLORER_MIN_ZOOM = 1;
const EXPLORER_MAX_ZOOM = 4;

function toSemanticZoom(viewerZoom: number): number {
  const t = (viewerZoom - EXPLORER_MIN_ZOOM) / (EXPLORER_MAX_ZOOM - EXPLORER_MIN_ZOOM);
  return MAP_ZOOM_MIN + t * (MAP_ZOOM_MAX - MAP_ZOOM_MIN);
}

function iconTypeLabel(iconType: string): string {
  return iconType.length ? iconType[0].toUpperCase() + iconType.slice(1) : iconType;
}

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
    { minZoom: EXPLORER_MIN_ZOOM, maxZoom: EXPLORER_MAX_ZOOM }
  );
  const [pinDetail, setPinDetail] = useState<MapLocation | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [fitFrame, setFitFrame] = useState<{ width: number; height: number; left: number; top: number } | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Render nothing during SSR and the first hydration pass. The portal is
  // then mounted only in the browser, avoiding a server/client tree mismatch.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Focus goes to the pin-detail panel while it's open (it visually and
  // functionally sits on top), and back to the map panel once it closes.
  useModalFocus(!pinDetail, overlayRef);
  useModalFocus(!!pinDetail, pinPanelRef);

  const mapsById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);
  const currentMap = mapsById.get(currentMapId) ?? null;

  const pins = useMemo(() => locations.filter((l) => l.mapId === currentMapId), [locations, currentMapId]);

  const semanticZoom = useMemo(() => toSemanticZoom(zoom), [zoom]);
  const visiblePins = useMemo(() => visibleMarkersAtZoom(pins, semanticZoom), [pins, semanticZoom]);

  // Compact legend: only worth showing when the current map actually mixes
  // more than one marker category — a single-group legend would just repeat
  // what's already obvious on the map. Grouped by iconType (Task 4.5's
  // decision: no dedicated layer column, iconType is the category).
  const iconGroups = useMemo(() => groupByIconType(pins), [pins]);

  const childMaps = useMemo(() => getChildMaps(maps, currentMapId), [maps, currentMapId]);

  // 100% is the actual artwork contained within the actual fullscreen box.
  // Markers use this measured frame too, so no artwork edge can be cropped.
  const updateFitFrame = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !imageSize) return;
    const scaleX = viewport.clientWidth / imageSize.width;
    const scaleY = viewport.clientHeight / imageSize.height;
    const fitScale = Math.min(scaleX, scaleY);
    const width = imageSize.width * fitScale;
    const height = imageSize.height * fitScale;
    setFitFrame({ width, height, left: (viewport.clientWidth - width) / 2, top: (viewport.clientHeight - height) / 2 });
  }, [imageSize]);

  useEffect(() => {
    updateFitFrame();
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateFitFrame);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [updateFitFrame]);

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
  if (!isMounted) return null;

  return createPortal(
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
      <div className="mzp-topleft">
        <nav className="mzp-breadcrumb" aria-label="Map location">
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

        {childMaps.length > 0 && (
          <nav className="mzp-submaps" aria-label="Submaps">
            <span className="mzp-submaps-label">Submaps</span>
            {childMaps.map((m) => (
              <button type="button" key={m.id} className="mzp-submap-link" onClick={() => goToMap(m.id)}>
                {m.title} ›
              </button>
            ))}
          </nav>
        )}

        {iconGroups.size > 1 && (
          <ul className="mzp-legend" aria-label="Marker categories">
            {[...iconGroups.keys()].map((iconType) => (
              <li key={iconType} className={`mzp-legend-item map-pin-icon-${iconType}`}>
                <span className="map-pin-dot" aria-hidden="true" />
                {iconTypeLabel(iconType)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="iz-controls mzp-controls">
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
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 1.05 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
          >
            <div
              className="mzp-canvas"
              ref={contentRef}
              style={{
                width: fitFrame?.width,
                height: fitFrame?.height,
                left: fitFrame?.left,
                top: fitFrame?.top,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {currentMap.imageUrl ? (
                <img
                  src={currentMap.imageUrl}
                  alt={currentMap.title}
                  className="mzp-img"
                  draggable={false}
                  onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                />
              ) : (
                <div className="wa-img-empty">No map image uploaded yet.</div>
              )}
              {visiblePins.map((loc) => (
                <button
                  type="button"
                  key={loc.id}
                  className={`map-pin map-pin-${loc.pinType} map-pin-icon-${loc.iconType}`}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  onClick={() => handlePinClick(loc)}
                  aria-label={loc.pinType === "submap" ? `Open ${loc.name} submap` : `View ${loc.name}`}
                >
                  <span className="map-pin-dot" />
                  <span className="map-pin-label" aria-hidden="true">{loc.name}</span>
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
    </div>,
    document.body
  );
}
