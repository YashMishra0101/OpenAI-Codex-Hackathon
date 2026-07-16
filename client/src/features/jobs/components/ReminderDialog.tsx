import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScheduleReminder, JobApplication } from '../api/jobsApi';
import { Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication | null;
}

export function ReminderDialog({ open, onOpenChange, job }: ReminderDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const scheduleReminder = useScheduleReminder();

  const handleSchedule = () => {
    if (!job || !date || !time) return;

    // Combine date and time into ISO 8601
    const scheduledDateTime = new Date(`${date}T${time}:00`);

    scheduleReminder.mutate(
      { id: job._id, date: scheduledDateTime.toISOString() },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            onOpenChange(false);
            setIsSuccess(false);
            setDate('');
            setTime('');
          }, 2000);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setIsSuccess(false);
        setDate('');
        setTime('');
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Email Reminder</DialogTitle>
          <DialogDescription>
            We'll send you an email reminder for your application at {job?.companyName}.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-medium">Reminder Scheduled!</h3>
            <p className="text-sm text-muted-foreground">You will receive an email exactly when scheduled.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-9"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Can't schedule in the past
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="time" className="text-sm font-medium">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-9"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSchedule} 
                disabled={!date || !time || scheduleReminder.isPending}
              >
                {scheduleReminder.isPending ? 'Scheduling...' : 'Schedule Reminder'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
