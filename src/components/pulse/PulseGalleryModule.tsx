import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Activity,
  Sparkles,
  Filter,
  X,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { allPulseFindings } from '@/data/pulse-diagnosis-data';
import { useClinicalNexus, type ClinicalNexusResult } from '@/hooks/useClinicalNexus';
import { PULSE_CATEGORY_ICONS } from '@/constants/pulse-library';

// Extended type with category
type PulseFindingWithCategory = typeof allPulseFindings[number];

// TCM Pattern categories for filtering
const TCM_PATTERNS = [
  { id: 'all', label: 'הכל', labelEn: 'All Patterns' },
  { id: 'heat', label: 'חום', labelEn: 'Heat' },
  { id: 'cold', label: 'קור', labelEn: 'Cold' },
  { id: 'phlegm', label: 'ליחה', labelEn: 'Phlegm' },
  { id: 'dampness', label: 'לחות', labelEn: 'Dampness' },
  { id: 'deficiency', label: 'חוסר', labelEn: 'Deficiency' },
  { id: 'excess', label: 'עודף', labelEn: 'Excess' },
  { id: 'stagnation', label: 'סטגנציה', labelEn: 'Stagnation' },
];

interface PulseGalleryModuleProps {
  onPulseSelect?: (pulse: PulseFindingWithCategory, nexusResult: ClinicalNexusResult) => void;
  onAskBrain?: (pulse: PulseFindingWithCategory) => void;
  selectedPulseId?: string | null;
  className?: string;
  compact?: boolean;
  showHeader?: boolean;
}

/**
 * Reusable Pulse Gallery Module
 * Plug-and-Play component for embedding in sidebars, sheets, or panels
 * Features glassmorphism styling with jade accents
 */
