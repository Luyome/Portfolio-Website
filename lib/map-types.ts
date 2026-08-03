export type PinType = "submap" | "lore";
export type IconType = "city" | "character" | "landmark" | "hazard" | "default";

export type MapLocation = {
  id: number;
  mapId: number;
  name: string;
  x: number;
  y: number;
  // Stored as plain text columns in the DB (soft convention, like other
  // kind/status text fields in this codebase) — PinType/IconType above are
  // narrower unions for UI code (form <select> state) to cast into/out of.
  pinType: string;
  targetMapId: number | null;
  entryId: number | null;
  iconType: string;
  info: string;
  img: string | null;
};

export type WorldMap = {
  id: number;
  title: string;
  parentMapId: number | null;
  imageUrl: string;
  description: string;
  sortOrder: number;
};
