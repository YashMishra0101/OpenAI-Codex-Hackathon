import { useJobStats } from '../api/jobsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const BAR_COLORS: Record<string, string> = {
  Saved: '#64748b',
  Applied: '#3b82f6',
  Interview: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444',
};

// Custom tooltip that stays inside the card
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        Count: <span className="font-semibold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  );
}

export function JobAnalyticsChart() {
  const { data: stats, isLoading, isError } = useJobStats();

  const chartData = stats
    ? [
        { name: 'Saved',     count: stats.Saved     },
        { name: 'Applied',   count: stats.Applied   },
        { name: 'Interview', count: stats.Interview },
        { name: 'Offer',     count: stats.Offer     },
        { name: 'Rejected',  count: stats.Rejected  },
      ]
    : [];

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-0 pt-5 px-5">
        <CardTitle className="text-base font-semibold">Application Funnel</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 px-2 pb-4 pt-2">
        {isLoading ? (
          <Skeleton className="w-full h-[260px] rounded-md" />
        ) : isError ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-destructive">
            Failed to load chart data
          </div>
        ) : (
          /* Give the container an explicit pixel height — Recharts needs this */
          <div className="w-full" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                barCategoryGap="35%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148,163,184,0.15)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  /* Keep tooltip inside the SVG viewport */
                  allowEscapeViewBox={{ x: false, y: false }}
                  wrapperStyle={{ zIndex: 10 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={BAR_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
