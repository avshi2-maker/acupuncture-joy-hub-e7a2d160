import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Printer, 
  FileText, 
  Volume2, 
  Share2, 
  Save,
  Loader2,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Message } from '@/hooks/useTcmBrainState';
import { SelectedPatient } from '@/components/crm/PatientSelectorDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuickActionsBarProps {
  messages: Message[];
  sessionSeconds: number;
  selectedPatient: SelectedPatient | null;
  questionsAsked: string[];
  voiceNotesTranscripts?: string[];
  formatSessionTime: (seconds: number) => string;
  onExportSession?: () => void;
  onPrintReport?: () => void;
}

export function QuickActionsBar({
  messages,
  sessionSeconds,
  selectedPatient,
  questionsAsked,
  voiceNotesTranscripts = [],
  formatSessionTime,
}: QuickActionsBarProps) {
  const { session } = useAuth();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSavingToPatient, setIsSavingToPatient] = useState(false);
  const [topicSummary, setTopicSummary] = useState<string | null>(null);

  // Get all transcript content
  const getFullTranscript = () => {
    const chatTranscript = messages.map(m => 
      `${m.role === 'user' ? 'Q' : 'A'}: ${m.content}`
    ).join('\n\n');
    
    const voiceNotes = voiceNotesTranscripts.length > 0 
      ? `\n\n--- Voice Notes ---\n${voiceNotesTranscripts.join('\n')}`
      : '';
    
    return chatTranscript + voiceNotes;
  };

  // Generate Topic Summary using AI
  const handleGenerateSummary = async () => {
    if (messages.length === 0) {
      toast.error('No conversation to summarize');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const transcript = getFullTranscript();
      
      const { data, error } = await supabase.functions.invoke('generate-session-summary', {
        body: { 
          transcript,
          patientName: selectedPatient?.name || 'Unknown Patient',
          sessionDuration: formatSessionTime(sessionSeconds)
        }
      });

      if (error) throw error;
      
      setTopicSummary(data.summary);
      toast.success('Summary generated');
    } catch (error) {
      console.error('Summary error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate MP3 from transcript
  const handleTranscriptToMP3 = async () => {
    const transcript = getFullTranscript();
    if (!transcript.trim()) {
      toast.error('No content to convert to audio');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const textToConvert = topicSummary || transcript.substring(0, 5000);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: textToConvert,
            voice: 'Sarah'
          }),
        }
      );

      if (!response.ok) throw new Error('TTS request failed');
      
      const data = await response.json();
      
      if (data.audioContent) {
        // Create download link
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `session-${selectedPatient?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('MP3 downloaded');
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const summary = topicSummary || `Session Notes for ${selectedPatient?.name || 'Patient'}\n\nDuration: ${formatSessionTime(sessionSeconds)}\nQuestions: ${questionsAsked.length}\n\n${messages.slice(-3).map(m => `${m.role === 'user' ? 'Q' : 'A'}: ${m.content.substring(0, 200)}...`).join('\n\n')}`;
    
    const phone = selectedPatient?.phone?.replace(/\D/g, '') || '';
    const encodedText = encodeURIComponent(summary);
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  // Save to Patient File
  const handleSaveToPatient = async () => {
    if (!selectedPatient?.id) {
      toast.error('Please select a patient first');
      return;
    }

    if (!session?.user?.id) {
      toast.error('Please log in first');
      return;
    }

    setIsSavingToPatient(true);
    try {
      const transcript = getFullTranscript();
      const summary = topicSummary || transcript.substring(0, 1000);
      
      const visitData = {
        patient_id: selectedPatient.id,
        therapist_id: session.user.id,
        visit_date: new Date().toISOString().split('T')[0],
        notes: `## Session Summary\n${summary}\n\n## Full Transcript\n${transcript}`,
        chief_complaint: questionsAsked[0] || 'TCM Brain Session'
      };

      const { error } = await supabase.from('visits').insert(visitData);
      if (error) throw error;
      
      toast.success(`Saved to ${selectedPatient.name}'s record`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save to patient file');
    } finally {
      setIsSavingToPatient(false);
    }
  };

  // Export Session as PDF/Text
  const handleExportSession = () => {
    const transcript = getFullTranscript();
    const content = `TCM Brain Session Report
========================
Patient: ${selectedPatient?.name || 'Unknown'}
Date: ${new Date().toLocaleDateString()}
Duration: ${formatSessionTime(sessionSeconds)}
Questions Asked: ${questionsAsked.length}

${topicSummary ? `## Summary\n${topicSummary}\n\n` : ''}
## Conversation
${transcript}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tcm-session-${selectedPatient?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Session exported');
  };

  // Print Report
  const handlePrintReport = () => {
    const transcript = getFullTranscript();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>TCM Session Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 10px; }
            h2 { color: #4a7c23; margin-top: 20px; }
            .meta { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .meta p { margin: 5px 0; }
            .conversation { white-space: pre-wrap; line-height: 1.6; }
            .question { color: #1a56db; font-weight: bold; }
            .answer { color: #333; margin-bottom: 15px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>TCM Brain Session Report</h1>
          <div class="meta">
            <p><strong>Patient:</strong> ${selectedPatient?.name || 'Unknown'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${formatSessionTime(sessionSeconds)}</p>
            <p><strong>Questions Asked:</strong> ${questionsAsked.length}</p>
          </div>
          ${topicSummary ? `<h2>Summary</h2><p>${topicSummary}</p>` : ''}
          <h2>Session Transcript</h2>
          <div class="conversation">${transcript.replace(/Q:/g, '<span class="question">Q:</span>').replace(/A:/g, '<span class="answer">A:</span>')}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-lg border flex-wrap">
      {/* Topic Summary */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleGenerateSummary}
        disabled={isGeneratingSummary || messages.length === 0}
        className="gap-1.5 text-xs"
        title="Generate AI Summary"
      >
        {isGeneratingSummary ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">Summary</span>
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Transcript to MP3 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTranscriptToMP3}
        disabled={isGeneratingAudio || messages.length === 0}
        className="gap-1.5 text-xs"
        title="Convert to MP3"
      >
        {isGeneratingAudio ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">MP3</span>
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Share WhatsApp */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShareWhatsApp}
        disabled={messages.length === 0}
        className="gap-1.5 text-xs text-green-600 hover:text-green-700"
        title="Share via WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Save to Patient */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSaveToPatient}
        disabled={isSavingToPatient || !selectedPatient?.id || messages.length === 0}
        className="gap-1.5 text-xs text-jade hover:text-jade/80"
        title="Save to Patient File"
      >
        {isSavingToPatient ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">Save</span>
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Export */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExportSession}
        disabled={messages.length === 0}
        className="gap-1.5 text-xs"
        title="Export Session"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </Button>

      {/* Print */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrintReport}
        disabled={messages.length === 0}
        className="gap-1.5 text-xs"
        title="Print Report"
      >
        <Printer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Print</span>
      </Button>

      {/* Summary Preview */}
      {topicSummary && (
        <div className="w-full mt-2 p-2 bg-jade/10 rounded border border-jade/20">
          <div className="flex items-center gap-2 text-xs font-medium text-jade mb-1">
            <FileText className="h-3 w-3" />
            Topic Summary
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3">{topicSummary}</p>
        </div>
      )}
    </div>
  );
}
