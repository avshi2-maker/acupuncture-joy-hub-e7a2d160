import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SessionHeaderBox {
  id: string;
  name: string;
  nameHe: string;
  icon: LucideIcon | string;
  color: string;
  borderColor: string;
  isActive?: boolean;
  badge?: string | number;
  tooltip?: string;
  onClick: () => void;
}

export interface BoxGroup {
  id: string;
  label?: string;
  boxes: SessionHeaderBox[];
}

interface SessionHeaderBoxesProps {
  boxes?: SessionHeaderBox[];
  groups?: BoxGroup[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const sizeConfig = {
  sm: {
    container: 'min-w-[56px] p-1',
    iconWrapper: 'w-8 h-8',
    icon: 'h-4 w-4',
    labelEn: 'text-[8px]',
    labelHe: 'text-[7px]',
  },
  md: {
    container: 'min-w-[60px] md:min-w-[72px] p-1.5 md:p-2',
    iconWrapper: 'w-10 h-10 md:w-12 md:h-12',
    icon: 'h-5 w-5 md:h-6 md:w-6',
    labelEn: 'text-[9px] md:text-[10px]',
    labelHe: 'text-[8px] md:text-[9px]',
  },
  lg: {
    container: 'min-w-[80px] p-2 md:p-3',
    iconWrapper: 'w-12 h-12 md:w-14 md:h-14',
    icon: 'h-6 w-6 md:h-7 md:w-7',
    labelEn: 'text-[10px] md:text-xs',
    labelHe: 'text-[9px] md:text-[10px]',
  },
};

function BoxButton({ 
  box, 
  index, 
  config, 
  showLabels 
}: { 
  box: SessionHeaderBox; 
  index: number; 
  config: typeof sizeConfig.md; 
  showLabels: boolean;
}) {
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
        'relative flex flex-col items-center gap-1 rounded-xl transition-all',
        'hover:shadow-md touch-manipulation',
        config.container,
        box.isActive 
          ? 'bg-jade/20 border-2 border-jade shadow-lg' 
          : 'bg-background/80 border-2 hover:border-jade/50',
        box.borderColor
      )}
    >
      {/* Badge */}
      {box.badge && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold px-1">
          {box.badge}
        </span>
      )}

      {/* Circular Icon Container */}
      <div className={cn(
        'rounded-full flex items-center justify-center',
        'border-2 bg-background shadow-sm transition-all',
        config.iconWrapper,
        box.isActive ? 'border-jade shadow-jade/30' : box.borderColor
      )}>
        {isImageIcon ? (
          <img 
            src={box.icon as string} 
            alt={box.name}
            className={cn(config.icon, 'object-contain')}
          />
        ) : Icon ? (
          <Icon className={cn(config.icon, box.color)} />
        ) : null}
      </div>
      
      {/* Labels */}
      {showLabels && (
        <div className="text-center">
          <p className={cn(
            'font-semibold leading-tight',
            config.labelEn,
            box.isActive ? 'text-jade' : box.color
          )}>
            {box.name}
          </p>
          <p className={cn('text-muted-foreground leading-tight', config.labelHe)} dir="rtl">
            {box.nameHe}
          </p>
        </div>
      )}
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

function GroupSeparator() {
  return (
    <div className="flex items-center px-1">
      <div className="h-8 md:h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
    </div>
  );
}

export function SessionHeaderBoxes({ 
  boxes,
  groups,
  size = 'md',
  showLabels = true 
}: SessionHeaderBoxesProps) {
  const config = sizeConfig[size];

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
              <div className="flex items-center gap-1 md:gap-2">
                {group.boxes.map((box, boxIndex) => (
                  <BoxButton
                    key={box.id}
                    box={box}
                    index={groupIndex * 10 + boxIndex}
                    config={config}
                    showLabels={showLabels}
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
            <BoxButton
              key={box.id}
              box={box}
              index={index}
              config={config}
              showLabels={showLabels}
            />
          ))}
        </div>
      </TooltipProvider>
    );
  }

  return null;
}
