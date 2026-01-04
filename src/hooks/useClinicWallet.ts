import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CreditPack {
  id: string;
  name: string;
  name_he: string;
  credits: number;
  price_ils: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ClinicWallet {
  id: string;
  user_id: string;
  credits_balance: number;
  total_purchased: number;
  last_top_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'reset';
  description: string | null;
  balance_after: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Thresholds for email alerts (percentages)
export const CREDIT_THRESHOLDS = {
  WARNING: 20, // 20% remaining
  CRITICAL: 10, // 10% remaining
  EMPTY: 0,
};

export function useClinicWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch or create wallet
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useQuery({
    queryKey: ['clinic-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to get existing wallet - using type assertion since table was just created
      const { data: existing, error: fetchError } = await (supabase
        .from('clinic_wallets') as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) return existing as ClinicWallet;

      // Create new wallet with starter credits
      const { data: newWallet, error: createError } = await (supabase
        .from('clinic_wallets') as any)
        .insert({
          user_id: user.id,
          credits_balance: 500, // Starter pack included
          total_purchased: 500,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Log the initial credits
      await (supabase.from('credit_transactions') as any).insert({
        user_id: user.id,
        amount: 500,
        transaction_type: 'bonus',
        description: 'חבילת התחלה - Welcome bonus',
        balance_after: 500,
      });

      return newWallet as ClinicWallet;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Fetch available credit packs
  const { data: creditPacks = [] } = useQuery({
    queryKey: ['credit-packs'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('credit_packs') as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as CreditPack[];
    },
    staleTime: 60000,
  });

  // Fetch transaction history
  const { data: transactions = [] } = useQuery({
    queryKey: ['credit-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await (supabase
        .from('credit_transactions') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Deduct credits (called when using AI features)
  const deductCredits = useMutation({
    mutationFn: async ({
      amount,
      description,
      metadata,
    }: {
      amount: number;
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user?.id || !wallet) throw new Error('No wallet found');

      const newBalance = wallet.credits_balance - amount;

      // Update wallet balance
      const { error: updateError } = await (supabase
        .from('clinic_wallets') as any)
        .update({
          credits_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log transaction - using type assertion since table was just created
      const { error: logError } = await (supabase.from('credit_transactions') as any).insert({
        user_id: user.id,
        amount: -amount,
        transaction_type: 'usage',
        description,
        balance_after: newBalance,
        metadata: metadata || null,
      });

      if (logError) console.error('Failed to log transaction:', logError);

      // Check thresholds and send email alerts
      const percentRemaining = (newBalance / (wallet.total_purchased || 500)) * 100;
      
      if (percentRemaining <= CREDIT_THRESHOLDS.CRITICAL && percentRemaining > CREDIT_THRESHOLDS.EMPTY) {
        // Send critical alert
        sendCreditAlert('critical', newBalance, wallet.total_purchased);
      } else if (percentRemaining <= CREDIT_THRESHOLDS.WARNING && percentRemaining > CREDIT_THRESHOLDS.CRITICAL) {
        // Send warning alert
        sendCreditAlert('warning', newBalance, wallet.total_purchased);
      }

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions', user?.id] });
    },
  });

  // Send credit alert email
  const sendCreditAlert = async (
    level: 'warning' | 'critical',
    currentBalance: number,
    totalCredits: number
  ) => {
    try {
      await supabase.functions.invoke('send-credit-alert', {
        body: {
          level,
          currentBalance,
          totalCredits,
          userEmail: user?.email,
          userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
        },
      });
    } catch (error) {
      console.error('Failed to send credit alert:', error);
    }
  };

  // Calculate wallet status
  const getWalletStatus = () => {
    if (!wallet) return { status: 'loading', percent: 0 };

    const percent = Math.round((wallet.credits_balance / (wallet.total_purchased || 500)) * 100);

    if (percent <= CREDIT_THRESHOLDS.EMPTY) {
      return { status: 'empty', percent, message: 'הקרדיטים נגמרו! טען עכשיו להמשך שימוש' };
    }
    if (percent <= CREDIT_THRESHOLDS.CRITICAL) {
      return { status: 'critical', percent, message: 'קרדיטים נמוכים מאוד - מומלץ לטעון' };
    }
    if (percent <= CREDIT_THRESHOLDS.WARNING) {
      return { status: 'warning', percent, message: 'נותרו מעט קרדיטים' };
    }
    return { status: 'good', percent, message: 'מצב תקין' };
  };

  // Check if user has enough credits
  const hasCredits = (amount: number = 1) => {
    return (wallet?.credits_balance || 0) >= amount;
  };

  // Estimated patients remaining
  const patientsRemaining = Math.floor((wallet?.credits_balance || 0) / 5);

  return {
    wallet,
    creditPacks,
    transactions,
    walletLoading,
    walletError,
    deductCredits: deductCredits.mutateAsync,
    getWalletStatus,
    hasCredits,
    patientsRemaining,
    sendCreditAlert,
  };
}
