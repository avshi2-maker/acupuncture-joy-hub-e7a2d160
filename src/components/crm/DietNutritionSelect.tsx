import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { ChevronDown, ChevronUp, X, Utensils, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dietNutritionData, getDietHabitDetails } from '@/data/diet-nutrition-data';

interface DietNutritionSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export const DietNutritionSelect = memo(function DietNutritionSelect({ 
  value = [], 
  onChange, 
  className 
}: DietNutritionSelectProps) {
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

  // Calculate dynamic height based on selections
  const minHeight = value.length === 0 ? 'auto' : Math.min(56 + value.length * 32, 200);

  return (
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
                <Utensils className="h-4 w-4" />
                {value.length === 0
                  ? 'Select dietary habits...'
                  : `${value.length} habit${value.length > 1 ? 's' : ''} selected`}
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
                  {dietNutritionData.map((category) => (
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
                        {category.habits.map((habit) => (
                          <div
                            key={habit.habit}
                            className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleOption(habit.habit)}
                          >
                            <Checkbox
                              checked={value.includes(habit.habit)}
                              onCheckedChange={() => toggleOption(habit.habit)}
                              className="pointer-events-none"
                            />
                            <Label className="text-sm cursor-pointer flex-1">
                              {habit.habit}
                            </Label>
                            <button
                              type="button"
                              className="shrink-0 cursor-help text-muted-foreground hover:text-foreground transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title={[
                                `Western: ${habit.westernPerspective}`,
                                `TCM: ${habit.tcmPerspective}`,
                                `Calories: ${habit.estimatedCalories}`,
                              ].join('\n')}
                              aria-label={`Diet habit info: ${habit.habit}`}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
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

        {/* Selected items display - expands based on count */}
        {value.length > 0 && (
          <div
            className="border rounded-lg p-3 bg-muted/30 transition-all duration-200"
            style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Selected ({value.length})
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
                const details = getDietHabitDetails(item);
                return (
                  <span
                    key={item}
                    className="inline-flex"
                    title={
                      details
                        ? [`TCM: ${details.tcmPerspective}`, 'Click × to remove'].join('\n')
                        : undefined
                    }
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs pr-1 gap-1 cursor-pointer"
                    >
                      {item.length > 35 ? item.substring(0, 35) + '...' : item}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(item);
                        }}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                        aria-label={`Remove diet habit ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </span>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
});
