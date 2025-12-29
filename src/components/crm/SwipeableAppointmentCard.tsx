import { useState, useRef, useCallback } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import {
  Clock,
  User,
  MapPin,
  Play,
  MessageCircle,
  Repeat,
  Check,
  X,
} from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  room_id: string | null;
  patient_id: string | null;
  notes: string | null;
  color: string | null;
  is_recurring: boolean | null;
  recurrence_rule: string | null;
  recurrence_end_date: string | null;
  parent_appointment_id: string | null;
  patients?: { full_name: string; phone?: string | null } | null;
}

interface Room {
  id: string;
  name: string;
  color: string;
}

interface SwipeableAppointmentCardProps {
  appointment: Appointment;
  room?: Room;
  onAppointmentClick: (appt: Appointment) => void;
  onStartSession?: (appt: Appointment) => void;
  onStatusChange?: (apptId: string, newStatus: string) => Promise<void>;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableAppointmentCard({
  appointment,
  room,
  onAppointmentClick,
  onStartSession,
  onStatusChange,
}: SwipeableAppointmentCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'complete' | 'cancel' | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const duration = differenceInMinutes(endTime, startTime);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-jade/10 text-jade border-jade/30';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'no-show': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      default: return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (appointment.status !== 'scheduled') return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  }, [appointment.status]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (appointment.status !== 'scheduled') return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine if this is a horizontal swipe on first significant movement
    if (!isHorizontalSwipe.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!isHorizontalSwipe.current) return;

    // Prevent vertical scrolling while swiping horizontally
    e.preventDefault();

    // Apply resistance at edges
    const resistance = 0.5;
    const adjustedDelta = deltaX * resistance;
    const clampedDelta = Math.max(-150, Math.min(150, adjustedDelta));
    
    setSwipeX(clampedDelta);

    // Determine action based on swipe direction
    if (clampedDelta > SWIPE_THRESHOLD) {
      if (swipeAction !== 'complete') {
        haptic.light();
        setSwipeAction('complete');
      }
    } else if (clampedDelta < -SWIPE_THRESHOLD) {
      if (swipeAction !== 'cancel') {
        haptic.light();
        setSwipeAction('cancel');
      }
    } else {
      setSwipeAction(null);
    }
  }, [appointment.status, swipeAction, haptic]);

  const handleTouchEnd = useCallback(async () => {
    if (appointment.status !== 'scheduled') return;

    if (swipeAction && onStatusChange) {
      setIsAnimating(true);
      
      // Animate to the edge
      const targetX = swipeAction === 'complete' ? 300 : -300;
      setSwipeX(targetX);
      
      haptic.success();

      // Update status after animation
      setTimeout(async () => {
        const newStatus = swipeAction === 'complete' ? 'completed' : 'cancelled';
        await onStatusChange(appointment.id, newStatus);
        setSwipeX(0);
        setIsAnimating(false);
        setSwipeAction(null);
      }, 200);
    } else {
      // Snap back
      setIsAnimating(true);
      setSwipeX(0);
      setTimeout(() => setIsAnimating(false), 200);
    }
    
    setSwipeAction(null);
  }, [appointment.id, appointment.status, swipeAction, onStatusChange, haptic]);

  const handleClick = () => {
    if (Math.abs(swipeX) < 5) {
      onAppointmentClick(appointment);
    }
  };

  // Already completed or cancelled - no swipe
  const canSwipe = appointment.status === 'scheduled' && onStatusChange;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background action indicators */}
      {canSwipe && (
        <>
          {/* Complete (right swipe) background */}
          <div 
            className={cn(
              'absolute inset-y-0 left-0 flex items-center justify-start pl-4 rounded-lg transition-all',
              swipeX > 0 ? 'bg-jade' : 'bg-jade/50'
            )}
            style={{ 
              width: Math.max(0, swipeX),
              opacity: Math.min(1, swipeX / SWIPE_THRESHOLD),
            }}
          >
            <div className="flex items-center gap-2 text-white">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>

          {/* Cancel (left swipe) background */}
          <div 
            className={cn(
              'absolute inset-y-0 right-0 flex items-center justify-end pr-4 rounded-lg transition-all',
              swipeX < 0 ? 'bg-destructive' : 'bg-destructive/50'
            )}
            style={{ 
              width: Math.max(0, -swipeX),
              opacity: Math.min(1, -swipeX / SWIPE_THRESHOLD),
            }}
          >
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm font-medium">Cancel</span>
              <X className="h-5 w-5" />
            </div>
          </div>
        </>
      )}

      {/* Main card */}
      <Card 
        ref={cardRef}
        className={cn(
          'border-l-4 overflow-hidden transition-transform',
          isAnimating ? 'duration-200' : 'duration-0',
          'border-border/50 relative bg-card'
        )}
        style={{ 
          borderLeftColor: room?.color || appointment.color || '#3B82F6',
          transform: `translateX(${swipeX}px)`,
        }}
        onTouchStart={canSwipe ? handleTouchStart : undefined}
        onTouchMove={canSwipe ? handleTouchMove : undefined}
        onTouchEnd={canSwipe ? handleTouchEnd : undefined}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Patient/Title */}
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold truncate">
                  {appointment.patients?.full_name || appointment.title}
                </span>
                {appointment.is_recurring && (
                  <Repeat className="h-3 w-3 text-purple-500 flex-shrink-0" />
                )}
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </span>
                <Badge variant="outline" className="text-[10px] h-5">
                  {duration} min
                </Badge>
              </div>
              
              {/* Room */}
              {room && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="text-muted-foreground">{room.name}</span>
                  </div>
                </div>
              )}

              {/* Swipe hint for scheduled appointments */}
              {canSwipe && (
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  ← Swipe to cancel • Swipe to complete →
                </p>
              )}
            </div>
            
            {/* Status & Actions */}
            <div className="flex flex-col items-end gap-2">
              <Badge className={cn('text-[10px]', getStatusColor(appointment.status))}>
                {appointment.status}
              </Badge>
              
              {appointment.status === 'scheduled' && onStartSession && (
                <Button
                  size="sm"
                  className="h-8 px-3 bg-jade hover:bg-jade/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartSession(appointment);
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              
              {appointment.patients?.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-green-500/30 text-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    const message = encodeURIComponent(
                      `שלום ${appointment.patients?.full_name}, תזכורת לתור שלך היום בשעה ${format(startTime, 'HH:mm')}`
                    );
                    window.open(`https://wa.me/${appointment.patients?.phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Notes preview */}
          {appointment.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-muted/30 rounded p-2">
              {appointment.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
