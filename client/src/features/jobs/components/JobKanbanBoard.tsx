import { useState } from 'react';
import { JobApplication, useDeleteJob } from '../api/jobsApi';
import { MapPin, DollarSign, MoreVertical, Pencil, Bell, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface JobKanbanBoardProps {
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onSetReminder: (job: JobApplication) => void;
}

const COLUMNS = [
  { id: 'Saved',     label: 'Saved',     dot: 'bg-slate-400',    header: 'border-slate-500/30 bg-slate-500/8',     count: 'bg-slate-500/20 text-slate-300'     },
  { id: 'Applied',   label: 'Applied',   dot: 'bg-blue-400',     header: 'border-blue-500/30 bg-blue-500/8',      count: 'bg-blue-500/20 text-blue-300'       },
  { id: 'Interview', label: 'Interview', dot: 'bg-amber-400',    header: 'border-amber-500/30 bg-amber-500/8',    count: 'bg-amber-500/20 text-amber-300'     },
  { id: 'Offer',     label: 'Offer',     dot: 'bg-emerald-400',  header: 'border-emerald-500/30 bg-emerald-500/8', count: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'Rejected',  label: 'Rejected',  dot: 'bg-red-400',      header: 'border-red-500/30 bg-red-500/8',        count: 'bg-red-500/20 text-red-300'         },
  { id: 'OnHold',    label: 'On Hold',   dot: 'bg-violet-400',   header: 'border-violet-500/30 bg-violet-500/8',  count: 'bg-violet-500/20 text-violet-300'   },
  { id: 'Withdrawn', label: 'Withdrawn', dot: 'bg-slate-500',    header: 'border-slate-600/30 bg-slate-600/8',    count: 'bg-slate-600/20 text-slate-400'     },
];

// ── Single job row inside a status section ───────────────────────────────────
function JobRow({
  job,
  onEdit,
  onSetReminder,
}: {
  job: JobApplication;
  onEdit: (j: JobApplication) => void;
  onSetReminder: (j: JobApplication) => void;
}) {
  const deleteMutation = useDeleteJob();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(job._id, {
      onSuccess: () => {
        toast.success('Job deleted');
        setShowDeleteDialog(false);
      },
      onError: () => {
        toast.error('Failed to delete');
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors group">
      {/* Company initial */}
      <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold uppercase select-none">
        {job.companyName?.[0] ?? '?'}
      </div>

      {/* Title + company */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">{job.jobTitle}</p>
        <p className="text-xs text-muted-foreground truncate">{job.companyName}</p>
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" /> {job.salary}
          </span>
        )}
        <span>{new Date(job.appliedDate ?? job.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
            aria-label="Job options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(job)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSetReminder(job)}>
            <Bell className="mr-2 h-4 w-4" /> Set Reminder
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Job Application?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this job application?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Collapsible status section ────────────────────────────────────────────────
function StatusSection({
  col,
  jobs,
  onEdit,
  onSetReminder,
}: {
  col: (typeof COLUMNS)[number];
  jobs: JobApplication[];
  onEdit: (j: JobApplication) => void;
  onSetReminder: (j: JobApplication) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`rounded-xl border ${col.header} overflow-hidden`}>
      {/* Section header — click to collapse */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${col.dot}`} />
        <span className="text-sm font-semibold flex-1">{col.label}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.count}`}>
          {jobs.length}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Jobs list */}
      {open && (
        <div className="border-t border-inherit bg-card/30">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobRow
                key={job._id}
                job={job}
                onEdit={onEdit}
                onSetReminder={onSetReminder}
              />
            ))
          ) : (
            <p className="px-4 py-5 text-sm text-muted-foreground text-center opacity-50">
              No applications in this stage
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function JobKanbanBoard({ jobs, onEdit, onSetReminder }: JobKanbanBoardProps) {
  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = jobs.filter((j) => j.status === col.id);
      return acc;
    },
    {} as Record<string, JobApplication[]>,
  );

  return (
    <div className="space-y-3 w-full">
      {COLUMNS.map((col) => (
        <StatusSection
          key={col.id}
          col={col}
          jobs={grouped[col.id] ?? []}
          onEdit={onEdit}
          onSetReminder={onSetReminder}
        />
      ))}
    </div>
  );
}
