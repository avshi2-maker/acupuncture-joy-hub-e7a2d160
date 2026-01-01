import { useState, useMemo, memo } from 'react';
import { Check, ChevronDown, Search, X, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { pulseDiagnosisData, type PulseFinding } from '@/data/pulse-diagnosis-data';

interface PulseDiagnosisSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export const PulseDiagnosisSelect = memo(function PulseDiagnosisSelect({
  value = [],
  onChange,
  maxSelections = 5,
}: PulseDiagnosisSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return pulseDiagnosisData;
    
    const q = searchQuery.toLowerCase();
    return pulseDiagnosisData
      .map(cat => ({
        ...cat,
        findings: cat.findings.filter(f =>
          f.finding.toLowerCase().includes(q) ||
          f.chineseName.toLowerCase().includes(q) ||
          f.tcmPattern.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.findings.length > 0);
  }, [searchQuery]);

  const toggleOption = (finding: string) => {
    const currentValue = value || [];
    if (currentValue.includes(finding)) {
      onChange(currentValue.filter((v) => v !== finding));
    } else if (currentValue.length < maxSelections) {
      onChange([...currentValue, finding]);
    }
  };

  const removeOption = (finding: string) => {
    onChange(value.filter((v) => v !== finding));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getFindingData = (findingName: string): PulseFinding | undefined => {
    for (const category of pulseDiagnosisData) {
      const found = category.findings.find(f => f.finding === findingName);
      if (found) return found;
    }
    return undefined;
  };

  return (
    <div className={cn('space-y-2')}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {value.length === 0
                ? 'Select pulse findings...'
                : `${value.length} finding${value.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0 z-50 bg-popover" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pulse findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <Accordion type="multiple" defaultValue={filteredData.map(c => c.category)} className="w-full">
              {filteredData.map((category) => (
                <AccordionItem key={category.category} value={category.category} className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{category.category}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {category.findings.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-0.5 px-1">
                      {category.findings.map((finding) => {
                        const isSelected = value.includes(finding.finding);

                        return (
                          <button
                            key={finding.finding}
                            type="button"
                            onClick={() => toggleOption(finding.finding)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-sm",
                              "hover:bg-accent hover:text-accent-foreground",
                              isSelected && "bg-primary/10 border border-primary/30"
                            )}
                            title={`Description: ${finding.description}\nTCM Pattern: ${finding.tcmPattern}\nClinical Significance: ${finding.clinicalSignificance}\nTreatment: ${finding.treatmentPrinciple}`}
                          >
                            <div className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{finding.finding}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{finding.chineseName}</span>
                            </div>
                            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredData.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No pulse findings found matching "{searchQuery}"
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected items display */}
      {value.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              Selected Findings ({value.length}/{maxSelections})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {value.map((item) => {
              const data = getFindingData(item);

              return (
                <Badge
                  key={item}
                  variant="secondary"
                  className="text-xs pr-1 gap-1"
                  title={data ? `${data.chineseName}\nPattern: ${data.tcmPattern}\nTreatment: ${data.treatmentPrinciple}` : undefined}
                >
                  {item.length > 30 ? item.substring(0, 30) + '...' : item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    aria-label={`Remove pulse finding ${item}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select up to {maxSelections} pulse findings. Hover for TCM details.
      </p>
    </div>
  );
});
