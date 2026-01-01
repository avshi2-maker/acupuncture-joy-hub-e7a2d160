import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  Printer, 
  RotateCcw, 
  Calculator,
  Baby,
  Stethoscope,
  FileText,
  Clock,
  Loader2,
  Save,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CalculationResult {
  lmpDate: Date;
  currentDate: Date;
  dueDate: Date;
  gestationDays: number;
  gestationWeeks: number;
  gestationMonthTcm: number;
  trimester: 1 | 2 | 3;
  trimesterName: string;
  daysUntilDue: number;
}

interface ForbiddenPoint {
  name: string;
  chineseName: string;
  warning: string;
  riskLevel: 'forbidden' | 'contraindicated';
}

const FORBIDDEN_POINTS: ForbiddenPoint[] = [
  {
    name: 'LI-4 (Hegu)',
    chineseName: '合谷',
    warning: 'Strong descending action. High risk of miscarriage. Can induce labor contractions.',
    riskLevel: 'forbidden'
  },
  {
    name: 'SP-6 (Sanyinjiao)',
    chineseName: '三阴交',
    warning: 'Intersection of Liver, Spleen & Kidney channels. Strongly moves Blood and Qi downward. Labor induction point.',
    riskLevel: 'forbidden'
  },
  {
    name: 'BL-60 (Kunlun)',
    chineseName: '崑崙',
    warning: 'Powerful descending action on the uterus. Traditionally used only during labor.',
    riskLevel: 'forbidden'
  },
  {
    name: 'BL-67 (Zhiyin)',
    chineseName: '至阴',
    warning: 'Known for turning breech babies and inducing labor. Strongly affects uterine position.',
    riskLevel: 'forbidden'
  }
];

const CONTRAINDICATED_POINTS: ForbiddenPoint[] = [
  {
    name: 'LU-2 (Yunmen)',
    chineseName: '云门',
    warning: 'Contraindicated from Month 2 onwards. Deep needling near chest can affect Qi circulation.',
    riskLevel: 'contraindicated'
  },
  {
    name: 'LU-4 (Xiabai)',
    chineseName: '侠白',
    warning: 'Contraindicated from Month 2 onwards. Can affect upper chest Qi flow during pregnancy.',
    riskLevel: 'contraindicated'
  }
];

const SAFE_POINTS = [
  { code: 'ST-36', name: 'Zusanli', indication: 'Strengthen Spleen & Stomach' },
  { code: 'KI-3', name: 'Taixi', indication: 'Nourish Kidney Yin' },
  { code: 'HT-7', name: 'Shenmen', indication: 'Calm Shen, reduce anxiety' },
  { code: 'PC-6', name: 'Neiguan', indication: 'Nausea & vomiting' },
];

// Labor Induction Points - Only use after 40 weeks with medical coordination
const LABOR_INDUCTION_POINTS = [
  { code: 'LI-4', name: 'Hegu', chineseName: '合谷', protocol: 'Strong manual stimulation, 15-20 min, bilateral. Combine with SP-6.' },
  { code: 'SP-6', name: 'Sanyinjiao', chineseName: '三阴交', protocol: 'Strong stimulation, 15-20 min, bilateral. Primary labor induction point.' },
  { code: 'BL-60', name: 'Kunlun', chineseName: '崑崙', protocol: 'Strong stimulation, 10-15 min. Descends uterine Qi.' },
  { code: 'BL-67', name: 'Zhiyin', chineseName: '至阴', protocol: 'Moxa preferred. 15-20 min. Can turn breech and induce labor.' },
  { code: 'GB-21', name: 'Jianjing', chineseName: '肩井', protocol: 'Strong downward pressure. 10-15 min. Powerful descending action.' },
  { code: 'LV-3', name: 'Taichong', chineseName: '太冲', protocol: 'Combined with LI-4 (Four Gates). Moves Qi and Blood strongly.' },
];

interface PregnancySafetyCalculatorProps {
  patientName?: string;
  patientId?: string;
  therapistName?: string;
  onClose?: () => void;
  onSaveToPatient?: (data: PregnancyData) => void;
  className?: string;
}

export interface PregnancyData {
  lmpDate: string;
  dueDate: string;
  gestationWeeks: number;
  gestationDays: number;
  trimester: number;
  calculatedAt: string;
}

