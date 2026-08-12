"use client";

import { useEffect, useRef, useState } from "react";
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
  { href: "/2d", label: "2D" },
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
  const workRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const workActive = WORK_LINKS.some((l) => isActive(l.href));

  // Work dropdown: closes on Escape (returning focus to its trigger) and on
  // focus/click moving outside the dropdown, so it never opens on hover-only
  // for mouse users but stays keyboard/click operable for everyone else.
  useEffect(() => {
    if (!workOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setWorkOpen(false);
        workRef.current?.querySelector<HTMLButtonElement>(".hn-link")?.focus();
      }
    }
    function onPointerDown(e: MouseEvent) {
      if (workRef.current && !workRef.current.contains(e.target as Node)) setWorkOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [workOpen]);

  // Mobile menu: Escape closes it, matching the Work dropdown and every
  // other overlay on the site.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="site-header w-full">
      <div className="hn-bar mx-auto flex items-center justify-between gap-4 px-6 py-4 md:px-12">
        <Link href="/" className="hn-brand shrink-0" onClick={() => setMobileOpen(false)}>
          {settings.name.toLocaleUpperCase("tr-TR")}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <Link href="/" className={`hn-link ${isActive("/") ? "on" : ""}`} aria-current={isActive("/") ? "page" : undefined}>
            Home
          </Link>
          <div
            className="relative"
            ref={workRef}
            onMouseEnter={() => setWorkOpen(true)}
            onMouseLeave={() => setWorkOpen(false)}
          >
            <button
              type="button"
              className={`hn-link ${workActive ? "on" : ""}`}
              aria-haspopup="true"
              aria-expanded={workOpen}
              aria-controls="hn-work-panel"
              onClick={() => setWorkOpen((v) => !v)}
            >
              Work
            </button>
            {/* Always mounted (visibility toggled via .open, not conditional
                render) so next/link's default viewport-based prefetch for
                every Work destination starts as soon as the header mounts
                instead of only at hover/tap time — see docs/08_ROADMAP.md's
                navigation-latency optimization entry. */}
            <div className={`absolute left-0 top-full pt-2 hn-dropdown-wrap ${workOpen ? "open" : ""}`}>
              <div className="hn-dropdown-panel" id="hn-work-panel" aria-hidden={!workOpen} inert={!workOpen}>
                {WORK_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`hn-dropdown-link ${isActive(l.href) ? "on" : ""}`}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    onClick={() => setWorkOpen(false)}
                    tabIndex={workOpen ? undefined : -1}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link
            href="/worldbuilding"
            className={`hn-link ${isActive("/worldbuilding") ? "on" : ""}`}
            aria-current={isActive("/worldbuilding") ? "page" : undefined}
          >
            Worldbuilding
          </Link>
          <Link
            href="/about"
            className={`hn-link ${isActive("/about") ? "on" : ""}`}
            aria-current={isActive("/about") ? "page" : undefined}
          >
            About &amp; Credentials
          </Link>
        </nav>

        <div className="hn-socials hidden items-center gap-4 md:flex">
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
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="hn-mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Always mounted (visibility toggled via .open, not conditional
          render) so next/link's default viewport-based prefetch for every
          Work destination starts as soon as the header mounts instead of
          only once the mobile menu is opened — see docs/08_ROADMAP.md's
          navigation-latency optimization entry. */}
      <nav
        className={`hn-mobile-panel md:hidden ${mobileOpen ? "open" : ""}`}
        id="hn-mobile-nav"
        aria-label="Mobile"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`hn-mobile-link ${isActive("/") ? "on" : ""}`}
          aria-current={isActive("/") ? "page" : undefined}
          tabIndex={mobileOpen ? undefined : -1}
        >
          Home
        </Link>
        <div className="hn-mobile-group-label">Work</div>
        {WORK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            className={`hn-mobile-link sub ${isActive(l.href) ? "on" : ""}`}
            aria-current={isActive(l.href) ? "page" : undefined}
            tabIndex={mobileOpen ? undefined : -1}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/worldbuilding"
          onClick={() => setMobileOpen(false)}
          className={`hn-mobile-link ${isActive("/worldbuilding") ? "on" : ""}`}
          aria-current={isActive("/worldbuilding") ? "page" : undefined}
          tabIndex={mobileOpen ? undefined : -1}
        >
          Worldbuilding
        </Link>
        <Link
          href="/about"
          onClick={() => setMobileOpen(false)}
          className={`hn-mobile-link ${isActive("/about") ? "on" : ""}`}
          aria-current={isActive("/about") ? "page" : undefined}
          tabIndex={mobileOpen ? undefined : -1}
        >
          About &amp; Credentials
        </Link>
        <div className="hn-mobile-social">
          {settings.artstationUrl && (
            <a href={settings.artstationUrl} target="_blank" rel="noreferrer" aria-label="ArtStation" tabIndex={mobileOpen ? undefined : -1}>
              <ArtStationIcon />
            </a>
          )}
          {settings.twitterUrl && (
            <a href={settings.twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter / X" tabIndex={mobileOpen ? undefined : -1}>
              <TwitterIcon />
            </a>
          )}
          {settings.linkedinUrl && (
            <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" tabIndex={mobileOpen ? undefined : -1}>
              <LinkedInIcon />
            </a>
          )}
          {settings.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" tabIndex={mobileOpen ? undefined : -1}>
              <InstagramIcon />
            </a>
          )}
          {settings.githubUrl && (
            <a href={settings.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub" tabIndex={mobileOpen ? undefined : -1}>
              <GithubIcon />
            </a>
          )}
          <Link href="/admin" onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? undefined : -1}>
            Admin Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
