import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { savePatientLocally } from '@/utils/localDataStorage';

const quickPatientSchema = z.object({
  id_number: z.string().min(5, 'נדרש מספר ת.ז.'),
  full_name: z.string().min(2, 'נדרש שם מלא'),
  phone: z.string().min(8, 'נדרש טלפון תקין'),
  chief_complaint: z.string().min(1, 'נדרשת תלונה עיקרית'),
});

type QuickPatientData = z.infer<typeof quickPatientSchema>;

interface QuickPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patientId: string, patientName: string) => void;
}

export function QuickPatientDialog({ open, onOpenChange, onPatientCreated }: QuickPatientDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<QuickPatientData>({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: {
      id_number: '',
      full_name: '',
      phone: '',
      chief_complaint: '',
    },
  });

  const onSubmit = async (data: QuickPatientData) => {
    if (!user) {
      toast.error('יש להתחבר תחילה');
      return;
    }

    setLoading(true);
    try {
      // Check duplicate ID
      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('id_number', data.id_number)
        .maybeSingle();

      if (existing) {
        toast.error('מספר ת.ז. כבר קיים במערכת');
        setLoading(false);
        return;
      }

      const { data: patient, error } = await supabase
        .from('patients')
        .insert([{
          therapist_id: user.id,
          id_number: data.id_number,
          full_name: data.full_name,
          phone: data.phone,
          chief_complaint: data.chief_complaint,
        }])
        .select()
        .single();

      if (error) throw error;

      // Save locally too
      savePatientLocally({
        id: patient.id,
        full_name: data.full_name,
        id_number: data.id_number,
        phone: data.phone,
        chief_complaint: data.chief_complaint,
        savedAt: new Date().toISOString(),
      });

      toast.success('מטופל נוסף בהצלחה');
      onPatientCreated?.(patient.id, data.full_name);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast.error(error.message || 'שגיאה ביצירת מטופל');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-jade" />
            הוספת מטופל מהירה
          </DialogTitle>
          <DialogDescription>
            הוסף מטופל חדש במהירות במהלך הפגישה
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מספר ת.ז. *</FormLabel>
                  <FormControl>
                    <Input placeholder="הזן מספר ת.ז." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם מלא *</FormLabel>
                  <FormControl>
                    <Input placeholder="הזן שם מלא" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>טלפון *</FormLabel>
                  <FormControl>
                    <Input placeholder="050-1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chief_complaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תלונה עיקרית *</FormLabel>
                  <FormControl>
                    <Input placeholder="סיבת הפנייה" {...field} />
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
                {loading ? 'שומר...' : 'הוסף מטופל'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
