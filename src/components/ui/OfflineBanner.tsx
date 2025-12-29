import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { cn } from '@/lib/utils';

export const OfflineBanner = () => {
  const { isOnline, wasOffline } = useOfflineDetection();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] px-4 py-2 text-center text-sm font-medium transition-all duration-300',
        'safe-area-inset-top',
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-destructive text-destructive-foreground'
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 animate-pulse" />
            <span>You're offline - Some features may be unavailable</span>
          </>
        )}
      </div>
    </div>
  );
};
