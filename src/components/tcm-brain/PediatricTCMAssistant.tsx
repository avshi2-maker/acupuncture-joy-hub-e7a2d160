import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Pill, Syringe, ShieldAlert, Calculator, AlertTriangle, Droplet, Heart, Radiation, Activity, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type TabType = 'dosing' | 'needle' | 'safety' | 'oncology';
type MethodType = 'weight' | 'age';
type OncologyStatus = 'none' | 'chemo' | 'radiation' | 'surgery';

interface NeedleSpec {
  gauge: string;
  depth: string;
  retention: string;
  totalPoints: string;
  note: string;
}

const NEEDLE_SPECS: Record<string, NeedleSpec> = {
  'infant': {
    gauge: 'No Needle',
    depth: 'Surface',
    retention: '1-3 min',
    totalPoints: 'Shonishin Only',
    note: '💡 Key Approach: Gentle tapping. Teach parents home massage.'
  },
  'young': {
    gauge: '40-42 (0.16mm)',
    depth: '1-3mm',
    retention: '5-10 min',
    totalPoints: '3-5 points',
    note: '💡 Key Approach: Quick insertion, minimal retention. Distraction techniques.'
  },
  'school': {
    gauge: '36-40 (0.20mm)',
    depth: '5-10mm',
    retention: '10-15 min',
    totalPoints: '5-8 points',
    note: '💡 Key Approach: Can tolerate more points. Explain the process.'
  },
  'adolescent': {
    gauge: '32-36 (0.25mm)',
    depth: '10-20mm',
    retention: '15-20 min',
    totalPoints: '8-12 points',
    note: '💡 Key Approach: Near-adult protocols. Consider emotional sensitivity.'
  }
};

const AGE_FACTORS: Record<string, { factor: number; label: string }> = {
  'infant': { factor: 0.1, label: 'Infant (0-1 yr)' },
  '1-2': { factor: 0.15, label: '1-2 years' },
  '2-4': { factor: 0.2, label: '2-4 years' },
  '4-6': { factor: 0.25, label: '4-6 years' },
  '6-12': { factor: 0.5, label: '6-12 years' },
  '12+': { factor: 0.75, label: '12+ years' }
};

const ONCOLOGY_WARNINGS = {
  chemo: {
    title: 'Chemotherapy Detected',
    warnings: [
      'Avoid strong blood-moving herbs (Tao Ren, Hong Hua, San Leng, E Zhu)',
      'Verify platelet count before acupuncture (bleeding risk if <50k)',
      'High-dose antioxidants may interfere with oxidative chemo drugs',
      'Prioritize gentle Qi tonics and nausea relief formulas'
    ]
  },
  radiation: {
    title: 'Radiation Therapy Detected',
    warnings: [
      'Avoid topical treatment on irradiated skin areas',
      'Focus on Yin-nourishing herbs to counter radiation dryness',
      'Monitor for radiation-induced Heat patterns',
      'Support bone marrow with blood-building formulas post-treatment'
    ]
  }
};

