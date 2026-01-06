import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeepSearchRequest {
  moduleId: number;
  questionnaireData: Record<string, any>;
  patientAge?: number;
  patientGender?: string;
  chiefComplaint?: string;
  language?: 'en' | 'he';
}

export interface AcupunctureProtocol {
  points: string[];
  technique: string;
  contraindications: string[];
}

export interface HerbalPrescription {
  formula: string;
  ingredients: string[];
  modifications: string[];
}

export interface DeepSearchReport {
  primaryDiagnosis: string;
  acupunctureProtocol: AcupunctureProtocol;
  herbalPrescription: HerbalPrescription;
  nutritionAdvice: string[];
  lifestyleMindset: string[];
  importantNotes: string[];
  rawResponse: string;
  extractedPoints: string[];
}

export interface DeepSearchMetadata {
  moduleUsed: string;
  knowledgeBasesQueried: string[];
  chunksFound: number;
  crossReferencesFound: number;
}

export interface DeepSearchResult {
  success: boolean;
  report?: DeepSearchReport;
  metadata?: DeepSearchMetadata;
  error?: string;
}

export function useClinicalDeepSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DeepSearchResult | null>(null);
  const [extractedPoints, setExtractedPoints] = useState<string[]>([]);

  const performDeepSearch = useCallback(async (request: DeepSearchRequest): Promise<DeepSearchResult> => {
    setIsLoading(true);
    setResult(null);
    setExtractedPoints([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await supabase.functions.invoke('clinical-deep-search', {
        body: request,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data as DeepSearchResult;
      
      if (data.success && data.report) {
        setResult(data);
        setExtractedPoints(data.report.extractedPoints);
        toast.success('Clinical analysis complete');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deep search failed';
      toast.error(errorMessage);
      
      const errorResult: DeepSearchResult = {
        success: false,
        error: errorMessage,
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setExtractedPoints([]);
    setIsLoading(false);
  }, []);

  return {
    performDeepSearch,
    isLoading,
    result,
    extractedPoints,
    reset,
  };
}
