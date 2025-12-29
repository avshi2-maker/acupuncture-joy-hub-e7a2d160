import { useState, useCallback, useEffect, useRef } from 'react';
import { Clock, Timer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

interface SessionPresetsProps {
  sessionDuration: number;
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  onPresetSelect: (minutes: number) => void;
}

const PRESETS = [
  { minutes: 30, label: '30m', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { minutes: 45, label: '45m', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { minutes: 60, label: '60m', color: 'bg-sky-100 text-sky-700 border-sky-200' },
];

export function SessionPresets({ 
  sessionDuration, 
  sessionStatus,
  onPresetSelect 
}: SessionPresetsProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [alertsTriggered, setAlertsTriggered] = useState<Set<string>>(new Set());
  const haptic = useHapticFeedback();
  const audioContextRef = useRef<AudioContext | null>(null);

  const handlePresetSelect = useCallback((minutes: number) => {
    setSelectedPreset(minutes);
    setAlertsTriggered(new Set());
    onPresetSelect(minutes);
    haptic.medium();
    toast.success(`Session preset: ${minutes} minutes`, { duration: 2000 });
  }, [onPresetSelect, haptic]);

  const playAlert = useCallback((type: 'warning' | 'final') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      const frequencies = type === 'warning' ? [523, 659] : [659, 784, 880];
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.3);
      });
    } catch (err) {
      console.error('Error playing alert:', err);
    }
  }, []);

  // Track session duration and trigger alerts
  useEffect(() => {
    if (!selectedPreset || sessionStatus !== 'running') return;

    const presetSeconds = selectedPreset * 60;
    const warningTime = presetSeconds - 5 * 60; // 5 min before end
    const finalTime = presetSeconds - 1 * 60; // 1 min before end
    const endTime = presetSeconds;

    // 5 minute warning
    if (sessionDuration >= warningTime && sessionDuration < warningTime + 2 && !alertsTriggered.has('warning')) {
      setAlertsTriggered(prev => new Set([...prev, 'warning']));
      haptic.warning();
      playAlert('warning');
      toast.warning(`⏰ 5 minutes remaining!`, { duration: 5000 });
    }

    // 1 minute warning
    if (sessionDuration >= finalTime && sessionDuration < finalTime + 2 && !alertsTriggered.has('final')) {
      setAlertsTriggered(prev => new Set([...prev, 'final']));
      haptic.heavy();
      playAlert('final');
      toast.warning(`⏰ 1 minute remaining!`, { 
        duration: 5000,
        icon: '🔔'
      });
    }

    // Session end
    if (sessionDuration >= endTime && !alertsTriggered.has('end')) {
      setAlertsTriggered(prev => new Set([...prev, 'end']));
      haptic.heavy();
      haptic.heavy();
      playAlert('final');
      toast.error(`⏰ Session time complete!`, { 
        duration: 10000,
        icon: '⏱️'
      });
    }
  }, [sessionDuration, sessionStatus, selectedPreset, alertsTriggered, haptic, playAlert]);

  // Reset alerts when session resets
  useEffect(() => {
    if (sessionStatus === 'idle') {
      setAlertsTriggered(new Set());
    }
  }, [sessionStatus]);

  const getProgress = () => {
    if (!selectedPreset) return 0;
    return Math.min((sessionDuration / (selectedPreset * 60)) * 100, 100);
  };

  const getRemainingTime = () => {
    if (!selectedPreset) return null;
    const remaining = selectedPreset * 60 - sessionDuration;
    if (remaining <= 0) return '0:00';
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOvertime = selectedPreset && sessionDuration > selectedPreset * 60;

  return (
    <div className="flex flex-col gap-2">
      {/* Preset buttons */}
      <div className="flex items-center gap-1.5">
        <Timer className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Preset:</span>
        <div className="flex gap-1">
          {PRESETS.map((preset) => (
            <Button
              key={preset.minutes}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect(preset.minutes)}
              className={cn(
                'h-6 px-2 text-xs font-medium transition-all',
                selectedPreset === preset.minutes 
                  ? `${preset.color} ring-2 ring-offset-1` 
                  : 'hover:bg-muted'
              )}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Progress bar and remaining time */}
      {selectedPreset && sessionStatus !== 'idle' && (
        <div className="flex items-center gap-2">
          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-500',
                isOvertime 
                  ? 'bg-destructive animate-pulse' 
                  : getProgress() > 80 
                    ? 'bg-amber-500' 
                    : 'bg-jade'
              )}
              style={{ width: `${Math.min(getProgress(), 100)}%` }}
            />
          </div>
          
          {/* Remaining time */}
          <Badge 
            variant={isOvertime ? 'destructive' : 'secondary'}
            className={cn(
              'text-[10px] px-1.5 py-0 h-5 font-mono',
              isOvertime && 'animate-pulse'
            )}
          >
            {isOvertime ? (
              <span className="flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3" />
                +{Math.floor((sessionDuration - selectedPreset * 60) / 60)}m
              </span>
            ) : (
              getRemainingTime()
            )}
          </Badge>
        </div>
      )}
    </div>
  );
}
