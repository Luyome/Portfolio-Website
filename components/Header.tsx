"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TwitterIcon, ArtStationIcon, GithubIcon, LinkedInIcon, InstagramIcon } from "./SocialIcons";

type SiteSettings = {
  name: string;
  twitterUrl: string;
  artstationUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
};

const WORK_LINKS: { href: string; label: string }[] = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/sketches", label: "Sketches" },
  { href: "/3d", label: "3D" },
  { href: "/games", label: "Games" },
  { href: "/archive", label: "Archive by Year" },
];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [workOpen, setWorkOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const workActive = WORK_LINKS.some((l) => isActive(l.href));

  return (
    <header className="site-header w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-12">
        <Link href="/" className="hn-brand shrink-0" onClick={() => setMobileOpen(false)}>
          {settings.name.toLocaleUpperCase("tr-TR")}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className={`hn-link ${isActive("/") ? "on" : ""}`}>
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setWorkOpen(true)}
            onMouseLeave={() => setWorkOpen(false)}
          >
            <button type="button" className={`hn-link ${workActive ? "on" : ""}`}>
              Work
            </button>
            {workOpen && (
              <div className="absolute left-0 top-full pt-2">
                <div className="hn-dropdown-panel">
                  {WORK_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className={`hn-dropdown-link ${isActive(l.href) ? "on" : ""}`}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/worldbuilding" className={`hn-link ${isActive("/worldbuilding") ? "on" : ""}`}>
            Worldbuilding
          </Link>
          <Link href="/about" className={`hn-link ${isActive("/about") ? "on" : ""}`}>
            About &amp; Credentials
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {settings.artstationUrl && (
            <a href={settings.artstationUrl} target="_blank" rel="noreferrer" className="hn-social" aria-label="ArtStation">
              <ArtStationIcon />
            </a>
          )}
          {settings.twitterUrl && (
            <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="hn-social" aria-label="Twitter / X">
              <TwitterIcon />
            </a>
          )}
          {settings.linkedinUrl && (
            <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="hn-social" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          )}
          {settings.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hn-social" aria-label="Instagram">
              <InstagramIcon />
            </a>
          )}
          {settings.githubUrl && (
            <a href={settings.githubUrl} target="_blank" rel="noreferrer" className="hn-social" aria-label="GitHub">
              <GithubIcon />
            </a>
          )}
          <Link href="/admin" className="hn-social" aria-label="Admin Login">
            <LockIcon />
          </Link>
        </div>

        <button
          type="button"
          className={`hn-burger md:hidden ${mobileOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mobileOpen && (
        <div className="hn-mobile-panel md:hidden">
          <Link href="/" onClick={() => setMobileOpen(false)} className={`hn-mobile-link ${isActive("/") ? "on" : ""}`}>
            Home
          </Link>
          <div className="hn-mobile-group-label">Work</div>
          {WORK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`hn-mobile-link sub ${isActive(l.href) ? "on" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/worldbuilding"
            onClick={() => setMobileOpen(false)}
            className={`hn-mobile-link ${isActive("/worldbuilding") ? "on" : ""}`}
          >
            Worldbuilding
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className={`hn-mobile-link ${isActive("/about") ? "on" : ""}`}>
            About &amp; Credentials
          </Link>
          <div className="hn-mobile-social">
            {settings.artstationUrl && (
              <a href={settings.artstationUrl} target="_blank" rel="noreferrer" aria-label="ArtStation">
                <ArtStationIcon />
              </a>
            )}
            {settings.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter / X">
                <TwitterIcon />
              </a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
            )}
            {settings.githubUrl && (
              <a href={settings.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GithubIcon />
              </a>
            )}
            <Link href="/admin" onClick={() => setMobileOpen(false)}>
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
