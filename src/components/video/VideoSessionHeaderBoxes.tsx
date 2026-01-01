import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderBox {
  id: string;
  name: string;
  nameHe: string;
  icon: LucideIcon | string;
  color: string;
  borderColor: string;
  isActive?: boolean;
  tooltip?: string;
  onClick: () => void;
}

export interface BoxGroup {
  id: string;
  label?: string;
  boxes: HeaderBox[];
}

interface VideoSessionHeaderBoxesProps {
  boxes?: HeaderBox[];
  groups?: BoxGroup[];
}

function GroupSeparator() {
  return (
    <div className="flex items-center px-1">
      <div className="h-8 md:h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
    </div>
  );
}

function BoxButton({ box, index }: { box: HeaderBox; index: number }) {
  const isImageIcon = typeof box.icon === 'string';
  const Icon = !isImageIcon ? box.icon as LucideIcon : null;

  const button = (
    <motion.button
      onClick={box.onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex flex-col items-center gap-1 p-1.5 md:p-2 rounded-xl transition-all min-w-[60px] md:min-w-[72px]',
        'hover:shadow-md touch-manipulation',
        box.isActive 
          ? 'bg-jade/20 border-2 border-jade shadow-lg' 
          : 'bg-background/80 border-2 hover:border-jade/50',
        box.borderColor
      )}
    >
      {/* Circular Icon Container */}
      <div className={cn(
        'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
        'border-2 bg-background shadow-sm transition-all',
        box.isActive ? 'border-jade shadow-jade/30' : box.borderColor
      )}>
        {isImageIcon ? (
          <img 
            src={box.icon as string} 
            alt={box.name}
            className="w-6 h-6 md:w-7 md:h-7 object-contain"
          />
        ) : Icon ? (
          <Icon className={cn('h-5 w-5 md:h-6 md:w-6', box.color)} />
        ) : null}
      </div>
      
      {/* Label */}
      <div className="text-center">
        <p className={cn(
          'text-[9px] md:text-[10px] font-semibold leading-tight',
          box.isActive ? 'text-jade' : box.color
        )}>
          {box.name}
        </p>
        <p className="text-[8px] md:text-[9px] text-muted-foreground leading-tight" dir="rtl">
          {box.nameHe}
        </p>
      </div>
    </motion.button>
  );

  if (box.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] text-center">
          <p className="text-xs">{box.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export function VideoSessionHeaderBoxes({ boxes, groups }: VideoSessionHeaderBoxesProps) {
  // If groups are provided, render with separators
  if (groups && groups.length > 0) {
    return (
      <TooltipProvider delayDuration={300}>
        <div dir="ltr" className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {groups.map((group, groupIndex) => (
            <div key={group.id} className="flex items-center">
              {/* Separator before group (except first) */}
              {groupIndex > 0 && <GroupSeparator />}
              
              {/* Group boxes */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {group.boxes.map((box, boxIndex) => (
                  <BoxButton
                    key={box.id}
                    box={box}
                    index={groupIndex * 10 + boxIndex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  // Legacy: flat boxes array
  if (boxes && boxes.length > 0) {
    return (
      <TooltipProvider delayDuration={300}>
        <div dir="ltr" className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {boxes.map((box, index) => (
            <BoxButton key={box.id} box={box} index={index} />
          ))}
        </div>
      </TooltipProvider>
    );
  }

  return null;
}
