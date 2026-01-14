import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { TcmPointsIndexer } from '@/components/TcmPointsIndexer';
type ConnectionStatus = 'online' | 'offline' | 'checking' | 'reconnecting';

interface AiStatusProps {
  className?: string;
}

// -----------------------------------------------------------------------------
// Global (module-level) throttling to prevent multiple AiStatus instances from
// stampeding the backend with health-check requests (which can trigger 503
// BOOT_ERROR under load).
// -----------------------------------------------------------------------------
const HEALTHCHECK_THROTTLE_MS = 15_000;
let globalInFlight: Promise<boolean> | null = null;
let globalLastResult: { ok: boolean; checkedAt: number } | null = null;

/**
 * AiStatus - Floating AI Connection Indicator
 *
 * Features:
 * - 🟢 'AI Online' with pulse animation when connected
 * - 🔴 'Connection Lost' with Retry button when offline
 * - Uses navigator.onLine + backend ping for verification
 */
export function AiStatus({ className }: AiStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showIndexer, setShowIndexer] = useState(false);
  // Ping the backend to verify AI connectivity (throttled globally)
  const checkConnection = useCallback(async () => {
    // First check browser online status
    if (!navigator.onLine) {
      setStatus('offline');
      return false;
    }

    const now = Date.now();

    // Serve cached result if it's fresh
    if (globalLastResult && now - globalLastResult.checkedAt < HEALTHCHECK_THROTTLE_MS) {
      setStatus(globalLastResult.ok ? 'online' : 'offline');
      if (globalLastResult.ok) setLastCheckTime(new Date(globalLastResult.checkedAt));
      return globalLastResult.ok;
    }

    // Deduplicate concurrent checks across multiple AiStatus instances
    if (!globalInFlight) {
      setStatus('checking');

      globalInFlight = (async () => {
        try {
          const { error } = await supabase.functions.invoke('tcm-rag-chat', {
            body: {
              message: '__health_check__',
              healthCheck: true,
            },
          });

          const ok = !error;
          globalLastResult = { ok, checkedAt: Date.now() };
          return ok;
        } catch (err) {
          console.warn('[AiStatus] Connection check error:', err);
          globalLastResult = { ok: false, checkedAt: Date.now() };
          return false;
        } finally {
          globalInFlight = null;
        }
      })();
    }

    const ok = await globalInFlight;
    setStatus(ok ? 'online' : 'offline');

    if (ok) {
      setLastCheckTime(new Date());
      setRetryCount(0);
    }

    return ok;
  }, []);

  // Handle retry click
  const handleRetry = useCallback(async () => {
    setStatus('reconnecting');
    setRetryCount(prev => prev + 1);
    await checkConnection();
  }, [checkConnection]);

  // Initial check and periodic health checks
  useEffect(() => {
    // Initial check
    checkConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[AiStatus] Browser online event');
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log('[AiStatus] Browser offline event');
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic health check (throttled globally inside checkConnection)
    const intervalId = setInterval(() => {
      if (navigator.onLine && status !== 'checking' && status !== 'reconnecting') {
        checkConnection();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnection, status]);

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case 'online':
        return (
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
              "shadow-sm shadow-emerald-500/20"
            )}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium">AI Online</span>
          </Badge>
        );

      case 'checking':
      case 'reconnecting':
        return (
          <Badge 
            variant="outline" 
            className="gap-1.5 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs font-medium">
              {status === 'reconnecting' ? 'Reconnecting...' : 'Checking...'}
            </span>
          </Badge>
        );

      case 'offline':
        return (
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="gap-1.5 bg-destructive/10 border-destructive/30 text-destructive"
            >
              <WifiOff className="h-3 w-3" />
              <span className="text-xs font-medium">Connection Lost</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-6 px-2 text-xs gap-1 hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
              {retryCount > 0 && (
                <span className="text-[10px] opacity-60">({retryCount})</span>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "fixed bottom-4 left-4 z-50",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Main status */}
        <div className="flex items-center gap-2">
          {renderContent()}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIndexer(!showIndexer)}
            className="h-6 w-6 p-0"
            title="Toggle Indexer Panel"
          >
            {showIndexer ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>

        {/* Emergency Indexer Panel */}
        {showIndexer && (
          <div className="bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Emergency Data Injection
            </div>
            <TcmPointsIndexer />
          </div>
        )}
      </div>
    </div>
  );
}

export default AiStatus;
