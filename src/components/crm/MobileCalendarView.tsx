import { useState, useCallback } from 'react';
import { format, addDays, isSameDay, differenceInMinutes } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
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

interface MobileCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  rooms: Room[];
  onAppointmentClick: (appt: Appointment) => void;
  onStartSession?: (appt: Appointment) => void;
}

export function MobileCalendarView({
  selectedDate,
  onDateChange,
  appointments,
  rooms,
  onAppointmentClick,
  onStartSession,
}: MobileCalendarViewProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const navigateDay = useCallback((direction: number) => {
    setSwipeDirection(direction > 0 ? 'left' : 'right');
    setTimeout(() => {
      onDateChange(addDays(selectedDate, direction));
      setSwipeDirection(null);
    }, 150);
  }, [selectedDate, onDateChange]);

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

  return (
    <div className="flex flex-col h-full" {...swipeHandlers}>
      {/* Date Navigation Header */}
      <div className="bg-card border-b border-border/50 p-3 sticky top-0 z-10">
        {/* Main date display */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigateDay(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <p className="text-lg font-semibold">
              {format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigateDay(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick date pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {dateRange.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isDateToday = isSameDay(date, new Date());
            const hasAppointments = appointments.some((a) => isSameDay(new Date(a.start_time), date));
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateChange(date)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-[52px]',
                  isSelected 
                    ? 'bg-jade text-white' 
                    : isDateToday
                    ? 'bg-jade/10 text-jade'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                <span className="text-[10px] uppercase font-medium">
                  {format(date, 'EEE')}
                </span>
                <span className="text-lg font-bold">
                  {format(date, 'd')}
                </span>
                {hasAppointments && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-jade mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipe hint */}
      <div className="text-center py-2 text-xs text-muted-foreground bg-muted/30">
        <CalendarDays className="h-3 w-3 inline mr-1" />
        Swipe left/right to change day
      </div>

      {/* Appointments List */}
      <ScrollArea className="flex-1">
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
              <p className="text-sm text-muted-foreground/70">
                {isToday ? 'Nothing scheduled for today' : 'Nothing scheduled for this day'}
              </p>
            </div>
          ) : (
            todayAppointments.map((appt) => {
              const room = getRoom(appt.room_id);
              const startTime = new Date(appt.start_time);
              const endTime = new Date(appt.end_time);
              const duration = differenceInMinutes(endTime, startTime);
              
              return (
                <Card 
                  key={appt.id}
                  className={cn(
                    'border-l-4 overflow-hidden active:scale-[0.98] transition-transform',
                    'border-border/50'
                  )}
                  style={{ borderLeftColor: room?.color || appt.color || '#3B82F6' }}
                  onClick={() => onAppointmentClick(appt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Patient/Title */}
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-semibold truncate">
                            {appt.patients?.full_name || appt.title}
                          </span>
                          {appt.is_recurring && (
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
                      </div>
                      
                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn('text-[10px]', getStatusColor(appt.status))}>
                          {appt.status}
                        </Badge>
                        
                        {appt.status === 'scheduled' && onStartSession && (
                          <Button
                            size="sm"
                            className="h-8 px-3 bg-jade hover:bg-jade/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartSession(appt);
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {appt.patients?.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-green-500/30 text-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              const message = encodeURIComponent(
                                `שלום ${appt.patients?.full_name}, תזכורת לתור שלך היום בשעה ${format(startTime, 'HH:mm')}`
                              );
                              window.open(`https://wa.me/${appt.patients?.phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Notes preview */}
                    {appt.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-muted/30 rounded p-2">
                        {appt.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

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