export function PregnancySafetyCalculator({
  patientName: initialPatientName = '',
  patientId,
  therapistName: initialTherapistName = '',
  onClose,
  onSaveToPatient,
  className
}: PregnancySafetyCalculatorProps) {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [patientName, setPatientName] = useState(initialPatientName);
  const [therapistName, setTherapistName] = useState(initialTherapistName);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const setQuickDate = useCallback((weeksAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (weeksAgo * 7));
    setYear(date.getFullYear().toString());
    setMonth((date.getMonth() + 1).toString());
    setDay(date.getDate().toString());
  }, []);

  const calculateGestation = useCallback(() => {
    setError(null);
    setIsCalculating(true);

    setTimeout(() => {
      try {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const dayNum = parseInt(day);

        if (!yearNum || !monthNum || !dayNum) {
          throw new Error('Please enter all date fields (Year, Month, and Day)');
        }

        if (monthNum < 1 || monthNum > 12) {
          throw new Error('Month must be between 1 and 12');
        }

        if (dayNum < 1 || dayNum > 31) {
          throw new Error('Day must be between 1 and 31');
        }

        const lmpDate = new Date(yearNum, monthNum - 1, dayNum);
        const currentDate = new Date();

        if (lmpDate > currentDate) {
          throw new Error('LMP date cannot be in the future!');
        }

        const maxLmpDate = new Date();
        maxLmpDate.setDate(maxLmpDate.getDate() - 280);
        if (lmpDate < maxLmpDate) {
          throw new Error('LMP date must be within the last 280 days (40 weeks). Please verify the date.');
        }

        const diffMs = currentDate.getTime() - lmpDate.getTime();
        const gestationDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const gestationWeeks = Math.round((gestationDays / 7) * 10) / 10;
        const gestationMonthTcm = Math.ceil(gestationWeeks / 4.35);

        let trimester: 1 | 2 | 3;
        let trimesterName: string;
        if (gestationWeeks <= 13) {
          trimester = 1;
          trimesterName = 'First Trimester';
        } else if (gestationWeeks <= 26) {
          trimester = 2;
          trimesterName = 'Second Trimester';
        } else {
          trimester = 3;
          trimesterName = 'Third Trimester';
        }

        const dueDate = new Date(lmpDate);
        dueDate.setDate(dueDate.getDate() + 280);
        const daysUntilDue = Math.floor((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        setResult({
          lmpDate,
          currentDate,
          dueDate,
          gestationDays,
          gestationWeeks,
          gestationMonthTcm,
          trimester,
          trimesterName,
          daysUntilDue
        });

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setResult(null);
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  }, [year, month, day]);

  const resetCalculator = useCallback(() => {
    setMonth('');
    setDay('');
    setResult(null);
    setError(null);
  }, []);

  const printReport = useCallback(() => {
    window.print();
    toast.success('Print dialog opened');
  }, []);

  // Save pregnancy data to patient record
  const saveToPatient = useCallback(async () => {
    if (!result || !patientId || !user) {
      toast.error('Cannot save: No patient selected or calculation pending');
      return;
    }

    setIsSaving(true);
    try {
      const pregnancyData: PregnancyData = {
        lmpDate: result.lmpDate.toISOString(),
        dueDate: result.dueDate.toISOString(),
        gestationWeeks: result.gestationWeeks,
        gestationDays: result.gestationDays,
        trimester: result.trimester,
        calculatedAt: new Date().toISOString(),
      };

      // Update patient record with pregnancy data
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          is_pregnant: true,
          pregnancy_weeks: Math.floor(result.gestationWeeks),
          due_date: result.dueDate.toISOString().split('T')[0],
          pregnancy_notes: `LMP: ${formatDate(result.lmpDate)} | Trimester: ${result.trimester} | Updated: ${new Date().toLocaleDateString()}`,
        })
        .eq('id', patientId)
        .eq('therapist_id', user.id);

      if (updateError) throw updateError;

      // Call callback if provided
      if (onSaveToPatient) {
        onSaveToPatient(pregnancyData);
      }

      toast.success('Pregnancy data saved to patient record');
    } catch (err) {
      console.error('Error saving pregnancy data:', err);
      toast.error('Failed to save pregnancy data');
    } finally {
      setIsSaving(false);
    }
  }, [result, patientId, user, onSaveToPatient]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTrimesterColor = (trimester: 1 | 2 | 3) => {
    switch (trimester) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-teal-500';
    }
  };

  const getClinicalNotes = (trimester: 1 | 2 | 3, weeks: number) => {
    if (trimester === 1) {
      return {
        title: 'FIRST TRIMESTER (Weeks 1-13)',
        content: 'This is the HIGHEST RISK period for miscarriage. Use extreme caution with all treatment. Avoid abdominal points, strong stimulation, and any downward-moving techniques. Focus on gentle calming and nausea relief with safe points only. Many practitioners prefer to delay treatment until second trimester unless medically necessary.'
      };
    } else if (trimester === 2) {
      return {
        title: 'SECOND TRIMESTER (Weeks 14-26)',
        content: 'More stable period but maintain all safety precautions. Continue avoiding forbidden points. Use gentle techniques. This is typically the best time for supportive acupuncture treatment for pregnancy-related conditions like nausea, back pain, and emotional stress.'
      };
    } else {
      if (weeks >= 40) {
        return {
          title: `THIRD TRIMESTER (40+ weeks)`,
          content: `CURRENTLY AT OR PAST DUE DATE (${weeks} weeks). Some traditionally forbidden points (LI-4, SP-6, BL-60, BL-67) MAY be used WITH PROPER MEDICAL COORDINATION for labor induction. This should ONLY be done after 40 weeks with physician approval and proper monitoring.`
        };
      }
      return {
        title: 'THIRD TRIMESTER (Weeks 27-40)',
        content: 'Preparing for birth but maintain safety protocols. Continue avoiding forbidden points until after 40 weeks. Support common third trimester complaints (edema, back pain, anxiety) with safe points. Treatment can help prepare body for labor while maintaining pregnancy safety.'
      };
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-lg">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Baby className="h-6 w-6" />
          CM Pregnancy Safety Calculator
        </div>
        <p className="text-sm opacity-90 mt-1">Professional Clinical Assessment Tool</p>
        <Badge variant="secondary" className="mt-2 bg-white/20 text-white hover:bg-white/30">
          <Stethoscope className="h-3 w-3 mr-1" />
          ACTIVE CLINICAL SESSION
        </Badge>
      </div>

      {/* Safety Protocol Alert */}
      <Alert className="border-amber-300 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Clinical Safety Protocol</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          This calculator determines safe and contraindicated acupuncture points based on precise gestation age. 
          Required for all pregnancy treatments per TCM safety standards.
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* LMP Date Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-primary" />
            Last Menstrual Period (LMP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                min={2020}
                max={2030}
                className="text-center font-semibold"
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Month</Label>
              <Input
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="MM"
                min={1}
                max={12}
                className="text-center font-semibold"
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Day</Label>
              <Input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="DD"
                min={1}
                max={31}
                className="text-center font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickDate(8)} className="text-xs">
              📍 8 Weeks Ago
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate(12)} className="text-xs">
              📍 12 Weeks Ago
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate(20)} className="text-xs">
              📍 20 Weeks Ago
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate(30)} className="text-xs">
              📍 30 Weeks Ago
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Patient Information (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Patient Name / ID</Label>
            <Input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name or ID"
            />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Therapist Name</Label>
            <Input
              value={therapistName}
              onChange={(e) => setTherapistName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <Button
        onClick={calculateGestation}
        disabled={isCalculating}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {isCalculating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="h-5 w-5 mr-2" />
            Calculate Gestation & Safety Protocols
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="space-y-4 animate-in slide-in-from-bottom-4">
          {/* Results Header */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 text-center">
              <h2 className="text-lg font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Assessment Complete
              </h2>
              <p className="text-sm opacity-90">Gestation calculated successfully</p>
            </div>

            {/* Trimester Display */}
            <div className="p-6 text-center">
              <Badge className={cn("px-6 py-2 text-sm font-bold", getTrimesterColor(result.trimester))}>
                {result.trimesterName}
              </Badge>
              <div className="text-4xl font-bold mt-3">{result.gestationWeeks} Weeks</div>
              <div className="text-sm text-muted-foreground mt-1">
                TCM Month {result.gestationMonthTcm} of 10 | Trimester {result.trimester}
              </div>
            </div>

            <Separator />

            {/* Data Grid */}
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">📅 LMP Date</span>
                <span className="font-semibold">{formatDate(result.lmpDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">📅 Current Date</span>
                <span className="font-semibold">{formatDate(result.currentDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">📅 Expected Due Date</span>
                <span className="font-semibold">{formatDate(result.dueDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">⏱️ Days Pregnant</span>
                <span className="font-semibold">{result.gestationDays} days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">⏱️ Days Until Due</span>
                <span className="font-semibold">{result.daysUntilDue} days</span>
              </div>
            </div>
          </Card>

          {/* Safety Warnings */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Critical Safety Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Forbidden Points */}
              {result.gestationMonthTcm <= 9 && (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    ABSOLUTELY FORBIDDEN POINTS
                  </h4>
                  <div className="space-y-3">
                    {FORBIDDEN_POINTS.map((point) => (
                      <div key={point.name} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <span className="text-lg">🚫</span>
                        <div>
                          <div className="font-bold text-red-700">
                            {point.name} - {point.chineseName}
                          </div>
                          <div className="text-sm text-red-600">{point.warning}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contraindicated Points */}
              {result.gestationMonthTcm >= 2 && (
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    CONTRAINDICATED FROM MONTH 2+
                  </h4>
                  <div className="space-y-3">
                    {CONTRAINDICATED_POINTS.map((point) => (
                      <div key={point.name} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <span className="text-lg">⚠️</span>
                        <div>
                          <div className="font-bold text-orange-700">
                            {point.name} - {point.chineseName}
                          </div>
                          <div className="text-sm text-orange-600">{point.warning}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Notes */}
              <Alert className="border-blue-200 bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  {getClinicalNotes(result.trimester, result.gestationWeeks).title}
                </AlertTitle>
                <AlertDescription className="text-blue-700 text-sm">
                  {getClinicalNotes(result.trimester, result.gestationWeeks).content}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Safe Points */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                Safe Points for Pregnancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertTitle className="text-emerald-800">Recommended Safe Points</AlertTitle>
                <AlertDescription className="text-emerald-700">
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    {SAFE_POINTS.map((point) => (
                      <li key={point.code}>
                        <strong>{point.code} ({point.name})</strong> - {point.indication}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs">
                    <strong>Note:</strong> Always use gentle stimulation. Avoid deep needling and strong manipulation during pregnancy.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Labor Induction Protocols - Only show for 40+ weeks */}
          {result.gestationWeeks >= 40 && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Zap className="h-5 w-5" />
                  Labor Induction Protocols (40+ Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-amber-300 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Medical Coordination Required</AlertTitle>
                  <AlertDescription className="text-amber-700 text-sm">
                    Labor induction acupuncture should ONLY be performed:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>After 40 weeks gestation (confirmed)</li>
                      <li>With written physician approval</li>
                      <li>With proper monitoring available</li>
                      <li>Patient has no contraindications</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    LABOR INDUCTION POINTS & PROTOCOLS
                  </h4>
                  <div className="space-y-3">
                    {LABOR_INDUCTION_POINTS.map((point) => (
                      <div key={point.code} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <span className="text-lg">⚡</span>
                        <div>
                          <div className="font-bold text-purple-800">
                            {point.code} ({point.name}) - {point.chineseName}
                          </div>
                          <div className="text-sm text-purple-700">{point.protocol}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-purple-200 bg-purple-100">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800">Treatment Protocol</AlertTitle>
                  <AlertDescription className="text-purple-700 text-sm">
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li><strong>Primary combination:</strong> LI-4 + SP-6 bilateral (Four Gates variation)</li>
                      <li><strong>Add if needed:</strong> BL-60, BL-67 (moxa preferred), GB-21</li>
                      <li><strong>Treatment duration:</strong> 20-30 minutes</li>
                      <li><strong>Frequency:</strong> Daily or every other day until labor begins</li>
                      <li><strong>Monitoring:</strong> Watch for contractions during treatment</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 print:hidden">
            <Button variant="outline" onClick={printReport} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
            <Button variant="outline" onClick={resetCalculator} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New Calculation
            </Button>
          </div>

          {/* Save to Patient - Only show if patientId is provided */}
          {patientId && (
            <Button
              onClick={saveToPatient}
              disabled={isSaving}
              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving to Patient Record...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Pregnancy Data to Patient Record
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t print:hidden">
        <strong>CM Clinical Safety Calculator v2.0</strong><br />
        © 2026 Professional CM Clinic System<br />
        For licensed practitioners only. Always coordinate with obstetric care.
      </div>
    </div>
  );
}
