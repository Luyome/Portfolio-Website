"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createMapLocation, deleteMapLocation, updateMapLocationPosition } from "@/lib/actions/map";
import { useMapPanZoom } from "@/hooks/useMapPanZoom";
import MapPinEditPanel from "./MapPinEditPanel";
import type { MapLocation, WorldMap } from "@/lib/map-types";

export default function MapEditor({
  maps,
  locations: initialLocations,
  entries,
}: {
  maps: WorldMap[];
  locations: MapLocation[];
  entries: { id: number; title: string }[];
}) {
  const rootMap = maps.find((m) => m.parentMapId === null) ?? maps[0] ?? null;
  const [currentMapId, setCurrentMapId] = useState<number | null>(rootMap?.id ?? null);
  const [locations, setLocations] = useState(initialLocations);
  const [newName, setNewName] = useState("");
  const [placing, setPlacing] = useState(false);
  const [editing, setEditing] = useState<MapLocation | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: number; moved: boolean } | null>(null);
  const currentMap = maps.find((m) => m.id === currentMapId) ?? null;
  const { zoom, setZoom, minZoom, maxZoom, aspectRatio, onPointerDown, onPointerMove, onPointerUp, wasPanning } = useMapPanZoom(
    viewportRef,
    currentMap?.imageUrl
  );
  const mapLocationsHere = useMemo(
    () => (currentMapId === null ? [] : locations.filter((l) => l.mapId === currentMapId)),
    [locations, currentMapId]
  );
  const mapsById = useMemo(() => new Map(maps.map((m) => [m.id, m.title])), [maps]);
  const entriesById = useMemo(() => new Map(entries.map((e) => [e.id, e.title])), [entries]);

  async function handleDeleteFromTable(loc: MapLocation) {
    if (!window.confirm(`Delete "${loc.name}"?`)) return;
    await deleteMapLocation(loc.id);
    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
    if (editing?.id === loc.id) setEditing(null);
  }

  function coordsFromEvent(e: { clientX: number; clientY: number }) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  }

  async function handleCanvasClick(e: React.MouseEvent) {
    if (wasPanning()) return;
    if (!placing || !newName.trim() || currentMapId === null) return;
    const { x, y } = coordsFromEvent(e);
    const row = await createMapLocation(currentMapId, newName.trim(), x, y);
    if (row) setLocations((prev) => [...prev, row as MapLocation]);
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

  if (!currentMap) {
    return (
      <div className="adm-hint">
        No maps exist yet. Create one in <Link href="/admin/worldbuilding/maps">Map Manager</Link> first.
      </div>
    );
  }

  return (
    <section className="adm-map-workspace">
      <div className="map-admin-toolbar">
        <select
          value={currentMapId ?? ""}
          onChange={(e) => {
            // Switching maps must never leave the previous map's selection
            // or in-progress pin placement attached to the newly-shown map.
            setCurrentMapId(Number(e.target.value));
            setEditing(null);
            setPlacing(false);
            setNewName("");
          }}
        >
          {maps.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        <Link href="/admin/worldbuilding/maps" className="adm-exit-btn">Manage Maps</Link>
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <div
          className="map-canvas"
          ref={canvasRef}
          style={{ transform: `scale(${zoom})`, cursor: placing ? "crosshair" : undefined }}
          onClick={handleCanvasClick}
        >
          {currentMap.imageUrl ? (
            <img
              src={currentMap.imageUrl}
              alt={currentMap.title}
              className="map-image"
              draggable={false}
            />
          ) : (
            <div className="map-empty">
              This map has no image yet — set one in Map Manager.
            </div>
          )}
          {mapLocationsHere.map((l) => (
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

      <div className="adm-workspace-section-head">
        <div>
          <span>Location index</span>
          <h2>Pins on {currentMap.title}</h2>
        </div>
        <span>{mapLocationsHere.length} configured</span>
      </div>
      {mapLocationsHere.length === 0 ? (
        <div className="adm-hint">No pins placed on this map yet.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Pin Type</th>
                <th>Target</th>
                <th>Icon</th>
                <th>Priority</th>
                <th>Zoom Range</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mapLocationsHere.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.pinType === "submap" ? "Sub-Map" : "Lore Entry"}</td>
                  <td>
                    {l.pinType === "submap"
                      ? l.targetMapId !== null
                        ? mapsById.get(l.targetMapId) ?? "—"
                        : "—"
                      : l.entryId !== null
                        ? entriesById.get(l.entryId) ?? "—"
                        : "—"}
                  </td>
                  <td>{l.iconType}</td>
                  <td>{l.priority}</td>
                  <td>{l.minZoom}–{l.maxZoom}</td>
                  <td>{l.x.toFixed(1)}%, {l.y.toFixed(1)}%</td>
                  <td>
                    <div className="adm-actions">
                      <button type="button" onClick={() => setEditing(l)}>Edit</button>
                      <button type="button" className="danger" onClick={() => handleDeleteFromTable(l)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <MapPinEditPanel
          location={editing}
          maps={maps}
          entries={entries}
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
    </section>
  );
}
