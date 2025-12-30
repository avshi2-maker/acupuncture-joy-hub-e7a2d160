import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, User, Loader2, Search, UserCheck, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { BrowserVoiceInput } from '@/components/ui/BrowserVoiceInput';
import { usePrintContent } from '@/hooks/usePrintContent';

interface PatientContext {
  ageGroup?: string;
  gender?: string;
  constitution?: string;
  isPregnant?: boolean;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
}

interface TreatmentPlannerFormProps {
  onSubmit: (diagnosis: string, patientId: string | null, patientContext: PatientContext) => void;
  isLoading: boolean;
}

interface Patient {
  id: string;
  full_name: string;
  constitution_type?: string;
  is_pregnant?: boolean;
  chief_complaint?: string;
}

export function TreatmentPlannerForm({ onSubmit, isLoading }: TreatmentPlannerFormProps) {
  const { user } = useAuth();
  const [diagnosis, setDiagnosis] = useState('');
  const [inputMode, setInputMode] = useState<'manual' | 'patient'>('manual');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [voiceLang, setVoiceLang] = useState('he-IL');
  const [patientContext, setPatientContext] = useState<PatientContext>({
    ageGroup: '',
    gender: '',
    constitution: '',
    isPregnant: false,
    allergies: '',
    medications: '',
    medicalHistory: '',
  });
  
  const formRef = useRef<HTMLDivElement>(null);
  const { printContent } = usePrintContent();

  // Fetch patients when in patient mode
  useEffect(() => {
    if (inputMode === 'patient' && user) {
      fetchPatients();
    }
  }, [inputMode, user]);

  const fetchPatients = async () => {
    if (!user) return;
    setIsLoadingPatients(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, constitution_type, is_pregnant, chief_complaint')
        .eq('therapist_id', user.id)
        .order('full_name');
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      toast.error('Failed to load patients');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosis.trim()) {
      onSubmit(
        diagnosis, 
        inputMode === 'patient' ? selectedPatientId : null,
        patientContext
      );
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setDiagnosis(prev => prev ? `${prev} ${text}` : text);
  };

  const handleAllergiesVoice = (text: string) => {
    setPatientContext(prev => ({ ...prev, allergies: prev.allergies ? `${prev.allergies} ${text}` : text }));
  };

  const handleMedicationsVoice = (text: string) => {
    setPatientContext(prev => ({ ...prev, medications: prev.medications ? `${prev.medications} ${text}` : text }));
  };

  const handleHistoryVoice = (text: string) => {
    setPatientContext(prev => ({ ...prev, medicalHistory: prev.medicalHistory ? `${prev.medicalHistory} ${text}` : text }));
  };

  const handlePrint = () => {
    printContent(formRef.current, { title: 'Treatment Plan Generator' });
  };

  const exampleDiagnoses = [
    "Liver Qi Stagnation with Spleen Qi Deficiency",
    "Kidney Yang Deficiency with Lower Back Pain",
    "Heart Blood Deficiency causing Insomnia",
    "Phlegm-Heat in Lungs with Productive Cough",
    "Blood Stasis with chronic shoulder pain",
  ];

  return (
    <Card className="border-jade/20" ref={formRef}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-jade" />
            Treatment Plan Generator
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
          Enter a TCM diagnosis and optionally link to a patient for personalized protocols.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Diagnosis Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="diagnosis">TCM Diagnosis / Pattern *</Label>
              <div className="flex items-center gap-2 no-print">
                <Select value={voiceLang} onValueChange={setVoiceLang}>
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he-IL">🇮🇱 עברית</SelectItem>
                    <SelectItem value="en-US">🇺🇸 English</SelectItem>
                    <SelectItem value="ru-RU">🇷🇺 Русский</SelectItem>
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
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter the TCM pattern/diagnosis (e.g., 'Liver Qi Stagnation with Blood Deficiency, presenting with headaches, irritability, and menstrual irregularities')"
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            
            {/* Quick Examples */}
            <div className="flex flex-wrap gap-2 mt-2 no-print">
              <span className="text-xs text-muted-foreground">Examples:</span>
              {exampleDiagnoses.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDiagnosis(example)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  disabled={isLoading}
                >
                  {example.length > 35 ? example.substring(0, 35) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Context Tabs */}
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'manual' | 'patient')}>
            <TabsList className="grid w-full grid-cols-2 no-print">
              <TabsTrigger value="manual" className="gap-2">
                <User className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="patient" className="gap-2">
                <UserCheck className="h-4 w-4" />
                Select Patient
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Age Group</Label>
                    <Select
                      value={patientContext.ageGroup}
                      onValueChange={(v) => setPatientContext(prev => ({ ...prev, ageGroup: v }))}
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
                      value={patientContext.gender}
                      onValueChange={(v) => setPatientContext(prev => ({ ...prev, gender: v }))}
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
                      value={patientContext.constitution}
                      onValueChange={(v) => setPatientContext(prev => ({ ...prev, constitution: v }))}
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

                  {patientContext.gender === 'female' && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="pregnant"
                        checked={patientContext.isPregnant}
                        onCheckedChange={(v) => setPatientContext(prev => ({ ...prev, isPregnant: v }))}
                        disabled={isLoading}
                      />
                      <Label htmlFor="pregnant">Pregnant</Label>
                    </div>
                  )}

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Allergies</Label>
                      <BrowserVoiceInput
                        onTranscription={handleAllergiesVoice}
                        disabled={isLoading}
                        size="sm"
                        language={voiceLang}
                      />
                    </div>
                    <Input
                      value={patientContext.allergies}
                      onChange={(e) => setPatientContext(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="Any known allergies..."
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Current Medications</Label>
                      <BrowserVoiceInput
                        onTranscription={handleMedicationsVoice}
                        disabled={isLoading}
                        size="sm"
                        language={voiceLang}
                      />
                    </div>
                    <Input
                      value={patientContext.medications}
                      onChange={(e) => setPatientContext(prev => ({ ...prev, medications: e.target.value }))}
                      placeholder="Current medications..."
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Medical History</Label>
                      <BrowserVoiceInput
                        onTranscription={handleHistoryVoice}
                        disabled={isLoading}
                        size="sm"
                        language={voiceLang}
                      />
                    </div>
                    <Textarea
                      value={patientContext.medicalHistory}
                      onChange={(e) => setPatientContext(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      placeholder="Relevant medical history..."
                      className="min-h-[60px]"
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patient" className="mt-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patients..."
                      className="pl-9"
                      disabled={isLoading || isLoadingPatients}
                    />
                  </div>

                  {isLoadingPatients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {patients.length === 0 ? 'No patients found. Add patients in CRM first.' : 'No matching patients.'}
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => setSelectedPatientId(patient.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedPatientId === patient.id
                              ? 'border-jade bg-jade/10'
                              : 'border-border hover:border-jade/50'
                          }`}
                          disabled={isLoading}
                        >
                          <div className="font-medium">{patient.full_name}</div>
                          <div className="text-xs text-muted-foreground flex gap-2">
                            {patient.constitution_type && <span>{patient.constitution_type}</span>}
                            {patient.is_pregnant && <span className="text-amber-500">Pregnant</span>}
                            {patient.chief_complaint && <span>• {patient.chief_complaint.substring(0, 30)}...</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPatientId && (
                    <div className="text-sm text-jade flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Patient selected - their full history will be included
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-jade hover:bg-jade/90 no-print"
            disabled={!diagnosis.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating Treatment Plan...
              </>
            ) : (
              <>
                <ClipboardList className="h-5 w-5 mr-2" />
                Generate Treatment Protocol
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
