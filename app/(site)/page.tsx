import type { Metadata } from "next";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { heroButtons, homeHeroSlides } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import InlineBold from "@/components/InlineBold";
import HeroCarousel from "@/components/HeroCarousel";
import SelectedWorkCoverflow from "@/components/SelectedWorkCoverflow";
import HomeMapPreview from "@/components/HomeMapPreview";
import HomeWorldbuildingHighlights from "@/components/HomeWorldbuildingHighlights";
import HomeLatestDispatches from "@/components/HomeLatestDispatches";
import HomeContactSocial from "@/components/HomeContactSocial";
import BackToTop from "@/components/BackToTop";
import HomeSectionNav, { type HomeSectionNavItem } from "@/components/HomeSectionNav";
import Reveal from "@/components/Reveal";
import ActionLink from "@/components/ActionLink";
import { fieldStyle } from "@/lib/style-fields";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getHomeData, getHomeFeaturedWorks } from "@/lib/home-data";
import { resolveContactSocialLinks } from "@/lib/contact-social";
import { isOptimizableImageUrl } from "@/lib/image-host";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function alignPrimaryPositioning(copy: string): string {
  return copy.replace(/games with Unreal Engine(?:\s*5)?/gi, "games and immersive worlds");
}

export default async function HomePage() {
  const [
    settings,
    buttons,
    appearance,
    heroSlideRows,
    featuredWorks,
    homeData,
  ] = await Promise.all([
    getSiteSettings(),
    db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)),
    getPageAppearance("home"),
    db.select().from(homeHeroSlides).orderBy(asc(homeHeroSlides.sortOrder)),
    getHomeFeaturedWorks(),
    getHomeData(),
  ]);

  const visibleProductionStats = homeData.stats.filter(
    (stat): stat is (typeof homeData.stats)[number] & { count: number } =>
      stat.available && stat.isVisible && stat.count !== null
  );
  const contactSocialLinks = resolveContactSocialLinks(settings);

  // Only sections that actually render make it into the scrollspy rail.
  const navSections: HomeSectionNavItem[] = [
    { id: "home-hero", label: "Hero" },
    { id: "selected-work", label: "Selected Work" },
    { id: "capabilities", label: "Capabilities" },
    { id: "skills", label: "Skills" },
    ...(visibleProductionStats.length > 0 ? [{ id: "stats", label: "Production Stats" }] : []),
    ...(homeData.mapPreview ? [{ id: "home-map", label: "Atlas" }] : []),
    ...(homeData.worldbuildingHighlights.length > 0 ? [{ id: "worldbuilding-highlights", label: "Worldbuilding" }] : []),
    ...(homeData.latestDispatches.length > 0 ? [{ id: "dispatches", label: "Dispatches" }] : []),
    ...(contactSocialLinks.length > 0 ? [{ id: "contact", label: "Contact" }] : []),
  ];

  const heroSlides =
    heroSlideRows.length > 0
      ? heroSlideRows
      : settings.homeBgImage
        ? [{ id: -1, url: settings.homeBgImage, title: null, subtitle: null, linkUrl: null }]
        : [];

  return (
    <>
    <div className="page home-page" style={pageAppearanceVars(appearance)}>
      {heroSlides.length > 0 && (
        // The hero background is a CSS background-image (HeroCarousel), so it
        // can't use next/image's own preload prop -- this is the equivalent
        // resource hint for the one slide that's actually the initial LCP
        // candidate (index 0, per HeroCarousel's useState(0)). React 19 hoists
        // <link> tags to <head> regardless of where they render in the tree.
        <link rel="preload" as="image" href={heroSlides[0].url} fetchPriority="high" />
      )}
      <div className="home-hero-band" id="home-hero">
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

          {homeData.capabilities.length > 0 && (
            <ol className="hp-capability-list">
              {homeData.capabilities.map((capability, index) => (
                <li key={capability.id} className="hp-capability">
                  <span className="hp-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.desc}</p>
                </li>
              ))}
            </ol>
          )}
        </Reveal>
      </section>

      <section id="skills" className="home-skills" aria-labelledby="home-skills-title">
        <Reveal className="hsk-inner">
          <div className="hsk-heading">
            <div>
              <div className="hsk-kicker">Working Practice</div>
              <h2 id="home-skills-title">Skills &amp; Tools</h2>
            </div>
            <p>A focused set of disciplines and production tools used across the work.</p>
          </div>
          {homeData.skills.length > 0 ? (
            <ul className="hsk-grid">
              {homeData.skills.map((skill) => (
                <li key={skill.id} className="hsk-tile">
                  <span className="hsk-tile-icon">
                    {skill.iconUrl ? (
                      <Image src={skill.iconUrl} alt="" width={30} height={30} unoptimized={!isOptimizableImageUrl(skill.iconUrl)} />
                    ) : (
                      <span className="hsk-tile-glyph" aria-hidden="true">{skill.label.trim().slice(0, 2).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="hsk-tile-name">{skill.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hsk-empty">Tools and disciplines are being curated.</p>
          )}
        </Reveal>
      </section>

      {visibleProductionStats.length > 0 && (
        <section id="stats" className="home-stats" aria-labelledby="home-stats-title">
          <Reveal className="st-inner">
            <div className="st-heading">
              <div className="st-kicker">Production Range</div>
              <h2 id="home-stats-title">By The Numbers</h2>
            </div>
            <dl className="st-row">
              {visibleProductionStats.map((stat) => (
                <div key={stat.key}>
                  <dd>{stat.count.toLocaleString("en-US")}</dd>
                  <dt>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      )}

      {homeData.mapPreview && (
        <Reveal className="home-map-reveal">
          <HomeMapPreview {...homeData.mapPreview} />
        </Reveal>
      )}

      {homeData.worldbuildingHighlights.length > 0 && (
        <Reveal>
          <HomeWorldbuildingHighlights items={homeData.worldbuildingHighlights} />
        </Reveal>
      )}

      {homeData.latestDispatches.length > 0 && (
        <Reveal>
          <HomeLatestDispatches items={homeData.latestDispatches} />
        </Reveal>
      )}

      {contactSocialLinks.length > 0 && (
        <Reveal>
          <HomeContactSocial
            links={contactSocialLinks}
            images={[settings.contactBgImage, ...featuredWorks.map((item) => item.image), ...homeData.worldbuildingHighlights.map((item) => item.image)]
              .filter((image): image is string => Boolean(image))
              .filter((image, index, all) => all.indexOf(image) === index)
              .slice(0, 3)}
            artworks={[...featuredWorks, ...homeData.worldbuildingHighlights]
              .filter((item): item is typeof item & { image: string } => Boolean(item.image))
              .slice(0, 2)
              .map((item) => ({ title: item.title, image: item.image, href: item.href }))}
            backgroundOpacity={settings.contactBgOpacity}
          />
        </Reveal>
      )}
    </div>
    <HomeSectionNav sections={navSections} />
    <BackToTop />
    </>
  );
}
