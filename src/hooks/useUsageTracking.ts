import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsageData {
  currentUsed: number;
  tierLimit: number;
  uniquePatients: number;
}

interface TierLimits {
  trial: number;
  standard: number;
  premium: number;
}

const TIER_LIMITS: TierLimits = {
  trial: 500,
  standard: 1200,
  premium: 5000,
};

export const useUsageTracking = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Demo mode for non-authenticated users
        setUsageData({
          currentUsed: 350,
          tierLimit: 500,
          uniquePatients: 70,
        });
        return;
      }

      // Fetch monthly usage using the database function
      const { data: usageResult, error: usageError } = await supabase
        .rpc('get_user_monthly_usage');

      if (usageError) {
        console.error('Error fetching usage:', usageError);
        throw usageError;
      }

      // Get user's tier (default to trial if not set)
      // For now, we'll use trial as default - this should be connected to actual subscription data
      const userTier: keyof TierLimits = 'trial';
      const tierLimit = TIER_LIMITS[userTier];

      const usage = usageResult?.[0] || { total_queries: 0, total_tokens: 0, unique_patients: 0 };

      setUsageData({
        currentUsed: Number(usage.total_queries) || 0,
        tierLimit,
        uniquePatients: Number(usage.unique_patients) || 0,
      });
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Failed to load usage data');
      // Fallback to demo data
      setUsageData({
        currentUsed: 350,
        tierLimit: 500,
        uniquePatients: 70,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Log usage action
  const logUsage = async (
    actionType: 'diagnosis' | 'points' | 'herbs' | 'chat' | 'other',
    patientId?: string,
    tokensUsed: number = 1,
    metadata?: Record<string, unknown>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot log usage: user not authenticated');
        return false;
      }

      const insertData = {
        user_id: user.id,
        action_type: actionType,
        tokens_used: tokensUsed,
        patient_id: patientId || null,
        metadata: metadata || {},
      };

      const { error } = await supabase
        .from('usage_logs' as any)
        .insert(insertData);

      if (error) {
        console.error('Error logging usage:', error);
        return false;
      }

      // Refresh usage data after logging
      await fetchUsageData();
      return true;
    } catch (err) {
      console.error('Error logging usage:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  return {
    usageData,
    isLoading,
    error,
    logUsage,
    refetch: fetchUsageData,
  };
};
