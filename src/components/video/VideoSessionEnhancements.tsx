import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Activity, 
  Zap, 
  Clock, 
  Timer,
  Volume2, 
  VolumeX, 
  History,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VIDEO_SESSION_AUDIO_KEY = 'video-session-audio-enabled';
const VIDEO_SESSION_USAGE_KEY = 'video-session-ai-usage';

interface UsageEntry {
  type: string;
  query: string;
  timestamp: string;
}

// Audio feedback utilities
export const playSessionSound = (type: 'click' | 'success' | 'warning' | 'error' | 'start' | 'stop' | 'pause' | 'resume' | 'end' | 'reset', enabled?: boolean) => {
  // If enabled is false, don't play. If undefined, assume enabled.
  if (enabled === false) return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      case 'success':
        oscillator.frequency.value = 523.25;
        gainNode.gain.value = 0.15;
        oscillator.start();
        setTimeout(() => { oscillator.frequency.value = 659.25; }, 100);
        setTimeout(() => { oscillator.frequency.value = 783.99; }, 200);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'warning':
      case 'pause':
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.12;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'error':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'start':
      case 'resume':
        // Ascending tone for session start/resume
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.12;
        oscillator.start();
        setTimeout(() => { oscillator.frequency.value = 554.37; }, 150);
        setTimeout(() => { oscillator.frequency.value = 659.25; }, 300);
        oscillator.stop(ctx.currentTime + 0.45);
        break;
      case 'stop':
      case 'end':
        // Descending tone for session stop/end
        oscillator.frequency.value = 659.25;
        gainNode.gain.value = 0.12;
        oscillator.start();
        setTimeout(() => { oscillator.frequency.value = 554.37; }, 150);
        setTimeout(() => { oscillator.frequency.value = 440; }, 300);
        oscillator.stop(ctx.currentTime + 0.45);
        break;
      case 'reset':
        // Quick double beep for reset
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
        // Second beep after short pause
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 600;
        gain2.gain.value = 0.1;
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.25);
        break;
    }
  } catch (e) {
    console.debug('Audio not available:', e);
  }
};

export const triggerSessionHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'start' | 'pause' | 'resume' | 'end' | 'reset') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [10, 50, 10],
        error: [50, 100, 50, 100, 50],
        start: [50, 100, 50], // Double pulse for session start
        pause: [30, 50, 30], // Short pulses for pause
        resume: [20, 30, 20, 30], // Quick pulses for resume
        end: [100, 50, 100], // Strong double pulse for end
        reset: [15, 30, 15, 30, 15], // Triple light pulse for reset
      };
      navigator.vibrate(patterns[type]);
    } catch (e) {
      console.debug('Haptic not available:', e);
    }
  }
};

