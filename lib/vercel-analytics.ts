const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

type AggregateRow = {
  timestamp?: string;
  route?: string;
  pageviews: number;
  visitors: number;
};

type AggregateResponse = {
  data: AggregateRow[];
};

async function fetchAggregate(params: Record<string, string>): Promise<AggregateRow[] | null> {
  if (!TOKEN || !PROJECT_ID) return null;

  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
  url.searchParams.set("projectId", PROJECT_ID);
  if (TEAM_ID) url.searchParams.set("teamId", TEAM_ID);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const json: AggregateResponse = await res.json();
  return json.data;
}

export type DashboardAnalytics = {
  totalPageviews: number;
  totalVisitors: number;
  daily: { date: string; pageviews: number }[];
  topRoutes: { route: string; pageviews: number; visitors: number }[];
};

export function analyticsConfigured(): boolean {
  return Boolean(TOKEN && PROJECT_ID);
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics | null> {
  if (!analyticsConfigured()) return null;

  const until = new Date();
  const since = new Date(until.getTime() - 13 * 86400000);
  const range = { since: since.toISOString().slice(0, 10), until: until.toISOString().slice(0, 10) };

  const [daily, topRoutes] = await Promise.all([
    fetchAggregate({ ...range, by: "day" }),
    fetchAggregate({ ...range, by: "route", limit: "5" }),
  ]);

  if (!daily) return null;

  const totalPageviews = daily.reduce((sum, row) => sum + row.pageviews, 0);
  const totalVisitors = daily.reduce((sum, row) => sum + row.visitors, 0);

  return {
    totalPageviews,
    totalVisitors,
    daily: daily.map((row) => ({ date: row.timestamp ?? "", pageviews: row.pageviews })),
    topRoutes: (topRoutes ?? []).map((row) => ({
      route: row.route ?? "/",
      pageviews: row.pageviews,
      visitors: row.visitors,
    })),
  };
}
