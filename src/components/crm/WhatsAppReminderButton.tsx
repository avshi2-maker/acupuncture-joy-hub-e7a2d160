import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WhatsAppReminderButtonProps {
  patientName: string;
  patientPhone: string | null;
  appointmentDate: string;
  appointmentTime?: string;
  therapistPhone?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WhatsAppReminderButton({
  patientName,
  patientPhone,
  appointmentDate,
  appointmentTime,
  therapistPhone = '972505231042', // Default to Dr. Roni's number
  variant = 'outline',
  size = 'sm',
}: WhatsAppReminderButtonProps) {
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

  // Format phone number (remove spaces, dashes, and ensure country code)
  const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // If starts with 0, replace with 972
    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.substring(1);
    }
    // If doesn't start with +, assume it needs country code
    if (!cleaned.startsWith('+') && !cleaned.startsWith('972')) {
      cleaned = '972' + cleaned;
    }
    return cleaned.replace('+', '');
  };

  const formattedPatientPhone = formatPhone(patientPhone);
  const formattedTherapistPhone = formatPhone(therapistPhone);

  // Create pre-filled message in Hebrew
  const createReminderMessage = () => {
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
    message += `האם את/ה מגיע/ה?\n`;
    message += `✅ כן - אני מגיע/ה\n`;
    message += `❌ לא - אני צריך/ה לבטל\n\n`;
    message += `אנא השב/י בהודעה קצרה.\n`;
    message += `תודה! 💚`;
    
    return encodeURIComponent(message);
  };

  // Generate WhatsApp link
  const whatsappLink = `https://wa.me/${formattedPatientPhone}?text=${createReminderMessage()}`;

  const handleClick = () => {
    window.open(whatsappLink, '_blank');
    setSent(true);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={sent ? 'ghost' : variant}
            size={size}
            onClick={handleClick}
            className={sent ? 'text-emerald-500' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
          >
            {sent ? (
              <Check className="h-4 w-4" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{sent ? 'Reminder opened in WhatsApp' : 'Send WhatsApp reminder'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper component to generate response links for patients
export function generatePatientResponseLinks(therapistPhone: string = '972505231042') {
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

  const formattedPhone = formatPhone(therapistPhone);

  const yesMessage = encodeURIComponent('✅ כן, אני מגיע/ה לתור!');
  const noMessage = encodeURIComponent('❌ אני צריך/ה לבטל את התור');

  return {
    yesLink: `https://wa.me/${formattedPhone}?text=${yesMessage}`,
    noLink: `https://wa.me/${formattedPhone}?text=${noMessage}`,
  };
}
