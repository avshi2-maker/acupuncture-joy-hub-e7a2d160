import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Heart, Brain, MessageCircle, Stethoscope, ChevronDown, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QAType = 'anxiety' | 'tcm-brain' | 'diagnostics' | 'general';

interface QATypeDropdownProps {
  onSelect: (type: QAType) => void;
  onReset?: () => void;
  isActive?: boolean;
  selectedType?: QAType | null;
  variant?: 'tile' | 'compact';
  triggerClassName?: string;
}

const qaOptions: Array<{
  type: QAType;
  label: string;
  labelHe: string;
  shortHe: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}> = [
  {
    type: 'anxiety',
    label: 'Anxiety Q&A',
    labelHe: 'שאלון חרדה',
    shortHe: 'חרדה',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    description: 'Mental health assessment',
  },
  {
    type: 'tcm-brain',
    label: 'TCM Brain',
    labelHe: 'מוח TCM',
    shortHe: 'מוח',
    icon: Brain,
    color: 'text-jade',
    bgColor: 'bg-jade/20',
    description: 'Ask TCM questions',
  },
  {
    type: 'diagnostics',
    label: 'Diagnostics',
    labelHe: 'אבחון',
    shortHe: 'אבחון',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Pattern diagnosis',
  },
  {
    type: 'general',
    label: 'General Q&A',
    labelHe: 'שאלות כלליות',
    shortHe: 'כללי',
    icon: MessageCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Open conversation',
  },
];

export function QATypeDropdown({
  onSelect,
  onReset,
  isActive,
  selectedType,
  variant = 'tile',
  triggerClassName,
}: QATypeDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = selectedType ? qaOptions.find((o) => o.type === selectedType) : null;
  const DisplayIcon = selectedOption?.icon || Sparkles;
  const displayColor = selectedOption?.color || (isActive ? 'text-jade' : 'text-muted-foreground');

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset?.();
  };

  const isTile = variant === 'tile';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isTile ? 'outline' : 'secondary'}
            size={isTile ? 'sm' : 'sm'}
            className={cn(
              isTile
                ? [
                    'h-auto py-1.5 px-2 flex flex-col items-center gap-0.5 min-w-[60px] md:min-w-[72px]',
                    'border-2 rounded-xl transition-all hover:shadow-md',
                    isActive || selectedType ? 'border-jade bg-jade/10 shadow-lg' : 'border-border',
                  ]
                : [
                    'gap-0.5 justify-start w-full',
                    'transition-all hover:opacity-90',
                  ],
              triggerClassName
            )}
          >
            {isTile ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedType || 'default'}
                    initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                    className={cn(
                      'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
                      'border-2 bg-background shadow-sm',
                      isActive || selectedType ? 'border-jade shadow-jade/30' : 'border-border'
                    )}
                  >
                    <DisplayIcon className={cn('h-5 w-5 md:h-6 md:w-6', displayColor)} />
                  </motion.div>
                </AnimatePresence>

                <div className="text-center">
                  <div className="flex items-center gap-0.5">
                    <motion.span
                      key={selectedOption?.label || 'Q&A'}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={cn('text-[9px] md:text-[10px] font-semibold truncate max-w-[54px]', displayColor)}
                    >
                      {selectedOption?.label || 'Q&A'}
                    </motion.span>
                    <ChevronDown
                      className={cn(
                        'h-2.5 w-2.5 text-muted-foreground shrink-0 transition-transform',
                        open && 'rotate-180'
                      )}
                    />
                  </div>
                  <motion.p
                    key={selectedOption?.labelHe || 'שאלות'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-[8px] md:text-[9px] text-muted-foreground truncate"
                    dir="rtl"
                  >
                    {selectedOption?.labelHe || 'שאלות'}
                  </motion.p>
                </div>
              </>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedType || 'default'}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-1"
                  >
                    <DisplayIcon className={cn('h-3 w-3 flex-shrink-0', displayColor)} />
                    <span className={cn('truncate', selectedOption ? displayColor : 'text-foreground')}>
                      {selectedOption?.shortHe || 'שאלות'}
                    </span>
                  </motion.span>
                </AnimatePresence>
                <ChevronDown
                  className={cn(
                    'ml-auto h-3 w-3 text-muted-foreground shrink-0 transition-transform',
                    open && 'rotate-180'
                  )}
                />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="w-56 bg-popover border shadow-lg z-50">
          <DropdownMenuLabel className="text-xs text-muted-foreground">בחר סוג שאלון / Select Q&A Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {qaOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            return (
              <DropdownMenuItem
                key={option.type}
                onClick={() => {
                  onSelect(option.type);
                  setOpen(false);
                }}
                className={cn('flex items-center gap-3 py-2 cursor-pointer transition-colors', isSelected && 'bg-jade/10')}
              >
                <motion.div
                  className={cn('w-8 h-8 rounded-full flex items-center justify-center bg-muted')}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={cn('h-4 w-4', option.color)} />
                </motion.div>
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', option.color)}>{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.labelHe}</p>
                </div>
                {isSelected && <div className="w-2 h-2 rounded-full bg-jade" />}
              </DropdownMenuItem>
            );
          })}

          {selectedType && onReset && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
                className="flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-destructive"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                  <X className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reset</p>
                  <p className="text-xs">איפוס בחירה</p>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AnimatePresence>
        {selectedType && onReset && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleReset}
            className={cn(
              'absolute -top-1 -right-1 w-4 h-4 rounded-full',
              'bg-destructive text-destructive-foreground',
              'flex items-center justify-center shadow-sm',
              'hover:bg-destructive/90 transition-colors z-10'
            )}
            title="Reset Q&A"
          >
            <X className="h-2.5 w-2.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
