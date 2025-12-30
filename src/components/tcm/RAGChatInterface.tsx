import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Loader2, BookOpen, FileText, AlertCircle, Printer, Shield, CheckCircle2, Database, Search } from 'lucide-react';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { usePrintContent } from '@/hooks/usePrintContent';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Source {
  fileName: string;
  chunkIndex: number;
  preview: string;
  category?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  metadata?: {
    chunksFound: number;
    documentsSearched: number;
    searchTermsUsed: string;
    auditLogged: boolean;
  };
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
        metadata: {
          chunksFound: data.chunksFound,
          documentsSearched: data.documentsSearched,
          searchTermsUsed: data.searchTermsUsed,
          auditLogged: data.auditLogged,
        }
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Audit Logged
            </Badge>
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
        </div>
        <p className="text-sm text-muted-foreground">
          Answers powered exclusively by proprietary clinical materials • All queries logged for legal compliance
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea ref={scrollRef} className="h-[400px] px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-4 opacity-50" />
              <p>Ask any question about CM diagnosis, acupuncture points, or herbal formulas.</p>
              <p className="text-xs mt-2">All answers are sourced from Dr. Sapir's materials with citations.</p>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs max-w-md">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">RAG System Active</span>
                </div>
                <p>Every query searches ONLY our proprietary knowledge base. External AI knowledge is blocked. All searches are logged for legal compliance.</p>
              </div>
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
                  
                  {/* Source Verification Panel */}
                  {message.metadata && (
                    <Collapsible className="mt-2 w-full max-w-[85%]">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1">
                          <Database className="w-3 h-3" />
                          View Source Verification
                          {message.metadata.auditLogged && (
                            <CheckCircle2 className="w-3 h-3 text-green-500 ml-1" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2 border border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Search Terms:</span>
                            <code className="bg-background px-2 py-0.5 rounded">{message.metadata.searchTermsUsed}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Chunks Found:</span>
                            <Badge variant="secondary">{message.metadata.chunksFound}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Documents Searched:</span>
                            <Badge variant="secondary">{message.metadata.documentsSearched}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Audit Logged:</span>
                            {message.metadata.auditLogged ? (
                              <Badge variant="outline" className="text-green-600 border-green-500/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="destructive">No</Badge>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  {/* Source Citations */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.sources.slice(0, 5).map((source, i) => (
                        <Badge key={i} variant="outline" className="text-xs" title={source.preview}>
                          <FileText className="w-3 h-3 mr-1" />
                          {source.fileName.length > 25 
                            ? source.fileName.substring(0, 25) + '...' 
                            : source.fileName}
                          #{source.chunkIndex}
                          {source.category && (
                            <span className="ml-1 opacity-60">({source.category})</span>
                          )}
                        </Badge>
                      ))}
                      {message.sources.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{message.sources.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Searching proprietary knowledge base...</span>
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Responses include source citations for verification
            </p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              All queries logged
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
