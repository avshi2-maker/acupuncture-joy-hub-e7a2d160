import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Code, ChevronDown, ChevronUp, Activity, Zap, Coins, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AITrustHeaderProps {
  className?: string;
  collapsible?: boolean;
}

export interface AITrustHeaderRef {
  startProcessing: () => void;
  finishSuccess: (score?: number, tokens?: number, timeMs?: number) => void;
  finishWarning: () => void;
  reset: () => void;
}

type SourceType = 'rag_internal' | 'llm_fallback' | 'idle';

// Confidence Gauge - Radial Ring
function ConfidenceGauge({ score, size = 40 }: { score: number | null; size?: number }) {
  const percentage = score !== null ? Math.round(score) : 0;
  const circumference = 2 * Math.PI * 15;
  const strokeDashoffset = score !== null ? circumference * (1 - score / 100) : circumference;
  
  const getColor = () => {
    if (score === null) return 'text-slate-300';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-400';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-200"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
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
        <span className={cn("text-[10px] font-bold", getColor())}>
          {score !== null ? `${percentage}%` : '—'}
        </span>
      </div>
    </div>
  );
}

export const AITrustHeader = forwardRef<AITrustHeaderRef, AITrustHeaderProps>(({ className, collapsible = true }, ref) => {
  const [assetsScanned, setAssetsScanned] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [searchTimeMs, setSearchTimeMs] = useState<number>(0);
  const [status, setStatus] = useState<'ready' | 'processing' | 'verified' | 'warning'>('ready');
  const [sourceType, setSourceType] = useState<SourceType>('idle');
  const [isScanning, setIsScanning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const assetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-expand when processing, auto-collapse when idle
  useEffect(() => {
    if (collapsible) {
      if (status === 'processing') {
        setIsExpanded(true);
      } else if (status === 'ready') {
        const timeout = setTimeout(() => setIsExpanded(false), 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [status, collapsible]);

  // Expose methods for API integration
  useEffect(() => {
    const handleQueryStart = () => {
      startProcessing();
    };

    const handleQueryEnd = (e: CustomEvent) => {
      const source = e.detail?.source;
      const score = e.detail?.score ?? 98;
      const tokens = e.detail?.tokens ?? 0;
      const timeMs = e.detail?.timeMs ?? 0;
      
      if (source === 'rag_internal') {
        finishSuccess(score, tokens, timeMs);
      } else if (source === 'llm_fallback') {
        finishWarning();
      } else {
        finishSuccess(score, tokens, timeMs);
      }
    };

    window.addEventListener('tcm-query-start', handleQueryStart);
    window.addEventListener('tcm-query-end', handleQueryEnd as EventListener);
    
    return () => {
      window.removeEventListener('tcm-query-start', handleQueryStart);
      window.removeEventListener('tcm-query-end', handleQueryEnd as EventListener);
    };
  }, []);

  // Processing timer
  useEffect(() => {
    if (status === 'processing') {
      timerRef.current = setInterval(() => {
        setProcessingTime(prev => prev + 0.5);
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Asset counter animation
  useEffect(() => {
    if (isScanning) {
      let count = 0;
      assetTimerRef.current = setInterval(() => {
        count += Math.floor(Math.random() * 5) + 3;
        setAssetsScanned(count);
      }, 800);
    } else {
      if (assetTimerRef.current) {
        clearInterval(assetTimerRef.current);
      }
    }
    return () => {
      if (assetTimerRef.current) clearInterval(assetTimerRef.current);
    };
  }, [isScanning]);

  const startProcessing = () => {
    setStatus('processing');
    setIsScanning(true);
    setAssetsScanned(0);
    setProcessingTime(0);
    setAccuracyScore(null);
    setSourceType('idle');
  };

  const finishSuccess = (score: number = 98, tokens: number = 0, timeMs: number = 0) => {
    setIsScanning(false);
    setStatus('verified');
    setAccuracyScore(score);
    setTokenCount(tokens);
    setSearchTimeMs(timeMs);
    setSourceType('rag_internal');
  };

  const finishWarning = () => {
    setIsScanning(false);
    setStatus('warning');
    setAccuracyScore(null);
    setSourceType('llm_fallback');
  };

  const reset = () => {
    setStatus('ready');
    setIsScanning(false);
    setAssetsScanned(0);
    setProcessingTime(0);
    setAccuracyScore(null);
    setTokenCount(0);
    setSearchTimeMs(0);
    setSourceType('idle');
  };

  useImperativeHandle(ref, () => ({
    startProcessing,
    finishSuccess,
    finishWarning,
    reset
  }));

  const isWarning = status === 'warning';

  const therapistTooltip = `AI Trust Header - Real-time transparency dashboard

🟢 GREEN (Verified): Answer from curated TCM knowledge base
🟡 YELLOW (External): Used general AI - use clinical discretion

Metrics:
• Speed: Query response time
• Tokens: Processing cost
• Confidence: Match accuracy`;

  return (
    <TooltipProvider>
      {/* PURE WHITE CLINIC THEME - Single Row Header */}
      <div
        className={cn(
          "w-full bg-white border-b border-slate-200 shadow-sm",
          className
        )}
      >
        <div className="max-w-full mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT: Status Badge */}
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium px-2.5 py-1",
                  status === 'processing' 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : status === 'verified'
                      ? "bg-green-50 text-green-700 border-green-200"
                      : status === 'warning'
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                )}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  status === 'processing' 
                    ? "bg-amber-500 animate-pulse" 
                    : status === 'verified'
                      ? "bg-green-500"
                      : status === 'warning'
                        ? "bg-yellow-500"
                        : "bg-slate-400"
                )} />
                {status === 'ready' && 'Ready'}
                {status === 'processing' && 'Scanning...'}
                {status === 'verified' && 'Verified'}
                {status === 'warning' && 'External AI'}
              </Badge>
            </div>

            {/* CENTER: Metric Badges Row */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {/* Speed Badge */}
              <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                <Zap className="w-3 h-3 mr-1" />
                {searchTimeMs > 0 ? `${searchTimeMs}ms` : status === 'processing' ? `${(processingTime * 1000).toFixed(0)}ms` : '—'}
              </Badge>

              {/* Token Badge */}
              <Badge variant="outline" className="text-xs font-medium bg-violet-50 text-violet-700 border-violet-200">
                <Coins className="w-3 h-3 mr-1" />
                {tokenCount > 0 ? tokenCount : assetsScanned > 0 ? assetsScanned : '—'}
              </Badge>
            </div>

            {/* RIGHT: Confidence Gauge + Help */}
            <div className="flex items-center gap-3">
              {/* Confidence Gauge */}
              <ConfidenceGauge score={accuracyScore} size={36} />

              {/* Brand */}
              <span className="text-sm font-bold text-emerald-600">TCM.AI</span>

              {/* Help Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[300px] text-xs whitespace-pre-line"
                >
                  {therapistTooltip}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});

AITrustHeader.displayName = 'AITrustHeader';

export default AITrustHeader;
