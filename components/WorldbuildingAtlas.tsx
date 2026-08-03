"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapZoomPanel from "./MapZoomPanel";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// A large, static (non-interactive) preview of the root map. All exploration
// -- submap navigation, pin clicks, wheel-zoom/drag-pan -- happens in the
// fullscreen MapZoomPanel opened by clicking anywhere on this preview.
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<{ w: number; h: number; pad: number } | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  const pins = useMemo(
    () => (rootMap === null ? [] : locations.filter((l) => l.mapId === rootMap.id)),
    [locations, rootMap]
  );

  const handleImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth && el.naturalHeight) {
      setNaturalSize((prev) => (prev && prev.w === el.naturalWidth && prev.h === el.naturalHeight ? prev : { w: el.naturalWidth, h: el.naturalHeight }));
    }
  }, []);

  // The frame's own box (not just the image inside it) has to be sized in
  // JS, not pure CSS: an equal pixel gap on all four sides only works out to
  // an exact (no-letterbox) fit if the frame's *outer* aspect ratio already
  // accounts for the padding being subtracted from it -- and that relationship
  // depends on the actual available width, so a static CSS aspect-ratio can't
  // express it. Solve `(availW - 2*pad) / (availH - 2*pad) = imageRatio` for
  // the frame's height.
  //
  // Width is always the full available width -- never shrunk to fit under a
  // height cap -- so the preview stays flush from the sidebar to the right
  // edge of the screen for any map aspect ratio; height is whatever that
  // implies, so the image never distorts.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!naturalSize || !wrap) return;
    function recompute() {
      const cs = getComputedStyle(wrap!);
      const availW = wrap!.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!availW) return;
      // -5px so the image itself reads slightly larger against its own
      // background mat than the raw equal-gap value alone would give.
      const pad = Math.max(0, Math.min(48, Math.max(20, availW * 0.035)) - 5);
      const ratio = naturalSize!.w / naturalSize!.h;
      const w = availW;
      const h = (availW - 2 * pad) / ratio + 2 * pad;
      // Bail out with the same object reference when nothing actually moved
      // (rounding to whole px) -- ResizeObserver firing on a computed style
      // change that happens to round to the same size would otherwise still
      // produce a "new" state object and re-render forever.
      setFrame((prev) => {
        if (prev && Math.round(prev.w) === Math.round(w) && Math.round(prev.h) === Math.round(h) && Math.round(prev.pad) === Math.round(pad)) {
          return prev;
        }
        return { w, h, pad };
      });
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrap);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [naturalSize]);

  if (!rootMap) {
    return <div className="wa-empty">No map has been configured yet.</div>;
  }

  return (
    <div className="wa-wrap" ref={wrapRef}>
      <div className="wa-topbar">
        <nav className="wa-breadcrumb">
          <span className="wa-crumb-item">
            <span className="wa-crumb-current">{rootMap.title}</span>
          </span>
        </nav>
      </div>

      <div
        className="wa-viewport wa-viewport-static"
        role="button"
        tabIndex={0}
        onClick={() => setZoomOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoomOpen(true);
          }
        }}
        style={{ width: frame ? frame.w : undefined, height: frame ? frame.h : undefined }}
      >
        <div className="wa-frame-inner" style={{ inset: frame ? frame.pad : undefined }}>
          <div className="wa-canvas">
            {rootMap.imageUrl ? (
              <img src={rootMap.imageUrl} alt={rootMap.title} className="wa-img" draggable={false} ref={handleImgRef} />
            ) : (
              <div className="wa-img-empty">No map image uploaded yet.</div>
            )}
            {pins.map((loc) => (
              <div
                key={loc.id}
                className={`map-pin map-pin-${loc.pinType} map-pin-icon-${loc.iconType}`}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                <span className="map-pin-dot" />
                <span className="map-pin-label">{loc.name}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="wa-static-hint">Click to explore</span>
      </div>

      {zoomOpen && (
        <MapZoomPanel
          maps={maps}
          locations={locations}
          initialMapId={rootMap.id}
          onOpenLore={onOpenLore}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
