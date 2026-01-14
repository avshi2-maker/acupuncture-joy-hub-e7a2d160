import React, { useState } from 'react';
import { SessionMetrics } from '@/hooks/useClinicalSession';
import { PromptMapping } from '@/data/tcm-prompt-mapping';
import { Activity, Zap, Clock, DollarSign, Database, CheckCircle2, ChevronUp, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EconomyMonitorProps {
  metrics: SessionMetrics;
  stackedQueries: PromptMapping[];
  isVisible: boolean;
  onExecuteSynthesis?: () => void;
  isAnalyzing?: boolean;
}

export const EconomyMonitor: React.FC<EconomyMonitorProps> = ({
  metrics,
  stackedQueries,
  isVisible,
  onExecuteSynthesis,
  isAnalyzing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const hasQueries = stackedQueries.length > 0;
  const hasCost = metrics.tokensUsed > 0;

  return (
    <motion.div 
      id="economy-monitor"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-5 right-5 z-[10001] flex flex-col items-end gap-2"
    >
      {/* Execute Button - Always visible when queries are stacked */}
      <AnimatePresence>
        {hasQueries && onExecuteSynthesis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button
              onClick={onExecuteSynthesis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-violet-600 to-emerald-500 hover:from-violet-700 hover:to-emerald-600 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-violet-500/30 gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  מעבד...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  חפש {stackedQueries.length} שאילתות
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State - Small Pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-black/90 text-green-400 px-3 py-2 rounded-full font-mono text-xs border border-green-500/30 shadow-lg hover:bg-black hover:border-green-500/50 transition-all cursor-pointer"
      >
        <Database className="h-3 w-3 text-green-400" />
        <span className="text-green-300 font-bold">
          {stackedQueries.length > 0 ? `${stackedQueries.length} stacked` : 'INDEXED'}
        </span>
        {hasCost && (
          <span className="text-green-500/70 text-[10px]">
            ${metrics.totalCost.toFixed(4)}
          </span>
        )}
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-green-500" />
        ) : (
          <ChevronUp className="h-3 w-3 text-green-500" />
        )}
      </button>

      {/* Expanded State - Full Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="bg-black/95 text-green-400 p-4 rounded-xl font-mono text-xs border border-green-500/30 shadow-2xl shadow-green-900/20 min-w-[220px] backdrop-blur-sm overflow-hidden"
          >
            {/* Header with indexed indicator */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/20">
              <Database className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-300 font-bold tracking-wide">INDEXED MODE</span>
              <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-3 text-[10px] text-green-500/70">
              <Activity className="h-2.5 w-2.5 animate-pulse" />
              <span>O(1) Map Lookup • No Linear Scan</span>
            </div>
            
            {/* Metrics grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-green-500/80">
                  <Zap className="h-3 w-3" />
                  STACKED:
                </span>
                <span className="text-green-300 font-bold">{stackedQueries.length}</span>
              </div>
              
              {hasCost && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-green-500/80">
                      <Clock className="h-3 w-3" />
                      LATENCY:
                    </span>
                    <span className={metrics.timeMs < 5000 ? 'text-green-300' : 'text-yellow-400'}>
                      {metrics.timeMs}ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-green-500/80">
                      <Activity className="h-3 w-3" />
                      TOKENS:
                    </span>
                    <span className="text-green-300">{metrics.tokensUsed.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-green-500/20">
                    <span className="flex items-center gap-2 text-green-300">
                      <DollarSign className="h-3 w-3" />
                      COST:
                    </span>
                    <span className="text-green-300 font-bold text-sm">
                      ${metrics.totalCost.toFixed(5)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Stacked query icons */}
            {hasQueries && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <div className="text-[10px] text-green-500/60 mb-1.5">SESSION BASKET:</div>
                <div className="flex flex-wrap gap-1.5">
                  {stackedQueries.map(q => (
                    <span 
                      key={q.id} 
                      className="text-lg filter drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]" 
                      title={q.hebrewLabel}
                    >
                      {q.icon}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Efficiency note */}
            <div className="mt-3 pt-2 border-t border-green-500/10 text-[9px] text-green-600/50">
              {stackedQueries.length} queries → 1 API call
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
