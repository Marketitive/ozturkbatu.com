// Build-time snapshot of the GitHub contribution calendar.
// Uses the local `gh` CLI session, so no token is stored in the repo or shipped to the browser.
// If `gh` is unavailable, the previously committed snapshot is kept.
import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';

const USER = 'ozturkbatu';
const OUT = new URL('../src/data/github-contributions.json', import.meta.url);

const query = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`;

try {
  const raw = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`, '-F', `login=${USER}`], { encoding: 'utf8' });
  const cal = JSON.parse(raw).data.user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const level = (n) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  const data = {
    user: USER,
    generatedAt: new Date().toISOString(),
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: level(d.contributionCount) }))),
  };
  writeFileSync(OUT, JSON.stringify(data));
  console.log(`github-contributions: ${data.total} contributions snapshotted`);
} catch (err) {
  if (existsSync(OUT)) console.warn('github-contributions: fetch failed, keeping existing snapshot');
  else { console.error('github-contributions: fetch failed and no snapshot exists'); process.exit(1); }
}
