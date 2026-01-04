import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Pill, Syringe, MapPin, Heart, Droplets, AlertTriangle, Printer } from 'lucide-react';

type AgeGroup = 'infant' | 'young_child' | 'school_age' | 'teenager';
type Condition = 'immunity' | 'nausea' | 'pain';

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
  alternatives: string;
  palatability: string;
  safety: string[];
}

const AGE_PROTOCOLS: Record<AgeGroup, { label: string; dosingFactor: string; needle: { gauge: string; depth: string; retention: string; technique: string } }> = {
  infant: {
    label: 'Infant (0-2 yrs)',
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
    dosingFactor: '80-100% of Adult Dose',
    needle: {
      gauge: '30-32 Gauge (0.25mm)',
      depth: '8-15mm (1.0 cun)',
      retention: '15-20 minutes',
      technique: 'Standard adult technique with monitoring'
    }
  }
};

const CONDITION_PROTOCOLS: Record<Condition, { label: string; points: string[]; formula: string; alternatives: string }> = {
  immunity: {
    label: 'General Support (Immunity)',
    points: ['ST36 (Zusanli)', 'SP6 (Sanyinjiao)', 'LI4 (Hegu)', 'CV6 (Qihai)', 'BL23 (Shenshu)'],
    formula: 'Bu Zhong Yi Qi Tang (Modified)',
    alternatives: 'Tuina on ST36, Moxa stick warming (indirect), Pediatric massage on back-shu points'
  },
  nausea: {
    label: 'Chemo Nausea (Digestive)',
    points: ['PC6 (Neiguan)', 'ST36 (Zusanli)', 'CV12 (Zhongwan)', 'SP4 (Gongsun)', 'LI4 (Hegu)'],
    formula: 'Xiao Ban Xia Tang + Sheng Jiang',
    alternatives: 'Acupressure wristbands on PC6, Ginger compress on CV12, Aromatic inhalation (chen pi)'
  },
  pain: {
    label: 'Pain Management',
    points: ['LI4 (Hegu)', 'LR3 (Taichong)', 'SP6 (Sanyinjiao)', 'GB34 (Yanglingquan)', 'Local Ashi points'],
    formula: 'Xiao Yao San (Modified for children)',
    alternatives: 'Gentle tuina, TENS on auricular points, Warm compresses, Guided imagery + breathing'
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

export function PediatricProtocolGenerator() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);

  const generateProtocol = () => {
    if (!ageGroup || !condition) return;

    const ageData = AGE_PROTOCOLS[ageGroup];
    const conditionData = CONDITION_PROTOCOLS[condition];

    const newProtocol: ProtocolData = {
      dosing: {
        basis: conditionData.formula,
        calculation: ageData.dosingFactor,
        dailyDose: calculateDose(ageGroup)
      },
      needle: ageData.needle,
      points: conditionData.points,
      alternatives: conditionData.alternatives,
      palatability: PALATABILITY_TIPS[ageGroup],
      safety: ONCOLOGY_SAFETY
    };

    setProtocol(newProtocol);
    setShowProtocol(true);
  };

  const calculateDose = (age: AgeGroup): string => {
    const baseDose = 10; // Standard adult dose in grams
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
          <h3>📍 3. Point Protocol</h3>
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
          <p>⚖️ Disclaimer: This protocol is for professional reference only. Not MOH approved medicine. Use under licensed practitioner guidance.</p>
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

  return (
    <Card className="w-full max-w-2xl mx-auto border-green-200 bg-gradient-to-b from-green-50/50 to-background">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧸</span>
          <div>
            <CardTitle className="text-xl text-white">Pediatric Oncology Protocols</CardTitle>
            <CardDescription className="text-green-100">
              Customized Safety, Dosing & Technique Generator
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Age Group (קבוצת גיל)</label>
            <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infant">Infant (0-2 yrs)</SelectItem>
                <SelectItem value="young_child">Young Child (3-6 yrs)</SelectItem>
                <SelectItem value="school_age">School Age (7-12 yrs)</SelectItem>
                <SelectItem value="teenager">Teenager (13-18 yrs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Condition (מצב רפואי)</label>
            <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immunity">General Support (Immunity)</SelectItem>
                <SelectItem value="nausea">Chemo Nausea (Digestive)</SelectItem>
                <SelectItem value="pain">Pain Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={generateProtocol} 
          disabled={!ageGroup || !condition}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Zap className="h-4 w-4 mr-2" />
          Generate Clinical Protocol
        </Button>

        {/* Protocol Display */}
        {showProtocol && protocol && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Dosing Section */}
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Pill className="h-4 w-4" />
                1. Age-Based Herbal Dosing
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Formula Basis:</strong> {protocol.dosing.basis}</p>
                <p><strong>Calculation:</strong> {protocol.dosing.calculation}</p>
                <Badge variant="secondary" className="mt-2">
                  Rec. Daily Dose: {protocol.dosing.dailyDose}
                </Badge>
              </div>
            </div>

            {/* Needle Section */}
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                2. Needle Specifications
              </h4>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{protocol.needle.gauge}</Badge>
                <Badge>{protocol.needle.depth}</Badge>
              </div>
              <p className="text-sm"><strong>Retention Time:</strong> {protocol.needle.retention}</p>
              <p className="text-sm"><strong>Technique:</strong> {protocol.needle.technique}</p>
            </div>

            {/* Points Section */}
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                3. Point Protocol
              </h4>
              <div className="flex flex-wrap gap-2">
                {protocol.points.map((point, i) => (
                  <Badge key={i} variant="outline">{point}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                *Use fewer points for younger/weaker patients.
              </p>
            </div>

            {/* Alternatives Section */}
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                4. Needle-Sensitive Alternatives
              </h4>
              <p className="text-sm">{protocol.alternatives}</p>
            </div>

            {/* Palatability Section */}
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                5. Palatability Tips
              </h4>
              <p className="text-sm">{protocol.palatability}</p>
            </div>

            {/* Safety Section */}
            <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-lg space-y-2">
              <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                6. Safety & Monitoring (Oncology)
              </h4>
              <ul className="text-sm space-y-2">
                {protocol.safety.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">⚠️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Print Button */}
            <Button variant="outline" onClick={handlePrint} className="w-full">
              <Printer className="h-4 w-4 mr-2" />
              Print Protocol Card
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground border-t pt-4">
          ⚖️ Disclaimer: Not MOH Approved Medicine. Use under professional guidance.
        </p>
      </CardContent>
    </Card>
  );
}
