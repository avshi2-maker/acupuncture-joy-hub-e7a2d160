import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Sparkles, Zap } from 'lucide-react';

interface SmartROISimulatorProps {
  currentUsed?: number;
  tierLimit?: number;
  isEmbedded?: boolean;
}

const QUERIES_PER_PATIENT = 5;
const SAFETY_BUFFER_PERCENT = 90;
const COST_PER_QUERY = 0.5; // ₪0.50 per AI query

export const SmartROISimulator: React.FC<SmartROISimulatorProps> = ({
  currentUsed = 350,
  tierLimit = 500,
  isEmbedded = false,
}) => {
  const navigate = useNavigate();
  const [patientForecast, setPatientForecast] = useState(80);
  const [pricePerTreatment, setPricePerTreatment] = useState(250);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Current status calculations
  const usagePercent = Math.round((currentUsed / tierLimit) * 100);
  const remaining = tierLimit - currentUsed;
  const patientsRemaining = Math.floor(remaining / QUERIES_PER_PATIENT);
  const isLowBalance = usagePercent >= SAFETY_BUFFER_PERCENT;

  // Simulator calculations
  const queriesNeeded = patientForecast * QUERIES_PER_PATIENT;
  const expectedIncome = patientForecast * pricePerTreatment;
  const aiCost = queriesNeeded * COST_PER_QUERY;
  const netIncome = expectedIncome - aiCost;
  const upgradeNeeded = queriesNeeded > remaining;

  // AI suggestion logic
  const getAISuggestion = () => {
    if (patientForecast === 0) {
      return {
        text: "הזז את הסליידרים כדי לקבל תחזית.",
        type: "neutral" as const,
        icon: Brain,
      };
    }

    if (!upgradeNeeded) {
      return {
        text: `מצוין! יש לך מספיק קרדיטים ל-${patientForecast} מטופלים. המערכת מכוסה לחלוטין.`,
        type: "success" as const,
        icon: CheckCircle,
      };
    }

    const additionalQueriesNeeded = queriesNeeded - remaining;
    const upgradeCost = additionalQueriesNeeded * COST_PER_QUERY;
    const profit = netIncome - upgradeCost;

    if (profit > 0) {
      return {
        text: `חדשות טובות! אתה צריך שדרוג, אבל תרוויח ₪${profit.toLocaleString()} נוספים. ההשקעה משתלמת!`,
        type: "growth" as const,
        icon: TrendingUp,
      };
    }

    return {
      text: `שים לב: בתרחיש הזה העלויות גבוהות מההכנסות. שקול להעלות מחירים או לצמצם.`,
      type: "warning" as const,
      icon: AlertTriangle,
    };
  };

  const suggestion = getAISuggestion();

  const getProgressColor = () => {
    if (usagePercent >= 90) return 'bg-destructive';
    if (usagePercent >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getSuggestionStyles = () => {
    switch (suggestion.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200';
      case 'growth':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
    <div className={`space-y-6 font-heebo ${isEmbedded ? 'p-0' : ''}`} dir="rtl">
      {/* Current Status Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">📊</span>
            תמונת מצב נוכחית
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">שימוש החודש:</span>
            {isLoading ? (
              <span className="text-muted-foreground animate-pulse">טוען...</span>
            ) : (
              <span className="font-bold text-foreground">
                {currentUsed.toLocaleString()} / {tierLimit.toLocaleString()} שאילתות
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative h-4 rounded-full bg-muted overflow-hidden">
              <div
                className={`absolute inset-y-0 right-0 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usagePercent}% בשימוש</span>
              <span>נותרו ~{patientsRemaining} מטופלים</span>
            </div>
          </div>

          {isLowBalance && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>המערכת תשלח התראה כשתישארו עם 10% (בערך {Math.floor(tierLimit * 0.1 / QUERIES_PER_PATIENT)} מטופלים).</span>
            </div>
          )}

          {!isLowBalance && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm">
              <span className="text-base">🛈</span>
              <span>המערכת תשלח התראה כשתישארו עם 10% (בערך {Math.floor(tierLimit * 0.1 / QUERIES_PER_PATIENT)} מטופלים).</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Simulator Section */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">🕹️</span>
            סימולטור צמיחה
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            שחקו עם המספרים כדי לראות מה יקרה אם הקליניקה תגדל בחודש הבא.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Forecast Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">צפי מטופלים בחודש הבא:</label>
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                {patientForecast}
              </Badge>
            </div>
            <Slider
              value={[patientForecast]}
              onValueChange={(value) => setPatientForecast(value[0])}
              min={0}
              max={200}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
          </div>

          {/* Price Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">מחיר לטיפול (ממוצע):</label>
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                ₪{pricePerTreatment}
              </Badge>
            </div>
            <Slider
              value={[pricePerTreatment]}
              onValueChange={(value) => setPricePerTreatment(value[0])}
              min={100}
              max={500}
              step={10}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₪100</span>
              <span>₪200</span>
              <span>₪300</span>
              <span>₪400</span>
              <span>₪500</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <Card className={`border-2 transition-all duration-300 ${getSuggestionStyles()}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-background/50">
              <suggestion.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <span className="font-bold">ניתוח AI:</span>
              </div>
              <p className="text-base leading-relaxed">{suggestion.text}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-background/60 text-center">
              <div className="text-xs text-muted-foreground mb-1">הכנסה צפויה</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ₪{expectedIncome.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/60 text-center">
              <div className="text-xs text-muted-foreground mb-1">עלות AI</div>
              <div className="text-lg font-bold text-destructive">
                ₪{aiCost.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/60 text-center">
              <div className="text-xs text-muted-foreground mb-1">נטו</div>
              <div className={`text-lg font-bold ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                ₪{netIncome.toLocaleString()}
              </div>
            </div>
          </div>

          {upgradeNeeded && (
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>נדרשות {queriesNeeded - remaining} שאילתות נוספות מעבר לתכנית הנוכחית</span>
              </div>
              
              <Button 
                onClick={handleUpgradeClick}
                className="w-full gap-2 bg-gradient-to-l from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90"
                size="lg"
              >
                <Zap className="w-5 h-5" />
                שדרג עכשיו והגדל את הרווחים
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartROISimulator;
