"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapZoomPanel from "./MapZoomPanel";
import WorldMapArtwork from "./WorldMapArtwork";
import { useDragZoom } from "@/hooks/useDragZoom";
import { MAP_ZOOM_MIN, resolvePinTarget, visibleMarkersAtZoom } from "@/lib/map-zoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// Home's own compact surface over the same map data and the same shared
// marker routing (lib/map-zoom.ts's resolvePinTarget) as Worldbuilding and
// the fullscreen Atlas -- it does not invent a separate routing rule or a
// separate map data model. Passive by default: hovering does nothing, and
// the mouse wheel/trackpad scrolls the page like normal, not the map. An
// explicit click on a non-marker part of the map activates in-place
// pan/zoom; Escape (or the pointer leaving the map) hands page scrolling
// back. The +/-/Reset controls are explicit user intent and stay usable
// even while passive.
export default function HomeInteractiveMap({ map, maps, locations }: { map: WorldMap; maps: WorldMap[]; locations: MapLocation[] }) {
  const router = useRouter();
  const worldMap = useMemo(() => maps.find((candidate) => candidate.parentMapId === null) ?? map, [map, maps]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const { zoom, pan, zoomBy, reset, onPointerDown, onPointerMove, onPointerUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: 1, maxZoom: 2.5, step: 0.2, interactionEnabled: isInteractive }
  );
  const [explorer, setExplorer] = useState<{ mapId: number; pinId: number | null } | null>(null);
  const mapIds = useMemo(() => new Set(maps.map((candidate) => candidate.id)), [maps]);
  const previewPins = useMemo(
    () => visibleMarkersAtZoom(locations.filter((location) => location.mapId === worldMap.id), MAP_ZOOM_MIN),
    [locations, worldMap.id]
  );

  useEffect(() => {
    if (!isInteractive) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsInteractive(false);
        viewportRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInteractive]);

  // The one canonical marker-action rule (submap / lore entry / info-only
  // detail / no valid target) -- the same resolution MapZoomPanel and the
  // Worldbuilding static preview use, so a pin (e.g. BASE) never routes
  // differently depending on which page it's clicked from. An info-only
  // pin opens the same fullscreen panel every other surface would show it
  // in, focused directly on that pin, rather than a blank map view.
  function openPin(location: MapLocation) {
    if (wasDragging()) return;
    const action = resolvePinTarget(location, mapIds);
    if (action.kind === "submap") setExplorer({ mapId: action.mapId, pinId: null });
    else if (action.kind === "entry") router.push(`/worldbuilding?item=${action.entryId}`);
    else if (action.kind === "info") setExplorer({ mapId: action.location.mapId, pinId: action.location.id });
    else setExplorer({ mapId: worldMap.id, pinId: null });
  }

  return (
    <div className="hmp-interactive">
      <div className="hmp-controls" aria-label="Atlas preview controls">
        <button type="button" onClick={() => zoomBy(-0.25)} aria-label="Zoom out">−</button>
        <span aria-live="polite">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => zoomBy(0.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
      <div
        className={`hmp-viewport${isInteractive ? " hmp-viewport--interactive" : ""}`}
        ref={viewportRef}
        role="region"
        aria-label={isInteractive ? `Interactive atlas preview of ${worldMap.title}. Press Escape to return to page scrolling.` : "Activate interactive atlas"}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setIsInteractive(false)}
        onClick={() => {
          if (!isInteractive && !wasDragging()) setIsInteractive(true);
        }}
        onKeyDown={(event) => {
          if (!isInteractive && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            setIsInteractive(true);
          }
        }}
        style={{ cursor: isInteractive && zoom > minZoom ? "grab" : "default" }}
      >
        {!isInteractive && (
          <span className="hmp-activation-hint" aria-hidden="true">
            <strong>Click to explore</strong>
            <small>Scroll to zoom · Drag to pan</small>
          </span>
        )}
        <WorldMapArtwork
          ref={contentRef}
          map={worldMap}
          locations={previewPins}
          className="wma-preview"
          transform={`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}
          renderMarker={(location) => (
            <button
              type="button"
              key={location.id}
              className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={(event) => {
                event.stopPropagation();
                openPin(location);
              }}
              aria-label={location.pinType === "submap" ? `Open ${location.name} submap` : `View ${location.name}`}
            >
              <span className="map-pin-dot" />
              <span className="map-pin-label" aria-hidden="true">{location.name}</span>
            </button>
          )}
        />
      </div>
      {explorer && (
        <MapZoomPanel
          maps={maps}
          locations={locations}
          initialMapId={explorer.mapId}
          initialPinId={explorer.pinId}
          onOpenLore={(entryId) => router.push(`/worldbuilding?item=${entryId}`)}
          onClose={() => setExplorer(null)}
        />
      )}
    </div>
  );
}
