import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  Save, 
  Mail, 
  MessageCircle,
  Mic,
  FileText,
  Clock,
  Trash2
} from 'lucide-react';
import { VoiceNoteRecorder, VoiceNote } from '@/components/tcm/VoiceNoteRecorder';
import { SessionTemplates, SessionTemplate } from '@/components/tcm/SessionTemplates';
import { Message } from '@/hooks/useTcmBrainState';

interface SessionNotesTabProps {
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
  sessionSeconds: number;
  formatSessionTime: (seconds: number) => string;
  questionsAsked: string[];
  messages: Message[];
  voiceNotes: VoiceNote[];
  activeTemplate: string | null;
  startSession: () => void;
  pauseSession: () => void;
  continueSession: () => void;
  endSession: () => void;
  handleAddVoiceNote: (note: VoiceNote) => void;
  handleDeleteVoiceNote: (id: string) => void;
  handleApplyTemplate: (template: SessionTemplate) => void;
  openGmailWithSession: (session: any) => void;
  openWhatsAppWithSession: (session: any) => void;
}

export function SessionNotesTab({
  sessionStatus,
  sessionSeconds,
  formatSessionTime,
  questionsAsked,
  messages,
  voiceNotes,
  activeTemplate,
  startSession,
  pauseSession,
  continueSession,
  endSession,
  handleAddVoiceNote,
  handleDeleteVoiceNote,
  handleApplyTemplate,
}: SessionNotesTabProps) {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {/* Session Timer Card */}
      <Card className="bg-gradient-to-r from-jade/10 to-primary/10 border-jade/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-jade" />
              <span>Session Timer</span>
            </div>
            <Badge 
              variant={sessionStatus === 'running' ? 'default' : 'outline'}
              className={sessionStatus === 'running' ? 'bg-jade animate-pulse' : ''}
            >
              {sessionStatus === 'idle' && 'Not Started'}
              {sessionStatus === 'running' && 'Live'}
              {sessionStatus === 'paused' && 'Paused'}
              {sessionStatus === 'ended' && 'Ended'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-jade">
              {formatSessionTime(sessionSeconds)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {questionsAsked.length} questions asked
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {sessionStatus === 'idle' && (
              <Button onClick={startSession} className="bg-jade hover:bg-jade/90 gap-2">
                <Play className="h-4 w-4" />
                Start Session
              </Button>
            )}
            {sessionStatus === 'running' && (
              <>
                <Button onClick={pauseSession} variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={endSession} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  End
                </Button>
              </>
            )}
            {sessionStatus === 'paused' && (
              <>
                <Button onClick={continueSession} className="bg-jade hover:bg-jade/90 gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button onClick={endSession} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  End
                </Button>
              </>
            )}
            {sessionStatus === 'ended' && (
              <Button onClick={startSession} className="bg-jade hover:bg-jade/90 gap-2">
                <Play className="h-4 w-4" />
                New Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Template */}
      {activeTemplate && (
        <Card className="border-jade/30 bg-jade/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-jade" />
              <span className="text-sm font-medium">Template: {activeTemplate}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Templates */}
      <SessionTemplates onApplyTemplate={handleApplyTemplate} />

      {/* Voice Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mic className="h-4 w-4 text-jade" />
            Voice Notes ({voiceNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <VoiceNoteRecorder 
            onNoteRecorded={handleAddVoiceNote}
            disabled={sessionStatus !== 'running'}
          />
          
          {voiceNotes.length > 0 && (
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {voiceNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.timestamp).toLocaleTimeString()} • {note.duration}s
                      </p>
                      <p className="text-sm">{note.transcription || 'No transcription'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVoiceNote(note.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Questions Summary */}
      {questionsAsked.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Questions Asked</span>
              <Badge variant="secondary">{questionsAsked.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {questionsAsked.slice(-10).map((q, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground truncate">
                    {idx + 1}. {q}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
