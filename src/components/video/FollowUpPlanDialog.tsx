import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Send, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, addWeeks } from 'date-fns';
import { he } from 'date-fns/locale';

interface FollowUpPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
}

export function FollowUpPlanDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientPhone,
}: FollowUpPlanDialogProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const quickDates = [
    { label: 'שבוע', date: addWeeks(new Date(), 1) },
    { label: 'שבועיים', date: addWeeks(new Date(), 2) },
    { label: 'חודש', date: addWeeks(new Date(), 4) },
  ];

  const handleSave = async (sendWhatsApp: boolean = false) => {
    if (!patientId || !user) {
      toast.error('בחר מטופל תחילה');
      return;
    }

    if (!selectedDate) {
      toast.error('בחר תאריך המשך');
      return;
    }

    setIsSaving(true);
    if (sendWhatsApp) setIsSendingWhatsApp(true);

    try {
      // Save follow-up to database
      const { error } = await supabase.from('follow_ups').insert({
        patient_id: patientId,
        therapist_id: user.id,
        scheduled_date: selectedDate,
        reason: reason || 'טיפול המשך',
        notes,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('תוכנית המשך נשמרה');

      // Send WhatsApp if requested
      if (sendWhatsApp && patientPhone) {
        const formattedDate = format(new Date(selectedDate), 'EEEE, d בMMMM yyyy', { locale: he });
        const message = encodeURIComponent(
          `שלום ${patientName},\n\n` +
          `בהמשך לטיפול היום, נקבעה לך פגישת המשך ל:\n` +
          `📅 ${formattedDate}\n\n` +
          `${reason ? `סיבה: ${reason}\n` : ''}` +
          `${notes ? `הערות: ${notes}\n` : ''}` +
          `\nנשמח לראותך! 🌿`
        );

        const phoneNumber = patientPhone.replace(/\D/g, '');
        const formattedPhone = phoneNumber.startsWith('0') 
          ? '972' + phoneNumber.slice(1) 
          : phoneNumber;
        
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving follow-up:', error);
      toast.error('שגיאה בשמירת תוכנית ההמשך');
    } finally {
      setIsSaving(false);
      setIsSendingWhatsApp(false);
    }
  };

  const resetForm = () => {
    setSelectedDate('');
    setReason('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-jade" />
            תוכנית המשך טיפול
          </DialogTitle>
          <DialogDescription>
            {patientName ? `קבע פגישת המשך ל${patientName}` : 'קבע פגישת המשך'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Date Selection */}
          <div className="space-y-2">
            <Label>בחירה מהירה</Label>
            <div className="flex gap-2">
              {quickDates.map((q) => (
                <Button
                  key={q.label}
                  variant={selectedDate === format(q.date, 'yyyy-MM-dd') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDate(format(q.date, 'yyyy-MM-dd'))}
                  className={selectedDate === format(q.date, 'yyyy-MM-dd') ? 'bg-jade hover:bg-jade/90' : ''}
                >
                  {q.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date */}
          <div className="space-y-2">
            <Label htmlFor="follow-up-date">תאריך המשך</Label>
            <Input
              id="follow-up-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="follow-up-reason">סיבת ההמשך</Label>
            <Input
              id="follow-up-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="טיפול המשך, מעקב, וכו'"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="follow-up-notes">הערות למטופל</Label>
            <Textarea
              id="follow-up-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="המלצות, הנחיות..."
              rows={2}
            />
          </div>

          {/* Selected Date Preview */}
          {selectedDate && (
            <div className="p-3 bg-jade/10 rounded-lg border border-jade/30">
              <div className="flex items-center gap-2 text-jade">
                <Check className="h-4 w-4" />
                <span className="font-medium">
                  {format(new Date(selectedDate), 'EEEE, d בMMMM yyyy', { locale: he })}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={() => handleSave(false)} 
            disabled={isSaving || !selectedDate}
            className="w-full gap-2 bg-jade hover:bg-jade/90"
          >
            <Calendar className="h-4 w-4" />
            {isSaving && !isSendingWhatsApp ? 'שומר...' : 'שמור תוכנית המשך'}
          </Button>
          
          {patientPhone && (
            <Button 
              onClick={() => handleSave(true)} 
              disabled={isSaving || !selectedDate}
              variant="outline"
              className="w-full gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {isSendingWhatsApp ? 'שולח...' : 'שמור ושלח בוואטסאפ'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}