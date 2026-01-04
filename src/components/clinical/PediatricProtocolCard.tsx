import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Pill, Syringe, MapPin, Heart, Droplets, AlertTriangle, Printer, Baby, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AgeGroup = 'infant' | 'young_child' | 'school_age' | 'teenager';
type Condition = 'immunity' | 'nausea' | 'pain' | 'fatigue' | 'anxiety';

interface ProtocolData {
  dosing: {
    basis: string;
    calculation: string;
    dailyDose: string;
  };
  needle: {
    gauge: string;
    depth: string;
    retention: string;
    technique: string;
  };
  points: string[];
  pointsFromRAG: boolean;
  alternatives: string;
  palatability: string;
  safety: string[];
}

const AGE_PROTOCOLS: Record<AgeGroup, { label: string; labelHe: string; dosingFactor: string; needle: { gauge: string; depth: string; retention: string; technique: string } }> = {
  infant: {
    label: 'Infant (0-2 yrs)',
    labelHe: 'תינוק (0-2)',
    dosingFactor: '10-15% of Adult Dose',
    needle: {
      gauge: 'Shonishin Only',
      depth: 'Non-insertive',
      retention: 'No retention - stroking technique',
      technique: 'Tapping, stroking, pressing tools only'
    }
  },
  young_child: {
    label: 'Young Child (3-6 yrs)',
    labelHe: 'ילד (3-6)',
    dosingFactor: '25-33% of Adult Dose',
    needle: {
      gauge: '34-36 Gauge (0.16mm)',
      depth: '2-4mm (0.5 cun max)',
      retention: '5-10 minutes max',
      technique: 'Quick insertion, minimal manipulation'
    }
  },
  school_age: {
    label: 'School Age (7-12 yrs)',
    labelHe: 'ילד בי"ס (7-12)',
    dosingFactor: '50-60% of Adult Dose',
    needle: {
      gauge: '32-34 Gauge (0.20mm)',
      depth: '4-8mm (0.5-1.0 cun)',
      retention: '10-15 minutes',
      technique: 'Gentle tonification, even method'
    }
  },
  teenager: {
    label: 'Teenager (13-18 yrs)',
    labelHe: 'נער (13-18)',
    dosingFactor: '80-100% of Adult Dose',
    needle: {
      gauge: '30-32 Gauge (0.25mm)',
      depth: '8-15mm (1.0 cun)',
      retention: '15-20 minutes',
      technique: 'Standard adult technique with monitoring'
    }
  }
};

const CONDITION_PROTOCOLS: Record<Condition, { label: string; labelHe: string; points: string[]; formula: string; alternatives: string }> = {
  immunity: {
    label: 'General Support (Immunity)',
    labelHe: 'חיסון וחיזוק',
    points: ['ST36 (Zusanli)', 'SP6 (Sanyinjiao)', 'LI4 (Hegu)', 'CV6 (Qihai)', 'BL23 (Shenshu)'],
    formula: 'Bu Zhong Yi Qi Tang (Modified)',
    alternatives: 'Tuina on ST36, Moxa stick warming (indirect), Pediatric massage on back-shu points'
  },
  nausea: {
    label: 'Chemo Nausea (Digestive)',
    labelHe: 'בחילות (עיכול)',
    points: ['PC6 (Neiguan)', 'ST36 (Zusanli)', 'CV12 (Zhongwan)', 'SP4 (Gongsun)', 'LI4 (Hegu)'],
    formula: 'Xiao Ban Xia Tang + Sheng Jiang',
    alternatives: 'Acupressure wristbands on PC6, Ginger compress on CV12, Aromatic inhalation (chen pi)'
  },
  pain: {
    label: 'Pain Management',
    labelHe: 'ניהול כאב',
    points: ['LI4 (Hegu)', 'LR3 (Taichong)', 'SP6 (Sanyinjiao)', 'GB34 (Yanglingquan)', 'Local Ashi points'],
    formula: 'Xiao Yao San (Modified for children)',
    alternatives: 'Gentle tuina, TENS on auricular points, Warm compresses, Guided imagery + breathing'
  },
  fatigue: {
    label: 'Fatigue / Low Energy',
    labelHe: 'עייפות / חולשה',
    points: ['ST36 (Zusanli)', 'SP3 (Taibai)', 'CV4 (Guanyuan)', 'GV20 (Baihui)', 'KI3 (Taixi)'],
    formula: 'Si Jun Zi Tang (Modified)',
    alternatives: 'Gentle moxa on CV4/CV6, Pediatric tuina, Rest and sleep optimization'
  },
  anxiety: {
    label: 'Anxiety / Emotional',
    labelHe: 'חרדה / רגשי',
    points: ['HT7 (Shenmen)', 'PC6 (Neiguan)', 'GV20 (Baihui)', 'Yintang', 'SP6 (Sanyinjiao)'],
    formula: 'Gui Pi Tang (Modified)',
    alternatives: 'Auricular seeds on Shenmen, Breathing exercises, Guided meditation for children'
  }
};

