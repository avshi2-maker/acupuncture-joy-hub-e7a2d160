import { useEffect, useState, useCallback, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, addHours, setHours, setMinutes, addWeeks, addMonths,
  differenceInMinutes, parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  User,
  DoorOpen,
  AlertTriangle,
  Repeat,
  GripVertical,
  X,
  Edit,
  Trash2,
  MessageCircle,
  Play,
  Timer,
  FileText,
} from 'lucide-react';
import { WhatsAppReminderButton } from '@/components/crm/WhatsAppReminderButton';
import { useSessionTimer } from '@/contexts/SessionTimerContext';

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
  is_recurring: boolean | null;
  recurrence_rule: string | null;
  recurrence_end_date: string | null;
  parent_appointment_id: string | null;
  patients?: { full_name: string; phone?: string | null } | null;
}

interface Patient {
  id: string;
  full_name: string;
  phone?: string | null;
}

interface DragState {
  appointmentId: string;
  originalRoomId: string | null;
  originalStart: Date;
  originalEnd: Date;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm
const SLOT_HEIGHT = 60; // pixels per hour

function CalendarContent() {
  const { startTimer, status: timerStatus } = useSessionTimer();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [showQuickPatient, setShowQuickPatient] = useState(false);
  const [quickPatientName, setQuickPatientName] = useState('');
  const [quickPatientPhone, setQuickPatientPhone] = useState('');
  const [quickPatientIdNumber, setQuickPatientIdNumber] = useState('');
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [patientSearchFilter, setPatientSearchFilter] = useState('');
  
  // Drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{ roomId: string | null; day: Date; hour: number; minute: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Start session with timer from appointment
  const handleStartSession = (appt: Appointment) => {
    const startTime = new Date(appt.start_time);
    const endTime = new Date(appt.end_time);
    const durationMinutes = differenceInMinutes(endTime, startTime);
    
    startTimer(durationMinutes, {
      patientId: appt.patient_id || undefined,
      patientName: appt.patients?.full_name || appt.title,
      appointmentId: appt.id,
      appointmentTitle: appt.title,
    });
    
    setEditingAppt(null);
  };

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
    is_recurring: false,
    recurrence_rule: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    recurrence_count: 4,
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
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name, color')
        .eq('is_active', true)
        .order('name');

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

      const { data: apptsData } = await supabase
        .from('appointments')
        .select('*, patients(full_name, phone)')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, phone')
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

  // Quick patient creation
  const handleCreateQuickPatient = async () => {
    if (!quickPatientName.trim() || !quickPatientPhone.trim()) {
      toast.error('שם וטלפון נדרשים');
      return;
    }

    setCreatingPatient(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .insert({
          full_name: quickPatientName.trim(),
          phone: quickPatientPhone.trim(),
          id_number: quickPatientIdNumber.trim() || null,
          therapist_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to patients list and select the new patient
      setPatients([...patients, { id: data.id, full_name: data.full_name, phone: data.phone }]);
      setNewAppt({ ...newAppt, patient_id: data.id, title: data.full_name });
      setShowQuickPatient(false);
      setQuickPatientName('');
      setQuickPatientPhone('');
      setQuickPatientIdNumber('');
      toast.success('מטופל נוצר בהצלחה');
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast.error(error.message || 'שגיאה ביצירת מטופל');
    } finally {
      setCreatingPatient(false);
    }
  };

  // Check for room conflicts
  const checkRoomConflict = useCallback((
    roomId: string | null,
    startTime: Date,
    endTime: Date,
    excludeApptId?: string
  ): Appointment | null => {
    if (!roomId) return null;
    
    return appointments.find(appt => {
      if (appt.id === excludeApptId) return false;
      if (appt.room_id !== roomId) return false;
      
      const apptStart = new Date(appt.start_time);
      const apptEnd = new Date(appt.end_time);
      
      // Check for overlap
      return (startTime < apptEnd && endTime > apptStart);
    }) || null;
  }, [appointments]);

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
    const top = (startHour - 8) * SLOT_HEIGHT;
    const height = (endHour - startHour) * SLOT_HEIGHT;
    return { top, height: Math.max(height, 30) };
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, appt: Appointment) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appt.id);
    
    setDragState({
      appointmentId: appt.id,
      originalRoomId: appt.room_id,
      originalStart: new Date(appt.start_time),
      originalEnd: new Date(appt.end_time),
    });
  };

