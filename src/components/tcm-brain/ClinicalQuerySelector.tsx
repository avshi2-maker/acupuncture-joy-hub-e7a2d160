import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers, Zap, Baby, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PROMPT_MAPPINGS, PromptMapping } from '@/data/tcm-prompt-mapping';

interface ClinicalQuerySelectorProps {
  stackedQueries: PromptMapping[];
  onAddToStack: (mapping: PromptMapping) => void;
  onRemoveFromStack: (mappingId: string) => void;
  isInStack: (mappingId: string) => boolean;
  disabled?: boolean;
}

// Group mappings into 3 accordion categories
const ACCORDION_GROUPS = [
  {
    id: 'yin-yang',
    title: 'יין-יאנג ודפוסים קליניים',
    titleEn: 'Yin-Yang & Clinical Patterns',
    icon: Layers,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    mappingIds: [
      'yy_kidney', 'yy_liver', 'yy_spleen_damp', 'yy_shen_ear', 'yy_ke_cycle',
      'yy_lung_kidney', 'yy_wei_qi', 'yy_pulse_blood', 'yy_tongue_spleen', 'yy_sanjiao',
      'yy_zong_yuan', 'yy_ext_wind', 'yy_heart_sweat', 'yy_stomach_cold', 'yy_treasures'
    ]
  },
  {
    id: 'five-elements',
    title: 'חמשת היסודות',
    titleEn: 'Five Elements',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    mappingIds: [
      'fe_wood', 'fe_fire', 'fe_earth', 'fe_metal', 'fe_water',
      'fe_sheng_cycle', 'fe_ke_cycle', 'fe_wood_fire', 'fe_fire_earth', 'fe_earth_metal',
      'fe_metal_water', 'fe_water_wood', 'fe_constitutional', 'fe_emotion_organs', 'fe_seasonal_treatment'
    ]
  },
  {
    id: 'specialty',
    title: 'התמחויות קליניות',
    titleEn: 'Clinical Specialties',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    mappingIds: [] // Placeholder for future musculoskeletal/gynecology mappings
  }
];

// Create a lookup map for mappings
const MAPPINGS_BY_ID = new Map(PROMPT_MAPPINGS.map(m => [m.id, m]));

function AccordionGroup({
  group,
  isOpen,
  onToggle,
  stackedQueries,
  onAddToStack,
  onRemoveFromStack,
  isInStack,
  disabled
}: {
  group: typeof ACCORDION_GROUPS[0];
  isOpen: boolean;
  onToggle: () => void;
  stackedQueries: PromptMapping[];
  onAddToStack: (mapping: PromptMapping) => void;
  onRemoveFromStack: (mappingId: string) => void;
  isInStack: (mappingId: string) => boolean;
  disabled?: boolean;
}) {
  const mappings = group.mappingIds
    .map(id => MAPPINGS_BY_ID.get(id))
    .filter(Boolean) as PromptMapping[];
  
  const stackedCount = mappings.filter(m => isInStack(m.id)).length;
  const Icon = group.icon;

  if (mappings.length === 0) {
    return (
      <div className={cn(
        'rounded-lg border p-3 opacity-50',
        group.borderColor,
        group.bgColor
      )}>
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', group.color)} />
          <span className="text-sm font-medium" dir="rtl">{group.title}</span>
          <Badge variant="secondary" className="text-[10px] ml-auto">בקרוב</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden transition-all',
      group.borderColor,
      isOpen ? group.bgColor : 'bg-card hover:bg-muted/50'
    )}>
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-3 text-left"
        disabled={disabled}
      >
        <Icon className={cn('h-4 w-4 shrink-0', group.color)} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold block" dir="rtl">{group.title}</span>
          <span className="text-[10px] text-muted-foreground">{group.titleEn}</span>
        </div>
        {stackedCount > 0 && (
          <Badge className="bg-jade text-white text-[10px] shrink-0">
            {stackedCount}
          </Badge>
        )}
        <ChevronDown className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pb-2 space-y-1">
              {mappings.map((mapping) => {
                const inStack = isInStack(mapping.id);
                return (
                  <button
                    key={mapping.id}
                    onClick={() => inStack ? onRemoveFromStack(mapping.id) : onAddToStack(mapping)}
                    disabled={disabled}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-md text-left transition-all',
                      'hover:bg-background/80 active:scale-[0.98]',
                      inStack && 'bg-jade/20 border border-jade/40 shadow-sm'
                    )}
                  >
                    <span className="text-lg shrink-0">{mapping.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium block truncate" dir="rtl">
                        {mapping.hebrewLabel}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate block">
                        {mapping.role}
                      </span>
                    </div>
                    {inStack && (
                      <Badge variant="secondary" className="text-[9px] bg-jade/30 text-jade shrink-0">
                        ✓
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ClinicalQuerySelector({
  stackedQueries,
  onAddToStack,
  onRemoveFromStack,
  isInStack,
  disabled = false
}: ClinicalQuerySelectorProps) {
  const [openAccordions, setOpenAccordions] = useState<string[]>(['yin-yang']);

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  return (
    <div id="clinical-query-selector" data-teleprompter="query-selector" className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-gradient-to-r from-violet-500/10 to-transparent shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-bold text-violet-700" dir="rtl">בחירת שאילתות</span>
          </div>
          {stackedQueries.length > 0 && (
            <Badge className="bg-violet-600 text-white">
              {stackedQueries.length} נבחרו
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Select patterns to build a unified clinical query
        </p>
      </div>

      {/* Scrollable Accordion List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {ACCORDION_GROUPS.map((group) => (
            <AccordionGroup
              key={group.id}
              group={group}
              isOpen={openAccordions.includes(group.id)}
              onToggle={() => toggleAccordion(group.id)}
              stackedQueries={stackedQueries}
              onAddToStack={onAddToStack}
              onRemoveFromStack={onRemoveFromStack}
              isInStack={isInStack}
              disabled={disabled}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
