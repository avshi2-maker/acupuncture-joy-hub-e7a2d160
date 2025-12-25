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
import { Video, MessageCircle, Copy, Check, Link, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ZoomInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
  patientPhone?: string;
}

const ZOOM_LINK_STORAGE_KEY = 'therapist_zoom_link';

interface ZoomMeeting {
  id: number;
  joinUrl: string;
  startUrl: string;
  password: string;
  topic: string;
}

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
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<ZoomMeeting | null>(null);

  // Load saved Zoom link on mount
  useEffect(() => {
    const savedLink = localStorage.getItem(ZOOM_LINK_STORAGE_KEY);
    if (savedLink) {
      setZoomLink(savedLink);
    }
  }, [open]);

  // Reset created meeting when dialog closes
  useEffect(() => {
    if (!open) {
      setCreatedMeeting(null);
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
    const password = createdMeeting?.password ? `\n\n🔐 סיסמה: ${createdMeeting.password}` : '';
    const custom = customMessage ? `\n\n${customMessage}` : '';
    const closing = '\n\nנתראה! 💚';
    
    return greeting + intro + link + password + custom + closing;
  };

  const handleCreateZoomMeeting = async () => {
    setIsCreatingMeeting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-zoom-meeting', {
        body: {
          patientName: patientName,
          duration: 40,
        },
      });

      if (error) {
        console.error('Error creating Zoom meeting:', error);
        toast.error('שגיאה ביצירת פגישת Zoom');
        return;
      }

      if (data.error) {
        console.error('Zoom API error:', data.error, data.details);
        toast.error(`שגיאה: ${data.error}`);
        return;
      }

      const meeting = data.meeting as ZoomMeeting;
      setCreatedMeeting(meeting);
      setZoomLink(meeting.joinUrl);
      
      toast.success('פגישת Zoom נוצרה בהצלחה!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('שגיאה ביצירת פגישה');
    } finally {
      setIsCreatingMeeting(false);
    }
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
    if (saveLink && !createdMeeting) {
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

  const handleOpenHostMeeting = () => {
    if (createdMeeting?.startUrl) {
      window.open(createdMeeting.startUrl, '_blank');
    }
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
            צור פגישת Zoom חדשה או שלח קישור קיים
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

          {/* Create Zoom Meeting Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCreateZoomMeeting}
              disabled={isCreatingMeeting}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isCreatingMeeting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isCreatingMeeting ? 'יוצר פגישה...' : 'צור פגישת Zoom חדשה'}
            </Button>
            
            {createdMeeting && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <p className="text-sm font-medium text-green-800">✓ פגישה נוצרה בהצלחה!</p>
                <p className="text-xs text-green-700">מזהה פגישה: {createdMeeting.id}</p>
                {createdMeeting.password && (
                  <p className="text-xs text-green-700">סיסמה: {createdMeeting.password}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenHostMeeting}
                  className="w-full gap-2 mt-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <ExternalLink className="h-4 w-4" />
                  התחל פגישה כמארח
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">או השתמש בקישור קיים</span>
            </div>
          </div>

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
            {!createdMeeting && (
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
            )}
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
