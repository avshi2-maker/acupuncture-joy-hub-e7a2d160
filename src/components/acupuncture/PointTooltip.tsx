import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, MapPin, Target, Ruler, Compass, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPointTechnicalInfo, meridianColors, meridianNames, type PointTechnicalInfo } from '@/data/point-technical-data';

interface PointTooltipProps {
  pointCode: string;
  anchorPosition: { x: number; y: number };
  containerRef?: React.RefObject<HTMLElement>;
  isVisible: boolean;
  onClose?: () => void;
  onMeridianHover?: (meridianCode: string | null) => void;
}

/**
 * Phase 4: Visual HUD - Precision Point Tooltip
 * Glass UI floating micro-card with depth, angle, clinical action, and audio feedback
 */
export function PointTooltip({
  pointCode,
  anchorPosition,
  containerRef,
  isVisible,
  onClose,
  onMeridianHover,
}: PointTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'right' | 'left' | 'top' | 'bottom'>('right');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pointInfo, setPointInfo] = useState<PointTechnicalInfo | null>(null);

  // Get point technical data
  useEffect(() => {
    if (pointCode) {
      const info = getPointTechnicalInfo(pointCode);
      setPointInfo(info);
    }
  }, [pointCode]);

  // Boundary detection - determine tooltip position
  useEffect(() => {
    if (!tooltipRef.current || !isVisible) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = containerRef?.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Calculate available space in each direction
    const spaceRight = containerRect.right - anchorPosition.x;
    const spaceLeft = anchorPosition.x - containerRect.left;
    const spaceTop = anchorPosition.y - containerRect.top;
    const spaceBottom = containerRect.bottom - anchorPosition.y;

    const tooltipWidth = 280;
    const tooltipHeight = 300;

    // Determine best position
    if (spaceRight >= tooltipWidth + 20) {
      setPosition('right');
    } else if (spaceLeft >= tooltipWidth + 20) {
      setPosition('left');
    } else if (spaceTop >= tooltipHeight + 20) {
      setPosition('top');
    } else {
      setPosition('bottom');
    }
  }, [anchorPosition, isVisible, containerRef]);

  // Whisper Mode - Hebrew audio feedback
  const speakClinicalAction = useCallback(() => {
    if (!pointInfo || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const text = `${pointInfo.code} - ${pointInfo.clinicalActionHebrew}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure for whisper mode
    utterance.volume = 0.3;
    utterance.rate = 0.9;
    utterance.lang = 'he-IL';

    // Get Hebrew voice if available
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
    if (hebrewVoice) {
      utterance.voice = hebrewVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [pointInfo]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Notify parent about meridian hover for glow effect
  useEffect(() => {
    if (isVisible && pointInfo) {
      onMeridianHover?.(pointInfo.meridianCode);
    } else {
      onMeridianHover?.(null);
    }
    return () => {
      onMeridianHover?.(null);
      stopSpeaking();
    };
  }, [isVisible, pointInfo, onMeridianHover, stopSpeaking]);

  if (!isVisible || !pointInfo) return null;

  // Get meridian color
  const meridianColor = meridianColors[pointInfo.meridianCode] || '#00A896';
  const meridianName = meridianNames[pointInfo.meridianCode];

  // Calculate tooltip offset based on position
  const getPositionStyles = () => {
    const offset = 16;
    switch (position) {
      case 'right':
        return { left: anchorPosition.x + offset, top: anchorPosition.y - 100 };
      case 'left':
        return { left: anchorPosition.x - 296, top: anchorPosition.y - 100 };
      case 'top':
        return { left: anchorPosition.x - 140, top: anchorPosition.y - 320 };
      case 'bottom':
        return { left: anchorPosition.x - 140, top: anchorPosition.y + offset };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'fixed z-[100] w-[280px]',
          'bg-background/95 backdrop-blur-xl',
          'border border-jade/20 rounded-xl',
          'shadow-2xl shadow-black/20',
          'p-4 space-y-3'
        )}
        style={getPositionStyles()}
        onMouseLeave={() => onClose?.()}
      >
        {/* Header with Point ID and Meridian */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge 
                className="text-sm font-bold"
                style={{ 
                  backgroundColor: `${meridianColor}20`,
                  color: meridianColor,
                  borderColor: meridianColor,
                }}
              >
                {pointInfo.code}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {meridianName?.hebrew}
              </span>
            </div>
            <h3 className="text-base font-bold mt-1 text-foreground" dir="rtl">
              {pointInfo.hebrewName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {pointInfo.pinyinName} • {pointInfo.chineseName}
            </p>
          </div>
          
          {/* Audio Feedback Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-full',
              isSpeaking ? 'bg-jade/20 text-jade animate-pulse' : 'hover:bg-jade/10'
            )}
            onClick={isSpeaking ? stopSpeaking : speakClinicalAction}
          >
            {isSpeaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Depth */}
          <div className="bg-muted/50 rounded-lg p-2 border border-border/50">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
              <Ruler className="h-3 w-3" />
              <span>עומק / Depth</span>
            </div>
            <p className="text-sm font-bold text-jade">
              {pointInfo.depth.min} - {pointInfo.depth.max} {pointInfo.depth.unit}
            </p>
          </div>

          {/* Angle */}
          <div className="bg-muted/50 rounded-lg p-2 border border-border/50">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
              <Compass className="h-3 w-3" />
              <span>זווית / Angle</span>
            </div>
            <p className="text-sm font-bold text-amber-600" dir="rtl">
              {pointInfo.angleHebrew}
            </p>
            {pointInfo.angleDegrees && (
              <p className="text-[10px] text-muted-foreground">
                {pointInfo.angleDegrees}
              </p>
            )}
          </div>
        </div>

        {/* Clinical Action */}
        <div className="bg-jade/5 rounded-lg p-3 border border-jade/20">
          <div className="flex items-center gap-1 text-[10px] text-jade mb-1">
            <Zap className="h-3 w-3" />
            <span>פעולה קלינית / Clinical Action</span>
          </div>
          <p className="text-sm text-foreground" dir="rtl">
            {pointInfo.clinicalActionHebrew}
          </p>
        </div>

        {/* De-Qi Sensation */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Target className="h-3 w-3 mt-0.5 text-violet-500" />
          <p><span className="font-medium text-violet-600">De-Qi:</span> {pointInfo.deQiSensation}</p>
        </div>

        {/* Contraindications Warning */}
        {pointInfo.contraindications && pointInfo.contraindications.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
            <p className="text-[10px] font-medium text-destructive" dir="rtl">
              ⚠️ התוויות נגד: {pointInfo.contraindications.join(', ')}
            </p>
          </div>
        )}

        {/* Meridian Glow Indicator */}
        <div 
          className="absolute -inset-[2px] rounded-xl pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(135deg, ${meridianColor}40, transparent)`,
            filter: 'blur(8px)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to manage tooltip state
 */
export function usePointTooltip() {
  const [activePoint, setActivePoint] = useState<{
    code: string;
    position: { x: number; y: number };
  } | null>(null);

  const showTooltip = useCallback((code: string, position: { x: number; y: number }) => {
    setActivePoint({ code, position });
  }, []);

  const hideTooltip = useCallback(() => {
    setActivePoint(null);
  }, []);

  return {
    activePoint,
    showTooltip,
    hideTooltip,
    isVisible: activePoint !== null,
  };
}
