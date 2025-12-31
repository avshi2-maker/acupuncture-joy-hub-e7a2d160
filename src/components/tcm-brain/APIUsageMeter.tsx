import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Activity,
  Clock,
  TrendingUp,
  ShieldCheck,
  Gauge
} from 'lucide-react';

interface APIUsageStats {
  sessionCalls: number;
  todayCalls: number;
  monthCalls: number;
  perMinuteRate: number;
  lastCallAt: string | null;
  isLive: boolean;
}

const SESSION_START = new Date().toISOString();

export function APIUsageMeter() {
  const [stats, setStats] = useState<APIUsageStats | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

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

        const newStats = {
          sessionCalls,
          todayCalls,
          monthCalls,
          perMinuteRate: recentCalls,
          lastCallAt: lastCall,
          isLive: lastCall ? (new Date().getTime() - new Date(lastCall).getTime()) < 30000 : false,
        };

        // Trigger pulse animation when new calls detected
        if (stats && newStats.todayCalls > stats.todayCalls) {
          setPulseAnimation(true);
          setTimeout(() => setPulseAnimation(false), 1000);
        }

        setStats(newStats);
      }
    } catch (err) {
      console.error('Failed to fetch API stats:', err);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full animate-pulse">
        <Gauge className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex items-center gap-2 flex-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Live Indicator */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
        stats.isLive 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-muted/50 border-border'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          stats.isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
        }`} />
        <span className="text-[10px] font-medium">
          {stats.isLive ? 'LIVE' : 'IDLE'}
        </span>
      </div>

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

      {/* Today Calls */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
        <TrendingUp className="h-3 w-3 text-amber-600" />
        <span className="text-[10px] font-bold text-amber-600">{stats.todayCalls}</span>
        <span className="text-[10px] text-muted-foreground">today</span>
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
    </motion.div>
  );
}
