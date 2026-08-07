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

test("unsupported production stats remain unavailable", async () => {
  const { isHomeStatSupported } = await homeData;
  assert.equal(isHomeStatSupported("stories_devlogs"), false);
  assert.equal(isHomeStatSupported("published_entries"), false);
  assert.equal(isHomeStatSupported("3d_works"), true);
});
