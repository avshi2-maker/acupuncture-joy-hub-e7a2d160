import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Circle, 
  Square, 
  Play, 
  Pause, 
  Save, 
  Download,
  Trash2,
  Loader2,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Settings2,
  Users2,
  User,
  Edit2,
  Volume2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AnimatedMic } from '@/components/ui/AnimatedMic';
import { AudioLevelMeter } from '@/components/ui/AudioLevelMeter';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SessionRecordingModuleProps {
  patientId?: string;
  patientName?: string;
  videoSessionId?: string;
  onTranscriptionUpdate?: (transcription: string) => void;
  onRecordingSaved?: (audioUrl: string, transcription: string) => void;
}

type RecordingMode = 'full-session' | 'voice-notes' | 'live-transcription';

interface VoiceNote {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  transcription?: string;
  timestamp: Date;
}

export function SessionRecordingModule({
  patientId,
  patientName,
  videoSessionId,
  onTranscriptionUpdate,
  onRecordingSaved,
}: SessionRecordingModuleProps) {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<RecordingMode>('voice-notes');
  
  // Full session recording state
  const [isRecordingSession, setIsRecordingSession] = useState(false);
  const [sessionBlob, setSessionBlob] = useState<Blob | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionTranscription, setSessionTranscription] = useState('');
  const [isTranscribingSession, setIsTranscribingSession] = useState(false);
  const [enableDiarization, setEnableDiarization] = useState(true);
  const [detectedSpeakers, setDetectedSpeakers] = useState<string[]>([]);
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({
    'speaker_0': 'מטפל',
    'speaker_1': patientName || 'מטופל',
  });
  const [showSpeakerSettings, setShowSpeakerSettings] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  
  // Voice notes state
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [noteDuration, setNoteDuration] = useState(0);
  
  // Live transcription state
  const [isLiveTranscribing, setIsLiveTranscribing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [committedTranscripts, setCommittedTranscripts] = useState<{
    text: string; 
    speaker: string; 
    timestamp: Date;
    id: string;
  }[]>([]);
  const [liveSpeaker, setLiveSpeaker] = useState<string | null>(null);
  const [enableLiveDiarization, setEnableLiveDiarization] = useState(true);
  const liveAnalyserRef = useRef<AnalyserNode | null>(null);
  const liveSpeakerDetectionRef = useRef<NodeJS.Timeout | null>(null);
  const liveSessionStartRef = useRef<Date | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);
  
  // Playback state
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [isPlayingSession, setIsPlayingSession] = useState(false);
  
  // Media refs
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakerDetectionRef = useRef<NodeJS.Timeout | null>(null);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speakerDetectionRef.current) clearInterval(speakerDetectionRef.current);
      if (liveSpeakerDetectionRef.current) clearInterval(liveSpeakerDetectionRef.current);
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (webSocketRef.current) webSocketRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      voiceNotes.forEach(note => URL.revokeObjectURL(note.url));
      if (sessionUrl) URL.revokeObjectURL(sessionUrl);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // FULL SESSION RECORDING
  // ============================================
  const startSessionRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      setMediaStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setSessionBlob(blob);
        setSessionUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        setActiveSpeaker(null);
      };

      // Record in chunks for long sessions
      mediaRecorder.start(10000); // 10 second chunks
      setIsRecordingSession(true);
      setSessionDuration(0);

      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      // Set up audio analysis for live speaker detection
      if (enableDiarization) {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastSpeakerChange = Date.now();
        let currentSpeaker = 'speaker_0';
        
        // Simulate speaker detection based on audio patterns
        speakerDetectionRef.current = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          
          // If there's audio activity
          if (average > 20) {
            const now = Date.now();
            // Simulate speaker changes based on silence gaps (>1.5s gap = possible speaker change)
            if (now - lastSpeakerChange > 1500 && Math.random() > 0.7) {
              currentSpeaker = currentSpeaker === 'speaker_0' ? 'speaker_1' : 'speaker_0';
              lastSpeakerChange = now;
            }
            setActiveSpeaker(currentSpeaker);
          } else {
            setActiveSpeaker(null);
          }
        }, 100);
      }

      toast.success('הקלטת פגישה מלאה התחילה');
    } catch (error) {
      console.error('Error starting session recording:', error);
      toast.error('לא ניתן להתחיל הקלטה. בדוק הרשאות מיקרופון.');
    }
  }, [enableDiarization]);

  const stopSessionRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingSession) {
      mediaRecorderRef.current.stop();
      setIsRecordingSession(false);
      setActiveSpeaker(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (speakerDetectionRef.current) {
        clearInterval(speakerDetectionRef.current);
        speakerDetectionRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      toast.success('הקלטת הפגישה הסתיימה');
    }
  }, [isRecordingSession]);

  const transcribeSession = async (withDiarization: boolean = enableDiarization) => {
    if (!sessionBlob) return;

    setIsTranscribingSession(true);
    try {
      // Use ElevenLabs for diarization, OpenAI Whisper for simple transcription
      if (withDiarization) {
        // Create FormData for ElevenLabs
        const formData = new FormData();
        formData.append('audio', sessionBlob, 'recording.webm');
        formData.append('diarize', 'true');
        formData.append('language', 'heb');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Transcription with diarization failed');
        }

        const data = await response.json();
        
        if (data.formatted_text) {
          setSessionTranscription(data.formatted_text);
          setDetectedSpeakers(data.speakers || []);
          onTranscriptionUpdate?.(data.formatted_text);
          
          const speakerCount = data.speakers?.length || 0;
          toast.success(`תמלול הושלם - זוהו ${speakerCount} דוברים`);
        }
      } else {
        // Use OpenAI Whisper for simple transcription
        const reader = new FileReader();
        const base64Audio = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(sessionBlob);
        });

        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        if (data?.text) {
          setSessionTranscription(data.text);
          setDetectedSpeakers([]);
          onTranscriptionUpdate?.(data.text);
          toast.success('תמלול הפגישה הושלם');
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('שגיאה בתמלול. נסה שוב.');
    } finally {
      setIsTranscribingSession(false);
    }
  };

  // ============================================
  // VOICE NOTES
  // ============================================
  const startVoiceNote = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const newNote: VoiceNote = {
          id: `note_${Date.now()}`,
          blob,
          url: URL.createObjectURL(blob),
          duration: noteDuration,
          timestamp: new Date(),
        };
        setVoiceNotes(prev => [...prev, newNote]);
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        setNoteDuration(0);
      };

      mediaRecorder.start();
      setIsRecordingNote(true);
      setNoteDuration(0);

      timerRef.current = setInterval(() => {
        setNoteDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting voice note:', error);
      toast.error('לא ניתן להתחיל הקלטה');
    }
  }, [noteDuration]);

  const stopVoiceNote = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingNote) {
      mediaRecorderRef.current.stop();
      setIsRecordingNote(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecordingNote]);

  const transcribeVoiceNote = async (noteId: string) => {
    const note = voiceNotes.find(n => n.id === noteId);
    if (!note) return;

    try {
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(note.blob);
      });

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data?.text) {
        setVoiceNotes(prev => prev.map(n => 
          n.id === noteId ? { ...n, transcription: data.text } : n
        ));
        toast.success('תמלול הושלם');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('שגיאה בתמלול');
    }
  };

  const deleteVoiceNote = (noteId: string) => {
    setVoiceNotes(prev => {
      const note = prev.find(n => n.id === noteId);
      if (note) URL.revokeObjectURL(note.url);
      return prev.filter(n => n.id !== noteId);
    });
    if (playingNoteId === noteId) {
      audioElementRef.current?.pause();
      setPlayingNoteId(null);
    }
  };

  const playVoiceNote = (noteId: string) => {
    const note = voiceNotes.find(n => n.id === noteId);
    if (!note) return;

    if (playingNoteId === noteId) {
      audioElementRef.current?.pause();
      setPlayingNoteId(null);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    audioElementRef.current = new Audio(note.url);
    audioElementRef.current.onended = () => setPlayingNoteId(null);
    audioElementRef.current.play();
    setPlayingNoteId(noteId);
  };

  // ============================================
  // LIVE TRANSCRIPTION (ElevenLabs Scribe)
  // ============================================
  const startLiveTranscription = useCallback(async () => {
    try {
      // Get token from edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (error || !data?.token) {
        throw new Error('Failed to get transcription token');
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      setMediaStream(stream);

      // Create WebSocket connection to ElevenLabs
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/scribe/realtime?token=${data.token}`);
      webSocketRef.current = ws;

      // Track current speaker for VAD-based detection with adaptive thresholds
      let currentLiveSpeaker = 'speaker_0'; // Therapist starts first
      let lastSpeechTime = Date.now();
      let silenceStartTime: number | null = null;
      let speechDuration = 0; // Track how long current speaker has been talking
      let turnCount = 0; // Track conversation turns
      
      // Adaptive silence thresholds for more natural diarization
      const SHORT_PAUSE_MS = 800;  // Brief pause, same speaker continues
      const TURN_CHANGE_MS = 1500; // Longer pause, likely speaker change
      const LONG_MONOLOGUE_MS = 20000; // Very long speech, might be therapist explaining

      ws.onopen = () => {
        console.log('ElevenLabs Scribe connected');
        setIsLiveTranscribing(true);
        liveSessionStartRef.current = new Date();
        toast.success('תמלול חי התחיל - ElevenLabs');

        // Send initial configuration
        ws.send(JSON.stringify({
          type: 'config',
          model_id: 'scribe_v2_realtime',
          language: 'he', // Hebrew
          commit_strategy: 'vad', // Voice Activity Detection
        }));

        // Start sending audio data
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        // Create analyser for VAD-based speaker detection
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        liveAnalyserRef.current = analyser;
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let voiceActivityBuffer: number[] = [];
        const BUFFER_SIZE = 10; // Smooth over last 10 samples
        
        // Advanced VAD-based speaker detection with pattern recognition
        if (enableLiveDiarization) {
          liveSpeakerDetectionRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const now = Date.now();
            
            // Add to buffer for smoothing
            voiceActivityBuffer.push(average);
            if (voiceActivityBuffer.length > BUFFER_SIZE) voiceActivityBuffer.shift();
            const smoothedAverage = voiceActivityBuffer.reduce((a, b) => a + b, 0) / voiceActivityBuffer.length;
            
            // Voice activity detected (with hysteresis)
            const isVoiceActive = smoothedAverage > 20;
            
            if (isVoiceActive) {
              // Calculate silence duration if coming back from silence
              const silenceDuration = silenceStartTime ? (now - silenceStartTime) : 0;
              
              // Determine if this is a speaker change
              if (silenceStartTime && silenceDuration > SHORT_PAUSE_MS) {
                // Check for turn change based on silence duration
                if (silenceDuration > TURN_CHANGE_MS) {
                  currentLiveSpeaker = currentLiveSpeaker === 'speaker_0' ? 'speaker_1' : 'speaker_0';
                  turnCount++;
                  speechDuration = 0;
                  console.log(`Speaker change detected (turn ${turnCount}): ${currentLiveSpeaker}`);
                }
              }
              
              silenceStartTime = null;
              lastSpeechTime = now;
              speechDuration += 50; // Add interval duration
              setLiveSpeaker(currentLiveSpeaker);
            } else {
              // Silence detected
              if (!silenceStartTime) {
                silenceStartTime = now;
              }
              
              // Clear active speaker indicator after brief silence
              if ((now - lastSpeechTime) > 400) {
                setLiveSpeaker(null);
              }
            }
          }, 50);
        }

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert to 16-bit PCM
            const int16Array = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            // Convert to base64
            const uint8Array = new Uint8Array(int16Array.buffer);
            let binary = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
              binary += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const base64Audio = btoa(binary);
            
            ws.send(JSON.stringify({
              type: 'audio',
              audio: base64Audio,
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'partial_transcript') {
            setPartialTranscript(data.text || '');
          } else if (data.type === 'committed_transcript') {
            const text = data.text || '';
            if (text.trim()) {
              // Add transcript with current speaker label and timestamp
              const speaker = enableLiveDiarization ? currentLiveSpeaker : 'unknown';
              const timestamp = new Date();
              const id = `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              setCommittedTranscripts(prev => [...prev, { text, speaker, timestamp, id }]);
              
              // Update full transcript with speaker labels
              const labeledText = enableLiveDiarization 
                ? `[${speaker}]: ${text}` 
                : text;
              setLiveTranscript(prev => prev ? prev + '\n\n' + labeledText : labeledText);
              onTranscriptionUpdate?.(liveTranscript + '\n\n' + labeledText);
            }
            setPartialTranscript('');
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('שגיאה בחיבור לשירות תמלול');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsLiveTranscribing(false);
        setLiveSpeaker(null);
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      };

    } catch (error) {
      console.error('Error starting live transcription:', error);
      toast.error('לא ניתן להתחיל תמלול חי');
    }
  }, [liveTranscript, onTranscriptionUpdate, enableLiveDiarization]);

  const stopLiveTranscription = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (liveSpeakerDetectionRef.current) {
      clearInterval(liveSpeakerDetectionRef.current);
      liveSpeakerDetectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsLiveTranscribing(false);
    setLiveSpeaker(null);
    liveSessionStartRef.current = null;
  }, [mediaStream]);

  // ============================================
  // SPEAKER CORRECTION & EXPORT
  // ============================================
  const updateSpeakerForTranscript = (transcriptId: string, newSpeaker: string) => {
    setCommittedTranscripts(prev => 
      prev.map(t => t.id === transcriptId ? { ...t, speaker: newSpeaker } : t)
    );
    toast.success('הדובר עודכן');
  };

  const formatTimestamp = (timestamp: Date) => {
    if (!liveSessionStartRef.current) {
      return timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    const elapsed = Math.floor((timestamp.getTime() - liveSessionStartRef.current.getTime()) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportLiveTranscription = (format: 'text' | 'formatted') => {
    if (committedTranscripts.length === 0) {
      toast.error('אין תמלול לייצוא');
      return;
    }

    let content = '';
    const sessionDate = liveSessionStartRef.current || new Date();
    
    if (format === 'formatted') {
      content = `תמלול פגישה\n`;
      content += `תאריך: ${sessionDate.toLocaleDateString('he-IL')}\n`;
      if (patientName) content += `מטופל: ${patientName}\n`;
      content += `${'─'.repeat(40)}\n\n`;
      
      committedTranscripts.forEach((t) => {
        const displayName = speakerNames[t.speaker] || (t.speaker === 'speaker_0' ? 'מטפל' : 'מטופל');
        const timestamp = formatTimestamp(t.timestamp);
        content += `[${timestamp}] ${displayName}:\n${t.text}\n\n`;
      });
    } else {
      committedTranscripts.forEach((t) => {
        content += `${t.text}\n`;
      });
    }

    // Copy to clipboard
    navigator.clipboard.writeText(content).then(() => {
      setCopiedExport(true);
      toast.success('התמלול הועתק ללוח');
      setTimeout(() => setCopiedExport(false), 2000);
    });
  };

  const downloadTranscription = () => {
    if (committedTranscripts.length === 0) {
      toast.error('אין תמלול להורדה');
      return;
    }

    let content = '';
    const sessionDate = liveSessionStartRef.current || new Date();
    
    content = `תמלול פגישה\n`;
    content += `תאריך: ${sessionDate.toLocaleDateString('he-IL')}\n`;
    if (patientName) content += `מטופל: ${patientName}\n`;
    content += `${'─'.repeat(40)}\n\n`;
    
    committedTranscripts.forEach((t) => {
      const displayName = speakerNames[t.speaker] || (t.speaker === 'speaker_0' ? 'מטפל' : 'מטופל');
      const timestamp = formatTimestamp(t.timestamp);
      content += `[${timestamp}] ${displayName}:\n${t.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${sessionDate.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('הקובץ הורד');
  };

  // ============================================
  // SAVE ALL
  // ============================================
  const saveAllRecordings = async () => {
    if (!user) {
      toast.error('יש להתחבר כדי לשמור');
      return;
    }

    setIsSaving(true);
    try {
      // Save session recording if exists
      if (sessionBlob) {
        const fileName = `${user.id}/${Date.now()}_full_session.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('voice-recordings')
          .upload(fileName, sessionBlob, { contentType: 'audio/webm' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('voice-recordings')
          .getPublicUrl(fileName);

        await supabase.from('voice_recordings').insert({
          therapist_id: user.id,
          patient_id: patientId || null,
          video_session_id: videoSessionId || null,
          audio_url: urlData.publicUrl,
          transcription: sessionTranscription || null,
          recording_type: 'full_session',
          duration_seconds: sessionDuration,
        });

        onRecordingSaved?.(urlData.publicUrl, sessionTranscription);
      }

      // Save voice notes
      for (const note of voiceNotes) {
        const fileName = `${user.id}/${Date.now()}_voice_note_${note.id}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('voice-recordings')
          .upload(fileName, note.blob, { contentType: 'audio/webm' });

        if (uploadError) continue;

        const { data: urlData } = supabase.storage
          .from('voice-recordings')
          .getPublicUrl(fileName);

        await supabase.from('voice_recordings').insert({
          therapist_id: user.id,
          patient_id: patientId || null,
          video_session_id: videoSessionId || null,
          audio_url: urlData.publicUrl,
          transcription: note.transcription || null,
          recording_type: 'voice_note',
          duration_seconds: note.duration,
        });
      }

      // Save live transcription as text
      if (liveTranscript.trim()) {
        await supabase.from('voice_recordings').insert({
          therapist_id: user.id,
          patient_id: patientId || null,
          video_session_id: videoSessionId || null,
          audio_url: '', // No audio for live transcription
          transcription: liveTranscript,
          recording_type: 'live_transcription',
          duration_seconds: 0,
        });
      }

      toast.success('כל ההקלטות נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving recordings:', error);
      toast.error('שגיאה בשמירת ההקלטות');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5 text-jade" />
            הקלטת פגישה
            {patientName && (
              <Badge variant="secondary" className="mr-2">
                {patientName}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            ElevenLabs
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as RecordingMode)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voice-notes" className="gap-1 text-xs">
              <Mic className="h-3 w-3" />
              הערות קוליות
            </TabsTrigger>
            <TabsTrigger value="full-session" className="gap-1 text-xs">
              <Circle className="h-3 w-3" />
              הקלטה מלאה
            </TabsTrigger>
            <TabsTrigger value="live-transcription" className="gap-1 text-xs">
              <Radio className="h-3 w-3" />
              תמלול חי
            </TabsTrigger>
          </TabsList>

          {/* Voice Notes Tab */}
          <TabsContent value="voice-notes" className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {isRecordingNote ? (
                <>
                  <AnimatedMic size="xl" isRecording={true} />
                  <div className="text-2xl font-mono text-jade">
                    {formatDuration(noteDuration)}
                  </div>
                  {mediaStream && (
                    <AudioLevelMeter stream={mediaStream} isRecording={true} variant="bars" />
                  )}
                  <Button onClick={stopVoiceNote} variant="destructive" className="gap-2">
                    <Square className="h-4 w-4" />
                    סיים הקלטה
                  </Button>
                </>
              ) : (
                <Button onClick={startVoiceNote} className="gap-2 bg-jade hover:bg-jade/90">
                  <Mic className="h-4 w-4" />
                  הקלט הערה קולית
                </Button>
              )}
            </div>

            {voiceNotes.length > 0 && (
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {voiceNotes.map((note, index) => (
                    <div 
                      key={note.id} 
                      className="flex items-center gap-2 p-2 bg-background border rounded-lg"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playVoiceNote(note.id)}
                      >
                        {playingNoteId === note.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">הערה #{index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(note.duration)}
                          </Badge>
                        </div>
                        {note.transcription && (
                          <p className="text-xs text-muted-foreground truncate">
                            {note.transcription}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => transcribeVoiceNote(note.id)}
                        disabled={!!note.transcription}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVoiceNote(note.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Full Session Tab */}
          <TabsContent value="full-session" className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-mono text-jade">
                {formatDuration(sessionDuration)}
              </div>
              
              {isRecordingSession ? (
                <>
                  <AnimatedMic size="xl" isRecording={true} />
                  {mediaStream && (
                    <AudioLevelMeter stream={mediaStream} isRecording={true} variant="wave" />
                  )}
                  
                  {/* Live Speaker Indicator */}
                  {enableDiarization && (
                    <div className="flex items-center gap-3 w-full justify-center">
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                        activeSpeaker === 'speaker_0' 
                          ? 'bg-jade/20 border border-jade scale-105' 
                          : 'bg-muted/50 opacity-50'
                      }`}>
                        <Volume2 className={`h-4 w-4 ${activeSpeaker === 'speaker_0' ? 'text-jade animate-pulse' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{speakerNames['speaker_0'] || 'מטפל'}</span>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                        activeSpeaker === 'speaker_1' 
                          ? 'bg-amber-100 dark:bg-amber-950/30 border border-amber-400 scale-105' 
                          : 'bg-muted/50 opacity-50'
                      }`}>
                        <Volume2 className={`h-4 w-4 ${activeSpeaker === 'speaker_1' ? 'text-amber-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{speakerNames['speaker_1'] || 'מטופל'}</span>
                      </div>
                    </div>
                  )}
                  
                  <Badge variant="destructive" className="animate-pulse">
                    <Circle className="h-2 w-2 mr-1 fill-current" />
                    מקליט פגישה מלאה
                  </Badge>
                  <Button onClick={stopSessionRecording} variant="destructive" className="gap-2">
                    <Square className="h-4 w-4" />
                    סיים הקלטה
                  </Button>
                </>
              ) : sessionBlob ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    הקלטה של {formatDuration(sessionDuration)}
                  </Badge>
                  
                  {/* Diarization Toggle */}
                  <div className="flex items-center gap-3 p-2 bg-background rounded-lg border w-full justify-center">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="diarization" className="text-sm">
                        זיהוי דוברים
                      </Label>
                    </div>
                    <Switch
                      id="diarization"
                      checked={enableDiarization}
                      onCheckedChange={setEnableDiarization}
                    />
                    {enableDiarization && (
                      <Badge variant="outline" className="text-xs">
                        מטפל / מטופל
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (audioElementRef.current) {
                          audioElementRef.current.pause();
                        }
                        audioElementRef.current = new Audio(sessionUrl!);
                        audioElementRef.current.onended = () => setIsPlayingSession(false);
                        if (isPlayingSession) {
                          audioElementRef.current.pause();
                          setIsPlayingSession(false);
                        } else {
                          audioElementRef.current.play();
                          setIsPlayingSession(true);
                        }
                      }}
                    >
                      {isPlayingSession ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => transcribeSession(enableDiarization)}
                      disabled={isTranscribingSession}
                      className="gap-1"
                    >
                      {isTranscribingSession ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : enableDiarization ? (
                        <Users2 className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {enableDiarization ? 'תמלל עם דוברים' : 'תמלל'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (sessionUrl) {
                          const a = document.createElement('a');
                          a.href = sessionUrl;
                          a.download = `session_${Date.now()}.webm`;
                          a.click();
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Speaker Labels with Customization */}
                  {detectedSpeakers.length > 0 && (
                    <div className="flex items-center gap-2 w-full justify-center flex-wrap">
                      <span className="text-xs text-muted-foreground">דוברים שזוהו:</span>
                      {detectedSpeakers.map((speaker) => (
                        <Badge key={speaker} variant="outline" className="gap-1">
                          <User className="h-3 w-3" />
                          {speakerNames[speaker] || speaker}
                        </Badge>
                      ))}
                      <Dialog open={showSpeakerSettings} onOpenChange={setShowSpeakerSettings}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Users2 className="h-5 w-5" />
                              התאמת שמות דוברים
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {detectedSpeakers.map((speaker, idx) => (
                              <div key={speaker} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  speaker === 'speaker_0' ? 'bg-jade' : 'bg-amber-400'
                                }`} />
                                <Label className="w-24 text-sm text-muted-foreground">
                                  {speaker}
                                </Label>
                                <Input
                                  value={speakerNames[speaker] || ''}
                                  onChange={(e) => setSpeakerNames(prev => ({
                                    ...prev,
                                    [speaker]: e.target.value
                                  }))}
                                  placeholder={speaker === 'speaker_0' ? 'ד"ר כהן' : 'שם המטופל'}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                            <div className="text-xs text-muted-foreground mt-2">
                              השמות יוחלו על התמלול הנוכחי והעתידי
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  
                  {/* Transcription Display with Custom Names */}
                  {sessionTranscription && (
                    <div className="w-full space-y-2">
                      <ScrollArea className="h-40 w-full border rounded-lg p-3 bg-background">
                        <div className="space-y-2 text-sm" dir="rtl">
                          {sessionTranscription.split('\n\n').map((segment, idx) => {
                            const match = segment.match(/^\[(.*?)\]:\s*(.*)/s);
                            if (match && enableDiarization) {
                              const speaker = match[1];
                              const text = match[2];
                              const isTherapist = speaker === 'speaker_0';
                              const displayName = speakerNames[speaker] || (isTherapist ? 'מטפל' : 'מטופל');
                              return (
                                <div 
                                  key={idx} 
                                  className={`p-2 rounded-lg ${
                                    isTherapist 
                                      ? 'bg-jade/10 border-r-2 border-jade' 
                                      : 'bg-amber-50 border-r-2 border-amber-400 dark:bg-amber-950/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-1 text-xs font-medium mb-1">
                                    <User className="h-3 w-3" />
                                    {displayName}
                                  </div>
                                  <p className="text-sm">{text}</p>
                                </div>
                              );
                            }
                            return (
                              <p key={idx} className="text-sm">{segment}</p>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <Textarea
                        value={sessionTranscription}
                        onChange={(e) => setSessionTranscription(e.target.value)}
                        placeholder="ערוך תמלול..."
                        rows={3}
                        className="w-full text-xs"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={startSessionRecording} className="gap-2 bg-jade hover:bg-jade/90">
                  <Circle className="h-4 w-4" />
                  התחל הקלטת פגישה מלאה
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Live Transcription Tab */}
          <TabsContent value="live-transcription" className="space-y-4 mt-4">
            {/* Diarization Toggle */}
            <div className="flex items-center justify-center gap-3 p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="live-diarization" className="text-sm">
                  זיהוי דוברים חי
                </Label>
              </div>
              <Switch
                id="live-diarization"
                checked={enableLiveDiarization}
                onCheckedChange={setEnableLiveDiarization}
                disabled={isLiveTranscribing}
              />
            </div>
            
            <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {isLiveTranscribing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-red-500 animate-pulse" />
                    <span className="text-sm font-medium">תמלול חי פעיל</span>
                  </div>
                  
                  {/* Live Speaker Indicators */}
                  {enableLiveDiarization && (
                    <div className="flex items-center gap-3 w-full justify-center">
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                        liveSpeaker === 'speaker_0' 
                          ? 'bg-jade/20 border border-jade scale-105 shadow-sm' 
                          : 'bg-muted/50 opacity-50'
                      }`}>
                        <Volume2 className={`h-4 w-4 ${liveSpeaker === 'speaker_0' ? 'text-jade animate-pulse' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{speakerNames['speaker_0'] || 'מטפל'}</span>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                        liveSpeaker === 'speaker_1' 
                          ? 'bg-amber-100 dark:bg-amber-950/30 border border-amber-400 scale-105 shadow-sm' 
                          : 'bg-muted/50 opacity-50'
                      }`}>
                        <Volume2 className={`h-4 w-4 ${liveSpeaker === 'speaker_1' ? 'text-amber-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{speakerNames['speaker_1'] || 'מטופל'}</span>
                      </div>
                    </div>
                  )}
                  
                  {mediaStream && (
                    <AudioLevelMeter stream={mediaStream} isRecording={true} variant="circle" />
                  )}
                  <Button onClick={stopLiveTranscription} variant="destructive" className="gap-2">
                    <MicOff className="h-4 w-4" />
                    עצור תמלול
                  </Button>
                </>
              ) : (
                <Button onClick={startLiveTranscription} className="gap-2 bg-jade hover:bg-jade/90">
                  <Radio className="h-4 w-4" />
                  התחל תמלול חי
                </Button>
              )}
            </div>

            {/* Live Transcription Display with Speaker Labels & Timestamps */}
            {(committedTranscripts.length > 0 || partialTranscript) && (
              <div className="space-y-2">
                {/* Export Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {committedTranscripts.length} קטעים
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportLiveTranscription('formatted')}
                      className="gap-1 h-7 text-xs"
                    >
                      {copiedExport ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      העתק
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTranscription}
                      className="gap-1 h-7 text-xs"
                    >
                      <Download className="h-3 w-3" />
                      הורד
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-56 border rounded-lg p-3 bg-background">
                  <div className="space-y-2" dir="rtl">
                    {committedTranscripts.map((item) => {
                      if (enableLiveDiarization && typeof item === 'object') {
                        const isTherapist = item.speaker === 'speaker_0';
                        const displayName = speakerNames[item.speaker] || (isTherapist ? 'מטפל' : 'מטופל');
                        const timestamp = formatTimestamp(item.timestamp);
                        return (
                          <div 
                            key={item.id} 
                            className={`p-2 rounded-lg group ${
                              isTherapist 
                                ? 'bg-jade/10 border-r-2 border-jade' 
                                : 'bg-amber-50 dark:bg-amber-950/20 border-r-2 border-amber-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {/* Speaker Label with Dropdown for Manual Correction */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1 text-xs font-medium hover:bg-background/50 rounded px-1 py-0.5 transition-colors">
                                      <User className="h-3 w-3" />
                                      {displayName}
                                      <RefreshCw className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem 
                                      onClick={() => updateSpeakerForTranscript(item.id, 'speaker_0')}
                                      className="gap-2"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-jade" />
                                      {speakerNames['speaker_0'] || 'מטפל'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => updateSpeakerForTranscript(item.id, 'speaker_1')}
                                      className="gap-2"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                                      {speakerNames['speaker_1'] || 'מטופל'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {/* Timestamp Badge */}
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                {timestamp}
                              </Badge>
                            </div>
                            <p className="text-sm">{item.text}</p>
                          </div>
                        );
                      }
                      // Fallback for string transcripts
                      const text = typeof item === 'object' ? item.text : item;
                      return (
                        <p key={typeof item === 'object' ? item.id : Math.random()} className="text-sm">{text}</p>
                      );
                    })}
                    {partialTranscript && (
                      <div className={`p-2 rounded-lg border-r-2 ${
                        liveSpeaker === 'speaker_0' 
                          ? 'bg-jade/5 border-jade/50' 
                          : liveSpeaker === 'speaker_1'
                          ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-400/50'
                          : 'bg-muted/30 border-muted-foreground/30'
                      }`}>
                        <p className="text-sm text-muted-foreground italic">{partialTranscript}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLiveTranscript('');
                      setCommittedTranscripts([]);
                      setPartialTranscript('');
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    נקה
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        {(sessionBlob || voiceNotes.length > 0 || liveTranscript) && (
          <Button 
            onClick={saveAllRecordings} 
            disabled={isSaving}
            className="w-full gap-2 bg-jade hover:bg-jade/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                שמור את כל ההקלטות
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
