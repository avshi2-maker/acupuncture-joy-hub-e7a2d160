import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Headphones, 
  MessageCircle, 
  Loader2, 
  Sparkles,
  Volume2,
  Download,
  Check,
  RefreshCw,
  Edit2,
  Mic
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

const TTS_VOICES = [
  { id: 'onyx', name: 'Onyx', description: 'קול גברי עמוק' },
  { id: 'alloy', name: 'Alloy', description: 'קול ניטרלי' },
  { id: 'echo', name: 'Echo', description: 'קול גברי' },
  { id: 'fable', name: 'Fable', description: 'קול בריטי' },
  { id: 'nova', name: 'Nova', description: 'קול נשי' },
  { id: 'shimmer', name: 'Shimmer', description: 'קול נשי רך' },
];

interface SessionReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientPhone: string | null;
  sessionNotes: string;
  chiefComplaint?: string;
  anxietyResponses?: string[];
}

export function SessionReportDialog({
  open,
  onOpenChange,
  patientName,
  patientPhone,
  sessionNotes,
  chiefComplaint,
  anxietyResponses,
}: SessionReportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('onyx');

  const generateSummary = useCallback(async () => {
    setIsGenerating(true);
    setSummary(null);
    setAudioUrl(null);
    setPdfGenerated(false);
    setAudioGenerated(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-session-report', {
        body: {
          sessionNotes,
          patientName,
          chiefComplaint,
          anxietyResponses,
        },
      });

      if (error) throw error;

      if (data?.summary) {
        setSummary(data.summary);
        setEditedSummary(data.summary);
        toast.success('סיכום נוצר בהצלחה');
      } else {
        throw new Error('No summary generated');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      toast.error('שגיאה ביצירת הסיכום');
    } finally {
      setIsGenerating(false);
    }
  }, [sessionNotes, patientName, chiefComplaint, anxietyResponses]);

  const generateAudio = useCallback(async () => {
    if (!summary) return;

    setIsGeneratingAudio(true);

    try {
      const textToRead = isEditing ? editedSummary : summary;
      
      // Use OpenAI TTS via text-to-speech edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: textToRead,
            voice: selectedVoice,
            language: 'he',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const data = await response.json();
      
      if (data?.audioContent) {
        // Create audio URL from base64
        const audioDataUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        setAudioUrl(audioDataUrl);
        setAudioGenerated(true);
        toast.success('קובץ אודיו נוצר בהצלחה');
      } else {
        throw new Error('No audio content received');
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error('שגיאה ביצירת קובץ האודיו');
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [summary, editedSummary, isEditing, selectedVoice]);

  const generatePDF = useCallback(() => {
    if (!summary) return;

    try {
      const textToUse = isEditing ? editedSummary : summary;
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(18);
      doc.text('Session Summary / סיכום פגישה', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Patient: ${patientName}`, 20, 35);
      doc.text(`Date: ${new Date().toLocaleDateString('he-IL')}`, 20, 42);
      
      // Add separator line
      doc.line(20, 48, 190, 48);
      
      // Add summary content
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(textToUse, 170);
      doc.text(splitText, 20, 58);
      
      // Save PDF
      const fileName = `session-report-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setPdfGenerated(true);
      toast.success('PDF נוצר והורד בהצלחה');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('שגיאה ביצירת קובץ PDF');
    }
  }, [summary, editedSummary, isEditing, patientName]);

  const downloadAudio = useCallback(() => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `session-audio-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('קובץ אודיו הורד');
  }, [audioUrl, patientName]);

  const playAudio = useCallback(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play();
  }, [audioUrl]);

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

  const sendViaWhatsApp = useCallback((type: 'pdf' | 'audio' | 'both') => {
    if (!patientPhone) {
      toast.error('לא נמצא מספר טלפון של המטופל');
      return;
    }

    const formattedPhone = formatPhone(patientPhone);
    const textToSend = isEditing ? editedSummary : summary;
    
    let message = `שלום ${patientName}! 🌿\n\n`;
    message += `להלן סיכום הפגישה שלנו:\n\n`;
    message += `${textToSend}\n\n`;
    
    if (type === 'pdf' || type === 'both') {
      message += `📄 דו"ח PDF מצורף בנפרד\n`;
    }
    if (type === 'audio' || type === 'both') {
      message += `🎧 קובץ אודיו מצורף בנפרד\n`;
    }
    
    message += `\nבברכה,\nד"ר רוני ספיר 💚`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp נפתח');
  }, [patientPhone, patientName, summary, editedSummary, isEditing]);

  const handleSaveEdit = () => {
    setSummary(editedSummary);
    setIsEditing(false);
    // Reset generated files since content changed
    setAudioUrl(null);
    setAudioGenerated(false);
    toast.success('הסיכום עודכן');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-jade" />
            יצירת דו"ח פגישה
          </DialogTitle>
          <DialogDescription>
            צור סיכום AI עם המלצות תזונה, פעילות וצמחי מרפא - שלח כ-PDF או MP3
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Patient Info */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">{patientName}</Badge>
            {patientPhone && (
              <Badge variant="secondary" className="font-mono text-xs">
                {patientPhone}
              </Badge>
            )}
          </div>

          {/* Generate Summary Button */}
          {!summary && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
                <Sparkles className="h-12 w-12 text-jade/50" />
                <p className="text-muted-foreground text-center">
                  צור סיכום אוטומטי מהערות הפגישה
                </p>
                <Button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="bg-jade hover:bg-jade/90 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      יוצר סיכום...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      צור סיכום AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary Content */}
          {summary && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">סיכום הפגישה</h4>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      ערוך
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="gap-1 text-jade"
                    >
                      <Check className="h-3 w-3" />
                      שמור
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSummary}
                    disabled={isGenerating}
                    className="gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                    חדש
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 border rounded-lg p-4 max-h-[200px]">
                {isEditing ? (
                  <Textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="min-h-[180px] border-0 focus-visible:ring-0 resize-none"
                    dir="rtl"
                  />
                ) : (
                  <div className="text-sm whitespace-pre-wrap" dir="rtl">
                    {summary}
                  </div>
                )}
              </ScrollArea>

              <Separator />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* PDF Generation */}
                <Card className={`p-3 ${pdfGenerated ? 'border-jade/50 bg-jade/5' : ''}`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className={`h-5 w-5 ${pdfGenerated ? 'text-jade' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">דו"ח PDF</span>
                      {pdfGenerated && <Check className="h-4 w-4 text-jade ml-auto" />}
                    </div>
                    <Button
                      variant={pdfGenerated ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={generatePDF}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {pdfGenerated ? 'הורד שוב' : 'צור והורד'}
                    </Button>
                  </div>
                </Card>

                {/* Audio Generation */}
                <Card className={`p-3 ${audioGenerated ? 'border-jade/50 bg-jade/5' : ''}`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Headphones className={`h-5 w-5 ${audioGenerated ? 'text-jade' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">קובץ MP3</span>
                      {audioGenerated && <Check className="h-4 w-4 text-jade ml-auto" />}
                    </div>
                    
                    {/* Voice Selector */}
                    <div className="flex items-center gap-2">
                      <Mic className="h-3 w-3 text-muted-foreground" />
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="בחר קול" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          {TTS_VOICES.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id} className="text-xs">
                              <span className="font-medium">{voice.name}</span>
                              <span className="text-muted-foreground mr-2">- {voice.description}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {!audioGenerated ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={generateAudio}
                        disabled={isGeneratingAudio}
                        className="gap-1"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            יוצר...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            צור אודיו
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={playAudio}
                          className="gap-1 flex-1"
                        >
                          <Volume2 className="h-3 w-3" />
                          נגן
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAudio}
                          className="gap-1 flex-1"
                        >
                          <Download className="h-3 w-3" />
                          הורד
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <Separator />

              {/* WhatsApp Send Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  שלח למטופל ב-WhatsApp
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendViaWhatsApp('pdf')}
                    disabled={!patientPhone}
                    className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <FileText className="h-3 w-3" />
                    שלח טקסט + PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendViaWhatsApp('audio')}
                    disabled={!patientPhone || !audioGenerated}
                    className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Headphones className="h-3 w-3" />
                    שלח טקסט + אודיו
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => sendViaWhatsApp('both')}
                    disabled={!patientPhone || !audioGenerated}
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-3 w-3" />
                    שלח הכל
                  </Button>
                </div>
                {!patientPhone && (
                  <p className="text-xs text-muted-foreground">
                    * לא נמצא מספר טלפון - יש להוסיף למטופל
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
