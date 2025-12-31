import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Stethoscope, Heart, Brain, Pill, Baby, Sparkles, 
  Sun, Dumbbell, Activity, Apple, BookOpen,
  Clipboard, Eye, Hand, Thermometer, Leaf, Users,
  FileText, Zap, Shield, LayoutGrid, List, ChevronDown
} from 'lucide-react';

export type AssetCategory = 'diagnostics' | 'treatment' | 'specialties' | 'lifestyle' | 'reference';

export interface KnowledgeAsset {
  id: string;
  name: string;
  nameHe: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  file: string;
  category: AssetCategory;
}

export const ASSET_CATEGORIES: Record<AssetCategory, { name: string; nameHe: string; color: string }> = {
  diagnostics: { name: 'Diagnostics', nameHe: 'אבחון', color: 'text-blue-600' },
  treatment: { name: 'Treatment', nameHe: 'טיפול', color: 'text-emerald-600' },
  specialties: { name: 'Specialties', nameHe: 'התמחויות', color: 'text-purple-600' },
  lifestyle: { name: 'Lifestyle', nameHe: 'אורח חיים', color: 'text-orange-600' },
  reference: { name: 'Reference', nameHe: 'מקורות', color: 'text-slate-600' },
};

export const KNOWLEDGE_ASSETS: KnowledgeAsset[] = [
  // Diagnostics Category
  { 
    id: 'chief-complaints', 
    name: 'Chief Complaints', 
    nameHe: 'תלונות עיקריות',
    icon: Stethoscope, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/30', 
    borderColor: 'border-blue-300 dark:border-blue-700',
    file: 'chief-complaints-tcm.csv',
    category: 'diagnostics'
  },
  { 
    id: 'diagnostics', 
    name: 'Diagnostics Pro', 
    nameHe: 'אבחון מקצועי',
    icon: BookOpen, 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30', 
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    file: 'diagnostics-professional.csv',
    category: 'diagnostics'
  },
  { 
    id: 'pulse-reference', 
    name: 'Pulse Reference', 
    nameHe: 'דופק',
    icon: Activity, 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-50 dark:bg-rose-950/30', 
    borderColor: 'border-rose-300 dark:border-rose-700',
    file: 'clinic-pulse-diagnosis-reference.csv',
    category: 'diagnostics'
  },
  { 
    id: 'pulse', 
    name: 'Pulse Diagnosis', 
    nameHe: 'אבחון דופק',
    icon: Heart, 
    color: 'text-red-500', 
    bgColor: 'bg-red-50 dark:bg-red-950/30', 
    borderColor: 'border-red-300 dark:border-red-700',
    file: 'pulse-diagnosis.csv',
    category: 'diagnostics'
  },
  { 
    id: 'tongue', 
    name: 'Tongue Diagnosis', 
    nameHe: 'אבחון לשון',
    icon: Eye, 
    color: 'text-fuchsia-600', 
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', 
    borderColor: 'border-fuchsia-300 dark:border-fuchsia-700',
    file: 'tongue-diagnosis.csv',
    category: 'diagnostics'
  },
  { 
    id: 'constitutions', 
    name: '9 Constitutions', 
    nameHe: '9 חוקות',
    icon: Users, 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30', 
    borderColor: 'border-cyan-300 dark:border-cyan-700',
    file: 'nine-constitutions-qa.csv',
    category: 'diagnostics'
  },

  // Treatment Category
  { 
    id: 'treatment-planning', 
    name: 'Treatment Planning', 
    nameHe: 'תכנון טיפול',
    icon: Clipboard, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', 
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    file: 'Treatment_Planning_Protocols_Professional_100plus.csv',
    category: 'treatment'
  },
  { 
    id: 'chronic-pain', 
    name: 'Chronic Pain', 
    nameHe: 'כאב כרוני',
    icon: Zap, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50 dark:bg-red-950/30', 
    borderColor: 'border-red-300 dark:border-red-700',
    file: 'chronic-pain-management.csv',
    category: 'treatment'
  },
  { 
    id: 'acupuncture-points', 
    name: 'Acupuncture Points', 
    nameHe: 'נקודות דיקור',
    icon: Hand, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-50 dark:bg-amber-950/30', 
    borderColor: 'border-amber-300 dark:border-amber-700',
    file: 'body-figures-coordinates.csv',
    category: 'treatment'
  },
  { 
    id: 'medications', 
    name: 'Medications', 
    nameHe: 'תרופות',
    icon: Pill, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50 dark:bg-purple-950/30', 
    borderColor: 'border-purple-300 dark:border-purple-700',
    file: 'clinic-medications-supplements-intake.csv',
    category: 'treatment'
  },

  // Specialties Category
  { 
    id: 'womens-health', 
    name: "Women's Health", 
    nameHe: 'בריאות האישה',
    icon: Sparkles, 
    color: 'text-pink-500', 
    bgColor: 'bg-pink-50 dark:bg-pink-950/30', 
    borderColor: 'border-pink-300 dark:border-pink-700',
    file: 'womens-health-tcm.csv',
    category: 'specialties'
  },
  { 
    id: 'pediatric', 
    name: 'Pediatric', 
    nameHe: 'ילדים',
    icon: Baby, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50 dark:bg-pink-950/30', 
    borderColor: 'border-pink-300 dark:border-pink-700',
    file: 'pediatric-acupuncture.csv',
    category: 'specialties'
  },
  { 
    id: 'mental-health', 
    name: 'Mental Health', 
    nameHe: 'בריאות הנפש',
    icon: Brain, 
    color: 'text-violet-600', 
    bgColor: 'bg-violet-50 dark:bg-violet-950/30', 
    borderColor: 'border-violet-300 dark:border-violet-700',
    file: 'mental-health-tcm.csv',
    category: 'specialties'
  },
  { 
    id: 'digestive', 
    name: 'Digestive', 
    nameHe: 'עיכול',
    icon: Thermometer, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 dark:bg-orange-950/30', 
    borderColor: 'border-orange-300 dark:border-orange-700',
    file: 'digestive-disorders.csv',
    category: 'specialties'
  },
  { 
    id: 'sports', 
    name: 'Sports & Recovery', 
    nameHe: 'ספורט',
    icon: Dumbbell, 
    color: 'text-sky-600', 
    bgColor: 'bg-sky-50 dark:bg-sky-950/30', 
    borderColor: 'border-sky-300 dark:border-sky-700',
    file: 'sport-performance-recovery.csv',
    category: 'specialties'
  },
  { 
    id: 'immune', 
    name: 'Immune System', 
    nameHe: 'מערכת חיסון',
    icon: Shield, 
    color: 'text-teal-600', 
    bgColor: 'bg-teal-50 dark:bg-teal-950/30', 
    borderColor: 'border-teal-300 dark:border-teal-700',
    file: 'immune-resilience.csv',
    category: 'specialties'
  },

  // Lifestyle Category
  { 
    id: 'diet-nutrition', 
    name: 'Diet & Nutrition', 
    nameHe: 'תזונה',
    icon: Apple, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 dark:bg-green-950/30', 
    borderColor: 'border-green-300 dark:border-green-700',
    file: 'clinic-diet-nutrition-intake-form.csv',
    category: 'lifestyle'
  },
  { 
    id: 'stress-burnout', 
    name: 'Stress & Burnout', 
    nameHe: 'לחץ ושחיקה',
    icon: Leaf, 
    color: 'text-lime-600', 
    bgColor: 'bg-lime-50 dark:bg-lime-950/30', 
    borderColor: 'border-lime-300 dark:border-lime-700',
    file: 'work-stress-burnout.csv',
    category: 'lifestyle'
  },
  { 
    id: 'weather-climate', 
    name: 'Weather & Climate', 
    nameHe: 'מזג אוויר',
    icon: Sun, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', 
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    file: 'extreme-weather-climate.csv',
    category: 'lifestyle'
  },

  // Reference Category
  { 
    id: 'allergies', 
    name: 'Allergies', 
    nameHe: 'אלרגיות',
    icon: Shield, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 dark:bg-amber-950/30', 
    borderColor: 'border-amber-300 dark:border-amber-700',
    file: 'clinic-allergies-intake-form.csv',
    category: 'reference'
  },
  { 
    id: 'qa-professional', 
    name: 'Professional Q&A', 
    nameHe: 'שאלות מקצועיות',
    icon: FileText, 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-50 dark:bg-slate-950/30', 
    borderColor: 'border-slate-300 dark:border-slate-700',
    file: 'QA_Professional_Corrected_4Columns.csv',
    category: 'reference'
  },
];

