import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { heroButtons, homeHeroSlides, worldbuildingEntries, games, models3d } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import InlineBold from "@/components/InlineBold";
import HeroCarousel from "@/components/HeroCarousel";
import SelectedWorkCoverflow from "@/components/SelectedWorkCoverflow";
import Reveal from "@/components/Reveal";
import ActionLink from "@/components/ActionLink";
import { fieldStyle } from "@/lib/style-fields";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { isOptimizableImageUrl } from "@/lib/image-host";
import { getHomeCapabilitiesAndSkills, getHomeFeaturedWorks } from "@/lib/home-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function alignPrimaryPositioning(copy: string): string {
  return copy.replace(/games with Unreal Engine(?:\s*5)?/gi, "games and immersive worlds");
}

export default async function HomePage() {
  const [
    homePractice,
    settings,
    buttons,
    appearance,
    heroSlideRows,
    featuredWorks,
    wbFeatured,
    gameFeatured,
    modelFeatured,
  ] = await Promise.all([
    getHomeCapabilitiesAndSkills(),
    getSiteSettings(),
    db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)),
    getPageAppearance("home"),
    db.select().from(homeHeroSlides).orderBy(asc(homeHeroSlides.sortOrder)),
    getHomeFeaturedWorks(),
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
              <span className="h-identity-name">{settings.name}</span>
              <span className="h-identity-label">Game Designer / Worldbuilder</span>
            </div>
          </div>
          <div className="home-hero-context">
            <div className="h-jp" style={fieldStyle(settings.styles, "heroJpLine")}>{settings.heroJpLine}</div>
            <div className="h-rule" aria-hidden="true" />
            <p className="h-bio" style={fieldStyle(settings.styles, "heroBio")}>
              <InlineBold text={alignPrimaryPositioning(settings.heroBio)} />
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

      <SelectedWorkCoverflow items={featuredWorks} />

      <section id="capabilities" className="home-practice" aria-labelledby="home-practice-title">
        <Reveal className="hp-capabilities">
          <div className="hp-heading">
            <div>
              <div className="hp-kicker">Capabilities</div>
              <h2 id="home-practice-title">What I Do</h2>
            </div>
            <p>Disciplines I bring together to shape playable ideas, visual spaces, and coherent worlds.</p>
          </div>

          {homePractice.capabilities.length > 0 && (
            <ol className="hp-capability-list">
              {homePractice.capabilities.map((capability, index) => (
                <li key={capability.id} className="hp-capability">
                  <span className="hp-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.desc}</p>
                </li>
              ))}
            </ol>
          )}
        </Reveal>

        {homePractice.skills.length > 0 && (
          <Reveal className="hp-skills">
            <div className="hp-skills-intro">
              <div className="hp-kicker">Working Practice</div>
              <h2>Skills &amp; Tools</h2>
              <p>A focused set of disciplines and production tools used across the work.</p>
            </div>
            <ol className="hp-skill-list">
              {homePractice.skills.map((skill, index) => (
                <li key={skill.id}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{skill.label}</strong>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </section>

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
