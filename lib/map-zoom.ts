// Task 4.5 — Map Data + Semantic Zoom Foundation.
//
// Small, focused, generic helpers Task 4.6 (Interactive Map Explorer) needs
// to answer "should this marker be visible at zoom X?" and to walk the
// existing world_maps parent/submap hierarchy. Deliberately has no rendering,
// pinch-zoom, animation, or KRUPNI-specific content rules — see
// docs/08_ROADMAP.md, Task 4.5.
//
// Zoom scale: an abstract 1 (fully zoomed out) to 5 (fully zoomed in)
// semantic scale, independent of any single viewer's own pixel zoom range
// (public MapZoomPanel currently spans 1-4, admin MapEditor 1-3). Task 4.6
// normalizes whichever viewer's actual zoom value into this scale before
// calling isMarkerVisibleAtZoom. Conceptually:
//   far zoom (low end)    -> only high-priority continent/major-region markers
//   medium zoom            -> regions/cities/important locations
//   near zoom (high end)   -> detailed locations
// Concrete zoom-to-tier cutoffs are a Task 4.6 UI decision, not encoded here.
import { boundedInt, ValidationError } from "@/lib/validation";
import type { MapLocation, WorldMap } from "@/lib/map-types";

export const MAP_ZOOM_MIN = 1;
export const MAP_ZOOM_MAX = 5;
export const MAP_MIN_ZOOM_DEFAULT = MAP_ZOOM_MIN;
export const MAP_MAX_ZOOM_DEFAULT = MAP_ZOOM_MAX;

export const MAP_PRIORITY_MIN = 0;
export const MAP_PRIORITY_MAX = 100;
export const MAP_PRIORITY_DEFAULT = 0;

/** Validates a marker's zoom range against the shared 1-5 scale and its own min<=max ordering. Throws ValidationError. */
export function validateZoomRange(minZoom: number, maxZoom: number): { minZoom: number; maxZoom: number } {
  const min = boundedInt(minZoom, MAP_ZOOM_MIN, MAP_ZOOM_MAX, "Min zoom");
  const max = boundedInt(maxZoom, MAP_ZOOM_MIN, MAP_ZOOM_MAX, "Max zoom");
  if (min > max) throw new ValidationError("Min zoom must not be greater than max zoom.");
  return { minZoom: min, maxZoom: max };
}

/** Validates a marker's display priority against the shared bounded range. Throws ValidationError. */
export function validatePriority(priority: number): number {
  return boundedInt(priority, MAP_PRIORITY_MIN, MAP_PRIORITY_MAX, "Priority");
}

/** Should this marker be visible at the given (already-normalized 1-5) zoom level? Inclusive at both boundaries. */
export function isMarkerVisibleAtZoom(location: Pick<MapLocation, "minZoom" | "maxZoom">, zoom: number): boolean {
  return zoom >= location.minZoom && zoom <= location.maxZoom;
}

/** Markers on the given map visible at the given zoom level, in deterministic priority order. */
export function visibleMarkersAtZoom<T extends Pick<MapLocation, "minZoom" | "maxZoom" | "priority"> & { id: number }>(
  locations: T[],
  zoom: number
): T[] {
  return sortByPriority(locations.filter((l) => isMarkerVisibleAtZoom(l, zoom)));
}

/** Deterministic priority ordering: higher priority first, tied priorities broken by id ascending (stable, reproducible). */
export function sortByPriority<T extends Pick<MapLocation, "priority"> & { id: number }>(locations: T[]): T[] {
  return [...locations].sort((a, b) => b.priority - a.priority || a.id - b.id);
}

/** Direct child (sub)maps of a given map, in the existing sortOrder. */
export function getChildMaps(maps: WorldMap[], parentMapId: number): WorldMap[] {
  return maps.filter((m) => m.parentMapId === parentMapId);
}

/** Ancestor chain for a map, root-first, ending with the map itself — the same walk MapZoomPanel's breadcrumb already performs, exposed here for reuse. */
export function getMapBreadcrumb(maps: WorldMap[], mapId: number): WorldMap[] {
  const byId = new Map(maps.map((m) => [m.id, m]));
  const chain: WorldMap[] = [];
  let current = byId.get(mapId) ?? null;
  while (current) {
    chain.unshift(current);
    current = current.parentMapId !== null ? byId.get(current.parentMapId) ?? null : null;
  }
  return chain;
}

// Layer decision (Task 4.5): no dedicated `layer` column was added.
// `mapLocations.iconType` (city/character/landmark/hazard/default) already
// is a small, controlled, legend-able category — adding a second, parallel
// category concept would duplicate it rather than support a genuine unmet
// need. Task 4.6's layer/legend UI groups by iconType directly; see
// docs/08_ROADMAP.md, Task 4.5 for the recorded decision.

/** Markers grouped by their existing iconType, for a Task 4.6 layer/legend UI — no dedicated layer field needed. */
export function groupByIconType<T extends Pick<MapLocation, "iconType">>(locations: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const loc of locations) {
    const group = groups.get(loc.iconType);
    if (group) group.push(loc);
    else groups.set(loc.iconType, [loc]);
  }
  return groups;
}