  const handleDragOver = (e: React.DragEvent, roomId: string | null, day: Date, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate minute based on Y position within the hour slot
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const minute = Math.floor((relativeY / SLOT_HEIGHT) * 60 / 15) * 15; // Snap to 15-min intervals
    
    setDragPreview({ roomId, day, hour, minute: Math.min(minute, 45) });
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDragPreview(null);
    setConflictWarning(null);
  };

  const handleDrop = async (e: React.DragEvent, roomId: string | null, day: Date, hour: number) => {
    e.preventDefault();
    
    if (!dragState) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const minute = Math.floor((relativeY / SLOT_HEIGHT) * 60 / 15) * 15;
    
    const newStart = setMinutes(setHours(day, hour), Math.min(minute, 45));
    const duration = differenceInMinutes(dragState.originalEnd, dragState.originalStart);
    const newEnd = addHours(newStart, duration / 60);
    
    // Check for conflicts
    const conflict = checkRoomConflict(roomId, newStart, newEnd, dragState.appointmentId);
    
    if (conflict) {
      toast.error(`Room conflict with ${conflict.patients?.full_name || conflict.title} at ${format(new Date(conflict.start_time), 'h:mm a')}`);
      handleDragEnd();
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          room_id: roomId,
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
        })
        .eq('id', dragState.appointmentId);
      
      if (error) throw error;
      
