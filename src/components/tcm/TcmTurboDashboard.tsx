import { useState, useEffect, useRef } from 'react';
import { 
  Activity, Zap, Shield, AlertTriangle, Database, 
  BookCheck, ExternalLink, Volume2, VolumeX, Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useTurboDashboardAudio } from '@/hooks/useTurboDashboardAudio';
import { Switch } from '@/components/ui/switch';

export type SearchDepthMode = 'quick' | 'deep';

export interface TurboDashboardMeta {
  tokensUsed?: number;
  verified?: boolean;
  scorePercent?: number;
  chunksFound?: number;
  documentsSearched?: number;
  isExternal?: boolean;
  auditLogId?: string | null;
  hybridScore?: {
    combinedScore: number;
    threshold: number;
    meetsThreshold: boolean;
  };
}

export type TurboDashboardStatus = 'standby' | 'scanning' | 'locked' | 'external' | 'fail';

interface TcmTurboDashboardProps {
  status: TurboDashboardStatus;
  meta?: TurboDashboardMeta;
  isProcessing?: boolean;
  variant?: 'standard' | 'video' | 'compact';
  className?: string;
  enableAudio?: boolean;
  searchDepth?: SearchDepthMode;
  onSearchDepthChange?: (mode: SearchDepthMode) => void;
}