export function PulseGalleryModule({
  onPulseSelect,
  onAskBrain,
  selectedPulseId,
  className,
  compact = false,
  showHeader = true,
}: PulseGalleryModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [expandedPulse, setExpandedPulse] = useState<PulseFindingWithCategory | null>(null);
  
  // Clinical Nexus hook for point mapping
  const { getPulseByFinding } = useClinicalNexus();

  // Filter pulse findings based on search and pattern
  const filteredFindings = useMemo(() => {
    return allPulseFindings.filter(finding => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        finding.finding.toLowerCase().includes(query) ||
        finding.chineseName.toLowerCase().includes(query) ||
        finding.description.toLowerCase().includes(query) ||
        finding.tcmPattern.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (selectedPattern === 'all') return true;

      const patternLower = finding.tcmPattern.toLowerCase();
      switch (selectedPattern) {
        case 'heat': return patternLower.includes('heat') || patternLower.includes('fire');
        case 'cold': return patternLower.includes('cold');
        case 'phlegm': return patternLower.includes('phlegm');
        case 'dampness': return patternLower.includes('damp');
        case 'deficiency': return patternLower.includes('deficiency');
        case 'excess': return patternLower.includes('excess');
        case 'stagnation': return patternLower.includes('stagnation') || patternLower.includes('stasis');
        default: return true;
      }
    });
  }, [searchQuery, selectedPattern]);

  // Group findings by category
  const groupedFindings = useMemo(() => {
    const groups: Record<string, typeof filteredFindings> = {};
    filteredFindings.forEach(finding => {
      if (!groups[finding.category]) {
        groups[finding.category] = [];
      }
      groups[finding.category].push(finding);
    });
    return groups;
  }, [filteredFindings]);

  const handlePulseClick = useCallback((pulse: PulseFindingWithCategory) => {
    const nexusResult = getPulseByFinding(pulse.finding);
    
    if (onPulseSelect) {
      onPulseSelect(pulse, nexusResult);
    }
    
    setExpandedPulse(expandedPulse?.finding === pulse.finding ? null : pulse);
  }, [getPulseByFinding, onPulseSelect, expandedPulse]);

  const getPulseIcon = (category: string) => {
    return PULSE_CATEGORY_ICONS[category] || '🔍';
  };

  const getTcmPatternArray = (pattern: string): string[] => {
    return pattern.split(',').map(p => p.trim()).filter(Boolean);
  };

  return (
    <div className={cn("flex flex-col h-full", className)} dir="rtl">
      {/* Header */}
      {showHeader && (
        <div className="flex-shrink-0 pb-3 border-b border-jade/10">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-jade" />
            <h2 className="font-bold text-lg">גלריית דופק</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredFindings.length}
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש דופק..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/40 backdrop-blur-sm border-jade/20"
            />
          </div>
          
          {/* Pattern Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {TCM_PATTERNS.map((pattern) => (
              <Badge
                key={pattern.id}
                variant={selectedPattern === pattern.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all text-xs px-2 py-0.5",
                  selectedPattern === pattern.id 
                    ? 'bg-jade hover:bg-jade/90 text-white' 
                    : 'hover:bg-jade/10 border-jade/30'
                )}
                onClick={() => setSelectedPattern(pattern.id)}
              >
                {pattern.label}
                {selectedPattern === pattern.id && pattern.id !== 'all' && (
                  <X 
                    className="h-2.5 w-2.5 mr-1 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPattern('all');
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Pulse Gallery */}
      <ScrollArea className="flex-1 mt-3">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">לא נמצאו דפוסי דופק</p>
          </div>
        ) : (
          <div className="space-y-4 pr-2">
            {Object.entries(groupedFindings).map(([category, findings]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                  <span className="text-lg">{getPulseIcon(category)}</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {category}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {findings.length}
                  </Badge>
                </div>
                
                {/* Pulse Cards */}
                <div className={cn(
                  "grid gap-2",
                  compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                )}>
                  <AnimatePresence>
                    {findings.map((pulse) => {
                      const isSelected = selectedPulseId === pulse.finding;
                      const isExpanded = expandedPulse?.finding === pulse.finding;
                      
                      return (
                        <motion.div
                          key={`${pulse.category}-${pulse.finding}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card 
                            className={cn(
                              // Glassmorphism styling
                              "bg-white/40 backdrop-blur-xl border shadow-lg",
                              "cursor-pointer transition-all duration-300",
                              "hover:shadow-xl hover:scale-[1.02]",
                              "border-l-4",
                              isSelected 
                                ? "border-l-gold border-gold/50 bg-gold/10 ring-2 ring-gold/30" 
                                : "border-l-jade/50 border-jade/10 hover:border-l-jade",
                              // Gold pulse animation when selected
                              isSelected && "animate-gold-pulse"
                            )}
                            onClick={() => handlePulseClick(pulse)}
                          >
                            <CardContent className={cn("p-3", compact && "p-2")}>
                              <div className="flex items-start justify-between mb-1.5">
                                <div className="flex-1">
                                  <h3 className={cn(
                                    "font-semibold text-sm transition-colors",
                                    isSelected ? "text-gold" : "text-foreground group-hover:text-jade"
                                  )}>
                                    {pulse.finding.split('(')[0].trim()}
                                  </h3>
                                  {/* Chinese name in Jade */}
                                  <p className="text-xs text-jade font-medium">
                                    {pulse.chineseName}
                                  </p>
                                </div>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center"
                                  >
                                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                                  </motion.div>
                                )}
                              </div>
                              
                              {/* Description */}
                              <p className={cn(
                                "text-xs text-muted-foreground mb-2",
                                compact ? "line-clamp-1" : "line-clamp-2"
                              )}>
                                {pulse.description}
                              </p>
                              
                              {/* TCM Patterns */}
                              <div className="flex flex-wrap gap-1">
                                {getTcmPatternArray(pulse.tcmPattern).slice(0, 2).map((pattern, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-[10px] px-1.5 py-0 bg-jade/5 border-jade/20"
                                  >
                                    {pattern}
                                  </Badge>
                                ))}
                                {getTcmPatternArray(pulse.tcmPattern).length > 2 && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    +{getTcmPatternArray(pulse.tcmPattern).length - 2}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-3 mt-3 border-t border-jade/10 space-y-2">
                                      <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                                          משמעות קלינית
                                        </p>
                                        <p className="text-xs">{pulse.clinicalSignificance}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                                          עקרונות טיפול
                                        </p>
                                        <p className="text-xs">{pulse.treatmentPrinciple}</p>
                                      </div>
                                      
                                      {/* Ask Brain Button */}
                                      {onAskBrain && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full mt-2 gap-2 text-xs border-jade/30 hover:bg-jade/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onAskBrain(pulse);
                                          }}
                                        >
                                          <Brain className="h-3.5 w-3.5" />
                                          שאל TCM Brain
                                        </Button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
