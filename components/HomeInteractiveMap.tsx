"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MapZoomPanel from "./MapZoomPanel";
import WorldMapArtwork from "./WorldMapArtwork";
import { MAP_ZOOM_MIN, resolvePinTarget, visibleMarkersAtZoom } from "@/lib/map-zoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// Same template and logic as WorldbuildingAtlas.tsx, by design: a large
// static preview that opens the identical fullscreen MapZoomPanel on click,
// using the same shared marker-action rule (lib/map-zoom.ts). Home does not
// invent its own map experience, navigation model, or zoom system -- only
// the surrounding page chrome (heading/footer in HomeMapPreview.tsx) and the
// lore-entry destination (a route push here vs. an onOpenLore callback
// there, since Home isn't already on /worldbuilding) differ.
export default function HomeInteractiveMap({ map, maps, locations }: { map: WorldMap; maps: WorldMap[]; locations: MapLocation[] }) {
  const router = useRouter();
  const worldMap = useMemo(() => maps.find((candidate) => candidate.parentMapId === null) ?? map, [map, maps]);
  const [explorer, setExplorer] = useState<{ mapId: number; pinId: number | null } | null>(null);
  const mapIds = useMemo(() => new Set(maps.map((candidate) => candidate.id)), [maps]);
  const previewPins = useMemo(
    () => visibleMarkersAtZoom(locations.filter((location) => location.mapId === worldMap.id), MAP_ZOOM_MIN),
    [locations, worldMap.id]
  );

  function openPin(location: MapLocation) {
    const action = resolvePinTarget(location, mapIds);
    if (action.kind === "submap") setExplorer({ mapId: action.mapId, pinId: null });
    else if (action.kind === "entry") router.push(`/worldbuilding?item=${action.entryId}`);
    else if (action.kind === "info") setExplorer({ mapId: action.location.mapId, pinId: action.location.id });
    else setExplorer({ mapId: worldMap.id, pinId: null });
  }

  return (
    <div className="hmp-interactive">
      <div className="wa-topbar">
        <nav className="wa-breadcrumb"><span className="wa-crumb-current">{worldMap.title}</span></nav>
      </div>
      <div
        className="wa-viewport wa-viewport-static"
        role="button"
        tabIndex={0}
        onClick={() => setExplorer({ mapId: worldMap.id, pinId: null })}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExplorer({ mapId: worldMap.id, pinId: null }); } }}
      >
        <WorldMapArtwork
          map={worldMap}
          locations={previewPins}
          className="wma-preview"
          renderMarker={(location) => (
            <button
              type="button"
              key={location.id}
              className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={(event) => { event.stopPropagation(); openPin(location); }}
              aria-label={location.pinType === "submap" ? `Open ${location.name} submap` : `View ${location.name}`}
            >
              <span className="map-pin-dot" />
              <span className="map-pin-label" aria-hidden="true">{location.name}</span>
            </button>
          )}
        />
        <span className="wa-static-hint">Click to explore</span>
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
