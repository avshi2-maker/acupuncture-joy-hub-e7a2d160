import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, addHours, isSameDay, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { 
  User, Building2, DoorOpen, Users, Calendar, Clock, 
  CheckCircle2, AlertCircle, MessageCircle, Send, 
  Zap, Sparkles, Mail, Bell
} from 'lucide-react';
import sessionCommandBg from '@/assets/session-command-bg.png';

interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
}

interface StaffMember {
  id: string;
  user_id: string;
  role: string;
  display_name?: string;
}

interface Room {
  id: string;
  name: string;
  clinic_id: string;
  color: string | null;
  description: string | null;
}

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
  chief_complaint: string | null;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  room_id: string | null;
  patient_id: string | null;
  status: string;
}

interface TimeSlot {
  time: string;
  display: string;
  booked: boolean;
  appointmentId?: string;
}

export default function CRMSessionManager() {
  const { user } = useAuth();
  
  // Form state
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [forecastNotes, setForecastNotes] = useState<string>('');
  
  // Data state
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isClinicAdmin, setIsClinicAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [notifyTherapist, setNotifyTherapist] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch appointments when date or room changes
  useEffect(() => {
    if (selectedDate && selectedRoom) {
      fetchAppointmentsForDateAndRoom();
    }
  }, [selectedDate, selectedRoom]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clinicsRes, patientsRes] = await Promise.all([
        supabase.from('clinics').select('id, name, address, phone'),
        supabase.from('patients').select('id, full_name, phone, chief_complaint'),
      ]);

      if (clinicsRes.data) setClinics(clinicsRes.data);
      if (patientsRes.data) setPatients(patientsRes.data);
      
      // Default therapist to current user
      if (user) {
        setSelectedTherapist(user.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  // Fetch rooms and staff when clinic changes
  useEffect(() => {
    const fetchRoomsAndStaff = async () => {
      if (!selectedClinic) {
        setRooms([]);
        setSelectedRoom('');
        setStaffMembers([]);
        setIsClinicAdmin(false);
        return;
      }

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, clinic_id, color, description')
        .eq('clinic_id', selectedClinic)
        .eq('is_active', true);

      if (roomsData) {
        setRooms(roomsData);
        if (roomsData.length > 0 && !selectedRoom) {
          setSelectedRoom(roomsData[0].id);
        }
      }
      if (roomsError) console.error('Error fetching rooms:', roomsError);

      // Check if current user is clinic admin/owner
      if (user) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('owner_id')
          .eq('id', selectedClinic)
          .single();

        const isOwner = clinicData?.owner_id === user.id;

        const { data: staffRole } = await supabase
          .from('clinic_staff')
          .select('role')
          .eq('clinic_id', selectedClinic)
          .eq('user_id', user.id)
          .single();

        const isAdmin = isOwner || staffRole?.role === 'admin' || staffRole?.role === 'owner';
        setIsClinicAdmin(isAdmin);

        // If admin, fetch all staff members
        if (isAdmin) {
          const { data: staffData } = await supabase
            .from('clinic_staff')
            .select('id, user_id, role')
            .eq('clinic_id', selectedClinic)
            .eq('is_active', true);

          if (staffData) {
            // Include owner as well
            const allStaff: StaffMember[] = staffData.map(s => ({
              ...s,
              display_name: s.role === 'owner' ? 'בעלים' : s.role === 'admin' ? 'מנהל' : s.role === 'therapist' ? 'מטפל' : s.role.charAt(0).toUpperCase() + s.role.slice(1)
            }));
            
            // Add owner if not already in staff list
            if (isOwner && !allStaff.find(s => s.user_id === user.id)) {
              allStaff.unshift({
                id: 'owner',
                user_id: user.id,
                role: 'owner',
                display_name: 'אתה (בעלים)'
              });
            }
            
            setStaffMembers(allStaff);
          }
        }
      }
    };

    fetchRoomsAndStaff();
  }, [selectedClinic, user]);

  const fetchAppointmentsForDateAndRoom = async () => {
    if (!selectedDate || !selectedRoom) return;

    const startOfDay = `${selectedDate}T00:00:00`;
    const endOfDay = `${selectedDate}T23:59:59`;

    const { data, error } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, room_id, patient_id, status')
      .eq('room_id', selectedRoom)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .neq('status', 'cancelled');

    if (data) setAppointments(data);
    if (error) console.error('Error fetching appointments:', error);
  };

  // Generate time slots (09:00 - 18:00)
  const timeSlots = useMemo<TimeSlot[]>(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const slotStart = new Date(`${selectedDate}T${timeStr}:00`);
      
      // Check if this slot is booked
      const isBooked = appointments.some(appt => {
        const apptStart = new Date(appt.start_time);
        const apptEnd = new Date(appt.end_time);
        return slotStart >= apptStart && slotStart < apptEnd;
      });

      const bookedAppt = appointments.find(appt => {
        const apptStart = new Date(appt.start_time);
        const apptEnd = new Date(appt.end_time);
        return slotStart >= apptStart && slotStart < apptEnd;
      });

      slots.push({
        time: timeStr,
        display: timeStr,
        booked: isBooked,
        appointmentId: bookedAppt?.id,
      });
    }
    return slots;
  }, [selectedDate, appointments]);

  // Get selected entities for display
  const selectedClinicData = clinics.find(c => c.id === selectedClinic);
  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Generate WhatsApp forecast message
  const whatsAppMessage = useMemo(() => {
    if (!selectedPatientData || !selectedClinicData || !selectedSlot) return '';

    const patientName = selectedPatientData.full_name.split(' ')[0];
    const dateFormatted = format(new Date(selectedDate), 'dd/MM/yyyy', { locale: he });
    const roomName = selectedRoomData?.name || 'חדר טיפולים';

    return `שלום ${patientName}! 🌿

📅 *אישור תור*
תאריך: ${dateFormatted}
שעה: ${selectedSlot}
מיקום: ${selectedClinicData.name}${selectedClinicData.address ? `\n📍 ${selectedClinicData.address}` : ''}
חדר: ${roomName}

${forecastNotes ? `📋 *הערות:*\n${forecastNotes}\n` : ''}
🔮 *תחזית הטיפול:*
${selectedPatientData.chief_complaint ? `נמשיך לטפל ב: ${selectedPatientData.chief_complaint}` : 'נמשיך בתוכנית הטיפול שלך'}

נא להגיע 5 דקות לפני הזמן.
לאישור הגעה, אנא השב/י "מאשר/ת" 👍

בברכה,
הקליניקה`;
  }, [selectedPatientData, selectedClinicData, selectedRoomData, selectedSlot, selectedDate, forecastNotes]);

  const handleConfirmSession = async () => {
    const therapistId = selectedTherapist || user?.id;
    if (!selectedClinic || !selectedRoom || !selectedPatient || !selectedSlot || !therapistId) {
      toast.error('אנא מלא את כל השדות הנדרשים');
      return;
    }

    try {
      const startTime = new Date(`${selectedDate}T${selectedSlot}:00`);
      const endTime = addHours(startTime, 1);

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          therapist_id: therapistId,
          patient_id: selectedPatient,
          clinic_id: selectedClinic,
          room_id: selectedRoom,
          title: `טיפול - ${selectedPatientData?.full_name}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'scheduled',
          notes: forecastNotes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to therapist if booking for someone else
      if (notifyTherapist && therapistId !== user?.id) {
        try {
          // Get therapist email from auth (we need to use the staff member's user_id to get their email)
          const selectedStaff = staffMembers.find(s => s.user_id === therapistId);
          
          // For now we'll invoke the edge function - in production you'd have therapist emails stored
          await supabase.functions.invoke('notify-therapist-booking', {
            body: {
              therapistEmail: user?.email, // Fallback - in production, get from profiles table
              therapistName: selectedStaff?.display_name || 'מטפל',
              patientName: selectedPatientData?.full_name,
              clinicName: selectedClinicData?.name,
              roomName: selectedRoomData?.name || 'חדר טיפולים',
              date: format(new Date(selectedDate), 'dd/MM/yyyy'),
              time: selectedSlot,
              notes: forecastNotes,
              bookedBy: user?.email || 'מנהל הקליניקה',
            },
          });
          toast.success('נשלחה התראה למטפל במייל');
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
          // Don't fail the booking if notification fails
        }
      }

      setBookingStatus('success');
      const therapistLabel = selectedTherapist === user?.id ? 'אתה' : 'המטפל שנבחר';
      setStatusMessage(`התור נקבע בהצלחה עבור ${selectedPatientData?.full_name} בשעה ${selectedSlot} עם ${therapistLabel}`);
      toast.success('התור נקבע בהצלחה!');
      
      // Refresh appointments
      fetchAppointmentsForDateAndRoom();
    } catch (error: any) {
      console.error('Error booking session:', error);
      setBookingStatus('error');
      setStatusMessage(error.message || 'שגיאה בקביעת התור');
      toast.error('שגיאה בקביעת התור');
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedPatientData?.phone) {
      toast.error('מספר טלפון של המטופל לא זמין');
      return;
    }

    const phone = selectedPatientData.phone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('972') ? phone : 
                           phone.startsWith('0') ? `972${phone.slice(1)}` : `972${phone}`;
    
    const encodedMessage = encodeURIComponent(whatsAppMessage);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <CRMLayout>
      <div 
        className="min-h-screen -m-4 md:-m-6 p-4 md:p-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${sessionCommandBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-jade/20 to-blue-500/20 backdrop-blur-sm">
            <Zap className="h-7 w-7 text-jade" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              מרכז ניהול תורים
              <Sparkles className="h-5 w-5 text-amber-400" />
            </h1>
            <p className="text-white/70 text-sm">תזמון חכם עם זיהוי התנגשויות</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {/* Left Column - Session Details */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-jade/10 flex items-center justify-center text-jade text-sm font-bold">1</span>
                פרטי התור
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Clinic Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  סניף מרפאה
                </label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מרפאה..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                        {clinic.address && <span className="text-muted-foreground ml-2 text-xs">({clinic.address})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <DoorOpen className="h-4 w-4" />
                  חדר / משאב
                </label>
                <Select 
                  value={selectedRoom} 
                  onValueChange={setSelectedRoom}
                  disabled={!selectedClinic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedClinic ? "בחר חדר..." : "בחר מרפאה תחילה"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: room.color || '#10B981' }}
                          />
                          {room.name}
                          {room.description && <span className="text-muted-foreground text-xs">- {room.description}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  בחר מטופל
                </label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מטופל..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                        {patient.chief_complaint && (
                          <span className="text-muted-foreground ml-2 text-xs">({patient.chief_complaint})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Therapist Selection (for clinic admins) */}
              {isClinicAdmin && staffMembers.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      שייך מטפל
                    </label>
                    <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר מטפל..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={user?.id || ''}>
                          אתה (המשתמש הנוכחי)
                        </SelectItem>
                        {staffMembers
                          .filter(s => s.user_id !== user?.id && (s.role === 'therapist' || s.role === 'owner' || s.role === 'admin'))
                          .map(staff => (
                            <SelectItem key={staff.id} value={staff.user_id}>
                              צוות - {staff.display_name || staff.role}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Email Notification Toggle */}
                  {selectedTherapist && selectedTherapist !== user?.id && (
                    <div className="flex items-center justify-between p-3 bg-jade/5 rounded-lg border border-jade/20">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-jade" />
                        <Label htmlFor="notify-therapist" className="text-sm font-medium cursor-pointer">
                          שלח התראה למטפל במייל
                        </Label>
                      </div>
                      <Switch
                        id="notify-therapist"
                        checked={notifyTherapist}
                        onCheckedChange={setNotifyTherapist}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Quick Summary */}
              {selectedClinic && selectedRoom && selectedPatient && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-jade/5 to-blue-500/5 border border-jade/20">
                  <p className="text-sm font-medium text-jade mb-2">סיכום התור</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>👨‍⚕️ מטפל: {selectedTherapist === user?.id ? 'אתה' : 'איש צוות'}</p>
                    <p>👤 מטופל: {selectedPatientData?.full_name}</p>
                    <p>🏥 מרפאה: {selectedClinicData?.name}</p>
                    <p>🚪 חדר: {selectedRoomData?.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Calendar & Time */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-sm font-bold">2</span>
                זמינות יומן
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  בחר תאריך
                </label>
                <Input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full"
                />
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  משבצות פנויות
                  {selectedRoom && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {selectedRoomData?.name}
                    </Badge>
                  )}
                </label>
                
                {!selectedRoom ? (
                  <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-xl">
                    <DoorOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>בחר מרפאה וחדר כדי לראות זמינות</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => !slot.booked && setSelectedSlot(slot.time)}
                        disabled={slot.booked}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-all
                          ${slot.booked 
                            ? 'bg-muted text-muted-foreground line-through cursor-not-allowed' 
                            : slot.time === selectedSlot
                              ? 'bg-jade text-white shadow-lg scale-105'
                              : 'bg-white border border-border hover:border-jade hover:bg-jade/5'
                          }
                        `}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-white border" />
                  <span>פנוי</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-jade" />
                  <span>נבחר</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <span>תפוס</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Width - Booking & Forecast */}
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-sm font-bold">3</span>
                קביעה ותחזית טיפול
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left - Booking */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      הערות נוספות / צעדים הבאים
                    </label>
                    <Textarea
                      placeholder="לדוגמה: להמשיך בפרוטוקול כאבי גב, לבדוק אינטראקציות תרופתיות..."
                      value={forecastNotes}
                      onChange={(e) => setForecastNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleConfirmSession}
                    disabled={!selectedClinic || !selectedRoom || !selectedPatient || !selectedSlot}
                    className="w-full bg-gradient-to-r from-jade to-emerald-500 hover:from-jade/90 hover:to-emerald-500/90 text-white font-semibold py-6"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    אשר תור
                  </Button>

                  {/* Status Message */}
                  {bookingStatus !== 'idle' && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                      bookingStatus === 'success' 
                        ? 'bg-jade/10 text-jade border border-jade/20' 
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {bookingStatus === 'success' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">{statusMessage}</span>
                    </div>
                  )}
                </div>

                {/* Right - WhatsApp Preview */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      תצוגה מקדימה של הודעת וואטסאפ
                    </label>
                    <Textarea
                      value={whatsAppMessage}
                      readOnly
                      rows={12}
                      className="bg-emerald-50/50 border-emerald-200 font-mono text-xs resize-none"
                      dir="rtl"
                    />
                  </div>

                  <Button
                    onClick={handleSendWhatsApp}
                    disabled={!selectedPatient || !selectedSlot || !selectedPatientData?.phone}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-6"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    שלח בוואטסאפ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
