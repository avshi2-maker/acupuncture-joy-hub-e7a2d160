import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addHours } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Calendar, Clock } from 'lucide-react';

const appointmentSchema = z.object({
  date: z.string().min(1, 'נדרש תאריך'),
  time: z.string().min(1, 'נדרשת שעה'),
  title: z.string().min(1, 'נדרש כותרת'),
  notes: z.string().optional(),
});

type AppointmentData = z.infer<typeof appointmentSchema>;

interface QuickAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
}

export function QuickAppointmentDialog({ 
  open, 
  onOpenChange, 
  patientId,
  patientName 
}: QuickAppointmentDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<AppointmentData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      title: patientName ? `טיפול המשך - ${patientName}` : 'טיפול המשך',
      notes: '',
    },
  });

  const onSubmit = async (data: AppointmentData) => {
    if (!user) {
      toast.error('יש להתחבר תחילה');
      return;
    }

    setLoading(true);
    try {
      const startTime = new Date(`${data.date}T${data.time}`);
      const endTime = addHours(startTime, 1);

      const { error } = await supabase
        .from('appointments')
        .insert([{
          therapist_id: user.id,
          patient_id: patientId || null,
          title: data.title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: data.notes || null,
          status: 'scheduled',
        }]);

      if (error) throw error;

      toast.success('התור נקבע בהצלחה');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'שגיאה בקביעת תור');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-jade" />
            קביעת תור מהירה
          </DialogTitle>
          <DialogDescription>
            {patientName 
              ? `קביעת תור עבור ${patientName}`
              : 'קביעת תור חדש במהלך הפגישה'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      תאריך *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      שעה *
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת *</FormLabel>
                  <FormControl>
                    <Input placeholder="סוג הטיפול" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות</FormLabel>
                  <FormControl>
                    <Textarea placeholder="הערות לתור..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={loading} className="bg-jade hover:bg-jade/90">
                {loading ? 'שומר...' : 'קבע תור'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
