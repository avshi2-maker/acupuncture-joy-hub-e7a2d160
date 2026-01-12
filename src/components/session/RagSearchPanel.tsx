import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Send, 
  Brain, 
  Loader2, 
  Sparkles,
  BookOpen,
  Lightbulb,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface SearchMessage {
  id: string;
  type: 'query' | 'response';
  content: string;
  timestamp: Date;
  sources?: Array<{ name: string; confidence: string }>;
  isStreaming?: boolean;
}

interface RagSearchPanelProps {
  patientId?: string;
}

export function RagSearchPanel({ patientId }: RagSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamResponse = useCallback(async (userQuery: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-tcm-brain`;
    
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        query: userQuery,
        patientId,
        language: 'en'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullContent = '';
    let sources: Array<{ name: string; confidence: string }> = [];

    // Create initial streaming message
    const responseId = `r-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: responseId,
      type: 'response',
      content: '',
      timestamp: new Date(),
      sources: [],
      isStreaming: true,
    }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      // Process line-by-line
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          
          // Check if this is our custom sources event
          if (parsed.sources) {
            sources = parsed.sources;
            continue;
          }

          // Standard OpenAI-style delta
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
            setMessages(prev => prev.map(m => 
              m.id === responseId 
                ? { ...m, content: fullContent }
                : m
            ));
          }
        } catch {
          // Incomplete JSON, put back and wait
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Finalize message
    setMessages(prev => prev.map(m => 
      m.id === responseId 
        ? { ...m, isStreaming: false, sources }
        : m
    ));

    return { content: fullContent, sources };
  }, [patientId]);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;

    const userMessage: SearchMessage = {
      id: `q-${Date.now()}`,
      type: 'query',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const searchQuery = query;
    setQuery('');
    setIsSearching(true);

    try {
      await streamResponse(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        type: 'response',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        sources: [],
      }]);

      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please wait a moment.');
        } else if (error.message.includes('credits')) {
          toast.error('AI credits exhausted. Please add funds.');
        } else {
          toast.error('Failed to get response. Please try again.');
        }
      }
    } finally {
      setIsSearching(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const suggestedQueries = [
    'Points for headache with Liver Yang Rising',
    'Herbal formula for Blood stasis',
    'Tongue diagnosis for Spleen Qi deficiency',
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">TCM Brain</h3>
            <p className="text-xs text-muted-foreground">AI-powered clinical knowledge search</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-12"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950 dark:to-purple-950 mb-6">
                <Sparkles className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Ask the TCM Brain</h4>
              <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
                Search through clinical knowledge, acupoints, herbal formulas, and diagnostic patterns
              </p>

              {/* Suggested Queries */}
              <div className="space-y-2 w-full max-w-[320px]">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  <Lightbulb className="h-3 w-3 inline mr-1" />
                  Try asking:
                </p>
                {suggestedQueries.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(suggestion)}
                    className="w-full text-left text-sm px-4 py-2.5 rounded-lg bg-card border border-border/50 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all text-muted-foreground hover:text-foreground"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex",
                    message.type === 'query' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.type === 'query'
                        ? 'bg-jade-600 text-white rounded-br-sm'
                        : 'bg-card border border-border/50 rounded-bl-sm'
                    )}
                  >
                    {message.type === 'response' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                        <Brain className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                          TCM Brain
                        </span>
                        {message.isStreaming && (
                          <Loader2 className="h-3 w-3 animate-spin text-violet-500" />
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content || (message.isStreaming ? '...' : '')}
                    </p>
                    {message.sources && message.sources.length > 0 && !message.isStreaming && (
                      <div className="mt-3 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <BookOpen className="h-3 w-3" /> Sources:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                source.confidence === 'high' 
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {source.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 opacity-60">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the TCM Brain..."
              className="pl-10 pr-4 h-11 bg-background border-muted-foreground/20 focus:border-violet-500"
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="h-11 w-11 p-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to search • Powered by Gemini RAG
        </p>
      </div>
    </div>
  );
}
