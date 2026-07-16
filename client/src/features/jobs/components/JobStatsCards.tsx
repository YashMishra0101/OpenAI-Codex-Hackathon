import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobStats } from '../api/jobsApi';
import { Bookmark, Send, Users, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function JobStatsCards() {
  const { data: stats, isLoading, isError } = useJobStats();

  if (isError) {
    return <div className="text-destructive text-sm">Failed to load statistics</div>;
  }

  const statItems = [
    { label: 'Saved', key: 'Saved' as const, icon: Bookmark, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-900/50' },
    { label: 'Applied', key: 'Applied' as const, icon: Send, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    { label: 'Interview', key: 'Interview' as const, icon: Users, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/50' },
    { label: 'Offer', key: 'Offer' as const, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/50' },
    { label: 'Rejected', key: 'Rejected' as const, icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            <div className={`p-1.5 rounded-md ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <div className="text-2xl font-bold">
                {stats ? stats[item.key] : 0}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
