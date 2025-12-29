import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  UserPlus, 
  Calendar, 
  MessageCircle,
  Video,
  Clock,
  RotateCcw
} from 'lucide-react';

interface MobileSessionBarProps {
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  sessionDuration: number;
  selectedPatientName?: string | null;
  isZoomWarning?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onReset: () => void;
  onQuickPatient: () => void;
  onQuickAppointment: () => void;
  onZoomInvite: () => void;
  zoomTimeRemaining: string;
}

export function MobileSessionBar({
  sessionStatus,
  sessionDuration,
  selectedPatientName,
  isZoomWarning,
  onStart,
  onPause,
  onResume,
  onEnd,
  onReset,
  onQuickPatient,
  onQuickAppointment,
  onZoomInvite,
  zoomTimeRemaining,
}: MobileSessionBarProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom">
      {/* Session Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            sessionStatus === 'running' ? 'bg-green-500 animate-pulse' : 
            sessionStatus === 'paused' ? 'bg-amber-500' : 'bg-muted'
          }`} />
          <span className="text-sm font-medium">
            {selectedPatientName || 'No patient'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-mono font-bold ${
            sessionStatus === 'running' ? 'text-jade' : 'text-muted-foreground'
          }`}>
            {formatDuration(sessionDuration)}
          </span>
          {sessionStatus !== 'idle' && sessionStatus !== 'ended' && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              isZoomWarning ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-3 w-3 inline mr-1" />
              {zoomTimeRemaining}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-2 py-3 gap-1">
        {/* Session Control */}
        {sessionStatus === 'idle' || sessionStatus === 'ended' ? (
          <Button
            onClick={onStart}
            size="lg"
            className="flex-1 h-12 gap-2 bg-jade hover:bg-jade/90 text-white touch-manipulation active:scale-95"
          >
            <Play className="h-5 w-5" />
            Start
          </Button>
        ) : sessionStatus === 'running' ? (
          <>
            <Button
              onClick={onPause}
              variant="outline"
              size="lg"
              className="flex-1 h-12 gap-2 touch-manipulation active:scale-95"
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>
            <Button
              onClick={onEnd}
              variant="destructive"
              size="lg"
              className="flex-1 h-12 gap-2 touch-manipulation active:scale-95"
            >
              <Square className="h-5 w-5" />
              End
            </Button>
          </>
        ) : sessionStatus === 'paused' ? (
          <>
            <Button
              onClick={onResume}
              size="lg"
              className="flex-1 h-12 gap-2 bg-jade hover:bg-jade/90 touch-manipulation active:scale-95"
            >
              <Play className="h-5 w-5" />
              Resume
            </Button>
            <Button
              onClick={onEnd}
              variant="destructive"
              size="lg"
              className="flex-1 h-12 gap-2 touch-manipulation active:scale-95"
            >
              <Square className="h-5 w-5" />
              End
            </Button>
          </>
        ) : null}

        {/* Quick Actions - Show when session is idle */}
        {(sessionStatus === 'idle' || sessionStatus === 'ended') && (
          <>
            <Button
              onClick={onQuickPatient}
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation active:scale-95"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <Button
              onClick={onQuickAppointment}
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation active:scale-95"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              onClick={onZoomInvite}
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation active:scale-95"
            >
              <Video className="h-5 w-5 text-blue-600" />
            </Button>
          </>
        )}

        {/* Reset button - only when session is running or paused */}
        {(sessionStatus === 'running' || sessionStatus === 'paused') && (
          <Button
            onClick={onReset}
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 touch-manipulation active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
