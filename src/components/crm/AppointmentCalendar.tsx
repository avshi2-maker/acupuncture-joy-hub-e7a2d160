import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ChevronRight, ChevronLeft, Plus, Clock, User, Trash2, Edit, X, Play, AlertCircle, CheckCircle2, XCircle, HelpCircle, Send } from 'lucide-react';
import { WhatsAppReminderButton } from '@/components/crm/WhatsAppReminderButton';
import { useTier } from '@/hooks/useTier';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Patient {
  id: string;
  full_name: string;
  phone?: string | null;
  consent_signed?: boolean | null;
}

interface AppointmentConfirmation {
  id: string;
  token: string;
  response: string | null;
  responded_at: string | null;
  expires_at: string;
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
  appointment_confirmations?: AppointmentConfirmation[];
}

interface AppointmentCalendarProps {
  userId: string;
  patients: Patient[];
}

type ConfirmationFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'not_sent' | 'expired';

export function AppointmentCalendar({ userId, patients }: AppointmentCalendarProps) {
  const navigate = useNavigate();
  const { tier, daysRemaining } = useTier();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrialExpiredDialog, setShowTrialExpiredDialog] = useState(false);
  const [confirmationFilter, setConfirmationFilter] = useState<ConfirmationFilter>('all');

  // Check if trial is expired
  const isTrialExpired = tier === 'trial' && daysRemaining !== null && daysRemaining <= 0;

  // Determine session type based on tier
  const getSessionType = () => {
    if (tier === 'trial') return 'video';
    if (tier === 'standard') return 'standard';
    if (tier === 'premium') return 'video';
    return null;
  };

  // Check if appointment can start a session
  const canStartSession = (apt: Appointment) => {
    if (!apt.patient_id) return { canStart: false, reason: 'יש לבחור מטופל לתור' };
    
    const patient = patients.find(p => p.id === apt.patient_id);
    if (!patient?.consent_signed) {
      return { canStart: false, reason: 'המטופל לא חתם על הסכמה מודעת' };
    }
    
    return { canStart: true, reason: null };
  };

  // Handle start session
  const handleStartSession = (apt: Appointment) => {
    if (isTrialExpired) {
      setShowTrialExpiredDialog(true);
      return;
    }

    const { canStart, reason } = canStartSession(apt);
    if (!canStart) {
      toast.error(reason || 'לא ניתן להתחיל את הטיפול');
      return;
    }

    const sessionType = getSessionType();
    if (sessionType === 'video') {
      navigate(`/video-session?appointmentId=${apt.id}&patientId=${apt.patient_id}`);
    } else {
      navigate(`/tcm-brain?appointmentId=${apt.id}&patientId=${apt.patient_id}`);
    }
  };

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
      .select('*, appointment_confirmations(*)')
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

  // Get confirmation status for an appointment
  const getConfirmationStatus = (apt: Appointment) => {
    const confirmation = apt.appointment_confirmations?.[0];
    if (!confirmation) {
      return { status: 'not_sent', label: 'לא נשלח', icon: Send, color: 'text-muted-foreground' };
    }
    if (confirmation.response === 'confirmed') {
      return { status: 'confirmed', label: 'אישר הגעה', icon: CheckCircle2, color: 'text-jade' };
    }
    if (confirmation.response === 'cancelled') {
      return { status: 'cancelled', label: 'ביטל', icon: XCircle, color: 'text-destructive' };
    }
    // Token sent but no response yet
    const isExpired = new Date(confirmation.expires_at) < new Date();
    if (isExpired) {
      return { status: 'expired', label: 'פג תוקף', icon: HelpCircle, color: 'text-amber-500' };
    }
    return { status: 'pending', label: 'ממתין לתשובה', icon: HelpCircle, color: 'text-amber-500' };
  };

  // Filter appointments by confirmation status
  const filterByConfirmationStatus = (apts: Appointment[]) => {
    if (confirmationFilter === 'all') return apts;
    return apts.filter(apt => {
      const status = getConfirmationStatus(apt);
      return status.status === confirmationFilter;
    });
  };

  const getAppointmentsForDay = (day: Date) => {
    const dayApts = appointments.filter(apt => isSameDay(new Date(apt.start_time), day));
    return filterByConfirmationStatus(dayApts);
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
    confirmed: 'bg-jade/20 text-jade border border-jade/30 font-medium',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    no_show: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const confirmationFilterOptions: { value: ConfirmationFilter; label: string; icon: typeof CheckCircle2 }[] = [
    { value: 'all', label: 'הכל', icon: Clock },
    { value: 'confirmed', label: 'אישרו', icon: CheckCircle2 },
    { value: 'pending', label: 'ממתינים', icon: HelpCircle },
    { value: 'cancelled', label: 'ביטלו', icon: XCircle },
    { value: 'not_sent', label: 'לא נשלח', icon: Send },
    { value: 'expired', label: 'פג תוקף', icon: AlertCircle },
  ];

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            היום
          </Button>
        </div>
      </div>

      {/* Confirmation Status Filter */}
      <div className="flex flex-wrap gap-2">
        {confirmationFilterOptions.map(option => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={confirmationFilter === option.value ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setConfirmationFilter(option.value)}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </Button>
          );
        })}
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
                    {dayAppointments.slice(0, 3).map(apt => {
                      const confirmStatus = getConfirmationStatus(apt);
                      const ConfirmIcon = confirmStatus.icon;
                      return (
                        <div
                          key={apt.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer flex items-center gap-1 ${statusColors[apt.status] || 'bg-muted'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(apt);
                          }}
                        >
                          <span className="font-medium">{format(new Date(apt.start_time), 'HH:mm')}</span>
                          <span className="mr-1 flex-1 truncate">{apt.title}</span>
                          {apt.patient_id && (
                            <ConfirmIcon className={`h-3 w-3 flex-shrink-0 ${confirmStatus.color}`} />
                          )}
                        </div>
                      );
                    })}
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
          <CardTitle className="text-base flex items-center gap-2">
            תורים להיום
            {confirmationFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">מסונן: {confirmationFilterOptions.find(o => o.value === confirmationFilter)?.label}</Badge>
            )}
            {isTrialExpired && (
              <Badge variant="destructive" className="text-xs">תקופת ניסיון הסתיימה</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getAppointmentsForDay(new Date()).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {confirmationFilter === 'all' ? 'אין תורים להיום' : 'אין תורים התואמים לסינון'}
            </p>
          ) : (
            <div className="space-y-2">
              {getAppointmentsForDay(new Date()).map(apt => {
                const sessionCheck = canStartSession(apt);
                const confirmStatus = getConfirmationStatus(apt);
                const ConfirmIcon = confirmStatus.icon;
                return (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-medium flex items-center gap-2">
                          {apt.title}
                          {/* Confirmation Status Badge */}
                          {apt.patient_id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className={`text-[10px] h-5 gap-1 ${confirmStatus.color} border-current`}>
                                    <ConfirmIcon className="h-3 w-3" />
                                    {confirmStatus.label}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {confirmStatus.status === 'confirmed' && 'המטופל אישר את הגעתו'}
                                    {confirmStatus.status === 'cancelled' && 'המטופל ביטל את התור'}
                                    {confirmStatus.status === 'pending' && 'נשלחה תזכורת, ממתין לתשובה'}
                                    {confirmStatus.status === 'expired' && 'פג תוקף התזכורת ללא תשובה'}
                                    {confirmStatus.status === 'not_sent' && 'טרם נשלחה תזכורת למטופל'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                        </div>
                        {apt.patient_id && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {getPatientName(apt.patient_id)}
                            {!sessionCheck.canStart && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{sessionCheck.reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Start Session Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={sessionCheck.canStart ? "default" : "outline"}
                              size="sm"
                              className={`h-8 gap-1 ${sessionCheck.canStart ? 'bg-jade hover:bg-jade-dark text-white' : 'opacity-60'}`}
                              onClick={() => handleStartSession(apt)}
                            >
                              <Play className="h-3 w-3" />
                              התחל טיפול
                            </Button>
                          </TooltipTrigger>
                          {!sessionCheck.canStart && (
                            <TooltipContent>
                              <p>{sessionCheck.reason}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      
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
                          <SelectItem value="confirmed">מאושר ✅</SelectItem>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trial Expired Dialog */}
      <Dialog open={showTrialExpiredDialog} onOpenChange={setShowTrialExpiredDialog}>
        <DialogContent dir="rtl" className="text-center">
          <DialogHeader>
            <DialogTitle className="text-xl text-center mb-4">תודה שניסיתם את המערכת! 🙏</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              תקופת הניסיון של 14 הימים הסתיימה. אנו מקווים שנהניתם מהשימוש במערכת.
            </p>
            <p className="text-muted-foreground">
              כדי להמשיך ליהנות מכל הפיצ'רים, אנא שדרגו לאחת מהתוכניות שלנו:
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTrialExpiredDialog(false)}
              >
                סגור
              </Button>
              <Button
                className="bg-jade hover:bg-jade-dark text-white"
                onClick={() => {
                  setShowTrialExpiredDialog(false);
                  navigate('/pricing');
                }}
              >
                צפה בתוכניות
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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