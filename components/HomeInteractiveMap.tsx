"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useDragZoom } from "@/hooks/useDragZoom";
import { isOptimizableImageUrl } from "@/lib/image-host";
import type { ResolvedHomeContinentPin } from "@/lib/home-data";
import type { WorldMap } from "@/lib/map-types";

export default function HomeInteractiveMap({ map, pins }: { map: WorldMap; pins: ResolvedHomeContinentPin[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onPointerDown, onPointerMove, onPointerUp, wasDragging, minZoom } = useDragZoom(
    { viewportRef, contentRef },
    { minZoom: 1, maxZoom: 3, step: 0.2 }
  );

  return (
    <div className="hmp-interactive">
      <div className="hmp-controls" aria-label="Map controls">
        <button type="button" onClick={() => zoomBy(-0.25)} aria-label="Zoom out">−</button>
        <span aria-live="polite">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => zoomBy(0.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
      <div className="hmp-viewport" ref={viewportRef} role="region"
        aria-label={`Interactive map of ${map.title}. Use the controls or mouse wheel to zoom, then drag to pan.`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        style={{ cursor: zoom > minZoom ? "grab" : "default" }}>
        <div className="hmp-canvas" ref={contentRef} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {map.imageUrl ? (
            <Image src={map.imageUrl} alt={`Map of ${map.title}`} fill sizes="(max-width: 820px) 100vw, 92vw"
              unoptimized={!isOptimizableImageUrl(map.imageUrl)} />
          ) : <div className="hmp-map-placeholder" aria-label={`${map.title} map artwork is being prepared`} />}
          {pins.map((pin, index) => (
            <Link key={pin.id} href={pin.href} className="hmp-pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-label={`Open the ${pin.targetTitle} continent map`} onClick={(event) => { if (wasDragging()) event.preventDefault(); }}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{pin.name}</strong>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
