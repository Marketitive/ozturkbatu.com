// Serves static assets as before, plus a daily-refreshed GitHub contribution feed.
// Secret: GITHUB_TOKEN (classic PAT, read:user only). KV binding: CONTRIBUTIONS.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CONTRIBUTIONS: { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> };
  GITHUB_TOKEN?: string;
}

const USER = 'ozturkbatu';
const KEY = 'calendar';

const QUERY = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`;

async function refresh(env: Env): Promise<void> {
  if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ozturkbatu-web',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json: any = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error('Unexpected GitHub response');

  const days: { date: string; contributionCount: number }[] = cal.weeks.flatMap((w: any) => w.contributionDays);
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  const data = {
    user: USER,
    generatedAt: new Date().toISOString(),
    total: cal.totalContributions,
    weeks: cal.weeks.map((w: any) =>
      w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount, level: level(d.contributionCount) })),
    ),
  };
  await env.CONTRIBUTIONS.put(KEY, JSON.stringify(data));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contributions') {
      const body = await env.CONTRIBUTIONS.get(KEY);
      if (!body) return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
      return new Response(body, {
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
      });
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(_event: unknown, env: Env): Promise<void> {
    await refresh(env);
  },
};
