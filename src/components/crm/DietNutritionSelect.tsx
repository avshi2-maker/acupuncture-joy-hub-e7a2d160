import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, X, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

// Diet options organized by category
const dietOptions: Record<string, string[]> = {
  'Meal Pattern': [
    'Three regular meals per day',
    'Two meals per day (intermittent fasting)',
    '5-6 small meals per day (grazing)',
    'One meal per day (OMAD)',
    'Irregular eating times',
    'Skipping breakfast',
    'Large dinner, light breakfast/lunch',
    'Eating largest meal at lunch',
  ],
  'Dietary Approach': [
    'Standard Western diet',
    'Mediterranean diet',
    'Vegetarian diet',
    'Vegan diet',
    'Ketogenic diet',
    'Paleo diet',
    'Raw food diet',
    'Macrobiotic diet',
    'DASH diet (blood pressure)',
    'Carnivore diet',
    'Gluten-free diet',
    'Low FODMAP diet',
  ],
  'Grain Consumption': [
    'White rice daily',
    'Brown rice daily',
    'Wheat/bread products daily',
    'Oats regularly',
    'No grains (grain-free)',
  ],
  'Protein Source': [
    'Red meat 4+ times/week',
    'Poultry as main protein',
    'Fish/seafood regularly (3+ times/week)',
    'Legumes as primary protein',
    'Eggs daily',
    'Dairy products daily',
    'Protein supplements/powders',
  ],
  'Vegetable Intake': [
    '5+ servings vegetables daily',
    'Mostly cooked vegetables',
    'Mostly raw vegetables/salads',
    'Minimal vegetables (1-2 servings/day)',
  ],
  'Fruit Intake': [
    '3+ servings fruit daily',
    'Tropical fruits regularly',
    'Dried fruits regularly',
    'Low fruit intake (avoiding sugar)',
  ],
  'Beverage': [
    'Water as primary beverage (8+ cups)',
    'Coffee daily (1-3 cups)',
    'Coffee daily (4+ cups)',
    'Green tea daily',
    'Black tea daily',
    'Herbal teas regularly',
    'Alcohol regularly (daily or most days)',
    'Alcohol moderately (1-3 times/week)',
    'Sugary drinks/soda regularly',
    'Fruit juice daily',
    'Energy drinks regularly',
    'Milk/plant milk daily',
    'Smoothies regularly',
    'Bone broth regularly',
  ],
  'Eating Behavior': [
    'Eating slowly, chewing thoroughly',
    'Eating quickly, poor chewing',
    'Eating while distracted (TV, phone, work)',
    'Eating until very full',
    'Eating until 80% full (Hara Hachi Bu)',
    'Late night eating (after 8-9pm)',
    'Emotional eating',
    'Restrictive eating/dieting cycles',
  ],
  'Food Temperature': [
    'Mostly warm/cooked foods',
    'Cold/iced foods and drinks regularly',
    'Room temperature foods preferred',
  ],
  'Preparation Method': [
    'Steamed and boiled foods primarily',
    'Stir-fried foods regularly',
    'Deep-fried foods regularly',
    'Grilled/roasted foods frequently',
    'Slow-cooked soups and stews',
    'Microwaved meals regularly',
  ],
  'Flavor Preference': [
    'Sweet flavor dominant',
    'Salty flavor dominant',
    'Spicy/pungent foods regularly',
    'Sour flavor preference',
    'Bitter flavor foods',
  ],
  'Snacking': [
    'Frequent snacking throughout day',
    'No snacking between meals',
    'Nuts and seeds regularly',
    'Chips/crackers/processed snacks',
  ],
  'Sweet Foods': [
    'Dessert daily',
    'Refined sugar avoidance',
    'Natural sweeteners (honey, maple syrup)',
    'Artificial sweeteners use',
  ],
  'Processed Foods': [
    'Highly processed foods daily',
    'Mostly whole, unprocessed foods',
    'Fast food regularly (3+ times/week)',
    'Frozen meals regularly',
    'Home-cooked meals primarily',
  ],
  'Special Foods': [
    'Fermented foods regularly (kimchi, sauerkraut)',
    'Probiotic supplements',
    'Supplements and vitamins daily',
    'Protein bars/meal replacements',
    'Superfoods focus (chia, goji, spirulina)',
    'Organic foods exclusively',
  ],
  'Hydration': [
    'Adequate hydration (clear urine)',
    'Insufficient water intake',
    'Excessive water intake (water intoxication risk)',
  ],
  'Activity Level Context': [
    'Sedentary lifestyle (desk job, minimal exercise)',
    'Lightly active (1-3 days exercise/week)',
    'Moderately active (3-5 days exercise/week)',
    'Very active (6-7 days intense exercise/week)',
    'Physical labor job',
  ],
};

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
                {Object.entries(dietOptions).map(([category, options]) => (
                  <Collapsible
                    key={category}
                    open={expandedCategories.includes(category)}
                    onOpenChange={(open) => setCategoryOpen(category, open)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between px-2 h-8 font-medium text-sm"
                      >
                        <span>{category}</span>
                        {expandedCategories.includes(category) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-1 space-y-1">
                      {options.map((option) => (
                        <div
                          key={option}
                          className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleOption(option)}
                        >
                          <Checkbox
                            checked={value.includes(option)}
                            onCheckedChange={() => toggleOption(option)}
                            className="pointer-events-none"
                          />
                          <Label className="text-sm cursor-pointer flex-1">
                            {option}
                          </Label>
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
            {value.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-xs pr-1 gap-1"
              >
                {item}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
