import assert from "node:assert/strict";
import test from "node:test";

// Importing the data module initializes the Neon client but these tests only
// exercise its pure validation rules; no database request is made.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const homeData = import("./home-data");

test("Home content limits accept the boundary and reject overflow", async () => {
  const { HOME_SECTION_LIMITS, HOME_SKILLS_LIMIT, validateHomeSelectionSet } = await homeData;
  const atLimit = Array.from({ length: HOME_SECTION_LIMITS.featured_work }, (_, index) => ({
    type: "portfolio" as const,
    id: index + 1,
  }));
  assert.doesNotThrow(() => validateHomeSelectionSet("featured_work", atLimit));
  assert.throws(
    () => validateHomeSelectionSet("featured_work", [...atLimit, { type: "portfolio", id: 99 }]),
    /at most 6/
  );
  assert.equal(HOME_SKILLS_LIMIT, 6);
  assert.equal(HOME_SECTION_LIMITS.featured_work, 6);
});

test("Home content selections reject duplicates and invalid section targets", async () => {
  const { validateHomeSelectionSet } = await homeData;
  assert.throws(
    () => validateHomeSelectionSet("latest_dispatch", [{ type: "game", id: 1 }, { type: "game", id: 1 }]),
    /cannot be selected twice/
  );
  assert.throws(
    () => validateHomeSelectionSet("worldbuilding_highlight", [{ type: "portfolio", id: 1 }]),
    /only reference Worldbuilding/
  );
  assert.throws(() => validateHomeSelectionSet("featured_work", [{ type: "portfolio", id: 0 }]), /invalid/);
  assert.throws(() => validateHomeSelectionSet("featured_work", [{ type: "unknown" as "portfolio", id: 1 }]), /type is invalid/);
});

test("Worldbuilding highlights preserve curation order, cap at three, and use a non-persistent fallback", async () => {
  const { resolveHomeWorldbuildingHighlights } = await homeData;
  const item = (id: number, sortOrder: number, overrides = {}) => ({
    selectionId: id,
    section: "worldbuilding_highlight" as const,
    sortOrder,
    type: "worldbuilding" as const,
    contentId: id,
    title: `Entry ${id}`,
    summary: "Existing summary",
    image: null,
    href: `/worldbuilding?item=${id}`,
    createdAt: new Date(2026, 0, id),
    ...overrides,
  });
  const fallback = [item(1, 0), item(2, 1), item(3, 2), item(4, 3)];
  const fallbackSnapshot = structuredClone(fallback);

  assert.deepEqual(resolveHomeWorldbuildingHighlights([], fallback).map((entry) => entry.contentId), [1, 2, 3]);
  assert.deepEqual(fallback, fallbackSnapshot);
  assert.deepEqual(resolveHomeWorldbuildingHighlights([item(3, 0), item(1, 1)], fallback).map((entry) => entry.contentId), [3, 1]);
});

test("Worldbuilding highlights support zero and partial states while dropping invalid references and routes", async () => {
  const { resolveHomeWorldbuildingHighlights } = await homeData;
  const valid = {
    selectionId: 1, section: "worldbuilding_highlight" as const, sortOrder: 0, type: "worldbuilding" as const,
    contentId: 7, title: "Canonical entry", summary: "", image: null, href: "/worldbuilding?item=7", createdAt: new Date(),
  };
  assert.deepEqual(resolveHomeWorldbuildingHighlights([], []), []);
  assert.deepEqual(resolveHomeWorldbuildingHighlights([valid], []).map((entry) => entry.contentId), [7]);
  assert.deepEqual(resolveHomeWorldbuildingHighlights([
    { ...valid, contentId: 0, href: "/worldbuilding?item=0" },
    { ...valid, contentId: 8, href: "/worldbuilding" },
    { ...valid, type: "portfolio" as const },
    valid,
  ], []), [valid]);
});

test("Latest dispatches validate canonical records, sort newest first, and cap at four", async () => {
  const { resolveHomeLatestDispatches } = await homeData;
  type Resolved = Parameters<typeof resolveHomeLatestDispatches>[0][number];
  const dispatch = (id: number, date: string, overrides: Partial<Resolved> = {}): Resolved => ({
    selectionId: id,
    section: "latest_dispatch",
    sortOrder: id,
    type: "portfolio",
    contentId: id,
    title: `Dispatch ${id}`,
    summary: "Real supporting text",
    image: null,
    href: `/portfolio?item=${id}`,
    createdAt: new Date(date),
    ...overrides,
  });

  const resolved = resolveHomeLatestDispatches([
    dispatch(1, "2026-01-01T00:00:00.000Z"),
    dispatch(2, "2026-04-01T00:00:00.000Z"),
    dispatch(3, "2026-03-01T00:00:00.000Z", { href: "/portfolio?item=99" }),
    dispatch(4, "invalid"),
    dispatch(5, "2026-05-01T00:00:00.000Z", { section: "featured_work" }),
    dispatch(6, "2026-06-01T00:00:00.000Z", { title: " " }),
    dispatch(7, "2026-02-01T00:00:00.000Z"),
    dispatch(8, "2026-05-01T00:00:00.000Z"),
    dispatch(9, "2026-07-01T00:00:00.000Z"),
  ]);

  assert.deepEqual(resolved.map((item) => item.contentId), [9, 8, 2, 7]);
  assert.deepEqual(resolved.map((item) => item.href), [
    "/portfolio?item=9",
    "/portfolio?item=8",
    "/portfolio?item=2",
    "/portfolio?item=7",
  ]);
  assert.deepEqual(resolveHomeLatestDispatches([]), []);
});

