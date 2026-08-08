"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MapZoomPanel from "./MapZoomPanel";
import { MAP_ZOOM_MIN, visibleMarkersAtZoom } from "@/lib/map-zoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

export default function HomeInteractiveMap({ map, maps, locations }: {
  map: WorldMap;
  maps: WorldMap[];
  locations: MapLocation[];
}) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [fitFrame, setFitFrame] = useState<{ width: number; height: number; left: number; top: number } | null>(null);
  const [explorerMapId, setExplorerMapId] = useState<number | null>(null);
  const mapIds = useMemo(() => new Set(maps.map((candidate) => candidate.id)), [maps]);
  const previewPins = useMemo(
    () => visibleMarkersAtZoom(locations.filter((location) => location.mapId === map.id), MAP_ZOOM_MIN),
    [locations, map.id]
  );

  // Keep markers in the exact same source-image frame as the contained artwork.
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

  function openExplorer(mapId = map.id) {
    setExplorerMapId(mapId);
  }

  function handlePinClick(location: MapLocation) {
    if (location.pinType === "submap" && location.targetMapId !== null && mapIds.has(location.targetMapId)) {
      openExplorer(location.targetMapId);
    } else if (location.entryId !== null) {
      router.push(`/worldbuilding?item=${location.entryId}`);
    } else if (location.info.trim() || location.img) {
      openExplorer();
    }
  }

  return (
    <div className="hmp-interactive">
      <div
        className="hmp-viewport"
        ref={viewportRef}
        role="button"
        aria-label={`Explore ${map.title} fullscreen`}
        tabIndex={0}
        onClick={(event) => {
          if (!(event.target instanceof Element && event.target.closest(".map-pin"))) openExplorer();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openExplorer();
          }
        }}
      >
        <span className="hmp-activation-hint" aria-hidden="true">
          <strong>Click to explore</strong>
          <small>Open fullscreen atlas</small>
        </span>
        <div className="hmp-canvas">
          {map.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={map.imageUrl}
              alt={`Map of ${map.title}`}
              draggable={false}
              style={fitFrame ?? undefined}
              onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            />
          ) : <div className="hmp-map-placeholder" />}
          {previewPins.map((location) => {
            const position = fitFrame
              ? { left: fitFrame.left + (fitFrame.width * location.x) / 100, top: fitFrame.top + (fitFrame.height * location.y) / 100 }
              : { left: `${location.x}%`, top: `${location.y}%` };
            const actionable = (location.pinType === "submap" && location.targetMapId !== null && mapIds.has(location.targetMapId)) || location.entryId !== null || Boolean(location.info.trim() || location.img);
            if (!actionable) return <span key={location.id} className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`} style={position} aria-hidden="true"><span className="map-pin-dot" /></span>;
            const label = location.pinType === "submap" ? `Open ${location.name} submap` : location.entryId !== null ? `Open ${location.name}` : `View ${location.name}`;
            return <button type="button" key={location.id} className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`} style={position} onClick={(event) => { event.stopPropagation(); handlePinClick(location); }} aria-label={label}><span className="map-pin-dot" /><span className="map-pin-label" aria-hidden="true">{location.name}</span></button>;
          })}
        </div>
      </div>
      {explorerMapId !== null && <MapZoomPanel maps={maps} locations={locations} initialMapId={explorerMapId} onOpenLore={(entryId) => router.push(`/worldbuilding?item=${entryId}`)} onClose={() => setExplorerMapId(null)} />}
    </div>
  );
}