// Usage tracking
export const getVideoSessionUsage = (): UsageEntry[] => {
  try {
    const stored = localStorage.getItem(VIDEO_SESSION_USAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addVideoSessionUsage = (type: string, query: string) => {
  try {
    const history = getVideoSessionUsage();
    history.unshift({
      type,
      query: query.substring(0, 80),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(VIDEO_SESSION_USAGE_KEY, JSON.stringify(history.slice(0, 100)));
  } catch {}
};

export const clearVideoSessionUsage = () => {
  try {
    localStorage.removeItem(VIDEO_SESSION_USAGE_KEY);
  } catch {}
};

// Audio settings hook
export const useVideoSessionAudio = () => {
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(VIDEO_SESSION_AUDIO_KEY);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIDEO_SESSION_AUDIO_KEY, String(enabled));
    } catch {}
  }, [enabled]);

  return { enabled, setEnabled };
};

// Video Session API Meter
interface VideoSessionAPIStats {
  sessionCalls: number;
  todayCalls: number;
  perMinuteRate: number;
  lastCallAt: string | null;
  isLive: boolean;
}

const SESSION_START = new Date().toISOString();

export function VideoSessionAPIMeter() {
  const [stats, setStats] = useState<VideoSessionAPIStats | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const { enabled: audioEnabled, setEnabled: setAudioEnabled } = useVideoSessionAudio();
  const [usageHistory, setUsageHistory] = useState<UsageEntry[]>([]);

  useEffect(() => {
    fetchStats();
    setUsageHistory(getVideoSessionUsage());
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();

      const { data: allLogs } = await supabase
        .from('rag_query_logs')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (allLogs) {
        const sessionCalls = allLogs.filter(l => l.created_at >= SESSION_START).length;
        const todayCalls = allLogs.filter(l => l.created_at >= todayStart).length;
        const recentCalls = allLogs.filter(l => l.created_at >= oneMinuteAgo).length;
        const lastCall = allLogs[0]?.created_at || null;
        const isCurrentlyActive = lastCall 
          ? (new Date().getTime() - new Date(lastCall).getTime()) < 10000 
          : false;

        const newStats = {
          sessionCalls,
          todayCalls,
          perMinuteRate: recentCalls,
          lastCallAt: lastCall,
          isLive: isCurrentlyActive || recentCalls > 0,
        };

        if (stats && newStats.todayCalls > stats.todayCalls) {
          setPulseAnimation(true);
          setTimeout(() => setPulseAnimation(false), 1000);
        }

        setStats(newStats);
      }
    } catch (err) {
      console.error('Failed to fetch API stats:', err);
    }
  };

  const handleClearHistory = () => {
    clearVideoSessionUsage();
    setUsageHistory([]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('he-IL', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!stats) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-full animate-pulse">
        <Gauge className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Live Indicator */}
      <motion.div 
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] ${
          stats.isLive 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-muted/50 border-border'
        }`}
        animate={stats.isLive ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: stats.isLive ? Infinity : 0, duration: 1 }}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${
          stats.isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
        }`} />
        <span className={stats.isLive ? 'text-green-600 font-medium' : ''}>
          {stats.isLive ? 'LIVE' : 'IDLE'}
        </span>
      </motion.div>

      {/* Per Minute Rate */}
      <motion.div 
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] ${
          pulseAnimation ? 'bg-blue-500/20 border-blue-500/50' : 'bg-blue-500/10 border-blue-500/30'
        }`}
        animate={pulseAnimation ? { scale: [1, 1.1, 1] } : {}}
      >
        <Activity className="h-2.5 w-2.5 text-blue-600" />
        <span className="font-bold text-blue-600">{stats.perMinuteRate}/min</span>
      </motion.div>

      {/* Session Calls */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-jade/10 border border-jade/30 text-[9px]">
        <Zap className="h-2.5 w-2.5 text-jade" />
        <span className="font-bold text-jade">{stats.sessionCalls}</span>
      </div>

      {/* Today Calls */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px]">
        <TrendingUp className="h-2.5 w-2.5 text-amber-600" />
        <span className="font-bold text-amber-600">{stats.todayCalls}</span>
      </div>

      {/* Audio Toggle */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setAudioEnabled(!audioEnabled)}
        className="h-5 w-5 p-0"
        title={audioEnabled ? 'Disable audio' : 'Enable audio'}
      >
        {audioEnabled ? (
          <Volume2 className="h-3 w-3 text-green-500" />
        ) : (
          <VolumeX className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>

      {/* Usage History */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 gap-0.5"
          >
            <History className="h-3 w-3" />
            <span className="text-[9px]">{usageHistory.length}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="end">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold">AI Usage History</h4>
            {usageHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="h-5 text-[10px] text-destructive"
              >
                Clear
              </Button>
            )}
          </div>
          
          {usageHistory.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-3 text-center">
              No AI usage recorded yet
            </p>
          ) : (
            <ScrollArea className="h-40">
              <div className="space-y-1.5">
                {usageHistory.slice(0, 20).map((entry, idx) => (
                  <div 
                    key={idx} 
                    className="p-1.5 rounded bg-muted/50 text-[10px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[8px] h-4">
                        {entry.type}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate">
                      {entry.query}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>

      {/* Last Call Time */}
      {stats.lastCallAt && (
        <Badge variant="outline" className="text-[8px] font-mono bg-muted/30 h-5">
          <Clock className="h-2 w-2 mr-0.5" />
          {new Date(stats.lastCallAt).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </Badge>
      )}
    </div>
  );
}

// Engine Activity Indicator for Video Session
export function VideoSessionEngineIndicator({ isLoading }: { isLoading: boolean }) {
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { enabled: audioEnabled } = useVideoSessionAudio();

  useEffect(() => {
    if (isLoading) {
      setCountdown(5000);
      playSessionSound('click', audioEnabled);
      triggerSessionHaptic('medium');
    } else if (countdown > 0) {
      playSessionSound('success', audioEnabled);
      triggerSessionHaptic('success');
      setCountdown(0);
    }
  }, [isLoading, audioEnabled]);

  useEffect(() => {
    if (isLoading && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(prev => Math.max(0, prev - 100));
      }, 100);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [isLoading, countdown]);

  return (
    <motion.div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
        isLoading 
          ? 'bg-green-500/10 border-green-500/50 shadow-md shadow-green-500/20' 
          : 'bg-muted/30 border-border'
      }`}
      animate={isLoading ? { 
        boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)']
      } : {}}
      transition={{ repeat: isLoading ? Infinity : 0, duration: 1 }}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={{ repeat: isLoading ? Infinity : 0, duration: 1, ease: 'linear' }}
      >
        <Timer className={`h-4 w-4 ${isLoading ? 'text-green-500' : 'text-muted-foreground'}`} />
      </motion.div>

      <div className="flex flex-col">
        <span className={`text-[10px] font-bold ${isLoading ? 'text-green-600' : 'text-muted-foreground'}`}>
          {isLoading ? 'AI PROCESSING' : 'AI READY'}
        </span>
        {isLoading && countdown > 0 && (
          <span className="text-[9px] text-green-500 font-mono">
            {(countdown / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {isLoading && (
        <div className="w-12 h-1 bg-green-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(countdown / 5000) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
}
