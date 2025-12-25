import { useEffect, useState, useCallback } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addHours, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  User,
  DoorOpen,
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  color: string;
}

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
  patients?: { full_name: string } | null;
}

interface Patient {
  id: string;
  full_name: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

export default function CRMCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppt, setShowNewAppt] = useState(false);

  // New appointment form state
  const [newAppt, setNewAppt] = useState({
    title: '',
    patient_id: '',
    room_id: '',
    date: new Date(),
    start_hour: 9,
    start_minute: 0,
    duration: 60,
    notes: '',
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name, color')
        .eq('is_active', true)
        .order('name');

      // Calculate date range
      let startDate: Date, endDate: Date;
      if (viewMode === 'day') {
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
      }

      // Fetch appointments
      const { data: apptsData } = await supabase
        .from('appointments')
        .select('*, patients(full_name)')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');

      // Fetch patients for form
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name')
        .order('full_name');

      setRooms(roomsData || []);
      setAppointments(apptsData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDayAndRoom = (day: Date, roomId: string | null) => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.start_time);
      const sameDay = isSameDay(apptDate, day);
      const sameRoom = roomId === null ? !appt.room_id : appt.room_id === roomId;
      return sameDay && sameRoom;
    });
  };

  const getAppointmentPosition = (appt: Appointment) => {
    const start = new Date(appt.start_time);
    const end = new Date(appt.end_time);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - 8) * 60; // 60px per hour, starting at 8am
    const height = (endHour - startHour) * 60;
    return { top, height: Math.max(height, 30) };
  };

  const handleCreateAppointment = async () => {
    try {
      const startTime = setMinutes(setHours(newAppt.date, newAppt.start_hour), newAppt.start_minute);
      const endTime = addHours(startTime, newAppt.duration / 60);

      const { error } = await supabase.from('appointments').insert({
        title: newAppt.title || 'Appointment',
        patient_id: newAppt.patient_id || null,
        room_id: newAppt.room_id || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled',
        notes: newAppt.notes || null,
        therapist_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast.success('Appointment created');
      setShowNewAppt(false);
      setNewAppt({
        title: '',
        patient_id: '',
        room_id: '',
        date: new Date(),
        start_hour: 9,
        start_minute: 0,
        duration: 60,
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const navigateDate = (direction: number) => {
    if (viewMode === 'day') {
      setSelectedDate(addDays(selectedDate, direction));
    } else {
      setSelectedDate(addDays(selectedDate, direction * 7));
    }
  };

  return (
    <CRMLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold">Calendar</h1>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'day'
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : `Week of ${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg">
              <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="px-3">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Today
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showNewAppt} onOpenChange={setShowNewAppt}>
              <DialogTrigger asChild>
                <Button className="bg-jade hover:bg-jade/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <Select
                      value={newAppt.patient_id}
                      onValueChange={(v) => setNewAppt({ ...newAppt, patient_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Select
                      value={newAppt.room_id}
                      onValueChange={(v) => setNewAppt({ ...newAppt, room_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: r.color }}
                              />
                              {r.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {format(newAppt.date, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAppt.date}
                            onSelect={(d) => d && setNewAppt({ ...newAppt, date: d })}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="flex gap-1">
                        <Select
                          value={String(newAppt.start_hour)}
                          onValueChange={(v) => setNewAppt({ ...newAppt, start_hour: parseInt(v) })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HOURS.map((h) => (
                              <SelectItem key={h} value={String(h)}>
                                {format(setHours(new Date(), h), 'h a')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={String(newAppt.start_minute)}
                          onValueChange={(v) => setNewAppt({ ...newAppt, start_minute: parseInt(v) })}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 15, 30, 45].map((m) => (
                              <SelectItem key={m} value={String(m)}>
                                :{m.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select
                      value={String(newAppt.duration)}
                      onValueChange={(v) => setNewAppt({ ...newAppt, duration: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newAppt.notes}
                      onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                      placeholder="Optional notes..."
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleCreateAppointment} className="w-full bg-jade hover:bg-jade/90">
                    Create Appointment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Room Legend */}
        {rooms.length > 0 && (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-muted-foreground">Rooms:</span>
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: room.color }}
                />
                <span className="text-sm">{room.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Calendar Grid */}
        <Card className="border-border/50 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid border-b border-border/50 sticky top-0 bg-card z-10" style={{
                gridTemplateColumns: viewMode === 'day'
                  ? `60px repeat(${Math.max(rooms.length, 1)}, 1fr)`
                  : `60px repeat(7, 1fr)`
              }}>
                <div className="p-2 border-r border-border/30" />
                {viewMode === 'day' ? (
                  rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-3 text-center border-r border-border/30 last:border-r-0"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: room.color }}
                          />
                          <span className="font-medium text-sm">{room.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center">
                      <span className="font-medium text-sm">All Appointments</span>
                    </div>
                  )
                ) : (
                  weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'p-3 text-center border-r border-border/30 last:border-r-0',
                        isSameDay(day, new Date()) && 'bg-jade/10'
                      )}
                    >
                      <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                      <p className={cn(
                        'text-lg font-semibold',
                        isSameDay(day, new Date()) && 'text-jade'
                      )}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Time slots */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-border/30"
                  style={{
                    gridTemplateColumns: viewMode === 'day'
                      ? `60px repeat(${Math.max(rooms.length, 1)}, 1fr)`
                      : `60px repeat(7, 1fr)`,
                    height: '60px',
                  }}
                >
                  <div className="p-2 text-xs text-muted-foreground text-right pr-3 border-r border-border/30">
                    {format(setHours(new Date(), hour), 'h a')}
                  </div>

                  {viewMode === 'day' ? (
                    rooms.length > 0 ? (
                      rooms.map((room) => (
                        <div
                          key={room.id}
                          className="relative border-r border-border/30 last:border-r-0 hover:bg-muted/20 transition-colors"
                        >
                          {getAppointmentsForDayAndRoom(selectedDate, room.id)
                            .filter((a) => new Date(a.start_time).getHours() === hour)
                            .map((appt) => {
                              const pos = getAppointmentPosition(appt);
                              return (
                                <div
                                  key={appt.id}
                                  className="absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{
                                    top: `${pos.top % 60}px`,
                                    height: `${pos.height}px`,
                                    backgroundColor: appt.color || room.color,
                                  }}
                                >
                                  <p className="font-medium truncate">
                                    {appt.patients?.full_name || appt.title}
                                  </p>
                                  <p className="opacity-80 truncate">
                                    {format(new Date(appt.start_time), 'h:mm a')}
                                  </p>
                                </div>
                              );
                            })}
                        </div>
                      ))
                    ) : (
                      <div className="relative hover:bg-muted/20 transition-colors">
                        {getAppointmentsForDayAndRoom(selectedDate, null)
                          .filter((a) => new Date(a.start_time).getHours() === hour)
                          .map((appt) => {
                            const pos = getAppointmentPosition(appt);
                            return (
                              <div
                                key={appt.id}
                                className="absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-jade"
                                style={{
                                  top: `${pos.top % 60}px`,
                                  height: `${pos.height}px`,
                                }}
                              >
                                <p className="font-medium truncate">
                                  {appt.patients?.full_name || appt.title}
                                </p>
                                <p className="opacity-80 truncate">
                                  {format(new Date(appt.start_time), 'h:mm a')}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )
                  ) : (
                    weekDays.map((day) => (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'relative border-r border-border/30 last:border-r-0 hover:bg-muted/20 transition-colors',
                          isSameDay(day, new Date()) && 'bg-jade/5'
                        )}
                      >
                        {appointments
                          .filter((a) => {
                            const apptDate = new Date(a.start_time);
                            return isSameDay(apptDate, day) && apptDate.getHours() === hour;
                          })
                          .map((appt) => {
                            const pos = getAppointmentPosition(appt);
                            const room = rooms.find((r) => r.id === appt.room_id);
                            return (
                              <div
                                key={appt.id}
                                className="absolute left-1 right-1 rounded-md px-1 py-0.5 text-[10px] text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                style={{
                                  top: `${pos.top % 60}px`,
                                  height: `${Math.min(pos.height, 55)}px`,
                                  backgroundColor: room?.color || appt.color || '#3B82F6',
                                }}
                              >
                                <p className="font-medium truncate">
                                  {appt.patients?.full_name || appt.title}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </CRMLayout>
  );
}
