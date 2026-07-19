import {
  MapPin,
  DollarSign,
  Calendar,
  MoreVertical,
  Link as LinkIcon,
  Pencil,
  Bell,
  Trash2,
  ExternalLink,
} from 'lucide-react';
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
import { useState } from 'react';
import { JobApplication, useDeleteJob } from '../api/jobsApi';
import { toast } from 'react-hot-toast';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onSetReminder?: (job: JobApplication) => void;
}

const STATUS_CONFIG: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  Saved:     { badge: 'bg-muted/60 text-muted-foreground border-border/60',             dot: 'bg-muted-foreground',    label: 'Reminder'   },
  Applied:   { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/25',                dot: 'bg-blue-400',            label: 'Applied'    },
  Interview: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',             dot: 'bg-amber-400',           label: 'Interview'  },
  Offer:     { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',       dot: 'bg-emerald-400',         label: 'Offer'      },
  Rejected:  { badge: 'bg-red-500/10 text-red-400 border-red-500/25',                   dot: 'bg-red-400',             label: 'Rejected'   },
  OnHold:    { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/25',          dot: 'bg-violet-400',          label: 'On Hold'    },
  Withdrawn: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/25',             dot: 'bg-slate-400',           label: 'Withdrawn'  },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function JobCard({ job, onEdit, onSetReminder }: JobCardProps) {
  const deleteMutation = useDeleteJob();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const statusConfig = STATUS_CONFIG[job.status] ?? STATUS_CONFIG['Saved'];

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(job._id, {
      onSuccess: () => {
        toast.success('Job deleted');
        setShowDeleteDialog(false);
      },
      onError: () => {
        toast.error('Failed to delete job');
        setShowDeleteDialog(false);
      },
    });
  };

  const displayDate = job.appliedDate
    ? formatDate(job.appliedDate)
    : formatDate(job.updatedAt);

  return (
    <>
      <div className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-border/50 bg-surface/60 hover:bg-surface/80 hover:border-border transition-all duration-150">
        {/* Company initial avatar */}
      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm uppercase select-none border border-primary/10">
        {job.companyName?.[0] ?? '?'}
      </div>

      {/* Job title + company */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate leading-tight">
          {job.jobTitle}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {job.companyName}
        </p>
        {job.notes && (
          <p className="text-xs text-muted-foreground/75 italic mt-1.5 line-clamp-2 pr-4">
            {job.notes}
          </p>
        )}
      </div>

      {/* Meta — location / salary / date */}
      <div className="hidden md:flex items-center gap-5 text-xs text-muted-foreground shrink-0">
        {job.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 shrink-0" />
            {job.salary}
          </span>
        )}
        {displayDate && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            {displayDate}
          </span>
        )}
      </div>

      {/* Job post link */}
      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="View job posting"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {/* Reminder count indicator */}
      {(job.reminderCount ?? 0) > 0 && (
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 text-xs text-primary/80">
          <Bell className="h-3 w-3" />
          {job.reminderCount}
        </span>
      )}

      {/* Status badge */}
      <span
        className={`hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
        {statusConfig.label}
      </span>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Job options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onEdit(job)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {onSetReminder && (
            <DropdownMenuItem onClick={() => onSetReminder(job)}>
              <Bell className="mr-2 h-4 w-4" />
              Reminder
            </DropdownMenuItem>
          )}
          {job.url && (
            <DropdownMenuItem asChild>
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <LinkIcon className="mr-2 h-4 w-4" />
                View Posting
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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
