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

const jobFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  status: z.enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  salary: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobApplication | null;
}

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Job Application' : 'Add Job Application'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your job application.' : 'Track a new job opportunity.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Saved">Saved</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Post URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
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
                    <FormLabel>Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="$120k - $150k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Interviewer names, thoughts..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
