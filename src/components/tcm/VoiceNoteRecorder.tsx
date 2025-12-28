import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, Trash2, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface VoiceNote {
  id: string;
  audioBlob: Blob;
  audioUrl: string;
  transcription: string;
  duration: number;
  timestamp: string;
}

interface VoiceNoteRecorderProps {
  voiceNotes: VoiceNote[];
  onAddNote: (note: VoiceNote) => void;
  onDeleteNote: (id: string) => void;
  disabled?: boolean;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  voiceNotes,
  onAddNote,
  onDeleteNote,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Auto-transcribe
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio },
            });
            
            const transcription = error ? 'Transcription failed' : (data?.text || 'No transcription available');
            
            const note: VoiceNote = {
              id: `vn-${Date.now()}`,
              audioBlob,
              audioUrl,
              transcription,
              duration: recordingDuration,
              timestamp: new Date().toISOString()
            };
            
            onAddNote(note);
            toast.success('Voice note recorded & transcribed');
            setIsTranscribing(false);
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Transcription error:', error);
          
          const note: VoiceNote = {
            id: `vn-${Date.now()}`,
            audioBlob,
            audioUrl,
            transcription: 'Transcription failed',
            duration: recordingDuration,
            timestamp: new Date().toISOString()
          };
          
          onAddNote(note);
          toast.warning('Voice note saved (transcription failed)');
          setIsTranscribing(false);
        }
        
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
      
      toast.info('Recording... Click stop when done');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Cannot access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const togglePlayback = (note: VoiceNote) => {
    if (playingNoteId === note.id) {
      audioElementRef.current?.pause();
      setPlayingNoteId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      
      audioElementRef.current = new Audio(note.audioUrl);
      audioElementRef.current.onended = () => setPlayingNoteId(null);
      audioElementRef.current.play();
      setPlayingNoteId(note.id);
    }
  };

  const handleDelete = (id: string) => {
    if (playingNoteId === id) {
      audioElementRef.current?.pause();
      setPlayingNoteId(null);
    }
    onDeleteNote(id);
  };

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isTranscribing}
          className="gap-2"
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              Stop ({formatDuration(recordingDuration)})
            </>
          ) : isTranscribing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Transcribing...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Record Voice Note
            </>
          )}
        </Button>
        
        {voiceNotes.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            {voiceNotes.length} note{voiceNotes.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Voice Notes List */}
      {voiceNotes.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {voiceNotes.map((note, index) => (
            <Card key={note.id} className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Note {index + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(note.duration)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {note.transcription}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => togglePlayback(note)}
                    >
                      {playingNoteId === note.id ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
