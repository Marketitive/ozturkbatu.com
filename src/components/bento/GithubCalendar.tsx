import { useEffect, useState } from 'react';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const levelColors = {
  0: 'bg-muted',
  1: 'bg-green-900/50',
  2: 'bg-green-700/50',
  3: 'bg-green-500/50',
  4: 'bg-green-300',
};

export function GithubCalendar({ username = 'yourusername' }: { username?: string }) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock data for demonstration
    // In production, you'd fetch real GitHub contribution data via their API
    const generateMockData = () => {
      const days: ContributionDay[] = [];
      const today = new Date();

      for (let i = 60; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const count = Math.floor(Math.random() * 10);
        const level = count === 0 ? 0 : count < 3 ? 1 : count < 5 ? 2 : count < 7 ? 3 : 4;

        days.push({
          date: date.toISOString().split('T')[0],
          count,
          level: level as 0 | 1 | 2 | 3 | 4,
        });
      }

      return days;
    };

    setTimeout(() => {
      setContributions(generateMockData());
      setLoading(false);
    }, 500);
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-1">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="h-3 w-3 bg-muted rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">GitHub Activity</h3>
        <p className="text-xs text-muted-foreground">
          {totalContributions} contributions
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-1">
        {contributions.map((day) => (
          <div
            key={day.date}
            className={`h-3 w-3 rounded-sm ${levelColors[day.level]} hover:ring-1 hover:ring-accent transition-all cursor-pointer`}
            title={`${day.date}: ${day.count} contributions`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-2 w-2 rounded-sm ${levelColors[level as 0 | 1 | 2 | 3 | 4]}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
