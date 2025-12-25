import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTier } from '@/hooks/useTier';
import { useAuth } from '@/hooks/useAuth';
import { TierBadge } from '@/components/layout/TierBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowRight, 
  LogOut,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  X,
  ChevronLeft
} from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  medical_history: string | null;
  allergies: string | null;
  medications: string | null;
  notes: string | null;
  created_at: string;
}

interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint: string | null;
  tongue_diagnosis: string | null;
  pulse_diagnosis: string | null;
  tcm_pattern: string | null;
  treatment_principle: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
  cupping: boolean;
  moxa: boolean;
  other_techniques: string | null;
  notes: string | null;
  follow_up_recommended: string | null;
}

interface FollowUp {
  id: string;
  patient_id: string;
  scheduled_date: string;
  reason: string | null;
  status: string;
  notes: string | null;
  completed_at: string | null;
}

export default function CRM() {
  const navigate = useNavigate();
  const { tier, hasFeature } = useTier();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showEditVisit, setShowEditVisit] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);

  // Form states
  const [patientForm, setPatientForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    medical_history: '',
    allergies: '',
    medications: '',
    notes: ''
  });

  const [visitForm, setVisitForm] = useState({
    chief_complaint: '',
    tongue_diagnosis: '',
    pulse_diagnosis: '',
    tcm_pattern: '',
    treatment_principle: '',
    points_used: '',
    herbs_prescribed: '',
    cupping: false,
    moxa: false,
    other_techniques: '',
    notes: '',
    follow_up_recommended: ''
  });

  const [followUpForm, setFollowUpForm] = useState({
    scheduled_date: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    }
  }, [tier, navigate]);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchVisits(selectedPatient.id);
      fetchFollowUps(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients:', error);
      toast.error('שגיאה בטעינת מטופלים');
    } else {
      setPatients(data || []);
    }
    setIsLoading(false);
  };

  const fetchVisits = async (patientId: string) => {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching visits:', error);
    } else {
      setVisits(data || []);
    }
  };

  const fetchFollowUps = async (patientId: string) => {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching follow-ups:', error);
    } else {
      setFollowUps(data || []);
    }
  };

  const handleAddPatient = async () => {
    if (!user || !patientForm.full_name.trim()) {
      toast.error('יש להזין שם מלא');
      return;
    }

    const { error } = await supabase.from('patients').insert({
      therapist_id: user.id,
      full_name: patientForm.full_name,
      phone: patientForm.phone || null,
      email: patientForm.email || null,
      date_of_birth: patientForm.date_of_birth || null,
      gender: patientForm.gender || null,
      address: patientForm.address || null,
      emergency_contact: patientForm.emergency_contact || null,
      emergency_phone: patientForm.emergency_phone || null,
      medical_history: patientForm.medical_history || null,
      allergies: patientForm.allergies || null,
      medications: patientForm.medications || null,
      notes: patientForm.notes || null
    });

    if (error) {
      console.error('Error adding patient:', error);
      toast.error('שגיאה בהוספת מטופל');
    } else {
      toast.success('מטופל נוסף בהצלחה');
      setShowAddPatient(false);
      setPatientForm({
        full_name: '', phone: '', email: '', date_of_birth: '', gender: '',
        address: '', emergency_contact: '', emergency_phone: '',
        medical_history: '', allergies: '', medications: '', notes: ''
      });
      fetchPatients();
    }
  };

  const handleEditPatient = async () => {
    if (!user || !selectedPatient || !patientForm.full_name.trim()) {
      toast.error('יש להזין שם מלא');
      return;
    }

    const { error } = await supabase
      .from('patients')
      .update({
        full_name: patientForm.full_name,
        phone: patientForm.phone || null,
        email: patientForm.email || null,
        date_of_birth: patientForm.date_of_birth || null,
        gender: patientForm.gender || null,
        address: patientForm.address || null,
        emergency_contact: patientForm.emergency_contact || null,
        emergency_phone: patientForm.emergency_phone || null,
        medical_history: patientForm.medical_history || null,
        allergies: patientForm.allergies || null,
        medications: patientForm.medications || null,
        notes: patientForm.notes || null
      })
      .eq('id', selectedPatient.id);

    if (error) {
      console.error('Error updating patient:', error);
      toast.error('שגיאה בעדכון מטופל');
    } else {
      toast.success('מטופל עודכן בהצלחה');
      setShowEditPatient(false);
      fetchPatients();
      // Update selectedPatient with new data
      setSelectedPatient({
        ...selectedPatient,
        full_name: patientForm.full_name,
        phone: patientForm.phone || null,
        email: patientForm.email || null,
        date_of_birth: patientForm.date_of_birth || null,
        gender: patientForm.gender || null,
        address: patientForm.address || null,
        emergency_contact: patientForm.emergency_contact || null,
        emergency_phone: patientForm.emergency_phone || null,
        medical_history: patientForm.medical_history || null,
        allergies: patientForm.allergies || null,
        medications: patientForm.medications || null,
        notes: patientForm.notes || null
      });
    }
  };

  const openEditPatient = () => {
    if (!selectedPatient) return;
    setPatientForm({
      full_name: selectedPatient.full_name,
      phone: selectedPatient.phone || '',
      email: selectedPatient.email || '',
      date_of_birth: selectedPatient.date_of_birth || '',
      gender: selectedPatient.gender || '',
      address: selectedPatient.address || '',
      emergency_contact: selectedPatient.emergency_contact || '',
      emergency_phone: selectedPatient.emergency_phone || '',
      medical_history: selectedPatient.medical_history || '',
      allergies: selectedPatient.allergies || '',
      medications: selectedPatient.medications || '',
      notes: selectedPatient.notes || ''
    });
    setShowEditPatient(true);
  };

  const handleAddVisit = async () => {
    if (!user || !selectedPatient) return;

    const { error } = await supabase.from('visits').insert({
      patient_id: selectedPatient.id,
      therapist_id: user.id,
      chief_complaint: visitForm.chief_complaint || null,
      tongue_diagnosis: visitForm.tongue_diagnosis || null,
      pulse_diagnosis: visitForm.pulse_diagnosis || null,
      tcm_pattern: visitForm.tcm_pattern || null,
      treatment_principle: visitForm.treatment_principle || null,
      points_used: visitForm.points_used ? visitForm.points_used.split(',').map(p => p.trim()) : null,
      herbs_prescribed: visitForm.herbs_prescribed || null,
      cupping: visitForm.cupping,
      moxa: visitForm.moxa,
      other_techniques: visitForm.other_techniques || null,
      notes: visitForm.notes || null,
      follow_up_recommended: visitForm.follow_up_recommended || null
    });

    if (error) {
      console.error('Error adding visit:', error);
      toast.error('שגיאה בהוספת ביקור');
    } else {
      toast.success('ביקור נוסף בהצלחה');
      setShowAddVisit(false);
      setVisitForm({
        chief_complaint: '', tongue_diagnosis: '', pulse_diagnosis: '',
        tcm_pattern: '', treatment_principle: '', points_used: '',
        herbs_prescribed: '', cupping: false, moxa: false,
        other_techniques: '', notes: '', follow_up_recommended: ''
      });
      fetchVisits(selectedPatient.id);
    }
  };

  const handleEditVisit = async () => {
    if (!user || !selectedPatient || !editingVisit) return;

    const { error } = await supabase
      .from('visits')
      .update({
        chief_complaint: visitForm.chief_complaint || null,
        tongue_diagnosis: visitForm.tongue_diagnosis || null,
        pulse_diagnosis: visitForm.pulse_diagnosis || null,
        tcm_pattern: visitForm.tcm_pattern || null,
        treatment_principle: visitForm.treatment_principle || null,
        points_used: visitForm.points_used ? visitForm.points_used.split(',').map(p => p.trim()) : null,
        herbs_prescribed: visitForm.herbs_prescribed || null,
        cupping: visitForm.cupping,
        moxa: visitForm.moxa,
        other_techniques: visitForm.other_techniques || null,
        notes: visitForm.notes || null,
        follow_up_recommended: visitForm.follow_up_recommended || null
      })
      .eq('id', editingVisit.id);

    if (error) {
      console.error('Error updating visit:', error);
      toast.error('שגיאה בעדכון ביקור');
    } else {
      toast.success('ביקור עודכן בהצלחה');
      setShowEditVisit(false);
      setEditingVisit(null);
      setVisitForm({
        chief_complaint: '', tongue_diagnosis: '', pulse_diagnosis: '',
        tcm_pattern: '', treatment_principle: '', points_used: '',
        herbs_prescribed: '', cupping: false, moxa: false,
        other_techniques: '', notes: '', follow_up_recommended: ''
      });
      fetchVisits(selectedPatient.id);
    }
  };

  const openEditVisit = (visit: Visit) => {
    setEditingVisit(visit);
    setVisitForm({
      chief_complaint: visit.chief_complaint || '',
      tongue_diagnosis: visit.tongue_diagnosis || '',
      pulse_diagnosis: visit.pulse_diagnosis || '',
      tcm_pattern: visit.tcm_pattern || '',
      treatment_principle: visit.treatment_principle || '',
      points_used: visit.points_used?.join(', ') || '',
      herbs_prescribed: visit.herbs_prescribed || '',
      cupping: visit.cupping,
      moxa: visit.moxa,
      other_techniques: visit.other_techniques || '',
      notes: visit.notes || '',
      follow_up_recommended: visit.follow_up_recommended || ''
    });
    setShowEditVisit(true);
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm('האם למחוק את הביקור? פעולה זו לא ניתנת לביטול.')) return;

    const { error } = await supabase.from('visits').delete().eq('id', visitId);

    if (error) {
      toast.error('שגיאה במחיקת ביקור');
    } else {
      toast.success('ביקור נמחק');
      if (selectedPatient) fetchVisits(selectedPatient.id);
    }
  };

  const handleAddFollowUp = async () => {
    if (!user || !selectedPatient || !followUpForm.scheduled_date) {
      toast.error('יש לבחור תאריך');
      return;
    }

    const { error } = await supabase.from('follow_ups').insert({
      patient_id: selectedPatient.id,
      therapist_id: user.id,
      scheduled_date: followUpForm.scheduled_date,
      reason: followUpForm.reason || null,
      notes: followUpForm.notes || null,
      status: 'pending'
    });

    if (error) {
      console.error('Error adding follow-up:', error);
      toast.error('שגיאה בהוספת מעקב');
    } else {
      toast.success('מעקב נוסף בהצלחה');
      setShowAddFollowUp(false);
      setFollowUpForm({ scheduled_date: '', reason: '', notes: '' });
      fetchFollowUps(selectedPatient.id);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    const { error } = await supabase
      .from('follow_ups')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', followUpId);

    if (error) {
      toast.error('שגיאה בעדכון מעקב');
    } else {
      toast.success('מעקב הושלם');
      if (selectedPatient) fetchFollowUps(selectedPatient.id);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('האם למחוק את המטופל? פעולה זו לא ניתנת לביטול.')) return;

    const { error } = await supabase.from('patients').delete().eq('id', patientId);

    if (error) {
      toast.error('שגיאה במחיקת מטופל');
    } else {
      toast.success('מטופל נמחק');
      setSelectedPatient(null);
      fetchPatients();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!tier || !hasFeature('crm')) return null;

  return (
    <>
      <Helmet>
        <title>CRM | TCM Clinic</title>
        <meta name="description" content="ניהול מטופלים ומעקב טיפולים" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">חזרה</span>
              </Link>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-jade-light rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-jade" />
                </div>
                <span className="font-display text-lg">CRM מטופלים</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TierBadge />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex max-w-6xl mx-auto w-full">
          {/* Patient List Sidebar */}
          <div className={`${selectedPatient ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-l border-border bg-card`}>
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חיפוש מטופל..."
                    className="pr-9 text-right"
                    dir="rtl"
                  />
                </div>
                <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
                  <DialogTrigger asChild>
                    <Button size="icon" className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-right">הוספת מטופל חדש</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label className="text-right">שם מלא *</Label>
                        <Input
                          value={patientForm.full_name}
                          onChange={(e) => setPatientForm({...patientForm, full_name: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">טלפון</Label>
                          <Input
                            value={patientForm.phone}
                            onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
                            dir="ltr"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">אימייל</Label>
                          <Input
                            type="email"
                            value={patientForm.email}
                            onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">תאריך לידה</Label>
                          <Input
                            type="date"
                            value={patientForm.date_of_birth}
                            onChange={(e) => setPatientForm({...patientForm, date_of_birth: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">מין</Label>
                          <Select value={patientForm.gender} onValueChange={(v) => setPatientForm({...patientForm, gender: v})}>
                            <SelectTrigger dir="rtl">
                              <SelectValue placeholder="בחר..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card" dir="rtl">
                              <SelectItem value="male">זכר</SelectItem>
                              <SelectItem value="female">נקבה</SelectItem>
                              <SelectItem value="other">אחר</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-right">כתובת</Label>
                        <Input
                          value={patientForm.address}
                          onChange={(e) => setPatientForm({...patientForm, address: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">איש קשר לחירום</Label>
                          <Input
                            value={patientForm.emergency_contact}
                            onChange={(e) => setPatientForm({...patientForm, emergency_contact: e.target.value})}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">טלפון חירום</Label>
                          <Input
                            value={patientForm.emergency_phone}
                            onChange={(e) => setPatientForm({...patientForm, emergency_phone: e.target.value})}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-right">היסטוריה רפואית</Label>
                        <Textarea
                          value={patientForm.medical_history}
                          onChange={(e) => setPatientForm({...patientForm, medical_history: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">אלרגיות</Label>
                          <Input
                            value={patientForm.allergies}
                            onChange={(e) => setPatientForm({...patientForm, allergies: e.target.value})}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">תרופות</Label>
                          <Input
                            value={patientForm.medications}
                            onChange={(e) => setPatientForm({...patientForm, medications: e.target.value})}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-right">הערות</Label>
                        <Textarea
                          value={patientForm.notes}
                          onChange={(e) => setPatientForm({...patientForm, notes: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <Button onClick={handleAddPatient} className="w-full">
                        הוסף מטופל
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">טוען...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">אין מטופלים</p>
                  <p className="text-sm text-muted-foreground">לחצו + להוספת מטופל חדש</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full p-4 text-right hover:bg-muted/50 transition-colors ${
                        selectedPatient?.id === patient.id ? 'bg-jade-light/20 border-r-2 border-jade' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-jade" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{patient.full_name}</p>
                          {patient.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Patient Detail */}
          <div className={`${selectedPatient ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-background`}>
            {selectedPatient ? (
              <>
                {/* Patient Header */}
                <div className="p-4 border-b border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedPatient(null)}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div className="w-12 h-12 bg-jade-light rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-jade" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl">{selectedPatient.full_name}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {selectedPatient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedPatient.phone}
                            </span>
                          )}
                          {selectedPatient.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedPatient.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={openEditPatient}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeletePatient(selectedPatient.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Edit Patient Dialog */}
                <Dialog open={showEditPatient} onOpenChange={setShowEditPatient}>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-right">עריכת מטופל</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label className="text-right">שם מלא *</Label>
                        <Input
                          value={patientForm.full_name}
                          onChange={(e) => setPatientForm({...patientForm, full_name: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">טלפון</Label>
                          <Input
                            value={patientForm.phone}
                            onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
                            dir="ltr"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">אימייל</Label>
                          <Input
                            type="email"
                            value={patientForm.email}
                            onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">תאריך לידה</Label>
                          <Input
                            type="date"
                            value={patientForm.date_of_birth}
                            onChange={(e) => setPatientForm({...patientForm, date_of_birth: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">מין</Label>
                          <Select value={patientForm.gender} onValueChange={(v) => setPatientForm({...patientForm, gender: v})}>
                            <SelectTrigger dir="rtl">
                              <SelectValue placeholder="בחר..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card" dir="rtl">
                              <SelectItem value="male">זכר</SelectItem>
                              <SelectItem value="female">נקבה</SelectItem>
                              <SelectItem value="other">אחר</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-right">כתובת</Label>
                        <Input
                          value={patientForm.address}
                          onChange={(e) => setPatientForm({...patientForm, address: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">איש קשר לחירום</Label>
                          <Input
                            value={patientForm.emergency_contact}
                            onChange={(e) => setPatientForm({...patientForm, emergency_contact: e.target.value})}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">טלפון חירום</Label>
                          <Input
                            value={patientForm.emergency_phone}
                            onChange={(e) => setPatientForm({...patientForm, emergency_phone: e.target.value})}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-right">היסטוריה רפואית</Label>
                        <Textarea
                          value={patientForm.medical_history}
                          onChange={(e) => setPatientForm({...patientForm, medical_history: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-right">אלרגיות</Label>
                          <Input
                            value={patientForm.allergies}
                            onChange={(e) => setPatientForm({...patientForm, allergies: e.target.value})}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-right">תרופות</Label>
                          <Input
                            value={patientForm.medications}
                            onChange={(e) => setPatientForm({...patientForm, medications: e.target.value})}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-right">הערות</Label>
                        <Textarea
                          value={patientForm.notes}
                          onChange={(e) => setPatientForm({...patientForm, notes: e.target.value})}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <Button onClick={handleEditPatient} className="w-full">
                        שמור שינויים
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Patient Tabs */}
                <Tabs defaultValue="info" className="flex-1 flex flex-col">
                  <div className="px-4 pt-2 border-b border-border bg-card">
                    <TabsList>
                      <TabsTrigger value="info" className="gap-1">
                        <FileText className="h-3 w-3" />
                        פרטים
                      </TabsTrigger>
                      <TabsTrigger value="visits" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        ביקורים ({visits.length})
                      </TabsTrigger>
                      <TabsTrigger value="followups" className="gap-1">
                        <Clock className="h-3 w-3" />
                        מעקבים ({followUps.filter(f => f.status === 'pending').length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Info Tab */}
                  <TabsContent value="info" className="flex-1 p-4 overflow-auto">
                    <div className="grid gap-4 max-w-2xl">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">פרטים אישיים</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                          {selectedPatient.date_of_birth && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">תאריך לידה:</span>
                              <span>{format(new Date(selectedPatient.date_of_birth), 'dd/MM/yyyy')}</span>
                            </div>
                          )}
                          {selectedPatient.gender && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">מין:</span>
                              <span>{selectedPatient.gender === 'male' ? 'זכר' : selectedPatient.gender === 'female' ? 'נקבה' : 'אחר'}</span>
                            </div>
                          )}
                          {selectedPatient.address && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">כתובת:</span>
                              <span>{selectedPatient.address}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {(selectedPatient.emergency_contact || selectedPatient.emergency_phone) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">איש קשר לחירום</CardTitle>
                          </CardHeader>
                          <CardContent className="grid gap-2 text-sm">
                            {selectedPatient.emergency_contact && <p>{selectedPatient.emergency_contact}</p>}
                            {selectedPatient.emergency_phone && <p dir="ltr" className="text-left">{selectedPatient.emergency_phone}</p>}
                          </CardContent>
                        </Card>
                      )}

                      {(selectedPatient.medical_history || selectedPatient.allergies || selectedPatient.medications) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">מידע רפואי</CardTitle>
                          </CardHeader>
                          <CardContent className="grid gap-3 text-sm">
                            {selectedPatient.medical_history && (
                              <div>
                                <p className="text-muted-foreground mb-1">היסטוריה רפואית:</p>
                                <p>{selectedPatient.medical_history}</p>
                              </div>
                            )}
                            {selectedPatient.allergies && (
                              <div>
                                <p className="text-muted-foreground mb-1">אלרגיות:</p>
                                <p className="text-amber-600">{selectedPatient.allergies}</p>
                              </div>
                            )}
                            {selectedPatient.medications && (
                              <div>
                                <p className="text-muted-foreground mb-1">תרופות:</p>
                                <p>{selectedPatient.medications}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {selectedPatient.notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">הערות</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{selectedPatient.notes}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Visits Tab */}
                  <TabsContent value="visits" className="flex-1 p-4 overflow-auto">
                    <div className="space-y-4">
                      <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            הוסף ביקור חדש
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                          <DialogHeader>
                            <DialogTitle className="text-right">ביקור חדש - {selectedPatient.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label className="text-right">תלונה עיקרית</Label>
                              <Textarea
                                value={visitForm.chief_complaint}
                                onChange={(e) => setVisitForm({...visitForm, chief_complaint: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label className="text-right">אבחון לשון</Label>
                                <Input
                                  value={visitForm.tongue_diagnosis}
                                  onChange={(e) => setVisitForm({...visitForm, tongue_diagnosis: e.target.value})}
                                  className="text-right"
                                  dir="rtl"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-right">אבחון דופק</Label>
                                <Input
                                  value={visitForm.pulse_diagnosis}
                                  onChange={(e) => setVisitForm({...visitForm, pulse_diagnosis: e.target.value})}
                                  className="text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">דפוס TCM</Label>
                              <Input
                                value={visitForm.tcm_pattern}
                                onChange={(e) => setVisitForm({...visitForm, tcm_pattern: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">עיקרון טיפול</Label>
                              <Input
                                value={visitForm.treatment_principle}
                                onChange={(e) => setVisitForm({...visitForm, treatment_principle: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">נקודות (מופרדות בפסיק)</Label>
                              <Input
                                value={visitForm.points_used}
                                onChange={(e) => setVisitForm({...visitForm, points_used: e.target.value})}
                                placeholder="LI-4, ST-36, SP-6"
                                dir="ltr"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">עשבים</Label>
                              <Textarea
                                value={visitForm.herbs_prescribed}
                                onChange={(e) => setVisitForm({...visitForm, herbs_prescribed: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="cupping"
                                  checked={visitForm.cupping}
                                  onCheckedChange={(c) => setVisitForm({...visitForm, cupping: c as boolean})}
                                />
                                <Label htmlFor="cupping">כוסות רוח</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="moxa"
                                  checked={visitForm.moxa}
                                  onCheckedChange={(c) => setVisitForm({...visitForm, moxa: c as boolean})}
                                />
                                <Label htmlFor="moxa">מוקסה</Label>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">טכניקות נוספות</Label>
                              <Input
                                value={visitForm.other_techniques}
                                onChange={(e) => setVisitForm({...visitForm, other_techniques: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">הערות</Label>
                              <Textarea
                                value={visitForm.notes}
                                onChange={(e) => setVisitForm({...visitForm, notes: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">המלצת מעקב</Label>
                              <Input
                                value={visitForm.follow_up_recommended}
                                onChange={(e) => setVisitForm({...visitForm, follow_up_recommended: e.target.value})}
                                placeholder="לדוגמה: שבוע, שבועיים"
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <Button onClick={handleAddVisit} className="w-full">
                              שמור ביקור
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Edit Visit Dialog */}
                      <Dialog open={showEditVisit} onOpenChange={(open) => {
                        setShowEditVisit(open);
                        if (!open) {
                          setEditingVisit(null);
                          setVisitForm({
                            chief_complaint: '', tongue_diagnosis: '', pulse_diagnosis: '',
                            tcm_pattern: '', treatment_principle: '', points_used: '',
                            herbs_prescribed: '', cupping: false, moxa: false,
                            other_techniques: '', notes: '', follow_up_recommended: ''
                          });
                        }
                      }}>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                          <DialogHeader>
                            <DialogTitle className="text-right">עריכת ביקור</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label className="text-right">תלונה עיקרית</Label>
                              <Textarea
                                value={visitForm.chief_complaint}
                                onChange={(e) => setVisitForm({...visitForm, chief_complaint: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label className="text-right">אבחון לשון</Label>
                                <Input
                                  value={visitForm.tongue_diagnosis}
                                  onChange={(e) => setVisitForm({...visitForm, tongue_diagnosis: e.target.value})}
                                  className="text-right"
                                  dir="rtl"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-right">אבחון דופק</Label>
                                <Input
                                  value={visitForm.pulse_diagnosis}
                                  onChange={(e) => setVisitForm({...visitForm, pulse_diagnosis: e.target.value})}
                                  className="text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">דפוס TCM</Label>
                              <Input
                                value={visitForm.tcm_pattern}
                                onChange={(e) => setVisitForm({...visitForm, tcm_pattern: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">עיקרון טיפול</Label>
                              <Input
                                value={visitForm.treatment_principle}
                                onChange={(e) => setVisitForm({...visitForm, treatment_principle: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">נקודות (מופרדות בפסיק)</Label>
                              <Input
                                value={visitForm.points_used}
                                onChange={(e) => setVisitForm({...visitForm, points_used: e.target.value})}
                                placeholder="LI-4, ST-36, SP-6"
                                dir="ltr"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">עשבים</Label>
                              <Textarea
                                value={visitForm.herbs_prescribed}
                                onChange={(e) => setVisitForm({...visitForm, herbs_prescribed: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="edit-cupping"
                                  checked={visitForm.cupping}
                                  onCheckedChange={(c) => setVisitForm({...visitForm, cupping: c as boolean})}
                                />
                                <Label htmlFor="edit-cupping">כוסות רוח</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="edit-moxa"
                                  checked={visitForm.moxa}
                                  onCheckedChange={(c) => setVisitForm({...visitForm, moxa: c as boolean})}
                                />
                                <Label htmlFor="edit-moxa">מוקסה</Label>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">טכניקות נוספות</Label>
                              <Input
                                value={visitForm.other_techniques}
                                onChange={(e) => setVisitForm({...visitForm, other_techniques: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">הערות</Label>
                              <Textarea
                                value={visitForm.notes}
                                onChange={(e) => setVisitForm({...visitForm, notes: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">המלצת מעקב</Label>
                              <Input
                                value={visitForm.follow_up_recommended}
                                onChange={(e) => setVisitForm({...visitForm, follow_up_recommended: e.target.value})}
                                placeholder="לדוגמה: שבוע, שבועיים"
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <Button onClick={handleEditVisit} className="w-full">
                              שמור שינויים
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {visits.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>אין ביקורים עדיין</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {visits.map((visit) => (
                            <Card key={visit.id}>
                              <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-medium">
                                    {format(new Date(visit.visit_date), 'dd/MM/yyyy HH:mm')}
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    {visit.tcm_pattern && (
                                      <span className="text-xs bg-jade-light text-jade px-2 py-1 rounded">
                                        {visit.tcm_pattern}
                                      </span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openEditVisit(visit)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() => handleDeleteVisit(visit.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="py-2 space-y-2 text-sm">
                                {visit.chief_complaint && (
                                  <p><span className="text-muted-foreground">תלונה: </span>{visit.chief_complaint}</p>
                                )}
                                {visit.treatment_principle && (
                                  <p><span className="text-muted-foreground">עיקרון: </span>{visit.treatment_principle}</p>
                                )}
                                {visit.points_used && visit.points_used.length > 0 && (
                                  <p><span className="text-muted-foreground">נקודות: </span>{visit.points_used.join(', ')}</p>
                                )}
                                <div className="flex gap-2 pt-1">
                                  {visit.cupping && <span className="text-xs bg-muted px-2 py-0.5 rounded">כוסות רוח</span>}
                                  {visit.moxa && <span className="text-xs bg-muted px-2 py-0.5 rounded">מוקסה</span>}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Follow-ups Tab */}
                  <TabsContent value="followups" className="flex-1 p-4 overflow-auto">
                    <div className="space-y-4">
                      <Dialog open={showAddFollowUp} onOpenChange={setShowAddFollowUp}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            הוסף תזכורת מעקב
                          </Button>
                        </DialogTrigger>
                        <DialogContent dir="rtl">
                          <DialogHeader>
                            <DialogTitle className="text-right">מעקב חדש - {selectedPatient.full_name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label className="text-right">תאריך מתוכנן *</Label>
                              <Input
                                type="date"
                                value={followUpForm.scheduled_date}
                                onChange={(e) => setFollowUpForm({...followUpForm, scheduled_date: e.target.value})}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">סיבה</Label>
                              <Input
                                value={followUpForm.reason}
                                onChange={(e) => setFollowUpForm({...followUpForm, reason: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label className="text-right">הערות</Label>
                              <Textarea
                                value={followUpForm.notes}
                                onChange={(e) => setFollowUpForm({...followUpForm, notes: e.target.value})}
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            <Button onClick={handleAddFollowUp} className="w-full">
                              שמור מעקב
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {followUps.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>אין מעקבים מתוכננים</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {followUps.map((followUp) => (
                            <Card key={followUp.id} className={followUp.status === 'completed' ? 'opacity-60' : ''}>
                              <CardContent className="py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {followUp.status === 'completed' ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5 text-amber-500" />
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        {format(new Date(followUp.scheduled_date), 'dd/MM/yyyy')}
                                      </p>
                                      {followUp.reason && (
                                        <p className="text-sm text-muted-foreground">{followUp.reason}</p>
                                      )}
                                    </div>
                                  </div>
                                  {followUp.status !== 'completed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCompleteFollowUp(followUp.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 ml-1" />
                                      הושלם
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>בחרו מטופל מהרשימה</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
