import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Heart, Brain, Activity, Baby, Sparkles, Apple, 
  Leaf, Wind, Moon, Calendar, ArrowRight, FileText,
  Stethoscope, User, Pill, LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { PROMPT_MAPPINGS, PromptMapping } from '@/data/tcm-prompt-mapping';

interface SpecialtyIconsGridProps {
  pulsingIds?: Set<string>;
  onIconClick?: (mapping: PromptMapping) => void;
  activeIds?: Set<string>;
  showCategories?: boolean;
  compact?: boolean;
  className?: string;
}

// Category groupings for the 60 icons
interface CategoryGroup {
  id: string;
  label: string;
  labelHe: string;
  color: string;
  borderColor: string;
  mappings: PromptMapping[];
}

// Map icon strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  '☯️': Activity,
  '🫀': Heart,
  '😶': User,
  '💧': Leaf,
  '🔥': Activity,
  '🏃': Activity,
  '😴': Moon,
  '😔': Brain,
  '🌟': Sparkles,
  '🫘': Leaf,
  '🌿': Leaf,
  '☀️': Sparkles,
  '🔍': Stethoscope,
  '🧬': Brain,
  '🏥': Stethoscope,
  '🌬️': Wind,
  '❄️': Activity,
  '💦': Leaf,
  '🔴': Activity,
  '🦴': Activity,
  '🦒': Activity,
  '🎾': Activity,
  '⚡': Activity,
  '🦿': Activity,
  '🖐️': Activity,
  '💪': Activity,
  '🌐': Brain,
  '🦶': Activity,
  '🍖': Apple,
  '🩹': Activity,
  '📅': Calendar,
  '⏰': Calendar,
  '🔄': Activity,
  '😣': Heart,
  '🚫': Activity,
  '👶': Baby,
  '🥚': Baby,
  '📊': Activity,
  '🌸': Heart,
  '🌡️': Activity,
  '🌙': Moon,
  '✨': Sparkles,
  '📝': FileText,
  '🔬': Stethoscope,
  '📋': FileText,
  '💾': FileText,
  '🔗': ArrowRight,
  '🖨️': FileText,
  '💊': Pill,
};

export function SpecialtyIconsGrid({
  pulsingIds = new Set(),
  onIconClick,
  activeIds = new Set(),
  showCategories = true,
  compact = false,
  className,
}: SpecialtyIconsGridProps) {
  // Group mappings by role/category
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const groups: CategoryGroup[] = [
      {
        id: 'yin-yang',
        label: 'Yin-Yang',
        labelHe: 'יין-יאנג',
        color: 'text-purple-600',
        borderColor: 'border-purple-300',
        mappings: PROMPT_MAPPINGS.filter(m => m.id.startsWith('yy_')),
      },
      {
        id: 'orthopedic',
        label: 'Orthopedic',
        labelHe: 'אורתופדיה',
        color: 'text-blue-600',
        borderColor: 'border-blue-300',
        mappings: PROMPT_MAPPINGS.filter(m => m.id.startsWith('ortho_')),
      },
      {
        id: 'gynecology',
        label: 'Women & Fertility',
        labelHe: 'נשים ופוריות',
        color: 'text-rose-600',
        borderColor: 'border-rose-300',
        mappings: PROMPT_MAPPINGS.filter(m => m.id.startsWith('gyn_')),
      },
      {
        id: 'system',
        label: 'System',
        labelHe: 'מערכת',
        color: 'text-emerald-600',
        borderColor: 'border-emerald-300',
        mappings: PROMPT_MAPPINGS.filter(m => m.id.startsWith('sys_')),
      },
    ];
    return groups.filter(g => g.mappings.length > 0);
  }, []);

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)} dir="rtl">
        {categoryGroups.map((group) => (
          <div key={group.id} className="space-y-2">
            {/* Category Header */}
            {showCategories && (
              <div className="flex items-center gap-2 px-1">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] font-bold",
                    group.color,
                    group.borderColor
                  )}
                >
                  {group.labelHe}
                </Badge>
                <span className="text-[9px] text-muted-foreground">
                  {group.mappings.length} items
                </span>
              </div>
            )}
            
            {/* Icons Grid */}
            <div className={cn(
              "grid gap-1.5",
              compact ? "grid-cols-5 md:grid-cols-6" : "grid-cols-4 md:grid-cols-5"
            )}>
              <AnimatePresence>
                {group.mappings.map((mapping) => {
                  const isPulsing = pulsingIds.has(mapping.id);
                  const isActive = activeIds.has(mapping.id);
                  const IconComponent = ICON_MAP[mapping.icon] || Sparkles;
                  
                  return (
                    <Tooltip key={mapping.id}>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => onIconClick?.(mapping)}
                          className={cn(
                            "relative flex flex-col items-center justify-center",
                            "p-2 rounded-lg border transition-all",
                            compact ? "h-14" : "h-16 md:h-18",
                            "hover:scale-105 active:scale-95",
                            isActive 
                              ? "bg-jade/20 border-jade shadow-md" 
                              : "bg-background/50 border-muted-foreground/20 hover:border-muted-foreground/40",
                            isPulsing && "ring-2 ring-gold ring-offset-2 animate-pulse"
                          )}
                          animate={isPulsing ? {
                            boxShadow: [
                              '0 0 0 0 rgba(var(--gold), 0)',
                              '0 0 20px 4px rgba(var(--gold), 0.4)',
                              '0 0 0 0 rgba(var(--gold), 0)',
                            ],
                          } : {}}
                          transition={isPulsing ? { duration: 1.5, repeat: Infinity } : {}}
                        >
                          {/* Gold pulse ring animation */}
                          {isPulsing && (
                            <motion.div
                              className="absolute inset-0 rounded-lg border-2 border-gold"
                              initial={{ scale: 1, opacity: 1 }}
                              animate={{ scale: 1.3, opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                          
                          {/* Icon */}
                          <span className="text-lg md:text-xl mb-0.5">
                            {mapping.icon}
                          </span>
                          
                          {/* Hebrew Label */}
                          <span className={cn(
                            "text-[9px] md:text-[10px] font-medium text-center leading-tight",
                            "line-clamp-2",
                            isActive ? "text-jade" : "text-foreground/80"
                          )}>
                            {mapping.hebrewLabel}
                          </span>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-bold">{mapping.hebrewLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {mapping.voiceText || mapping.ragPriorityContext}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
