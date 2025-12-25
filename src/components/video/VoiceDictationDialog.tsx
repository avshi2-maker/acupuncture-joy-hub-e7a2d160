import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Save, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VoiceDictationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  visitId?: string;
  videoSessionId?: string;
  onSaved?: (transcription: string, audioUrl: string) => void;
}

export function VoiceDictationDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  visitId,
  videoSessionId,
  onSaved,
}: VoiceDictationDialogProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('לא ניתן להתחיל הקלטה. בדוק הרשאות מיקרופון.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Call voice-to-text edge function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data?.text) {
        setTranscription(data.text);
        toast.success('תמלול הושלם');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('שגיאה בתמלול. נסה שוב.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !audioBlob) {
      toast.error('אין הקלטה לשמירה');
      return;
    }

    setIsSaving(true);
    try {
      // Upload audio file to storage
      const fileName = `${user.id}/${Date.now()}_treatment_plan.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-recordings')
        .getPublicUrl(fileName);

      // Save record to database
      const { error: dbError } = await supabase.from('voice_recordings').insert({
        therapist_id: user.id,
        patient_id: patientId || null,
        visit_id: visitId || null,
        video_session_id: videoSessionId || null,
        audio_url: urlData.publicUrl,
        transcription: transcription || null,
        recording_type: 'treatment_plan',
        duration_seconds: recordingDuration,
      });

      if (dbError) throw dbError;

      toast.success('ההקלטה נשמרה בהצלחה');
      onSaved?.(transcription, urlData.publicUrl);
      onOpenChange(false);
      resetState();
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('שגיאה בשמירת ההקלטה');
    } finally {
      setIsSaving(false);
    }
  };

  const resetState = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscription('');
    setRecordingDuration(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-jade" />
            הקלטת תוכנית טיפול
          </DialogTitle>
          <DialogDescription>
            {patientName 
              ? `הקלט תוכנית טיפול עבור ${patientName}` 
              : 'הקלט תוכנית טיפול קולית לשמירה בתיק המטופל'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg">
            {/* Recording Timer */}
            <div className="text-3xl font-mono text-jade">
              {formatDuration(recordingDuration)}
            </div>

            {/* Recording Progress */}
            {isRecording && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-500 font-medium">מקליט...</span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isRecording && !audioBlob && (
                <Button onClick={startRecording} size="lg" className="gap-2 bg-jade hover:bg-jade/90">
                  <Mic className="h-5 w-5" />
                  התחל הקלטה
                </Button>
              )}

              {isRecording && (
                <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2">
                  <Square className="h-5 w-5" />
                  עצור הקלטה
                </Button>
              )}

              {audioBlob && !isRecording && (
                <>
                  <Button onClick={togglePlayback} variant="outline" size="lg" className="gap-2">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    {isPlaying ? 'עצור' : 'נגן'}
                  </Button>
                  <Button onClick={resetState} variant="ghost" size="lg" className="gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    מחק
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Transcription */}
          {audioBlob && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>תמלול</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  className="gap-2"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      מתמלל...
                    </>
                  ) : (
                    'תמלל אוטומטי'
                  )}
                </Button>
              </div>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="התמלול יופיע כאן או הקלד ידנית..."
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={!audioBlob || isSaving}
            className="gap-2 bg-jade hover:bg-jade/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                שמור הקלטה
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}