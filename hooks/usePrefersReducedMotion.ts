"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// React never calls this server-side; it only ever runs `getServerSnapshot`
// there, which always reports "not reduced" (there's no `window` to read).
function getServerSnapshot() {
  return false;
}

// Tracks the visitor's OS-level `prefers-reduced-motion: reduce` setting so
// client components can skip triggering entrance/looping animation logic
// (IntersectionObserver reveals, autoplay intervals, spatial transitions)
// once mounted. Built on `useSyncExternalStore` rather than a manual
// `useState`+`useEffect` subscription — React renders with
// `getServerSnapshot` (`false`) on the server and on the first client
// render, so that render matches the server-rendered HTML exactly (no
// hydration mismatch), then reconciles against the real `getSnapshot`
// value immediately after mount.
//
// Visual correctness for reduced-motion visitors does not depend on this
// hook's timing: the matching `@media (prefers-reduced-motion: reduce)`
// rules in globals.css apply from the very first paint, before any
// JavaScript runs. This hook only lets components stop doing unnecessary
// animation work once they're mounted — it is not the thing that hides or
// reveals content.
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
