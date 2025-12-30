import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { allergiesData, getAllergenDetails, getSeverityColor } from '@/data/allergies-data';

interface AllergiesSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export const AllergiesSelect = memo(function AllergiesSelect({ 
  value = [], 
  onChange, 
  className 
}: AllergiesSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const setCategoryOpen = useCallback((category: string, open: boolean) => {
    setExpandedCategories((prev) => {
      const isExpanded = prev.includes(category);
      if (open && !isExpanded) return [...prev, category];
      if (!open && isExpanded) return prev.filter((c) => c !== category);
      return prev;
    });
  }, []);

  const toggleOption = useCallback((option: string) => {
    const currentValue = value || [];
    onChange(
      currentValue.includes(option)
        ? currentValue.filter(v => v !== option)
        : [...currentValue, option]
    );
  }, [value, onChange]);

  const removeOption = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

  const clearAll = () => {
    onChange([]);
  };

  const minHeight = value.length === 0 ? 'auto' : Math.min(56 + value.length * 32, 200);

  return (
    <TooltipProvider>
      <div className={cn('space-y-2', className)}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-between text-left font-normal',
                !value.length && 'text-muted-foreground'
              )}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {value.length === 0
                  ? 'Select known allergies...'
                  : `${value.length} allerg${value.length > 1 ? 'ies' : 'y'} selected`}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2">
            <div className="border rounded-lg bg-background">
              <ScrollArea className="h-[300px]">
                <div className="p-3 space-y-2">
                  {allergiesData.map((category) => (
                    <Collapsible
                      key={category.category}
                      open={expandedCategories.includes(category.category)}
                      onOpenChange={(open) => setCategoryOpen(category.category, open)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between px-2 h-8 font-medium text-sm"
                        >
                          <span>{category.category}</span>
                          {expandedCategories.includes(category.category) ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 mt-1 space-y-1">
                        {category.allergens.map((allergen) => (
                          <div
                            key={allergen.name}
                            className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleOption(allergen.name)}
                          >
                            <Checkbox
                              checked={value.includes(allergen.name)}
                              onCheckedChange={() => toggleOption(allergen.name)}
                              className="pointer-events-none"
                            />
                            <Label className="text-sm cursor-pointer flex-1 flex items-center gap-2">
                              {allergen.name}
                              {allergen.severity.toLowerCase().includes('life-threatening') && (
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                              )}
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[320px] z-[100]">
                                <div className="space-y-1.5 text-xs">
                                  <p><strong>Western:</strong> {allergen.westernView}</p>
                                  <p><strong>TCM:</strong> {allergen.tcmPerspective}</p>
                                  <p><strong>Symptoms:</strong> {allergen.symptoms}</p>
                                  <p className="font-medium text-destructive">Severity: {allergen.severity}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Selected items display */}
        {value.length > 0 && (
          <div
            className="border rounded-lg p-3 bg-muted/30 transition-all duration-200"
            style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Selected Allergies ({value.length})
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
                const details = getAllergenDetails(item);
                const severityColor = details ? getSeverityColor(details.severity) : 'secondary';
                return (
                  <Tooltip key={item}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={severityColor as any}
                        className="text-xs pr-1 gap-1 cursor-pointer"
                      >
                        {details?.severity.toLowerCase().includes('life-threatening') && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {item.length > 25 ? item.substring(0, 25) + '...' : item}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(item);
                          }}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </TooltipTrigger>
                    {details && (
                      <TooltipContent className="max-w-[300px]">
                        <div className="space-y-1 text-xs">
                          <p><strong>Symptoms:</strong> {details.symptoms}</p>
                          <p><strong>TCM:</strong> {details.tcmPerspective}</p>
                          <p className="text-muted-foreground italic">Click × to remove</p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
});
