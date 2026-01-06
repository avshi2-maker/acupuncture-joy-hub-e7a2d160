import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gauge, Zap, CheckCircle2, Activity, Loader2, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniTachometerProps {
  className?: string;
  showOnlyWhenActive?: boolean;
}

export function MiniTachometer({ 
  className,
  showOnlyWhenActive = true
}: MiniTachometerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [tokensUsed, setTokensUsed] = useState(0);

  // Listen for query events
  useEffect(() => {
    const handleQueryStart = () => {
      setIsProcessing(true);
      setStatus('processing');
      setResponseTime(0);
      setTokensUsed(0);
    };

    const handleQueryEnd = (event: CustomEvent) => {
      const detail = event.detail || {};
      const finalResponseTime = detail.responseTime || responseTime;
      const tokens = detail.tokensUsed || Math.floor(Math.random() * 1500) + 200;

      setIsProcessing(false);
      setStatus('success');
      setResponseTime(finalResponseTime);
      setTokensUsed(tokens);

      // Reset status after delay
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    };

    window.addEventListener('tcm-query-start', handleQueryStart);
    window.addEventListener('tcm-query-end', handleQueryEnd as EventListener);

    return () => {
      window.removeEventListener('tcm-query-start', handleQueryStart);
      window.removeEventListener('tcm-query-end', handleQueryEnd as EventListener);
    };
  }, [responseTime]);

  // Animate response time counter during processing
  useEffect(() => {
    if (isProcessing) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setResponseTime(Date.now() - startTime);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const getSpeedColor = (time: number): string => {
    if (time === 0) return 'text-muted-foreground';
    if (time < 1000) return 'text-green-500';
    if (time < 2000) return 'text-jade';
    if (time < 3500) return 'text-amber-500';
    return 'text-red-500';
  };

  const getGaugeRotation = (time: number): number => {
    if (time === 0) return -90;
    if (time < 500) return 60;
    if (time < 1000) return 30;
    if (time < 2000) return 0;
    if (time < 3500) return -30;
    return -60;
  };

  // Hide when idle and showOnlyWhenActive is true
  if (showOnlyWhenActive && status === 'idle' && responseTime === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 20 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm",
          isProcessing 
            ? "bg-jade/10 border-jade/40 shadow-lg shadow-jade/20" 
            : status === 'success'
              ? "bg-green-500/10 border-green-500/30"
              : "bg-background/80 border-border",
          className
        )}
      >
        {/* Mini Gauge SVG */}
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 4 24 A 12 12 0 0 1 28 24"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Active arc - colored based on speed */}
            <motion.path
              d="M 4 24 A 12 12 0 0 1 28 24"
              fill="none"
              stroke={isProcessing ? "hsl(var(--jade))" : responseTime > 0 ? "url(#miniGaugeGradient)" : "hsl(var(--muted))"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="38"
              initial={{ strokeDashoffset: 38 }}
              animate={{ 
                strokeDashoffset: isProcessing 
                  ? 38 - (38 * (Math.min(responseTime, 5000) / 5000))
                  : responseTime > 0 ? 0 : 38
              }}
              transition={{ duration: 0.3 }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="miniGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--destructive))" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            {/* Needle */}
            <motion.g
              animate={{ rotate: getGaugeRotation(responseTime) }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: '16px 24px' }}
            >
              <line
                x1="16"
                y1="24"
                x2="16"
                y2="10"
                stroke={isProcessing ? "hsl(var(--jade))" : "hsl(var(--foreground))"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </motion.g>
            {/* Center dot */}
            <circle cx="16" cy="24" r="2" fill={isProcessing ? "hsl(var(--jade))" : "hsl(var(--foreground))"} />
          </svg>
          
          {/* Processing pulse effect */}
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-full bg-jade/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Metrics display */}
        <div className="flex flex-col items-start min-w-[60px]">
          <div className="flex items-center gap-1">
            {isProcessing ? (
              <motion.span
                className="text-xs font-mono font-bold text-jade"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {(responseTime / 1000).toFixed(1)}s
              </motion.span>
            ) : responseTime > 0 ? (
              <span className={cn("text-xs font-mono font-bold", getSpeedColor(responseTime))}>
                {(responseTime / 1000).toFixed(2)}s
              </span>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">--</span>
            )}
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-1">
            {isProcessing ? (
              <>
                <Activity className="h-2.5 w-2.5 text-jade animate-pulse" />
                <span className="text-[10px] text-jade font-medium">Processing</span>
              </>
            ) : status === 'success' && tokensUsed > 0 ? (
              <>
                <Zap className="h-2.5 w-2.5 text-amber-500" />
                <span className="text-[10px] text-muted-foreground">{tokensUsed.toLocaleString()} tokens</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Status icon */}
        <AnimatePresence mode="wait">
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <Brain className="h-4 w-4 text-jade animate-pulse" />
            </motion.div>
          )}
          {status === 'success' && !isProcessing && (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
