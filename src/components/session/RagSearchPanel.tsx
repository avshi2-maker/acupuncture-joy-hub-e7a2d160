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
  MicOff,
  Volume2,
  VolumeX,
  Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHaptic } from '@/hooks/useHaptic';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useSpeechSynthesis, extractSpeakableContent } from '@/hooks/useSpeechSynthesis';
import { QuickPromptDropdown } from '@/components/tcm-brain/QuickPromptDropdown';
import { Switch } from '@/components/ui/switch';

interface SearchMessage {
  id: string;
  type: 'query' | 'response';
  content: string;
  timestamp: Date;
  sources?: Array<{ name: string; confidence: string; score?: number }>;
  isStreaming?: boolean;
  searchMethod?: string;
  confidenceScore?: number;
}

interface RagSearchPanelProps {
  patientId?: string;
  onInsertToNotes?: (text: string) => void;
}

// Pull-to-refresh threshold in pixels
const PULL_THRESHOLD = 80;
// Auto-submit countdown in seconds
const AUTO_SUBMIT_DELAY = 3;

// Confidence Gauge Component
function ConfidenceGauge({ score, size = 40 }: { score: number | null; size?: number }) {
  const percentage = score !== null ? Math.round(score * 100) : 0;
  const circumference = 2 * Math.PI * 15;
  const strokeDashoffset = score !== null ? circumference * (1 - score) : circumference;
  
  const getColor = () => {
    if (score === null) return 'text-muted-foreground';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-400';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-200"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[10px] font-bold", getColor())}>
          {score !== null ? `${percentage}%` : '—'}
        </span>
      </div>
    </div>
  );
}

