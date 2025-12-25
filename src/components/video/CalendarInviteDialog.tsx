import { useState, useEffect } from 'react';
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
import { Calendar, MessageCircle, Video, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addMinutes } from 'date-fns';
import { he } from 'date-fns/locale';
import { ZOOM_LINK_STORAGE_KEY } from './TherapistSettingsDialog';

interface CalendarInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  onAppointmentCreated?: (appointmentId: string) => void;
}

export function CalendarInviteDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientPhone,
  onAppointmentCreated,
}: CalendarInviteDialogProps) {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      // Load saved Zoom link
      const savedZoomLink = localStorage.getItem(ZOOM_LINK_STORAGE_KEY) || '';
      setZoomLink(savedZoomLink);
      
      // Set default date/time to now
      const now = new Date();
      setDate(format(now, 'yyyy-MM-dd'));
      setTime(format(now, 'HH:mm'));
    }
  }, [open]);

  const handleCreate = async (sendWhatsApp: boolean = false) => {
    if (!user) {
      toast.error('התחבר למערכת תחילה');
      return;
    }

    if (!date || !time) {
      toast.error('בחר תאריך ושעה');
      return;
    }

    setIsCreating(true);
    try {
      // Create appointment start and end times (40 minutes)
      const startTime = new Date(`${date}T${time}`);
      const endTime = addMinutes(startTime, 40);

      // Create appointment in calendar
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          therapist_id: user.id,
          patient_id: patientId || null,
          title: patientName ? `פגישת וידאו - ${patientName}` : 'פגישת וידאו',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'scheduled',
          notes: `${notes}\n\nקישור Zoom: ${zoomLink}`.trim(),
          color: '#3B82F6', // Blue for video calls
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      toast.success('הפגישה נוספה ליומן (40 דקות)');

      // Send WhatsApp invite if requested
      if (sendWhatsApp && patientPhone) {
        const formattedDate = format(startTime, 'EEEE, d בMMMM yyyy', { locale: he });
        const formattedTime = format(startTime, 'HH:mm');
        
        const message = encodeURIComponent(
          `שלום ${patientName || ''},\n\n` +
          `הוזמנת לפגישת וידאו:\n\n` +
          `📅 תאריך: ${formattedDate}\n` +
          `🕐 שעה: ${formattedTime}\n` +
          `⏱️ משך: 40 דקות\n\n` +
          `${zoomLink ? `🔗 קישור לפגישה:\n${zoomLink}\n\n` : ''}` +
          `${notes ? `📝 הערות: ${notes}\n\n` : ''}` +
          `נשמח לראותך! 🌿`
        );

        const phoneNumber = patientPhone.replace(/\D/g, '');
        const formattedPhone = phoneNumber.startsWith('0') 
          ? '972' + phoneNumber.slice(1) 
          : phoneNumber;
        
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
      }

      onAppointmentCreated?.(appointmentData.id);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('שגיאה ביצירת הפגישה');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setDate('');
    setTime('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            הזמנה ליומן + Zoom
          </DialogTitle>
          <DialogDescription>
            {patientName 
              ? `צור הזמנה ל${patientName} עם חסימה של 40 דקות ביומן`
              : 'צור הזמנה עם חסימה של 40 דקות ביומן'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="invite-date">תאריך</Label>
              <Input
                id="invite-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-time">שעה</Label>
              <Input
                id="invite-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration Info */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              משך הפגישה: 40 דקות (מגבלת Zoom חינם)
            </span>
          </div>

          {/* Zoom Link */}
          <div className="space-y-2">
            <Label htmlFor="invite-zoom" className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              קישור Zoom
            </Label>
            <Input
              id="invite-zoom"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              dir="ltr"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="invite-notes">הערות (אופציונלי)</Label>
            <Textarea
              id="invite-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות נוספות להזמנה..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={() => handleCreate(false)} 
            disabled={isCreating || !date || !time}
            className="w-full gap-2 bg-jade hover:bg-jade/90"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                יוצר...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                הוסף ליומן
              </>
            )}
          </Button>
          
          {patientPhone && (
            <Button 
              onClick={() => handleCreate(true)} 
              disabled={isCreating || !date || !time}
              variant="outline"
              className="w-full gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              הוסף ליומן + שלח בוואטסאפ
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}