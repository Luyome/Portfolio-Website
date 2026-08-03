"use client";

import { useEffect, useRef } from "react";
import { useDragZoom } from "@/hooks/useDragZoom";
import type { MapLocation } from "@/lib/map-types";

export default function MapZoomOverlay({
  imageUrl,
  locations,
  onLocationClick,
  onClose,
}: {
  imageUrl: string;
  locations: MapLocation[];
  onLocationClick: (index: number) => void;
  onClose: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onWheel, onMouseDown, onMouseMove, onMouseUp, wasDragging, minZoom } = useDragZoom({ viewportRef, contentRef });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="mz-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="iz-controls">
        <button type="button" onClick={() => zoomBy(-0.25)}>−</button>
        <span className="iz-zoom-label">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => zoomBy(0.25)}>+</button>
        <button type="button" onClick={reset}>Reset</button>
        <button type="button" className="iz-close" onClick={onClose}>✕ Close</button>
      </div>
      <div
        className="iz-viewport"
        ref={viewportRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: zoom > minZoom ? "grab" : "default" }}
      >
        <div className="mz-canvas" ref={contentRef} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <img src={imageUrl} alt="Map" draggable={false} className="mz-img" />
          {locations.map((l, i) => (
            <button
              type="button"
              key={l.id}
              className="map-pin"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              onClick={() => {
                if (wasDragging()) return;
                onLocationClick(i);
              }}
            >
              <span className="map-pin-dot" />
              <span className="map-pin-label">{l.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
