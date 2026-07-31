"use client";

import { useState } from "react";
import GalleryModal, { GalleryItem } from "./GalleryModal";
import type { MapLocation } from "@/lib/map-types";

export default function MapViewer({ imageUrl, locations }: { imageUrl: string; locations: MapLocation[] }) {
  const [zoom, setZoom] = useState(1);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = locations.map((l) => ({
    img: l.img,
    title: l.name,
    catLabel: "Location",
    desc: l.info,
  }));

  return (
    <div className="map-wrap">
      <div className="map-controls">
        <button type="button" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}>−</button>
        <span className="map-zoom-label">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}>+</button>
        <button type="button" onClick={() => setZoom(1)}>Reset</button>
      </div>
      <div className="map-viewport">
        <div className="map-canvas" style={{ transform: `scale(${zoom})` }}>
          {imageUrl ? (
            <img src={imageUrl} alt="Map" className="map-image" />
          ) : (
            <div className="map-empty">No map yet.</div>
          )}
          {locations.map((l, i) => (
            <button
              type="button"
              key={l.id}
              className="map-pin"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              onClick={() => setModalIndex(i)}
            >
              <span className="map-pin-dot" />
              <span className="map-pin-label">{l.name}</span>
            </button>
          ))}
        </div>
      </div>
      <GalleryModal
        items={galleryItems}
        index={modalIndex}
        onClose={() => setModalIndex(null)}
        onNavigate={setModalIndex}
      />
    </div>
  );
}
