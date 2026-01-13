import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'online' | 'offline' | 'checking' | 'reconnecting';

interface AiStatusProps {
  className?: string;
}

/**
 * AiStatus - Floating AI Connection Indicator
 * 
 * Features:
 * - 🟢 'AI Online' with pulse animation when connected
 * - 🔴 'Connection Lost' with Retry button when offline
 * - Uses navigator.onLine + Edge Function ping for verification
 */
export function AiStatus({ className }: AiStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Ping the edge function to verify AI connectivity
  const checkConnection = useCallback(async () => {
    // First check browser online status
    if (!navigator.onLine) {
      setStatus('offline');
      return false;
    }

    setStatus('checking');
    
    try {
      // Simple health check ping to edge function
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { 
          message: '__health_check__',
          healthCheck: true 
        }
      });

      if (error) {
        console.warn('[AiStatus] Health check failed:', error);
        setStatus('offline');
        return false;
      }

      setStatus('online');
      setLastCheckTime(new Date());
      setRetryCount(0);
      return true;
    } catch (err) {
      console.warn('[AiStatus] Connection check error:', err);
      setStatus('offline');
      return false;
    }
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

    // Periodic health check every 30 seconds when online
    const intervalId = setInterval(() => {
      if (navigator.onLine && status !== 'checking') {
        checkConnection();
      }
    }, 30000);

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
      {renderContent()}
    </div>
  );
}

export default AiStatus;
