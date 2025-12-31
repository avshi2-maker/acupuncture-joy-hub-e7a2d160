import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Stethoscope, Heart, Brain, Pill, Baby, Sparkles, 
  Sun, Snowflake, Dumbbell, Activity, Apple, BookOpen,
  Clipboard, Eye, Hand, Thermometer, Leaf, Users,
  FileText, Zap, Shield
} from 'lucide-react';

export interface KnowledgeAsset {
  id: string;
  name: string;
  nameHe: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  file: string;
}

export const KNOWLEDGE_ASSETS: KnowledgeAsset[] = [
  { 
    id: 'treatment-planning', 
    name: 'Treatment Planning', 
    nameHe: 'תכנון טיפול',
    icon: Clipboard, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', 
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    file: 'Treatment_Planning_Protocols_Professional_100plus.csv'
  },
  { 
    id: 'chief-complaints', 
    name: 'Chief Complaints', 
    nameHe: 'תלונות עיקריות',
    icon: Stethoscope, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/30', 
    borderColor: 'border-blue-300 dark:border-blue-700',
    file: 'chief-complaints-tcm.csv'
  },
  { 
    id: 'chronic-pain', 
    name: 'Chronic Pain', 
    nameHe: 'כאב כרוני',
    icon: Zap, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50 dark:bg-red-950/30', 
    borderColor: 'border-red-300 dark:border-red-700',
    file: 'chronic-pain-management.csv'
  },
  { 
    id: 'allergies', 
    name: 'Allergies', 
    nameHe: 'אלרגיות',
    icon: Shield, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 dark:bg-amber-950/30', 
    borderColor: 'border-amber-300 dark:border-amber-700',
    file: 'clinic-allergies-intake-form.csv'
  },
  { 
    id: 'diet-nutrition', 
    name: 'Diet & Nutrition', 
    nameHe: 'תזונה',
    icon: Apple, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 dark:bg-green-950/30', 
    borderColor: 'border-green-300 dark:border-green-700',
    file: 'clinic-diet-nutrition-intake-form.csv'
  },
  { 
    id: 'medications', 
    name: 'Medications', 
    nameHe: 'תרופות',
    icon: Pill, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50 dark:bg-purple-950/30', 
    borderColor: 'border-purple-300 dark:border-purple-700',
    file: 'clinic-medications-supplements-intake.csv'
  },
  { 
    id: 'pulse-reference', 
    name: 'Pulse Reference', 
    nameHe: 'דופק',
    icon: Activity, 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-50 dark:bg-rose-950/30', 
    borderColor: 'border-rose-300 dark:border-rose-700',
    file: 'clinic-pulse-diagnosis-reference.csv'
  },
  { 
    id: 'diagnostics', 
    name: 'Diagnostics Pro', 
    nameHe: 'אבחון מקצועי',
    icon: BookOpen, 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30', 
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    file: 'diagnostics-professional.csv'
  },
  { 
    id: 'digestive', 
    name: 'Digestive', 
    nameHe: 'עיכול',
    icon: Thermometer, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 dark:bg-orange-950/30', 
    borderColor: 'border-orange-300 dark:border-orange-700',
    file: 'digestive-disorders.csv'
  },
  { 
    id: 'weather-climate', 
    name: 'Weather & Climate', 
    nameHe: 'מזג אוויר',
    icon: Sun, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', 
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    file: 'extreme-weather-climate.csv'
  },
  { 
    id: 'immune', 
    name: 'Immune System', 
    nameHe: 'מערכת חיסון',
    icon: Shield, 
    color: 'text-teal-600', 
    bgColor: 'bg-teal-50 dark:bg-teal-950/30', 
    borderColor: 'border-teal-300 dark:border-teal-700',
    file: 'immune-resilience.csv'
  },
  { 
    id: 'mental-health', 
    name: 'Mental Health', 
    nameHe: 'בריאות הנפש',
    icon: Brain, 
    color: 'text-violet-600', 
    bgColor: 'bg-violet-50 dark:bg-violet-950/30', 
    borderColor: 'border-violet-300 dark:border-violet-700',
    file: 'mental-health-tcm.csv'
  },
  { 
    id: 'constitutions', 
    name: '9 Constitutions', 
    nameHe: '9 חוקות',
    icon: Users, 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30', 
    borderColor: 'border-cyan-300 dark:border-cyan-700',
    file: 'nine-constitutions-qa.csv'
  },
  { 
    id: 'pediatric', 
    name: 'Pediatric', 
    nameHe: 'ילדים',
    icon: Baby, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50 dark:bg-pink-950/30', 
    borderColor: 'border-pink-300 dark:border-pink-700',
    file: 'pediatric-acupuncture.csv'
  },
  { 
    id: 'pulse', 
    name: 'Pulse Diagnosis', 
    nameHe: 'אבחון דופק',
    icon: Heart, 
    color: 'text-red-500', 
    bgColor: 'bg-red-50 dark:bg-red-950/30', 
    borderColor: 'border-red-300 dark:border-red-700',
    file: 'pulse-diagnosis.csv'
  },
  { 
    id: 'sports', 
    name: 'Sports & Recovery', 
    nameHe: 'ספורט',
    icon: Dumbbell, 
    color: 'text-sky-600', 
    bgColor: 'bg-sky-50 dark:bg-sky-950/30', 
    borderColor: 'border-sky-300 dark:border-sky-700',
    file: 'sport-performance-recovery.csv'
  },
  { 
    id: 'tongue', 
    name: 'Tongue Diagnosis', 
    nameHe: 'אבחון לשון',
    icon: Eye, 
    color: 'text-fuchsia-600', 
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', 
    borderColor: 'border-fuchsia-300 dark:border-fuchsia-700',
    file: 'tongue-diagnosis.csv'
  },
  { 
    id: 'womens-health', 
    name: "Women's Health", 
    nameHe: 'בריאות האישה',
    icon: Sparkles, 
    color: 'text-pink-500', 
    bgColor: 'bg-pink-50 dark:bg-pink-950/30', 
    borderColor: 'border-pink-300 dark:border-pink-700',
    file: 'womens-health-tcm.csv'
  },
  { 
    id: 'stress-burnout', 
    name: 'Stress & Burnout', 
    nameHe: 'לחץ ושחיקה',
    icon: Leaf, 
    color: 'text-lime-600', 
    bgColor: 'bg-lime-50 dark:bg-lime-950/30', 
    borderColor: 'border-lime-300 dark:border-lime-700',
    file: 'work-stress-burnout.csv'
  },
  { 
    id: 'qa-professional', 
    name: 'Professional Q&A', 
    nameHe: 'שאלות מקצועיות',
    icon: FileText, 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-50 dark:bg-slate-950/30', 
    borderColor: 'border-slate-300 dark:border-slate-700',
    file: 'QA_Professional_Corrected_4Columns.csv'
  },
  { 
    id: 'acupuncture-points', 
    name: 'Acupuncture Points', 
    nameHe: 'נקודות דיקור',
    icon: Hand, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-50 dark:bg-amber-950/30', 
    borderColor: 'border-amber-300 dark:border-amber-700',
    file: 'body-figures-coordinates.csv'
  },
];

