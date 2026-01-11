import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type SubscriptionTier = 'trial' | 'standard' | 'premium' | null;

interface TierContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  expiresAt: Date | null;
  setExpiresAt: (date: Date | null) => void;
  hasFeature: (feature: TierFeature) => boolean;
  daysRemaining: number | null;
  clearTier: () => void;
}

type TierFeature = 
  | 'tcm_brain' 
  | 'calendar' 
  | 'crm' 
  | 'body_map' 
  | 'email_reminders' 
  | 'whatsapp_reminders' 
  | 'video_sessions';

const featuresByTier: Record<string, TierFeature[]> = {
  trial: ['tcm_brain', 'calendar', 'crm', 'body_map'],
  standard: ['tcm_brain', 'calendar', 'crm', 'body_map', 'email_reminders', 'whatsapp_reminders'],
  premium: ['tcm_brain', 'calendar', 'crm', 'body_map', 'email_reminders', 'whatsapp_reminders', 'video_sessions'],
};

const TierContext = createContext<TierContextType | undefined>(undefined);

// Always allow access - default to trial if no tier is set
export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    const stored = localStorage.getItem('therapist_tier');
    // Default to 'trial' if no tier is stored - allows easy browsing
    return (stored as SubscriptionTier) || 'trial';
  });
  
  const [expiresAt, setExpiresAtState] = useState<Date | null>(() => {
    const stored = localStorage.getItem('therapist_expires_at');
    // Default to 1 year from now if no expiry is stored
    return stored ? new Date(stored) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  });

  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    if (newTier) {
      localStorage.setItem('therapist_tier', newTier);
    } else {
      localStorage.removeItem('therapist_tier');
    }
  };

  const setExpiresAt = (date: Date | null) => {
    setExpiresAtState(date);
    if (date) {
      localStorage.setItem('therapist_expires_at', date.toISOString());
    } else {
      localStorage.removeItem('therapist_expires_at');
    }
  };

  const hasFeature = (feature: TierFeature): boolean => {
    if (!tier) return false;
    return featuresByTier[tier]?.includes(feature) ?? false;
  };

  const clearTier = () => {
    setTierState(null);
    setExpiresAtState(null);
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
  };

  const daysRemaining = expiresAt 
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <TierContext.Provider value={{ tier, setTier, expiresAt, setExpiresAt, hasFeature, daysRemaining, clearTier }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
