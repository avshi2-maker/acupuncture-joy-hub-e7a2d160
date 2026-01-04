import { useState } from 'react';
import { Zap, TrendingUp, ChevronDown, Sparkles, MessageCircle, Stethoscope, Leaf, FileText, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useTier } from '@/hooks/useTier';
import { useNavigate } from 'react-router-dom';

export function HeaderUsageBadge() {
  const navigate = useNavigate();
  const { usageData, isLoading } = useUsageTracking();
  const { tier } = useTier();
  const [open, setOpen] = useState(false);

  if (isLoading || !usageData) {
    return (
      <Badge variant="outline" className="h-7 px-2 gap-1 animate-pulse bg-muted">
        <Zap className="h-3 w-3" />
        <span className="text-xs">...</span>
      </Badge>
    );
  }

  const percentage = Math.round((usageData.currentUsed / usageData.tierLimit) * 100);
  const remaining = usageData.tierLimit - usageData.currentUsed;
  const isLow = percentage >= 75;
  const isCritical = percentage >= 90;

  // Tier display names
  const tierNames: Record<string, string> = {
    trial: 'ניסיון',
    standard: 'סטנדרט',
    premium: 'פרימיום',
  };

  // Real usage breakdown from database
  const breakdown = usageData.breakdown;
  const totalBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
  
  const usageBreakdown = [
    { type: 'chat', label: 'צ׳אט AI', icon: MessageCircle, count: breakdown.chat, color: 'text-blue-500' },
    { type: 'diagnosis', label: 'אבחון', icon: Stethoscope, count: breakdown.diagnosis, color: 'text-jade' },
    { type: 'treatment', label: 'טיפול', icon: Stethoscope, count: breakdown.treatment, color: 'text-teal-500' },
    { type: 'herbs', label: 'צמחים', icon: Leaf, count: breakdown.herbs, color: 'text-green-600' },
    { type: 'points', label: 'נקודות', icon: Sparkles, count: breakdown.points, color: 'text-indigo-500' },
    { type: 'summary', label: 'סיכומים', icon: FileText, count: breakdown.summary, color: 'text-amber-500' },
    { type: 'transcription', label: 'תמלול', icon: Mic, count: breakdown.transcription, color: 'text-purple-500' },
  ].filter(item => item.count > 0); // Only show features with usage

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 gap-1.5 text-xs font-medium transition-colors ${
            isCritical 
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
              : isLow 
                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                : 'bg-jade/10 text-jade-dark hover:bg-jade/20'
          }`}
        >
          <Zap className="h-3 w-3" />
          <span>{remaining.toLocaleString()}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="flex items-center justify-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-jade" />
            שימוש חודשי
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-6 pb-6 space-y-6" dir="rtl">
          {/* Current Tier & Progress */}
          <div className="bg-gradient-to-br from-jade/5 to-gold/5 rounded-xl p-4 border border-jade/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-jade/20 text-jade-dark border-jade/30">
                  {tierNames[tier] || tier}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {usageData.currentUsed.toLocaleString()} / {usageData.tierLimit.toLocaleString()}
                </span>
              </div>
              <span className={`text-sm font-bold ${
                isCritical ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-jade'
              }`}>
                {percentage}%
              </span>
            </div>
            <Progress 
              value={percentage} 
              className={`h-3 ${
                isCritical ? '[&>div]:bg-destructive' : isLow ? '[&>div]:bg-amber-500' : '[&>div]:bg-jade'
              }`}
            />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              נותרו {remaining.toLocaleString()} שאילתות החודש
            </p>
          </div>

          {/* Usage Breakdown */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-jade" />
              פירוט שימוש
            </h3>
            <div className="space-y-2">
              {usageBreakdown.length > 0 ? usageBreakdown.map((item) => (
                <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.count}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`}
                        style={{ width: `${(item.count / totalBreakdown) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-2">אין נתוני שימוש עדיין</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-jade">{usageData.uniquePatients}</p>
              <p className="text-xs text-muted-foreground">מטופלים פעילים</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gold-dark">
                {Math.round(remaining / 5)}
              </p>
              <p className="text-xs text-muted-foreground">שאילתות נותרות (ממוצע)</p>
            </div>
          </div>

          {/* Upgrade CTA - only show if not premium and usage is getting high */}
          {tier !== 'premium' && percentage >= 50 && (
            <Button 
              onClick={() => {
                setOpen(false);
                navigate('/pricing');
              }}
              className="w-full bg-gradient-to-r from-jade to-jade-dark hover:from-jade-dark hover:to-jade text-white"
            >
              <Sparkles className="h-4 w-4 ml-2" />
              {tier === 'trial' ? 'שדרג לסטנדרט' : 'שדרג לפרימיום'}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
