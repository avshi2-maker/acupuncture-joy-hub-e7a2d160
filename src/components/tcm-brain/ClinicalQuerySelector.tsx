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

// Group mappings into 4 accordion categories with CORRECT IDs from tcm-prompt-mapping.ts
const ACCORDION_GROUPS = [
  {
    id: 'yin-yang',
    title: 'דפוסים קליניים',
    titleEn: 'Clinical Patterns',
    icon: Layers,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    mappingIds: [
      'yy_balance', 'yy_yin_organs', 'yy_yin_def_face', 'yy_yin_def_treat', 'yy_yang_strengthen',
      'yy_exercise', 'yy_insomnia', 'yy_depression', 'yy_five_elements', 'yy_kidney_balance',
      'yy_liver_yang', 'yy_yang_type', 'yy_symptom_sort', 'yy_constitutional', 'yy_western_integration'
    ]
  },
  {
    id: 'orthopedic',
    title: 'אורתופדיה וכאב',
    titleEn: 'Orthopedic & Pain',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    mappingIds: [
      'ortho_wind', 'ortho_cold', 'ortho_damp', 'ortho_heat', 'ortho_back_trauma',
      'ortho_neck', 'ortho_tennis_elbow', 'ortho_sciatica', 'ortho_cartilage', 'ortho_carpal',
      'ortho_shoulder', 'ortho_fibromyalgia', 'ortho_heel_spur', 'ortho_gout', 'ortho_ankle_sprain'
    ]
  },
  {
    id: 'gynecology',
    title: 'נשים ופוריות',
    titleEn: 'Women & Fertility',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    mappingIds: [
      'gyn_late_period', 'gyn_early_period', 'gyn_irregular', 'gyn_dysmenorrhea', 'gyn_amenorrhea',
      'gyn_fertility_cold', 'gyn_fertility_yin', 'gyn_pcos', 'gyn_endometriosis', 'gyn_pms',
      'gyn_menopause', 'gyn_postpartum', 'gyn_threatened_miscarriage', 'gyn_morning_sickness', 'gyn_pregnancy_forbidden'
    ]
  },
  {
    id: 'tongue-diagnosis',
    title: 'לשון ודופק',
    titleEn: 'Tongue & Pulse',
    icon: Sparkles,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    mappingIds: [
      'yy_yin_def_face', 'yy_symptom_sort', 'yy_yin_organs', 'yy_liver_yang', 'yy_kidney_balance'
    ]
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

  // Hide empty groups instead of showing "Coming Soon"
  if (mappings.length === 0) {
    return null;
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
