import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Brain, Maximize2, Minimize2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BodyFigureSelector } from '@/components/acupuncture/BodyFigureSelector';

interface BodyMapSidebarProps {
  highlightedPoints: string[];
  onClearPoints?: () => void;
  onGenerateProtocol?: (points: string[]) => void;
  onOpenPulseGallery?: () => void;
  showPulseGallery?: boolean;
  className?: string;
}

export function BodyMapSidebar({
  highlightedPoints,
  onClearPoints,
  onGenerateProtocol,
  onOpenPulseGallery,
  showPulseGallery = false,
  className
}: BodyMapSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      'h-full flex flex-col bg-card/50 border-r',
      'shrink-0', // CRITICAL: Prevent sidebar from shrinking when center resizes
      className
    )}>
      {/* Header */}
      <div className="p-3 border-b bg-gradient-to-r from-jade/10 to-transparent shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-jade" />
            <span className="text-sm font-bold text-jade">מפת הגוף</span>
          </div>
          <div className="flex items-center gap-1">
            {highlightedPoints.length > 0 && (
              <Badge className="bg-jade/20 text-jade border-jade/30 text-[10px]">
                {highlightedPoints.length} נקודות
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Visual reference for point selection
        </p>
      </div>

      {/* Pulse Gallery Trigger - 💓 Button in Left Column */}
      {onOpenPulseGallery && (
        <div className="p-2 border-b shrink-0">
          <Button
            variant={showPulseGallery ? "default" : "outline"}
            size="sm"
            onClick={onOpenPulseGallery}
            className={cn(
              "w-full gap-2 h-9 transition-all",
              showPulseGallery 
                ? "bg-gold text-black hover:bg-gold/90 animate-gold-pulse" 
                : "border-jade/30 hover:bg-jade/10 hover:border-jade"
            )}
          >
            <Activity className={cn(
              "h-4 w-4",
              showPulseGallery ? "text-black" : "text-jade"
            )} />
            <span className="text-sm font-medium">💓 גלריית דופק</span>
          </Button>
        </div>
      )}

      {/* Point Summary */}
      {highlightedPoints.length > 0 && (
        <div className="p-2 border-b bg-jade/5 shrink-0">
          <div className="flex flex-wrap gap-1">
            {highlightedPoints.slice(0, 6).map((point) => (
              <Badge
                key={point}
                variant="outline"
                className="text-[10px] bg-background"
              >
                {point}
              </Badge>
            ))}
            {highlightedPoints.length > 6 && (
              <Badge variant="secondary" className="text-[10px]">
                +{highlightedPoints.length - 6}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-[10px] border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={onClearPoints}
            >
              🗑️ נקה סימונים
            </Button>
            {onGenerateProtocol && highlightedPoints.length > 0 && (
              <Button
                size="sm"
                className="flex-1 h-7 text-[10px] bg-jade hover:bg-jade/90"
                onClick={() => onGenerateProtocol(highlightedPoints)}
              >
                פרוטוקול
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Body Figure Display */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BodyFigureSelector
                  highlightedPoints={highlightedPoints}
                  onGenerateProtocol={onGenerateProtocol}
                />
              </motion.div>
            ) : (
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {/* Compact body figure thumbnails */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-[3/4] bg-muted rounded-lg border flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <span className="text-[9px] text-muted-foreground mt-1 block">Anterior</span>
                    </div>
                  </div>
                  <div className="aspect-[3/4] bg-muted rounded-lg border flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <span className="text-[9px] text-muted-foreground mt-1 block">Posterior</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick meridian reference */}
                <div className="p-2 bg-muted/50 rounded-lg">
                  <span className="text-[10px] font-medium text-muted-foreground block mb-1">
                    Quick Reference
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['LU', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'SJ', 'GB', 'LV'].map(m => (
                      <span key={m} className="text-[9px] px-1.5 py-0.5 bg-background rounded border">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
