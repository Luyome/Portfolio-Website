import type { ContactSocialLink } from "@/lib/contact-social";

type HomeContactSocialProps = {
  links: ContactSocialLink[];
  backgroundImage?: string;
  backgroundOpacity?: number;
};

export default function HomeContactSocial({ links, backgroundImage, backgroundOpacity = 30 }: HomeContactSocialProps) {
  if (links.length === 0) return null;

  return (
    <section className="home-contact-social" aria-labelledby="home-contact-title">
      {backgroundImage && (
        <div
          className="hcs-background"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: Math.min(Math.max(backgroundOpacity, 0), 100) / 100 }}
          aria-hidden="true"
        />
      )}
      <div className="hcs-inner">
        <div className="hcs-heading">
          <p className="hcs-kicker">Contact + Social</p>
          <h2 id="home-contact-title">How to reach me</h2>
        </div>
        <ul className="hcs-links">
          {links.map((link, index) => (
            <li key={link.key}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="hcs-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="hcs-label">{link.label}</span>
                <span className="hcs-value">{link.value}</span>
                <span className="hcs-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
