import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  ClipboardPlus,
  RefreshCw,
  Bug,
  Zap,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHaptic } from '@/hooks/useHaptic';
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
  tokenCount?: number;
  searchTimeMs?: number;
}

interface RagSearchPanelProps {
  patientId?: string;
  onInsertToNotes?: (text: string) => void;
}

// Confidence Gauge - Radial Ring
function ConfidenceGauge({ score, size = 44 }: { score: number | null; size?: number }) {
  const percentage = score !== null ? Math.round(score * 100) : 0;
  const circumference = 2 * Math.PI * 15;
  const strokeDashoffset = score !== null ? circumference * (1 - score) : circumference;
  
  const getColor = () => {
    if (score === null) return 'text-slate-300';
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
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastConfidence, setLastConfidence] = useState<number | null>(null);
  const [lastTokenCount, setLastTokenCount] = useState<number>(0);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { lightTap, successTap } = useHaptic();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamResponse = useCallback(async (userQuery: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-tcm-brain`;
    const startTime = performance.now();
    
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
    let tokenCount = 0;

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
            tokenCount = parsed.token_count || parsed.tokenCount || 0;
            setLastConfidence(confidenceScore);
            setLastTokenCount(tokenCount);
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

    const endTime = performance.now();
    const searchTimeMs = Math.round(endTime - startTime);
    setLastSearchTime(searchTimeMs);

    setMessages(prev => prev.map(m => 
      m.id === responseId 
        ? { ...m, isStreaming: false, sources, searchMethod, confidenceScore, tokenCount, searchTimeMs }
        : m
    ));

    return { content: fullContent, sources, searchMethod, confidenceScore, tokenCount, searchTimeMs };
  }, [patientId, deepSearchEnabled]);

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
      successTap();
    } catch (error) {
      console.error('Search error:', error);
      
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        type: 'response',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        sources: [],
      }]);

      toast.error('Failed to get response. Please try again.');
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
      navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    }
  };

  const handleClear = () => {
    setMessages([]);
    setLastConfidence(null);
    setLastTokenCount(0);
    setLastSearchTime(0);
    lightTap();
    toast.success('Cleared');
  };

  const suggestedQueries = [
    'Points for headache with Liver Yang Rising',
    'Herbal formula for Blood stasis',
    'Tongue diagnosis for Spleen Qi deficiency',
  ];

  return (
    <div className="h-full flex flex-col bg-white relative rounded-xl shadow-md border border-slate-200">
      {/* UNIFIED HEADER - PURE WHITE */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-xl">
        <div className="flex items-center justify-between gap-3">
          {/* LEFT: Saved Questions Dropdown */}
          <div className="flex-shrink-0">
            <QuickPromptDropdown
              onSelectQuestion={(question) => setQuery(question)}
              disabled={isSearching}
              placeholder="📚 שאלות שמורות"
              className="text-sm"
            />
          </div>

          {/* CENTER: Metric Badges */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium border-slate-200",
                isSearching 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-green-50 text-green-700 border-green-200"
              )}
            >
              <span className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5",
                isSearching ? "bg-amber-500 animate-pulse" : "bg-green-500"
              )} />
              {isSearching ? 'Scanning...' : 'Ready'}
            </Badge>

            {/* Speed Badge */}
            <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              {lastSearchTime > 0 ? `${lastSearchTime}ms` : '—'}
            </Badge>

            {/* Token Badge */}
            <Badge variant="outline" className="text-xs font-medium bg-violet-50 text-violet-700 border-violet-200">
              <Coins className="w-3 h-3 mr-1" />
              {lastTokenCount > 0 ? `${lastTokenCount}` : '—'}
            </Badge>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Debug Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                    className={cn(
                      "h-7 w-7 p-0",
                      showDebug ? "bg-slate-100 text-slate-800" : "text-slate-500"
                    )}
                  >
                    <Bug className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Debug Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Deep Search Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    <span className="text-xs text-slate-600">Deep</span>
                    <Switch
                      checked={deepSearchEnabled}
                      onCheckedChange={setDeepSearchEnabled}
                      className="data-[state=checked]:bg-violet-500 h-4 w-7"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Deep Search Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Confidence Gauge - Top Right Corner */}
            <ConfidenceGauge score={lastConfidence} size={40} />
          </div>
        </div>
      </div>

      {/* MESSAGE AREA - White Background */}
      <ScrollArea 
        ref={scrollRef}
        className="flex-1 p-4"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center py-12"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-800">TCM Brain Ready</h3>
                  <p className="text-sm text-slate-500 mt-1">Ask about points, patterns, or formulas</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {suggestedQueries.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(suggestion)}
                      className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-4 rounded-xl",
                    message.type === 'query' 
                      ? "bg-blue-50 border border-blue-100 ml-8" 
                      : "bg-white border border-slate-200 mr-4 shadow-sm"
                  )}
                >
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-violet-500 animate-pulse" />
                    )}
                  </p>
                  
                  {/* Response Footer */}
                  {message.type === 'response' && !message.isStreaming && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {message.searchTimeMs && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {message.searchTimeMs}ms
                          </span>
                        )}
                        {message.tokenCount && (
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {message.tokenCount}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInsertToNotes(message.content)}
                        className="h-7 text-xs text-slate-600 hover:text-slate-800"
                      >
                        <ClipboardPlus className="w-3 h-3 mr-1" />
                        Insert
                      </Button>
                    </div>
                  )}

                  {/* Debug Info */}
                  {showDebug && message.type === 'response' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-2">Sources ({message.sources.length})</p>
                      <div className="space-y-1">
                        {message.sources.slice(0, 5).map((src, i) => (
                          <div key={i} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {src.name} • {src.confidence}
                            {src.score !== undefined && ` • Score: ${(src.score * 100).toFixed(0)}%`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* INPUT AREA - White */}
      <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about TCM points, patterns, formulas..."
              className="pr-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-violet-500"
              disabled={isSearching}
            />
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isSearching}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
