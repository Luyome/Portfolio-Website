"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ContactSocialLink } from "@/lib/contact-social";
import { isOptimizableImageUrl } from "@/lib/image-host";

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
  function backToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  const secondary = images.filter((_, index) => index !== activeImage).slice(0, 2);
  const washOpacity = Math.min(Math.max(backgroundOpacity, 0), 100) / 100;

  return (
    <section className="home-contact-social" aria-labelledby="home-contact-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      {images.length > 0 && <div className="hcs-wash" aria-hidden="true">
        {images.map((image, index) => <Image key={image} src={image} alt="" fill sizes="100vw" loading="lazy" unoptimized={!isOptimizableImageUrl(image)} style={{ opacity: index === activeImage ? washOpacity * 0.6 : 0 }} />)}
      </div>}
      <div className="hcs-inner">
        <div className="hcs-top">
          <div className="hcs-heading">
            <p className="hcs-kicker">Contact + Social</p>
            <h2 id="home-contact-title">Let’s continue the conversation.</h2>
            <p>For collaborations, opportunities, or a closer look at the work.</p>
          </div>
          {images.length > 0 && (
            <div className="hcs-visual" aria-hidden="true">
              <div className="hcs-frame hcs-frame-main">
                {images.map((image, index) => (
                  <Image key={image} src={image} alt="" fill sizes="(max-width: 820px) 60vw, 300px" unoptimized={!isOptimizableImageUrl(image)} style={{ opacity: index === activeImage ? 1 : 0 }} />
                ))}
              </div>
              {secondary[0] && (
                <div className="hcs-frame hcs-frame-a">
                  <Image src={secondary[0]} alt="" fill sizes="180px" unoptimized={!isOptimizableImageUrl(secondary[0])} />
                </div>
              )}
              {secondary[1] && (
                <div className="hcs-frame hcs-frame-b">
                  <Image src={secondary[1]} alt="" fill sizes="150px" unoptimized={!isOptimizableImageUrl(secondary[1])} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hcs-directory">
          <ul className="hcs-links">{links.map((link, index) => <li key={link.key}><a href={link.href} {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}>
            <span className="hcs-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="hcs-label">{link.label}</span><span className="hcs-value">{link.value}</span><span className="hcs-arrow" aria-hidden="true">↗</span>
          </a></li>)}</ul>

          <div className="hcs-nav-block">
            <nav className="hcs-shortcuts" aria-label="Continue exploring">
              <p className="hcs-nav-kicker">Index / Continue</p>
              <Link href="/portfolio" className="hcs-shortcut"><span aria-hidden="true">01</span>Work</Link>
              <Link href="/worldbuilding" className="hcs-shortcut"><span aria-hidden="true">02</span>Worldbuilding</Link>
              <Link href="/about" className="hcs-shortcut"><span aria-hidden="true">03</span>About / CV</Link>
            </nav>
            <button type="button" className="hcs-top-btn" onClick={backToTop}>Back to top <span aria-hidden="true">↑</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
