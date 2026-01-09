import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Clock, Phone, Mail, AlertTriangle, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PatientBriefCompactProps {
  patientId?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitCount?: number;
  lastVisit?: string | null;
  chiefComplaint?: string | null;
  onViewHistory?: () => void;
  className?: string;
}

export function PatientBriefCompact({
  patientId,
  patientName,
  patientPhone,
  visitCount = 0,
  lastVisit,
  chiefComplaint,
  onViewHistory,
  className,
}: PatientBriefCompactProps) {
  const hasPatient = !!patientId && !!patientName;

  if (!hasPatient) {
    return (
      <Card className={cn("border-dashed border-muted-foreground/30", className)}>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <User className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            לא נבחר מטופל
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            בחר מטופל להתחלת פגישה
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      "bg-gradient-to-br from-jade/5 to-transparent",
      "border-jade/20",
      className
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Patient Name & Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-jade/20 flex items-center justify-center">
              <User className="h-5 w-5 text-jade" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{patientName}</h3>
              {patientPhone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {patientPhone}
                </p>
              )}
            </div>
          </div>
          
          {visitCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              ביקור #{visitCount}
            </Badge>
          )}
        </div>

        {/* Last Visit */}
        {lastVisit && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>ביקור אחרון: {lastVisit}</span>
          </div>
        )}

        {/* Chief Complaint */}
        {chiefComplaint && (
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-gold" />
              <span className="text-[10px] font-medium text-gold">תלונה עיקרית</span>
            </div>
            <p className="text-sm text-foreground/80 line-clamp-2">
              {chiefComplaint}
            </p>
          </div>
        )}

        {/* View History Button */}
        {onViewHistory && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-jade hover:bg-jade/10"
            onClick={onViewHistory}
          >
            <History className="h-3 w-3 mr-1" />
            צפה בהיסטוריה
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Session Timer Compact Component
interface SessionTimerCompactProps {
  duration: number;
  status: 'idle' | 'running' | 'paused' | 'ended';
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SessionTimerCompact({
  duration,
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  className,
}: SessionTimerCompactProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <Card className={cn(
      "overflow-hidden",
      isRunning && "border-jade/50 bg-jade/5",
      isPaused && "border-gold/50 bg-gold/5",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isRunning ? "bg-jade/20" : isPaused ? "bg-gold/20" : "bg-muted"
            )}>
              <Clock className={cn(
                "h-5 w-5",
                isRunning ? "text-jade" : isPaused ? "text-gold" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <motion.p
                className={cn(
                  "text-2xl font-mono font-bold",
                  isRunning ? "text-jade" : isPaused ? "text-gold" : "text-foreground"
                )}
                animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatDuration(duration)}
              </motion.p>
              <p className="text-[10px] text-muted-foreground">
                {isRunning ? '● פעיל' : isPaused ? '⏸ מושהה' : status === 'ended' ? '■ הסתיים' : 'מוכן'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {status === 'idle' && onStart && (
              <Button size="sm" className="bg-jade hover:bg-jade/90" onClick={onStart}>
                התחל
              </Button>
            )}
            {isRunning && onPause && (
              <Button size="sm" variant="outline" onClick={onPause}>
                השהה
              </Button>
            )}
            {isPaused && onResume && (
              <Button size="sm" className="bg-gold hover:bg-gold/90 text-foreground" onClick={onResume}>
                המשך
              </Button>
            )}
            {(isRunning || isPaused) && onReset && (
              <Button size="sm" variant="ghost" onClick={onReset}>
                אפס
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
