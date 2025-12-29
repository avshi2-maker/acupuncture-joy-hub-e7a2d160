import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  UserPlus, 
  Calendar, 
  Video,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useLongPressTimer } from '@/hooks/useLongPressTimer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  onLongPressTimer?: (position: { x: number; y: number }) => void;
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
  onLongPressTimer,
}: MobileSessionBarProps) {
  const haptic = useHapticFeedback();

  // Long press on timer
  const longPressTimer = useLongPressTimer({
    onLongPress: (position) => {
      if (onLongPressTimer) {
        onLongPressTimer(position);
      }
    },
    delay: 600,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Swipe handlers with haptic feedback
  const handleSwipeRight = () => {
    if (sessionStatus === 'idle' || sessionStatus === 'ended') {
      haptic.success();
      onStart();
      toast.success('🎬 Session started', { duration: 2000 });
    } else if (sessionStatus === 'paused') {
      haptic.medium();
      onResume();
      toast.info('▶️ Session resumed', { duration: 2000 });
    }
  };

  const handleSwipeLeft = () => {
    if (sessionStatus === 'running') {
      haptic.medium();
      onPause();
      toast.info('⏸️ Session paused', { duration: 2000 });
    } else if (sessionStatus === 'paused') {
      haptic.warning();
      onEnd();
      toast.success('✅ Session ended', { duration: 2000 });
    }
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
  }, { threshold: 60 });

  // Wrap button handlers with haptic
  const handleStart = () => {
    haptic.success();
    onStart();
  };

  const handlePause = () => {
    haptic.medium();
    onPause();
  };

  const handleResume = () => {
    haptic.medium();
    onResume();
  };

  const handleEnd = () => {
    haptic.heavy();
    onEnd();
  };

  const handleReset = () => {
    haptic.warning();
    onReset();
  };

  const handleQuickPatient = () => {
    haptic.light();
    onQuickPatient();
  };

  const handleQuickAppointment = () => {
    haptic.light();
    onQuickAppointment();
  };

  const handleZoomInvite = () => {
    haptic.light();
    onZoomInvite();
  };

  // Get swipe hint text
  const getSwipeHint = () => {
    if (sessionStatus === 'idle' || sessionStatus === 'ended') {
      return 'Swipe → to start';
    } else if (sessionStatus === 'running') {
      return 'Swipe ← to pause';
    } else if (sessionStatus === 'paused') {
      return '← End | Resume →';
    }
    return null;
  };

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom"
      {...swipeHandlers}
    >
      {/* Session Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            sessionStatus === 'running' ? 'bg-green-500 animate-pulse' : 
            sessionStatus === 'paused' ? 'bg-amber-500' : 'bg-muted'
          }`} />
          <span className="text-sm font-medium truncate max-w-[120px]">
            {selectedPatientName || 'No patient'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Swipe hint */}
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />
            {getSwipeHint()}
            <ChevronRight className="h-3 w-3" />
          </span>
          <span 
            className={cn(
              "text-lg font-mono font-bold cursor-pointer select-none transition-transform",
              sessionStatus === 'running' ? 'text-jade' : 'text-muted-foreground',
              longPressTimer.isPressing && "scale-95"
            )}
            {...longPressTimer.handlers}
            title="Long press for quick actions"
          >
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
            onClick={handleStart}
            size="lg"
            className="flex-1 h-12 gap-2 bg-jade hover:bg-jade/90 text-white touch-manipulation active:scale-95"
          >
            <Play className="h-5 w-5" />
            Start
          </Button>
        ) : sessionStatus === 'running' ? (
          <>
            <Button
              onClick={handlePause}
              variant="outline"
              size="lg"
              className="flex-1 h-12 gap-2 touch-manipulation active:scale-95"
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>
            <Button
              onClick={handleEnd}
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
              onClick={handleResume}
              size="lg"
              className="flex-1 h-12 gap-2 bg-jade hover:bg-jade/90 touch-manipulation active:scale-95"
            >
              <Play className="h-5 w-5" />
              Resume
            </Button>
            <Button
              onClick={handleEnd}
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
              onClick={handleQuickPatient}
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation active:scale-95"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleQuickAppointment}
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation active:scale-95"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleZoomInvite}
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
            onClick={handleReset}
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
