import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type SubscriptionTier = 'trial' | 'standard' | 'premium' | null;

interface TierContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  expiresAt: Date | null;
  setExpiresAt: (date: Date | null) => void;
  hasFeature: (feature: TierFeature) => boolean;
  daysRemaining: number | null;
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

// Dev mode bypass: auto-set premium tier on localhost
const isDevMode = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('lovableproject.com')
);

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    // In dev mode, default to premium for easy testing
    if (isDevMode) {
      return 'premium';
    }
    const stored = localStorage.getItem('therapist_tier');
    return (stored as SubscriptionTier) || null;
  });
  
  const [expiresAt, setExpiresAtState] = useState<Date | null>(() => {
    // In dev mode, set expiry far in the future
    if (isDevMode) {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    }
    const stored = localStorage.getItem('therapist_expires_at');
    return stored ? new Date(stored) : null;
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

  const daysRemaining = expiresAt 
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <TierContext.Provider value={{ tier, setTier, expiresAt, setExpiresAt, hasFeature, daysRemaining }}>
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