interface KnowledgeAssetTabsProps {
  activeAssets: string[];
  onAssetClick?: (assetId: string) => void;
  className?: string;
  showLabels?: boolean;
  defaultView?: 'scroll' | 'grid';
}

// Single asset card component
function AssetCard({ 
  asset, 
  isActive, 
  isFlashing, 
  showLabels, 
  onClick,
  compact = false
}: { 
  asset: KnowledgeAsset; 
  isActive: boolean; 
  isFlashing: boolean; 
  showLabels: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const Icon = asset.icon;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-xl border-2 transition-all duration-300',
            'hover:scale-105 hover:shadow-md active:scale-95',
            compact ? 'p-2 min-w-[64px]' : 'p-2.5 min-w-[72px]',
            asset.bgColor,
            isActive ? asset.borderColor : 'border-transparent',
            isFlashing && 'animate-pulse ring-2 ring-offset-2 shadow-lg',
            isFlashing && asset.color.replace('text-', 'ring-')
          )}
        >
          <div className={cn(
            'rounded-full flex items-center justify-center shadow-sm',
            compact ? 'w-8 h-8' : 'w-10 h-10',
            isActive ? asset.bgColor : 'bg-muted/50',
            isActive && 'ring-2 ring-offset-1',
            isActive && asset.color.replace('text-', 'ring-'),
            isFlashing && 'animate-bounce'
          )}>
            <Icon className={cn(
              'transition-all',
              compact ? 'h-4 w-4' : 'h-5 w-5',
              isActive ? asset.color : 'text-muted-foreground',
              isFlashing && 'scale-125'
            )} />
          </div>
          {showLabels && (
            <div className="flex flex-col items-center gap-0.5">
              <span className={cn(
                'font-semibold text-center leading-tight line-clamp-2',
                compact ? 'text-[9px] max-w-[56px]' : 'text-[10px] max-w-[64px]',
                isActive ? asset.color : 'text-foreground'
              )}>
                {asset.name}
              </span>
              <span className={cn(
                'text-center leading-tight truncate',
                compact ? 'text-[8px] max-w-[56px]' : 'text-[9px] max-w-[64px]',
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
}

export function KnowledgeAssetTabs({ 
  activeAssets = [], 
  onAssetClick,
  className,
  showLabels = false,
  defaultView = 'scroll'
}: KnowledgeAssetTabsProps) {
  const [flashingAssets, setFlashingAssets] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'scroll' | 'grid'>(defaultView);
  const [openCategories, setOpenCategories] = useState<AssetCategory[]>(['diagnostics', 'treatment', 'specialties', 'lifestyle', 'reference']);

  // Flash active assets when they change
  useEffect(() => {
    if (activeAssets.length > 0) {
      setFlashingAssets(activeAssets);
      const timer = setTimeout(() => setFlashingAssets([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeAssets.join(',')]);

  const toggleCategory = (cat: AssetCategory) => {
    setOpenCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const assetsByCategory = KNOWLEDGE_ASSETS.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<AssetCategory, KnowledgeAsset[]>);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("w-full", className)}>
        {/* View Toggle */}
        <div className="flex items-center justify-end gap-1 px-3 py-1 border-b">
          <Button
            variant={viewMode === 'scroll' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('scroll')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
        </div>

        {viewMode === 'scroll' ? (
          // Horizontal Scroll View
          <ScrollArea className="w-full">
            <div className="flex gap-2 p-3">
              {KNOWLEDGE_ASSETS.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isActive={activeAssets.includes(asset.id)}
                  isFlashing={flashingAssets.includes(asset.id)}
                  showLabels={showLabels}
                  onClick={() => onAssetClick?.(asset.id)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          // Grid View with Categories
          <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
            {(Object.keys(ASSET_CATEGORIES) as AssetCategory[]).map((category) => {
              const catInfo = ASSET_CATEGORIES[category];
              const assets = assetsByCategory[category] || [];
              const activeInCategory = assets.filter(a => activeAssets.includes(a.id)).length;
              
              return (
                <Collapsible 
                  key={category} 
                  open={openCategories.includes(category)}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", catInfo.color)}>
                        {catInfo.name}
                      </span>
                      <span className="text-xs text-muted-foreground" dir="rtl">
                        {catInfo.nameHe}
                      </span>
                      {activeInCategory > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-jade/20 text-jade">
                          {activeInCategory} active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{assets.length}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform text-muted-foreground",
                        openCategories.includes(category) && "rotate-180"
                      )} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 pt-2">
                      {assets.map((asset) => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          isActive={activeAssets.includes(asset.id)}
                          isFlashing={flashingAssets.includes(asset.id)}
                          showLabels={showLabels}
                          onClick={() => onAssetClick?.(asset.id)}
                          compact
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
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