interface KnowledgeAssetTabsProps {
  activeAssets: string[];
  onAssetClick?: (assetId: string) => void;
  className?: string;
  showLabels?: boolean;
}

export function KnowledgeAssetTabs({ 
  activeAssets = [], 
  onAssetClick,
  className,
  showLabels = false
}: KnowledgeAssetTabsProps) {
  const [flashingAssets, setFlashingAssets] = useState<string[]>([]);

  // Flash active assets when they change
  useEffect(() => {
    if (activeAssets.length > 0) {
      setFlashingAssets(activeAssets);
      const timer = setTimeout(() => setFlashingAssets([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeAssets.join(',')]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("w-full", className)}>
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-3">
            {KNOWLEDGE_ASSETS.map((asset) => {
              const Icon = asset.icon;
              const isActive = activeAssets.includes(asset.id);
              const isFlashing = flashingAssets.includes(asset.id);

              return (
                <Tooltip key={asset.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onAssetClick?.(asset.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 min-w-[72px]',
                        'hover:scale-105 hover:shadow-md active:scale-95',
                        asset.bgColor,
                        isActive ? asset.borderColor : 'border-transparent',
                        isFlashing && 'animate-pulse ring-2 ring-offset-2 shadow-lg',
                        isFlashing && asset.color.replace('text-', 'ring-')
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shadow-sm',
                        isActive ? asset.bgColor : 'bg-muted/50',
                        isActive && 'ring-2 ring-offset-1',
                        isActive && asset.color.replace('text-', 'ring-'),
                        isFlashing && 'animate-bounce'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5 transition-all',
                          isActive ? asset.color : 'text-muted-foreground',
                          isFlashing && 'scale-125'
                        )} />
                      </div>
                      {showLabels && (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={cn(
                            'text-[10px] font-semibold text-center leading-tight max-w-[64px] line-clamp-2',
                            isActive ? asset.color : 'text-foreground'
                          )}>
                            {asset.name}
                          </span>
                          <span className={cn(
                            'text-[9px] text-center leading-tight max-w-[64px] truncate',
                            isActive ? asset.color : 'text-muted-foreground'
                          )} dir="rtl">
                            {asset.nameHe}
                          </span>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="text-center">
                      <p className="font-semibold">{asset.name}</p>
                      <p className="text-muted-foreground" dir="rtl">{asset.nameHe}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

// Helper to get asset info by id
export function getAssetById(id: string): KnowledgeAsset | undefined {
  return KNOWLEDGE_ASSETS.find(a => a.id === id);
}

// Get matching assets from AI response
export function detectActiveAssets(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];
  
  const keywords: Record<string, string[]> = {
    'treatment-planning': ['treatment plan', 'protocol', 'therapeutic approach'],
    'chief-complaints': ['chief complaint', 'main complaint', 'primary complaint'],
    'chronic-pain': ['chronic pain', 'pain management', 'persistent pain'],
    'allergies': ['allergy', 'allergies', 'allergic', 'sensitivity'],
    'diet-nutrition': ['diet', 'nutrition', 'food', 'eating'],
    'medications': ['medication', 'supplement', 'drug', 'herbal formula'],
    'pulse-reference': ['pulse', 'wrist pulse'],
    'diagnostics': ['diagnosis', 'diagnostic', 'pattern identification'],
    'digestive': ['digestive', 'digestion', 'stomach', 'intestine', 'spleen'],
    'weather-climate': ['weather', 'climate', 'seasonal', 'damp', 'cold', 'heat', 'wind'],
    'immune': ['immune', 'immunity', 'wei qi', 'defensive qi'],
    'mental-health': ['anxiety', 'depression', 'stress', 'shen', 'mental', 'emotional'],
    'constitutions': ['constitution', 'body type', 'qi deficiency', 'yang deficiency', 'yin deficiency'],
    'pediatric': ['pediatric', 'child', 'children', 'infant', 'baby'],
    'pulse': ['pulse diagnosis', 'pulse quality', 'slippery', 'wiry', 'thready'],
    'sports': ['sports', 'athletic', 'recovery', 'performance', 'injury'],
    'tongue': ['tongue', 'tongue coat', 'tongue body', 'pale tongue', 'red tongue'],
    'womens-health': ['menstrual', 'fertility', 'pregnancy', 'menopause', 'gynecological'],
    'stress-burnout': ['burnout', 'exhaustion', 'overwork', 'fatigue'],
    'qa-professional': ['professional', 'clinical', 'practitioner'],
    'acupuncture-points': ['acupuncture point', 'acupoint', 'LI4', 'ST36', 'SP6', 'LV3'],
  };

  for (const [assetId, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerText.includes(term))) {
      matched.push(assetId);
    }
  }

  return matched;
}
