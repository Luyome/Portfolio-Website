"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDragZoom } from "@/hooks/useDragZoom";
import { useModalFocus } from "@/hooks/useModalFocus";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import WorldMapArtwork from "./WorldMapArtwork";
import MediaLightbox from "./shared/MediaLightbox";
import { MAP_ZOOM_MAX, MAP_ZOOM_MIN, getChildMaps, groupByIconType, resolvePinTarget, visibleMarkersAtZoom } from "@/lib/map-zoom";
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

// Fullscreen pan/zoom exploration for the world map -- opened by clicking the
// static preview in WorldbuildingAtlas. All the interactive map behavior
// (submap navigation, pin clicks, wheel-zoom/drag-pan) lives here now; the
// embedded preview on the page is just a static, non-interactive thumbnail.
export default function MapZoomPanel({
  maps,
  locations,
  initialMapId,
  initialPinId,
  onOpenLore,
  onClose,
}: {
  maps: WorldMap[];
  locations: MapLocation[];
  initialMapId: number;
  // Set by another surface (Home, the Worldbuilding static preview) that
  // resolved a click on an info-only pin to this same panel, so the pin's
  // detail opens immediately instead of a plain, unfocused map view — the
  // canonical detail experience for that pin stays identical everywhere.
  initialPinId?: number | null;
  onOpenLore: (entryId: number) => void;
  onClose: () => void;
}) {
  const [currentMapId, setCurrentMapId] = useState(initialMapId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onPointerDown, onPointerMove, onPointerUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: EXPLORER_MIN_ZOOM, maxZoom: EXPLORER_MAX_ZOOM }
  );
  const [pinDetail, setPinDetail] = useState<MapLocation | null>(
    () => (initialPinId != null ? locations.find((l) => l.id === initialPinId) ?? null : null)
  );
  const reducedMotion = usePrefersReducedMotion();
  // Render nothing during SSR and the first hydration pass. The portal is
  // then mounted only in the browser, avoiding a server/client tree mismatch.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Focus goes to the pin-detail lightbox while it's open (it owns its own
  // focus trap — see MediaLightbox), and back to the map panel once it closes.
  useModalFocus(!pinDetail, overlayRef);

  const mapsById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);
  const mapIds = useMemo(() => new Set(maps.map((m) => m.id)), [maps]);
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
    const action = resolvePinTarget(loc, mapIds);
    if (action.kind === "submap") goToMap(action.mapId);
    else if (action.kind === "entry") onOpenLore(action.entryId);
    else if (action.kind === "info") setPinDetail(action.location);
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
    const scrollY = window.scrollY;
    const prevRootOverflow = document.documentElement.style.overflow;
    const prevOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevRootOverflow;
      document.body.style.overflow = prevOverflow;
      window.scrollTo(0, scrollY);
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
            <WorldMapArtwork
              ref={contentRef}
              map={currentMap}
              locations={visiblePins}
              className="wma-fullscreen"
              transform={`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}
              interactive
              onMarkerClick={handlePinClick}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {pinDetail && (
        <MediaLightbox
          items={[{
            img: pinDetail.img,
            title: pinDetail.name,
            catLabel: "Location",
            desc: pinDetail.info.trim() || undefined,
          }]}
          index={0}
          onClose={() => setPinDetail(null)}
          onNavigate={() => {}}
        />
      )}
    </div>,
    document.body
  );
}
