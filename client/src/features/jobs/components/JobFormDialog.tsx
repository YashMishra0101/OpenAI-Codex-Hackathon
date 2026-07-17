import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateJob, useUpdateJob, JobApplication } from '../api/jobsApi';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const jobFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  status: z.enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  salary: z.string().max(100).optional(),
  appliedDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobApplication | null;
}

const STATUS_OPTIONS = [
  { value: 'Saved',     label: 'Reminder' },
  { value: 'Applied',   label: 'Applied' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Offer',     label: 'Offer' },
  { value: 'Rejected',  label: 'Rejected' },
] as const;

export function JobFormDialog({ open, onOpenChange, job }: JobFormDialogProps) {
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const isEditMode = !!job;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      companyName: '',
      jobTitle: '',
      status: 'Saved',
      url: '',
      location: '',
      salary: '',
      appliedDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (job && open) {
      form.reset({
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        status: job.status,
        url: job.url || '',
        location: job.location || '',
        salary: job.salary || '',
        appliedDate: job.appliedDate
          ? new Date(job.appliedDate).toISOString().split('T')[0]
          : '',
        notes: job.notes || '',
      });
    } else if (!job && open) {
      form.reset({
        companyName: '',
        jobTitle: '',
        status: 'Saved',
        url: '',
        location: '',
        salary: '',
        appliedDate: '',
        notes: '',
      });
    }
  }, [job, open, form]);

  const onSubmit = (values: JobFormValues) => {
    if (isEditMode && job) {
      updateMutation.mutate(
        { id: job._id, data: values },
        {
          onSuccess: () => {
            toast.success('Job application updated');
            onOpenChange(false);
          },
          onError: () => toast.error('Failed to update job'),
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success('Job application added');
          onOpenChange(false);
        },
        onError: () => toast.error('Failed to add job'),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? 'Edit Application' : 'Add Application'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update the details of your job application.'
              : 'Track a new job opportunity in your pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Row 1: Company + Title + Status (3 columns) */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Frontend Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Location + Salary + Applied Date (3 columns) */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Location{' '}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Remote, NY..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Salary{' '}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="$120k – $150k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appliedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applied Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: URL (full width) */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Job Post URL{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 4: Notes (full width, compact) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Recruiter name, interview notes, next steps..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[90px]">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Save Changes'
                ) : (
                  'Add Job'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
