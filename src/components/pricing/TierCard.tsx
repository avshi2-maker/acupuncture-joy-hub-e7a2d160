import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Info, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TierCardProps {
  name: string;
  nameHe: string;
  price: string;
  originalPrice?: string;
  priceRange?: string;
  queriesLimit?: string;
  tokensInfo?: string;
  tokensTooltip?: string;
  description: string;
  savings?: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
  bestValue?: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
  buttonText?: string;
  onCalculatorClick?: () => void;
}

export function TierCard({ 
  name, 
  nameHe, 
  price, 
  originalPrice,
  priceRange,
  queriesLimit,
  tokensInfo,
  tokensTooltip,
  description,
  savings,
  features, 
  highlighted = false,
  bestValue = false,
  isRecommended = false,
  onSelect,
  buttonText = 'בחר תוכנית',
  onCalculatorClick
}: TierCardProps) {
  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-500 hover:shadow-elevated',
      highlighted && 'border-gold shadow-gold scale-105 z-10',
      bestValue && 'border-emerald-500 shadow-emerald-500/20',
      isRecommended && 'ring-4 ring-gold/50 animate-pulse shadow-lg shadow-gold/30'
    )}>
      {bestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            הכי משתלם
          </span>
        </div>
      )}
      {highlighted && !bestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gold text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
            הכי פופולרי
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-2xl">{nameHe}</CardTitle>
        <CardDescription className="text-sm">{name}</CardDescription>
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-2">
            {originalPrice && (
              <span className="text-xl text-muted-foreground line-through">{originalPrice}</span>
            )}
            <span className="text-4xl font-bold text-foreground">{price}</span>
            {priceRange && <span className="text-muted-foreground">{priceRange}</span>}
          </div>
          {savings && (
            <div className="text-sm font-medium text-emerald-500 mt-1">
              {savings}
            </div>
          )}
          {queriesLimit && (
            <div className="text-sm font-medium text-jade mt-2 bg-jade/10 rounded-full px-3 py-1 inline-block">
              {queriesLimit}
            </div>
          )}
          {tokensInfo && (
            <TooltipProvider>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-full px-3 py-1">
                  {tokensInfo}
                </span>
                {tokensTooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-right">
                      <p>{tokensTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-jade shrink-0" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
              )}
              <span className={cn(
                'text-sm',
                !feature.included && 'text-muted-foreground/50'
              )}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <Button 
          onClick={onSelect}
          className={cn(
            'w-full',
            highlighted ? 'bg-gold hover:bg-gold/90' : ''
          )}
          variant={highlighted ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
        {onCalculatorClick && (
          <Button 
            onClick={onCalculatorClick}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground group"
          >
            <Calculator className="h-4 w-4 ml-2 group-hover:text-gold transition-colors" />
            נסה את המחשבון
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
