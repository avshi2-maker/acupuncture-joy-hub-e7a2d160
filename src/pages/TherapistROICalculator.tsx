import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calculator, TrendingUp, Calendar, CalendarDays } from "lucide-react";
import roiBgImage from "@/assets/roi-therapist-bg.png";

const TIERS = [
  { id: "standard", name: "מסלול רגיל", value: 149, label: "Standard", color: "hsl(var(--primary))" },
  { id: "premium", name: "מסלול פרימיום", value: 249, label: "Premium", color: "hsl(var(--gold))" },
];

export default function TherapistROICalculator() {
  const navigate = useNavigate();
  const [price, setPrice] = useState(300);
  const [sessions, setSessions] = useState(80);
  const [expenses, setExpenses] = useState(2500);
  const [selectedTier, setSelectedTier] = useState("standard");

  const tierCost = TIERS.find(t => t.id === selectedTier)?.value || 149;
  const grossIncome = price * sessions;
  const netIncome = grossIncome - expenses - tierCost;

  // Yearly calculations
  const yearlyGross = grossIncome * 12;
  const yearlyExpenses = expenses * 12;
  const yearlyTierCost = tierCost * 12;
  const yearlyNet = netIncome * 12;

  // Calculate breakdown percentages for the chart
  const total = grossIncome;
  const expensesPct = total > 0 ? (expenses / total) * 100 : 0;
  const tierPct = total > 0 ? (tierCost / total) * 100 : 0;
  const netPct = total > 0 ? Math.max(0, (netIncome / total) * 100) : 0;

  // Monthly comparison data for yearly view
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  const cumulativeIncome = months.map((_, i) => netIncome * (i + 1));

  const handleSelectTier = () => {
    navigate("/gate", { state: { selectedTier } });
  };

  return (
    <>
      <Helmet>
        <title>מחשבון פוטנציאל הכנסה | TCM Clinic</title>
        <meta name="description" content="חשב את פוטנציאל ההכנסה שלך כמטפל עם כלי ה-AI המתקדמים שלנו" />
      </Helmet>

      <div 
        className="min-h-screen bg-cover bg-center bg-fixed" 
        dir="rtl"
        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.92)), url(${roiBgImage})` }}
      >
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              חזרה
            </Button>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="font-semibold">מחשבון ROI</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              מחשבון פוטנציאל הכנסה
            </h1>
            <p className="text-muted-foreground">
              גלה כמה תוכל להרוויח עם הכלים שלנו
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-xl bg-card/95 backdrop-blur">
            <CardContent className="p-6 space-y-8">
              {/* Price Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">מחיר לטיפול</Label>
                  <span className="text-xl font-bold text-primary">
                    ₪{price.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[price]}
                  onValueChange={(v) => setPrice(v[0])}
                  min={150}
                  max={500}
                  step={10}
                  className="touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₪150</span>
                  <span>₪500</span>
                </div>
              </div>

              {/* Sessions Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">מספר טיפולים בחודש</Label>
                  <span className="text-xl font-bold text-primary">
                    {sessions}
                  </span>
                </div>
                <Slider
                  value={[sessions]}
                  onValueChange={(v) => setSessions(v[0])}
                  min={20}
                  max={200}
                  step={5}
                  className="touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20</span>
                  <span>200</span>
                </div>
              </div>

              {/* Expenses Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">הוצאות קבועות בחודש</Label>
                  <span className="text-xl font-bold text-primary">
                    ₪{expenses.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[expenses]}
                  onValueChange={(v) => setExpenses(v[0])}
                  min={1000}
                  max={5000}
                  step={100}
                  className="touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₪1,000</span>
                  <span>₪5,000</span>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">בחר מסלול</Label>
                <RadioGroup
                  value={selectedTier}
                  onValueChange={setSelectedTier}
                  className="flex gap-4"
                >
                  {TIERS.map((tier) => (
                    <div key={tier.id} className="flex-1">
                      <RadioGroupItem
                        value={tier.id}
                        id={tier.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={tier.id}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all touch-manipulation min-h-[80px]"
                      >
                        <span className="font-semibold text-sm">{tier.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          ₪{tier.value}/חודש
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Income Breakdown Chart */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">פירוט הכנסות</Label>
                
                {/* Stacked Bar Chart */}
                <div className="h-8 rounded-full overflow-hidden flex bg-muted/30">
                  {netPct > 0 && (
                    <div 
                      className="bg-primary transition-all duration-300 flex items-center justify-center"
                      style={{ width: `${netPct}%` }}
                    >
                      {netPct > 15 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {netPct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  )}
                  <div 
                    className="bg-destructive/70 transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${expensesPct}%` }}
                  >
                    {expensesPct > 10 && (
                      <span className="text-xs font-medium text-destructive-foreground">
                        {expensesPct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div 
                    className="bg-amber-500 transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${tierPct}%` }}
                  >
                    {tierPct > 5 && (
                      <span className="text-xs font-medium text-white">
                        {tierPct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Legend with values */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">הכנסה נטו</div>
                    <div className="text-sm font-bold text-primary">₪{netIncome.toLocaleString()}</div>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-3">
                    <div className="w-3 h-3 rounded-full bg-destructive/70 mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">הוצאות</div>
                    <div className="text-sm font-bold text-destructive">₪{expenses.toLocaleString()}</div>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">מסלול</div>
                    <div className="text-sm font-bold text-amber-600">₪{tierCost}</div>
                  </div>
                </div>

                {/* Gross income summary */}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">הכנסה ברוטו (לפני הוצאות):</span>
                  <span className="text-sm font-semibold">₪{grossIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* Monthly vs Yearly Projection Tabs */}
              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    חודשי
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    שנתי
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="mt-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        צפי הכנסה חודשית פנויה (לפני מס):
                      </span>
                    </div>
                    <div className="text-4xl font-extrabold text-primary">
                      ₪{netIncome.toLocaleString()}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="yearly" className="mt-4 space-y-4">
                  {/* Yearly Summary */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        צפי הכנסה שנתית פנויה (לפני מס):
                      </span>
                    </div>
                    <div className="text-4xl font-extrabold text-primary">
                      ₪{yearlyNet.toLocaleString()}
                    </div>
                  </div>

                  {/* Cumulative Growth Chart */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">צמיחה מצטברת לאורך השנה</Label>
                    <div className="bg-muted/20 rounded-lg p-4">
                      <div className="flex items-end justify-between h-40 gap-1">
                        {months.map((month, i) => {
                          const heightPct = yearlyNet > 0 ? (cumulativeIncome[i] / yearlyNet) * 100 : 0;
                          return (
                            <div key={month} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-300 min-h-[4px]"
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                                {month.slice(0, 3)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Yearly Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-lg p-4 border border-border text-center">
                      <div className="text-xs text-muted-foreground mb-1">הכנסה ברוטו שנתית</div>
                      <div className="text-lg font-bold">₪{yearlyGross.toLocaleString()}</div>
                    </div>
                    <div className="bg-card rounded-lg p-4 border border-border text-center">
                      <div className="text-xs text-muted-foreground mb-1">הוצאות שנתיות</div>
                      <div className="text-lg font-bold text-destructive">₪{yearlyExpenses.toLocaleString()}</div>
                    </div>
                    <div className="bg-card rounded-lg p-4 border border-border text-center">
                      <div className="text-xs text-muted-foreground mb-1">עלות מסלול שנתית</div>
                      <div className="text-lg font-bold text-amber-600">₪{yearlyTierCost.toLocaleString()}</div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1">הכנסה נטו שנתית</div>
                      <div className="text-lg font-bold text-primary">₪{yearlyNet.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Monthly vs Yearly comparison */}
                  <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">חודשי</div>
                      <div className="text-xl font-bold">₪{netIncome.toLocaleString()}</div>
                    </div>
                    <div className="text-2xl text-muted-foreground">×12</div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">שנתי</div>
                      <div className="text-xl font-bold text-primary">₪{yearlyNet.toLocaleString()}</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* CTA Button */}
              <Button
                onClick={handleSelectTier}
                className="w-full min-h-[52px] text-lg font-semibold touch-manipulation"
                size="lg"
              >
                בחר מסלול והתחל
              </Button>

              {/* Disclaimer */}
              <p className="text-xs text-center text-muted-foreground">
                המחשה בלבד. התוצאות עשויות להשתנות בהתאם לביצועים בפועל.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
