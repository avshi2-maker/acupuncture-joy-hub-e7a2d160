import { useState, useCallback, useMemo } from 'react';
import { format, addDays, isSameDay, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, setHours } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { SwipeableAppointmentCard } from './SwipeableAppointmentCard';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Play,
  MessageCircle,
  Repeat,
  CalendarDays,
  RefreshCw,
  Loader2,
  Plus,
  X,
} from 'lucide-react';

// Time slots for quick create (8am to 7pm)
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i + 8);

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

interface MobileCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  rooms: Room[];
  onAppointmentClick: (appt: Appointment) => void;
  onStartSession?: (appt: Appointment) => void;
  onRefresh?: () => Promise<void>;
  onQuickCreate?: (date: Date, hour: number) => void;
  onStatusChange?: (apptId: string, newStatus: string) => Promise<void>;
  compactMode?: boolean;
}

export function MobileCalendarView({
  selectedDate,
  onDateChange,
  appointments,
  rooms,
  onAppointmentClick,
  onStartSession,
  onRefresh,
  onQuickCreate,
  onStatusChange,
  compactMode = false,
}: MobileCalendarViewProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const haptic = useHapticFeedback();

  // Pull to refresh
  const { isRefreshing, pullDistance, handlers: pullHandlers } = usePullToRefresh({
    onRefresh: async () => {
      haptic.medium();
      if (onRefresh) {
        await onRefresh();
        haptic.success();
      }
    },
    threshold: 80,
  });

  const navigateDay = useCallback((direction: number) => {
    haptic.light(); // Haptic feedback on swipe
    setSwipeDirection(direction > 0 ? 'left' : 'right');
    setTimeout(() => {
      onDateChange(addDays(selectedDate, direction));
      setSwipeDirection(null);
    }, 150);
  }, [selectedDate, onDateChange, haptic]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => navigateDay(1),
    onSwipeRight: () => navigateDay(-1),
  }, { threshold: 50, allowedTime: 400 });

  const todayAppointments = appointments
    .filter((appt) => isSameDay(new Date(appt.start_time), selectedDate))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const getRoom = (roomId: string | null) => rooms.find((r) => r.id === roomId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-jade/10 text-jade border-jade/30';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'no-show': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      default: return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const isToday = isSameDay(selectedDate, new Date());

  // Generate quick date navigation (today ± 3 days)
  const dateRange = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3));

  // Week overview data - count appointments per day for the current week
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const weekAppointmentData = useMemo(() => {
    return weekDays.map(day => {
      const dayAppointments = appointments.filter(a => isSameDay(new Date(a.start_time), day));
      return {
        date: day,
        count: dayAppointments.length,
        completed: dayAppointments.filter(a => a.status === 'completed').length,
        cancelled: dayAppointments.filter(a => a.status === 'cancelled').length,
        scheduled: dayAppointments.filter(a => a.status === 'scheduled').length,
      };
    });
  }, [weekDays, appointments]);

  const maxAppointments = Math.max(...weekAppointmentData.map(d => d.count), 1);

  // Get available time slots for the selected day
  const getAvailableSlots = useCallback(() => {
    const bookedHours = todayAppointments.map(a => new Date(a.start_time).getHours());
    return TIME_SLOTS.filter(hour => !bookedHours.includes(hour));
  }, [todayAppointments]);

  const handleQuickCreate = (hour: number) => {
    haptic.medium();
    if (onQuickCreate) {
      onQuickCreate(selectedDate, hour);
    }
    setShowTimeSlots(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden" {...swipeHandlers}>
      {/* Date Navigation Header */}
      <div className={cn(
        "bg-card border-b border-border/50 sticky top-0 z-10",
        compactMode ? "p-2" : "p-3"
      )}>
        {/* Main date display */}
        <div className={cn(
          "flex items-center justify-between",
          compactMode ? "mb-2" : "mb-3"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className={compactMode ? "h-8 w-8" : "h-10 w-10"}
            onClick={() => navigateDay(-1)}
          >
            <ChevronLeft className={compactMode ? "h-4 w-4" : "h-5 w-5"} />
          </Button>
          
          <div className="text-center">
            <p className={cn(
              "font-semibold",
              compactMode ? "text-base" : "text-lg"
            )}>
              {format(selectedDate, compactMode ? 'EEE' : 'EEEE')}
            </p>
            <p className={cn(
              "text-muted-foreground",
              compactMode ? "text-xs" : "text-sm"
            )}>
              {format(selectedDate, compactMode ? 'MMM d' : 'MMMM d, yyyy')}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={compactMode ? "h-8 w-8" : "h-10 w-10"}
            onClick={() => navigateDay(1)}
          >
            <ChevronRight className={compactMode ? "h-4 w-4" : "h-5 w-5"} />
          </Button>
        </div>

        {/* Quick date pills */}
        <div className="flex w-full max-w-full gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {dateRange.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isDateToday = isSameDay(date, new Date());
            const hasAppointments = appointments.some((a) => isSameDay(new Date(a.start_time), date));
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateChange(date)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center rounded-lg transition-all',
                  compactMode ? 'py-1 px-2 min-w-[40px]' : 'py-2 px-3 min-w-[52px]',
                  isSelected 
                    ? 'bg-jade text-white' 
                    : isDateToday
                    ? 'bg-jade/10 text-jade'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                <span className={cn(
                  "uppercase font-medium",
                  compactMode ? "text-[8px]" : "text-[10px]"
                )}>
                  {format(date, 'EEE')}
                </span>
                <span className={cn(
                  "font-bold",
                  compactMode ? "text-sm" : "text-lg"
                )}>
                  {format(date, 'd')}
                </span>
                {hasAppointments && !isSelected && (
                  <div className={cn(
                    "rounded-full bg-jade",
                    compactMode ? "w-1 h-1" : "w-1.5 h-1.5 mt-0.5"
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Week Overview Strip - Hidden in compact mode */}
        {!compactMode && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-[10px] uppercase text-muted-foreground mb-2 font-medium">Week Overview</p>
            <div className="flex gap-1">
              {weekAppointmentData.map(({ date, count, completed, cancelled, scheduled }) => {
                const isSelected = isSameDay(date, selectedDate);
                const heightPercent = count > 0 ? Math.max((count / maxAppointments) * 100, 20) : 8;
                
                // Determine bar color based on status breakdown
                const getBarColor = () => {
                  if (count === 0) return 'bg-muted';
                  if (isSelected) return 'bg-jade';
                  if (cancelled > 0 && cancelled === count) return 'bg-destructive/60';
                  if (completed > 0 && completed === count) return 'bg-jade/80';
                  if (completed > scheduled) return 'bg-jade/60';
                  return 'bg-primary/50';
                };
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      haptic.light();
                      onDateChange(date);
                    }}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 py-1 rounded transition-all',
                      isSelected && 'bg-jade/10'
                    )}
                  >
                    <div className="h-8 w-full flex items-end justify-center gap-[1px]">
                      {/* Stacked status dots */}
                      {count > 0 ? (
                        <div className="flex flex-col items-center gap-[2px]">
                          {completed > 0 && (
                            <div className="w-2 h-2 rounded-full bg-jade" title={`${completed} completed`} />
                          )}
                          {scheduled > 0 && (
                            <div className="w-2 h-2 rounded-full bg-primary/60" title={`${scheduled} scheduled`} />
                          )}
                          {cancelled > 0 && (
                            <div className="w-2 h-2 rounded-full bg-destructive/60" title={`${cancelled} cancelled`} />
                          )}
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      )}
                    </div>
                    <span className={cn(
                      'text-[9px]',
                      isSelected ? 'text-jade font-semibold' : 'text-muted-foreground'
                    )}>
                      {format(date, 'EEE')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          'flex items-center justify-center overflow-hidden transition-all duration-200 bg-jade/5',
          pullDistance > 0 ? 'border-b border-jade/20' : ''
        )}
        style={{ 
          height: pullDistance > 0 ? Math.min(pullDistance, 80) : 0,
          opacity: pullDistance > 0 ? Math.min(pullDistance / 80, 1) : 0 
        }}
      >
        {isRefreshing ? (
          <Loader2 className="h-5 w-5 text-jade animate-spin" />
        ) : (
          <div className="flex items-center gap-2 text-jade">
            <RefreshCw 
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                pullDistance >= 80 && 'rotate-180'
              )} 
            />
            <span className="text-xs font-medium">
              {pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>

      {/* Swipe hint + Quick create toggle */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          <span>Swipe left/right • Pull to refresh</span>
        </div>
        {onQuickCreate && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs",
              showTimeSlots ? "text-jade" : "text-muted-foreground"
            )}
            onClick={() => {
              haptic.light();
              setShowTimeSlots(!showTimeSlots);
            }}
          >
            {showTimeSlots ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
            {showTimeSlots ? 'Cancel' : 'Quick Add'}
          </Button>
        )}
      </div>

      {/* Time Slots for Quick Create */}
      {showTimeSlots && onQuickCreate && (
        <div className="bg-jade/5 border-b border-jade/20 p-3">
          <p className="text-xs text-jade font-medium mb-2">Tap a time slot to create appointment:</p>
          <div className="grid grid-cols-4 gap-2">
            {getAvailableSlots().map((hour) => (
              <button
                key={hour}
                onClick={() => handleQuickCreate(hour)}
                className="py-2 px-3 rounded-lg bg-background border border-jade/30 text-sm font-medium text-jade hover:bg-jade/10 active:scale-95 transition-all"
              >
                {format(setHours(new Date(), hour), 'h a')}
              </button>
            ))}
          </div>
          {getAvailableSlots().length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              All time slots are booked for this day
            </p>
          )}
        </div>
      )}

      {/* Appointments List */}
      <div 
        className="flex-1 overflow-y-auto"
        {...pullHandlers}
      >
        <div 
          className={cn(
            'p-3 space-y-3 transition-transform duration-150',
            swipeDirection === 'left' && '-translate-x-4 opacity-50',
            swipeDirection === 'right' && 'translate-x-4 opacity-50'
          )}
        >
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No appointments</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                {isToday ? 'Nothing scheduled for today' : 'Nothing scheduled for this day'}
              </p>
              {onQuickCreate && !showTimeSlots && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-jade/30 text-jade"
                  onClick={() => {
                    haptic.light();
                    setShowTimeSlots(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Appointment
                </Button>
              )}
            </div>
          ) : (
            todayAppointments.map((appt) => {
              const room = getRoom(appt.room_id);
              
              return (
                <SwipeableAppointmentCard
                  key={appt.id}
                  appointment={appt}
                  room={room}
                  onAppointmentClick={onAppointmentClick}
                  onStartSession={onStartSession}
                  onStatusChange={onStatusChange}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Summary footer */}
      <div className="bg-card border-t border-border/50 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}
          </span>
          {!isToday && (
            <Button
              variant="ghost"
              size="sm"
              className="text-jade"
              onClick={() => onDateChange(new Date())}
            >
              Go to Today
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
