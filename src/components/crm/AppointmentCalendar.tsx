import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronRight, ChevronLeft, Plus, Clock, User, Trash2, Edit, X } from 'lucide-react';
import { WhatsAppReminderButton } from '@/components/crm/WhatsAppReminderButton';

interface Patient {
  id: string;
  full_name: string;
  phone?: string | null;
}

interface Appointment {
  id: string;
  therapist_id: string;
  patient_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

interface AppointmentCalendarProps {
  userId: string;
  patients: Patient[];
}

export function AppointmentCalendar({ userId, patients }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    patient_id: '',
    start_time: '',
    end_time: '',
    notes: ''
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    fetchAppointments();
  }, [currentMonth, userId]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      toast.error('שגיאה בטעינת תורים');
    } else {
      setAppointments(data || []);
    }
    setIsLoading(false);
  };

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.start_time), day));
  };

  const handleAddAppointment = async () => {
    if (!form.title || !form.start_time || !form.end_time || !selectedDate) {
      toast.error('יש למלא כותרת ושעות');
      return;
    }

    const startDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${form.start_time}`);
    const endDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${form.end_time}`);

    const { error } = await supabase.from('appointments').insert({
      therapist_id: userId,
      patient_id: form.patient_id || null,
      title: form.title,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      notes: form.notes || null,
      status: 'scheduled'
    });

    if (error) {
      console.error('Error adding appointment:', error);
      toast.error('שגיאה בהוספת תור');
    } else {
      toast.success('תור נוסף בהצלחה');
      setShowAddDialog(false);
      resetForm();
      fetchAppointments();
    }
  };

  const handleEditAppointment = async () => {
    if (!editingAppointment || !form.title || !form.start_time || !form.end_time) {
      toast.error('יש למלא כותרת ושעות');
      return;
    }

    const appointmentDate = new Date(editingAppointment.start_time);
    const startDateTime = new Date(`${format(appointmentDate, 'yyyy-MM-dd')}T${form.start_time}`);
    const endDateTime = new Date(`${format(appointmentDate, 'yyyy-MM-dd')}T${form.end_time}`);

    const { error } = await supabase
      .from('appointments')
      .update({
        patient_id: form.patient_id || null,
        title: form.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: form.notes || null
      })
      .eq('id', editingAppointment.id);

    if (error) {
      console.error('Error updating appointment:', error);
      toast.error('שגיאה בעדכון תור');
    } else {
      toast.success('תור עודכן בהצלחה');
      setShowEditDialog(false);
      setEditingAppointment(null);
      resetForm();
      fetchAppointments();
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('האם למחוק את התור?')) return;

    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      toast.error('שגיאה במחיקת תור');
    } else {
      toast.success('תור נמחק');
      fetchAppointments();
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('שגיאה בעדכון סטטוס');
    } else {
      fetchAppointments();
    }
  };

  const openAddDialog = (date: Date) => {
    setSelectedDate(date);
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (apt: Appointment) => {
    setEditingAppointment(apt);
    setForm({
      title: apt.title,
      patient_id: apt.patient_id || '',
      start_time: format(new Date(apt.start_time), 'HH:mm'),
      end_time: format(new Date(apt.end_time), 'HH:mm'),
      notes: apt.notes || ''
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setForm({ title: '', patient_id: '', start_time: '09:00', end_time: '10:00', notes: '' });
  };

  const getPatientName = (patientId: string | null) => {
    if (!patientId) return null;
    return patients.find(p => p.id === patientId)?.full_name;
  };

  const getPatientPhone = (patientId: string | null) => {
    if (!patientId) return null;
    return patients.find(p => p.id === patientId)?.phone || null;
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    no_show: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: he })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
          היום
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-2">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-1 border rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${
                    !isCurrentMonth ? 'bg-muted/30 opacity-50' : ''
                  } ${isToday(day) ? 'border-primary border-2' : 'border-border'}`}
                  onClick={() => openAddDialog(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div
                        key={apt.id}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${statusColors[apt.status] || 'bg-muted'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(apt);
                        }}
                      >
                        <span className="font-medium">{format(new Date(apt.start_time), 'HH:mm')}</span>
                        <span className="mr-1">{apt.title}</span>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayAppointments.length - 3} עוד
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">תורים להיום</CardTitle>
        </CardHeader>
        <CardContent>
          {getAppointmentsForDay(new Date()).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">אין תורים להיום</p>
          ) : (
            <div className="space-y-2">
              {getAppointmentsForDay(new Date()).map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium">{apt.title}</div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                      </div>
                      {apt.patient_id && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {getPatientName(apt.patient_id)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.patient_id && (
                      <WhatsAppReminderButton
                        patientName={getPatientName(apt.patient_id) || 'Patient'}
                        patientPhone={getPatientPhone(apt.patient_id)}
                        appointmentId={apt.id}
                        appointmentDate={apt.start_time}
                        appointmentTime={format(new Date(apt.start_time), 'HH:mm')}
                      />
                    )}
                    <Select value={apt.status} onValueChange={(v) => handleStatusChange(apt.id, v)}>
                      <SelectTrigger className="h-7 text-xs w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">מתוכנן</SelectItem>
                        <SelectItem value="completed">הושלם</SelectItem>
                        <SelectItem value="cancelled">בוטל</SelectItem>
                        <SelectItem value="no_show">לא הגיע</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(apt)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              הוספת תור - {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>כותרת *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="לדוגמא: טיפול דיקור"
                className="text-right"
              />
            </div>
            <div className="grid gap-2">
              <Label>מטופל</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטופל (אופציונלי)" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>שעת התחלה *</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>שעת סיום *</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>הערות</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="text-right"
              />
            </div>
            <Button onClick={handleAddAppointment} className="w-full">
              הוסף תור
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">עריכת תור</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>כותרת *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="grid gap-2">
              <Label>מטופל</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטופל (אופציונלי)" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>שעת התחלה *</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>שעת סיום *</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>הערות</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditAppointment} className="flex-1">
                שמור שינויים
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => editingAppointment && handleDeleteAppointment(editingAppointment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}