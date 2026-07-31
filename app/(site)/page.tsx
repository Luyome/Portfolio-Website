import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services, heroButtons } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import InlineBold from "@/components/InlineBold";

export default async function HomePage() {
  const [servicesList, settings, buttons] = await Promise.all([
    db.select().from(services).orderBy(services.sortOrder),
    getSiteSettings(),
    db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)),
  ]);

  return (
    <div className="page home-page">
      {settings.homeBgImage && (
        <div
          className="home-bg-image"
          style={{ backgroundImage: `url(${settings.homeBgImage})`, opacity: settings.homeBgOpacity / 100 }}
        />
      )}
      <div className="home-glow" />

      <div className="home-hero">
        <div className="h-eyebrow">{settings.heroEyebrow}</div>
        <h1 className="h-name">{settings.name.toLocaleUpperCase("tr-TR")}</h1>
        <div className="h-jp">{settings.heroJpLine}</div>
        <div className="h-rule" />
        <p className="h-bio">
          <InlineBold text={settings.heroBio} />
        </p>
        <div className="h-btns">
          {buttons.map((b) => (
            <Link key={b.id} className={`hbtn ${b.style === "primary" ? "hbtn-p" : "hbtn-g"}`} href={b.href}>
              {b.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="home-services">
        <div className="hs-title">Services</div>
        <div className="hs-sub">Professional 3D character creation &amp; game design services</div>
        <div className="hs-grid">
          {servicesList.map((s) => (
            <div className="hs-card" key={s.id}>
              <div className="hs-icon">{s.icon}</div>
              <div className="hs-card-title">{s.title}</div>
              <div className="hs-card-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-contact">
        <div className="hc-title">Let&apos;s Work Together</div>
        <p className="hc-sub">
          Interested in collaborating on your next project? Let&apos;s create something together.
        </p>
        <a href={`mailto:${settings.contactEmail}`} className="hbtn hbtn-p">
          Get in Touch
        </a>
      </div>
    </div>
  );
}
