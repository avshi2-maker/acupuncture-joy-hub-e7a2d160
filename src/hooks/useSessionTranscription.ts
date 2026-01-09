import { useState, useCallback, useRef, useEffect } from 'react';
import { useScribe } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
}

interface UseSessionTranscriptionOptions {
  enabled?: boolean;
  onTranscript?: (text: string) => void;
  onCommittedTranscript?: (text: string) => void;
}

export function useSessionTranscription(options: UseSessionTranscriptionOptions = {}) {
  const { enabled = false, onTranscript, onCommittedTranscript } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [committedTranscripts, setCommittedTranscripts] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Rolling window of last 60 seconds of transcripts
  const rollingWindowRef = useRef<TranscriptSegment[]>([]);
  const WINDOW_DURATION_MS = 60000; // 60 seconds

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    // Using manual commit - we'll let natural speech pauses determine segments
    onPartialTranscript: (data) => {
      setPartialTranscript(data.text);
      onTranscript?.(data.text);
    },
    onCommittedTranscript: (data) => {
      const segment: TranscriptSegment = {
        id: crypto.randomUUID(),
        text: data.text,
        timestamp: Date.now(),
      };
      
      setCommittedTranscripts(prev => [...prev, segment]);
      
      // Update rolling window
      rollingWindowRef.current.push(segment);
      
      // Clean up old segments outside the window
      const cutoffTime = Date.now() - WINDOW_DURATION_MS;
      rollingWindowRef.current = rollingWindowRef.current.filter(
        s => s.timestamp > cutoffTime
      );
      
      onCommittedTranscript?.(data.text);
    },
  });

  // Connect to transcription service
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Get token from edge function
      const { data, error: tokenError } = await supabase.functions.invoke(
        'session-transcribe-token'
      );
      
      if (tokenError || !data?.token) {
        throw new Error(tokenError?.message || 'Failed to get transcription token');
      }
      
      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      setIsConnected(true);
      console.log('[Transcription] Connected successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      console.error('[Transcription] Connection error:', err);
      toast.error('Failed to start transcription', { description: message });
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, scribe]);

  // Disconnect from transcription service
  const disconnect = useCallback(() => {
    scribe.disconnect();
    setIsConnected(false);
    setPartialTranscript('');
    console.log('[Transcription] Disconnected');
  }, [scribe]);

  // Get the rolling window text (last 60 seconds)
  const getRollingWindowText = useCallback(() => {
    const cutoffTime = Date.now() - WINDOW_DURATION_MS;
    rollingWindowRef.current = rollingWindowRef.current.filter(
      s => s.timestamp > cutoffTime
    );
    return rollingWindowRef.current.map(s => s.text).join(' ');
  }, []);

  // Get full transcript
  const getFullTranscript = useCallback(() => {
    return committedTranscripts.map(s => s.text).join(' ');
  }, [committedTranscripts]);

  // Clear transcripts (for new session)
  const clearTranscripts = useCallback(() => {
    setCommittedTranscripts([]);
    setPartialTranscript('');
    rollingWindowRef.current = [];
  }, []);

  // Auto-connect when enabled changes
  useEffect(() => {
    if (enabled && !isConnected && !isConnecting) {
      connect();
    } else if (!enabled && isConnected) {
      disconnect();
    }
  }, [enabled, isConnected, isConnecting, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return {
    isConnected,
    isConnecting,
    partialTranscript,
    committedTranscripts,
    error,
    connect,
    disconnect,
    getRollingWindowText,
    getFullTranscript,
    clearTranscripts,
  };
}
