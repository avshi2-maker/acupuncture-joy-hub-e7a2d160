import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Zap, Shield, AlertTriangle, Gauge, Database, 
  BookCheck, ExternalLink, Eye, Volume2, VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTurboDashboardAudio } from '@/hooks/useTurboDashboardAudio';

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
}

export function TcmTurboDashboard({
  status,
  meta,
  isProcessing = false,
  variant = 'standard',
  className,
  enableAudio = true
}: TcmTurboDashboardProps) {
  const [displayTokens, setDisplayTokens] = useState(0);
  const [rpmProgress, setRpmProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(enableAudio);
  const animationRef = useRef<number | null>(null);
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
        // Play engine revving after a short delay
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
      // Start token counting animation
      tokenIntervalRef.current = setInterval(() => {
        setDisplayTokens(prev => prev + Math.floor(Math.random() * 150));
      }, 100);

      // Animate RPM gauge
      const animateRpm = () => {
        setRpmProgress(prev => {
          const next = prev + Math.random() * 15;
          return next > 95 ? 90 : next;
        });
        animationRef.current = requestAnimationFrame(animateRpm);
      };
      animationRef.current = requestAnimationFrame(animateRpm);

    } else {
      // Stop animations and set final values
      if (tokenIntervalRef.current) {
        clearInterval(tokenIntervalRef.current);
        tokenIntervalRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Set final values from meta
      if (meta?.tokensUsed !== undefined) {
        setDisplayTokens(meta.tokensUsed);
      }
      if (meta?.scorePercent !== undefined) {
        setRpmProgress(meta.scorePercent);
      } else if (meta?.hybridScore) {
        setRpmProgress(meta.hybridScore.combinedScore * 100);
      } else if (status === 'locked') {
        setRpmProgress(100);
      } else if (status === 'external' || status === 'fail') {
        setRpmProgress(0);
      }
    }

    return () => {
      if (tokenIntervalRef.current) clearInterval(tokenIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isProcessing, meta, status]);

  // Reset on standby
  useEffect(() => {
    if (status === 'standby') {
      setDisplayTokens(0);
      setRpmProgress(0);
    }
  }, [status]);

  const statusConfig = {
    standby: {
      label: 'STANDBY',
      labelHe: 'המתנה',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/30',
      lightColor: 'bg-slate-400',
      pulse: false
    },
    scanning: {
      label: 'SCANNING BIBLES...',
      labelHe: 'סורק מאגר...',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50',
      lightColor: 'bg-amber-400',
      pulse: true
    },
    locked: {
      label: 'SOURCE LOCKED: 100%',
      labelHe: 'מקור מאומת: 100%',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      lightColor: 'bg-green-500',
      pulse: false
    },
    external: {
      label: 'EXTERNAL DATA',
      labelHe: 'מידע חיצוני',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
      lightColor: 'bg-purple-500',
      pulse: false
    },
    fail: {
      label: 'NO KB MATCH',
      labelHe: 'אין התאמה',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      lightColor: 'bg-red-500',
      pulse: false
    }
  };

  const config = statusConfig[status];

  // RPM Gauge color based on progress
  const getRpmColor = () => {
    if (rpmProgress < 30) return 'from-red-500 to-red-600';
    if (rpmProgress < 60) return 'from-amber-500 to-amber-600';
    if (rpmProgress < 80) return 'from-emerald-500 to-emerald-600';
    return 'from-green-400 to-green-600';
  };

  const isCompact = variant === 'compact';
  const isVideo = variant === 'video';

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "rounded-xl border backdrop-blur-sm transition-all duration-300",
          isVideo 
            ? "bg-black/80 border-slate-700/50" 
            : "bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/30",
          isCompact ? "p-2" : "p-3",
          className
        )}
      >
        <div className={cn(
          "flex gap-3",
          isCompact ? "flex-row items-center" : "flex-col sm:flex-row sm:items-center"
        )}>
          {/* RPM Gauge - Search Depth */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex flex-col",
                isCompact ? "min-w-[80px]" : "min-w-[100px]"
              )}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Gauge className={cn("text-slate-400", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                  <span className={cn(
                    "font-medium text-slate-400 uppercase tracking-wider",
                    isCompact ? "text-[8px]" : "text-[9px]"
                  )}>
                    Search Depth
                  </span>
                </div>
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <motion.div
                    className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", getRpmColor())}
                    initial={{ width: 0 }}
                    animate={{ width: `${rpmProgress}%` }}
                    transition={{ 
                      duration: isProcessing ? 0.1 : 0.5,
                      ease: "easeOut"
                    }}
                  />
                  {/* Tick marks */}
                  <div className="absolute inset-0 flex justify-between px-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="w-px h-full bg-slate-600/30" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-slate-500">0</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    rpmProgress >= 78 ? "text-green-400" : "text-slate-300"
                  )}>
                    {rpmProgress.toFixed(0)}%
                  </span>
                  <span className="text-[8px] text-slate-500">100</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border-slate-700">
              <p className="text-xs">Vector similarity score - measures how well the query matches knowledge base content</p>
            </TooltipContent>
          </Tooltip>

          {/* Token Counter */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-slate-700/50",
                isCompact ? "px-2 py-1 min-w-[60px]" : "px-3 py-2 min-w-[80px]",
                "bg-slate-800/50"
              )}>
                <div className="flex items-center gap-1 mb-0.5">
                  <Zap className={cn("text-amber-400", isCompact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                  <span className={cn(
                    "font-medium text-slate-400 uppercase tracking-wider",
                    isCompact ? "text-[7px]" : "text-[8px]"
                  )}>
                    Tokens
                  </span>
                </div>
                <motion.span 
                  className={cn(
                    "font-mono font-bold text-amber-400",
                    isCompact ? "text-sm" : "text-lg"
                  )}
                  key={displayTokens}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {displayTokens.toString().padStart(4, '0')}
                </motion.span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border-slate-700">
              <p className="text-xs">Total tokens consumed for this query (input + output)</p>
            </TooltipContent>
          </Tooltip>

          {/* Truth Indicator Light */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 rounded-lg border transition-all duration-500",
                config.bgColor,
                config.borderColor,
                isCompact ? "px-2 py-1.5" : "px-3 py-2"
              )}>
                {/* LED Light */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      "rounded-full",
                      config.lightColor,
                      isCompact ? "w-3 h-3" : "w-4 h-4"
                    )}
                    animate={config.pulse ? {
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: config.pulse ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Glow effect */}
                  <AnimatePresence>
                    {status === 'locked' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.5, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full bg-green-400 blur-md"
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Status Text */}
                <div className="flex flex-col">
                  <span className={cn(
                    "font-bold uppercase tracking-wide",
                    config.color,
                    isCompact ? "text-[9px]" : "text-[10px]"
                  )}>
                    {config.label}
                  </span>
                  {meta?.chunksFound !== undefined && status !== 'standby' && !isCompact && (
                    <span className="text-[8px] text-slate-500">
                      {meta.chunksFound} chunks • {meta.documentsSearched || 0} docs
                    </span>
                  )}
                </div>

                {/* Icon */}
                {status === 'locked' && <Shield className="w-4 h-4 text-green-400 ml-1" />}
                {status === 'external' && <ExternalLink className="w-4 h-4 text-purple-400 ml-1" />}
                {status === 'fail' && <AlertTriangle className="w-4 h-4 text-red-400 ml-1" />}
                {status === 'scanning' && <Activity className="w-4 h-4 text-amber-400 ml-1 animate-pulse" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border-slate-700 max-w-[250px]">
              <div className="space-y-1">
                <p className="text-xs font-medium">Truth Verification Status</p>
                <p className="text-[10px] text-slate-400">
                  {status === 'locked' && "✅ Answer sourced 100% from verified TCM knowledge base"}
                  {status === 'external' && "⚠️ Answer includes external AI interpretation"}
                  {status === 'fail' && "❌ No matching content found in knowledge base"}
                  {status === 'scanning' && "🔍 Searching knowledge base..."}
                  {status === 'standby' && "⏸️ Ready to process queries"}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Audit Badge (if logged) */}
          {meta?.auditLogId && !isCompact && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30">
                  <BookCheck className="w-3 h-3 text-blue-400" />
                  <span className="text-[9px] text-blue-400 font-medium">LOGGED</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-900 border-slate-700">
                <p className="text-xs">Query logged to audit trail: {meta.auditLogId.slice(0, 8)}...</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Audio Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(
                  "flex items-center justify-center rounded-md border transition-all duration-200",
                  isCompact ? "w-6 h-6" : "w-7 h-7",
                  audioEnabled 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                    : "bg-slate-500/10 border-slate-500/30 text-slate-500 hover:bg-slate-500/20"
                )}
              >
                {audioEnabled ? (
                  <Volume2 className={cn(isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                ) : (
                  <VolumeX className={cn(isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-900 border-slate-700">
              <p className="text-xs">{audioEnabled ? 'Mute audio feedback' : 'Enable audio feedback'}</p>
            </TooltipContent>
          </Tooltip>
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
    
    if (result.success && result.isVerified) {
      setStatus('locked');
    } else if (result.isExternal) {
      setStatus('external');
    } else {
      setStatus('fail');
    }

    setMeta({
      tokensUsed: result.tokensUsed,
      verified: result.isVerified,
      scorePercent: result.scorePercent,
      chunksFound: result.chunksFound,
      documentsSearched: result.documentsSearched,
      isExternal: result.isExternal,
      auditLogId: result.auditLogId
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
    reset
  };
}