export function RagSearchPanel({ patientId, onInsertToNotes }: RagSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastConfidence, setLastConfidence] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pullStartY = useRef<number | null>(null);
  const pullDistance = useMotionValue(0);
  const pullOpacity = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 1]);
  const pullRotation = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 180]);
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { lightTap, successTap } = useHaptic();

  // Text-to-speech hook
  const { 
    isSupported: isTTSSupported, 
    isSpeaking, 
    speak, 
    cancel: cancelSpeech 
  } = useSpeechSynthesis({
    rate: 1,
    onEnd: () => {},
    onError: (error) => {
      console.warn('TTS error:', error);
    },
  });

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
        startAutoSubmitCountdown();
      }
    },
    onError: (error) => {
      toast.error(error);
    },
    onEnd: () => {
      if (transcript) {
        setQuery(transcript);
        startAutoSubmitCountdown();
      }
    },
  });

  // Auto-submit countdown logic
  const startAutoSubmitCountdown = useCallback(() => {
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setAutoSubmitCountdown(AUTO_SUBMIT_DELAY);

    countdownIntervalRef.current = setInterval(() => {
      setAutoSubmitCountdown(prev => {
        if (prev === null || prev <= 1) return prev;
        return prev - 1;
      });
    }, 1000);

    autoSubmitTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setAutoSubmitCountdown(null);
      handleSearchFromVoice();
    }, AUTO_SUBMIT_DELAY * 1000);
  }, []);

  // Cancel auto-submit
  const cancelAutoSubmit = useCallback(() => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoSubmitCountdown(null);
    lightTap();
    toast.info('Auto-send cancelled. Edit your message.');
  }, [lightTap]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

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
        language: 'en',
        deepSearch: deepSearchEnabled
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
    let confidenceScore = 0;

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
          
          if (parsed.sources) {
            sources = parsed.sources;
            searchMethod = parsed.searchMethod || 'keyword';
            confidenceScore = parsed.confidence || 0;
            setLastConfidence(confidenceScore);
            continue;
          }

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
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    setMessages(prev => prev.map(m => 
      m.id === responseId 
        ? { ...m, isStreaming: false, sources, searchMethod, confidenceScore }
        : m
    ));

    return { content: fullContent, sources, searchMethod, confidenceScore };
  }, [patientId, deepSearchEnabled]);

  const handleSearch = async (fromVoice = false) => {
    if (!query.trim() || isSearching) return;

    if (isSpeaking) {
      cancelSpeech();
    }

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
      const result = await streamResponse(searchQuery);
      
      if (voiceModeEnabled && fromVoice && result.content) {
        const speakableContent = extractSpeakableContent(result.content);
        if (speakableContent) {
          setTimeout(() => speak(speakableContent), 500);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      
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

  const handleSearchFromVoice = () => {
    handleSearch(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch(false);
    }
  };

  const handleInsertToNotes = (content: string) => {
    if (onInsertToNotes) {
      onInsertToNotes(content);
      toast.success('Inserted into Plan section');
    } else {
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
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages([]);
      setLastConfidence(null);
      successTap();
      toast.success('🧠 Brain Cleared - Fresh Start!');
      
      setIsRefreshing(false);
    }
    
    pullDistance.set(0);
    pullStartY.current = null;
    setIsPulling(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCF8] relative rounded-xl shadow-sm border border-slate-200/60">
      {/* Unified Control Bar - Clinic Theme */}
      <div className="px-4 py-3 border-b border-slate-200/60 bg-white/90 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-3">
          {/* LEFT: Saved Questions Dropdown */}
          <div className="flex-1 min-w-0">
            <QuickPromptDropdown
              onSelectQuestion={(question) => setQuery(question)}
              disabled={isSearching}
              placeholder="📚 שאלות שמורות"
              className="w-full max-w-[180px] text-sm"
            />
          </div>

          {/* CENTER: Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSearching 
                ? "bg-amber-500 animate-pulse" 
                : "bg-green-500"
            )} />
            <span className="text-xs font-medium text-slate-600">
              {isSearching ? 'Scanning...' : 'Ready'}
            </span>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-2">
            {/* Deep Search Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={deepSearchEnabled}
                      onCheckedChange={setDeepSearchEnabled}
                      className="data-[state=checked]:bg-violet-500 h-4 w-7"
                    />
                    <span className="text-[10px] font-medium text-slate-500">
                      {deepSearchEnabled ? 'Deep' : 'Fast'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {deepSearchEnabled ? 'Deep Search: More thorough, slower' : 'Fast Search: Quick results'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Debug Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7",
                      showDebug && "bg-amber-100 text-amber-700"
                    )}
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    <Bug className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Debug Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Confidence Gauge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <ConfidenceGauge score={lastConfidence} size={32} />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {lastConfidence !== null 
                    ? `Last search confidence: ${Math.round(lastConfidence * 100)}%` 
                    : 'No search yet'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Voice Mode Toggle */}
            {isTTSSupported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7",
                        voiceModeEnabled && "bg-violet-100 text-violet-700"
                      )}
                      onClick={() => {
                        setVoiceModeEnabled(!voiceModeEnabled);
                        lightTap();
                        if (!voiceModeEnabled) {
                          toast.success('🔊 Voice Mode ON');
                        } else {
                          cancelSpeech();
                          toast.info('🔇 Voice Mode OFF');
                        }
                      }}
                    >
                      {voiceModeEnabled ? (
                        <Volume2 className="h-3.5 w-3.5" />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {voiceModeEnabled ? 'Voice: ON' : 'Voice: OFF'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Clear Button */}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessages([]);
                  setLastConfidence(null);
                  cancelSpeech();
                  lightTap();
                  toast.success('🧠 Cleared');
                }}
                className="text-xs h-7 px-2 text-slate-500 hover:text-slate-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Speaking indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 flex items-center gap-2 text-xs text-violet-600"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Volume2 className="h-3 w-3" />
              </motion.div>
              <span>Speaking...</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs"
                onClick={() => {
                  cancelSpeech();
                  lightTap();
                }}
              >
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
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
        <span className="ml-2 text-xs text-slate-500">
          {isRefreshing ? 'Refreshing...' : 'Pull to clear chat'}
        </span>
      </motion.div>

      {/* Chat Area - Clinic Theme */}
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
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 mb-6">
                <Sparkles className="h-10 w-10 text-violet-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Ask the TCM Brain</h4>
              <p className="text-sm text-slate-500 max-w-[280px] mb-6">
                Search through clinical knowledge, acupoints, herbal formulas, and diagnostic patterns
              </p>

              {/* Suggested Queries */}
              <div className="space-y-2 w-full max-w-[320px]">
                <p className="text-xs font-medium text-slate-400 mb-2">
                  <Lightbulb className="h-3 w-3 inline mr-1" />
                  Try asking:
                </p>
                {suggestedQueries.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(suggestion)}
                    className="w-full text-left text-sm px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-slate-600 hover:text-slate-800"
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
                        : 'bg-white border border-slate-200/60 shadow-sm rounded-bl-sm'
                    )}
                  >
                    {message.type === 'response' && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-violet-500" />
                          <span className="text-xs font-medium text-violet-600">
                            TCM Brain
                          </span>
                          {message.searchMethod && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded",
                                    message.searchMethod === 'hybrid' 
                                      ? "bg-green-100 text-green-600" 
                                      : "bg-blue-100 text-blue-600"
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
                        
                        {!message.isStreaming && message.content && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-jade-600 hover:text-jade-700 hover:bg-jade-50"
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
                    <p className={cn(
                      "text-sm whitespace-pre-wrap leading-relaxed",
                      message.type === 'response' && "text-slate-700"
                    )}>
                      {message.content || (message.isStreaming ? '...' : '')}
                    </p>
                    {message.sources && message.sources.length > 0 && !message.isStreaming && (
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
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
                                        ? "bg-green-100 text-green-700"
                                        : source.confidence === 'medium'
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-slate-100 text-slate-600"
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

      {/* Input Area - Clinic Theme */}
      <div className="p-4 border-t border-slate-200/60 bg-white/90 backdrop-blur-sm space-y-2 rounded-b-xl">
        <div className="flex items-center gap-2">
          {/* Microphone Button */}
          {isVoiceSupported && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={handleVoiceToggle}
                    disabled={isSearching}
                    className={cn(
                      "relative h-11 w-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors",
                      isListening
                        ? "bg-red-500 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  {isListening ? 'Stop listening' : 'Voice input'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask the TCM Brain..."}
              className={cn(
                "pl-10 pr-4 h-11 bg-white border-slate-200 focus:border-violet-400 text-slate-800 placeholder:text-slate-400",
                isListening && "border-red-400 focus:border-red-400"
              )}
              disabled={isSearching}
            />
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
            onClick={() => handleSearch(false)}
            disabled={!query.trim() || isSearching}
            className="h-11 w-11 min-w-[44px] min-h-[44px] p-0 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center">
          {isListening 
            ? "🎤 Speak now... Tap mic to stop" 
            : "Press Enter to search • Tap 🎤 for voice"}
        </p>
      </div>

      {/* Auto-Submit Countdown Overlay */}
      <AnimatePresence>
        {autoSubmitCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl"
            onClick={cancelAutoSubmit}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="text-center p-8"
            >
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-violet-500"
                    strokeLinecap="round"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: 0 }}
                    transition={{ duration: AUTO_SUBMIT_DELAY, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-violet-500">
                    {autoSubmitCountdown}
                  </span>
                </div>
              </div>
              
              <p className="text-lg font-semibold text-slate-800 mb-2">Sending in {autoSubmitCountdown}...</p>
              <p className="text-sm text-slate-500 mb-4">Tap anywhere to cancel</p>
              
              <Button
                variant="outline"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelAutoSubmit();
                }}
                className="gap-2"
              >
                ✋ Cancel & Edit
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
