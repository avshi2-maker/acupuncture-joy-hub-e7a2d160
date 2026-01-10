import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  FileCheck, 
  Activity, 
  MapPin, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';
import { useGlobalSessionOptional } from '@/contexts/GlobalSessionContext';
import { SessionSummaryButton } from '@/components/session/SessionSummaryButton';
import { FinalReportModal } from '@/components/session/FinalReportModal';
import { PulseChangeConfirmModal } from '@/components/session/PulseChangeConfirmModal';
import { LiveAssistantTeleprompter } from './LiveAssistantTeleprompter';

/**
 * Active Session Widget - Phase 7: Dashboard Integration
 * Shows current session state and provides quick access to summary
 */

interface ActiveSessionWidgetProps {
  className?: string;
  showTeleprompter?: boolean;
}

export function ActiveSessionWidget({ 
  className,
  showTeleprompter = true 
}: ActiveSessionWidgetProps) {
  const session = useGlobalSessionOptional();
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReturnType<NonNullable<typeof session>['generateFinalReport']> | null>(null);
  
  // If no session context, don't render
  if (!session) return null;
  
  const { 
    counts, 
    hasData, 
    canGenerateReport,
    hasPendingPulseChange,
    pendingPulseChange,
    validateAndGenerateReport,
    confirmPulseChange,
    cancelPulseChange,
    sessionData,
  } = session;
  
  // Don't render if no active session data
  if (!hasData) return null;
  
  const handleFinishSession = () => {
    const report = validateAndGenerateReport();
    if (report) {
      setGeneratedReport(report);
      setShowReportModal(true);
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "bg-gradient-to-br from-jade/10 to-jade/5",
          "border border-jade/30 rounded-xl p-4",
          "backdrop-blur-sm",
          className
        )}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-jade/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-jade" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">טיפול פעיל</h4>
              <p className="text-xs text-muted-foreground">
                נתונים נאספים...
              </p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-jade"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs text-jade font-medium">פעיל</span>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Pulse Count */}
          <div className="bg-card/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-lg font-bold">{counts.pulseCount}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">דופקים</p>
          </div>
          
          {/* Point Count */}
          <div className="bg-card/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="h-3.5 w-3.5 text-jade" />
              <span className="text-lg font-bold">{counts.pointCount}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">נקודות</p>
          </div>
          
          {/* Warnings Count */}
          <div className="bg-card/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className={cn(
                "h-3.5 w-3.5",
                counts.contradictionCount > 0 ? "text-amber-500" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-lg font-bold",
                counts.contradictionCount > 0 && "text-amber-500"
              )}>
                {counts.contradictionCount}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">אזהרות</p>
          </div>
        </div>
        
        {/* Live Teleprompter */}
        {showTeleprompter && (
          <LiveAssistantTeleprompter
            hasPulse={counts.pulseCount > 0}
            hasPoints={counts.pointCount > 0}
            pointCount={counts.pointCount}
            hasContradictions={counts.contradictionCount > 0}
            isSessionEnding={canGenerateReport}
            className="mb-4"
          />
        )}
        
        {/* Finish Button */}
        <SessionSummaryButton
          pointCount={counts.pointCount}
          pulseCount={counts.pulseCount}
          onClick={handleFinishSession}
          disabled={!canGenerateReport}
        />
      </motion.div>
      
      {/* Final Report Modal */}
      <FinalReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        report={generatedReport}
      />
      
      {/* Pulse Change Confirmation Modal */}
      {hasPendingPulseChange && pendingPulseChange && (
        <PulseChangeConfirmModal
          open={hasPendingPulseChange}
          changeRequest={pendingPulseChange}
          onConfirm={(updateProtocol) => confirmPulseChange(updateProtocol)}
          onCancel={cancelPulseChange}
        />
      )}
    </>
  );
}

export default ActiveSessionWidget;