      toast.success('Appointment moved');
      fetchData();
    } catch (error) {
      console.error('Error moving appointment:', error);
      toast.error('Failed to move appointment');
    }
    
    handleDragEnd();
  };

  const handleCreateAppointment = async () => {
    try {
      const startTime = setMinutes(setHours(newAppt.date, newAppt.start_hour), newAppt.start_minute);
      const endTime = addHours(startTime, newAppt.duration / 60);
      
      // Check for conflicts
      const conflict = checkRoomConflict(newAppt.room_id || null, startTime, endTime);
      if (conflict) {
        setConflictWarning(`Room conflict with ${conflict.patients?.full_name || conflict.title} at ${format(new Date(conflict.start_time), 'h:mm a')}`);
        return;
      }
      
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Create appointments (including recurring if selected)
      const appointmentsToCreate: any[] = [];
      
      if (newAppt.is_recurring) {
        let currentDate = startTime;
        const parentId = crypto.randomUUID();
        
        for (let i = 0; i < newAppt.recurrence_count; i++) {
          const apptStart = i === 0 ? startTime : currentDate;
          const apptEnd = addHours(apptStart, newAppt.duration / 60);
          
          appointmentsToCreate.push({
            id: i === 0 ? parentId : undefined,
            title: newAppt.title || 'Appointment',
            patient_id: newAppt.patient_id || null,
            room_id: newAppt.room_id || null,
            start_time: apptStart.toISOString(),
            end_time: apptEnd.toISOString(),
            status: 'scheduled',
            notes: newAppt.notes || null,
            therapist_id: userId,
            is_recurring: true,
            recurrence_rule: newAppt.recurrence_rule,
            parent_appointment_id: i === 0 ? null : parentId,
          });
          
          // Calculate next occurrence
          switch (newAppt.recurrence_rule) {
            case 'daily':
              currentDate = addDays(currentDate, 1);
              break;
            case 'weekly':
              currentDate = addWeeks(currentDate, 1);
              break;
            case 'biweekly':
              currentDate = addWeeks(currentDate, 2);
              break;
            case 'monthly':
              currentDate = addMonths(currentDate, 1);
              break;
          }
        }
      } else {
        appointmentsToCreate.push({
          title: newAppt.title || 'Appointment',
          patient_id: newAppt.patient_id || null,
          room_id: newAppt.room_id || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'scheduled',
          notes: newAppt.notes || null,
          therapist_id: userId,
        });
      }
      
      const { error } = await supabase.from('appointments').insert(appointmentsToCreate);
      
      if (error) throw error;
      
      toast.success(newAppt.is_recurring 
        ? `Created ${appointmentsToCreate.length} recurring appointments` 
        : 'Appointment created'
      );
      setShowNewAppt(false);
      setConflictWarning(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleDeleteAppointment = async (apptId: string, deleteAll: boolean = false) => {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;
    
    try {
      if (deleteAll && appt.parent_appointment_id) {
        // Delete all in series
        await supabase.from('appointments').delete().eq('parent_appointment_id', appt.parent_appointment_id);
        await supabase.from('appointments').delete().eq('id', appt.parent_appointment_id);
      } else if (deleteAll && appt.is_recurring && !appt.parent_appointment_id) {
        // This is the parent - delete all children too
        await supabase.from('appointments').delete().eq('parent_appointment_id', appt.id);
        await supabase.from('appointments').delete().eq('id', appt.id);
      } else {
        await supabase.from('appointments').delete().eq('id', apptId);
      }
      
      toast.success('Appointment deleted');
      setEditingAppt(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const resetForm = () => {
    setNewAppt({
      title: '',
      patient_id: '',
      room_id: '',
      date: new Date(),
      start_hour: 9,
      start_minute: 0,
      duration: 60,
      notes: '',
      is_recurring: false,
      recurrence_rule: 'weekly',
      recurrence_count: 4,
    });
  };

  const navigateDate = (direction: number) => {
    if (viewMode === 'day') {
      setSelectedDate(addDays(selectedDate, direction));
    } else {
      setSelectedDate(addDays(selectedDate, direction * 7));
    }
  };

  // Render draggable appointment
  const renderAppointment = (appt: Appointment, room?: Room) => {
    const pos = getAppointmentPosition(appt);
    const isDragging = dragState?.appointmentId === appt.id;
    
    return (
      <div
        key={appt.id}
        draggable
        onDragStart={(e) => handleDragStart(e, appt)}
        onDragEnd={handleDragEnd}
        onClick={() => setEditingAppt(appt)}
        className={cn(
          'absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden cursor-grab active:cursor-grabbing transition-all group',
          isDragging && 'opacity-50 scale-95',
          'hover:ring-2 hover:ring-white/50'
        )}
        style={{
          top: `${pos.top % SLOT_HEIGHT}px`,
          height: `${pos.height}px`,
          backgroundColor: room?.color || appt.color || '#3B82F6',
          zIndex: isDragging ? 50 : 10,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate flex items-center gap-1">
              {appt.is_recurring && <Repeat className="h-3 w-3 flex-shrink-0" />}
              {appt.patients?.full_name || appt.title}
            </p>
            {pos.height > 35 && (
              <p className="opacity-80 truncate">
                {format(new Date(appt.start_time), 'h:mm a')}
              </p>
            )}
          </div>
          <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-70 flex-shrink-0" />
        </div>
      </div>
    );
  };

  return (
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

            <Dialog open={showNewAppt} onOpenChange={(open) => { setShowNewAppt(open); if (!open) { resetForm(); setConflictWarning(null); } }}>
              <DialogTrigger asChild>
                <Button className="bg-jade hover:bg-jade/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {conflictWarning && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{conflictWarning}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Patient</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-jade hover:text-jade/80"
                        onClick={() => setShowQuickPatient(!showQuickPatient)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {showQuickPatient ? 'Cancel' : 'New Patient'}
                      </Button>
                    </div>
                    
                    {showQuickPatient ? (
                      <div className="space-y-3 p-3 border border-dashed border-jade/30 rounded-lg bg-jade/5">
                        <div className="space-y-1">
                          <Label className="text-xs">Name *</Label>
                          <Input
                            value={quickPatientName}
                            onChange={(e) => setQuickPatientName(e.target.value)}
                            placeholder="Full name"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Phone *</Label>
                          <Input
                            value={quickPatientPhone}
                            onChange={(e) => setQuickPatientPhone(e.target.value)}
                            placeholder="Phone number"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">ID Number</Label>
                          <Input
                            value={quickPatientIdNumber}
                            onChange={(e) => setQuickPatientIdNumber(e.target.value)}
                            placeholder="ID number (optional)"
                            className="h-9"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full bg-jade hover:bg-jade/90"
                          onClick={handleCreateQuickPatient}
                          disabled={creatingPatient}
                        >
                          {creatingPatient ? 'Creating...' : 'Create & Select'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Search patients..."
                          value={patientSearchFilter}
                          onChange={(e) => setPatientSearchFilter(e.target.value)}
                          className="h-9"
                        />
                        <Select
                          value={newAppt.patient_id}
                          onValueChange={(v) => {
                            const patient = patients.find(p => p.id === v);
                            setNewAppt({ 
                              ...newAppt, 
                              patient_id: v,
                              title: patient?.full_name || newAppt.title 
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients
                              .filter((p) => 
                                p.full_name.toLowerCase().includes(patientSearchFilter.toLowerCase()) ||
                                (p.phone && p.phone.includes(patientSearchFilter))
                              )
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.full_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
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

                  {/* Recurring Options */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={newAppt.is_recurring}
                        onCheckedChange={(checked) => setNewAppt({ ...newAppt, is_recurring: !!checked })}
                      />
                      <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                        <Repeat className="h-4 w-4" />
                        Recurring Appointment
                      </Label>
                    </div>
                    
                    {newAppt.is_recurring && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Repeat</Label>
                          <Select
                            value={newAppt.recurrence_rule}
                            onValueChange={(v) => setNewAppt({ ...newAppt, recurrence_rule: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Occurrences</Label>
                          <Select
                            value={String(newAppt.recurrence_count)}
                            onValueChange={(v) => setNewAppt({ ...newAppt, recurrence_count: parseInt(v) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[2, 3, 4, 6, 8, 10, 12].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n} times</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
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
                    {newAppt.is_recurring ? `Create ${newAppt.recurrence_count} Appointments` : 'Create Appointment'}
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
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
                <span className="text-sm">{room.name}</span>
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-4">
              <GripVertical className="h-3 w-3 inline mr-1" />
              Drag appointments to reschedule
            </span>
          </div>
        )}

        {/* Calendar Grid */}
        <Card className="border-border/50 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="min-w-[800px]" ref={gridRef}>
              {/* Header row */}
              <div className="grid border-b border-border/50 sticky top-0 bg-card z-20" style={{
                gridTemplateColumns: viewMode === 'day'
                  ? `60px repeat(${Math.max(rooms.length, 1)}, 1fr)`
                  : `60px repeat(7, 1fr)`
              }}>
                <div className="p-2 border-r border-border/30" />
                {viewMode === 'day' ? (
                  rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div key={room.id} className="p-3 text-center border-r border-border/30 last:border-r-0">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
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
                    height: `${SLOT_HEIGHT}px`,
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
                          className={cn(
                            'relative border-r border-border/30 last:border-r-0 transition-colors',
                            dragPreview?.roomId === room.id && dragPreview?.hour === hour && 'bg-jade/20'
                          )}
                          onDragOver={(e) => handleDragOver(e, room.id, selectedDate, hour)}
                          onDrop={(e) => handleDrop(e, room.id, selectedDate, hour)}
                        >
                          {getAppointmentsForDayAndRoom(selectedDate, room.id)
                            .filter((a) => new Date(a.start_time).getHours() === hour)
                            .map((appt) => renderAppointment(appt, room))}
                        </div>
                      ))
                    ) : (
                      <div
                        className="relative transition-colors"
                        onDragOver={(e) => handleDragOver(e, null, selectedDate, hour)}
                        onDrop={(e) => handleDrop(e, null, selectedDate, hour)}
                      >
                        {getAppointmentsForDayAndRoom(selectedDate, null)
                          .filter((a) => new Date(a.start_time).getHours() === hour)
                          .map((appt) => renderAppointment(appt))}
                      </div>
                    )
                  ) : (
                    weekDays.map((day) => (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'relative border-r border-border/30 last:border-r-0 transition-colors',
                          isSameDay(day, new Date()) && 'bg-jade/5',
                          dragPreview && isSameDay(dragPreview.day, day) && dragPreview.hour === hour && 'bg-jade/20'
                        )}
                        onDragOver={(e) => handleDragOver(e, null, day, hour)}
                        onDrop={(e) => handleDrop(e, null, day, hour)}
                      >
                        {appointments
                          .filter((a) => {
                            const apptDate = new Date(a.start_time);
                            return isSameDay(apptDate, day) && apptDate.getHours() === hour;
                          })
                          .map((appt) => {
                            const room = rooms.find((r) => r.id === appt.room_id);
                            return renderAppointment(appt, room);
                          })}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Edit Appointment Dialog */}
        <Dialog open={!!editingAppt} onOpenChange={(open) => !open && setEditingAppt(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {editingAppt && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-jade" />
                  </div>
                  <div>
                    <p className="font-medium">{editingAppt.patients?.full_name || editingAppt.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(editingAppt.start_time), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {format(new Date(editingAppt.start_time), 'h:mm a')} - {format(new Date(editingAppt.end_time), 'h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room</p>
                    <p className="font-medium">
                      {rooms.find(r => r.id === editingAppt.room_id)?.name || 'No room assigned'}
                    </p>
                  </div>
                </div>
                
                {editingAppt.is_recurring && (
                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                    <Repeat className="h-3 w-3 mr-1" />
                    Recurring ({editingAppt.recurrence_rule})
                  </Badge>
                )}
                
                {editingAppt.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{editingAppt.notes}</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-3 pt-4">
                  {/* View Patient History - if patient is linked */}
                  {editingAppt.patient_id && (
                    <Button 
                      variant="outline" 
                      className="w-full border-jade/30 text-jade hover:bg-jade/10"
                      onClick={() => {
                        setEditingAppt(null);
                        window.location.href = `/crm/patients/${editingAppt.patient_id}`;
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Patient History & Reports
                    </Button>
                  )}
                  
                  {/* Start Session Button - Prominent */}
                  {timerStatus === 'idle' && (
                    <Button 
                      className="w-full bg-jade hover:bg-jade/90"
                      onClick={() => handleStartSession(editingAppt)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Session
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <Timer className="h-3 w-3 mr-1" />
                        {differenceInMinutes(new Date(editingAppt.end_time), new Date(editingAppt.start_time))} min
                      </Badge>
                    </Button>
                  )}
                  
                  {timerStatus !== 'idle' && (
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Timer already running. Reset it first to start a new session.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {editingAppt.patient_id && editingAppt.patients?.phone && (
                      <WhatsAppReminderButton
                        patientName={editingAppt.patients?.full_name || 'Patient'}
                        patientPhone={editingAppt.patients?.phone}
                        appointmentId={editingAppt.id}
                        appointmentDate={editingAppt.start_time}
                        appointmentTime={format(new Date(editingAppt.start_time), 'HH:mm')}
                        variant="outline"
                        size="default"
                      />
                    )}
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setEditingAppt(null)}
                    >
                      Close
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteAppointment(editingAppt.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    {editingAppt.is_recurring && (
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteAppointment(editingAppt.id, true)}
                      >
                        Delete All
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}

export default function CRMCalendar() {
  return (
    <CRMLayout>
      <CalendarContent />
    </CRMLayout>
  );
}
