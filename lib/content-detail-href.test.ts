import assert from "node:assert/strict";
import test from "node:test";
import { findContentItemIndex, parseContentItemId, resolveContentDetailHref } from "./content-detail-href";

test("eligible content families resolve to exact item deep links, never category indexes", () => {
  const cases = [
    ["portfolio", 11, "/portfolio?item=11"],
    ["sketch", 12, "/2d?item=12"],
    ["model3d", 13, "/3d?item=13"],
    ["worldbuilding", 14, "/worldbuilding?item=14"],
    ["game", 15, "/games?item=15"],
  ] as const;

  for (const [type, id, expected] of cases) {
    const href = resolveContentDetailHref(type, id);
    assert.equal(href, expected);
    assert.notEqual(href, expected.split("?")[0]);
  }
});

test("invalid item identifiers fail gracefully", () => {
  assert.equal(resolveContentDetailHref("portfolio", 0), null);
  assert.equal(resolveContentDetailHref("portfolio", Number.NaN), null);
  assert.equal(parseContentItemId(undefined), null);
  assert.equal(parseContentItemId(["1", "2"]), null);
  assert.equal(parseContentItemId("not-an-id"), null);
  assert.equal(parseContentItemId("7"), 7);
});

test("deleted or unknown records do not open an unrelated item", () => {
  const items = [{ id: 2 }, { id: 8 }];
  assert.equal(findContentItemIndex(items, 8), 1);
  assert.equal(findContentItemIndex(items, 99), null);
  assert.equal(findContentItemIndex(items, null), null);
});
