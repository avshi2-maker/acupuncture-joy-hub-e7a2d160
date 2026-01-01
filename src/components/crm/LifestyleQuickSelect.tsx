import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronDown, Check, Moon, Brain, Activity, Mic } from 'lucide-react';
import { VoiceInput } from './VoiceInputFields';

interface OptionItem {
  value: string;
  label: string;
  description?: string;
}

interface LifestyleQuickSelectProps {
  type: 'sleep' | 'stress' | 'exercise';
  value?: string;
  onValueChange: (value: string) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

const typeConfig = {
  sleep: {
    label: 'Sleep Quality',
    icon: Moon,
    options: [
      { value: 'excellent', label: 'Excellent', description: '7-9 hours, restful, wake refreshed' },
      { value: 'good', label: 'Good', description: '6-7 hours, mostly restful' },
      { value: 'fair', label: 'Fair', description: '5-6 hours, some disturbances' },
      { value: 'poor', label: 'Poor', description: 'Less than 5 hours, frequent waking' },
    ],
    placeholder: 'Sleep notes (insomnia, dreams, wake times...)',
  },
  stress: {
    label: 'Stress Level',
    icon: Brain,
    options: [
      { value: 'low', label: 'Low', description: 'Calm, relaxed, manageable' },
      { value: 'moderate', label: 'Moderate', description: 'Some tension, coping well' },
      { value: 'high', label: 'High', description: 'Significant stress, affecting daily life' },
      { value: 'severe', label: 'Severe', description: 'Overwhelming, difficulty functioning' },
    ],
    placeholder: 'Stress sources (work, family, health...)',
  },
  exercise: {
    label: 'Exercise Frequency',
    icon: Activity,
    options: [
      { value: 'daily', label: 'Daily', description: 'Exercise every day or most days' },
      { value: 'weekly', label: 'Weekly', description: '2-4 times per week' },
      { value: 'occasionally', label: 'Occasionally', description: 'Once a week or less' },
      { value: 'rarely', label: 'Rarely', description: 'Few times a month' },
      { value: 'never', label: 'Never', description: 'No regular exercise' },
    ],
    placeholder: 'Exercise types (walking, yoga, gym...)',
  },
};

export function LifestyleQuickSelect({ 
  type, 
  value, 
  onValueChange, 
  notes = '', 
  onNotesChange 
}: LifestyleQuickSelectProps) {
  const [open, setOpen] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;
  
  const selectedOption = config.options.find(opt => opt.value === value);

  const getColorClasses = (optValue: string, isSelected: boolean) => {
    if (!isSelected) return 'hover:bg-muted';
    
    if (type === 'sleep') {
      if (optValue === 'excellent') return 'bg-green-100 dark:bg-green-900/40 border-green-300';
      if (optValue === 'good') return 'bg-blue-100 dark:bg-blue-900/40 border-blue-300';
      if (optValue === 'fair') return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300';
      return 'bg-red-100 dark:bg-red-900/40 border-red-300';
    }
    
    if (type === 'stress') {
      if (optValue === 'low') return 'bg-green-100 dark:bg-green-900/40 border-green-300';
      if (optValue === 'moderate') return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300';
      if (optValue === 'high') return 'bg-orange-100 dark:bg-orange-900/40 border-orange-300';
      return 'bg-red-100 dark:bg-red-900/40 border-red-300';
    }
    
    if (type === 'exercise') {
      if (optValue === 'daily') return 'bg-green-100 dark:bg-green-900/40 border-green-300';
      if (optValue === 'weekly') return 'bg-blue-100 dark:bg-blue-900/40 border-blue-300';
      if (optValue === 'occasionally') return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300';
      return 'bg-orange-100 dark:bg-orange-900/40 border-orange-300';
    }
    
    return 'bg-jade/20';
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              {selectedOption ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedOption.label}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {selectedOption.description}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select {config.label.toLowerCase()}...</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0 bg-background border shadow-lg z-50" align="start">
          <div className="p-3 border-b bg-muted/30">
            <p className="text-sm font-medium">{config.label}</p>
          </div>
          
          <RadioGroup
            value={value}
            onValueChange={(newValue) => {
              onValueChange(newValue);
              setOpen(false);
            }}
            className="p-2 space-y-1"
          >
            {config.options.map((option) => {
              const isSelected = value === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${getColorClasses(option.value, isSelected)}`}
                >
                  <RadioGroupItem value={option.value} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-jade" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </PopoverContent>
      </Popover>
      
      {/* Voice-enabled notes input */}
      {onNotesChange && (
        <VoiceInput
          placeholder={config.placeholder}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="border-dashed"
        />
      )}
    </div>
  );
}
