import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-analytics";
import DashboardChart from "@/components/admin/DashboardChart";

export default async function AdminDashboardPage() {
  const { events, sections, totalPages, totalWords, totalImages, addedThisMonth } = await getDashboardData();

  return (
    <div>
      <div className="adm-title">Dashboard</div>
      <p className="adm-sub">Content overview, generated from everything you&apos;ve added to the site.</p>

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

      <div className="adm-dash-cols">
        <DashboardChart events={events} />
        <div className="adm-section-panel">
          <div className="adm-chart-title">Pages by Section</div>
          <div className="adm-section-list">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className="adm-section-row">
                <span>{s.label}</span>
                <span className="adm-section-count">{s.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
