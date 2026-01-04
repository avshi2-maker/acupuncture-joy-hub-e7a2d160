import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Info, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTier } from '@/hooks/useTier';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { cn } from '@/lib/utils';

// Token limits per tier (approximate based on queries)
const TIER_TOKEN_LIMITS: Record<string, number> = {
  trial: 50000,
  standard: 150000,
  premium: 600000,
};

// Query limits per tier (used for percentage calculation)
const TIER_QUERY_LIMITS: Record<string, number> = {
  trial: 500,
  standard: 1200,
  premium: 5000,
};

export function TokenUsageMeter() {
  const { tier } = useTier();
  const { usageData, isLoading } = useUsageTracking();

  const tokenLimit = TIER_TOKEN_LIMITS[tier || 'trial'] || 50000;
  const queryLimit = TIER_QUERY_LIMITS[tier || 'trial'] || 500;
  const queriesUsed = usageData?.currentUsed || 0;
  
  // Estimate tokens based on queries (avg 500 tokens per query)
  const tokensUsed = queriesUsed * 500;
  const percentage = Math.min((queriesUsed / queryLimit) * 100, 100);
  const tokensRemaining = Math.max(tokenLimit - tokensUsed, 0);

  const getStatusColor = () => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-amber-500';
    return 'text-jade';
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-jade';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const tierNameHe = {
    trial: 'ניסיון',
    standard: 'סטנדרט',
    premium: 'פרימיום',
  }[tier || 'trial'];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Coins className="h-5 w-5 text-gold" />
            שימוש בטוקנים
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-right">
                <p>טוקנים הם יחידות עיבוד AI. כל שאילתה ל-TCM Brain צורכת טוקנים. המכסה מתחדשת ב-1 לכל חודש.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">טוען נתונים...</div>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">תוכנית {tierNameHe}</span>
                <span className={cn('font-medium', getStatusColor())}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-3" />
                <div 
                  className={cn('absolute top-0 left-0 h-full rounded-full transition-all', getProgressColor())}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{formatNumber(tokensUsed)}</div>
                <div className="text-xs text-muted-foreground">נוצלו החודש</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className={cn('text-2xl font-bold', getStatusColor())}>{formatNumber(tokensRemaining)}</div>
                <div className="text-xs text-muted-foreground">נותרו</div>
              </div>
            </div>

            {/* Warning if near limit */}
            {percentage >= 75 && (
              <div className={cn(
                'flex items-center gap-2 text-sm p-2 rounded-lg',
                percentage >= 90 ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}>
                {percentage >= 90 ? (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {percentage >= 90 
                    ? 'מומלץ לשדרג תוכנית או לחכות לחידוש החודשי'
                    : 'אתם מתקרבים למגבלת הטוקנים החודשית'
                  }
                </span>
              </div>
            )}

            {/* Queries estimate */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              ≈ {Math.floor(tokensRemaining / 500)} שאילתות AI נותרו (בממוצע)
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
