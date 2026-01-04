import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, HelpCircle, Code, ChevronDown, ChevronUp, Activity } from 'lucide-react';

interface AITrustHeaderProps {
  className?: string;
  collapsible?: boolean;
}

export interface AITrustHeaderRef {
  startProcessing: () => void;
  finishSuccess: (score?: number) => void;
  finishWarning: () => void;
  reset: () => void;
}

type SourceType = 'rag_internal' | 'llm_fallback' | 'idle';

export const AITrustHeader = forwardRef<AITrustHeaderRef, AITrustHeaderProps>(({ className, collapsible = true }, ref) => {
  const [assetsScanned, setAssetsScanned] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
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
        // Collapse after a delay when returning to ready
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
      
      if (source === 'rag_internal') {
        finishSuccess(score);
      } else if (source === 'llm_fallback') {
        finishWarning();
      } else {
        finishSuccess(score);
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
        setProcessingTime(prev => prev + 0.01);
      }, 10);
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
        count += Math.floor(Math.random() * 5) + 1;
        setAssetsScanned(count);
      }, 100);
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

  const finishSuccess = (score: number = 98) => {
    setIsScanning(false);
    setStatus('verified');
    setAccuracyScore(score);
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
    setSourceType('idle');
  };

  useImperativeHandle(ref, () => ({
    startProcessing,
    finishSuccess,
    finishWarning,
    reset
  }));

  const getStatusText = () => {
    switch (status) {
      case 'ready': return 'System Ready';
      case 'processing': return 'Scanning Knowledge Base...';
      case 'verified': return 'Verified - Internal Data';
      case 'warning': return 'External AI Fallback';
    }
  };

  const getMiniStatusText = () => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'processing': return 'Scanning...';
      case 'verified': return 'Verified';
      case 'warning': return 'External';
    }
  };

  const isWarning = status === 'warning';

  const therapistTooltip = `This is the "AI Trust Header" - a real-time transparency dashboard that shows you exactly what's happening when the AI processes your query.

🟢 GREEN (Verified Internal): The answer comes from our proprietary TCM knowledge base - peer-reviewed, curated content you can trust.

🟡 YELLOW (External Fallback): The system couldn't find a match in our internal database and used general AI knowledge. Use with clinical discretion.

The live metrics show:
• Assets Scanned: How many knowledge chunks were searched
• Processing Time: Real-time query duration
• Accuracy Score: Confidence level for internal matches`;

  const developerTooltip = `Developer Instructions: Integration

On Submit: Call startProcessing() when the user hits "Send".

On Response: Check the API metadata.
• If source === 'rag_internal', call finishSuccess(98)
• If source === 'llm_fallback', call finishWarning()

Integration via CustomEvents:
// Start processing
window.dispatchEvent(new CustomEvent('tcm-query-start'));

// On response - internal source
window.dispatchEvent(new CustomEvent('tcm-query-end', {
  detail: { source: 'rag_internal', score: 98 }
}));

// On response - external fallback
window.dispatchEvent(new CustomEvent('tcm-query-end', {
  detail: { source: 'llm_fallback' }
}));`;

  // Mini collapsed version
  const MiniHeader = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 32 }}
      exit={{ opacity: 0, height: 0 }}
      className={`w-full h-8 flex items-center justify-between px-4 font-mono text-slate-200 cursor-pointer hover:bg-slate-700/30 transition-colors ${className}`}
      style={{
        background: '#1a202c',
        borderBottom: `2px solid ${isWarning ? '#ecc94b' : '#2c7a7b'}`,
      }}
      onClick={() => setIsExpanded(true)}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm text-teal-400">TCM.AI</span>
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-2 h-2 rounded-full ${
              isWarning 
                ? 'bg-yellow-500' 
                : status === 'processing'
                  ? 'bg-sky-400'
                  : status === 'verified'
                    ? 'bg-green-500'
                    : 'bg-slate-500'
            }`}
            animate={status === 'processing' ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ repeat: status === 'processing' ? Infinity : 0, duration: 1 }}
          />
          <span className={`text-xs ${isWarning ? 'text-yellow-500' : 'text-slate-400'}`}>
            {getMiniStatusText()}
          </span>
        </div>
        {status !== 'ready' && (
          <span className="text-xs text-slate-500">
            {accuracyScore ? `${accuracyScore}%` : processingTime > 0 ? `${processingTime.toFixed(1)}s` : ''}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {status === 'processing' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            <Activity className="h-3 w-3 text-sky-400" />
          </motion.div>
        )}
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </div>
    </motion.div>
  );

  // Full expanded version
  const FullHeader = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 60 }}
      exit={{ opacity: 0, height: 0 }}
      className={`w-full h-[60px] flex items-center justify-between px-5 font-mono text-slate-200 relative overflow-hidden shadow-lg ${className}`}
      style={{
        background: '#1a202c',
        borderBottom: `3px solid ${isWarning ? '#ecc94b' : '#2c7a7b'}`,
      }}
    >
      {/* LEFT: Brand + Metrics */}
      <div className="flex items-center gap-5">
        <div className="font-bold text-lg tracking-wider text-teal-400">
          TCM.AI
        </div>

        <div className="text-center border-l border-slate-600 pl-4">
          <div className="text-[0.7rem] text-slate-400 uppercase tracking-wider">
            נכסים נסרקים
          </div>
          <motion.div 
            className="text-lg font-bold text-sky-400"
            key={assetsScanned}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {assetsScanned}
          </motion.div>
        </div>

        <div className="text-center border-l border-slate-600 pl-4">
          <div className="text-[0.7rem] text-slate-400 uppercase tracking-wider">
            זמן עיבוד
          </div>
          <div className="text-lg font-bold text-sky-400">
            {processingTime.toFixed(2)}s
          </div>
        </div>

        <div className="text-center border-l border-slate-600 pl-4">
          <div className="text-[0.7rem] text-slate-400 uppercase tracking-wider">
            דיוק / ציון
          </div>
          <div className={`text-lg font-bold ${accuracyScore ? 'text-green-400' : 'text-slate-500'}`}>
            {accuracyScore ? `${accuracyScore}%` : '--%'}
          </div>
        </div>
      </div>

      {/* CENTER: Status Badge */}
      <div 
        className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all ${
          isWarning 
            ? 'border-yellow-500 bg-black/30' 
            : 'border-teal-600 bg-black/30'
        }`}
      >
        <motion.div 
          className={`w-3 h-3 rounded-full ${
            isWarning 
              ? 'bg-yellow-500 shadow-[0_0_10px_#ecc94b]' 
              : status === 'processing'
                ? 'bg-sky-400 shadow-[0_0_10px_#63b3ed]'
                : 'bg-green-500 shadow-[0_0_10px_#48bb78]'
          }`}
          animate={status === 'processing' ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ repeat: status === 'processing' ? Infinity : 0, duration: 1.5 }}
        />
        <span className={`font-bold text-sm ${isWarning ? 'text-yellow-500' : ''}`}>
          {getStatusText()}
        </span>
      </div>

      {/* RIGHT: Scanner Visual + Tooltips */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-[0.7rem] text-slate-400 uppercase tracking-wider mb-1">
            פעילות מנוע
          </div>
          <div className="w-[150px] h-1 bg-slate-700 rounded overflow-hidden relative">
            {isScanning && (
              <motion.div 
                className="w-[30%] h-full bg-sky-400 absolute"
                animate={{ left: ['-30%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
            )}
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <HelpCircle className="h-4 w-4 text-teal-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="bottom" 
            className="max-w-[350px] text-xs whitespace-pre-line bg-slate-800 border-slate-600 text-slate-200"
          >
            {therapistTooltip}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
              <Code className="h-4 w-4 text-sky-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="bottom" 
            className="max-w-[400px] text-xs whitespace-pre-line font-mono bg-slate-900 border-slate-600 text-slate-200"
          >
            {developerTooltip}
          </TooltipContent>
        </Tooltip>

        {/* Collapse button */}
        {collapsible && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          >
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        {collapsible && !isExpanded ? (
          <MiniHeader key="mini" />
        ) : (
          <FullHeader key="full" />
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
});

AITrustHeader.displayName = 'AITrustHeader';

export default AITrustHeader;
