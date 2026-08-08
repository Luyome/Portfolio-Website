"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapZoomPanel from "./MapZoomPanel";
import { useDragZoom } from "@/hooks/useDragZoom";
import { MAP_ZOOM_MIN, visibleMarkersAtZoom } from "@/lib/map-zoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// A deliberately compact Home surface over the same map data and large
// explorer used by Worldbuilding. The preview keeps direct marker actions;
// it does not attempt to recreate the explorer's hierarchy or legend UI.
export default function HomeInteractiveMap({
  map,
  maps,
  locations,
}: {
  map: WorldMap;
  maps: WorldMap[];
  locations: MapLocation[];
}) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onPointerDown, onPointerMove, onPointerUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: 1, maxZoom: 2.5, step: 0.2 }
  );
  const [explorerMapId, setExplorerMapId] = useState<number | null>(null);
  const mapIds = useMemo(() => new Set(maps.map((candidate) => candidate.id)), [maps]);
  const previewPins = useMemo(
    () => visibleMarkersAtZoom(locations.filter((location) => location.mapId === map.id), MAP_ZOOM_MIN),
    [locations, map.id]
  );

  function openExplorer(mapId = map.id) {
    setExplorerMapId(mapId);
  }

  function handlePinClick(location: MapLocation) {
    if (wasDragging()) return;
    if (location.pinType === "submap" && location.targetMapId !== null && mapIds.has(location.targetMapId)) {
      openExplorer(location.targetMapId);
      return;
    }
    if (location.entryId !== null) {
      router.push(`/worldbuilding?item=${location.entryId}`);
      return;
    }
    // Informational pins retain their established MapZoomPanel detail view.
    if (location.info.trim() || location.img) openExplorer();
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
        className="hmp-viewport"
        ref={viewportRef}
        role="region"
        aria-label={`Atlas preview of ${map.title}. Use controls or the mouse wheel to zoom; drag to pan.`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(event) => {
          if (!wasDragging() && !(event.target instanceof Element && event.target.closest(".map-pin"))) openExplorer();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openExplorer();
          }
        }}
        style={{ cursor: zoom > minZoom ? "grab" : "default" }}
      >
        <div className="hmp-canvas" ref={contentRef} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {map.imageUrl ? (
            // The shared explorer intentionally uses a raw image so arbitrary
            // owner-provided map URLs remain pan/zoom-safe without Next image
            // host configuration.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={map.imageUrl} alt={`Map of ${map.title}`} draggable={false} />
          ) : <div className="hmp-map-placeholder" />}
          {previewPins.map((location) => {
            const actionable =
              (location.pinType === "submap" && location.targetMapId !== null && mapIds.has(location.targetMapId)) ||
              location.entryId !== null || Boolean(location.info.trim() || location.img);
            if (!actionable) {
              return <span key={location.id} className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} aria-hidden="true"><span className="map-pin-dot" /></span>;
            }
            const label = location.pinType === "submap" ? `Open ${location.name} submap` : location.entryId !== null ? `Open ${location.name}` : `View ${location.name}`;
            return (
              <button
                type="button"
                key={location.id}
                className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                onClick={() => handlePinClick(location)}
                aria-label={label}
              >
                <span className="map-pin-dot" />
                <span className="map-pin-label" aria-hidden="true">{location.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {explorerMapId !== null && (
        <MapZoomPanel
          maps={maps}
          locations={locations}
          initialMapId={explorerMapId}
          onOpenLore={(entryId) => router.push(`/worldbuilding?item=${entryId}`)}
          onClose={() => setExplorerMapId(null)}
        />
      )}
    </div>
  );
}
