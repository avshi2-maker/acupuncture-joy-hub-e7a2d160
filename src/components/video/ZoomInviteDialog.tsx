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
import { Video, MessageCircle, Copy, Check, Link } from 'lucide-react';
import { toast } from 'sonner';

interface ZoomInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
  patientPhone?: string;
}

const ZOOM_LINK_STORAGE_KEY = 'therapist_zoom_link';

export function ZoomInviteDialog({
  open,
  onOpenChange,
  patientName,
  patientPhone,
}: ZoomInviteDialogProps) {
  const [zoomLink, setZoomLink] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveLink, setSaveLink] = useState(true);

  // Load saved Zoom link on mount
  useEffect(() => {
    const savedLink = localStorage.getItem(ZOOM_LINK_STORAGE_KEY);
    if (savedLink) {
      setZoomLink(savedLink);
    }
  }, [open]);

  // Format phone number for WhatsApp
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

  const generateMessage = () => {
    const greeting = `שלום ${patientName || 'לך'}! 🌿`;
    const intro = '\n\nמזמין/ה אותך לפגישת וידאו:';
    const link = `\n\n🔗 קישור לפגישה:\n${zoomLink}`;
    const custom = customMessage ? `\n\n${customMessage}` : '';
    const closing = '\n\nנתראה! 💚';
    
    return greeting + intro + link + custom + closing;
  };

  const handleSendWhatsApp = () => {
    if (!zoomLink.trim()) {
      toast.error('נא להזין קישור לפגישה');
      return;
    }

    if (!patientPhone) {
      toast.error('לא נמצא מספר טלפון למטופל');
      return;
    }

    // Save link if checkbox is checked
    if (saveLink) {
      localStorage.setItem(ZOOM_LINK_STORAGE_KEY, zoomLink);
    }

    const formattedPhone = formatPhone(patientPhone);
    const message = encodeURIComponent(generateMessage());
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${message}`;
    
    window.open(whatsappLink, '_blank');
    toast.success('נפתח WhatsApp עם הזמנה לפגישה');
    onOpenChange(false);
  };

  const handleCopyLink = () => {
    if (!zoomLink.trim()) {
      toast.error('נא להזין קישור לפגישה');
      return;
    }
    
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    toast.success('ההודעה הועתקה');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLinkOnly = () => {
    if (!zoomLink.trim()) {
      toast.error('נא להזין קישור לפגישה');
      return;
    }
    
    navigator.clipboard.writeText(zoomLink);
    toast.success('הקישור הועתק');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            הזמנה לפגישת וידאו
          </DialogTitle>
          <DialogDescription>
            שלח קישור לפגישת Zoom למטופל בוואטסאפ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Info */}
          {patientName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">מטופל: {patientName}</p>
              {patientPhone && (
                <p className="text-sm text-muted-foreground">טלפון: {patientPhone}</p>
              )}
            </div>
          )}

          {/* Zoom Link Input */}
          <div className="space-y-2">
            <Label htmlFor="zoom-link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              קישור לפגישה (Zoom / Google Meet / אחר)
            </Label>
            <div className="flex gap-2">
              <Input
                id="zoom-link"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="flex-1"
                dir="ltr"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLinkOnly}
                title="העתק קישור"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="save-link"
                checked={saveLink}
                onChange={(e) => setSaveLink(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="save-link" className="text-sm text-muted-foreground cursor-pointer">
                שמור קישור לשימוש עתידי
              </Label>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">הודעה נוספת (אופציונלי)</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="הוסף הודעה אישית..."
              rows={2}
            />
          </div>

          {/* Preview */}
          {zoomLink && (
            <div className="space-y-2">
              <Label>תצוגה מקדימה:</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                {generateMessage()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row-reverse gap-2 sm:gap-2">
          <Button
            onClick={handleSendWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            disabled={!patientPhone}
          >
            <MessageCircle className="h-4 w-4" />
            שלח בוואטסאפ
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            העתק הודעה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
