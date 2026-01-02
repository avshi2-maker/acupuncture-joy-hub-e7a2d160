import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatientIntakeData {
  id: string;
  full_name: string;
  age_group?: string | null;
  gender?: string | null;
  chief_complaint?: string | null;
  medical_history?: string | null;
  allergies?: string | null;
  medications?: string | null;
  constitution_type?: string | null;
  tongue_notes?: string | null;
  pulse_notes?: string | null;
  lifestyle_notes?: string | null;
  diet_notes?: string | null;
  sleep_quality?: string | null;
  stress_level?: string | null;
  exercise_frequency?: string | null;
  is_pregnant?: boolean | null;
  pregnancy_weeks?: number | null;
  pregnancy_notes?: string | null;
}

interface SessionBrief {
  analysis: string;
  suggestedQuestions: SuggestedQuestion[];
  keyFindings: string[];
  treatmentFocus: string[];
  timestamp: Date;
}

export interface SuggestedQuestion {
  category: 'diagnostic' | 'lifestyle' | 'symptoms' | 'treatment' | 'followup';
  questionEn: string;
  questionHe: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
}

export function useSessionBrief() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionBrief, setSessionBrief] = useState<SessionBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientIntake = useCallback(async (patientId: string): Promise<PatientIntakeData | null> => {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        full_name,
        age_group,
        gender,
        chief_complaint,
        medical_history,
        allergies,
        medications,
        constitution_type,
        tongue_notes,
        pulse_notes,
        lifestyle_notes,
        diet_notes,
        sleep_quality,
        stress_level,
        exercise_frequency,
        is_pregnant,
        pregnancy_weeks,
        pregnancy_notes
      `)
      .eq('id', patientId)
      .single();

    if (error) {
      console.error('Error fetching patient intake:', error);
      return null;
    }
    return data;
  }, []);

  const buildIntakePrompt = useCallback((intake: PatientIntakeData): string => {
    const sections: string[] = [];

    sections.push(`**Patient Profile Analysis Request**`);
    sections.push(`Patient: ${intake.full_name}`);
    
    if (intake.age_group) sections.push(`Age Group: ${intake.age_group}`);
    if (intake.gender) sections.push(`Gender: ${intake.gender}`);

    if (intake.chief_complaint) {
      sections.push(`\n**Chief Complaint:** ${intake.chief_complaint}`);
    }

    if (intake.medical_history) {
      sections.push(`\n**Medical History:** ${intake.medical_history}`);
    }

    if (intake.allergies) {
      sections.push(`**Allergies:** ${intake.allergies}`);
    }

    if (intake.medications) {
      sections.push(`**Current Medications:** ${intake.medications}`);
    }

    if (intake.constitution_type) {
      sections.push(`\n**TCM Constitution:** ${intake.constitution_type}`);
    }

    if (intake.tongue_notes) {
      sections.push(`**Tongue Diagnosis Notes:** ${intake.tongue_notes}`);
    }

    if (intake.pulse_notes) {
      sections.push(`**Pulse Diagnosis Notes:** ${intake.pulse_notes}`);
    }

    // Lifestyle factors
    const lifestyleFactors: string[] = [];
    if (intake.lifestyle_notes) lifestyleFactors.push(`Lifestyle: ${intake.lifestyle_notes}`);
    if (intake.diet_notes) lifestyleFactors.push(`Diet: ${intake.diet_notes}`);
    if (intake.sleep_quality) lifestyleFactors.push(`Sleep: ${intake.sleep_quality}`);
    if (intake.stress_level) lifestyleFactors.push(`Stress: ${intake.stress_level}`);
    if (intake.exercise_frequency) lifestyleFactors.push(`Exercise: ${intake.exercise_frequency}`);

    if (lifestyleFactors.length > 0) {
      sections.push(`\n**Lifestyle Factors:**\n${lifestyleFactors.join('\n')}`);
    }

    // Pregnancy info
    if (intake.is_pregnant) {
      sections.push(`\n**⚠️ PREGNANCY:** Week ${intake.pregnancy_weeks || 'Unknown'}`);
      if (intake.pregnancy_notes) sections.push(`Pregnancy Notes: ${intake.pregnancy_notes}`);
    }

    sections.push(`\n---\n**Request:** Based on this patient's intake data, provide:
1. **Initial TCM Assessment**: Preliminary pattern identification based on available data
2. **Key Findings**: Most significant clinical observations (list 3-5)
3. **Treatment Focus Areas**: Priority areas for this session (list 2-3)
4. **Recommended Questions**: 5 key questions to ask during this session to refine diagnosis

Format the response clearly with headers. Include both English and Hebrew for questions.`);

    return sections.join('\n');
  }, []);

  const parseSuggestedQuestions = useCallback((aiResponse: string): SuggestedQuestion[] => {
    // Parse AI response for suggested questions
    const questions: SuggestedQuestion[] = [];
    
    // Default suggested questions if parsing fails
    const defaultQuestions: SuggestedQuestion[] = [
      {
        category: 'diagnostic',
        questionEn: 'How is your energy level in the morning vs evening?',
        questionHe: 'איך רמת האנרגיה שלך בבוקר לעומת הערב?',
        priority: 'high',
        rationale: 'Helps identify Qi/Yang deficiency patterns'
      },
      {
        category: 'symptoms',
        questionEn: 'Do your symptoms worsen with cold, heat, or stress?',
        questionHe: 'האם התסמינים מחמירים עם קור, חום או לחץ?',
        priority: 'high',
        rationale: 'Differentiates between Cold/Heat and emotional patterns'
      },
      {
        category: 'lifestyle',
        questionEn: 'What time do you typically fall asleep and wake up?',
        questionHe: 'באיזו שעה את/ה בדרך כלל נרדם/ת ומתעורר/ת?',
        priority: 'medium',
        rationale: 'Sleep patterns reveal Yin/Yang and organ clock imbalances'
      },
      {
        category: 'diagnostic',
        questionEn: 'Have you noticed any changes in appetite or digestion?',
        questionHe: 'האם שמת לב לשינויים בתיאבון או בעיכול?',
        priority: 'medium',
        rationale: 'Spleen/Stomach assessment for root cause'
      },
      {
        category: 'followup',
        questionEn: 'What would improvement look like for you?',
        questionHe: 'איך נראה שיפור מבחינתך?',
        priority: 'low',
        rationale: 'Sets treatment expectations and goals'
      }
    ];

    // Try to extract questions from AI response
    const questionPatterns = [
      /(?:question|שאלה)[:\s]*([^\n]+)/gi,
      /\d+\.\s*([^\n]+\?)/g,
      /[-•]\s*([^\n]+\?)/g
    ];

    let foundQuestions = false;
    for (const pattern of questionPatterns) {
      const matches = aiResponse.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 10) {
          foundQuestions = true;
          // Try to detect if it's Hebrew or English
          const isHebrew = /[\u0590-\u05FF]/.test(match[1]);
          questions.push({
            category: 'diagnostic',
            questionEn: isHebrew ? '' : match[1].trim(),
            questionHe: isHebrew ? match[1].trim() : '',
            priority: questions.length < 2 ? 'high' : questions.length < 4 ? 'medium' : 'low',
            rationale: 'AI-suggested based on intake'
          });
        }
      }
    }

    return foundQuestions && questions.length >= 3 ? questions.slice(0, 6) : defaultQuestions;
  }, []);

  const parseKeyFindings = useCallback((aiResponse: string): string[] => {
    const findings: string[] = [];
    
    // Look for key findings section
    const findingsMatch = aiResponse.match(/key findings?:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    if (findingsMatch) {
      const lines = findingsMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^[-•\d.)\s]+/, '').trim();
        if (cleaned.length > 5) {
          findings.push(cleaned);
        }
      }
    }

    // Fallback: extract bullet points from response
    if (findings.length < 2) {
      const bulletMatches = aiResponse.match(/[-•]\s*([^\n]+)/g);
      if (bulletMatches) {
        for (const match of bulletMatches.slice(0, 5)) {
          findings.push(match.replace(/^[-•]\s*/, '').trim());
        }
      }
    }

    return findings.length > 0 ? findings : ['Patient intake data collected', 'Ready for clinical assessment'];
  }, []);

  const parseTreatmentFocus = useCallback((aiResponse: string): string[] => {
    const focus: string[] = [];
    
    // Look for treatment focus section
    const focusMatch = aiResponse.match(/treatment focus|focus areas?|priority areas?:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    if (focusMatch) {
      const lines = focusMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^[-•\d.)\s]+/, '').trim();
        if (cleaned.length > 5) {
          focus.push(cleaned);
        }
      }
    }

    return focus.length > 0 ? focus : ['Complete diagnostic assessment', 'Identify primary pattern'];
  }, []);

  const generateSessionBrief = useCallback(async (patientId: string): Promise<SessionBrief | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch patient intake data
      const intake = await fetchPatientIntake(patientId);
      if (!intake) {
        setError('Could not load patient data');
        return null;
      }

      // Build prompt from intake
      const prompt = buildIntakePrompt(intake);

      // Call TCM RAG chat for analysis
      const { data, error: ragError } = await supabase.functions.invoke('tcm-rag-chat', {
        body: {
          query: prompt,
          ageGroup: intake.age_group || undefined,
          patientContext: `Patient: ${intake.full_name}, Chief Complaint: ${intake.chief_complaint || 'Not specified'}`,
          includeChunkDetails: false
        }
      });

      if (ragError) {
        console.error('RAG error:', ragError);
        throw new Error('Failed to generate session brief');
      }

      const aiResponse = data?.response || data?.content || '';
      
      const brief: SessionBrief = {
        analysis: aiResponse,
        suggestedQuestions: parseSuggestedQuestions(aiResponse),
        keyFindings: parseKeyFindings(aiResponse),
        treatmentFocus: parseTreatmentFocus(aiResponse),
        timestamp: new Date()
      };

      setSessionBrief(brief);
      return brief;

    } catch (err) {
      console.error('Error generating session brief:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to generate session brief');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPatientIntake, buildIntakePrompt, parseSuggestedQuestions, parseKeyFindings, parseTreatmentFocus]);

  const clearBrief = useCallback(() => {
    setSessionBrief(null);
    setError(null);
  }, []);

  return {
    isLoading,
    sessionBrief,
    error,
    generateSessionBrief,
    clearBrief
  };
}
