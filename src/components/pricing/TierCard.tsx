import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierCardProps {
  name: string;
  nameHe: string;
  price: string;
  description: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
  onSelect: () => void;
  buttonText?: string;
}

export function TierCard({ 
  name, 
  nameHe, 
  price, 
  description, 
  features, 
  highlighted = false,
  onSelect,
  buttonText = 'בחר תוכנית'
}: TierCardProps) {
  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-300 hover:shadow-elevated',
      highlighted && 'border-gold shadow-gold scale-105 z-10'
    )}>
      {highlighted && (
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
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {price !== 'חינם' && <span className="text-muted-foreground mr-1">/ חודש</span>}
          {price !== 'חינם' && (
            <div className="text-sm text-muted-foreground mt-1">כולל מע״מ</div>
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
      
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
