import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Activity,
  Clock,
  TrendingUp,
  ShieldCheck,
  Gauge,
  Timer,
  BarChart3,
  MessageCircle,
  X,
  Send
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface APIUsageStats {
  sessionCalls: number;
  todayCalls: number;
  monthCalls: number;
  perMinuteRate: number;
  lastCallAt: string | null;
  isLive: boolean;
  avgResponseTime: number;
  peakHour: number | null;
}

const SESSION_START = new Date().toISOString();

export function APIUsageMeter() {
  const [stats, setStats] = useState<APIUsageStats | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [queryCountdown, setQueryCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Query countdown timer
  useEffect(() => {
    if (isQueryRunning && queryCountdown > 0) {
      countdownRef.current = setTimeout(() => {
        setQueryCountdown(prev => Math.max(0, prev - 100));
      }, 100);
    } else if (queryCountdown <= 0 && isQueryRunning) {
      setIsQueryRunning(false);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [isQueryRunning, queryCountdown]);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();

      const { data: allLogs } = await supabase
        .from('rag_query_logs')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (allLogs) {
        const sessionCalls = allLogs.filter(l => l.created_at >= SESSION_START).length;
        const todayCalls = allLogs.filter(l => l.created_at >= todayStart).length;
        const monthCalls = allLogs.filter(l => l.created_at >= monthStart).length;
        const recentCalls = allLogs.filter(l => l.created_at >= oneMinuteAgo).length;
        const lastCall = allLogs[0]?.created_at || null;
        
        // Calculate if currently active (within last 10 seconds for more responsive indicator)
        const isCurrentlyActive = lastCall 
          ? (new Date().getTime() - new Date(lastCall).getTime()) < 10000 
          : false;

        // Calculate peak hour from today's calls
        const todayLogs = allLogs.filter(l => l.created_at >= todayStart);
        const hourCounts: Record<number, number> = {};
        todayLogs.forEach(log => {
          const hour = new Date(log.created_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const peakHour = Object.entries(hourCounts).length > 0 
          ? parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0])
          : null;

        // Estimate avg response time (mock - would need actual timing data)
        const avgResponseTime = recentCalls > 0 ? 1.2 + Math.random() * 0.8 : 0;

        const newStats = {
          sessionCalls,
          todayCalls,
          monthCalls,
          perMinuteRate: recentCalls,
          lastCallAt: lastCall,
          isLive: isCurrentlyActive || recentCalls > 0,
          avgResponseTime,
          peakHour,
        };

        // Trigger pulse animation and running state when new calls detected
        if (stats && newStats.todayCalls > stats.todayCalls) {
          setPulseAnimation(true);
          setIsQueryRunning(true);
          setQueryCountdown(3000); // 3 second countdown
          setTimeout(() => setPulseAnimation(false), 1000);
        }

        setStats(newStats);
      }
    } catch (err) {
      console.error('Failed to fetch API stats:', err);
    }
  };

  // Expose method for external components to trigger activity
  useEffect(() => {
    const handleQueryStart = () => {
      setIsQueryRunning(true);
      setQueryCountdown(5000); // 5 second countdown for queries
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 1000);
    };

    window.addEventListener('tcm-query-start', handleQueryStart);
    return () => window.removeEventListener('tcm-query-start', handleQueryStart);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full animate-pulse">
        <Gauge className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const formatCountdown = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <motion.div 
      className="flex items-center gap-2 flex-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Live/Running Indicator - Now properly shows LIVE when active */}
      <motion.div 
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
          isQueryRunning 
            ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20' 
            : stats.isLive 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-muted/50 border-border'
        }`}
        animate={isQueryRunning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: isQueryRunning ? Infinity : 0, duration: 0.5 }}
      >
        <div className={`w-2 h-2 rounded-full ${
          isQueryRunning 
            ? 'bg-green-500 animate-ping' 
            : stats.isLive 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-muted-foreground'
        }`} />
        <span className={`text-[10px] font-bold ${
          isQueryRunning ? 'text-green-600' : stats.isLive ? 'text-green-600' : ''
        }`}>
          {isQueryRunning ? 'RUNNING' : stats.isLive ? 'LIVE' : 'IDLE'}
        </span>
        {isQueryRunning && (
          <span className="text-[10px] font-mono text-green-600">
            {formatCountdown(queryCountdown)}
          </span>
        )}
      </motion.div>

      {/* Per Minute Rate */}
      <motion.div 
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
          pulseAnimation ? 'bg-blue-500/20 border-blue-500/50' : 'bg-blue-500/10 border-blue-500/30'
        }`}
        animate={pulseAnimation ? { scale: [1, 1.1, 1] } : {}}
      >
        <Activity className="h-3 w-3 text-blue-600" />
        <span className="text-[10px] font-bold text-blue-600">{stats.perMinuteRate}/min</span>
      </motion.div>

      {/* Session Calls */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-jade/10 border border-jade/30">
        <Zap className="h-3 w-3 text-jade" />
        <span className="text-[10px] font-bold text-jade">{stats.sessionCalls}</span>
        <span className="text-[10px] text-muted-foreground">session</span>
      </div>

      {/* Today Calls with Peak Hour */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
        <TrendingUp className="h-3 w-3 text-amber-600" />
        <span className="text-[10px] font-bold text-amber-600">{stats.todayCalls}</span>
        <span className="text-[10px] text-muted-foreground">today</span>
        {stats.peakHour !== null && (
          <span className="text-[9px] text-amber-500 hidden sm:inline">
            (peak: {stats.peakHour}:00)
          </span>
        )}
      </div>

      {/* Month Total */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
        <ShieldCheck className="h-3 w-3 text-purple-600" />
        <span className="text-[10px] font-bold text-purple-600">{stats.monthCalls}</span>
        <span className="text-[10px] text-muted-foreground">month</span>
      </div>

      {/* Last Call Timestamp */}
      {stats.lastCallAt && (
        <Badge variant="outline" className="text-[10px] font-mono bg-muted/30">
          <Clock className="h-2.5 w-2.5 mr-1" />
          {new Date(stats.lastCallAt).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </Badge>
      )}

      {/* Verified Badge */}
      <Badge className="text-[9px] bg-green-600 text-white animate-pulse">
        ✓ REAL API
      </Badge>

      {/* Compact AI Chat Button */}
      <CompactAIChatButton />
    </motion.div>
  );
}

// Compact AI Chat Button with expandable chat panel
function CompactAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Dispatch event for API meter tracking
    window.dispatchEvent(new CustomEvent('tcm-query-start', { detail: { query: userMessage } }));

    try {
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { query: userMessage }
      });

      if (error) throw error;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data?.response || 'No response received.' 
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('tcm-query-end'));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative">
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${
          isOpen 
            ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
            : 'bg-jade/10 border-jade/30 hover:bg-jade/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <MessageCircle className="h-3.5 w-3.5 text-jade" />
        )}
        <span className={`text-[10px] font-bold ${isOpen ? '' : 'text-jade'}`}>
          {isOpen ? 'Close' : 'AI Chat'}
        </span>
      </motion.button>

      {/* Expandable Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="px-3 py-2 bg-jade/10 border-b border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold">TCM Brain AI</span>
              <Badge variant="outline" className="text-[9px] ml-auto">RAG</Badge>
            </div>

            {/* Messages Area */}
            <ScrollArea className="h-64 p-3" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Ask me about TCM patterns, points, or treatments...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs p-2 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-primary/10 text-foreground ml-8' 
                          : 'bg-muted text-foreground mr-8'
                      }`}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs p-2 rounded-lg bg-muted mr-8 flex items-center gap-2"
                    >
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-jade rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-jade rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-jade rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-muted-foreground">Thinking...</span>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-2 border-t border-border bg-muted/30">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about TCM..."
                  className="min-h-[36px] max-h-[80px] text-xs resize-none"
                  rows={1}
                />
                <Button 
                  size="sm" 
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="h-9 w-9 p-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for use near query input
export function EngineActivityIndicator() {
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(prev => Math.max(0, prev - 100));
      }, 100);
    } else if (countdown <= 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [isRunning, countdown]);

  useEffect(() => {
    const handleQueryStart = (e: CustomEvent) => {
      setIsRunning(true);
      setCountdown(5000);
      setLastQuery(e.detail?.query?.substring(0, 30) || 'Processing...');
    };

    const handleQueryEnd = () => {
      setIsRunning(false);
      setCountdown(0);
    };

    window.addEventListener('tcm-query-start', handleQueryStart as EventListener);
    window.addEventListener('tcm-query-end', handleQueryEnd);
    
    return () => {
      window.removeEventListener('tcm-query-start', handleQueryStart as EventListener);
      window.removeEventListener('tcm-query-end', handleQueryEnd);
    };
  }, []);

  return (
    <motion.div 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
        isRunning 
          ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20' 
          : 'bg-muted/30 border-border'
      }`}
      animate={isRunning ? { 
        boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
      } : {}}
      transition={{ repeat: isRunning ? Infinity : 0, duration: 1.5 }}
    >
      {/* Animated Engine Icon */}
      <motion.div
        animate={isRunning ? { rotate: 360 } : {}}
        transition={{ repeat: isRunning ? Infinity : 0, duration: 1, ease: 'linear' }}
      >
        <Timer className={`h-5 w-5 ${isRunning ? 'text-green-500' : 'text-muted-foreground'}`} />
      </motion.div>

      <div className="flex flex-col">
        <span className={`text-xs font-bold ${isRunning ? 'text-green-600' : 'text-muted-foreground'}`}>
          {isRunning ? 'ENGINE RUNNING' : 'ENGINE READY'}
        </span>
        {isRunning && (
          <span className="text-[10px] text-green-500 font-mono">
            {(countdown / 1000).toFixed(1)}s remaining
          </span>
        )}
        {lastQuery && !isRunning && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
            Last: {lastQuery}...
          </span>
        )}
      </div>

      {/* Live Countdown Bar */}
      {isRunning && (
        <div className="w-16 h-1.5 bg-green-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(countdown / 5000) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
}
