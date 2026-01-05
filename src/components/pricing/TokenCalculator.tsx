import { useState, useEffect } from 'react';
import { Calculator, Users, Zap, CheckCircle2, ArrowUp, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TOKENS_PER_PATIENT = 1250; // Average tokens per patient treatment

const PLANS = [
  {
    name: 'Trial',
    nameHe: 'ניסיון',
    tokens: 50000,
    price: 'חינם',
    maxPatients: 40,
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-500',
  },
  {
    name: 'Standard',
    nameHe: 'סטנדרט',
    tokens: 150000,
    price: '₪40/חודש',
    maxPatients: 120,
    color: 'bg-gold',
    borderColor: 'border-gold',
    textColor: 'text-gold',
  },
  {
    name: 'Premium',
    nameHe: 'פרימיום',
    tokens: 600000,
    price: '₪50/חודש',
    maxPatients: 480,
    color: 'bg-primary',
    borderColor: 'border-primary',
    textColor: 'text-primary',
  },
];

interface TokenCalculatorProps {
  onPlanRecommended?: (planName: string) => void;
}

export function TokenCalculator({ onPlanRecommended }: TokenCalculatorProps) {
  const [patientsPerWeek, setPatientsPerWeek] = useState(10);
  const [sessionsPerPatient, setSessionsPerPatient] = useState(3);

  const monthlyPatients = patientsPerWeek * 4;
  const totalSessions = monthlyPatients * sessionsPerPatient;
  const estimatedTokens = totalSessions * TOKENS_PER_PATIENT;

  const getRecommendedPlan = () => {
    if (estimatedTokens <= 50000) return 'Trial';
    if (estimatedTokens <= 150000) return 'Standard';
    return 'Premium';
  };

  const recommendedPlan = getRecommendedPlan();
  
  // Notify parent when plan recommendation changes
  useEffect(() => {
    onPlanRecommended?.(recommendedPlan);
  }, [recommendedPlan, onPlanRecommended]);
  
  const scrollToTiers = () => {
    const tierSection = document.getElementById('tier-selection');
    if (tierSection) {
      tierSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold/20 to-gold/10 text-gold-dark px-4 py-2 rounded-full mb-4 animate-pulse">
          <Calculator className="h-5 w-5" />
          <span className="text-sm font-bold">מחשבון טוקנים</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl mb-3 text-slate-800">כמה טוקנים אתה צריך?</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          הזן את מספר המטופלים הצפוי וקבל המלצה לתוכנית המתאימה
        </p>
      </div>

      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200/50 shadow-inner">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-8">
            {/* Patients per week */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  מטופלים בשבוע
                </label>
                <span className="text-2xl font-bold text-primary">{patientsPerWeek}</span>
              </div>
              <Slider
                value={[patientsPerWeek]}
                onValueChange={(value) => setPatientsPerWeek(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>

            {/* Sessions per patient */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-medium">
                  <Zap className="h-4 w-4 text-gold" />
                  שאילתות AI לכל מטופל
                </label>
                <span className="text-2xl font-bold text-gold">{sessionsPerPatient}</span>
              </div>
              <Slider
                value={[sessionsPerPatient]}
                onValueChange={(value) => setSessionsPerPatient(value[0])}
                min={1}
                max={6}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 (בסיסי)</span>
                <span>3 (ממוצע)</span>
                <span>6 (אינטנסיבי)</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="bg-background/50 rounded-xl p-5 space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">סיכום חודשי</h3>
              
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm">מטופלים בחודש</span>
                <span className="font-medium">{monthlyPatients}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm">סה״כ שאילתות AI</span>
                <span className="font-medium">{totalSessions}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">טוקנים נדרשים</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    ~{(estimatedTokens / 1000).toFixed(0)}K
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-right">
                        <p className="font-medium mb-1">עלות חודשית משוערת:</p>
                        <p className="text-sm">
                          {estimatedTokens <= 50000 
                            ? 'חינם (תקופת ניסיון)'
                            : estimatedTokens <= 150000 
                              ? '₪40 + מע״מ'
                              : '₪50 + מע״מ'
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Recommended Plan */}
            <div className={cn(
              "rounded-xl p-5 border-2 transition-all",
              recommendedPlan === 'Trial' && "bg-emerald-500/10 border-emerald-500",
              recommendedPlan === 'Standard' && "bg-gold/10 border-gold",
              recommendedPlan === 'Premium' && "bg-primary/10 border-primary",
            )}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={cn(
                  "h-5 w-5",
                  recommendedPlan === 'Trial' && "text-emerald-500",
                  recommendedPlan === 'Standard' && "text-gold",
                  recommendedPlan === 'Premium' && "text-primary",
                )} />
                <span className="font-medium">התוכנית המומלצת</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={cn(
                    "text-2xl font-bold",
                    recommendedPlan === 'Trial' && "text-emerald-500",
                    recommendedPlan === 'Standard' && "text-gold",
                    recommendedPlan === 'Premium' && "text-primary",
                  )}>
                    {PLANS.find(p => p.name === recommendedPlan)?.nameHe}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {PLANS.find(p => p.name === recommendedPlan)?.price}
                  </div>
                </div>
                <Button
                  onClick={scrollToTiers}
                  size="sm"
                  variant="ghost"
                  className="group"
                >
                  <ArrowUp className="h-4 w-4 ml-1 group-hover:text-gold transition-colors" />
                  בחר תוכנית
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison Bar */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">השוואה לתוכניות:</span>
          </div>
          <div className="relative h-8 bg-background/50 rounded-full overflow-hidden">
            {PLANS.map((plan, index) => {
              const prevTokens = index === 0 ? 0 : PLANS[index - 1].tokens;
              const width = ((plan.tokens - prevTokens) / 600000) * 100;
              const left = (prevTokens / 600000) * 100;
              
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "absolute top-0 h-full flex items-center justify-center text-xs font-medium transition-opacity",
                    plan.color,
                    recommendedPlan === plan.name ? "opacity-100" : "opacity-40"
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span className="text-white drop-shadow-sm">{plan.nameHe}</span>
                </div>
              );
            })}
            {/* Usage indicator */}
            <div 
              className="absolute top-0 h-full w-1 bg-foreground z-10 transition-all duration-300"
              style={{ left: `${Math.min((estimatedTokens / 600000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span>50K</span>
            <span>150K</span>
            <span>600K</span>
          </div>
        </div>
      </div>
    </section>
  );
}
