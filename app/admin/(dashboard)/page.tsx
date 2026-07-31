import { getDashboardAnalytics, analyticsConfigured } from "@/lib/vercel-analytics";

export default async function AdminDashboardPage() {
  const analytics = await getDashboardAnalytics();
  const configured = analyticsConfigured();

  return (
    <div>
      <div className="adm-title">Dashboard</div>
      <p className="adm-sub">Live traffic overview, pulled directly from Vercel Web Analytics.</p>

      {!configured && (
        <div className="adm-analytics-hint">
          Vercel Web Analytics isn&apos;t connected yet. Enable Web Analytics for this project in the Vercel
          dashboard, create an access token, then set <code>VERCEL_TOKEN</code> and <code>VERCEL_PROJECT_ID</code>
          {" "}(plus <code>VERCEL_TEAM_ID</code> for team projects) in your environment to show real visitor data here.
        </div>
      )}

      {configured && !analytics && (
        <div className="adm-analytics-hint">
          Couldn&apos;t load analytics data. Double-check the token, project ID, and that Web Analytics is enabled.
        </div>
      )}

      {analytics && (
        <>
          <div className="adm-stat-grid">
            <div className="adm-stat-card">
              <div className="adm-stat-label">Page Views (14d)</div>
              <div className="adm-stat-value">{analytics.totalPageviews.toLocaleString()}</div>
            </div>
            <div className="adm-stat-card">
              <div className="adm-stat-label">Visitors (14d)</div>
              <div className="adm-stat-value">{analytics.totalVisitors.toLocaleString()}</div>
            </div>
            <div className="adm-stat-card">
              <div className="adm-stat-label">Top Page</div>
              <div className="adm-stat-value adm-stat-value-sm">{analytics.topRoutes[0]?.route ?? "—"}</div>
            </div>
          </div>

          <div className="adm-chart-card">
            <div className="adm-chart-title">Daily Page Views</div>
            <div className="adm-bar-chart">
              {analytics.daily.map((d) => {
                const max = Math.max(...analytics.daily.map((x) => x.pageviews), 1);
                return (
                  <div
                    key={d.date}
                    className="adm-bar"
                    style={{ height: `${(d.pageviews / max) * 100}%` }}
                    title={`${d.date}: ${d.pageviews} views`}
                  />
                );
              })}
            </div>
          </div>

          {analytics.topRoutes.length > 0 && (
            <table className="adm-table" style={{ marginTop: 24 }}>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Views</th>
                  <th>Visitors</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topRoutes.map((r) => (
                  <tr key={r.route}>
                    <td>{r.route}</td>
                    <td>{r.pageviews.toLocaleString()}</td>
                    <td>{r.visitors.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
