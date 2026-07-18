import { useState, useMemo } from 'react';
import { useJobs, JobApplication, JobStatus } from '@/features/jobs/api/jobsApi';
import { JobStatsCards } from '@/features/jobs/components/JobStatsCards';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobKanbanBoard } from '@/features/jobs/components/JobKanbanBoard';
import { JobAnalyticsChart } from '@/features/jobs/components/JobAnalyticsChart';
import { JobFormDialog } from '@/features/jobs/components/JobFormDialog';
import { ReminderDialog } from '@/features/jobs/components/ReminderDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, List, KanbanSquare, Search, Briefcase } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type FilterStatus = 'All' | JobStatus | 'HasReminders';

export function JobTrackerPage() {
  const { data: jobs, isLoading, isError } = useJobs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [reminderJob, setReminderJob] = useState<JobApplication | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');

  const handleAddNew = () => {
    setEditingJob(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  const handleSetReminder = (job: JobApplication) => {
    setReminderJob(job);
    setIsReminderOpen(true);
  };

  // Clicking a stat card sets the active filter
  const handleStatClick = (status: FilterStatus) => {
    setActiveFilter(status === activeFilter ? 'All' : status);
  };

  // Client-side search + filter
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    let result = jobs;

    if (activeFilter !== 'All') {
      result = result.filter((j) => j.status === activeFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (j) =>
          j.companyName.toLowerCase().includes(q) ||
          j.jobTitle.toLowerCase().includes(q) ||
          (j.location?.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [jobs, activeFilter, search]);

  const hasJobs = jobs && jobs.length > 0;

  // Label map for empty-state display
  const FILTER_LABELS: Record<FilterStatus, string> = {
    All: 'All',
    Saved: 'Reminder',
    Applied: 'Applied',
    Interview: 'Interview',
    Offer: 'Offer',
    Rejected: 'Rejected',
    OnHold: 'On Hold',
    Withdrawn: 'Withdrawn',
    HasReminders: 'Jobs with Reminders',
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track your job applications in one place.
            </p>
          </div>
          <Button onClick={handleAddNew} className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>

        {/* ── Stats Cards (clickable filters) ── */}
        <div className="mb-6">
          <JobStatsCards activeFilter={activeFilter} onFilterClick={handleStatClick} />
        </div>

        {/* ── Analytics Chart ── */}
        <div className="mb-6">
          <JobAnalyticsChart />
        </div>

        {/* ── Applications Panel ── */}
        <div className="rounded-xl border border-border/50 bg-surface/40">
          {/* Panel toolbar — search + view toggle only (no duplicate filter pills) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <h2 className="text-sm font-semibold text-foreground shrink-0">
                Applications
                {hasJobs && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {filteredJobs.length} of {jobs?.length}
                  </span>
                )}
              </h2>
              {/* Search — wider now that filter pills are removed */}
              {hasJobs && (
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by company or role…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm bg-background/50"
                  />
                </div>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/40 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-surface shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'board'
                    ? 'bg-surface shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Board view"
              >
                <KanbanSquare className="h-3.5 w-3.5" />
                Board
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-destructive font-medium">
                    Failed to load job applications.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please refresh the page to try again.
                  </p>
                </div>
              </div>
            ) : !hasJobs ? (
              /* Empty state — no jobs */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold tracking-tight mb-2">
                  No applications yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                  Start tracking your job search. Add your first application to
                  monitor its status, set reminders, and measure your progress.
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Job
                </Button>
              </div>
            ) : filteredJobs.length === 0 ? (
              /* Empty state — search/filter returned nothing */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No results
                  {search && <> for &quot;{search}&quot;</>}
                  {activeFilter !== 'All' && ` in ${FILTER_LABELS[activeFilter]}`}
                </p>
                <button
                  onClick={() => { setSearch(''); setActiveFilter('All'); }}
                  className="mt-2 text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="flex flex-col gap-2">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onEdit={handleEdit}
                    onSetReminder={handleSetReminder}
                  />
                ))}
              </div>
            ) : (
              <JobKanbanBoard
                jobs={filteredJobs}
                onEdit={handleEdit}
                onSetReminder={handleSetReminder}
              />
            )}
          </div>
        </div>
      </div>

      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        job={editingJob}
      />
      <ReminderDialog
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        job={reminderJob}
      />
    </div>
  );
}
