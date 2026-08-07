import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services, heroButtons, homeHeroSlides, homeShowcase, worldbuildingEntries, games, models3d } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import InlineBold from "@/components/InlineBold";
import HeroCarousel from "@/components/HeroCarousel";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import Reveal from "@/components/Reveal";
import ActionLink from "@/components/ActionLink";
import { fieldStyle } from "@/lib/style-fields";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { isOptimizableImageUrl } from "@/lib/image-host";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [
    servicesList,
    settings,
    buttons,
    appearance,
    heroSlideRows,
    showcaseRows,
    wbFeatured,
    gameFeatured,
    modelFeatured,
  ] = await Promise.all([
    db.select().from(services).orderBy(services.sortOrder),
    getSiteSettings(),
    db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)),
    getPageAppearance("home"),
    db.select().from(homeHeroSlides).orderBy(asc(homeHeroSlides.sortOrder)),
    db.select().from(homeShowcase).orderBy(asc(homeShowcase.sortOrder)).limit(12),
    db.select().from(worldbuildingEntries).orderBy(asc(worldbuildingEntries.sortOrder)).limit(1),
    db.select().from(games).orderBy(asc(games.sortOrder)).limit(1),
    db.select().from(models3d).orderBy(asc(models3d.sortOrder)).limit(1),
  ]);

  const heroSlides =
    heroSlideRows.length > 0
      ? heroSlideRows
      : settings.homeBgImage
        ? [{ id: -1, url: settings.homeBgImage, title: null, subtitle: null, linkUrl: null }]
        : [];

  const pillars = [
    { label: "Worldbuilding Chronicles", href: "/worldbuilding", img: wbFeatured[0]?.img ?? "" },
    { label: "Game Projects", href: "/games", img: gameFeatured[0]?.img ?? "" },
    { label: "3D Renders & Environments", href: "/3d", img: modelFeatured[0]?.img ?? "" },
  ];

  return (
    <div className="page home-page" style={pageAppearanceVars(appearance)}>
      {heroSlides.length > 0 && (
        // The hero background is a CSS background-image (HeroCarousel), so it
        // can't use next/image's own preload prop -- this is the equivalent
        // resource hint for the one slide that's actually the initial LCP
        // candidate (index 0, per HeroCarousel's useState(0)). React 19 hoists
        // <link> tags to <head> regardless of where they render in the tree.
        <link rel="preload" as="image" href={heroSlides[0].url} fetchPriority="high" />
      )}
      <div className="home-hero-band">
        <HeroCarousel
          slides={heroSlides}
          opacity={settings.homeBgOpacity}
          width={settings.homeBgWidth}
          height={settings.homeBgHeight}
        />
        <Reveal className="home-hero">
          <div className="home-glow" aria-hidden="true" />
          <div className="home-hero-copy">
            <div className="h-eyebrow" style={fieldStyle(settings.styles, "heroEyebrow")}>{settings.heroEyebrow}</div>
            <h1 className="h-name">{settings.handle}</h1>
            <div className="h-identity">
              <span className="h-identity-label">Creator / Designer</span>
              <span className="h-identity-name">{settings.name}</span>
            </div>
          </div>
          <div className="home-hero-context">
            <div className="h-jp" style={fieldStyle(settings.styles, "heroJpLine")}>{settings.heroJpLine}</div>
            <div className="h-rule" aria-hidden="true" />
            <p className="h-bio" style={fieldStyle(settings.styles, "heroBio")}>
              <InlineBold text={settings.heroBio} />
            </p>
            <div className="h-btns">
              {buttons.map((b) => (
                <ActionLink key={b.id} href={b.href} variant={b.style === "primary" ? "primary" : "ghost"}>
                  {b.label}
                </ActionLink>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {settings.narrativeImage && settings.narrativeText && (
        <Reveal className="home-narrative">
          <div className="narr-grid">
            <div className="narr-frame">
              <Image
                src={settings.narrativeImage}
                alt=""
                fill
                sizes="(max-width: 820px) 100vw, 50vw"
                unoptimized={!isOptimizableImageUrl(settings.narrativeImage)}
              />
            </div>
            <div>
              <div className="narr-eyebrow">Creative Vision</div>
              <h2 className="narr-title">Building Worlds From The Ground Up</h2>
              <p className="narr-text">{settings.narrativeText}</p>
            </div>
          </div>
        </Reveal>
      )}

      {showcaseRows.length > 0 && (
        <Reveal className="home-showcase">
          <div className="sc-heading">
            <h2 className="sc-title">Selected Work</h2>
          </div>
          <ShowcaseCarousel items={showcaseRows} />
        </Reveal>
      )}

      <Reveal className="home-pillars">
        <div className="pillar-grid">
          {pillars.map((p) => (
            <Link key={p.href} href={p.href} className="pillar-card">
              {p.img && (
                <Image
                  src={p.img}
                  alt=""
                  fill
                  sizes="(max-width: 820px) 100vw, (max-width: 1060px) 50vw, 33vw"
                  unoptimized={!isOptimizableImageUrl(p.img)}
                />
              )}
              <div className="pillar-label">
                {p.label} <span className="pillar-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="home-services">
        <h2 className="hs-title">Focus Areas</h2>
        <div className="hs-sub">Environment design, hardsurface modeling, and worldbuilding — where my practice is focused</div>
        <div className="hs-grid">
          {servicesList.map((s) => (
            <div className="hs-card" key={s.id}>
              <div className="hs-icon">{s.icon}</div>
              <div className="hs-card-title">{s.title}</div>
              <div className="hs-card-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="home-contact">
        {settings.contactBgImage && (
          <div
            className="contact-bg-image"
            style={{ backgroundImage: `url(${settings.contactBgImage})`, opacity: settings.contactBgOpacity / 100 }}
          />
        )}
        <h2 className="hc-title">Let&apos;s Work Together</h2>
        <p className="hc-sub">
          Interested in collaborating on your next project? Let&apos;s create something together.
        </p>
        <ActionLink href={`mailto:${settings.contactEmail}`}>Get in Touch</ActionLink>
      </Reveal>
    </div>
  );
}
