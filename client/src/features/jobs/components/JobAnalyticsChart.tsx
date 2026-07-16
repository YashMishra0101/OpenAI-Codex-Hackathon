import { useJobStats } from '../api/jobsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function JobAnalyticsChart() {
  const { data: stats, isLoading, isError } = useJobStats();

  if (isError) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Application Funnel</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-destructive">
          Failed to load chart data
        </CardContent>
      </Card>
    );
  }

  const chartData = stats
    ? [
        { name: 'Saved', count: stats.Saved, fill: '#64748b' },
        { name: 'Applied', count: stats.Applied, fill: '#3b82f6' },
        { name: 'Interview', count: stats.Interview, fill: '#f59e0b' },
        { name: 'Offer', count: stats.Offer, fill: '#10b981' },
        { name: 'Rejected', count: stats.Rejected, fill: '#ef4444' },
      ]
    : [];

  return (
    <Card className="shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Application Funnel</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] mt-4">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-md" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
