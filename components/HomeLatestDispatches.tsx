import Link from "next/link";
import type { ResolvedHomeContent } from "@/lib/home-data";

const TYPE_LABELS: Record<ResolvedHomeContent["type"], string> = {
  portfolio: "Portfolio",
  sketch: "2D Work",
  model3d: "3D Work",
  worldbuilding: "Worldbuilding",
  game: "Game Project",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function HomeLatestDispatches({ items }: { items: ResolvedHomeContent[] }) {
  if (items.length === 0) return null;

  return (
    <section id="dispatches" className="home-dispatches" aria-labelledby="home-dispatches-title">
      <div className="hld-heading">
        <p className="hld-kicker">Recent work &amp; field notes</p>
        <h2 id="home-dispatches-title">Latest Dispatches</h2>
      </div>

      <ol className="hld-list">
        {items.map((item) => (
          <li key={`${item.type}:${item.contentId}`}>
            <Link href={item.href} className="hld-link">
              <div className="hld-meta">
                <span>{TYPE_LABELS[item.type]}</span>
                <time dateTime={item.createdAt.toISOString()}>{dateFormatter.format(item.createdAt)}</time>
              </div>
              <div className="hld-copy">
                <h3>{item.title}</h3>
                {item.summary.trim() && <p>{item.summary}</p>}
              </div>
              <span className="hld-arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
