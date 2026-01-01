import { useState, useMemo, memo } from 'react';
import { Check, ChevronDown, Search, X, Pill, AlertTriangle, Info } from 'lucide-react';
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
import { medicationsByCategory, MedicationSupplement } from '@/data/medications-supplements-data';

interface MedicationsSupplementsSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export const MedicationsSupplementsSelect = memo(function MedicationsSupplementsSelect({
  value = [],
  onChange,
  maxSelections = 20,
}: MedicationsSupplementsSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredByCategory = useMemo(() => {
    if (!searchQuery.trim()) return medicationsByCategory;
    
    const q = searchQuery.toLowerCase();
    return Object.entries(medicationsByCategory).reduce((acc, [category, meds]) => {
      const filtered = meds.filter(m =>
        m.genericName.toLowerCase().includes(q) ||
        m.purpose.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q)
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    }, {} as Record<string, MedicationSupplement[]>);
  }, [searchQuery]);

  const toggleOption = (genericName: string) => {
    const currentValue = value || [];
    if (currentValue.includes(genericName)) {
      onChange(currentValue.filter((v) => v !== genericName));
    } else if (currentValue.length < maxSelections) {
      onChange([...currentValue, genericName]);
    }
  };

  const removeOption = (genericName: string) => {
    onChange(value.filter((v) => v !== genericName));
  };

  const clearAll = () => {
    onChange([]);
  };

  const hasWarning = (med: MedicationSupplement): boolean => {
    const warnings = ['AVOID', 'CAUTION', 'MAJOR', 'narrow therapeutic'];
    return warnings.some(w =>
      med.tcmConsiderations.toUpperCase().includes(w) ||
      med.commonSideEffects.toUpperCase().includes(w)
    );
  };

  const getCategoryColor = (category: string): string => {
    if (category.startsWith('Cardiovascular')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (category.startsWith('Diabetes')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (category.startsWith('Gastrointestinal')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (category.startsWith('Respiratory')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    if (category.startsWith('Pain')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    if (category.startsWith('Antibiotics')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (category.startsWith('Mental Health')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (category.startsWith('Hormones')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    if (category.startsWith('Supplement')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    return 'bg-muted text-muted-foreground';
  };

  const getMedicationInfo = (genericName: string): MedicationSupplement | undefined => {
    for (const meds of Object.values(medicationsByCategory)) {
      const found = meds.find(m => m.genericName === genericName);
      if (found) return found;
    }
    return undefined;
  };

  const categories = Object.keys(filteredByCategory);

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
              <Pill className="h-4 w-4 text-muted-foreground" />
              {value.length === 0
                ? 'Select medications & supplements...'
                : `${value.length} medication${value.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0 z-50 bg-popover" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications, supplements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[350px]">
            <Accordion type="multiple" defaultValue={categories} className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category} value={category} className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {filteredByCategory[category].length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-0.5 px-1">
                      {filteredByCategory[category].map((med) => {
                        const isSelected = value.includes(med.genericName);
                        const showWarning = hasWarning(med);

                        return (
                          <button
                            key={med.genericName}
                            type="button"
                            onClick={() => toggleOption(med.genericName)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-sm",
                              "hover:bg-accent hover:text-accent-foreground",
                              isSelected && "bg-primary/10 border border-primary/30"
                            )}
                            title={`Purpose: ${med.purpose}\nWestern: ${med.westernMechanism}\nTCM: ${med.tcmPerspective}\nSide Effects: ${med.commonSideEffects}`}
                          >
                            <div className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-2.5 w-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="font-medium truncate">{med.genericName}</span>
                              {showWarning && (
                                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
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
            {categories.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No medications found matching "{searchQuery}"
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
              Selected Medications ({value.length}/{maxSelections})
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
              const med = getMedicationInfo(item);
              const category = med?.category || '';
              const showWarning = med && hasWarning(med);

              return (
                <Badge
                  key={item}
                  variant="secondary"
                  className={cn("text-xs pr-1 gap-1", getCategoryColor(category))}
                  title={med ? `TCM: ${med.tcmPerspective}\nConsiderations: ${med.tcmConsiderations}` : undefined}
                >
                  {showWarning && <AlertTriangle className="h-3 w-3" />}
                  {item.length > 25 ? item.substring(0, 25) + '...' : item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    aria-label={`Remove medication ${item}`}
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
        Select up to {maxSelections} medications/supplements. Hover for details.
      </p>
    </div>
  );
});
