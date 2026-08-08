import Image from "next/image";
import Link from "next/link";
import type { ResolvedHomeContent } from "@/lib/home-data";
import { isOptimizableImageUrl } from "@/lib/image-host";

export default function HomeWorldbuildingHighlights({ items }: { items: ResolvedHomeContent[] }) {
  if (items.length === 0) return null;

  return (
    <section id="worldbuilding-highlights" className="home-world-highlights" aria-labelledby="home-world-title">
      <div className="hwh-heading">
        <div>
          <p className="hwh-kicker">From the KRUPNI archive</p>
          <h2 id="home-world-title">Windows into the world</h2>
        </div>
        <p>Selected records from an evolving universe of places, people, and histories.</p>
      </div>

      <div className={`hwh-grid hwh-count-${items.length}`}>
        {items.map((item, index) => (
          <article key={item.contentId} className="hwh-item">
            <Link href={item.href} className="hwh-link" aria-label={`Open ${item.title}`}>
              <div className="hwh-media">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes={index === 0 ? "(max-width: 820px) 100vw, 62vw" : "(max-width: 820px) 100vw, 34vw"}
                    unoptimized={!isOptimizableImageUrl(item.image)}
                  />
                ) : (
                  <div className="hwh-placeholder" aria-hidden="true"><span>KRUPNI / Archive</span></div>
                )}
                <div className="hwh-shade" aria-hidden="true" />
                <span className="hwh-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="hwh-copy">
                <div className="hwh-meta"><span>{item.category || "Worldbuilding"}</span><span>KRUPNI</span></div>
                <h3>{item.title}</h3>
                {item.summary && <p>{item.summary}</p>}
                <span className="hwh-open">Open record <span aria-hidden="true">↗</span></span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
