"use client";

import { useState } from "react";
import GalleryModal, { GalleryItem } from "./GalleryModal";
import MapZoomOverlay from "./MapZoomOverlay";
import type { MapLocation } from "@/lib/map-types";

export default function MapViewer({ imageUrl, locations }: { imageUrl: string; locations: MapLocation[] }) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [exploring, setExploring] = useState(false);

  const galleryItems: GalleryItem[] = locations.map((l) => ({
    img: l.img,
    title: l.name,
    catLabel: "Location",
    desc: l.info,
  }));

  return (
    <div className="map-wrap">
      {imageUrl ? (
        <div className="map-static" onClick={() => setExploring(true)}>
          <div className="map-static-canvas">
            <img src={imageUrl} alt="Map" className="map-static-img" draggable={false} />
          </div>
          <div className="map-static-hint">Click to explore — drag to pan, scroll to zoom</div>
        </div>
      ) : (
        <div className="map-empty">No map yet.</div>
      )}
      {exploring && (
        <MapZoomOverlay
          imageUrl={imageUrl}
          locations={locations}
          onClose={() => setExploring(false)}
          onLocationClick={setModalIndex}
        />
      )}
      <GalleryModal
        items={galleryItems}
        index={modalIndex}
        onClose={() => setModalIndex(null)}
        onNavigate={setModalIndex}
      />
    </div>
  );
}
