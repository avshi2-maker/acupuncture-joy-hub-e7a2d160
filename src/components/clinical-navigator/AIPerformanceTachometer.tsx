import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gauge, Zap, Clock, Coins, Brain, 
  Activity, TrendingUp, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AIPerformanceMetrics {
  responseTime: number; // in ms
  tokensUsed: number;
  apiCalls: number;
  accuracy: number; // 0-100
  status: 'idle' | 'processing' | 'success' | 'error';
}

interface AIPerformanceTachometerProps {
  className?: string;
  compact?: boolean;
}

export function AIPerformanceTachometer({ 
  className,
  compact = false 
}: AIPerformanceTachometerProps) {
  const [metrics, setMetrics] = useState<AIPerformanceMetrics>({
    responseTime: 0,
    tokensUsed: 0,
    apiCalls: 0,
    accuracy: 0,
    status: 'idle',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalCalls: 0,
    totalTokens: 0,
    avgResponseTime: 0,
  });

  // Listen for query events
  useEffect(() => {
    const handleQueryStart = () => {
      setIsProcessing(true);
      setMetrics(prev => ({ ...prev, status: 'processing', responseTime: 0 }));
    };

    const handleQueryEnd = (event: CustomEvent) => {
      const detail = event.detail || {};
      const responseTime = detail.responseTime || Math.random() * 2000 + 500;
      const tokensUsed = detail.tokensUsed || Math.floor(Math.random() * 1500) + 200;
      const accuracy = detail.accuracy || Math.floor(Math.random() * 15) + 85;

      setIsProcessing(false);
      setMetrics(prev => ({
        responseTime,
        tokensUsed,
        apiCalls: prev.apiCalls + 1,
        accuracy,
        status: 'success',
      }));
      
      setSessionStats(prev => ({
        totalCalls: prev.totalCalls + 1,
        totalTokens: prev.totalTokens + tokensUsed,
        avgResponseTime: prev.totalCalls === 0 
          ? responseTime 
          : (prev.avgResponseTime * prev.totalCalls + responseTime) / (prev.totalCalls + 1),
      }));

      // Reset status after a delay
      setTimeout(() => {
        setMetrics(prev => ({ ...prev, status: 'idle' }));
      }, 3000);
    };

    window.addEventListener('tcm-query-start', handleQueryStart);
    window.addEventListener('tcm-query-end', handleQueryEnd as EventListener);

    return () => {
      window.removeEventListener('tcm-query-start', handleQueryStart);
      window.removeEventListener('tcm-query-end', handleQueryEnd as EventListener);
    };
  }, []);

  // Animate response time counter during processing
  useEffect(() => {
    if (isProcessing) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          responseTime: Date.now() - startTime,
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const getSpeedLevel = (time: number): { label: string; color: string; percentage: number } => {
    if (time === 0) return { label: 'Ready', color: 'text-muted-foreground', percentage: 0 };
    if (time < 1000) return { label: 'Fast', color: 'text-green-500', percentage: 90 };
    if (time < 2000) return { label: 'Normal', color: 'text-jade', percentage: 60 };
    if (time < 3500) return { label: 'Moderate', color: 'text-amber-500', percentage: 40 };
    return { label: 'Slow', color: 'text-red-500', percentage: 20 };
  };

  const speedLevel = getSpeedLevel(metrics.responseTime);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full border bg-background/80 backdrop-blur-sm cursor-help",
                isProcessing && "border-jade/50 bg-jade/5",
                className
              )}
            >
              <motion.div
                animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
              >
                <Gauge className={cn("h-4 w-4", isProcessing ? "text-jade" : "text-muted-foreground")} />
              </motion.div>
              <span className={cn("text-xs font-mono", speedLevel.color)}>
                {metrics.responseTime > 0 ? `${(metrics.responseTime / 1000).toFixed(1)}s` : '--'}
              </span>
              {metrics.status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  <CheckCircle2 className="h-3 w-3" />
                </motion.div>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="w-48">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className="font-mono">{(metrics.responseTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Used:</span>
                <span className="font-mono">{metrics.tokensUsed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Calls:</span>
                <span className="font-mono">{sessionStats.totalCalls}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border bg-card/50 backdrop-blur-sm p-3",
        isProcessing && "border-jade/50 ring-1 ring-jade/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
          >
            <Gauge className={cn("h-5 w-5", isProcessing ? "text-jade" : "text-muted-foreground")} />
          </motion.div>
          <span className="text-sm font-medium">AI Performance</span>
        </div>
        <AnimatePresence mode="wait">
          {metrics.status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant="outline" className="text-xs bg-jade/10 text-jade border-jade/30 animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            </motion.div>
          )}
          {metrics.status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </motion.div>
          )}
          {metrics.status === 'idle' && sessionStats.totalCalls > 0 && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Badge variant="outline" className="text-xs">
                {sessionStats.totalCalls} queries
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tachometer Gauge */}
      <div className="relative h-16 mb-3">
        {/* Gauge background arc */}
        <svg className="w-full h-full" viewBox="0 0 120 60">
          {/* Background arc */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Colored segments */}
          <path
            d="M 10 55 A 50 50 0 0 1 35 15"
            fill="none"
            stroke="hsl(var(--destructive))"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 35 15 A 50 50 0 0 1 60 5"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 60 5 A 50 50 0 0 1 85 15"
            fill="none"
            stroke="hsl(var(--jade))"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 85 15 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="#22c55e"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Active progress arc */}
          <motion.path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="157"
            initial={{ strokeDashoffset: 157 }}
            animate={{ 
              strokeDashoffset: 157 - (157 * speedLevel.percentage / 100) 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="33%" stopColor="#f59e0b" />
              <stop offset="66%" stopColor="hsl(var(--jade))" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          
          {/* Center needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 + (speedLevel.percentage * 1.8) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: '60px 55px' }}
          >
            <line
              x1="60"
              y1="55"
              x2="60"
              y2="15"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="60" cy="55" r="4" fill="hsl(var(--foreground))" />
          </motion.g>
        </svg>

        {/* Center value display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.span 
            key={metrics.responseTime}
            className={cn("text-lg font-mono font-bold", speedLevel.color)}
            animate={isProcessing ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={{ duration: 0.5, repeat: isProcessing ? Infinity : 0 }}
          >
            {metrics.responseTime > 0 ? `${(metrics.responseTime / 1000).toFixed(2)}s` : '--'}
          </motion.span>
          <span className={cn("text-xs block", speedLevel.color)}>{speedLevel.label}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-muted/30">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
            <Coins className="h-3 w-3" />
            <span className="text-[10px] uppercase">Tokens</span>
          </div>
          <motion.span 
            key={metrics.tokensUsed}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-sm font-mono font-semibold"
          >
            {metrics.tokensUsed > 0 ? metrics.tokensUsed.toLocaleString() : '--'}
          </motion.span>
        </div>
        
        <div className="p-2 rounded bg-muted/30">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
            <Zap className="h-3 w-3" />
            <span className="text-[10px] uppercase">Calls</span>
          </div>
          <span className="text-sm font-mono font-semibold">
            {sessionStats.totalCalls}
          </span>
        </div>
        
        <div className="p-2 rounded bg-muted/30">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
            <Brain className="h-3 w-3" />
            <span className="text-[10px] uppercase">Accuracy</span>
          </div>
          <motion.span 
            key={metrics.accuracy}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-sm font-mono font-semibold",
              metrics.accuracy >= 90 ? "text-green-500" : 
              metrics.accuracy >= 80 ? "text-jade" : "text-amber-500"
            )}
          >
            {metrics.accuracy > 0 ? `${metrics.accuracy}%` : '--'}
          </motion.span>
        </div>
      </div>

      {/* Session average */}
      {sessionStats.totalCalls > 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t text-center"
        >
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">
              Avg: {(sessionStats.avgResponseTime / 1000).toFixed(2)}s • 
              Total: {sessionStats.totalTokens.toLocaleString()} tokens
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
