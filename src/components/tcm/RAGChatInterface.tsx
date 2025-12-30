import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Loader2, BookOpen, FileText, AlertCircle, Printer } from 'lucide-react';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { usePrintContent } from '@/hooks/usePrintContent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    fileName: string;
    chunkIndex: number;
    preview: string;
  }>;
}

interface RAGChatInterfaceProps {
  className?: string;
}

export function RAGChatInterface({ className }: RAGChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { printContent } = usePrintContent();

  const handleVoiceTranscription = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
  };

  const handlePrint = () => {
    printContent(contentRef.current, { title: 'TCM Knowledge Base Chat' });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: {
          query: input,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.chunksFound === 0) {
        toast.info('No matching entries found in knowledge base');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={className} ref={contentRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" />
            Dr. Sapir's CM Knowledge Base
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="no-print"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Answers powered exclusively by proprietary clinical materials
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea ref={scrollRef} className="h-[400px] px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-4 opacity-50" />
              <p>Ask any question about CM diagnosis, acupuncture points, or herbal formulas.</p>
              <p className="text-xs mt-2">All answers are sourced from Dr. Sapir's materials with citations.</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  
                  {/* Source Citations */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.sources.slice(0, 3).map((source, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {source.fileName.length > 20 
                            ? source.fileName.substring(0, 20) + '...' 
                            : source.fileName}
                          #{source.chunkIndex}
                        </Badge>
                      ))}
                      {message.sources.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{message.sources.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Searching knowledge base...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t no-print">
          <div className="flex gap-2">
            <VoiceInputButton
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
              size="sm"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about CM patterns, acupoints, formulas..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Responses include source citations for verification
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
