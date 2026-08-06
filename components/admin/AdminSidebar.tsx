"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ADMIN_NAV } from "@/lib/admin-nav";
import BackToSiteButton from "@/components/admin/BackToSiteButton";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const activeLabel =
    ADMIN_NAV.flatMap((section) => section.items).find((l) => isActive(l.href))?.label ?? "Admin Panel";

  // Drawer: Escape closes it and returns focus to the button that opened it,
  // matching the public Header's mobile menu (components/Header.tsx).
  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        burgerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  // Background scroll is locked while the drawer covers the screen, restored
  // on close or unmount.
  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  function closeDrawerAndReturnFocus() {
    setDrawerOpen(false);
    burgerRef.current?.focus();
  }

  const navLinks = (onLinkClick?: () => void) => (
    <nav className="adm-sb-nav">
      {ADMIN_NAV.map((section, i) => (
        <div key={section.section ?? `top-${i}`} className="adm-sb-group">
          {section.section && <div className="adm-sb-section-label">{section.section}</div>}
          {section.items.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`adm-sb-link ${isActive(l.href) ? "on" : ""}`}
              aria-current={isActive(l.href) ? "page" : undefined}
              onClick={onLinkClick}
            >
              <span className="adm-sb-dot" />
              {l.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  const brand = (
    <div className="adm-sb-brand">
      <div className="adm-sb-logo">A</div>
      <div>
        <div className="adm-sb-title">Admin Panel</div>
        <div className="adm-sb-sub">Site Management</div>
      </div>
    </div>
  );

  const footer = (
    <div className="adm-sb-foot">
      <form action={logoutAction}>
        <button type="submit" className="adm-sb-logout">Log Out</button>
      </form>
      <BackToSiteButton />
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — unchanged, hidden below 820px (see globals.css). */}
      <aside className="adm-sb">
        {brand}
        {navLinks()}
        {footer}
      </aside>

      {/* Mobile/tablet replacement — hidden at desktop width via globals.css. */}
      <header className="adm-topbar">
        <button
          type="button"
          ref={burgerRef}
          className={`adm-topbar-burger ${drawerOpen ? "open" : ""}`}
          aria-expanded={drawerOpen}
          aria-controls="adm-mobile-drawer"
          aria-label={drawerOpen ? "Close admin menu" : "Open admin menu"}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <span className="adm-topbar-section">{activeLabel}</span>
      </header>

      {drawerOpen && (
        <div className="adm-drawer-backdrop" onClick={closeDrawerAndReturnFocus} />
      )}
      {drawerOpen && (
        <div className="adm-drawer" id="adm-mobile-drawer">
          {brand}
          {navLinks(() => setDrawerOpen(false))}
          {footer}
        </div>
      )}
    </>
  );
}
