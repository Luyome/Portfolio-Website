"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ContactSocialLink } from "@/lib/contact-social";
import { isOptimizableImageUrl } from "@/lib/image-host";
import ActionLink from "@/components/ActionLink";

type Props = { links: ContactSocialLink[]; images?: string[]; backgroundOpacity?: number };

export default function HomeContactSocial({ links, images = [], backgroundOpacity = 30 }: Props) {
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

  return (
    <section className="home-contact-social" aria-labelledby="home-contact-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      {images.length > 0 && <div className="hcs-wash" aria-hidden="true">
        {images.map((image, index) => <Image key={image} src={image} alt="" fill sizes="100vw" loading="lazy" unoptimized={!isOptimizableImageUrl(image)} style={{ opacity: index === activeImage ? washOpacity * 0.6 : 0 }} />)}
      </div>}
      <div className="hcs-inner">
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
          </div>

          {images.length > 0 && (
            <div className="hcs-feature-visual" aria-hidden="true">
              <div className="hcs-frame hcs-frame-main">
                {images.map((image, index) => (
                  <Image key={image} src={image} alt="" fill sizes="(max-width: 820px) 82vw, 480px" priority={false} unoptimized={!isOptimizableImageUrl(image)} style={{ opacity: index === activeImage ? 1 : 0 }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hcs-modules">
          <div className="hcs-module hcs-module-contact">
            <p className="hcs-module-kicker">Contact</p>
            <ul className="hcs-links">
              {links.map((link) => (
                <li key={link.key}>
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
          </div>

          <nav className="hcs-module hcs-module-nav" aria-label="Continue exploring">
            <p className="hcs-module-kicker">Index / Continue</p>
            <Link href="/portfolio" className="hcs-shortcut"><span aria-hidden="true">01</span>Work</Link>
            <Link href="/worldbuilding" className="hcs-shortcut"><span aria-hidden="true">02</span>Worldbuilding</Link>
            <Link href="/about" className="hcs-shortcut"><span aria-hidden="true">03</span>About / CV</Link>
          </nav>

          {secondary.length > 0 && (
            <div className="hcs-module hcs-module-visual" aria-hidden="true">
              <p className="hcs-module-kicker">Artwork</p>
              <div className="hcs-secondary-cluster">
                {secondary[0] && (
                  <div className="hcs-frame hcs-frame-a">
                    <Image src={secondary[0]} alt="" fill sizes="220px" unoptimized={!isOptimizableImageUrl(secondary[0])} />
                  </div>
                )}
                {secondary[1] && (
                  <div className="hcs-frame hcs-frame-b">
                    <Image src={secondary[1]} alt="" fill sizes="180px" unoptimized={!isOptimizableImageUrl(secondary[1])} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
