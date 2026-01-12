import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Save, 
  CheckCircle2, 
  Loader2, 
  ChevronDown,
  User,
  Stethoscope,
  FileText,
  ClipboardList,
  Clock,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Common pulse findings
const PULSE_OPTIONS = [
  'Wiry', 'Slippery', 'Rapid', 'Slow', 'Thin', 'Weak', 
  'Deep', 'Floating', 'Choppy', 'Tight', 'Soggy', 'Hidden'
];

// Common tongue findings
const TONGUE_OPTIONS = [
  'Pale', 'Red', 'Purple', 'Swollen', 'Thin', 'Teeth marks',
  'Thin white coat', 'Thick white coat', 'Yellow coat', 'No coat',
  'Geographic', 'Cracked', 'Deviated', 'Red tip'
];

// Common TCM patterns
const TCM_PATTERNS = [
  'Liver Qi Stagnation', 'Liver Yang Rising', 'Liver Blood Deficiency',
  'Spleen Qi Deficiency', 'Spleen Yang Deficiency', 'Dampness',
  'Kidney Yin Deficiency', 'Kidney Yang Deficiency', 'Kidney Jing Deficiency',
  'Heart Blood Deficiency', 'Heart Yin Deficiency', 'Heart Fire',
  'Lung Qi Deficiency', 'Lung Yin Deficiency', 'Phlegm in Lungs',
  'Blood Stasis', 'Qi Deficiency', 'Yang Deficiency', 'Yin Deficiency'
];

interface SessionNotesData {
  chiefComplaint: string;
  medicalBackground: string;
  currentMedications: string;
  pulseFindings: string[];
  tongueFindings: string[];
  otherObjective: string;
  tcmPattern: string;
  assessmentNotes: string;
  treatmentPrinciple: string;
  planNotes: string;
  selectedPoints: string[];
  herbsPrescribed: string;
  followUpRecommended: string;
}

interface SessionNotesProps {
  patientId: string;
  visitId?: string;
  onPlanUpdate?: (planText: string) => void;
  initialPlanText?: string;
  onPatternChange?: (pattern: string) => void;
  onNotesUpdate?: (notes: Partial<SessionNotesData>) => void;
}

