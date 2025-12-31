import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Heart, Brain, MessageCircle, Stethoscope, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QAType = 'anxiety' | 'tcm-brain' | 'diagnostics' | 'general';

interface QATypeDropdownProps {
  onSelect: (type: QAType) => void;
  isActive?: boolean;
  selectedType?: QAType | null;
}

const qaOptions: Array<{
  type: QAType;
  label: string;
  labelHe: string;
  icon: React.ElementType;
  color: string;
  description: string;
}> = [
  {
    type: 'anxiety',
    label: 'Anxiety Q&A',
    labelHe: 'שאלון חרדה',
    icon: Heart,
    color: 'text-rose-600',
    description: 'Mental health assessment',
  },
  {
    type: 'tcm-brain',
    label: 'TCM Brain',
    labelHe: 'מוח TCM',
    icon: Brain,
    color: 'text-jade',
    description: 'Ask TCM questions',
  },
  {
    type: 'diagnostics',
    label: 'Diagnostics',
    labelHe: 'אבחון',
    icon: Stethoscope,
    color: 'text-blue-600',
    description: 'Pattern diagnosis',
  },
  {
    type: 'general',
    label: 'General Q&A',
    labelHe: 'שאלות כלליות',
    icon: MessageCircle,
    color: 'text-purple-600',
    description: 'Open conversation',
  },
];

export function QATypeDropdown({ onSelect, isActive, selectedType }: QATypeDropdownProps) {
  const [open, setOpen] = useState(false);
  
  // Get the selected option details
  const selectedOption = selectedType ? qaOptions.find(o => o.type === selectedType) : null;
  const DisplayIcon = selectedOption?.icon || Sparkles;
  const displayColor = selectedOption?.color || (isActive ? 'text-jade' : 'text-purple-600');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-auto py-1.5 px-2 flex flex-col items-center gap-0.5 min-w-[60px] md:min-w-[72px]',
            'border-2 rounded-xl transition-all',
            isActive ? 'border-jade bg-jade/10' : 'border-purple-300 hover:border-purple-400'
          )}
        >
          <div className={cn(
            'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
            'border-2 bg-background shadow-sm',
            isActive ? 'border-jade' : 'border-purple-300'
          )}>
            <DisplayIcon className={cn('h-5 w-5 md:h-6 md:w-6', displayColor)} />
          </div>
          <div className="text-center">
            <div className="flex items-center gap-0.5">
              <span className={cn(
                'text-[9px] md:text-[10px] font-semibold truncate max-w-[50px]',
                displayColor
              )}>
                {selectedOption?.label || 'Q&A'}
              </span>
              <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
            </div>
            <p className="text-[8px] md:text-[9px] text-muted-foreground truncate" dir="rtl">
              {selectedOption?.labelHe || 'שאלות'}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          בחר סוג שאלון / Select Q&A Type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {qaOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.type}
              onClick={() => {
                onSelect(option.type);
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'bg-muted'
              )}>
                <Icon className={cn('h-4 w-4', option.color)} />
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-medium', option.color)}>
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {option.labelHe}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
