import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface SavedProtocol {
  id: string;
  patient_id: string;
  therapist_id: string;
  module_id: number;
  module_name: string;
  diagnosis: string;
  acupuncture_points: string[];
  herbal_formula: string | null;
  herbal_ingredients: string[];
  nutrition_advice: string[];
  lifestyle_advice: string[];
  questionnaire_answers: Record<string, any>;
  created_at: string;
}

export function useProtocolHistory(patientId?: string) {
  const queryClient = useQueryClient();

  // Fetch protocols for a patient
  const { data: protocols = [], isLoading } = useQuery({
    queryKey: ['patient-protocols', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('assessment_type', 'clinical_navigator')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        patient_id: item.patient_id,
        therapist_id: item.therapist_id,
        module_id: (item.details as any)?.moduleId || 0,
        module_name: (item.details as any)?.moduleName || 'Unknown',
        diagnosis: (item.details as any)?.diagnosis || '',
        acupuncture_points: (item.details as any)?.acupuncturePoints || [],
        herbal_formula: (item.details as any)?.herbalFormula || null,
        herbal_ingredients: (item.details as any)?.herbalIngredients || [],
        nutrition_advice: (item.details as any)?.nutritionAdvice || [],
        lifestyle_advice: (item.details as any)?.lifestyleAdvice || [],
        questionnaire_answers: (item.details as any)?.answers || {},
        created_at: item.created_at,
      })) as SavedProtocol[];
    },
    enabled: !!patientId,
  });

  // Save a new protocol
  const saveProtocol = useMutation({
    mutationFn: async (protocol: {
      patientId: string;
      moduleId: number;
      moduleName: string;
      diagnosis: string;
      acupuncturePoints: string[];
      herbalFormula?: string;
      herbalIngredients?: string[];
      nutritionAdvice?: string[];
      lifestyleAdvice?: string[];
      answers?: Record<string, any>;
      distressLevel?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('patient_assessments')
        .insert({
          patient_id: protocol.patientId,
          therapist_id: user.id,
          assessment_type: 'clinical_navigator',
          status: 'saved',
          score: protocol.distressLevel,
          summary: `${protocol.moduleName} - ${protocol.diagnosis.substring(0, 100)}...`,
          details: {
            moduleId: protocol.moduleId,
            moduleName: protocol.moduleName,
            diagnosis: protocol.diagnosis,
            acupuncturePoints: protocol.acupuncturePoints,
            herbalFormula: protocol.herbalFormula,
            herbalIngredients: protocol.herbalIngredients,
            nutritionAdvice: protocol.nutritionAdvice,
            lifestyleAdvice: protocol.lifestyleAdvice,
            answers: protocol.answers,
            distressLevel: protocol.distressLevel,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-protocols'] });
      toast.success('Protocol saved to patient history');
    },
    onError: (error) => {
      console.error('Save protocol error:', error);
      toast.error('Failed to save protocol');
    },
  });

  return {
    protocols,
    isLoading,
    saveProtocol: saveProtocol.mutate,
    isSaving: saveProtocol.isPending,
  };
}
