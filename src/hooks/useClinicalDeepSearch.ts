import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  answer: string | boolean | string[];
}

export interface DeepSearchRequest {
  moduleId: number;
  questionnaireData: Record<string, QuestionAnswer>;
  patientAge?: number;
  patientGender?: string;
  chiefComplaint?: string;
  language?: 'en' | 'he';
}

export interface AcupunctureProtocol {
  points: string[];
  technique: string;
  contraindications: string[];
  sources: string[];
}

export interface HerbalPrescription {
  formula: string;
  ingredients: string[];
  modifications: string[];
  sources: string[];
}

export interface SourcedRecommendation {
  text: string;
  source?: string;
}

export interface DeepSearchReport {
  primaryDiagnosis: string;
  primaryDiagnosisSources: string[];
  acupunctureProtocol: AcupunctureProtocol;
  herbalPrescription: HerbalPrescription;
  nutritionAdvice: SourcedRecommendation[];
  lifestyleMindset: SourcedRecommendation[];
  importantNotes: string[];
  rawResponse: string;
  extractedPoints: string[];
}

export interface DeepSearchMetadata {
  moduleUsed: string;
  knowledgeBasesQueried: string[];
  chunksFound: number;
  crossReferencesFound: number;
  sourcesUsed: string[];
  translationBridge?: {
    sourceLanguage: 'en' | 'he';
    rawQuery: string;
    retrievalQuery: string;
  };
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

    // Helper to get user-friendly error messages
    const getErrorMessage = (error: unknown, statusCode?: number): string => {
      if (statusCode === 401) {
        return request.language === 'he' 
          ? 'נדרשת התחברות מחדש. אנא רענן את הדף והתחבר שוב.'
          : 'Session expired. Please refresh the page and log in again.';
      }
      if (statusCode === 429) {
        return request.language === 'he'
          ? 'יותר מדי בקשות. אנא המתן מספר שניות ונסה שוב.'
          : 'Too many requests. Please wait a moment and try again.';
      }
      if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
        return request.language === 'he'
          ? 'שגיאת שרת. אנא נסה שוב בעוד מספר דקות.'
          : 'Server error. Please try again in a few minutes.';
      }
      if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return request.language === 'he'
            ? 'בעיית חיבור לרשת. בדוק את החיבור לאינטרנט.'
            : 'Network connection issue. Check your internet connection.';
        }
        if (error.message.includes('timeout')) {
          return request.language === 'he'
            ? 'הבקשה ארכה יותר מדי זמן. אנא נסה שוב.'
            : 'Request timed out. Please try again.';
        }
      }
      return request.language === 'he'
        ? 'שגיאה בניתוח הקליני. אנא נסה שוב.'
        : 'Clinical analysis failed. Please try again.';
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const authError = request.language === 'he' 
          ? 'נדרשת התחברות. אנא התחבר לחשבון.'
          : 'Authentication required. Please log in.';
        toast.error(authError);
        const errorResult: DeepSearchResult = { success: false, error: authError };
        setResult(errorResult);
        return errorResult;
      }

      const response = await supabase.functions.invoke('clinical-deep-search', {
        body: request,
      });

      // Handle HTTP errors from edge function
      if (response.error) {
        const statusCode = response.error.context?.status;
        const errorMessage = getErrorMessage(response.error, statusCode);
        console.error('Edge function error:', response.error);
        toast.error(errorMessage);
        const errorResult: DeepSearchResult = { success: false, error: errorMessage };
        setResult(errorResult);
        return errorResult;
      }

      const data = response.data as DeepSearchResult;
      
      // Validate response structure
      if (!data) {
        const noDataError = request.language === 'he'
          ? 'לא התקבלה תגובה מהשרת. אנא נסה שוב.'
          : 'No response from server. Please try again.';
        toast.error(noDataError);
        const errorResult: DeepSearchResult = { success: false, error: noDataError };
        setResult(errorResult);
        return errorResult;
      }

      if (data.success && data.report) {
        setResult(data);
        setExtractedPoints(data.report.extractedPoints || []);
        toast.success(request.language === 'he' ? 'הניתוח הקליני הושלם' : 'Clinical analysis complete');
      } else {
        const errorMessage = data.error || getErrorMessage(null);
        toast.error(errorMessage);
        const errorResult: DeepSearchResult = { success: false, error: errorMessage };
        setResult(errorResult);
        return errorResult;
      }

      return data;
    } catch (error) {
      console.error('Deep search error:', error);
      const errorMessage = getErrorMessage(error);
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
