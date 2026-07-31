"use client";

import { useRef, useState } from "react";
import { createMapLocation, updateMapLocationPosition, updateMapImage } from "@/lib/actions/map";
import { useMapPanZoom } from "@/hooks/useMapPanZoom";
import ImageUploadField from "./ImageUploadField";
import MapPinEditPanel from "./MapPinEditPanel";
import type { MapLocation } from "@/lib/map-types";

export default function MapEditor({
  imageUrl,
  locations: initialLocations,
}: {
  imageUrl: string;
  locations: MapLocation[];
}) {
  const [locations, setLocations] = useState(initialLocations);
  const [newName, setNewName] = useState("");
  const [placing, setPlacing] = useState(false);
  const [editing, setEditing] = useState<MapLocation | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: number; moved: boolean } | null>(null);
  const { zoom, setZoom, minZoom, maxZoom, fitSize, onMouseDown, onMouseMove, onMouseUp, wasPanning } = useMapPanZoom(viewportRef);

  function coordsFromEvent(e: { clientX: number; clientY: number }) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  }

  async function handleCanvasClick(e: React.MouseEvent) {
    if (wasPanning()) return;
    if (!placing || !newName.trim()) return;
    const { x, y } = coordsFromEvent(e);
    const row = await createMapLocation(newName.trim(), x, y);
    if (row) {
      setLocations((prev) => [...prev, { id: row.id, name: row.name, x: row.x, y: row.y, info: row.info, img: row.img }]);
    }
    setNewName("");
    setPlacing(false);
  }

  function handlePinPointerDown(id: number, e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { id, moved: false };
  }

  function handlePinPointerMove(id: number, e: React.PointerEvent) {
    if (!dragState.current || dragState.current.id !== id || e.buttons === 0) return;
    dragState.current.moved = true;
    const { x, y } = coordsFromEvent(e);
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, x, y } : l)));
  }

  function handlePinPointerUp(id: number, e: React.PointerEvent) {
    e.stopPropagation();
    const drag = dragState.current;
    dragState.current = null;
    if (!drag || drag.id !== id) return;
    const loc = locations.find((l) => l.id === id);
    if (!loc) return;
    if (drag.moved) {
      updateMapLocationPosition(id, loc.x, loc.y);
    } else {
      setEditing(loc);
    }
  }

  return (
    <div>
      <form action={updateMapImage} className="adm-form" style={{ marginBottom: 32 }}>
        <ImageUploadField name="imageUrl" initialUrl={imageUrl} label="Map Background Image" />
        <button type="submit" className="adm-btn">Save Map Image</button>
      </form>

      <div className="map-admin-toolbar">
        <input
          type="text"
          className="map-name-input"
          placeholder="Location name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        {placing ? (
          <>
            <span className="adm-hint">Click the map to place &quot;{newName}&quot;…</span>
            <button type="button" className="adm-exit-btn" onClick={() => setPlacing(false)}>Cancel</button>
          </>
        ) : (
          <button type="button" className="adm-btn" disabled={!newName.trim()} onClick={() => setPlacing(true)}>
            + Add Pin
          </button>
        )}
        <div className="map-controls">
          <button type="button" onClick={() => setZoom((z) => Math.max(minZoom, +(z - 0.25).toFixed(2)))}>−</button>
          <span className="map-zoom-label">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(maxZoom, +(z + 0.25).toFixed(2)))}>+</button>
        </div>
      </div>

      <div
        className="map-viewport"
        ref={viewportRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          className="map-canvas"
          ref={canvasRef}
          style={{ transform: `scale(${zoom})`, cursor: placing ? "crosshair" : undefined }}
          onClick={handleCanvasClick}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Map"
              className="map-image"
              draggable={false}
              style={fitSize ? { width: fitSize.width, height: fitSize.height } : undefined}
            />
          ) : (
            <div className="map-empty">Upload a map image above to get started.</div>
          )}
          {locations.map((l) => (
            <div
              key={l.id}
              className="map-pin map-pin-editable"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              onPointerDown={(e) => handlePinPointerDown(l.id, e)}
              onPointerMove={(e) => handlePinPointerMove(l.id, e)}
              onPointerUp={(e) => handlePinPointerUp(l.id, e)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="map-pin-dot" />
              <span className="map-pin-label">{l.name}</span>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <MapPinEditPanel
          location={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setEditing(null);
          }}
          onDeleted={(id) => {
            setLocations((prev) => prev.filter((l) => l.id !== id));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
