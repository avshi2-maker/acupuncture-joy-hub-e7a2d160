import { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { usePinAuth } from '@/hooks/usePinAuth';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';
import { Lock, LogOut, AlertTriangle, Fingerprint } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PinUnlockScreenProps {
  onUnlock: () => void;
  onLogout?: () => void;
}

export function PinUnlockScreen({ onUnlock, onLogout }: PinUnlockScreenProps) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const { verifyPin, isLocked, lockoutEndTime } = usePinAuth();
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, authenticate: biometricAuth, isAuthenticating } = useBiometricAuth();
  const haptic = useHapticFeedback();
  const [lockoutCountdown, setLockoutCountdown] = useState<string | null>(null);

  // Auto-trigger biometric on mount if available and enabled
  useEffect(() => {
    if (biometricAvailable && biometricEnabled && !isLocked) {
      handleBiometricUnlock();
    }
  }, [biometricAvailable, biometricEnabled, isLocked]);

  const handleBiometricUnlock = async () => {
    haptic.light();
    const result = await biometricAuth();
    
    if (result.success) {
      haptic.success();
      onUnlock();
    } else if (result.error && result.error !== 'Authentication cancelled') {
      haptic.error();
      toast.error(result.error);
    }
  };

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || !lockoutEndTime) {
      setLockoutCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = lockoutEndTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setLockoutCountdown(null);
        window.location.reload();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setLockoutCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutEndTime]);

  const handlePinComplete = async (value: string) => {
    setPin(value);
    if (value.length !== 4) return;

    haptic.light();
    setIsVerifying(true);
    setError(null);

    const result = await verifyPin(value);
    setIsVerifying(false);

    if (result.success) {
      haptic.success();
      onUnlock();
    } else {
      haptic.error();
      setError(result.error || 'Invalid PIN');
      setAttemptsRemaining(result.attemptsRemaining ?? null);
      setPin('');
      
      if (result.attemptsRemaining === 0) {
        toast.error('Account locked for 15 minutes');
      }
    }
  };

  const handleLogout = async () => {
    haptic.medium();
    await supabase.auth.signOut();
    onLogout?.();
  };

  if (isLocked && lockoutCountdown) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          
          <div>
            <h2 className="text-2xl font-display font-semibold mb-2">Account Locked</h2>
            <p className="text-muted-foreground">
              Too many failed attempts. Try again in:
            </p>
            <p className="text-4xl font-mono font-bold text-destructive mt-4">
              {lockoutCountdown}
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-jade/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-jade" />
        </div>
        
        <div>
          <h2 className="text-2xl font-display font-semibold mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">
            Enter your PIN to unlock
          </p>
        </div>

        <InputOTP
          maxLength={4}
          value={pin}
          onChange={setPin}
          onComplete={handlePinComplete}
          disabled={isVerifying}
        >
          <InputOTPGroup className="justify-center">
            <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
            <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
            <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
            <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
          </InputOTPGroup>
        </InputOTP>

        {error && (
          <div className="text-destructive text-sm">
            {error}
            {attemptsRemaining !== null && attemptsRemaining > 0 && (
              <span className="block text-muted-foreground mt-1">
                {attemptsRemaining} attempts remaining
              </span>
            )}
          </div>
        )}

        {/* Biometric button */}
        {biometricAvailable && biometricEnabled && (
          <Button 
            variant="outline" 
            onClick={handleBiometricUnlock}
            disabled={isAuthenticating}
            className="gap-2 border-jade/30 hover:border-jade hover:bg-jade/10"
          >
            <Fingerprint className="w-5 h-5 text-jade" />
            {isAuthenticating ? 'Authenticating...' : 'Use Biometric'}
          </Button>
        )}

        <div className="pt-4">
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground gap-2">
            <LogOut className="w-4 h-4" />
            Use Password Instead
          </Button>
        </div>
      </div>
    </div>
  );
}
