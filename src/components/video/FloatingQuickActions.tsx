import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  UserPlus, 
  Calendar, 
  FileText, 
  MessageCircle,
  Mic,
  Heart,
  ClipboardList,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface FloatingQuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onReset: () => void;
  onQuickPatient: () => void;
  onQuickAppointment: () => void;
  onVoiceDictation: () => void;
  onAnxietyQA: () => void;
  onFollowUp: () => void;
  onSessionReport: () => void;
  anchorPosition?: { x: number; y: number };
}

const quickActions = [
  { id: 'patient', icon: UserPlus, label: 'מטופל', color: 'bg-blue-500' },
  { id: 'appointment', icon: Calendar, label: 'תור', color: 'bg-green-500' },
  { id: 'voice', icon: Mic, label: 'הקלטה', color: 'bg-amber-500' },
  { id: 'anxiety', icon: Heart, label: 'חרדה', color: 'bg-rose-500' },
  { id: 'followup', icon: ClipboardList, label: 'המשך', color: 'bg-teal-500' },
  { id: 'report', icon: FileText, label: 'דו"ח', color: 'bg-purple-500' },
];

export function FloatingQuickActions({
  isOpen,
  onClose,
  sessionStatus,
  onStart,
  onPause,
  onResume,
  onEnd,
  onReset,
  onQuickPatient,
  onQuickAppointment,
  onVoiceDictation,
  onAnxietyQA,
  onFollowUp,
  onSessionReport,
  anchorPosition,
}: FloatingQuickActionsProps) {
  const haptic = useHapticFeedback();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      haptic.medium();
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen, haptic]);

  if (!isOpen) return null;

  const handleAction = (actionId: string) => {
    haptic.light();
    switch (actionId) {
      case 'patient': onQuickPatient(); break;
      case 'appointment': onQuickAppointment(); break;
      case 'voice': onVoiceDictation(); break;
      case 'anxiety': onAnxietyQA(); break;
      case 'followup': onFollowUp(); break;
      case 'report': onSessionReport(); break;
    }
    onClose();
  };

  const handleSessionAction = (action: string) => {
    haptic.medium();
    switch (action) {
      case 'start': onStart(); break;
      case 'pause': onPause(); break;
      case 'resume': onResume(); break;
      case 'end': onEnd(); break;
      case 'reset': onReset(); break;
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Actions Menu */}
      <div 
        className={cn(
          "fixed z-50 bg-background rounded-2xl shadow-2xl border p-4 transition-all duration-300",
          animateIn ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
        style={{
          left: anchorPosition ? Math.min(anchorPosition.x - 120, window.innerWidth - 260) : '50%',
          top: anchorPosition ? Math.max(anchorPosition.y - 200, 20) : '50%',
          transform: anchorPosition ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Session Controls */}
        <div className="flex items-center justify-center gap-2 mb-3 pb-3 border-b">
          {sessionStatus === 'idle' && (
            <Button 
              onClick={() => handleSessionAction('start')} 
              size="sm" 
              className="bg-jade hover:bg-jade/90 gap-1 h-8"
            >
              <Play className="h-4 w-4" />
              התחל
            </Button>
          )}
          {sessionStatus === 'running' && (
            <>
              <Button 
                onClick={() => handleSessionAction('pause')} 
                size="sm" 
                variant="secondary" 
                className="gap-1 h-8"
              >
                <Pause className="h-4 w-4" />
                השהה
              </Button>
              <Button 
                onClick={() => handleSessionAction('end')} 
                size="sm" 
                variant="destructive" 
                className="gap-1 h-8"
              >
                <Square className="h-4 w-4" />
                סיים
              </Button>
            </>
          )}
          {sessionStatus === 'paused' && (
            <>
              <Button 
                onClick={() => handleSessionAction('resume')} 
                size="sm" 
                className="bg-jade hover:bg-jade/90 gap-1 h-8"
              >
                <Play className="h-4 w-4" />
                המשך
              </Button>
              <Button 
                onClick={() => handleSessionAction('end')} 
                size="sm" 
                variant="destructive" 
                className="gap-1 h-8"
              >
                <Square className="h-4 w-4" />
                סיים
              </Button>
            </>
          )}
          {sessionStatus === 'ended' && (
            <Button 
              onClick={() => handleSessionAction('reset')} 
              size="sm" 
              className="bg-jade hover:bg-jade/90 gap-1 h-8"
            >
              <RotateCcw className="h-4 w-4" />
              חדש
            </Button>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                "hover:scale-105 active:scale-95",
                animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className={cn("p-2 rounded-full text-white", action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
