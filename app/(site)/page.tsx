import Link from "next/link";
import { db } from "@/db";
import { services } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";

export default async function HomePage() {
  const [servicesList, settings] = await Promise.all([
    db.select().from(services).orderBy(services.sortOrder),
    getSiteSettings(),
  ]);

  return (
    <div className="page home-page">
      <div className="home-glow" />

      <div className="home-hero">
        <div className="h-eyebrow">Istanbul, Turkey — 2026</div>
        <h1 className="h-name">{settings.name.toLocaleUpperCase("tr-TR")}</h1>
        <div className="h-jp">ゲームデザイナー　物語　世界</div>
        <div className="h-rule" />
        <p className="h-bio">
          Game Designer &amp; worldbuilder. Building <strong>visceral, narrative-driven</strong>{" "}
          games with Unreal Engine 5. Currently developing <strong>The Abyss</strong> — a
          psychological horror anomaly game for Steam.
        </p>
        <div className="h-btns">
          <Link className="hbtn hbtn-p" href="/portfolio">View Portfolio</Link>
          <Link className="hbtn hbtn-g" href="/games">Game Projects</Link>
          <Link className="hbtn hbtn-g" href="/worldbuilding">Worldbuilding</Link>
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
