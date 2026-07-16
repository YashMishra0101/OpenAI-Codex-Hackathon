import { JobApplication } from '../api/jobsApi';
import { JobCard } from './JobCard';

interface JobKanbanBoardProps {
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onSetReminder: (job: JobApplication) => void;
}

const COLUMNS = [
  { id: 'Saved', title: 'Saved', color: 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300' },
  { id: 'Applied', title: 'Applied', color: 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:border-blue-900 dark:text-blue-300' },
  { id: 'Interview', title: 'Interview', color: 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/50 dark:border-amber-900 dark:text-amber-300' },
  { id: 'Offer', title: 'Offer', color: 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/50 dark:border-green-900 dark:text-green-300' },
  { id: 'Rejected', title: 'Rejected', color: 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/50 dark:border-red-900 dark:text-red-300' },
];

export function JobKanbanBoard({ jobs, onEdit, onSetReminder }: JobKanbanBoardProps) {
  // Group jobs by status
  const groupedJobs = COLUMNS.reduce((acc, col) => {
    acc[col.id] = jobs.filter(job => job.status === col.id);
    return acc;
  }, {} as Record<string, JobApplication[]>);

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 snap-x min-h-[600px]">
      {COLUMNS.map((column) => (
        <div 
          key={column.id} 
          className={`flex flex-col min-w-[320px] max-w-[320px] shrink-0 rounded-xl border ${column.color} snap-center`}
        >
          <div className="p-3 border-b border-inherit font-semibold flex justify-between items-center bg-background/50 rounded-t-xl">
            <span>{column.title}</span>
            <span className="bg-background px-2 py-0.5 rounded-full text-xs shadow-sm">
              {groupedJobs[column.id]?.length || 0}
            </span>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-card/30">
            {groupedJobs[column.id]?.length > 0 ? (
              groupedJobs[column.id].map(job => (
                <div key={job._id}>
                  <JobCard job={job} onEdit={onEdit} onSetReminder={onSetReminder} />
                </div>
              ))
            ) : (
              <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-inherit/30 rounded-lg opacity-50">
                <span className="text-sm font-medium">Empty</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
