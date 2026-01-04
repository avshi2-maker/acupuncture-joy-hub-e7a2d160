import { useState, useEffect, useCallback, useRef } from 'react';
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

const ALERT_THRESHOLDS = [80, 90] as const;

export const useUsageTracking = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alertsSentRef = useRef<Set<number>>(new Set());

  const checkAndSendAlerts = useCallback(async (currentUsed: number, tierLimit: number, userTier: keyof TierLimits) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const usagePercent = (currentUsed / tierLimit) * 100;

      for (const threshold of ALERT_THRESHOLDS) {
        if (usagePercent >= threshold && !alertsSentRef.current.has(threshold)) {
          // Check if alert was already sent this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: existingAlerts } = await supabase
            .from('usage_logs' as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('action_type', 'usage_alert')
            .gte('created_at', startOfMonth.toISOString())
            .contains('metadata', { threshold });

          if (existingAlerts && existingAlerts.length > 0) {
            alertsSentRef.current.add(threshold);
            continue;
          }

          // Get tier display name
          const tierDisplayNames: Record<string, string> = {
            trial: 'ניסיון',
            standard: 'סטנדרט',
            premium: 'פרימיום'
          };

          // Send alert email
          const { error: alertError } = await supabase.functions.invoke('send-usage-alert', {
            body: {
              userId: user.id,
              email: user.email,
              userName: user.user_metadata?.full_name || 'מטפל',
              currentUsed,
              tierLimit,
              threshold,
              tier: tierDisplayNames[userTier] || userTier,
            },
          });

          if (!alertError) {
            alertsSentRef.current.add(threshold);
            console.log(`Usage alert sent for ${threshold}% threshold to ${user.email}`);
          } else {
            console.error('Failed to send usage alert:', alertError);
          }
        }
      }
    } catch (err) {
      console.error('Error checking usage alerts:', err);
    }
  }, []);

  const fetchUsageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUsageData({
          currentUsed: 350,
          tierLimit: 500,
          uniquePatients: 70,
        });
        return;
      }

      const { data: usageResult, error: usageError } = await supabase
        .rpc('get_user_monthly_usage');

      if (usageError) {
        console.error('Error fetching usage:', usageError);
        throw usageError;
      }

      // Try to get tier from localStorage (set by useTier hook)
      const storedTier = localStorage.getItem('userTier');
      const userTier: keyof TierLimits = (storedTier === 'standard' || storedTier === 'premium') ? storedTier : 'trial';
      const tierLimit = TIER_LIMITS[userTier];

      const usage = usageResult?.[0] || { total_queries: 0, total_tokens: 0, unique_patients: 0 };
      const currentUsed = Number(usage.total_queries) || 0;

      setUsageData({
        currentUsed,
        tierLimit,
        uniquePatients: Number(usage.unique_patients) || 0,
      });

      // Check for threshold alerts (80% and 90%)
      await checkAndSendAlerts(currentUsed, tierLimit, userTier);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Failed to load usage data');
      setUsageData({
        currentUsed: 350,
        tierLimit: 500,
        uniquePatients: 70,
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkAndSendAlerts]);

  // Auto-track AI feature usage
  const trackAIUsage = useCallback(async (
    featureType: 'diagnosis' | 'points' | 'herbs' | 'chat' | 'treatment' | 'summary' | 'transcription',
    patientId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot track AI usage: user not authenticated');
        return false;
      }

      const tokenMap: Record<string, number> = {
        diagnosis: 3,
        treatment: 3,
        summary: 2,
        chat: 1,
        points: 1,
        herbs: 1,
        transcription: 2,
      };

      const { error } = await supabase
        .from('usage_logs' as any)
        .insert({
          user_id: user.id,
          action_type: featureType,
          tokens_used: tokenMap[featureType] || 1,
          patient_id: patientId || null,
          metadata: { ...metadata, feature: 'ai', auto_tracked: true },
        });

      if (error) {
        console.error('Error tracking AI usage:', error);
        return false;
      }

      // Refresh usage data after tracking
      await fetchUsageData();
      return true;
    } catch (err) {
      console.error('Error tracking AI usage:', err);
      return false;
    }
  }, [fetchUsageData]);

  // Legacy log usage function
  const logUsage = useCallback(async (
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

      const { error } = await supabase
        .from('usage_logs' as any)
        .insert({
          user_id: user.id,
          action_type: actionType,
          tokens_used: tokensUsed,
          patient_id: patientId || null,
          metadata: metadata || {},
        });

      if (error) {
        console.error('Error logging usage:', error);
        return false;
      }

      await fetchUsageData();
      return true;
    } catch (err) {
      console.error('Error logging usage:', err);
      return false;
    }
  }, [fetchUsageData]);

  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  return {
    usageData,
    isLoading,
    error,
    logUsage,
    trackAIUsage,
    refetch: fetchUsageData,
    tierLimits: TIER_LIMITS,
  };
};
