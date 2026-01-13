import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Loader2, Sparkles, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HebrewQADropdowns } from '@/components/tcm-brain/HebrewQADropdowns';
import { DebugMetricsPanel } from '@/components/tcm-brain/DebugMetricsPanel';
import { useRagChat } from '@/hooks/useRagChat';

interface TcmBrainPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  sessionNotes?: string;
  mode?: 'standard' | 'video';
}

/**
 * TcmBrainPanel - Unified TCM Brain Chat Panel
 * 
 * CRITICAL: This component uses the shared useRagChat hook to ensure
 * algorithm parity with TcmBrain.tsx (Token Budget + Ferrari Score + Question Boost)
 * 
 * Both Video Session and Standard Session MUST use the same logic engine.
 */
export function TcmBrainPanel({ 
  open, 
  onOpenChange, 
  patientId, 
  patientName,
  sessionNotes,
  mode = 'standard'
}: TcmBrainPanelProps) {
  const [input, setInput] = useState('');
  const [showBodyMap, setShowBodyMap] = useState(true);

  // UNIFIED HOOK: Same algorithm as TcmBrain.tsx
  const { 
    messages, 
    isLoading, 
    debugData, 
    searchMethod, 
    sendMessage 
  } = useRagChat({
    patientId,
    patientName,
    sessionNotes,
    includePatientHistory: !!patientId
  });

  // Extract highlighted points from the last assistant message
  const { highlightedPoints, lastAIResponse } = useMemo(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      const points = parsePointReferences(lastAssistantMsg.content);
      return { highlightedPoints: points, lastAIResponse: lastAssistantMsg.content };
    }
    return { highlightedPoints: [], lastAIResponse: '' };
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const quickPrompts = [
    { label: 'דפוס TCM', prompt: 'What TCM pattern fits these symptoms?' },
    { label: 'נקודות דיקור', prompt: 'Recommend acupuncture points for this presentation' },
    { label: 'צמחים', prompt: 'What herbal formula would you suggest?' },
    { label: 'אבחנה מבדלת', prompt: 'Provide differential diagnosis options' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-jade/10 to-gold/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-jade">
              <Brain className="h-5 w-5" />
              TCM Brain
              {/* Session Mode Badge */}
              {mode === 'video' ? (
                <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0.5">
                  🎥 Video Session
                </Badge>
              ) : (
                <Badge className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600">
                  🏥 Clinic Session
                </Badge>
              )}
              {patientName && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {patientName}
                </Badge>
              )}
            </SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            שאל שאלות על TCM בלי לצאת מהפגישה
          </p>
        </SheetHeader>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-b flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setInput(qp.prompt);
              }}
              disabled={isLoading}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {qp.label}
            </Button>
          ))}
        </div>

        {/* Hebrew Q&A Dropdowns */}
        <div className="px-4 py-2 border-b">
          <HebrewQADropdowns
            onSelectQuestion={(question) => {
              setInput(question);
              // Auto-submit after setting input
              setTimeout(() => {
                const submitBtn = document.querySelector('[data-tcm-submit]') as HTMLButtonElement;
                if (submitBtn && !submitBtn.disabled) {
                  submitBtn.click();
                }
              }, 50);
            }}
            disabled={isLoading}
          />
        </div>

        {/* Body Map Section - Auto-updates when AI mentions points */}
        {highlightedPoints.length > 0 && (
          <Collapsible open={showBodyMap} onOpenChange={setShowBodyMap} className="border-b">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between px-4 py-2 h-auto">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-jade" />
                  <span className="text-sm font-medium">Body Map</span>
                  <Badge variant="secondary" className="text-xs bg-jade/20 text-jade">
                    {highlightedPoints.length} points
                  </Badge>
                </div>
                {showBodyMap ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-3">
                <RAGBodyFigureDisplay
                  pointCodes={highlightedPoints}
                  aiResponseText={lastAIResponse}
                  allowSelection={false}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
              <Brain className="h-12 w-12 mb-4 text-jade/50" />
              <p className="text-sm font-medium">TCM Brain Ready</p>
              <p className="text-xs mt-1">
                Ask questions about TCM patterns, points, herbs, or diagnosis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-jade text-white'
                        : 'bg-muted'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Debug Metrics Panel - Shows Token Budget + Ferrari Scores */}
        <DebugMetricsPanel 
          debugData={debugData} 
          searchMethod={searchMethod}
          query={messages.filter(m => m.role === 'user').slice(-1)[0]?.content}
          response={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
        />

        {/* Input */}
        <div className="p-4 border-t bg-background/80">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="שאל על TCM... Ask about TCM..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="h-auto bg-jade hover:bg-jade/90"
              data-tcm-submit
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
