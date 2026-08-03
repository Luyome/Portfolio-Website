"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDragZoom } from "@/hooks/useDragZoom";
import type { MapLocation, WorldMap } from "@/lib/map-types";

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
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onWheel, onMouseDown, onMouseMove, onMouseUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: 1, maxZoom: 4 }
  );

  const mapsById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);
  const currentMap = currentMapId !== null ? mapsById.get(currentMapId) ?? null : null;

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
    }
  }

  if (!currentMap) {
    return <div className="wa-empty">No map has been configured yet.</div>;
  }

  return (
    <div className="wa-wrap">
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
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: zoom > minZoom ? "grab" : "default" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMap.id}
            className="wa-transition"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div
              className="wa-canvas"
              ref={contentRef}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              {currentMap.imageUrl ? (
                <img src={currentMap.imageUrl} alt={currentMap.title} className="wa-img" draggable={false} />
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
    </div>
  );
}
