import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { usePinAuth } from '@/hooks/usePinAuth';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';
import { Lock, Check, Shield, Fingerprint } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PinSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PinSetupDialog({ open, onOpenChange, onSuccess }: PinSetupDialogProps) {
  const [step, setStep] = useState<'enter' | 'confirm' | 'biometric'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPin: savePin } = usePinAuth();
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, enableBiometric, disableBiometric } = useBiometricAuth();
  const haptic = useHapticFeedback();

  const handlePinComplete = (value: string) => {
    haptic.light();
    if (step === 'enter') {
      setPin(value);
      setStep('confirm');
      setConfirmPin('');
    } else {
      setConfirmPin(value);
    }
  };

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      haptic.error();
      toast.error('PINs do not match');
      setStep('enter');
      setPin('');
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    const result = await savePin(pin);
    setIsLoading(false);

    if (result.success) {
      haptic.success();
      toast.success('PIN set successfully!');
      
      // If biometric is available, show biometric setup step
      if (biometricAvailable) {
        setStep('biometric');
      } else {
        onOpenChange(false);
        onSuccess?.();
        resetState();
      }
    } else {
      haptic.error();
      toast.error(result.error || 'Failed to set PIN');
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      haptic.light();
      const result = await enableBiometric();
      if (result.success) {
        haptic.success();
        toast.success('Biometric enabled!');
      } else {
        haptic.error();
        toast.error(result.error || 'Failed to enable biometric');
      }
    } else {
      disableBiometric();
      toast.success('Biometric disabled');
    }
  };

  const finishSetup = () => {
    onOpenChange(false);
    onSuccess?.();
    resetState();
  };

  const resetState = () => {
    setStep('enter');
    setPin('');
    setConfirmPin('');
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'biometric' ? (
              <>
                <Fingerprint className="w-5 h-5 text-jade" />
                Enable Biometric
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-jade" />
                Set Up Quick PIN
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'enter' 
              ? 'Create a 4-digit PIN for quick access'
              : step === 'confirm'
              ? 'Confirm your PIN'
              : 'Use fingerprint or Face ID for even faster unlock'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'biometric' ? (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="w-16 h-16 rounded-full bg-jade/10 flex items-center justify-center">
              <Fingerprint className="w-8 h-8 text-jade" />
            </div>

            <div className="flex items-center justify-between w-full max-w-[250px] p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-jade" />
                <Label htmlFor="biometric-switch">Use Biometric</Label>
              </div>
              <Switch
                id="biometric-switch"
                checked={biometricEnabled}
                onCheckedChange={handleBiometricToggle}
              />
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-[250px]">
              Enable biometric authentication for the fastest unlock experience
            </p>

            <Button onClick={finishSetup} className="w-full max-w-[250px] bg-jade hover:bg-jade/90">
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="w-16 h-16 rounded-full bg-jade/10 flex items-center justify-center">
              {step === 'enter' ? (
                <Lock className="w-8 h-8 text-jade" />
              ) : (
                <Check className="w-8 h-8 text-jade" />
              )}
            </div>

            <InputOTP
              maxLength={4}
              value={step === 'enter' ? pin : confirmPin}
              onChange={handlePinComplete}
              onComplete={handlePinComplete}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
              </InputOTPGroup>
            </InputOTP>

            <p className="text-sm text-muted-foreground text-center max-w-[250px]">
              {step === 'enter'
                ? 'This PIN will let you quickly unlock the app without entering your password'
                : 'Enter the same PIN again to confirm'
              }
            </p>
          </div>
        )}

        {step !== 'biometric' && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            {step === 'confirm' && confirmPin.length === 4 && (
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-1 bg-jade hover:bg-jade/90"
              >
                {isLoading ? 'Setting...' : 'Confirm PIN'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