// Confidence Gauge Component - Radial Ring
function ConfidenceGauge({ score, size = 44 }: { score: number; size?: number }) {
  const percentage = Math.round(score);
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference * (1 - score / 100);
  
  const getColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-amber-500';
    if (percentage >= 30) return 'text-orange-500';
    return 'text-red-400';
  };

  const getBgColor = () => {
    if (percentage >= 80) return 'text-green-100';
    if (percentage >= 60) return 'text-amber-100';
    if (percentage >= 30) return 'text-orange-100';
    return 'text-red-100';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={getBgColor()}
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[11px] font-bold", getColor())}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export function TcmTurboDashboard({
  status,
  meta,
  isProcessing = false,
  variant = 'standard',
  className,
  enableAudio = false,
  searchDepth = 'deep',
  onSearchDepthChange
}: TcmTurboDashboardProps) {
  const [displayTokens, setDisplayTokens] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(enableAudio);
  const tokenIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatusRef = useRef<TurboDashboardStatus>(status);
  
  // Audio feedback hook
  const { 
    playEngineRevving, 
    playSourceLocked, 
    playExternalWarning, 
    playNoMatch,
    playScanStart 
  } = useTurboDashboardAudio({ enabled: audioEnabled });
  
  // Play audio based on status changes
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    
    if (prevStatus !== status) {
      if (status === 'scanning' && prevStatus === 'standby') {
        playScanStart();
        setTimeout(() => playEngineRevving(), 150);
      } else if (status === 'locked') {
        playSourceLocked();
      } else if (status === 'external') {
        playExternalWarning();
      } else if (status === 'fail') {
        playNoMatch();
      }
      
      prevStatusRef.current = status;
    }
  }, [status, playScanStart, playEngineRevving, playSourceLocked, playExternalWarning, playNoMatch]);

  // Animate tokens when processing
  useEffect(() => {
    if (isProcessing) {
      tokenIntervalRef.current = setInterval(() => {
        setDisplayTokens(prev => prev + Math.floor(Math.random() * 120));
      }, 250);
    } else {
      if (tokenIntervalRef.current) {
        clearInterval(tokenIntervalRef.current);
        tokenIntervalRef.current = null;
      }
      
      setDisplayTokens(meta?.tokensUsed ?? 0);

      if (meta?.scorePercent !== undefined) {
        setConfidenceScore(meta.scorePercent);
      } else if (meta?.hybridScore) {
        setConfidenceScore(meta.hybridScore.combinedScore * 100);
      } else if (status === 'locked') {
        setConfidenceScore(100);
      } else if (status === 'external' || status === 'fail') {
        setConfidenceScore(0);
      }
    }

    return () => {
      if (tokenIntervalRef.current) clearInterval(tokenIntervalRef.current);
    };
  }, [isProcessing, meta, status]);

  // Reset on standby
  useEffect(() => {
    if (status === 'standby') {
      setDisplayTokens(0);
      setConfidenceScore(0);
    }
  }, [status]);

  const statusConfig = {
    standby: {
      label: 'Ready',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
      dotColor: 'bg-slate-400',
      pulse: false
    },
    scanning: {
      label: 'Scanning...',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      dotColor: 'bg-amber-500',
      pulse: true
    },
    locked: {
      label: 'Verified',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      dotColor: 'bg-green-500',
      pulse: false
    },
    external: {
      label: 'External AI',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      dotColor: 'bg-violet-500',
      pulse: false
    },
    fail: {
      label: 'No Match',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
      pulse: false
    }
  };

  const config = statusConfig[status];
  const isCompact = variant === 'compact';

  return (
    <TooltipProvider>
      {/* CLINIC THEME: Light beige/white background */}
      <div 
        className={cn(
          "rounded-xl border backdrop-blur-sm transition-all duration-300",
          "bg-white/95 border-slate-200/60 shadow-sm",
          isCompact ? "px-3 py-2" : "px-4 py-3",
          className
        )}
      >
        <div className={cn(
          "flex items-center gap-3",
          isCompact ? "flex-row" : "flex-row flex-wrap"
        )}>
          {/* LEFT: Status Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300",
                config.bgColor,
                config.borderColor
              )}>
                {/* Pulsing Dot */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      config.dotColor,
                      config.pulse && "animate-pulse"
                    )}
                  />
                  {status === 'locked' && (
                    <div className="absolute inset-0 rounded-full bg-green-400 blur-sm opacity-50" />
                  )}
                </div>
                
                {/* Status Text */}
                <span className={cn(
                  "text-xs font-semibold",
                  config.color
                )}>
                  {config.label}
                </span>

                {/* Icon */}
                {status === 'locked' && <Shield className="w-3.5 h-3.5 text-green-500" />}
                {status === 'external' && <ExternalLink className="w-3.5 h-3.5 text-violet-500" />}
                {status === 'fail' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                {status === 'scanning' && <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[250px]">
              <div className="space-y-1">
                <p className="text-xs font-medium">Search Status</p>
                <p className="text-[10px] text-muted-foreground">
                  {status === 'locked' && "✅ Answer sourced from verified TCM knowledge base"}
                  {status === 'external' && "⚠️ Answer includes external AI interpretation"}
                  {status === 'fail' && "❌ No matching content found in knowledge base"}
                  {status === 'scanning' && "🔍 Searching knowledge base..."}
                  {status === 'standby' && "⏸️ Ready to process queries"}
                </p>
                {meta?.chunksFound !== undefined && status !== 'standby' && (
                  <p className="text-[10px] text-muted-foreground">
                    {meta.chunksFound} chunks • {meta.documentsSearched || 0} docs
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* CENTER METRICS: Speed + Tokens + Deep Toggle */}
          <div className="flex items-center gap-2">
            {/* Speed Badge */}
            <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              {isProcessing ? '...' : displayTokens > 0 ? `${Math.round(displayTokens / 10)}ms` : '—'}
            </Badge>

            {/* Token Badge */}
            <Badge variant="outline" className="text-xs font-medium bg-violet-50 text-violet-700 border-violet-200">
              <Coins className="w-3 h-3 mr-1" />
              {displayTokens > 0 ? displayTokens : '—'}
            </Badge>

            {/* Chunks Badge */}
            {meta?.chunksFound !== undefined && meta.chunksFound > 0 && (
              <Badge variant="outline" className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                <Database className="w-3 h-3 mr-1" />
                {meta.chunksFound}
              </Badge>
            )}
          </div>

          {/* Deep/Quick Toggle */}
          {onSearchDepthChange && !isCompact && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                  <span className={cn(
                    "text-xs font-medium",
                    searchDepth === 'deep' ? "text-jade" : "text-amber-600"
                  )}>
                    {searchDepth === 'deep' ? 'Deep' : 'Fast'}
                  </span>
                  <Switch
                    checked={searchDepth === 'deep'}
                    onCheckedChange={(checked) => onSearchDepthChange(checked ? 'deep' : 'quick')}
                    disabled={isProcessing}
                    className="data-[state=checked]:bg-jade h-4 w-7"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[220px]">
                <div className="space-y-1">
                  <p className="text-xs font-medium">Search Mode</p>
                  <p className="text-[10px] text-muted-foreground">
                    {searchDepth === 'deep' 
                      ? "🔬 Deep: More thorough, comprehensive answers"
                      : "⚡ Fast: Quick responses for simple queries"}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* RIGHT: Confidence Gauge */}
          {(status !== 'standby' || confidenceScore > 0) && (
            <Tooltip>
              <TooltipTrigger>
                <ConfidenceGauge score={confidenceScore} size={isCompact ? 36 : 44} />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Confidence: {confidenceScore.toFixed(0)}%</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Audio Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(
                  "flex items-center justify-center rounded-lg border transition-all duration-200",
                  isCompact ? "w-7 h-7" : "w-8 h-8",
                  audioEnabled 
                    ? "bg-jade/10 border-jade/30 text-jade hover:bg-jade/20" 
                    : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                )}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{audioEnabled ? 'Mute audio' : 'Enable audio'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Audit Badge (if logged) */}
          {meta?.auditLogId && !isCompact && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-200">
                  <BookCheck className="w-3 h-3 text-blue-500" />
                  <span className="text-[9px] text-blue-600 font-medium">Logged</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Query logged: {meta.auditLogId.slice(0, 8)}...</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// Helper hook to manage dashboard state
export function useTurboDashboard() {
  const [status, setStatus] = useState<TurboDashboardStatus>('standby');
  const [meta, setMeta] = useState<TurboDashboardMeta>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcessing = () => {
    setStatus('scanning');
    setIsProcessing(true);
    setMeta({});
  };

  const stopProcessing = (result: {
    success: boolean;
    isVerified: boolean;
    tokensUsed?: number;
    scorePercent?: number;
    chunksFound?: number;
    documentsSearched?: number;
    isExternal?: boolean;
    auditLogId?: string | null;
  }) => {
    setIsProcessing(false);
    
    if (result.isExternal) {
      setStatus('external');
    } else if (result.success && result.isVerified) {
      setStatus('locked');
    } else if (!result.success) {
      setStatus('fail');
    } else {
      setStatus('standby');
    }
    
    setMeta({
      tokensUsed: result.tokensUsed,
      scorePercent: result.scorePercent,
      chunksFound: result.chunksFound,
      documentsSearched: result.documentsSearched,
      isExternal: result.isExternal,
      auditLogId: result.auditLogId,
    });
  };

  const reset = () => {
    setStatus('standby');
    setMeta({});
    setIsProcessing(false);
  };

  return {
    status,
    meta,
    isProcessing,
    startProcessing,
    stopProcessing,
    reset,
    setStatus,
    setMeta,
  };
}
