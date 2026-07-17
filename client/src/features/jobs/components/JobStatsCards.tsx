import { Card, CardContent } from '@/components/ui/card';
import { useJobStats, type JobStatus } from '../api/jobsApi';
import { Bell, Send, Users, Trophy, XCircle, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type FilterStatus = 'All' | JobStatus;

interface JobStatsCardsProps {
  activeFilter?: FilterStatus;
  onFilterClick?: (status: FilterStatus) => void;
}

const STAT_ITEMS = [
  {
    label: 'Total',
    key: 'total' as const,
    filterValue: 'All' as FilterStatus,
    icon: LayoutGrid,
    accent: 'bg-primary/10 text-primary',
    bar: 'bg-primary/60',
    activeRing: 'ring-primary/40',
  },
  {
    label: 'Reminder',
    key: 'Saved' as const,
    filterValue: 'Saved' as FilterStatus,
    icon: Bell,
    accent: 'bg-muted text-muted-foreground',
    bar: 'bg-border',
    activeRing: 'ring-border',
  },
  {
    label: 'Applied',
    key: 'Applied' as const,
    filterValue: 'Applied' as FilterStatus,
    icon: Send,
    accent: 'bg-blue-500/10 text-blue-400',
    bar: 'bg-blue-500/70',
    activeRing: 'ring-blue-500/40',
  },
  {
    label: 'Interview',
    key: 'Interview' as const,
    filterValue: 'Interview' as FilterStatus,
    icon: Users,
    accent: 'bg-amber-500/10 text-amber-400',
    bar: 'bg-amber-500/70',
    activeRing: 'ring-amber-500/40',
  },
  {
    label: 'Offer',
    key: 'Offer' as const,
    filterValue: 'Offer' as FilterStatus,
    icon: Trophy,
    accent: 'bg-emerald-500/10 text-emerald-400',
    bar: 'bg-emerald-500/70',
    activeRing: 'ring-emerald-500/40',
  },
  {
    label: 'Rejected',
    key: 'Rejected' as const,
    filterValue: 'Rejected' as FilterStatus,
    icon: XCircle,
    accent: 'bg-red-500/10 text-red-400',
    bar: 'bg-red-500/70',
    activeRing: 'ring-red-500/40',
  },
] as const;

type StatKey = typeof STAT_ITEMS[number]['key'];

export function JobStatsCards({ activeFilter, onFilterClick }: JobStatsCardsProps) {
  const { data: stats, isLoading, isError } = useJobStats();

  if (isError) {
    return (
      <p className="text-sm text-destructive">Failed to load statistics.</p>
    );
  }

  const total = stats
    ? stats.Saved + stats.Applied + stats.Interview + stats.Offer + stats.Rejected
    : 0;

  const getValue = (key: StatKey) => {
    if (key === 'total') return total;
    return stats ? stats[key] : 0;
  };

  // Determine if a card is "active" based on the current filter
  const isActive = (filterValue: FilterStatus) => {
    if (!activeFilter) return false;
    return activeFilter === filterValue;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_ITEMS.map((item) => {
        const value = getValue(item.key);
        const active = isActive(item.filterValue);
        const clickable = !!onFilterClick;
        return (
          <Card
            key={item.label}
            className={`relative overflow-hidden border bg-surface/60 shadow-none transition-all duration-150 ${
              active
                ? `ring-2 ${item.activeRing} border-transparent`
                : 'border-border/50'
            } ${clickable ? 'cursor-pointer hover:bg-surface/80' : ''}`}
            onClick={() => onFilterClick?.(item.filterValue)}
          >
            {/* Bottom accent bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${item.bar}`} />

            <CardContent className="px-4 pt-4 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${item.accent}`}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">{value}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
