import Link from "next/link";
import { getDashboardData, getRecentContent } from "@/lib/dashboard-analytics";
import DashboardChart from "@/components/admin/DashboardChart";
import ForceDarkModeToggle from "@/components/admin/ForceDarkModeToggle";
import EmptyState from "@/components/EmptyState";
import { getSiteSettings } from "@/lib/site-settings";

const QUICK_ACTIONS = [
  { label: "New Portfolio Item", href: "/admin/portfolio/new" },
  { label: "New Sketch", href: "/admin/sketches/new" },
  { label: "New 3D Model", href: "/admin/3d/new" },
  { label: "New Game", href: "/admin/games/new" },
  { label: "New Worldbuilding Entry", href: "/admin/worldbuilding/new" },
  { label: "Map Editor — Place Pins", href: "/admin/worldbuilding/map" },
] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

export default async function AdminDashboardPage() {
  const [{ events, sections, totalPages, totalWords, totalImages, addedThisMonth, attentionItems, primaryCreateHref, primaryCreateLabel }, recent, settings] =
    await Promise.all([getDashboardData(), getRecentContent(8), getSiteSettings()]);

  return (
    <div className="adm-dashboard">
      <h1 className="adm-title">Dashboard</h1>
      <p className="adm-sub">Content overview, generated from everything you&apos;ve added to the site.</p>

      <div className="adm-dash-header-actions">
        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-exit-btn">
          <span className="arr">↗</span> View Public Site
        </a>
        <Link href={primaryCreateHref} className="adm-btn">+ {primaryCreateLabel}</Link>
      </div>

      <ForceDarkModeToggle initial={settings.forceDarkMode} />

      <div className="adm-stat-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Pages</div>
          <div className="adm-stat-value">{totalPages.toLocaleString()}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Added This Month</div>
          <div className="adm-stat-value">{addedThisMonth.toLocaleString()}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Words Written</div>
          <div className="adm-stat-value">{totalWords.toLocaleString()}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Images</div>
          <div className="adm-stat-value">{totalImages.toLocaleString()}</div>
        </div>
      </div>

      <section aria-labelledby="dash-overview-h">
        <h2 id="dash-overview-h" className="adm-chart-title">Content Overview</h2>
        <div className="adm-overview-grid">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="adm-overview-card"
              aria-label={`${s.label}: ${s.count} item${s.count === 1 ? "" : "s"}`}
            >
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-value">{s.count}</div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="dash-quick-h">
        <h2 id="dash-quick-h" className="adm-chart-title">Quick Actions</h2>
        <div className="adm-quick-grid">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} className="adm-quick-action">{a.label}</Link>
          ))}
        </div>
      </section>

      <DashboardChart events={events} />

      <section aria-labelledby="dash-recent-h">
        <h2 id="dash-recent-h" className="adm-chart-title">Recent Content</h2>
        {recent.length === 0 ? (
          <EmptyState title="No content yet" description="Items you add will show up here as soon as they're saved." />
        ) : (
          <ul className="adm-dash-list">
            {recent.map((item) => (
              <li key={`${item.type}-${item.href}`}>
                <Link href={item.href} className="adm-dash-row">
                  <span className="adm-dash-row-type">{item.type}</span>
                  <span className="adm-dash-row-title">{item.title || "(untitled)"}</span>
                  <time className="adm-dash-row-meta" dateTime={item.createdAt}>
                    {dateFormatter.format(new Date(item.createdAt))}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {attentionItems.length > 0 && (
        <section aria-labelledby="dash-attention-h">
          <h2 id="dash-attention-h" className="adm-chart-title">Attention Needed</h2>
          <ul className="adm-dash-list">
            {attentionItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="adm-dash-row">
                  <span className="adm-dash-row-type">{item.label}</span>
                  <span className="adm-dash-row-title">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
