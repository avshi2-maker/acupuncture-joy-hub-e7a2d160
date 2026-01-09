import { useState, useEffect, RefObject } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Sparkles, ChevronRight, Stethoscope, Eye, Activity, Trash2 } from 'lucide-react';
import { BrowserVoiceInput } from '@/components/ui/BrowserVoiceInput';
import { AIResponseDisplay } from '@/components/tcm/AIResponseDisplay';
import { QuickActionsBar, QuickActionsRef } from './QuickActionsBar';
import { EngineActivityIndicator } from './APIUsageMeter';
import { Message } from '@/hooks/useTcmBrainState';
import { SelectedPatient } from '@/components/crm/PatientSelectorDropdown';

interface DiagnosticsTabProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClear: () => void;
  selectedPatient?: SelectedPatient | null;
  sessionSeconds?: number;
  questionsAsked?: string[];
  formatSessionTime?: (seconds: number) => string;
  quickActionsRef?: RefObject<QuickActionsRef>;
  externalInput?: string;
  onExternalInputHandled?: () => void;
  onViewBodyMap?: (points: string[]) => void;
}

export function DiagnosticsTab({
  messages,
  isLoading,
  onSendMessage,
  onClear,
  selectedPatient,
  sessionSeconds = 0,
  questionsAsked = [],
  formatSessionTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`,
  quickActionsRef,
  externalInput,
  onExternalInputHandled,
  onViewBodyMap,
}: DiagnosticsTabProps) {
  const [input, setInput] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'he-IL'>('en-US');

  // Handle external input (from Q&A suggestions)
  // Always fill the input immediately. Sending the message is handled by the parent,
  // so we never "double send".
  useEffect(() => {
    if (!externalInput) return;

    setInput(externalInput);
    onExternalInputHandled?.();
  }, [externalInput, onExternalInputHandled]);


  // Trigger engine activity when sending message
  const handleRunWorkflow = () => {
    if (input.trim() && !isLoading) {
      // Dispatch custom event to trigger engine indicator
      window.dispatchEvent(new CustomEvent('tcm-query-start', { 
        detail: { query: input.trim() } 
      }));
      onSendMessage(input.trim());
      setInput('');
    }
  };


  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {/* Quick Actions Bar */}
      <QuickActionsBar
        ref={quickActionsRef}
        messages={messages}
        sessionSeconds={sessionSeconds}
        selectedPatient={selectedPatient || null}
        questionsAsked={questionsAsked}
        formatSessionTime={formatSessionTime}
      />

      {/* Auto-Chain Workflow Card */}
      <Card className="bg-gradient-to-r from-jade/20 via-jade/10 to-primary/10 border-2 border-jade/40 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-jade/20">
                <Sparkles className="h-5 w-5 text-jade" />
              </div>
              <div>
                <span className="text-base font-bold">🔄 Auto-Chain Diagnostic Workflow</span>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Symptoms → Diagnosis → Treatment (3 AI calls in sequence)
                </p>
              </div>
            </div>
            {/* Engine Activity Indicator - Real-time countdown */}
            <EngineActivityIndicator />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Describe patient symptoms (e.g., headache, fatigue, poor appetite, cold hands...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim() && !isLoading) {
                  e.preventDefault();
                  handleRunWorkflow();
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={voiceLanguage === 'en-US' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVoiceLanguage('en-US')}
                className="h-10 px-2 text-xs"
                disabled={isLoading}
              >
                EN
              </Button>
              <Button
                type="button"
                variant={voiceLanguage === 'he-IL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVoiceLanguage('he-IL')}
                className="h-10 px-2 text-xs"
                disabled={isLoading}
              >
                עב
              </Button>
              <BrowserVoiceInput
                onTranscription={(text) => {
                  setInput(input ? `${input} ${text}` : text);
                }}
                disabled={isLoading}
                language={voiceLanguage}
                size="md"
                variant="outline"
              />
            </div>
            <Button
              onClick={handleRunWorkflow}
              disabled={!input.trim() || isLoading}
              className="bg-jade hover:bg-jade-600 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Run Workflow
                </>
              )}
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="text-muted-foreground hover:text-destructive"
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="text-[10px] text-muted-foreground text-center">
            💡 Enter symptoms once → AI generates diagnosis AND treatment automatically
          </p>
        </CardContent>
      </Card>

      {/* Diagnostic Tools Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card 
          className="bg-gradient-to-br from-card to-jade/5 border border-jade/20 hover:border-jade/40 transition-all cursor-pointer group"
          onClick={() => onSendMessage('Analyze pulse diagnosis for this patient')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-jade/10 group-hover:bg-jade/20 transition-colors">
                <Stethoscope className="h-5 w-5 text-jade" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Pulse Diagnosis</h3>
                <p className="text-xs text-muted-foreground">P1-P2 Priority</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              28 pulse qualities, depth, rate, rhythm analysis
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-card to-rose/5 border border-rose/20 hover:border-rose/40 transition-all cursor-pointer group"
          onClick={() => onSendMessage('Analyze tongue diagnosis for this patient')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-rose/10 group-hover:bg-rose/20 transition-colors">
                <Eye className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Tongue Diagnosis</h3>
                <p className="text-xs text-muted-foreground">P1-P2 Priority</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Color, coating, shape, moisture analysis
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-card to-amber/5 border border-amber/20 hover:border-amber/40 transition-all cursor-pointer group"
          onClick={() => onSendMessage('Identify TCM pattern differentiation')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber/10 group-hover:bg-amber/20 transition-colors">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Pattern ID</h3>
                <p className="text-xs text-muted-foreground">P1 Priority</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Zang-Fu patterns, Eight Principles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Response Display */}
      {(isLoading || messages.length > 0) && (
        <AIResponseDisplay
          isLoading={isLoading}
          content={lastAssistantMessage?.content || ''}
          query={lastUserMessage?.content || ''}
          onViewBodyMap={onViewBodyMap || (() => {})}
        />
      )}
    </div>
  );
}
