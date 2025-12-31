import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Loader2, Sparkles, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TcmBrainPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  sessionNotes?: string;
}

export function TcmBrainPanel({ 
  open, 
  onOpenChange, 
  patientId, 
  patientName,
  sessionNotes 
}: TcmBrainPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Include patient context if available
      let contextPrefix = '';
      if (patientName) {
        contextPrefix = `Patient: ${patientName}. `;
      }
      if (sessionNotes) {
        contextPrefix += `Session notes: ${sessionNotes.slice(0, 500)}... `;
      }

      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { 
          message: contextPrefix + userMessage,
          patientId,
          includePatientHistory: !!patientId
        }
      });

      if (error) throw error;

      const assistantMessage = data?.response || data?.message || 'No response received';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error: any) {
      console.error('TCM Brain error:', error);
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, patientId, patientName, sessionNotes]);

  const quickPrompts = [
    { label: 'דפוס TCM', prompt: 'What TCM pattern fits these symptoms?' },
    { label: 'נקודות דיקור', prompt: 'Recommend acupuncture points for this presentation' },
    { label: 'צמחים', prompt: 'What herbal formula would you suggest?' },
    { label: 'אבחנה מבדלת', prompt: 'Provide differential diagnosis options' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-jade/10 to-gold/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-jade">
              <Brain className="h-5 w-5" />
              TCM Brain
              {patientName && (
                <Badge variant="outline" className="ml-2 text-xs">
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
                  sendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-auto bg-jade hover:bg-jade/90"
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
