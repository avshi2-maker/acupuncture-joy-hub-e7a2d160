import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  Building2, 
  Lightbulb, 
  Cpu, 
  User, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Zap,
  Printer,
  RotateCcw
} from 'lucide-react';

interface ClinicROICalculatorProps {
  currentUsed?: number;
  tierLimit?: number;
  isEmbedded?: boolean;
}

const DEFAULT_VALUES = {
  rent: 3500,
  utilities: 800,
  software: 300,
  general: 500,
  sessionPrice: 350,
  sessionsPerMonth: 60,
  aiQueriesPerDay: 20,
};

export const ClinicROICalculator: React.FC<ClinicROICalculatorProps> = ({
  currentUsed = 350,
  tierLimit = 500,
  isEmbedded = false,
}) => {
  const navigate = useNavigate();
  
  // Fixed costs state (sliders)
  const [rent, setRent] = useState(DEFAULT_VALUES.rent);
  const [utilities, setUtilities] = useState(DEFAULT_VALUES.utilities);
  const [software, setSoftware] = useState(DEFAULT_VALUES.software);
  const [general, setGeneral] = useState(DEFAULT_VALUES.general);
  
  // Revenue & usage state (inputs)
  const [sessionPrice, setSessionPrice] = useState(DEFAULT_VALUES.sessionPrice);
  const [sessionsPerMonth, setSessionsPerMonth] = useState(DEFAULT_VALUES.sessionsPerMonth);
  const [aiQueriesPerDay, setAiQueriesPerDay] = useState(DEFAULT_VALUES.aiQueriesPerDay);

  // AI cost per query (in ILS)
  const AI_COST_PER_QUERY = 0.5;
  const WORKING_DAYS_PER_MONTH = 22;

  // Calculations
  const calculations = useMemo(() => {
    const totalFixedCosts = rent + utilities + software + general;
    const monthlyAiQueries = aiQueriesPerDay * WORKING_DAYS_PER_MONTH;
    const monthlyAiCost = monthlyAiQueries * AI_COST_PER_QUERY;
    const totalMonthlyCosts = totalFixedCosts + monthlyAiCost;
    const monthlyRevenue = sessionPrice * sessionsPerMonth;
    const netProfit = monthlyRevenue - totalMonthlyCosts;
    const roi = totalMonthlyCosts > 0 ? ((netProfit / totalMonthlyCosts) * 100) : 0;
    const breakEvenSessions = totalMonthlyCosts > 0 && sessionPrice > 0 
      ? Math.ceil(totalMonthlyCosts / sessionPrice) 
      : 0;
    
    return {
      totalFixedCosts,
      monthlyAiQueries,
      monthlyAiCost,
      totalMonthlyCosts,
      monthlyRevenue,
      netProfit,
      roi,
      breakEvenSessions,
    };
  }, [rent, utilities, software, general, sessionPrice, sessionsPerMonth, aiQueriesPerDay]);

  const handleReset = () => {
    setRent(DEFAULT_VALUES.rent);
    setUtilities(DEFAULT_VALUES.utilities);
    setSoftware(DEFAULT_VALUES.software);
    setGeneral(DEFAULT_VALUES.general);
    setSessionPrice(DEFAULT_VALUES.sessionPrice);
    setSessionsPerMonth(DEFAULT_VALUES.sessionsPerMonth);
    setAiQueriesPerDay(DEFAULT_VALUES.aiQueriesPerDay);
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Clinic ROI Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; direction: rtl; }
          h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #374151; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e5e7eb; }
          .row:last-child { border-bottom: none; }
          .label { color: #6b7280; }
          .value { font-weight: bold; }
          .profit { color: ${calculations.netProfit >= 0 ? '#059669' : '#dc2626'}; font-size: 24px; }
          .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <h1>📊 דו"ח ROI קליניקה</h1>
        <p style="color: #6b7280;">נוצר בתאריך: ${new Date().toLocaleDateString('he-IL')}</p>
        
        <div class="section">
          <div class="section-title">הוצאות קבועות חודשיות</div>
          <div class="row"><span class="label">שכירות</span><span class="value">₪${rent.toLocaleString()}</span></div>
          <div class="row"><span class="label">חשבונות (חשמל, מים, ארנונה)</span><span class="value">₪${utilities.toLocaleString()}</span></div>
          <div class="row"><span class="label">תוכנה ו-AI</span><span class="value">₪${software.toLocaleString()}</span></div>
          <div class="row"><span class="label">כללי/אישי</span><span class="value">₪${general.toLocaleString()}</span></div>
          <div class="row" style="font-weight: bold; border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
            <span>סה"כ קבועות</span><span>₪${calculations.totalFixedCosts.toLocaleString()}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">הכנסות ושימוש</div>
          <div class="row"><span class="label">מחיר לטיפול</span><span class="value">₪${sessionPrice.toLocaleString()}</span></div>
          <div class="row"><span class="label">טיפולים בחודש</span><span class="value">${sessionsPerMonth}</span></div>
          <div class="row"><span class="label">שאילתות AI ביום</span><span class="value">${aiQueriesPerDay}</span></div>
          <div class="row"><span class="label">עלות AI חודשית</span><span class="value">₪${calculations.monthlyAiCost.toLocaleString()}</span></div>
        </div>

        <div class="summary">
          <div class="row"><span class="label">הכנסה חודשית</span><span class="value">₪${calculations.monthlyRevenue.toLocaleString()}</span></div>
          <div class="row"><span class="label">סה"כ הוצאות</span><span class="value">₪${calculations.totalMonthlyCosts.toLocaleString()}</span></div>
          <div class="row" style="font-size: 20px;"><span class="label">רווח נקי</span><span class="profit">₪${calculations.netProfit.toLocaleString()}</span></div>
          <div class="row"><span class="label">ROI</span><span class="value">${calculations.roi.toFixed(1)}%</span></div>
          <div class="row"><span class="label">נקודת איזון</span><span class="value">${calculations.breakEvenSessions} טיפולים</span></div>
        </div>

        <div class="footer">
          <p>הדו"ח נוצר באמצעות מערכת TCM Brain | כל הנתונים הם הערכות בלבד</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getProfitColor = () => {
    if (calculations.netProfit >= 10000) return 'text-emerald-500';
    if (calculations.netProfit >= 0) return 'text-jade';
    return 'text-destructive';
  };

  const getRoiColor = () => {
    if (calculations.roi >= 100) return 'text-emerald-500';
    if (calculations.roi >= 50) return 'text-jade';
    if (calculations.roi >= 0) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <div className={`space-y-6 font-heebo ${isEmbedded ? 'p-0' : ''}`} dir="rtl">
      {/* Header */}
      <Card className="border-2 border-jade/20 bg-gradient-to-br from-jade/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-6 w-6 text-jade" />
              <span>מחשבון ROI לקליניקה</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 ml-1" />
                איפוס
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 ml-1" />
                הדפס
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            חשב את הרווחיות והעלויות של הקליניקה שלך
          </p>
        </CardHeader>
      </Card>

      {/* Fixed Costs Section */}
      <Card className="border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-lg">💰</span>
            1. הוצאות קבועות (Fixed Costs)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rent Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                שכירות קליניקה (Rent)
              </Label>
              <Badge variant="secondary" className="text-base font-bold px-3">
                ₪{rent.toLocaleString()}
              </Badge>
            </div>
            <Slider
              value={[rent]}
              onValueChange={(value) => setRent(value[0])}
              min={1000}
              max={10000}
              step={100}
              className="cursor-pointer"
            />
          </div>

          {/* Utilities Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                חשבונות (Utilities/Tax)
              </Label>
              <Badge variant="secondary" className="text-base font-bold px-3">
                ₪{utilities.toLocaleString()}
              </Badge>
            </div>
            <Slider
              value={[utilities]}
              onValueChange={(value) => setUtilities(value[0])}
              min={200}
              max={3000}
              step={50}
              className="cursor-pointer"
            />
          </div>

          {/* Software Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                תוכנה ו-AI (Current Tier)
              </Label>
              <Badge variant="secondary" className="text-base font-bold px-3">
                ₪{software.toLocaleString()}
              </Badge>
            </div>
            <Slider
              value={[software]}
              onValueChange={(value) => setSoftware(value[0])}
              min={0}
              max={1000}
              step={25}
              className="cursor-pointer"
            />
          </div>

          {/* General Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                כללי/אישי (General/Personal)
              </Label>
              <Badge variant="secondary" className="text-base font-bold px-3">
                ₪{general.toLocaleString()}
              </Badge>
            </div>
            <Slider
              value={[general]}
              onValueChange={(value) => setGeneral(value[0])}
              min={0}
              max={2000}
              step={50}
              className="cursor-pointer"
            />
          </div>

          {/* Fixed Costs Total */}
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <span className="font-medium">סה"כ הוצאות קבועות:</span>
            <span className="text-xl font-bold text-primary">₪{calculations.totalFixedCosts.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue & Usage Section */}
      <Card className="border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-lg">📈</span>
            2. הכנסות ושימוש (Revenue & Usage)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionPrice">מחיר טיפול ממוצע (₪)</Label>
              <Input
                id="sessionPrice"
                type="number"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(Number(e.target.value) || 0)}
                min={0}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionsPerMonth">מספר טיפולים בחודש</Label>
              <Input
                id="sessionsPerMonth"
                type="number"
                value={sessionsPerMonth}
                onChange={(e) => setSessionsPerMonth(Number(e.target.value) || 0)}
                min={0}
                className="text-lg font-semibold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-purple-500" />
                שימוש ב-AI (שאילתות ליום)
              </Label>
              <Badge variant="secondary" className="text-base font-bold px-3">
                {aiQueriesPerDay}
              </Badge>
            </div>
            <Slider
              value={[aiQueriesPerDay]}
              onValueChange={(value) => setAiQueriesPerDay(value[0])}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground text-center">
              משוער: {calculations.monthlyAiQueries} שאילתות/חודש = ₪{calculations.monthlyAiCost.toLocaleString()} עלות AI
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border text-center">
          <CardContent className="pt-6 pb-4">
            <p className="text-xs text-muted-foreground mb-1">סה"כ הוצאות חודשי</p>
            <p className="text-2xl font-bold text-destructive">
              ₪{calculations.totalMonthlyCosts.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 text-center ${calculations.netProfit >= 0 ? 'border-jade/30 bg-jade/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <CardContent className="pt-6 pb-4">
            <p className="text-xs text-muted-foreground mb-1">רווח נקי משוער</p>
            <div className="flex items-center justify-center gap-1">
              {calculations.netProfit >= 0 ? (
                <TrendingUp className="h-5 w-5 text-jade" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <p className={`text-3xl font-bold ${getProfitColor()}`}>
                ₪{calculations.netProfit.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border text-center">
          <CardContent className="pt-6 pb-4">
            <p className="text-xs text-muted-foreground mb-1">ROI משוער</p>
            <p className={`text-2xl font-bold ${getRoiColor()}`}>
              {calculations.roi.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Break-even Info */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <span className="font-medium">נקודת איזון:</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {calculations.breakEvenSessions} טיפולים/חודש
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {sessionsPerMonth >= calculations.breakEvenSessions 
              ? `✅ אתה מעל נקודת האיזון ב-${sessionsPerMonth - calculations.breakEvenSessions} טיפולים`
              : `⚠️ חסרים ${calculations.breakEvenSessions - sessionsPerMonth} טיפולים להגעה לנקודת איזון`
            }
          </p>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {calculations.netProfit < 5000 && (
        <Button 
          onClick={() => navigate('/pricing')}
          className="w-full gap-2 bg-gradient-to-l from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          שדרג את התוכנית להגדלת הרווחים
        </Button>
      )}
    </div>
  );
};

export default ClinicROICalculator;
