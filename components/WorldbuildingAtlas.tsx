"use client";

import { useMemo, useState } from "react";
import MapZoomPanel from "./MapZoomPanel";
import WorldMapArtwork from "./WorldMapArtwork";
import { MAP_ZOOM_MIN, resolvePinTarget, visibleMarkersAtZoom } from "@/lib/map-zoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// A large, static (non-interactive-pan) preview of the root map. Marker
// clicks resolve through the same shared lib/map-zoom.ts rule the fullscreen
// MapZoomPanel and the Home preview use, so a pin never behaves differently
// depending on which page it was clicked from (e.g. a submap pin always
// opens that exact submap here too, not just the root map).
export default function WorldbuildingAtlas({ maps, locations, onOpenLore, initialMapId }: { maps: WorldMap[]; locations: MapLocation[]; onOpenLore: (entryId: number) => void; initialMapId?: number | null }) {
  const rootMap = useMemo(() => maps.find((map) => map.parentMapId === null) ?? maps[0] ?? null, [maps]);
  const initialMap = initialMapId && maps.some((map) => map.id === initialMapId) ? initialMapId : null;
  const [explorer, setExplorer] = useState<{ mapId: number; pinId: number | null } | null>(initialMap !== null ? { mapId: initialMap, pinId: null } : null);
  const mapIds = useMemo(() => new Set(maps.map((map) => map.id)), [maps]);
  const pins = useMemo(() => rootMap ? visibleMarkersAtZoom(locations.filter((location) => location.mapId === rootMap.id), MAP_ZOOM_MIN) : [], [locations, rootMap]);

  function openPin(location: MapLocation) {
    const action = resolvePinTarget(location, mapIds);
    if (action.kind === "submap") setExplorer({ mapId: action.mapId, pinId: null });
    else if (action.kind === "entry") onOpenLore(action.entryId);
    else if (action.kind === "info") setExplorer({ mapId: action.location.mapId, pinId: action.location.id });
    else if (rootMap) setExplorer({ mapId: rootMap.id, pinId: null });
  }

  if (!rootMap) return <div className="wa-empty">No map has been configured yet.</div>;
  return <div className="wa-wrap">
    <div className="wa-topbar"><nav className="wa-breadcrumb"><span className="wa-crumb-current">{rootMap.title}</span></nav></div>
    <div className="wa-viewport wa-viewport-static" role="button" tabIndex={0} onClick={() => setExplorer({ mapId: rootMap.id, pinId: null })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExplorer({ mapId: rootMap.id, pinId: null }); } }}>
      <WorldMapArtwork map={rootMap} locations={pins} className="wma-preview" renderMarker={(location) => <button type="button" key={location.id} className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} onClick={(event) => { event.stopPropagation(); openPin(location); }} aria-label={location.pinType === "submap" ? `Open ${location.name} submap` : `View ${location.name}`}><span className="map-pin-dot" /><span className="map-pin-label" aria-hidden="true">{location.name}</span></button>} />
      <span className="wa-static-hint">Click to explore</span>
    </div>
    {explorer && <MapZoomPanel maps={maps} locations={locations} initialMapId={explorer.mapId} initialPinId={explorer.pinId} onOpenLore={onOpenLore} onClose={() => setExplorer(null)} />}
  </div>;
}
