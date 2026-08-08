"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ADMIN_NAV } from "@/lib/admin-nav";

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
              <span className="ta-nav-icon" aria-hidden="true" />
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
