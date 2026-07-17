import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar, MoreVertical, Link as LinkIcon, Pencil, Bell, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { JobApplication, useDeleteJob } from '../api/jobsApi';
import { toast } from 'react-hot-toast';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onSetReminder?: (job: JobApplication) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Saved: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Applied: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Interview: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Offer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export function JobCard({ job, onEdit, onSetReminder }: JobCardProps) {
  const deleteMutation = useDeleteJob();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job application? This action cannot be undone.')) {
      deleteMutation.mutate(job._id, {
        onSuccess: () => toast.success('Job deleted successfully'),
        onError: () => toast.error('Failed to delete job'),
      });
    }
  };

  const statusClass = STATUS_STYLES[job.status] ?? STATUS_STYLES['Saved'];

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-border bg-card hover:bg-muted/40 hover:border-primary/30 transition-all group">
      {/* Company initial avatar */}
      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm uppercase select-none">
        {job.companyName?.[0] ?? '?'}
      </div>

      {/* Job title + company */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate">{job.jobTitle}</p>
        <p className="text-xs text-muted-foreground truncate">{job.companyName}</p>
      </div>

      {/* Meta — location / salary */}
      <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {job.salary}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(job.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Job post link */}
      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <LinkIcon className="h-3 w-3" />
          View Post
        </a>
      )}

      {/* Status badge */}
      <span className={`hidden sm:inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
        {job.status}
      </span>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-60 group-hover:opacity-100" aria-label="Job options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(job)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {onSetReminder && (
            <DropdownMenuItem onClick={() => onSetReminder(job)}>
              <Bell className="mr-2 h-4 w-4" />
              Set Reminder
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
