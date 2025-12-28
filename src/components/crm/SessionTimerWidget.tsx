import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  BellOff,
  ChevronUp,
  ChevronDown,
  Timer,
  AlertTriangle,
  CheckCircle2,
  User,
  Plus,
  Settings,
  X,
  Check,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSessionTimer } from '@/contexts/SessionTimerContext';

interface SessionTimerWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const PRESET_DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '40 min', value: 40 },
  { label: '45 min', value: 45 },
  { label: '50 min', value: 50 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
];

export function SessionTimerWidget({ 
  className,
  position = 'bottom-right' 
}: SessionTimerWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [newPreset, setNewPreset] = useState('');
  
  const {
    status,
    remainingSeconds,
    totalSeconds,
    selectedDuration,
    soundEnabled,
    isExpanded,
    sessionInfo,
    currentTime,
    extensionPresets,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    extendTimer,
    setSelectedDuration,
    setSoundEnabled,
    setIsExpanded,
    setExtensionPresets,
    resetSettingsToDefaults,
    getProgress,
    formatTime,
  } = useSessionTimer();

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500 animate-pulse';
      case 'ended': return 'bg-red-500 animate-pulse';
      case 'paused': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'warning': return 'bg-amber-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-jade-500';
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };

  const handleStart = () => {
    startTimer(selectedDuration);
  };

  const handleAddPreset = () => {
    const value = parseInt(newPreset);
    if (value > 0 && value <= 60 && !extensionPresets.includes(value)) {
      const updated = [...extensionPresets, value].sort((a, b) => a - b);
      setExtensionPresets(updated);
      setNewPreset('');
    }
  };

  const handleRemovePreset = (preset: number) => {
    if (extensionPresets.length > 1) {
      setExtensionPresets(extensionPresets.filter(p => p !== preset));
    }
  };

  return (
    <div 
      className={cn(
        "fixed z-20 transition-all duration-300",
        positionClasses[position],
        className
      )}
    >
      <div 
        className={cn(
          "rounded-2xl shadow-xl border overflow-hidden",
          "bg-card/95 backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          status === 'warning' && "ring-2 ring-amber-500 ring-offset-2",
          status === 'ended' && "ring-2 ring-red-500 ring-offset-2 animate-shake"
        )}
      >
        {/* Compact Header - Always visible */}
        <div 
          className={cn(
            "flex items-center gap-3 px-4 py-3 cursor-pointer",
            "hover:bg-muted/50 transition-colors"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Status indicator */}
          <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
          
          {/* Real-time clock */}
          <div className="flex items-center gap-2 text-sm font-mono">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{formatCurrentTime(currentTime)}</span>
          </div>

          {/* Timer display when running */}
          {status !== 'idle' && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className={cn(
                "flex items-center gap-2 font-mono text-lg font-bold",
                status === 'warning' && "text-amber-600 dark:text-amber-400",
                status === 'ended' && "text-red-600 dark:text-red-400 animate-pulse"
              )}>
                <Timer className="h-4 w-4" />
                {formatTime(remainingSeconds)}
              </div>
            </>
          )}

          {/* Patient name if available */}
          {sessionInfo?.patientName && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="max-w-[80px] truncate">{sessionInfo.patientName}</span>
              </div>
            </>
          )}

          {/* Expand/collapse button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t">
            {/* Session info */}
            {sessionInfo?.patientName && (
              <div className="pt-3 flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-jade" />
                <span className="font-medium">{sessionInfo.patientName}</span>
                {sessionInfo.appointmentTitle && (
                  <span className="text-muted-foreground">• {sessionInfo.appointmentTitle}</span>
                )}
              </div>
            )}

            {/* Progress bar */}
            {status !== 'idle' && (
              <div className="pt-3">
                <Progress 
                  value={getProgress()} 
                  className={cn("h-2", getProgressColor())}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Elapsed: {formatTime(totalSeconds - remainingSeconds)}</span>
                  <span>Remaining: {formatTime(remainingSeconds)}</span>
                </div>
              </div>
            )}

            {/* Duration selector - only when idle */}
            {status === 'idle' && (
              <div className="pt-3 space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Set Session Duration
                </label>
                <Select 
                  value={selectedDuration.toString()} 
                  onValueChange={(v) => setSelectedDuration(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_DURATIONS.map(d => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status badges */}
            {status !== 'idle' && (
              <div className="flex items-center gap-2 pt-2">
                {status === 'running' && (
                  <Badge variant="default" className="bg-emerald-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Running
                  </Badge>
                )}
                {status === 'paused' && (
                  <Badge variant="secondary">
                    <Pause className="h-3 w-3 mr-1" /> Paused
                  </Badge>
                )}
                {status === 'warning' && (
                  <Badge variant="default" className="bg-amber-500 animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" /> 5 min warning!
                  </Badge>
                )}
                {status === 'ended' && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Bell className="h-3 w-3 mr-1" /> Time's up!
                  </Badge>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              {status === 'idle' && (
                <Button onClick={handleStart} className="flex-1 bg-jade-600 hover:bg-jade-700">
                  <Play className="h-4 w-4 mr-2" /> Start Timer
                </Button>
              )}

              {(status === 'running' || status === 'warning') && (
                <Button onClick={pauseTimer} variant="outline" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </Button>
              )}

              {status === 'paused' && (
                <Button onClick={resumeTimer} className="flex-1 bg-jade-600 hover:bg-jade-700">
                  <Play className="h-4 w-4 mr-2" /> Resume
                </Button>
              )}

              {status !== 'idle' && (
                <Button onClick={resetTimer} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}

              {/* Sound toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(!soundEnabled && "text-muted-foreground")}
              >
                {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>

              {/* Settings toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className={cn(showSettings && "bg-muted")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Timer Settings
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Extension Presets (minutes)</label>
                  <div className="flex flex-wrap gap-1">
                    {extensionPresets.map((preset) => (
                      <Badge 
                        key={preset} 
                        variant="secondary" 
                        className="flex items-center gap-1 pr-1"
                      >
                        {preset} min
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-destructive/20 rounded-full"
                          onClick={() => handleRemovePreset(preset)}
                          disabled={extensionPresets.length <= 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add preset (1-60)"
                      value={newPreset}
                      onChange={(e) => setNewPreset(e.target.value)}
                      className="h-8 text-sm"
                      min={1}
                      max={60}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddPreset}
                      disabled={!newPreset || parseInt(newPreset) <= 0 || parseInt(newPreset) > 60}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={resetSettingsToDefaults}
                  >
                    <RotateCw className="h-3 w-3 mr-2" /> Reset to Defaults
                  </Button>
                </div>
              </div>
            )}

            {/* Extend timer options - show when warning or ended */}
            {(status === 'warning' || status === 'ended') && (
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Need more time?
                </p>
                <div className="flex gap-2 flex-wrap">
                  {extensionPresets.map((minutes) => (
                    <Button 
                      key={minutes}
                      onClick={() => extendTimer(minutes)} 
                      variant="outline" 
                      size="sm"
                    >
                      +{minutes} min
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* End session message */}
            {status === 'ended' && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium text-center">
                  🔔 Please wrap up and end your session
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
