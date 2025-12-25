import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WhatsAppReminderButtonProps {
  patientName: string;
  patientPhone: string | null;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime?: string;
  therapistPhone?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WhatsAppReminderButton({
  patientName,
  patientPhone,
  appointmentId,
  appointmentDate,
  appointmentTime,
  therapistPhone = '972505231042',
  variant = 'outline',
  size = 'sm',
}: WhatsAppReminderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!patientPhone) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size={size} disabled className="opacity-50">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>No phone number available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Format phone number
  const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('+') && !cleaned.startsWith('972')) {
      cleaned = '972' + cleaned;
    }
    return cleaned.replace('+', '');
  };

  const formattedPatientPhone = formatPhone(patientPhone);

  const handleClick = async () => {
    setLoading(true);
    
    try {
      // Generate a unique token
      const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      
      // Set expiry to appointment date + 1 day
      const expiresAt = new Date(appointmentDate);
      expiresAt.setDate(expiresAt.getDate() + 1);

      // Create confirmation record
      const { error } = await supabase
        .from('appointment_confirmations')
        .insert({
          appointment_id: appointmentId,
          token: token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        console.error('Error creating confirmation:', error);
        toast.error('שגיאה ביצירת קישור אישור');
        setLoading(false);
        return;
      }

      // Build confirmation URL
      const baseUrl = window.location.origin;
      const confirmUrl = `${baseUrl}/confirm?token=${token}`;

      // Create WhatsApp message with confirmation links
      const dateStr = new Date(appointmentDate).toLocaleDateString('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      let message = `שלום ${patientName}! 🌿\n\n`;
      message += `זוהי תזכורת לתור שלך בתאריך ${dateStr}`;
      if (appointmentTime) {
        message += ` בשעה ${appointmentTime}`;
      }
      message += `.\n\n`;
      message += `*האם את/ה מגיע/ה?*\n\n`;
      message += `✅ לחץ/י כאן לאישור:\n${confirmUrl}&response=confirmed\n\n`;
      message += `❌ לחץ/י כאן לביטול:\n${confirmUrl}&response=cancelled\n\n`;
      message += `תודה! 💚`;

      const whatsappLink = `https://wa.me/${formattedPatientPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
      setSent(true);
      toast.success('נפתח WhatsApp עם קישור אישור');
    } catch (err) {
      console.error('Error:', err);
      toast.error('שגיאה בשליחת התזכורת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={sent ? 'ghost' : variant}
            size={size}
            onClick={handleClick}
            disabled={loading}
            className={sent ? 'text-emerald-500' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sent ? (
              <Check className="h-4 w-4" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{loading ? 'Creating link...' : sent ? 'Reminder sent with confirmation link' : 'Send WhatsApp reminder'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
