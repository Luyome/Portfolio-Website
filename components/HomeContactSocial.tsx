"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ContactSocialLink } from "@/lib/contact-social";
import { isOptimizableImageUrl } from "@/lib/image-host";
import ActionLink from "@/components/ActionLink";

type ContactArtwork = { title: string; image: string; href: string };

type Props = {
  links: ContactSocialLink[];
  images?: string[];
  artworks?: ContactArtwork[];
  backgroundOpacity?: number;
};

const INDEX_NAV = [
  { href: "/portfolio", label: "Work", desc: "Selected 3D, 2D, and game production." },
  { href: "/worldbuilding", label: "Worldbuilding", desc: "Lore, maps, and the KRUPNI setting." },
  { href: "/about", label: "About / CV", desc: "Background, tools, and profile." },
] as const;

export default function HomeContactSocial({ links, images = [], artworks = [], backgroundOpacity = 30 }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % images.length), 7000);
    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  if (links.length === 0) return null;

  const primaryLink = links.find((link) => link.key === "email") ?? links[0];
  const secondary = images.filter((_, index) => index !== activeImage).slice(0, 2);
  const washOpacity = Math.min(Math.max(backgroundOpacity, 0), 100) / 100;

  // Shortest-path horizontal offset for the sliding frame: each image sits a full
  // frame-width to the side of its neighbour and slides into place via `transform`
  // (not an opacity crossfade), wrapping around the short (<=3 image) rotation.
  const slideOffset = (index: number) => {
    const length = images.length;
    let diff = index - activeImage;
    if (diff > length / 2) diff -= length;
    if (diff < -length / 2) diff += length;
    return diff;
  };

  return (
    <section id="contact" className="home-contact-social" aria-labelledby="home-contact-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      {images.length > 0 && <div className="hcs-wash" aria-hidden="true">
        {images.map((image, index) => <Image key={image} src={image} alt="" fill sizes="100vw" quality={90} loading="lazy" unoptimized={!isOptimizableImageUrl(image)} style={{ opacity: index === activeImage ? washOpacity * 0.6 : 0 }} />)}
      </div>}
      <div className="hcs-inner">
        <div className="hcs-panel">
          <div className="hcs-feature">
            <div className="hcs-feature-text">
              <p className="hcs-kicker">Contact + Social</p>
              <h2 id="home-contact-title">Let’s continue the conversation.</h2>
              <p className="hcs-feature-copy">For collaborations, opportunities, or a closer look at the work.</p>
              <div className="hcs-cta-row">
                <ActionLink href={primaryLink.href} variant="primary" className="hcs-cta" {...(primaryLink.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                  {primaryLink.key === "email" ? "Send an Email" : `Connect on ${primaryLink.label}`}
                </ActionLink>
                {primaryLink.key === "email" && <span className="hcs-cta-value">{primaryLink.value}</span>}
              </div>
              <div className="hcs-feature-marks" aria-hidden="true"><span /><span /></div>
            </div>

            {images.length > 0 && (
              <div className="hcs-feature-visual" aria-hidden="true">
                <div className="hcs-frame hcs-frame-main">
                  {images.map((image, index) => (
                    <Image key={image} src={image} alt="" fill sizes="(max-width: 820px) 82vw, 460px" quality={90} priority={false} unoptimized={!isOptimizableImageUrl(image)} style={{ transform: `translateX(${slideOffset(index) * 100}%)` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hcs-modules">
          <div className="hcs-module hcs-module-artwork">
            <div className="hcs-module-head">
              <p className="hcs-module-kicker">Artwork</p>
              <Link href="/portfolio" className="hcs-module-chevron" aria-label="View all portfolio work">↗</Link>
            </div>

            {artworks.length > 0 && (
              <div className="hcs-artwork-grid">
                {artworks.map((artwork) => (
                  <Link key={artwork.href} href={artwork.href} className="hcs-artwork-thumb">
                    <Image src={artwork.image} alt="" fill sizes="180px" quality={90} unoptimized={!isOptimizableImageUrl(artwork.image)} />
                    <span className="hcs-artwork-caption">{artwork.title}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/portfolio" className="hbtn hbtn-g hcs-viewmore">View More</Link>
          </div>

          <div className="hcs-module hcs-module-contact">
            <p className="hcs-module-kicker">Contact</p>
            <ul className="hcs-links">
              {links.map((link) => (
                <li key={link.key} className={link.key === primaryLink.key ? "hcs-link-active" : undefined}>
                  <a href={link.href} {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {link.key === "email" ? (
                      <span className="hcs-link-text">
                        <span className="hcs-link-label">{link.label}</span>
                        <span className="hcs-link-value">{link.value}</span>
                      </span>
                    ) : (
                      <span className="hcs-link-label">{link.label}</span>
                    )}
                    <span className="hcs-link-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>

            {secondary.length > 0 && (
              <div className="hcs-avatar-cluster" aria-hidden="true">
                {secondary[0] && (
                  <div className="hcs-avatar hcs-avatar-a">
                    <Image src={secondary[0]} alt="" fill sizes="120px" quality={90} unoptimized={!isOptimizableImageUrl(secondary[0])} />
                  </div>
                )}
                {secondary[1] && (
                  <div className="hcs-avatar hcs-avatar-b">
                    <Image src={secondary[1]} alt="" fill sizes="96px" quality={90} unoptimized={!isOptimizableImageUrl(secondary[1])} />
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="hcs-module hcs-module-nav" aria-label="Continue exploring">
            <p className="hcs-module-kicker">Index / Continue</p>
            {INDEX_NAV.map((item, index) => (
              <Link key={item.href} href={item.href} className="hcs-navcard">
                <span className="hcs-navcard-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="hcs-navcard-text">
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
