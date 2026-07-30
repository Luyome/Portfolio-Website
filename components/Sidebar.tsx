"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteSettings = {
  name: string;
  handle: string;
  jpLabel: string;
  footerLine: string;
  twitterUrl: string;
  artstationUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
};

const NAV_GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  { label: "Index", items: [{ href: "/", label: "Home" }] },
  {
    label: "Work",
    items: [
      { href: "/portfolio", label: "Portfolio" },
      { href: "/sketches", label: "Sketches" },
      { href: "/worldbuilding", label: "Worldbuilding" },
      { href: "/games", label: "Games" },
    ],
  },
  { label: "Info", items: [{ href: "/about", label: "About" }] },
];

export default function Sidebar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-label">Personal Archive</div>
        <div className="sb-name">{settings.name}</div>
        <div className="sb-handle">{settings.handle}</div>
        <div className="sb-jp">{settings.jpLabel}</div>
      </div>
      <nav className="sb-nav">
        {NAV_GROUPS.map((group) => (
          <div className="sb-grp" key={group.label}>
            <div className="sb-grp-lbl">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-btn ${isActive(item.href) ? "on" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sb-archive-wrap">
        <Link href="/archive" className="sb-archive-btn">
          <span>Archive by Year</span>
          <span className="arr">→</span>
        </Link>
      </div>
      <div className="sb-foot">
        <p>{settings.footerLine}</p>
        <div className="sb-links">
          {settings.twitterUrl && (
            <a href={settings.twitterUrl} target="_blank" rel="noreferrer">Twitter / X</a>
          )}
          {settings.artstationUrl && (
            <a href={settings.artstationUrl} target="_blank" rel="noreferrer">ArtStation</a>
          )}
          {settings.linkedinUrl && (
            <a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
          )}
          {settings.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
          )}
        </div>
      </div>
    </aside>
  );
}
