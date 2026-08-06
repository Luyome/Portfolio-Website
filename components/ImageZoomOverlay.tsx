"use client";

import { useEffect, useRef } from "react";
import { useDragZoom } from "@/hooks/useDragZoom";
import { useModalFocus } from "@/hooks/useModalFocus";

export default function ImageZoomOverlay({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { zoom, pan, zoomBy, reset, onMouseDown, onMouseMove, onMouseUp, minZoom } = useDragZoom({ viewportRef, contentRef });

  useModalFocus(true, overlayRef);

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
      className="iz-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="iz-controls">
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-0.25)}>−</button>
        <span className="iz-zoom-label">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.25)}>+</button>
        <button type="button" onClick={reset}>Reset</button>
        <button type="button" className="iz-close" onClick={onClose}>✕ Close</button>
      </div>
      <div
        className="iz-viewport"
        ref={viewportRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: zoom > minZoom ? "grab" : "default" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="iz-img"
          ref={contentRef}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        />
      </div>
    </div>
  );
}
