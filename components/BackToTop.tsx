"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 480;

/**
 * Conventional fixed bottom-right "back to top" control. Deliberately
 * independent of any page section's layout/composition -- rendered as a
 * sibling outside `.home-page` (which has `overflow:hidden`, and would clip
 * a fixed-position descendant once scrolled past its own box) so it stays
 * anchored to the viewport for the full scroll range, including past the
 * Home page content into the Footer.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      className="back-to-top"
      data-visible={visible}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label="Back to top"
      onClick={handleClick}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
        <path d="M7 2 12 9 9 9 9 12 5 12 5 9 2 9Z" fill="currentColor" />
      </svg>
    </button>
  );
}
