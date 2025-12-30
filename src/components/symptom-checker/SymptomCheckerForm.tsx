import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, User, Loader2, Printer } from 'lucide-react';
import { BrowserVoiceInput } from '@/components/ui/BrowserVoiceInput';
import { usePrintContent } from '@/hooks/usePrintContent';

interface PatientInfo {
  ageGroup?: string;
  gender?: string;
  constitution?: string;
  isPregnant?: boolean;
}

interface SymptomCheckerFormProps {
  onSubmit: (symptoms: string, patientInfo: PatientInfo) => void;
  isLoading: boolean;
}

export function SymptomCheckerForm({ onSubmit, isLoading }: SymptomCheckerFormProps) {
  const [symptoms, setSymptoms] = useState('');
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [voiceLang, setVoiceLang] = useState('he-IL');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    ageGroup: '',
    gender: '',
    constitution: '',
    isPregnant: false,
  });
  
  const formRef = useRef<HTMLDivElement>(null);
  const { printContent } = usePrintContent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim()) {
      onSubmit(symptoms, patientInfo);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setSymptoms(prev => prev ? `${prev} ${text}` : text);
  };

  const handlePrint = () => {
    printContent(formRef.current, { title: 'Symptom Checker Form' });
  };

  const exampleSymptoms = [
    "כאבי ראש חזקים בצד ימין, עם עצבנות וטעם מר בפה",
    "Fatigue, cold hands and feet, loose stools, pale complexion",
    "Insomnia with vivid dreams, palpitations, anxiety, night sweats",
    "Lower back pain with knee weakness, frequent urination at night",
  ];

  return (
    <Card className="border-jade/20" ref={formRef}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-jade" />
            Describe Patient Symptoms
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="no-print"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
        <CardDescription>
          Enter symptoms in any language. The AI will analyze and suggest TCM patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symptoms Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="symptoms">Symptoms Description *</Label>
              <div className="flex items-center gap-2 no-print">
                <Select value={voiceLang} onValueChange={setVoiceLang}>
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he-IL">🇮🇱 עברית</SelectItem>
                    <SelectItem value="en-US">🇺🇸 English</SelectItem>
                    <SelectItem value="ru-RU">🇷🇺 Русский</SelectItem>
                    <SelectItem value="ar-SA">🇸🇦 العربية</SelectItem>
                    <SelectItem value="zh-CN">🇨🇳 中文</SelectItem>
                  </SelectContent>
                </Select>
                <BrowserVoiceInput
                  onTranscription={handleVoiceTranscription}
                  disabled={isLoading}
                  size="sm"
                  language={voiceLang}
                  continuous
                />
              </div>
            </div>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe the patient's symptoms in detail... (e.g., headache location, pain quality, accompanying symptoms, aggravating/relieving factors)"
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            
            {/* Quick Examples */}
            <div className="flex flex-wrap gap-2 mt-2 no-print">
              <span className="text-xs text-muted-foreground">Examples:</span>
              {exampleSymptoms.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSymptoms(example)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors truncate max-w-[200px]"
                  disabled={isLoading}
                >
                  {example.length > 40 ? example.substring(0, 40) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Patient Info Toggle */}
          <div className="flex items-center gap-2 no-print">
            <Switch
              id="patient-info"
              checked={showPatientInfo}
              onCheckedChange={setShowPatientInfo}
              disabled={isLoading}
            />
            <Label htmlFor="patient-info" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              Add Patient Context (optional)
            </Label>
          </div>

          {/* Patient Info Fields */}
          {showPatientInfo && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Age Group</Label>
                  <Select
                    value={patientInfo.ageGroup}
                    onValueChange={(v) => setPatientInfo(prev => ({ ...prev, ageGroup: v }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child (0-12)</SelectItem>
                      <SelectItem value="teen">Teen (13-19)</SelectItem>
                      <SelectItem value="adult">Adult (20-39)</SelectItem>
                      <SelectItem value="middle">Middle Age (40-59)</SelectItem>
                      <SelectItem value="senior">Senior (60+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={patientInfo.gender}
                    onValueChange={(v) => setPatientInfo(prev => ({ ...prev, gender: v }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Constitution Type</Label>
                  <Select
                    value={patientInfo.constitution}
                    onValueChange={(v) => setPatientInfo(prev => ({ ...prev, constitution: v }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select constitution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (平和)</SelectItem>
                      <SelectItem value="qi-deficiency">Qi Deficiency (气虚)</SelectItem>
                      <SelectItem value="yang-deficiency">Yang Deficiency (阳虚)</SelectItem>
                      <SelectItem value="yin-deficiency">Yin Deficiency (阴虚)</SelectItem>
                      <SelectItem value="phlegm-dampness">Phlegm-Dampness (痰湿)</SelectItem>
                      <SelectItem value="damp-heat">Damp-Heat (湿热)</SelectItem>
                      <SelectItem value="blood-stasis">Blood Stasis (血瘀)</SelectItem>
                      <SelectItem value="qi-stagnation">Qi Stagnation (气郁)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {patientInfo.gender === 'female' && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pregnant"
                      checked={patientInfo.isPregnant}
                      onCheckedChange={(v) => setPatientInfo(prev => ({ ...prev, isPregnant: v }))}
                      disabled={isLoading}
                    />
                    <Label htmlFor="pregnant">Pregnant</Label>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-jade hover:bg-jade/90 no-print"
            disabled={!symptoms.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Stethoscope className="h-5 w-5 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
