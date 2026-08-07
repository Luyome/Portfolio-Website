import assert from "node:assert/strict";
import test from "node:test";
import type { ResolvedHomeContent } from "./home-data";
import {
  SELECTED_WORK_DISPLAY_COUNT,
  buildSelectedWorkDisplayItems,
  selectedWorkPosition,
  wrapSelectedWorkIndex,
} from "./selected-work";

function realItems(count: number): ResolvedHomeContent[] {
  return Array.from({ length: count }, (_, index) => ({
    selectionId: index + 1,
    section: "featured_work",
    sortOrder: index,
    type: "portfolio",
    contentId: index + 20,
    title: `Real work ${index + 1}`,
    summary: index === 0 ? "Real summary" : "",
    image: index === 0 ? "/real.jpg" : null,
    href: "/portfolio",
    createdAt: new Date(2026, 0, index + 1),
  }));
}

test("Selected Work presentation fills every 0–6 real state to six without mutating curation", () => {
  for (let realCount = 0; realCount <= SELECTED_WORK_DISPLAY_COUNT; realCount++) {
    const source = realItems(realCount);
    const before = structuredClone(source);
    const display = buildSelectedWorkDisplayItems(source);
    assert.equal(display.length, 6);
    assert.equal(display.filter((item) => !item.isPlaceholder).length, realCount);
    assert.equal(display.filter((item) => item.isPlaceholder).length, 6 - realCount);
    assert.deepEqual(source, before);
    assert.deepEqual(display.slice(0, realCount).map((item) => item.title), source.map((item) => item.title));
    assert.ok(display.filter((item) => item.isPlaceholder).every((item) => item.href === null));
  }
});

test("six real works remove every placeholder and extra input is presentation-limited", () => {
  assert.equal(buildSelectedWorkDisplayItems(realItems(6)).some((item) => item.isPlaceholder), false);
  assert.equal(buildSelectedWorkDisplayItems(realItems(7)).length, 6);
});

test("circular previous and next indices wrap across the six-item sequence", () => {
  assert.equal(wrapSelectedWorkIndex(-1, 6), 5);
  assert.equal(wrapSelectedWorkIndex(6, 6), 0);
  assert.deepEqual(Array.from({ length: 6 }, (_, active) => wrapSelectedWorkIndex(active + 1, 6)), [1, 2, 3, 4, 5, 0]);
});

test("only left, active, and right receive visible Coverflow positions", () => {
  assert.deepEqual(Array.from({ length: 6 }, (_, index) => selectedWorkPosition(index, 0, 6)), [0, 1, null, null, null, -1]);
  assert.deepEqual(Array.from({ length: 6 }, (_, index) => selectedWorkPosition(index, 3, 6)), [null, null, -1, 0, 1, null]);
});