const PALATABILITY_TIPS: Record<AgeGroup, string> = {
  infant: 'Dilute heavily with breast milk/formula. Use dropper or syringe. 1-2ml doses.',
  young_child: 'Mix with honey (if >1yr), apple juice, or grape juice. Add to popsicle molds.',
  school_age: 'Offer with favorite juice. Consider granule formulas. Reward system after taking.',
  teenager: 'Capsules or tablets preferred. Can take standard decoctions with explanation.'
};

const ONCOLOGY_SAFETY = [
  'Check Platelets (PLT > 50,000) before any needling procedure',
  'Monitor for signs of infection - avoid treatment during neutropenic episodes',
  'Modify dose if liver enzymes (ALT/AST) are elevated > 2x normal',
  'Avoid direct heat/moxa on radiation treatment sites',
  'Coordinate timing with chemotherapy cycles (treat 48-72hrs post-infusion)',
  'Have emergency contact numbers readily available'
];

interface PediatricProtocolCardProps {
  animationDelay?: number;
  className?: string;
}

export function PediatricProtocolCard({ animationDelay = 0, className }: PediatricProtocolCardProps) {
  const [open, setOpen] = useState(false);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRAGPoints = async (ageLabel: string, conditionLabel: string): Promise<{ points: string[]; found: boolean }> => {
    try {
      const query = `TCM acupuncture protocol for ${conditionLabel} in ${ageLabel} pediatric patient, recommended acupoints`;
      
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: {
          query,
          context: 'pediatric_oncology',
          mode: 'points_only'
        }
      });

      if (error) {
        console.error('RAG error:', error);
        return { points: [], found: false };
      }

      // Extract points from response
      if (data?.response_structure?.clinical_protocol?.points?.length > 0) {
        return { points: data.response_structure.clinical_protocol.points, found: true };
      }

      // Try to parse from AI narrative for point patterns
      const narrative = data?.ai_narrative || data?.response || '';
      const pointPattern = /([A-Z]{1,3}\d{1,2})\s*\([^)]+\)/g;
      const matches = [...narrative.matchAll(pointPattern)];
      if (matches.length > 0) {
        const extractedPoints = matches.slice(0, 6).map(m => m[0]);
        return { points: extractedPoints, found: true };
      }

      return { points: [], found: false };
    } catch (err) {
      console.error('RAG fetch error:', err);
      return { points: [], found: false };
    }
  };

  const generateProtocol = async () => {
    if (!ageGroup || !condition) return;

    setIsLoading(true);
    const ageData = AGE_PROTOCOLS[ageGroup];
    const conditionData = CONDITION_PROTOCOLS[condition];

    // Try to get enhanced points from RAG
    const ragResult = await fetchRAGPoints(ageData.label, conditionData.label);
    
    const finalPoints = ragResult.found && ragResult.points.length > 0 
      ? ragResult.points 
      : conditionData.points;

    const newProtocol: ProtocolData = {
      dosing: {
        basis: conditionData.formula,
        calculation: ageData.dosingFactor,
        dailyDose: calculateDose(ageGroup)
      },
      needle: ageData.needle,
      points: finalPoints,
      pointsFromRAG: ragResult.found,
      alternatives: conditionData.alternatives,
      palatability: PALATABILITY_TIPS[ageGroup],
      safety: ONCOLOGY_SAFETY
    };

    setProtocol(newProtocol);
    setShowProtocol(true);
    setIsLoading(false);

    if (ragResult.found) {
      toast.success('נקודות עודכנו מבסיס הידע');
    }
  };

  const calculateDose = (age: AgeGroup): string => {
    const baseDose = 10;
    switch (age) {
      case 'infant': return `${(baseDose * 0.10).toFixed(1)}-${(baseDose * 0.15).toFixed(1)}g`;
      case 'young_child': return `${(baseDose * 0.25).toFixed(1)}-${(baseDose * 0.33).toFixed(1)}g`;
      case 'school_age': return `${(baseDose * 0.50).toFixed(1)}-${(baseDose * 0.60).toFixed(1)}g`;
      case 'teenager': return `${(baseDose * 0.80).toFixed(1)}-${(baseDose * 1.0).toFixed(1)}g`;
      default: return '--';
    }
  };

  const handlePrint = () => {
    if (!protocol || !ageGroup || !condition) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Pediatric Oncology Protocol</title>
        <style>
          body { font-family: 'Heebo', Arial, sans-serif; padding: 20px; direction: rtl; }
          h1 { color: #48bb78; border-bottom: 2px solid #48bb78; padding-bottom: 10px; }
          .section { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 8px; }
          .section h3 { color: #2d3748; margin-top: 0; }
          .warning { background: #feebc8; padding: 10px; border-radius: 5px; margin: 5px 0; }
          .badge { display: inline-block; padding: 3px 8px; background: #e2e8f0; border-radius: 4px; margin: 2px; }
          ul { padding-right: 20px; }
          .rag-badge { background: #48bb78; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 0.9rem; color: #718096; }
        </style>
      </head>
      <body>
        <h1>🧸 Pediatric Oncology Protocol</h1>
        <p><strong>Age Group:</strong> ${AGE_PROTOCOLS[ageGroup].label}</p>
        <p><strong>Condition:</strong> ${CONDITION_PROTOCOLS[condition].label}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
        
        <div class="section">
          <h3>⚖️ 1. Age-Based Herbal Dosing</h3>
          <p><strong>Formula Basis:</strong> ${protocol.dosing.basis}</p>
          <p><strong>Calculation:</strong> ${protocol.dosing.calculation}</p>
          <p><strong>Recommended Daily Dose:</strong> ${protocol.dosing.dailyDose}</p>
        </div>
        
        <div class="section">
          <h3>💉 2. Needle Specifications</h3>
          <p><strong>Gauge:</strong> ${protocol.needle.gauge}</p>
          <p><strong>Depth:</strong> ${protocol.needle.depth}</p>
          <p><strong>Retention Time:</strong> ${protocol.needle.retention}</p>
          <p><strong>Technique:</strong> ${protocol.needle.technique}</p>
        </div>
        
        <div class="section">
          <h3>📍 3. Point Protocol ${protocol.pointsFromRAG ? '<span class="rag-badge">RAG Enhanced</span>' : ''}</h3>
          <ul>${protocol.points.map(p => `<li>${p}</li>`).join('')}</ul>
          <p><em>*Use fewer points for younger/weaker patients.</em></p>
        </div>
        
        <div class="section">
          <h3>🧸 4. Needle-Sensitive Alternatives</h3>
          <p>${protocol.alternatives}</p>
        </div>
        
        <div class="section">
          <h3>🍯 5. Palatability Tips</h3>
          <p>${protocol.palatability}</p>
        </div>
        
        <div class="section">
          <h3>⚠️ 6. Safety & Monitoring (Oncology)</h3>
          <ul>${protocol.safety.map(s => `<li class="warning">${s}</li>`).join('')}</ul>
        </div>
        
        <div class="footer">
          <p>⚖️ Disclaimer: This protocol is for professional reference only. Not MOH approved medicine.</p>
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

  const resetDialog = () => {
    setAgeGroup('');
    setCondition('');
    setProtocol(null);
    setShowProtocol(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetDialog(); }}>
      <DialogTrigger asChild>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 opacity-0 animate-fade-in ${className}`}
          style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Baby className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">פרוטוקולים פדיאטריים</CardTitle>
                <CardDescription className="text-xs">Pediatric Oncology</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              מינון, מחטים ונקודות מותאמים לגיל
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="text-3xl">🧸</span>
            <div>
              <h2 className="text-xl font-semibold">Pediatric Oncology Protocols</h2>
              <p className="text-sm text-muted-foreground">מחולל פרוטוקולים מותאמים לגיל ומצב</p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">קבוצת גיל</label>
              <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר גיל..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AGE_PROTOCOLS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.labelHe} - {val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">מצב רפואי</label>
              <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מצב..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_PROTOCOLS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.labelHe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateProtocol} 
            disabled={!ageGroup || !condition || isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                מחפש בבסיס הידע...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                צור פרוטוקול קליני
              </>
            )}
          </Button>

          {/* Protocol Display */}
          {showProtocol && protocol && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              {/* Dosing */}
              <div className="p-3 border rounded-lg space-y-1">
                <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm">
                  <Pill className="h-4 w-4" />
                  1. מינון צמחי לפי גיל
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>נוסחה:</strong> {protocol.dosing.basis}</p>
                  <p><strong>חישוב:</strong> {protocol.dosing.calculation}</p>
                  <Badge variant="secondary">מינון יומי: {protocol.dosing.dailyDose}</Badge>
                </div>
              </div>

              {/* Needle */}
              <div className="p-3 border rounded-lg space-y-1">
                <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm">
                  <Syringe className="h-4 w-4" />
                  2. מפרט מחטים
                </h4>
                <div className="flex flex-wrap gap-2 mb-1">
                  <Badge>{protocol.needle.gauge}</Badge>
                  <Badge>{protocol.needle.depth}</Badge>
                </div>
                <p className="text-xs"><strong>זמן שהייה:</strong> {protocol.needle.retention}</p>
                <p className="text-xs"><strong>טכניקה:</strong> {protocol.needle.technique}</p>
              </div>

              {/* Points */}
              <div className="p-3 border rounded-lg space-y-1">
                <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  3. פרוטוקול נקודות
                  {protocol.pointsFromRAG && (
                    <Badge variant="default" className="bg-green-600 text-xs">RAG</Badge>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {protocol.points.map((point, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{point}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">*השתמש בפחות נקודות לילדים צעירים/חלשים</p>
              </div>

              {/* Alternatives */}
              <div className="p-3 border rounded-lg space-y-1">
                <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4" />
                  4. חלופות ללא מחטים
                </h4>
                <p className="text-xs">{protocol.alternatives}</p>
              </div>

              {/* Palatability */}
              <div className="p-3 border rounded-lg space-y-1">
                <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4" />
                  5. טיפים לטעם
                </h4>
                <p className="text-xs">{protocol.palatability}</p>
              </div>

              {/* Safety */}
              <div className="p-3 border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg space-y-1">
                <h4 className="font-semibold text-amber-700 flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  6. בטיחות ומעקב (אונקולוגיה)
                </h4>
                <ul className="text-xs space-y-1">
                  {protocol.safety.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-500">⚠️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" onClick={handlePrint} className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                הדפס כרטיס פרוטוקול
              </Button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground border-t pt-3">
            ⚖️ לשימוש מקצועי בלבד. לא מאושר ע"י משרד הבריאות.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
