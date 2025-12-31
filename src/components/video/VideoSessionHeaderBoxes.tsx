import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import bookOpenIcon from '@/assets/body-figures/head_front.png';

interface HeaderBox {
  id: string;
  name: string;
  nameHe: string;
  icon: LucideIcon | string;
  color: string;
  borderColor: string;
  isActive?: boolean;
  onClick: () => void;
}

interface VideoSessionHeaderBoxesProps {
  boxes: HeaderBox[];
}

export function VideoSessionHeaderBoxes({ boxes }: VideoSessionHeaderBoxesProps) {
  return (
    <div dir="ltr" className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {boxes.map((box, index) => {
        const isImageIcon = typeof box.icon === 'string';
        const Icon = !isImageIcon ? box.icon as LucideIcon : null;

        return (
          <motion.button
            key={box.id}
            onClick={box.onClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex flex-col items-center gap-1 p-1.5 md:p-2 rounded-xl transition-all min-w-[60px] md:min-w-[72px]',
              'hover:shadow-md',
              box.isActive 
                ? 'bg-jade/20 border-2 border-jade shadow-lg' 
                : 'bg-background/80 border-2 hover:border-jade/50',
              box.borderColor
            )}
          >
            {/* Circular Icon Container - Om symbol style */}
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
      })}
    </div>
  );
}
