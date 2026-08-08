"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { MapLocation, WorldMap } from "@/lib/map-types";

export type WorldMapFrame = { width: number; height: number; left: number; top: number };

type Props = {
  map: WorldMap;
  locations: MapLocation[];
  className?: string;
  frameClassName?: string;
  style?: CSSProperties;
  transform?: string;
  interactive?: boolean;
  onFrameChange?: (frame: WorldMapFrame) => void;
  onMarkerClick?: (location: MapLocation) => void;
  renderMarker?: (location: MapLocation) => ReactNode;
};

// The sole artwork coordinate system for Home, the atlas preview, and the
// fullscreen explorer. A frame is always the intrinsic artwork contained in
// the current viewport; every marker is positioned inside that same frame.
const WorldMapArtwork = forwardRef<HTMLDivElement, Props>(function WorldMapArtwork({
  map, locations, className = "", frameClassName = "", style, transform, interactive = false,
  onFrameChange, onMarkerClick, renderMarker,
}, forwardedRef) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => frameRef.current!, []);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [frame, setFrame] = useState<WorldMapFrame | null>(null);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !natural) return;
    const scaleX = viewport.clientWidth / natural.width;
    const scaleY = viewport.clientHeight / natural.height;
    const scale = Math.min(scaleX, scaleY);
    const next = {
      width: natural.width * scale,
      height: natural.height * scale,
      left: (viewport.clientWidth - natural.width * scale) / 2,
      top: (viewport.clientHeight - natural.height * scale) / 2,
    };
    setFrame((previous) => previous && Math.round(previous.width) === Math.round(next.width) && Math.round(previous.height) === Math.round(next.height) && Math.round(previous.left) === Math.round(next.left) && Math.round(previous.top) === Math.round(next.top) ? previous : next);
    onFrameChange?.(next);
  }, [natural, onFrameChange]);

  useEffect(() => {
    measure();
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measure]);

  const rootStyle = { ...style, aspectRatio: natural ? `${natural.width} / ${natural.height}` : "16 / 9" };
  const frameStyle = frame
    ? { width: frame.width, height: frame.height, left: frame.left, top: frame.top, transform }
    : { inset: 0, transform };
  return <div ref={viewportRef} className={`wma ${className}`} style={rootStyle}>
    <div ref={frameRef} className={`wma-frame ${frameClassName}`} style={frameStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={map.imageUrl} alt={`Map of ${map.title}`} className="wma-img" draggable={false} onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
      {locations.map((location) => renderMarker ? renderMarker(location) : <button type="button" key={location.id} className={`map-pin map-pin-${location.pinType} map-pin-icon-${location.iconType}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} onClick={() => interactive && onMarkerClick?.(location)} aria-label={location.pinType === "submap" ? `Open ${location.name} submap` : `View ${location.name}`}><span className="map-pin-dot" /><span className="map-pin-label" aria-hidden="true">{location.name}</span></button>)}
    </div>
  </div>;
});

export default WorldMapArtwork;
