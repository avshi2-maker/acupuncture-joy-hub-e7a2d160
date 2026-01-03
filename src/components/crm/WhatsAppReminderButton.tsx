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
  therapistName?: string;
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
  therapistName,
  therapistPhone = '972505231042',
  variant = 'outline',
  size = 'sm',
}: WhatsAppReminderButtonProps) {
  // Get therapist name from localStorage if not provided
  const getTherapistDisplayName = () => {
    if (therapistName) return therapistName;
    try {
      const intakeData = localStorage.getItem('therapist_intake_completed');
      if (intakeData) {
        const parsed = JSON.parse(intakeData);
        return parsed.therapistName || 'המטפל/ת שלך';
      }
    } catch { /* ignore */ }
    return 'המטפל/ת שלך';
  };
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

      // Build appointment landing page URL
      const baseUrl = window.location.origin;
      const landingUrl = `${baseUrl}/appointment?token=${token}&lang=he`;

      // Create WhatsApp message with landing page link
      const dateStr = new Date(appointmentDate).toLocaleDateString('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      const displayTherapistName = getTherapistDisplayName();
      
      // Logo URL for WhatsApp preview
      const logoPreviewUrl = "https://hwwwioyrsbewptuwvrix.supabase.co/storage/v1/object/public/assets/clinic-logo.png";
      
      let message = `🌿 *ד"ר רוני ספיר - קליניקה לרפואה משלימה*\n\n`;
      message += `שלום ${patientName}!\n\n`;
      message += `זוהי תזכורת לתור שלך אצל ${displayTherapistName} בתאריך ${dateStr}`;
      if (appointmentTime) {
        message += ` בשעה ${appointmentTime}`;
      }
      message += `.\n\n`;
      message += `📍 לחץ/י כאן לפרטי הגעה ואישור:\n${landingUrl}\n\n`;
      message += `בברכה,\n${displayTherapistName} 💚\n\n`;
      message += `🔗 ${logoPreviewUrl}`;

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
