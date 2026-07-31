"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { ADMIN_NAV } from "@/lib/admin-nav";
import BackToSiteButton from "@/components/admin/BackToSiteButton";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="adm-sb">
      <div className="adm-sb-brand">
        <div className="adm-sb-logo">A</div>
        <div>
          <div className="adm-sb-title">Admin Panel</div>
          <div className="adm-sb-sub">Site Management</div>
        </div>
      </div>
      <nav className="adm-sb-nav">
        {ADMIN_NAV.map((section, i) => (
          <div key={section.section ?? `top-${i}`} className="adm-sb-group">
            {section.section && <div className="adm-sb-section-label">{section.section}</div>}
            {section.items.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`adm-sb-link ${isActive(l.href) ? "on" : ""}`}
              >
                <span className="adm-sb-dot" />
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="adm-sb-foot">
        <form action={logoutAction}>
          <button type="submit" className="adm-sb-logout">Log Out</button>
        </form>
        <BackToSiteButton />
      </div>
    </aside>
  );
}