export function PediatricTCMAssistant() {
  const [activeTab, setActiveTab] = useState<TabType>('dosing');
  
  // Oncology safety state
  const [oncologyStatus, setOncologyStatus] = useState<OncologyStatus>('none');
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [showOncologyAlert, setShowOncologyAlert] = useState(false);
  
  // Dosing calculator state
  const [adultDose, setAdultDose] = useState('');
  const [method, setMethod] = useState<MethodType>('weight');
  const [childWeight, setChildWeight] = useState('');
  const [childAge, setChildAge] = useState('4-6');
  const [calculatedDose, setCalculatedDose] = useState<number | null>(null);
  const [doseMethod, setDoseMethod] = useState('');
  
  // Needle spec state
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('infant');

  // Handle oncology status changes
  useEffect(() => {
    if (oncologyStatus === 'chemo' || oncologyStatus === 'radiation') {
      setShowOncologyAlert(true);
      setSafetyAcknowledged(false);
    } else {
      setShowOncologyAlert(false);
      setSafetyAcknowledged(true);
    }
  }, [oncologyStatus]);

  const calculateDose = () => {
    const adult = parseFloat(adultDose);
    if (isNaN(adult) || adult <= 0) return;
    
    let dose: number;
    let methodName: string;
    
    if (method === 'weight') {
      const weight = parseFloat(childWeight);
      if (isNaN(weight) || weight <= 0) return;
      dose = (weight / 70) * adult;
      methodName = "Clark's Rule (Weight-based)";
    } else {
      const factor = AGE_FACTORS[childAge]?.factor || 0.25;
      dose = adult * factor;
      methodName = `Age-based Factor (${(factor * 100).toFixed(0)}%)`;
    }
    
    setCalculatedDose(Math.round(dose * 100) / 100);
    setDoseMethod(methodName);
  };

  const currentNeedleSpec = NEEDLE_SPECS[selectedAgeGroup];
  const isOncologyActive = oncologyStatus === 'chemo' || oncologyStatus === 'radiation';
  const isBlocked = isOncologyActive && !safetyAcknowledged;

  const tabs = [
    { id: 'dosing' as TabType, label: 'Dosing', icon: Calculator },
    { id: 'needle' as TabType, label: 'Needle', icon: Syringe },
    { id: 'oncology' as TabType, label: 'Oncology', icon: Radiation },
    { id: 'safety' as TabType, label: 'Safety', icon: ShieldAlert },
  ];

  return (
    <TooltipProvider>
      <Card className="max-w-md overflow-hidden border border-slate-200 shadow-lg">
        {/* Header */}
        <CardHeader className="bg-green-500 text-white p-4 flex flex-row items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Pediatric TCM Assistant
          </h3>
          <div className="flex items-center gap-2">
            {isOncologyActive && (
              <Tooltip>
                <TooltipTrigger>
                  <div className={`p-1 rounded-full ${safetyAcknowledged ? 'bg-green-600' : 'bg-red-500 animate-pulse'}`}>
                    {safetyAcknowledged ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {safetyAcknowledged ? 'Safety protocols acknowledged' : 'Safety acknowledgment required'}
                </TooltipContent>
              </Tooltip>
            )}
            <Pill className="h-6 w-6" />
          </div>
        </CardHeader>

        {/* Oncology Alert Banner */}
        <AnimatePresence>
          {showOncologyAlert && !safetyAcknowledged && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-r-4 border-red-500 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  ⚠️ {ONCOLOGY_WARNINGS[oncologyStatus as 'chemo' | 'radiation']?.title || 'Oncology Alert'}
                </div>
                <ul className="text-sm text-red-800 space-y-1 mr-5 list-disc list-inside">
                  {ONCOLOGY_WARNINGS[oncologyStatus as 'chemo' | 'radiation']?.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setSafetyAcknowledged(true)}
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  I acknowledge these safety protocols
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 border-b-3 border-green-500'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700'
              } ${tab.id === 'oncology' && isOncologyActive ? (safetyAcknowledged ? 'text-green-600' : 'text-red-500') : ''}`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <CardContent className="p-5 min-h-[280px] relative">
          {/* Blocked Overlay */}
          <AnimatePresence>
            {isBlocked && activeTab !== 'oncology' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
              >
                <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-red-700 font-semibold mb-2">Oncology Safety Check Required</p>
                <p className="text-sm text-slate-600 mb-4">
                  Please acknowledge the safety protocols before accessing dosing and needle recommendations.
                </p>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => setActiveTab('oncology')}
                >
                  Go to Oncology Status
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Dosing Calculator */}
            {activeTab === 'dosing' && (
              <motion.div
                key="dosing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-600">Adult Dose (grams):</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 9"
                    value={adultDose}
                    onChange={(e) => setAdultDose(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-600">Method:</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as MethodType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">By Weight (Most Accurate)</SelectItem>
                      <SelectItem value="age">By Age (Guideline)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {method === 'weight' ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-600">Child's Weight (kg):</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 20"
                      value={childWeight}
                      onChange={(e) => setChildWeight(e.target.value)}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-600">Child's Age:</Label>
                    <Select value={childAge} onValueChange={setChildAge}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AGE_FACTORS).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={calculateDose} className="w-full bg-green-500 hover:bg-green-600">
                  Calculate Child Dose
                </Button>

                {calculatedDose !== null && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-green-700">
                      {calculatedDose} g
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Based on {doseMethod}
                    </div>
                    {isOncologyActive && (
                      <div className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Review oncology contraindications
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Needle Specifications */}
            {activeTab === 'needle' && (
              <motion.div
                key="needle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-600">Select Age Group:</Label>
                  <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infant">Infant (0-2 yrs)</SelectItem>
                      <SelectItem value="young">Young Child (3-6 yrs)</SelectItem>
                      <SelectItem value="school">School Age (6-12 yrs)</SelectItem>
                      <SelectItem value="adolescent">Adolescent (12-18 yrs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <span className="text-xs text-slate-400 block">Gauge (Thickness)</span>
                    <span className="font-bold text-slate-700">{currentNeedleSpec.gauge}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <span className="text-xs text-slate-400 block">Depth</span>
                    <span className="font-bold text-slate-700">{currentNeedleSpec.depth}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <span className="text-xs text-slate-400 block">Retention Time</span>
                    <span className="font-bold text-slate-700">{currentNeedleSpec.retention}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <span className="text-xs text-slate-400 block">Total Points</span>
                    <span className="font-bold text-slate-700">{currentNeedleSpec.totalPoints}</span>
                  </div>
                </div>

                {isOncologyActive && oncologyStatus === 'chemo' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Verify platelet count &gt;50k before needling. Consider non-needle alternatives.</span>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  {currentNeedleSpec.note}
                </div>
              </motion.div>
            )}

            {/* Oncology Status */}
            {activeTab === 'oncology' && (
              <motion.div
                key="oncology"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radiation className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-slate-700">Oncology Treatment Status</h4>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-600">
                    Is the patient currently undergoing active treatment?
                  </Label>
                  <Select value={oncologyStatus} onValueChange={(v) => setOncologyStatus(v as OncologyStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Active Treatment</SelectItem>
                      <SelectItem value="chemo">Chemotherapy</SelectItem>
                      <SelectItem value="radiation">Radiation Therapy</SelectItem>
                      <SelectItem value="surgery">Pre/Post Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {oncologyStatus === 'none' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-700">No active oncology treatment. Standard pediatric protocols apply.</p>
                  </div>
                )}

                {oncologyStatus === 'surgery' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
                      <Activity className="h-5 w-5" />
                      Pre/Post Surgery Guidelines
                    </div>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Avoid blood-moving herbs 7 days pre-surgery</li>
                      <li>Post-surgery: Support healing with Qi & Blood tonics</li>
                      <li>Gentle acupuncture OK 2+ weeks post-op</li>
                    </ul>
                  </div>
                )}

                {isOncologyActive && (
                  <div className={`rounded-lg p-4 ${safetyAcknowledged ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {safetyAcknowledged ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">Safety protocols acknowledged</span>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setSafetyAcknowledged(true)}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Acknowledge Safety Protocols
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Safety & Alternatives */}
            {activeTab === 'safety' && (
              <motion.div
                key="safety"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex gap-3 p-3 border-b border-slate-100">
                  <div className="text-orange-500 mt-0.5">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Non-Needle Alternatives:</span>
                    <p className="text-slate-600 mt-1">
                      Shonishin, Laser Acupuncture (Painless), Ear Seeds, Magnetic Pellets.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 border-b border-slate-100">
                  <div className="text-amber-500 mt-0.5">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Palatability Tips:</span>
                    <p className="text-slate-600 mt-1">
                      Mix herbs with pear juice, honey (age 1+), or rice syrup. Serve lukewarm, not hot.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 border-b border-slate-100">
                  <div className="text-red-500 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Oncology Caution:</span>
                    <p className="text-slate-600 mt-1">
                      Avoid strong Blood-moving herbs if platelets &lt;50k. Clear Heat-Toxin gently.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3">
                  <div className="text-pink-500 mt-0.5">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Emotional Care:</span>
                    <p className="text-slate-600 mt-1">
                      Include parents in treatment. Use play-based explanations for younger children.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default PediatricTCMAssistant;
