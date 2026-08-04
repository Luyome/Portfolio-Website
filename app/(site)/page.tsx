import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services, heroButtons, homeHeroSlides, homeShowcase, worldbuildingEntries, games, models3d } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import InlineBold from "@/components/InlineBold";
import HeroCarousel from "@/components/HeroCarousel";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import Reveal from "@/components/Reveal";
import { fieldStyle } from "@/lib/style-fields";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

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
      <div className="home-hero-band">
        <HeroCarousel
          slides={heroSlides}
          opacity={settings.homeBgOpacity}
          width={settings.homeBgWidth}
          height={settings.homeBgHeight}
        />
        <Reveal className="home-hero">
          <div className="home-glow" />
          <div className="h-eyebrow" style={fieldStyle(settings.styles, "heroEyebrow")}>{settings.heroEyebrow}</div>
          <h1 className="h-name">{settings.name.toLocaleUpperCase("tr-TR")}</h1>
          <div className="h-jp" style={fieldStyle(settings.styles, "heroJpLine")}>{settings.heroJpLine}</div>
          <div className="h-rule" />
          <p className="h-bio" style={fieldStyle(settings.styles, "heroBio")}>
            <InlineBold text={settings.heroBio} />
          </p>
          <div className="h-btns">
            {buttons.map((b) => (
              <Link key={b.id} className={`hbtn ${b.style === "primary" ? "hbtn-p" : "hbtn-g"}`} href={b.href}>
                {b.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>

      {settings.narrativeImage && settings.narrativeText && (
        <Reveal className="home-narrative">
          <div className="narr-grid">
            <div className="narr-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.narrativeImage} alt="" />
            </div>
            <div>
              <div className="narr-eyebrow">Creative Vision</div>
              <div className="narr-title">Building Worlds From The Ground Up</div>
              <p className="narr-text">{settings.narrativeText}</p>
            </div>
          </div>
        </Reveal>
      )}

      {showcaseRows.length > 0 && (
        <Reveal className="home-showcase">
          <div className="sc-heading">
            <div className="sc-title">Selected Work</div>
          </div>
          <ShowcaseCarousel items={showcaseRows} />
        </Reveal>
      )}

      <Reveal className="home-pillars">
        <div className="pillar-grid">
          {pillars.map((p) => (
            <Link key={p.href} href={p.href} className="pillar-card">
              {p.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.img} alt="" />
              )}
              <div className="pillar-label">
                {p.label} <span className="pillar-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="home-services">
        <div className="hs-title">Focus Areas</div>
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
        <div className="hc-title">Let&apos;s Work Together</div>
        <p className="hc-sub">
          Interested in collaborating on your next project? Let&apos;s create something together.
        </p>
        <a href={`mailto:${settings.contactEmail}`} className="hbtn hbtn-p">
          Get in Touch
        </a>
      </Reveal>
    </div>
  );
}
