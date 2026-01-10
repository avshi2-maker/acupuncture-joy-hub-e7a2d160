import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Copy,
  Share2,
  Download,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Activity,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FinalReport } from '@/hooks/useSessionSummary';
import { CelebrationConfetti } from './CelebrationConfetti';

interface FinalReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: FinalReport | null;
  onCopied?: () => void; // Callback for celebration
}

export function FinalReportModal({ open, onOpenChange, report, onCopied }: FinalReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!report) return null;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(report.hebrewSummary);
      setCopied(true);
      setShowCelebration(true); // Trigger celebration!
      toast.success('🎉 הועתק ללוח!', {
        description: 'כעת ניתן להדביק בווטסאפ או בכל מקום אחר',
      });
      onCopied?.();
      setTimeout(() => {
        setCopied(false);
        setShowCelebration(false);
      }, 4000);
    } catch (err) {
      toast.error('שגיאה בהעתקה');
    }
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(report.hebrewSummary);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadText = () => {
    const blob = new Blob([report.hebrewSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('הקובץ הורד בהצלחה');
  };

  return (
    <>
      {/* Phase 7: Celebration Animation */}
      <CelebrationConfetti show={showCelebration} />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2" dir="rtl">
            <CheckCircle className="h-5 w-5 text-jade" />
            סיכום טיפול
          </DialogTitle>
          <DialogDescription dir="rtl">
            סיכום מלא של הממצאים והפרוטוקול הקליני
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-4">
          <div className="space-y-6" dir="rtl">
            {/* Pulse Analysis Section */}
            {report.pulseAnalysis.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">ממצאי דופק</h3>
                  <Badge variant="secondary">{report.pulseAnalysis.length}</Badge>
                </div>
                <div className="space-y-3">
                  {report.pulseAnalysis.map((pulse, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 rounded-lg p-3 border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{pulse.finding}</span>
                        <span className="text-sm text-muted-foreground">
                          ({pulse.chineseName})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        דפוס: {pulse.tcmPattern}
                      </p>
                      {pulse.aiReasoning && (
                        <p className="text-sm text-primary mt-1 flex items-start gap-1">
                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {pulse.aiReasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            <Separator />

            {/* Acupuncture Protocol Section */}
            {report.acupunctureProtocol.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-jade" />
                  <h3 className="font-semibold">פרוטוקול דיקור</h3>
                  <Badge variant="secondary" className="bg-jade/20 text-jade">
                    {report.acupunctureProtocol.length} נקודות
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {report.acupunctureProtocol.map((point, index) => (
                    <div
                      key={index}
                      className="bg-jade/5 rounded-lg p-3 border border-jade/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{point.code}</span>
                          <span className="text-sm">{point.hebrewName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {point.depth}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {point.angle}
                          </Badge>
                        </div>
                      </div>
                      {point.clinicalAction && (
                        <p className="text-sm text-muted-foreground">
                          {point.clinicalAction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Clinical Precautions Section */}
            {report.clinicalPrecautions.length > 0 && (
              <>
                <Separator />
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h3 className="font-semibold">אזהרות קליניות</h3>
                    <Badge variant="destructive" className="bg-amber-500/20 text-amber-600">
                      {report.clinicalPrecautions.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {report.clinicalPrecautions.map((warning, index) => (
                      <div
                        key={index}
                        className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800 text-sm"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </motion.section>
              </>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="gap-2"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-jade" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'הועתק!' : 'העתק'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadText}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              הורד
            </Button>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="bg-jade hover:bg-jade/90"
          >
            סיום
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default FinalReportModal;
