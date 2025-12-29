import { useState, useCallback, useRef, useEffect } from 'react';
import { ThumbsUp, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

interface SwipeStatusTagsProps {
  onAddTag: (tag: string) => void;
  sessionStatus: 'idle' | 'running' | 'paused' | 'ended';
}

export function SwipeStatusTags({ onAddTag, sessionStatus }: SwipeStatusTagsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const startY = useRef<number | null>(null);
  const haptic = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SWIPE_THRESHOLD = 60;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setSwipeProgress(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;
    
    if (delta > 0) {
      setSwipeProgress(Math.min(delta / SWIPE_THRESHOLD, 1));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (swipeProgress >= 1) {
      haptic.medium();
      setShowMenu(true);
      
      // Auto-hide after 5 seconds
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
      menuTimeoutRef.current = setTimeout(() => {
        setShowMenu(false);
      }, 5000);
    }
    
    startY.current = null;
    setSwipeProgress(0);
  }, [swipeProgress, haptic]);

  const handleSelectTag = useCallback((tag: string, emoji: string) => {
    onAddTag(`\n${emoji} ${tag}`);
    haptic.success();
    setShowMenu(false);
    toast.success(`Added: ${tag}`, { duration: 2000 });
  }, [onAddTag, haptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  // Only show during active session
  if (sessionStatus !== 'running' && sessionStatus !== 'paused') {
    return null;
  }

  return (
    <>
      {/* Swipe Zone Indicator */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="md:hidden fixed top-0 left-0 right-0 h-16 z-30"
      >
        {/* Pull indicator */}
        <div 
          className={cn(
            'absolute left-1/2 -translate-x-1/2 transition-all duration-150',
            swipeProgress > 0 ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            top: `${Math.min(swipeProgress * 40, 40)}px`,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div 
              className={cn(
                'w-12 h-1.5 rounded-full transition-colors',
                swipeProgress >= 1 ? 'bg-jade' : 'bg-muted-foreground/40'
              )}
            />
            <span className={cn(
              'text-xs font-medium transition-colors',
              swipeProgress >= 1 ? 'text-jade' : 'text-muted-foreground'
            )}>
              {swipeProgress >= 1 ? 'Release for tags' : 'Pull down'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Tag Menu */}
      {showMenu && (
        <div className="md:hidden fixed inset-x-0 top-20 z-50 px-4 animate-fade-in">
          <div className="bg-card border rounded-xl shadow-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Quick Status Tags</span>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectTag('Patient feeling better', '✅')}
                className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors touch-manipulation"
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="text-sm font-medium">Feeling Better</span>
              </button>
              
              <button
                onClick={() => handleSelectTag('Patient needs follow-up', '⚠️')}
                className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors touch-manipulation"
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Needs Follow-up</span>
              </button>
              
              <button
                onClick={() => handleSelectTag('Symptoms improving', '📈')}
                className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors touch-manipulation"
              >
                <span className="text-lg">📈</span>
                <span className="text-sm font-medium">Improving</span>
              </button>
              
              <button
                onClick={() => handleSelectTag('Medication review needed', '💊')}
                className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors touch-manipulation"
              >
                <span className="text-lg">💊</span>
                <span className="text-sm font-medium">Med Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
