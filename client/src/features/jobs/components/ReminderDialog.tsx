import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useScheduleReminder, useGetReminders, useDeleteReminder, useUpdateReminder, JobApplication, PendingReminder } from '../api/jobsApi';
import { authToast } from '@/lib/toast';
import { Clock, Calendar as CalendarIcon, CheckCircle2, Trash2, BellRing, Edit2, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication | null;
}

export function ReminderDialog({ open, onOpenChange, job }: ReminderDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  
  const scheduleReminder = useScheduleReminder();
  const deleteReminder = useDeleteReminder();
  const updateReminder = useUpdateReminder();
  
  // Fetch existing pending reminders for this job
  const { data: reminders, isLoading: isLoadingReminders } = useGetReminders(open && job ? job._id : null);

  const handleScheduleOrUpdate = () => {
    if (!job || !date || !time) return;

    // Combine date and time into ISO 8601
    const scheduledDateTime = new Date(`${date}T${time}:00`);

    if (scheduledDateTime.getTime() <= Date.now()) {
      authToast.error(
        'Invalid Reminder Time',
        'The selected reminder time has already passed. Please choose a future date or time.'
      );
      return;
    }

    const onSuccess = () => {
      setIsSuccess(true);
      setTimeout(() => {
        handleOpenChange(false);
      }, 2000);
    };

    if (editingReminderId) {
      updateReminder.mutate(
        { jobId: job._id, reminderId: editingReminderId, date: scheduledDateTime.toISOString(), notes },
        { onSuccess }
      );
    } else {
      scheduleReminder.mutate(
        { id: job._id, date: scheduledDateTime.toISOString(), notes },
        { onSuccess }
      );
    }
  };

  const handleDelete = (reminderId: string) => {
    if (!job) return;
    deleteReminder.mutate({ jobId: job._id, reminderId });
    if (editingReminderId === reminderId) {
      cancelEdit();
    }
  };

  const startEdit = (reminder: PendingReminder) => {
    const d = new Date(reminder.scheduledAt);
    setEditingReminderId(reminder._id);
    // Format YYYY-MM-DD for date input
    setDate(d.toLocaleDateString('en-CA')); // 'en-CA' outputs YYYY-MM-DD locally
    // Format HH:MM for time input
    setTime(d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    setNotes(reminder.notes || '');
  };

  const cancelEdit = () => {
    setEditingReminderId(null);
    setDate('');
    setTime('');
    setNotes('');
  };

  const resetState = () => {
    setIsSuccess(false);
    setEditingReminderId(null);
    setDate('');
    setTime('');
    setNotes('');
  };

  // When dialog closes, reset everything
  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) resetState();
  };

  const isPending = scheduleReminder.isPending || updateReminder.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Email Reminders</DialogTitle>
          <DialogDescription>
            Schedule or manage email reminders for {job?.companyName}.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-medium">
              {editingReminderId ? 'Reminder Updated!' : 'Reminder Scheduled!'}
            </h3>
            <p className="text-sm text-muted-foreground">You will receive an email exactly when scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-6 py-2">
            
            {/* ── Existing Reminders List ── */}
            {(isLoadingReminders || (reminders && reminders.length > 0)) && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <BellRing className="h-4 w-4 text-primary" /> Pending Reminders
                </h4>
                
                {isLoadingReminders ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {reminders?.map((reminder) => {
                      const d = new Date(reminder.scheduledAt);
                      const isEditing = editingReminderId === reminder._id;
                      return (
                        <div 
                          key={reminder._id} 
                          className={`flex items-center justify-between border rounded-lg p-3 text-sm transition-colors ${
                            isEditing 
                              ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' 
                              : 'bg-muted/40 border-border/50'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {reminder.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[240px]">
                                {reminder.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${isEditing ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                              onClick={() => isEditing ? cancelEdit() : startEdit(reminder)}
                              title={isEditing ? 'Cancel editing' : 'Edit reminder'}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(reminder._id)}
                              disabled={deleteReminder.isPending}
                              title="Delete reminder"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Divider if both sections exist ── */}
            {reminders && reminders.length > 0 && (
              <div className="h-px bg-border/60 w-full" />
            )}

            {/* ── Schedule/Edit Form ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  {editingReminderId ? 'Edit Reminder' : 'Schedule New Reminder'}
                </h4>
                {editingReminderId && (
                  <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3 mr-1" /> Cancel Edit
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-xs font-medium text-muted-foreground">
                      Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-9 cursor-pointer"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        onClick={(e) => {
                          if ('showPicker' in e.target) {
                            (e.target as HTMLInputElement).showPicker();
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]} // Can't schedule in the past
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="time" className="text-xs font-medium text-muted-foreground">
                      Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-9 cursor-pointer"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        onClick={(e) => {
                          if ('showPicker' in e.target) {
                            (e.target as HTMLInputElement).showPicker();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-xs font-medium text-muted-foreground">
                    Notes (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="e.g. Remember to ask about the remote work policy"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isSuccess && (
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
            <Button 
              onClick={handleScheduleOrUpdate} 
              disabled={!date || !time || isPending}
            >
              {isPending ? (
                <><LoadingSpinner size="sm" className="mr-2" /> Saving...</>
              ) : editingReminderId ? (
                'Update Reminder'
              ) : (
                'Schedule Reminder'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
