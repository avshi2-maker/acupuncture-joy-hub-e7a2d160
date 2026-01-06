import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type AssessmentType = 'brain' | 'body' | 'retreat' | 'health_compass' | 'patient_questionnaire' | 'internal_climate' | 'vitality_longevity';
export type AssessmentStatus = 'saved' | 'sent' | 'pending' | 'completed';

export interface PatientAssessment {
  id: string;
  patient_id: string;
  therapist_id: string;
  assessment_type: AssessmentType;
  score: number | null;
  summary: string | null;
  details: Json;
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateAssessmentInput {
  patient_id: string;
  assessment_type: AssessmentType;
  score?: number;
  summary?: string;
  details?: Json;
  status?: AssessmentStatus;
}

export function usePatientAssessments(patientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patient-assessments', patientId, user?.id],
    queryFn: async () => {
      if (!user?.id || !patientId) return [];

      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PatientAssessment[];
    },
    enabled: !!user?.id && !!patientId,
  });
}

export function useLatestAssessments(patientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['latest-assessments', patientId, user?.id],
    queryFn: async () => {
      if (!user?.id || !patientId) return { brain: null, body: null, retreat: null, health_compass: null, patient_questionnaire: null, internal_climate: null, vitality_longevity: null };

      const types: AssessmentType[] = ['brain', 'body', 'retreat', 'health_compass', 'patient_questionnaire', 'internal_climate', 'vitality_longevity'];
      const results: Record<AssessmentType, PatientAssessment | null> = {
        brain: null,
        body: null,
        retreat: null,
        health_compass: null,
        patient_questionnaire: null,
        internal_climate: null,
        vitality_longevity: null,
      };

      for (const type of types) {
        const { data } = await supabase
          .from('patient_assessments')
          .select('*')
          .eq('patient_id', patientId)
          .eq('therapist_id', user.id)
          .eq('assessment_type', type)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          results[type] = data as PatientAssessment;
        }
      }

      return results;
    },
    enabled: !!user?.id && !!patientId,
  });
}

export function useCreateAssessment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAssessmentInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const insertData = {
        patient_id: input.patient_id,
        assessment_type: input.assessment_type,
        score: input.score ?? null,
        summary: input.summary ?? null,
        details: input.details ?? {},
        status: input.status ?? 'saved',
        therapist_id: user.id,
      };

      const { data, error } = await supabase
        .from('patient_assessments')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-assessments', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['latest-assessments', data.patient_id] });
      toast.success('Assessment saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save assessment:', error);
      toast.error('Failed to save assessment');
    },
  });
}