test("Home map preview pin limits and uniqueness are enforced", async () => {
  const { HOME_MAP_PINS_LIMIT, validateHomeMapPinSet } = await homeData;
  assert.doesNotThrow(() => validateHomeMapPinSet(Array.from({ length: HOME_MAP_PINS_LIMIT }, (_, index) => index + 1)));
  assert.throws(() => validateHomeMapPinSet([1, 1]), /cannot be selected twice/);
  assert.throws(
    () => validateHomeMapPinSet(Array.from({ length: HOME_MAP_PINS_LIMIT + 1 }, (_, index) => index + 1)),
    /at most 5/
  );
});

test("Home map preview respects visibility, canonical map, order, limit, and invalid pins", async () => {
  const { HOME_MAP_PINS_LIMIT, resolveHomeMapPreview } = await homeData;
  const map = { id: 7, title: "KRUPNI", parentMapId: null, imageUrl: "/map.webp", description: "", sortOrder: 0, createdAt: new Date() };
  const pin = (id: number, mapId = 7, x = 50) => ({ id, mapId, name: `Pin ${id}`, x, y: 50, pinType: "lore", targetMapId: null, entryId: null, iconType: "default", info: "", img: null, sortOrder: id, priority: 0, minZoom: 1, maxZoom: 5 });
  const rows = [pin(3), pin(1), pin(2, 99), pin(4, 7, 120), pin(3), pin(5), pin(6), pin(7), pin(8)];

  assert.equal(resolveHomeMapPreview({ isVisible: false, mapId: 7 }, map, rows), null);
  assert.equal(resolveHomeMapPreview({ isVisible: true, mapId: 8 }, map, rows), null);
  assert.deepEqual(resolveHomeMapPreview({ isVisible: true, mapId: 7 }, map, rows)?.pins.map((item) => item.id), [3, 1, 5, 6, 7]);
  assert.equal(resolveHomeMapPreview({ isVisible: true, mapId: 7 }, map, rows)?.pins.length, HOME_MAP_PINS_LIMIT);
  assert.deepEqual(resolveHomeMapPreview({ isVisible: true, mapId: 7 }, map, [])?.pins, []);
});

test("unsupported production stats remain unavailable", async () => {
  const { isHomeStatSupported, resolveHomeProductionStats } = await homeData;
  assert.equal(isHomeStatSupported("stories_devlogs"), false);
  assert.equal(isHomeStatSupported("published_entries"), false);
  assert.equal(isHomeStatSupported("3d_works"), true);
  const stats = resolveHomeProductionStats(
    { "3d_works": 12, "2d_works": 8, worldbuilding_entries: 5, game_projects: 2 },
    [
      { key: "worldbuilding_entries", isVisible: true },
      { key: "published_entries", isVisible: true },
      { key: "3d_works", isVisible: true },
      { key: "2d_works", isVisible: false },
    ]
  );
  assert.deepEqual(
    stats.filter((stat) => stat.available && stat.isVisible).map(({ key, count }) => ({ key, count })),
    [
      { key: "3d_works", count: 12 },
      { key: "worldbuilding_entries", count: 5 },
    ]
  );
  assert.deepEqual(
    stats.find((stat) => stat.key === "published_entries"),
    { key: "published_entries", label: "Published Entries", count: null, available: false, isVisible: false }
  );
});

test("production stats support partial and zero public availability without manual values", async () => {
  const { resolveHomeProductionStats } = await homeData;
  const partial = resolveHomeProductionStats({ game_projects: 0 }, [{ key: "game_projects", isVisible: true }]);
  assert.deepEqual(
    partial.filter((stat) => stat.available && stat.isVisible).map(({ key, count }) => ({ key, count })),
    [{ key: "game_projects", count: 0 }]
  );
  const none = resolveHomeProductionStats({ "3d_works": 4 }, []);
  assert.equal(none.some((stat) => stat.isVisible), false);
  assert.equal(Object.values(partial).some((stat) => "manualValue" in stat || "value" in stat), false);
});

test("Home Skills enforce the limit, required labels, and case-insensitive uniqueness", async () => {
  const { validateHomeSkills } = await homeData;
  assert.throws(() => validateHomeSkills(Array.from({ length: 7 }, (_, index) => ({ label: `Skill ${index}`, isVisible: true }))), /at most 6/);
  assert.throws(() => validateHomeSkills([{ label: "Unreal", isVisible: true }, { label: "unreal", isVisible: false }]), /must be unique/);
  assert.throws(() => validateHomeSkills([{ label: "  ", isVisible: true }]), /is required/);
  assert.deepEqual(validateHomeSkills([{ label: "  Game Design  ", isVisible: false }]), ["Game Design"]);
});

test("ordered persistence payloads preserve explicit order and visibility", async () => {
  const { homeSelectionValues, homeSkillValues } = await homeData;
  assert.deepEqual(
    homeSelectionValues("featured_work", [{ type: "game", id: 9 }, { type: "portfolio", id: 3 }]).map(({ sortOrder, gameId, portfolioId }) => ({ sortOrder, gameId, portfolioId })),
    [{ sortOrder: 0, gameId: 9, portfolioId: null }, { sortOrder: 1, gameId: null, portfolioId: 3 }]
  );
  assert.deepEqual(homeSkillValues([{ label: "Visible", isVisible: true }, { label: "Hidden", isVisible: false }]), [
    { label: "Visible", isVisible: true, sortOrder: 0 },
    { label: "Hidden", isVisible: false, sortOrder: 1 },
  ]);
});