export function SessionNotes({ patientId, visitId, onPlanUpdate, initialPlanText, onPatternChange, onNotesUpdate }: SessionNotesProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [expandedSections, setExpandedSections] = useState({
    subjective: true,
    objective: true,
    assessment: true,
    plan: true
  });

  const [notes, setNotes] = useState<SessionNotesData>({
    chiefComplaint: '',
    medicalBackground: '',
    currentMedications: '',
    pulseFindings: [],
    tongueFindings: [],
    otherObjective: '',
    tcmPattern: '',
    assessmentNotes: '',
    treatmentPrinciple: '',
    planNotes: initialPlanText || '',
    selectedPoints: [],
    herbsPrescribed: '',
    followUpRecommended: ''
  });

  // Update planNotes when initialPlanText changes (from RAG panel insert)
  useEffect(() => {
    if (initialPlanText && initialPlanText !== notes.planNotes) {
      setNotes(prev => ({
        ...prev,
        planNotes: prev.planNotes 
          ? `${prev.planNotes}\n\n--- AI Suggestion ---\n${initialPlanText}`
          : initialPlanText
      }));
      setHasUnsavedChanges(true);
    }
  }, [initialPlanText]);

  // Load patient data and existing visit on mount - INTELLIGENT PRE-FILLING
  useEffect(() => {
    async function loadData() {
      // Load patient's data including medical history and medications
      const { data: patient } = await supabase
        .from('patients')
        .select('chief_complaint, pulse_notes, tongue_notes, medical_history, medications, allergies')
        .eq('id', patientId)
        .single();
      
      // Load latest patient assessment/questionnaire for intelligent pre-filling
      const { data: latestAssessment } = await supabase
        .from('patient_assessments')
        .select('details, assessment_type, created_at')
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Load existing visit data if visitId provided
      let visitData = null;
      if (visitId) {
        const { data: visit } = await supabase
          .from('visits')
          .select('*')
          .eq('id', visitId)
          .single();
        visitData = visit;
      }

      // Build the pre-filled notes
      if (visitData) {
        // If we have an existing visit, load from that
        setNotes({
          chiefComplaint: visitData.chief_complaint || '',
          medicalBackground: patient?.medical_history || '',
          currentMedications: patient?.medications || '',
          pulseFindings: visitData.pulse_diagnosis ? visitData.pulse_diagnosis.split(', ') : [],
          tongueFindings: visitData.tongue_diagnosis ? visitData.tongue_diagnosis.split(', ') : [],
          otherObjective: '',
          tcmPattern: visitData.tcm_pattern || '',
          assessmentNotes: visitData.notes || '',
          treatmentPrinciple: visitData.treatment_principle || '',
          planNotes: visitData.notes || '',
          selectedPoints: visitData.points_used || [],
          herbsPrescribed: visitData.herbs_prescribed || '',
          followUpRecommended: visitData.follow_up_recommended || ''
        });
      } else {
        // New session - intelligent pre-filling from patient data & assessments
        let chiefComplaint = patient?.chief_complaint || '';
        let medicalBackground = patient?.medical_history || '';
        let currentMedications = patient?.medications || '';

        // Extract data from latest questionnaire if available
        if (latestAssessment?.details) {
          const details = latestAssessment.details as { answers?: Array<{ questionId: number; answer: string | null; title?: string }> };
          
          if (details.answers && Array.isArray(details.answers)) {
            // Find chief complaint from questionnaire (usually question 1 - main challenge)
            const mainChallengeAnswer = details.answers.find(a => a.questionId === 1);
            if (mainChallengeAnswer?.answer && typeof mainChallengeAnswer.answer === 'string') {
              chiefComplaint = chiefComplaint 
                ? `${chiefComplaint}\n\n--- From Intake (${new Date(latestAssessment.created_at).toLocaleDateString()}) ---\n${mainChallengeAnswer.answer}`
                : mainChallengeAnswer.answer;
            }

            // Find goal/improvement priority (usually question 15)
            const goalAnswer = details.answers.find(a => a.questionId === 15);
            if (goalAnswer?.answer && typeof goalAnswer.answer === 'string') {
              chiefComplaint = chiefComplaint 
                ? `${chiefComplaint}\n\nPatient Goal: ${goalAnswer.answer}`
                : `Patient Goal: ${goalAnswer.answer}`;
            }

            // Build a summary of other relevant answers for background
            const emotionalAnswers = details.answers.filter(a => 
              [2, 3, 4].includes(a.questionId) && a.answer
            );
            const physicalAnswers = details.answers.filter(a => 
              [5, 6, 7, 8, 9, 10].includes(a.questionId) && a.answer
            );
            
            if (emotionalAnswers.length > 0 || physicalAnswers.length > 0) {
              let intakeSummary = `\n\n--- Intake Summary ---`;
              
              if (emotionalAnswers.length > 0) {
                intakeSummary += `\nEmotional: ${emotionalAnswers.map(a => `${a.title || ''}: ${a.answer}`).join('; ')}`;
              }
              if (physicalAnswers.length > 0) {
                intakeSummary += `\nPhysical: ${physicalAnswers.map(a => `${a.title || ''}: ${a.answer}`).join('; ')}`;
              }
              
              medicalBackground = medicalBackground 
                ? `${medicalBackground}${intakeSummary}`
                : intakeSummary.trim();
            }
          }
        }

        // Add allergies to medical background if available
        if (patient?.allergies) {
          medicalBackground = medicalBackground 
            ? `${medicalBackground}\n\nAllergies: ${patient.allergies}`
            : `Allergies: ${patient.allergies}`;
        }

        setNotes(prev => ({
          ...prev,
          chiefComplaint: chiefComplaint || prev.chiefComplaint,
          medicalBackground: medicalBackground || prev.medicalBackground,
          currentMedications: currentMedications || prev.currentMedications
        }));

        // Mark intake as reviewed when session starts (if it was pending_review)
        if (latestAssessment) {
          await supabase
            .from('patients')
            .update({ intake_status: 'reviewed' })
            .eq('id', patientId)
            .eq('intake_status', 'pending_review');
        }
      }
    }

    loadData();
  }, [patientId, visitId]);

  // Debounced auto-save function
  const debouncedSave = useCallback(async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const visitData = {
        patient_id: patientId,
        therapist_id: user.id,
        chief_complaint: notes.chiefComplaint,
        pulse_diagnosis: notes.pulseFindings.join(', '),
        tongue_diagnosis: notes.tongueFindings.join(', '),
        tcm_pattern: notes.tcmPattern,
        treatment_principle: notes.treatmentPrinciple,
        notes: notes.assessmentNotes || notes.planNotes,
        points_used: notes.selectedPoints,
        herbs_prescribed: notes.herbsPrescribed,
        follow_up_recommended: notes.followUpRecommended,
        visit_date: new Date().toISOString().split('T')[0]
      };

      if (visitId) {
        // Update existing visit
        const { error } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', visitId);
        
        if (error) throw error;
      } else {
        // Create new visit - check if one exists for today first
        const today = new Date().toISOString().split('T')[0];
        const { data: existingVisit } = await supabase
          .from('visits')
          .select('id')
          .eq('patient_id', patientId)
          .eq('therapist_id', user.id)
          .eq('visit_date', today)
          .single();

        if (existingVisit) {
          // Update today's visit
          const { error } = await supabase
            .from('visits')
            .update(visitData)
            .eq('id', existingVisit.id);
          
          if (error) throw error;
        } else {
          // Create new visit
          const { error } = await supabase
            .from('visits')
            .insert(visitData);
          
          if (error) throw error;
        }
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save error:', error);
      toast.error('Failed to save session notes');
    } finally {
      setIsSaving(false);
    }
  }, [notes, patientId, visitId, user]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, debouncedSave]);

  // Manual save handler
  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await debouncedSave();
    toast.success('Session notes saved');
  };

  // Update notes and mark as unsaved
  const updateNotes = (updates: Partial<SessionNotesData>) => {
    setNotes(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    onPlanUpdate?.(updates.planNotes || notes.planNotes);
  };

  // Toggle tag selection
  const toggleTag = (field: 'pulseFindings' | 'tongueFindings', tag: string) => {
    setNotes(prev => {
      const current = prev[field];
      const updated = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];
      return { ...prev, [field]: updated };
    });
    setHasUnsavedChanges(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-card/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Session Notes (SOAP)</h3>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved
            </Badge>
          )}
          <Button 
            size="sm" 
            onClick={handleManualSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-1">Save</span>
          </Button>
        </div>
      </div>

      {/* SOAP Sections */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Subjective Section */}
          <Collapsible open={expandedSections.subjective} onOpenChange={() => toggleSection('subjective')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-rose-600" />
                  <span className="font-semibold text-rose-700 dark:text-rose-300">Subjective</span>
                  <span className="text-xs text-rose-500">Chief Complaint</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-rose-500 transition-transform", expandedSections.subjective && "rotate-180")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 px-1 space-y-4">
              {/* Chief Complaint */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chief Complaint
                  {notes.chiefComplaint.includes('From Intake') && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-emerald-100 text-emerald-700">
                      Auto-filled from intake
                    </Badge>
                  )}
                </label>
                <Textarea
                  placeholder="Patient's main complaint and symptoms..."
                  value={notes.chiefComplaint}
                  onChange={(e) => updateNotes({ chiefComplaint: e.target.value })}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Medical Background */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Medical Background
                  {notes.medicalBackground && (
                    <span className="text-xs text-muted-foreground ml-2">(from patient record)</span>
                  )}
                </label>
                <Textarea
                  placeholder="Medical history, allergies, relevant conditions..."
                  value={notes.medicalBackground}
                  onChange={(e) => updateNotes({ medicalBackground: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Medications
                </label>
                <Textarea
                  placeholder="Current medications and supplements..."
                  value={notes.currentMedications}
                  onChange={(e) => updateNotes({ currentMedications: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Objective Section */}
          <Collapsible open={expandedSections.objective} onOpenChange={() => toggleSection('objective')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Objective</span>
                  <span className="text-xs text-blue-500">Pulse & Tongue</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-blue-500 transition-transform", expandedSections.objective && "rotate-180")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 px-1 space-y-4">
              {/* Pulse Findings */}
              <div>
                <label className="text-sm font-medium mb-2 block">Pulse Findings</label>
                <div className="flex flex-wrap gap-1.5">
                  {PULSE_OPTIONS.map(option => (
                    <Badge
                      key={option}
                      variant={notes.pulseFindings.includes(option) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer transition-colors",
                        notes.pulseFindings.includes(option) 
                          ? "bg-blue-500 hover:bg-blue-600" 
                          : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      )}
                      onClick={() => toggleTag('pulseFindings', option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tongue Findings */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tongue Findings</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONGUE_OPTIONS.map(option => (
                    <Badge
                      key={option}
                      variant={notes.tongueFindings.includes(option) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer transition-colors",
                        notes.tongueFindings.includes(option) 
                          ? "bg-purple-500 hover:bg-purple-600" 
                          : "hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      )}
                      onClick={() => toggleTag('tongueFindings', option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Other Objective Findings */}
              <Textarea
                placeholder="Other objective findings (palpation, observation, etc.)..."
                value={notes.otherObjective}
                onChange={(e) => updateNotes({ otherObjective: e.target.value })}
                className="min-h-[60px] resize-none"
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Assessment Section */}
          <Collapsible open={expandedSections.assessment} onOpenChange={() => toggleSection('assessment')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-amber-700 dark:text-amber-300">Assessment</span>
                  <span className="text-xs text-amber-500">TCM Pattern</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-amber-500 transition-transform", expandedSections.assessment && "rotate-180")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 px-1 space-y-4">
              {/* TCM Pattern Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">TCM Pattern Diagnosis</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search or type pattern..."
                    value={notes.tcmPattern}
                    onChange={(e) => updateNotes({ tcmPattern: e.target.value })}
                    list="tcm-patterns"
                  />
                  <datalist id="tcm-patterns">
                    {TCM_PATTERNS.map(pattern => (
                      <option key={pattern} value={pattern} />
                    ))}
                  </datalist>
                </div>
                {notes.tcmPattern && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700">
                      {notes.tcmPattern}
                      <button 
                        onClick={() => updateNotes({ tcmPattern: '' })}
                        className="ml-1 hover:text-amber-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                )}
              </div>

              {/* Assessment Notes */}
              <Textarea
                placeholder="Additional assessment notes and clinical reasoning..."
                value={notes.assessmentNotes}
                onChange={(e) => updateNotes({ assessmentNotes: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Plan Section */}
          <Collapsible open={expandedSections.plan} onOpenChange={() => toggleSection('plan')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-jade-50 dark:bg-jade-950/20 border border-jade-200/50 dark:border-jade-800/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-jade-600" />
                  <span className="font-semibold text-jade-700 dark:text-jade-300">Plan</span>
                  <span className="text-xs text-jade-500">Treatment Principles</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-jade-500 transition-transform", expandedSections.plan && "rotate-180")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 px-1 space-y-4">
              {/* Treatment Principle */}
              <div>
                <label className="text-sm font-medium mb-2 block">Treatment Principle</label>
                <Input
                  placeholder="e.g., Soothe Liver Qi, Tonify Spleen..."
                  value={notes.treatmentPrinciple}
                  onChange={(e) => updateNotes({ treatmentPrinciple: e.target.value })}
                />
              </div>

              {/* Plan Notes - This is where AI suggestions get inserted */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Treatment Plan & Notes
                  <span className="text-xs text-muted-foreground ml-2">(AI suggestions appear here)</span>
                </label>
                <Textarea
                  placeholder="Points, herbs, lifestyle recommendations..."
                  value={notes.planNotes}
                  onChange={(e) => updateNotes({ planNotes: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Herbs */}
              <div>
                <label className="text-sm font-medium mb-2 block">Herbs Prescribed</label>
                <Textarea
                  placeholder="Herbal formula and modifications..."
                  value={notes.herbsPrescribed}
                  onChange={(e) => updateNotes({ herbsPrescribed: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className="text-sm font-medium mb-2 block">Follow-up Recommended</label>
                <Input
                  placeholder="e.g., 1 week, 2 weeks..."
                  value={notes.followUpRecommended}
                  onChange={(e) => updateNotes({ followUpRecommended: e.target.value })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
