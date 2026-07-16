import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

export function JobCard({ job, onEdit, onSetReminder }: JobCardProps) {
  const deleteMutation = useDeleteJob();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saved': return 'secondary';
      case 'Applied': return 'default';
      case 'Interview': return 'warning';
      case 'Offer': return 'success';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job application? This action cannot be undone.')) {
      deleteMutation.mutate(job._id, {
        onSuccess: () => toast.success('Job deleted successfully'),
        onError: () => toast.error('Failed to delete job'),
      });
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold line-clamp-1">{job.jobTitle}</CardTitle>
            <p className="text-muted-foreground font-medium text-sm line-clamp-1 mt-1">{job.companyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(job.status) as any}>{job.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground mt-2">
          {job.location && (
            <div className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-1.5 line-clamp-1">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {job.url && (
          <div className="mt-4">
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-xs font-medium flex items-center gap-1 hover:underline"
            >
              <LinkIcon className="h-3 w-3" /> View Job Post
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
