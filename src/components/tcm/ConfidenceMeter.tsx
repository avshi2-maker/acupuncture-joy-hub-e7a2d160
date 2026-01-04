import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp,
  Sparkles, Shield, FileText, HelpCircle, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HybridSearchScore {
  vectorScore?: number;
  keywordScore?: number;
  combinedScore: number;
  threshold: number;
  meetsThreshold: boolean;
}

interface ConfidenceMeterProps {
  confidence: number;
  sourcesCount: number;
  sourceNames: string[];
  isExternal: boolean;
  warnings?: string[];
  hybridScore?: HybridSearchScore;
  onShowDetails?: () => void;
}

export function ConfidenceMeter({
  confidence,
  sourcesCount,
  sourceNames,
  isExternal,
  warnings = [],
  hybridScore,
  onShowDetails
}: ConfidenceMeterProps) {
  const [showSources, setShowSources] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  // Determine status based on confidence and external flag
  const getStatus = () => {
    if (isExternal) return 'external';
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  };

  const status = getStatus();

  const statusConfig = {
    high: {
      icon: CheckCircle2,
      label: 'Verified from TCM Library',
      labelHe: 'מאומת מספריית הרפואה הסינית',
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500/30',
      bgContainer: 'bg-green-50 dark:bg-green-500/10',
      meterColor: 'from-green-400 to-green-600'
    },
    medium: {
      icon: Shield,
      label: 'Partially Verified',
      labelHe: 'מאומת חלקית',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-500/30',
      bgContainer: 'bg-amber-50 dark:bg-amber-500/10',
      meterColor: 'from-amber-400 to-amber-600'
    },
    low: {
      icon: AlertTriangle,
      label: 'Limited Sources',
      labelHe: 'מקורות מוגבלים',
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-500/30',
      bgContainer: 'bg-red-50 dark:bg-red-500/10',
      meterColor: 'from-red-400 to-red-600'
    },
    external: {
      icon: Sparkles,
      label: 'AI Interpretation',
      labelHe: 'פרשנות AI',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500/30',
      bgContainer: 'bg-purple-50 dark:bg-purple-500/10',
      meterColor: 'from-purple-400 to-purple-600'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Visual meter segments (like fuel gauge)
  const segments = 5;
  const filledSegments = Math.ceil((confidence / 100) * segments);

  return (
    <div className={`rounded-xl p-3 border ${config.borderColor} ${config.bgContainer} transition-all duration-300`}>
      {/* Main Status Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <StatusIcon className={`w-5 h-5 ${config.color}`} />
          </motion.div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
            {sourcesCount > 0 && (
              <span className="text-xs text-muted-foreground">
                Based on {sourcesCount} knowledge {sourcesCount === 1 ? 'article' : 'articles'}
              </span>
            )}
          </div>
        </div>

        {/* Visual Meter with Score */}
        <div className="flex items-center gap-2">
          {/* Hybrid Score Display */}
          {hybridScore && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors ${
                      hybridScore.meetsThreshold 
                        ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                    }`}
                    onClick={() => setShowScoreDetails(!showScoreDetails)}
                  >
                    <Activity className="w-3 h-3" />
                    <span>{(hybridScore.combinedScore * 100).toFixed(0)}%</span>
                    <span className="opacity-60">/ {(hybridScore.threshold * 100).toFixed(0)}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px]">
                  <div className="space-y-1">
                    <p className="font-medium text-xs">Hybrid Search Score</p>
                    <p className="text-[10px]">
                      Combined: {(hybridScore.combinedScore * 100).toFixed(1)}%
                    </p>
                    <p className="text-[10px]">
                      Threshold: {(hybridScore.threshold * 100).toFixed(0)}%
                    </p>
                    <p className={`text-[10px] ${hybridScore.meetsThreshold ? 'text-green-500' : 'text-red-500'}`}>
                      {hybridScore.meetsThreshold ? '✓ Meets threshold' : '✗ Below threshold'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Visual Meter */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5 cursor-help">
                  {Array.from({ length: segments }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.2 }}
                      className={`w-2 rounded-sm origin-bottom ${
                        i < filledSegments 
                          ? `bg-gradient-to-t ${config.meterColor}` 
                          : 'bg-muted/50'
                      }`}
                      style={{ height: `${12 + i * 3}px` }}
                    />
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Source Confidence: {confidence}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Expanded Hybrid Score Details */}
      <AnimatePresence>
        {showScoreDetails && hybridScore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pt-2 border-t border-current/10"
          >
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {hybridScore.vectorScore !== undefined && (
                <div className="flex items-center justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground">Vector (Semantic)</span>
                  <span className="font-medium">{(hybridScore.vectorScore * 100).toFixed(1)}%</span>
                </div>
              )}
              {hybridScore.keywordScore !== undefined && (
                <div className="flex items-center justify-between p-1.5 rounded bg-background/50">
                  <span className="text-muted-foreground">Keyword (BM25)</span>
                  <span className="font-medium">{(hybridScore.keywordScore * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
            {/* Threshold Bar */}
            <div className="mt-2 relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${hybridScore.combinedScore * 100}%` }}
                className={`absolute h-full rounded-full ${
                  hybridScore.meetsThreshold ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div 
                className="absolute h-full w-0.5 bg-foreground/60"
                style={{ left: `${hybridScore.threshold * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">Threshold: {(hybridScore.threshold * 100).toFixed(0)}%</span>
              <span>100%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Sources */}
      {sourceNames.length > 0 && (
        <Collapsible open={showSources} onOpenChange={setShowSources}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs justify-between hover:bg-background/50"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                View sources
              </span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="flex flex-wrap gap-1.5">
              {sourceNames.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] font-normal flex items-center gap-1"
                  >
                    <FileText className="w-2.5 h-2.5" />
                    {name.replace('.csv', '').replace(/-/g, ' ')}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Gentle Warnings (if any) */}
      {warnings.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current/10">
          <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>{warnings[0]}</span>
          </div>
        </div>
      )}

      {/* Advanced Details Link */}
      {onShowDetails && (
        <Button
          variant="link"
          size="sm"
          onClick={onShowDetails}
          className="mt-2 h-6 text-[10px] text-muted-foreground hover:text-foreground p-0"
        >
          <HelpCircle className="w-3 h-3 mr-1" />
          View detailed AI trace
        </Button>
      )}
    </div>
  );
}
