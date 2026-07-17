import { useState } from 'react';
import { useJobs, JobApplication } from '@/features/jobs/api/jobsApi';
import { JobStatsCards } from '@/features/jobs/components/JobStatsCards';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobKanbanBoard } from '@/features/jobs/components/JobKanbanBoard';
import { JobAnalyticsChart } from '@/features/jobs/components/JobAnalyticsChart';
import { JobFormDialog } from '@/features/jobs/components/JobFormDialog';
import { ReminderDialog } from '@/features/jobs/components/ReminderDialog';
import { Button } from '@/components/ui/button';
import { Plus, List, KanbanSquare } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function JobTrackerPage() {
  const { data: jobs, isLoading, isError } = useJobs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [reminderJob, setReminderJob] = useState<JobApplication | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');

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

  return (
    <div className="container max-w-7xl py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage and track your job applications all in one place.</p>
        </div>
        <Button onClick={handleAddNew} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Application
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <JobStatsCards />
        </div>
        <div className="lg:col-span-1">
          <JobAnalyticsChart />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Applications</h2>
          <div className="flex bg-muted p-1 rounded-md">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="px-3"
              onClick={() => setViewMode('grid')}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
            <Button 
              variant={viewMode === 'board' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="px-3"
              onClick={() => setViewMode('board')}
            >
              <KanbanSquare className="h-4 w-4 mr-2" /> Board
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive border rounded-lg bg-destructive/5">
            Failed to load job applications. Please try again.
          </div>
        ) : jobs?.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/20 border-dashed">
            <h3 className="text-lg font-medium text-foreground mb-1">No applications yet</h3>
            <p className="text-sm text-muted-foreground mb-4">You haven't added any job applications to track.</p>
            <Button onClick={handleAddNew} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add your first job
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="flex flex-col gap-2">
            {jobs?.map((job) => (
              <JobCard key={job._id} job={job} onEdit={handleEdit} onSetReminder={handleSetReminder} />
            ))}
          </div>
        ) : (
          <JobKanbanBoard jobs={jobs || []} onEdit={handleEdit} onSetReminder={handleSetReminder} />
        )}
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
