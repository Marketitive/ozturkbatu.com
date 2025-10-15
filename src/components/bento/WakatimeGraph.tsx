import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LanguageData {
  name: string;
  hours: number;
  color: string;
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Astro: '#ff5d01',
  React: '#61dafb',
  HTML: '#e34c26',
  CSS: '#264de4',
  Other: '#6e7681',
};

export function WakatimeGraph() {
  const [data, setData] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    // In production, you'd integrate with WakaTime API
    const mockData: LanguageData[] = [
      { name: 'TypeScript', hours: 12.5, color: languageColors.TypeScript },
      { name: 'Astro', hours: 8.3, color: languageColors.Astro },
      { name: 'JavaScript', hours: 6.2, color: languageColors.JavaScript },
      { name: 'Python', hours: 4.1, color: languageColors.Python },
      { name: 'CSS', hours: 3.5, color: languageColors.CSS },
    ];

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const totalHours = data.reduce((sum, lang) => sum + lang.hours, 0);

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Coding Activity</h3>
        <p className="text-xs text-muted-foreground">
          {totalHours.toFixed(1)}h this week
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--color-muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--color-border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--color-muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--color-border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--color-popover))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: '0.5rem',
                color: 'hsl(var(--color-foreground))',
              }}
              formatter={(value: number) => [`${value.toFixed(1)} hrs`, 'Time']}
            />
            <Bar
              dataKey="hours"
              fill="hsl(var(--color-accent))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {data.map((lang) => (
          <div key={lang.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <span className="text-muted-foreground">{lang.name}</span>
            </div>
            <span className="text-muted-foreground font-mono">{lang.hours}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}
