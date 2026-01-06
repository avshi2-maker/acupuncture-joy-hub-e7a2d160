import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PointData {
  code: string;
  name_english?: string;
  name_chinese?: string;
  name_pinyin?: string;
  meridian?: string;
  location?: string;
  indications?: string[];
  actions?: string[];
}

interface InteractivePointMarkerProps {
  point: PointData;
  x: number; // Percentage position (0-100)
  y: number; // Percentage position (0-100)
  isHighlighted?: boolean;
  isSelected?: boolean;
  isFallback?: boolean; // Debug: true if using fallback grid positioning
  showDebug?: boolean; // Show debug indicator
  onClick?: (point: PointData) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function InteractivePointMarker({
  point,
  x,
  y,
  isHighlighted = false,
  isSelected = false,
  isFallback = false,
  showDebug = false,
  onClick,
  size = 'md',
  showLabel = false
}: InteractivePointMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3 text-[8px]',
    md: 'w-5 h-5 text-[10px]',
    lg: 'w-7 h-7 text-xs'
  };

  const handleClick = () => {
    onClick?.(point);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'absolute rounded-full flex items-center justify-center font-bold transition-all duration-200 z-10',
            'hover:scale-125 hover:z-20 cursor-pointer',
            'ring-2 ring-offset-1 ring-offset-background',
            sizeClasses[size],
            // Debug mode: show fallback points differently
            showDebug && isFallback
              ? 'bg-orange-500 text-white ring-orange-400 border-2 border-dashed border-orange-300'
              : isHighlighted 
                ? 'bg-jade text-jade-foreground ring-jade animate-pulse shadow-lg shadow-jade/40' 
                : isSelected
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-accent text-accent-foreground ring-accent/50 hover:ring-primary'
          )}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={handleClick}
          title={`${point.code} - ${point.name_english || ''}${showDebug && isFallback ? ' (FALLBACK POSITION)' : ''}`}
        >
          {showLabel && size === 'lg' && (
            <span className="truncate max-w-[20px]">
              {point.code.replace(/[A-Za-z]+/, '')}
            </span>
          )}
          {showDebug && isFallback && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" side="right" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={isHighlighted ? 'bg-jade hover:bg-jade' : ''}>
              {point.code}
            </Badge>
            {point.meridian && (
              <span className="text-xs text-muted-foreground">{point.meridian}</span>
            )}
          </div>
          
          {point.name_english && (
            <div>
              <h4 className="font-semibold text-sm">{point.name_english}</h4>
              {(point.name_pinyin || point.name_chinese) && (
                <p className="text-xs text-muted-foreground">
                  {point.name_pinyin && <span>{point.name_pinyin}</span>}
                  {point.name_pinyin && point.name_chinese && <span> • </span>}
                  {point.name_chinese && <span>{point.name_chinese}</span>}
                </p>
              )}
            </div>
          )}

          {point.location && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-0.5">Location</h5>
              <p className="text-xs">{point.location}</p>
            </div>
          )}

          {point.indications && point.indications.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-0.5">Indications</h5>
              <ul className="text-xs list-disc list-inside">
                {point.indications.slice(0, 3).map((ind, i) => (
                  <li key={i} className="truncate">{ind}</li>
                ))}
                {point.indications.length > 3 && (
                  <li className="text-muted-foreground">+{point.indications.length - 3} more</li>
                )}
              </ul>
            </div>
          )}

          {point.actions && point.actions.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-0.5">Actions</h5>
              <div className="flex flex-wrap gap-1">
                {point.actions.slice(0, 3).map((action, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] py-0">
                    {action}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
