import { useState, useCallback, useEffect } from 'react';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if WebAuthn is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // Check for WebAuthn support
        const hasWebAuthn = window.PublicKeyCredential !== undefined;
        
        if (!hasWebAuthn) {
          setIsAvailable(false);
          return;
        }

        // Check for platform authenticator (biometrics)
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(available);
        
        // Check if user has enabled biometric
        const enabled = localStorage.getItem('biometric_enabled') === 'true';
        setIsEnabled(enabled);
      } catch (err) {
        console.log('Biometric check failed:', err);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  // Enable biometric authentication
  const enableBiometric = useCallback(async (): Promise<BiometricAuthResult> => {
    if (!isAvailable) {
      return { success: false, error: 'Biometric not available' };
    }

    try {
      setIsAuthenticating(true);
      
      // Create a credential for this device
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Clinic Manager',
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: 'therapist',
            displayName: 'Therapist'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem('biometric_credential_id', credentialId);
        localStorage.setItem('biometric_enabled', 'true');
        setIsEnabled(true);
        return { success: true };
      }

      return { success: false, error: 'Failed to create credential' };
    } catch (err: any) {
      console.error('Biometric enable failed:', err);
      return { success: false, error: err.message || 'Failed to enable biometric' };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAvailable]);

  // Authenticate with biometric
  const authenticate = useCallback(async (): Promise<BiometricAuthResult> => {
    if (!isAvailable || !isEnabled) {
      return { success: false, error: 'Biometric not available or enabled' };
    }

    try {
      setIsAuthenticating(true);

      const credentialIdBase64 = localStorage.getItem('biometric_credential_id');
      if (!credentialIdBase64) {
        return { success: false, error: 'No credential stored' };
      }

      const credentialId = Uint8Array.from(atob(credentialIdBase64), c => c.charCodeAt(0));
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: credentialId,
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        }
      });

      if (assertion) {
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (err: any) {
      console.error('Biometric auth failed:', err);
      
      // Handle user cancellation gracefully
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'Authentication cancelled' };
      }
      
      return { success: false, error: err.message || 'Authentication failed' };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAvailable, isEnabled]);

  // Disable biometric
  const disableBiometric = useCallback(() => {
    localStorage.removeItem('biometric_credential_id');
    localStorage.removeItem('biometric_enabled');
    setIsEnabled(false);
  }, []);

  return {
    isAvailable,
    isEnabled,
    isAuthenticating,
    enableBiometric,
    authenticate,
    disableBiometric
  };
}
