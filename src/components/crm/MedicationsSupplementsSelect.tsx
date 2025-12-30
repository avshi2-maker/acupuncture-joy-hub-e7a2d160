import React, { useState } from 'react';
import { Check, ChevronDown, Pill, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { medicationsSupplementsData, medicationsByCategory, MedicationSupplement } from '@/data/medications-supplements-data';
import { cn } from '@/lib/utils';

interface MedicationsSupplementsSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export function MedicationsSupplementsSelect({ 
  value, 
  onChange, 
  maxSelections = 20 
}: MedicationsSupplementsSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (genericName: string) => {
    if (value.includes(genericName)) {
      onChange(value.filter(v => v !== genericName));
    } else if (value.length < maxSelections) {
      onChange([...value, genericName]);
    }
  };

  const handleRemove = (genericName: string) => {
    onChange(value.filter(v => v !== genericName));
  };

  const getMedicationInfo = (genericName: string): MedicationSupplement | undefined => {
    return medicationsSupplementsData.find(m => m.genericName === genericName);
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

  const hasWarning = (med: MedicationSupplement): boolean => {
    const warnings = ['AVOID', 'CAUTION', 'MAJOR', 'narrow therapeutic'];
    return warnings.some(w => 
      med.tcmConsiderations.toUpperCase().includes(w) || 
      med.commonSideEffects.toUpperCase().includes(w)
    );
  };

  // Filter medications based on search
  const filteredByCategory = Object.entries(medicationsByCategory).reduce((acc, [category, meds]) => {
    const filtered = meds.filter(m => 
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, MedicationSupplement[]>);

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <span className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-muted-foreground" />
              {value.length === 0 
                ? "Select current medications & supplements..." 
                : `${value.length} medication${value.length > 1 ? 's' : ''} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search medications, supplements..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No medication or supplement found.</CommandEmpty>
              <ScrollArea className="h-[350px]">
                {Object.entries(filteredByCategory).map(([category, meds]) => (
                  <CommandGroup key={category} heading={category}>
                    {meds.map((med) => (
                      <TooltipProvider key={med.genericName} delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CommandItem
                              value={med.genericName}
                              onSelect={() => handleSelect(med.genericName)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-sm border",
                                value.includes(med.genericName)
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground/30"
                              )}>
                                {value.includes(med.genericName) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="flex-1 truncate">{med.genericName}</span>
                              {hasWarning(med) && (
                                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
                              <Info className="h-3 w-3 text-muted-foreground shrink-0" />
                            </CommandItem>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-sm p-3 space-y-2">
                            <div>
                              <p className="font-semibold text-sm">{med.genericName}</p>
                              <p className="text-xs text-muted-foreground">{med.purpose}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Western:</p>
                              <p className="text-xs">{med.westernMechanism}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">TCM Perspective:</p>
                              <p className="text-xs">{med.tcmPerspective}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-red-600 dark:text-red-400">Side Effects:</p>
                              <p className="text-xs">{med.commonSideEffects}</p>
                            </div>
                            {hasWarning(med) && (
                              <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">⚠️ TCM Considerations:</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">{med.tcmConsiderations}</p>
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </CommandGroup>
                ))}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Medications Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(genericName => {
            const med = getMedicationInfo(genericName);
            const category = med?.category || '';
            return (
              <TooltipProvider key={genericName} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "flex items-center gap-1 pr-1 cursor-help",
                        getCategoryColor(category)
                      )}
                    >
                      <span className="truncate max-w-[180px]">{genericName}</span>
                      {med && hasWarning(med) && (
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(genericName);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </TooltipTrigger>
                  {med && (
                    <TooltipContent side="top" className="max-w-sm p-3 space-y-2">
                      <div>
                        <p className="font-semibold text-sm">{med.genericName}</p>
                        <p className="text-xs text-muted-foreground">{med.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">TCM Perspective:</p>
                        <p className="text-xs">{med.tcmPerspective}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">TCM Considerations:</p>
                        <p className="text-xs">{med.tcmConsiderations}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select up to {maxSelections} medications/supplements. Hover for Western & TCM details.
      </p>
    </div>
  );
}
