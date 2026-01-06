import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Loader2, Paperclip, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProtocolData {
  diagnosis: string;
  herbalFormula?: string;
  acupuncturePoints: string[];
  nutritionAdvice: string[];
  lifestyleAdvice: string[];
  moduleName?: string;
}

interface EmailProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocolData: ProtocolData;
  patientName?: string;
  patientEmail?: string;
  pdfBase64?: string;
  language?: 'en' | 'he';
}

export function EmailProtocolDialog({
  open,
  onOpenChange,
  protocolData,
  patientName = '',
  patientEmail = '',
  pdfBase64,
  language = 'en',
}: EmailProtocolDialogProps) {
  const [email, setEmail] = useState(patientEmail);
  const [name, setName] = useState(patientName);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState(
    language === 'he'
      ? `שלום ${patientName || '[שם המטופל]'},\n\nמצורף סיכום הפרוטוקול הטיפולי שלך. אני כאן לכל שאלה.\n\nבברכה`
      : `Dear ${patientName || '[Patient Name]'},\n\nAttached is your treatment protocol summary. Please feel free to reach out if you have any questions.\n\nBest regards`
  );
  const [attachPdf, setAttachPdf] = useState(!!pdfBase64);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email) {
      toast.error(language === 'he' ? 'נא להזין כתובת אימייל' : 'Please enter an email address');
      return;
    }

    if (!name) {
      toast.error(language === 'he' ? 'נא להזין שם המטופל' : 'Please enter patient name');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(language === 'he' ? 'כתובת אימייל לא תקינה' : 'Invalid email address');
      return;
    }

    setIsSending(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(language === 'he' ? 'נא להתחבר מחדש' : 'Please sign in again');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-protocol-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            patientEmail: email,
            patientName: name,
            subject: subject || undefined,
            message: message || undefined,
            protocolData,
            pdfBase64: attachPdf ? pdfBase64 : undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast.success(
        language === 'he' 
          ? 'האימייל נשלח בהצלחה!' 
          : 'Email sent successfully!'
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(
        language === 'he'
          ? 'שגיאה בשליחת האימייל'
          : 'Failed to send email. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const labels = {
    title: language === 'he' ? 'שליחה למטופל' : 'Email to Patient',
    name: language === 'he' ? 'שם המטופל' : 'Patient Name',
    email: language === 'he' ? 'כתובת אימייל' : 'Email Address',
    subject: language === 'he' ? 'נושא (אופציונלי)' : 'Subject (optional)',
    message: language === 'he' ? 'הודעה אישית' : 'Personal Message',
    attachPdf: language === 'he' ? 'צרף קובץ PDF' : 'Attach PDF Summary',
    send: language === 'he' ? 'שלח' : 'Send Email',
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-jade" />
            {labels.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{labels.name}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{labels.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">{labels.subject}</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`Your TCM Protocol Summary - ${protocolData.moduleName || 'Clinical Navigator'}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{labels.message}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {pdfBase64 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attach-pdf"
                checked={attachPdf}
                onCheckedChange={(checked) => setAttachPdf(!!checked)}
              />
              <label
                htmlFor="attach-pdf"
                className="text-sm font-medium flex items-center gap-2 cursor-pointer"
              >
                <Paperclip className="h-4 w-4" />
                {labels.attachPdf}
              </label>
            </div>
          )}

          {/* Preview what will be sent */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-1">
              {language === 'he' ? 'יישלח:' : 'Will include:'}
            </p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• {language === 'he' ? 'אבחון' : 'Diagnosis'}</li>
              {protocolData.herbalFormula && (
                <li>• {language === 'he' ? 'פורמולה צמחית' : 'Herbal Formula'}</li>
              )}
              <li>• {protocolData.acupuncturePoints.length} {language === 'he' ? 'נקודות דיקור' : 'Acupuncture Points'}</li>
              {protocolData.nutritionAdvice.length > 0 && (
                <li>• {language === 'he' ? 'המלצות תזונה' : 'Dietary Advice'}</li>
              )}
              {protocolData.lifestyleAdvice.length > 0 && (
                <li>• {language === 'he' ? 'המלצות לאורח חיים' : 'Lifestyle Advice'}</li>
              )}
              {attachPdf && pdfBase64 && (
                <li className="text-jade">• PDF {language === 'he' ? 'מצורף' : 'attachment'}</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            {labels.cancel}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || !email || !name}
            className="gap-2 bg-jade hover:bg-jade/90"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'he' ? 'שולח...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {labels.send}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
