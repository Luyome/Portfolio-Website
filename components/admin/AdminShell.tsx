"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ADMIN_NAV } from "@/lib/admin-nav";

function NavGlyph({ label }: { label: string }) {
  const key = label.toLowerCase();
  const paths: Record<string, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.02 2.02-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20.2h-2.86v-.08A1.7 1.7 0 0 0 10.9 18.6a1.7 1.7 0 0 0-1.88.34l-.06.06-2.02-2.02.06-.06A1.7 1.7 0 0 0 7.34 15 1.7 1.7 0 0 0 5.8 13.97h-.08v-2.86h.08A1.7 1.7 0 0 0 7.34 10.1 1.7 1.7 0 0 0 7 8.22l-.06-.06 2.02-2.02.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.94 5v-.08h2.86V5a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.02 2.02-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.08v2.86h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
    archive: <><path d="M4 7h16v13H4z" /><path d="M3 4h18v3H3zM9 11h6" /></>,
    appearance: <><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" /></>,
    home: <><path d="m3 11 9-8 9 8v10H3z" /><path d="M9 21v-6h6v6" /></>,
  };
  const fallback = <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12h8M8 16h5" /></>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[key] ?? fallback}</svg>;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);
  const activeLabel = ADMIN_NAV.flatMap(({ items }) => items).find(({ href }) => isActive(href))?.label ?? "Admin";

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const closeMobile = () => { setMobileOpen(false); toggleRef.current?.focus(); };
  const navigation = (
    <nav className="ta-nav" aria-label="Admin navigation">
      {ADMIN_NAV.map(({ section, items }, index) => (
        <section className="ta-nav-group" key={section ?? index}>
          {section && <h2 className="ta-nav-label">{section}</h2>}
          {items.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`ta-nav-link ${isActive(href) ? "is-active" : ""}`} aria-current={isActive(href) ? "page" : undefined}>
              <span className="ta-nav-icon"><NavGlyph label={label} /></span>
              <span>{label}</span>
            </Link>
          ))}
        </section>
      ))}
    </nav>
  );
  const footer = <div className="ta-sidebar-footer"><Link href="/" className="ta-site-link">View Website <span aria-hidden="true">↗</span></Link><form action={logoutAction}><button type="submit" className="ta-logout">Log out</button></form></div>;

  return <div className={`ta-shell ${collapsed ? "is-collapsed" : ""}`}>
    <aside id="admin-sidebar" className={`ta-sidebar ${mobileOpen ? "is-mobile-open" : ""}`} aria-label="Admin sidebar">
      <Link href="/admin" className="ta-brand" aria-label="Tetsunaru Admin dashboard"><span className="ta-brand-mark">T</span><span className="ta-brand-copy"><strong>TETSUNARU</strong><small>ADMIN</small></span></Link>
      {navigation}{footer}
    </aside>
    {mobileOpen && <button className="ta-backdrop" aria-label="Close admin menu" onClick={closeMobile} />}
    <div className="ta-content">
      <header className="ta-header">
        <button ref={toggleRef} type="button" className="ta-menu-toggle" aria-expanded={mobileOpen} aria-controls="admin-sidebar" aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"} onClick={() => window.innerWidth < 1024 ? setMobileOpen((value) => !value) : setCollapsed((value) => !value)}><i /><i /><i /></button>
        <div className="ta-header-context"><span>Control panel</span><strong>{activeLabel}</strong></div>
        <Link href="/" className="ta-header-site">View Website <span aria-hidden="true">↗</span></Link>
      </header>
      <main className="ta-main"><div className="adm-wrap">{children}</div></main>
    </div>
  </div>;
}
