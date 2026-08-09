"use client";

import { useState } from "react";
import MapZoomPanel from "@/components/MapZoomPanel";
import AdminEmptyState from "./AdminEmptyState";
import type { MapLocation, WorldMap } from "@/lib/map-types";

// A visitor-accurate test surface for the admin: reuses MapZoomPanel, the
// exact same fullscreen pan/zoom/breadcrumb/pin-click component the public
// Home and Worldbuilding pages open on click (components/HomeInteractiveMap.tsx,
// components/WorldbuildingAtlas.tsx) — no new coordinate math, no new
// rendering system, so what the owner sees here is guaranteed to match what
// a real visitor sees for the same map/pin data.
export default function AdminMapAtlas({ maps, locations }: { maps: WorldMap[]; locations: MapLocation[] }) {
  const rootMap = maps.find((m) => m.parentMapId === null) ?? maps[0] ?? null;
  const [selectedMapId, setSelectedMapId] = useState<number | null>(rootMap?.id ?? null);
  const [open, setOpen] = useState(true);

  if (!rootMap) {
    return (
      <AdminEmptyState
        label="No maps exist yet."
        createHref="/admin/worldbuilding/maps/new"
        createLabel="+ Create the first map"
      />
    );
  }

  return (
    <section className="adm-map-workspace">
      <div className="map-admin-toolbar">
        <select
          value={selectedMapId ?? ""}
          onChange={(e) => {
            setSelectedMapId(Number(e.target.value));
            setOpen(true);
          }}
        >
          {maps.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        {!open && (
          <button type="button" className="adm-btn" onClick={() => setOpen(true)}>
            Open Preview
          </button>
        )}
        <span className="adm-hint">
          Opens the exact same fullscreen viewer visitors use on Home and Worldbuilding. Closing it returns you
          here — pick a different map to test another one.
        </span>
      </div>

      {open && selectedMapId !== null && (
        <MapZoomPanel
          maps={maps}
          locations={locations}
          initialMapId={selectedMapId}
          onOpenLore={(entryId) => window.open(`/worldbuilding?item=${entryId}`, "_blank", "noopener")}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
