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
  ClipboardPlus,
  Database,
  RefreshCw,
  Mic,
  MicOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHaptic } from '@/hooks/useHaptic';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface SearchMessage {
  id: string;
  type: 'query' | 'response';
  content: string;
  timestamp: Date;
  sources?: Array<{ name: string; confidence: string; score?: number }>;
  isStreaming?: boolean;
  searchMethod?: string;
}

interface RagSearchPanelProps {
  patientId?: string;
  onInsertToNotes?: (text: string) => void;
}

// Pull-to-refresh threshold in pixels
const PULL_THRESHOLD = 80;

export function RagSearchPanel({ patientId, onInsertToNotes }: RagSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pullStartY = useRef<number | null>(null);
  const pullDistance = useMotionValue(0);
  const pullOpacity = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 1]);
  const pullRotation = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 180]);
  const { lightTap, successTap } = useHaptic();

  // Voice input hook
  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceInput({
    language: 'en-US',
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal && text) {
        setQuery(text);
        successTap();
        toast.success('Voice captured! Review and send.');
      }
    },
    onError: (error) => {
      toast.error(error);
    },
    onEnd: () => {
      // Speech recognition ended naturally (silence detected)
      if (transcript) {
        setQuery(transcript);
      }
    },
  });

  // Update query with interim transcript while listening
  useEffect(() => {
    if (isListening && interimTranscript) {
      setQuery(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  // Handle voice error toast
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  // Toggle voice input
  const handleVoiceToggle = () => {
    lightTap();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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
    let sources: Array<{ name: string; confidence: string; score?: number }> = [];
    let searchMethod = 'unknown';

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
          
          // Check if this is our custom metadata event
          if (parsed.sources) {
            sources = parsed.sources;
            searchMethod = parsed.searchMethod || 'keyword';
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
        ? { ...m, isStreaming: false, sources, searchMethod }
        : m
    ));

    return { content: fullContent, sources, searchMethod };
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

  const handleInsertToNotes = (content: string) => {
    if (onInsertToNotes) {
      onInsertToNotes(content);
      toast.success('Inserted into Plan section');
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    }
  };

  const suggestedQueries = [
    'Points for headache with Liver Yang Rising',
    'Herbal formula for Blood stasis',
    'Tongue diagnosis for Spleen Qi deficiency',
  ];

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || pullStartY.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - pullStartY.current);
    pullDistance.set(Math.min(distance, PULL_THRESHOLD * 1.5));
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    const distance = pullDistance.get();
    
    if (distance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      lightTap();
      
      // Clear conversation
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages([]);
      successTap();
      toast.success('🧠 Brain Cleared - Fresh Start!');
      
      setIsRefreshing(false);
    }
    
    pullDistance.set(0);
    pullStartY.current = null;
    setIsPulling(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">TCM Brain</h3>
            <p className="text-xs text-muted-foreground">AI-powered clinical knowledge search</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([]);
                lightTap();
                toast.success('🧠 Brain Cleared');
              }}
              className="text-xs gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      <motion.div 
        className="flex items-center justify-center py-2 overflow-hidden md:hidden"
        style={{ 
          height: pullDistance,
          opacity: pullOpacity,
        }}
      >
        <motion.div style={{ rotate: pullRotation }}>
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5 text-violet-500" />
          )}
        </motion.div>
        <span className="ml-2 text-xs text-muted-foreground">
          {isRefreshing ? 'Refreshing...' : 'Pull to clear chat'}
        </span>
      </motion.div>

      {/* Chat Area */}
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-violet-500" />
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                            TCM Brain
                          </span>
                          {message.searchMethod && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded",
                                    message.searchMethod === 'hybrid' 
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-600" 
                                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                  )}>
                                    <Database className="h-3 w-3 inline mr-0.5" />
                                    {message.searchMethod}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {message.searchMethod === 'hybrid' 
                                    ? 'Vector + Keyword semantic search' 
                                    : 'Keyword-based search'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {message.isStreaming && (
                            <Loader2 className="h-3 w-3 animate-spin text-violet-500" />
                          )}
                        </div>
                        
                        {/* Insert to Notes Button */}
                        {!message.isStreaming && message.content && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-jade-600 hover:text-jade-700 hover:bg-jade-100 dark:hover:bg-jade-900/30"
                                  onClick={() => handleInsertToNotes(message.content)}
                                >
                                  <ClipboardPlus className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Insert into Session Notes
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                            <TooltipProvider key={idx}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded-full cursor-help",
                                      source.confidence === 'high' || source.confidence === 'very_high'
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                        : source.confidence === 'medium'
                                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {source.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Confidence: {source.confidence}
                                  {source.score && ` (${(source.score * 100).toFixed(0)}%)`}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
          {/* Microphone Button - Large for mobile (44px+) */}
          {isVoiceSupported && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={handleVoiceToggle}
                    disabled={isSearching}
                    className={cn(
                      "relative h-11 w-11 md:h-11 md:w-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors",
                      isListening
                        ? "bg-red-500 text-white"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Pulsing ring animation when listening */}
                    {isListening && (
                      <>
                        <motion.span
                          className="absolute inset-0 rounded-full bg-red-500"
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.7, 0, 0.7],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.span
                          className="absolute inset-0 rounded-full bg-red-400"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2,
                          }}
                        />
                      </>
                    )}
                    {isListening ? (
                      <MicOff className="h-5 w-5 relative z-10" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? 'Stop listening' : 'Voice input (Push to Talk)'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask the TCM Brain..."}
              className={cn(
                "pl-10 pr-4 h-11 bg-background border-muted-foreground/20 focus:border-violet-500",
                isListening && "border-red-500 focus:border-red-500"
              )}
              disabled={isSearching}
            />
            {/* Listening indicator */}
            {isListening && (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-xs text-red-500 font-medium">●</span>
              </motion.div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="h-11 w-11 min-w-[44px] min-h-[44px] p-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {isListening 
            ? "🎤 Speak now... Tap mic to stop" 
            : "Press Enter to search • Tap 🎤 for voice"}
        </p>
      </div>
    </div>
  );
}
