import { useJobStats } from '../api/jobsApi';
import { Skeleton } from '@/components/ui/skeleton';
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

// Matches design-system colors exactly
const BAR_CONFIG: Record<string, { fill: string; label: string }> = {
  Reminder:  { fill: 'hsl(160 10% 40%)',  label: 'Reminder'  },
  Applied:   { fill: 'hsl(213 94% 63%)',  label: 'Applied'   },
  Interview: { fill: 'hsl(38 92% 50%)',   label: 'Interview' },
  Offer:     { fill: 'hsl(160 84% 39%)',  label: 'Offer'     },
  Rejected:  { fill: 'hsl(0 84% 60%)',    label: 'Rejected'  },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const cfg = BAR_CONFIG[label];
  return (
    <div className="rounded-lg border border-border/60 bg-surface-raised px-3 py-2.5 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-0.5">{label}</p>
      <p className="text-muted-foreground">
        <span style={{ color: cfg?.fill }} className="font-bold">
          {payload[0].value}
        </span>{' '}
        application{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function JobAnalyticsChart() {
  const { data: stats, isLoading, isError } = useJobStats();

  const total = stats
    ? stats.Saved + stats.Applied + stats.Interview + stats.Offer + stats.Rejected
    : 0;

  const chartData = stats
    ? [
        { name: 'Reminder',  count: stats.Saved     },
        { name: 'Applied',   count: stats.Applied   },
        { name: 'Interview', count: stats.Interview },
        { name: 'Offer',     count: stats.Offer     },
        { name: 'Rejected',  count: stats.Rejected  },
      ]
    : [];

  return (
    <div className="rounded-xl border border-border/50 bg-surface/40 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Application Funnel</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? '—' : `${total} total application${total !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="w-full h-[180px] rounded-lg" />
        </div>
      ) : isError ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-destructive">Failed to load chart</p>
        </div>
      ) : total === 0 ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      ) : (
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(160 10% 16% / 0.6)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(160 10% 60%)' }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(160 10% 60%)' }}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(160 10% 16% / 0.4)' }}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ zIndex: 10 }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={40}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={BAR_CONFIG[entry.name]?.fill ?? 'hsl(160 10% 40%)'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      {!isLoading && !isError && total > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-border/40">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: BAR_CONFIG[item.name]?.fill }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name}{' '}
                <span className="text-foreground font-medium">{item.count}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
