import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInYears } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, Heart, 
  Activity, FileText, Plus, Edit, Trash2, Baby, AlertTriangle,
  Clock, Stethoscope, Pill, Brain, Moon, Utensils, Video, Mic, Play, Pause
} from 'lucide-react';
import { VisitFormDialog } from '@/components/crm/VisitFormDialog';

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  occupation: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  medical_history: string | null;
  allergies: string | null;
  medications: string | null;
  chief_complaint: string | null;
  diet_notes: string | null;
  sleep_quality: string | null;
  stress_level: string | null;
  exercise_frequency: string | null;
  lifestyle_notes: string | null;
  constitution_type: string | null;
  tongue_notes: string | null;
  pulse_notes: string | null;
  is_pregnant: boolean | null;
  pregnancy_weeks: number | null;
  due_date: string | null;
  pregnancy_notes: string | null;
  obstetric_history: string | null;
  consent_signed: boolean | null;
  consent_signed_at: string | null;
  notes: string | null;
  age_group: string | null;
  created_at: string;
  updated_at: string;
}

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  tongue_diagnosis: string | null;
  pulse_diagnosis: string | null;
  tcm_pattern: string | null;
  treatment_principle: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
  cupping: boolean | null;
  moxa: boolean | null;
  other_techniques: string | null;
  follow_up_recommended: string | null;
  notes: string | null;
  created_at: string;
}

interface VideoSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  anxiety_qa_responses: unknown; // JSON type from Supabase
  created_at: string;
}

interface VoiceRecording {
  id: string;
  audio_url: string;
  transcription: string | null;
  recording_type: string;
  duration_seconds: number | null;
  created_at: string;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  return differenceInYears(new Date(), new Date(dob));
}

function getAgeGroupLabel(ageGroup: string | null): string {
  const labels: Record<string, string> = {
    child: 'Child (0-12)',
    teen: 'Teen (13-19)',
    adult: 'Adult (20-64)',
    senior: 'Senior (65+)',
  };
  return labels[ageGroup || ''] || 'Unknown';
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CRMPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [voiceRecordings, setVoiceRecordings] = useState<VoiceRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      fetchPatient();
      fetchVisits();
      fetchVideoSessions();
      fetchVoiceRecordings();
    }
  }, [id]);

  const fetchPatient = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient');
      return;
    }

    if (!data) {
      toast.error('Patient not found');
      navigate('/crm/patients');
      return;
    }

    setPatient(data);
    setLoading(false);
  };

  const fetchVisits = async () => {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', id)
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('Error fetching visits:', error);
      return;
    }

    setVisits(data || []);
  };

  const fetchVideoSessions = async () => {
    const { data, error } = await supabase
      .from('video_sessions')
      .select('*')
      .eq('patient_id', id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching video sessions:', error);
      return;
    }

    setVideoSessions(data || []);
  };

  const fetchVoiceRecordings = async () => {
    const { data, error } = await supabase
      .from('voice_recordings')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching voice recordings:', error);
      return;
    }

    setVoiceRecordings(data || []);
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm('Are you sure you want to delete this visit record?')) return;

    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId);

    if (error) {
      toast.error('Failed to delete visit');
      return;
    }

    toast.success('Visit deleted');
    fetchVisits();
  };

  const handleDeleteVideoSession = async (sessionId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק פגישת וידאו זו?')) return;

    const { error } = await supabase
      .from('video_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      toast.error('שגיאה במחיקת הפגישה');
      return;
    }

    toast.success('הפגישה נמחקה');
    fetchVideoSessions();
  };

  const handleDeleteVoiceRecording = async (recordingId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הקלטה זו?')) return;

    const { error } = await supabase
      .from('voice_recordings')
      .delete()
      .eq('id', recordingId);

    if (error) {
      toast.error('שגיאה במחיקת ההקלטה');
      return;
    }

    toast.success('ההקלטה נמחקה');
    fetchVoiceRecordings();
  };

  const toggleAudioPlayback = (recording: VoiceRecording) => {
    if (playingAudioId === recording.id) {
      // Stop playing
      audioElement?.pause();
      setPlayingAudioId(null);
      setAudioElement(null);
    } else {
      // Stop any existing playback
      audioElement?.pause();
      
      // Start new playback
      const audio = new Audio(recording.audio_url);
      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioElement(null);
      };
      audio.play();
      setAudioElement(audio);
      setPlayingAudioId(recording.id);
    }
  };

  const handleVisitSaved = () => {
    setVisitDialogOpen(false);
    setSelectedVisit(null);
    fetchVisits();
  };

  if (loading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">Loading patient...</div>
        </div>
      </CRMLayout>
    );
  }

  if (!patient) return null;

  const age = calculateAge(patient.date_of_birth);

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/crm/patients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-jade/10 flex items-center justify-center">
                <User className="h-8 w-8 text-jade" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold">{patient.full_name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {patient.gender && <span className="capitalize">{patient.gender}</span>}
                  {age !== null && <span>• {age} years old</span>}
                  {patient.age_group && (
                    <Badge variant="outline" className="ml-2">
                      {getAgeGroupLabel(patient.age_group)}
                    </Badge>
                  )}
                  {patient.is_pregnant && (
                    <Badge className="ml-1 bg-pink-500/10 text-pink-500 border-pink-500/30">
                      <Baby className="h-3 w-3 mr-1" />
                      Pregnant {patient.pregnancy_weeks && `(${patient.pregnancy_weeks}w)`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/crm/patients/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Link>
            </Button>
            <Button 
              className="bg-jade hover:bg-jade/90"
              onClick={() => {
                setSelectedVisit(null);
                setVisitDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Visit
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visits">Visit History ({visits.length})</TabsTrigger>
            <TabsTrigger value="video-sessions">
              <Video className="h-4 w-4 mr-1" />
              Video ({videoSessions.length})
            </TabsTrigger>
            <TabsTrigger value="recordings">
              <Mic className="h-4 w-4 mr-1" />
              Recordings ({voiceRecordings.length})
            </TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="tcm">TCM Assessment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-jade" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${patient.phone}`} className="hover:text-jade">{patient.phone}</a>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${patient.email}`} className="hover:text-jade">{patient.email}</a>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                  {patient.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(patient.date_of_birth), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>{patient.occupation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gold" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.emergency_contact ? (
                    <div className="space-y-2">
                      <p className="font-medium">{patient.emergency_contact}</p>
                      {patient.emergency_phone && (
                        <p className="text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {patient.emergency_phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Consent Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-jade" />
                    Consent Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.consent_signed ? (
                    <div className="space-y-2">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                        Consent Signed
                      </Badge>
                      {patient.consent_signed_at && (
                        <p className="text-xs text-muted-foreground">
                          Signed on {format(new Date(patient.consent_signed_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                        Pending Consent
                      </Badge>
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <Link to={`/crm/patients/${id}/consent`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Open Consent Form
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chief Complaint */}
            {patient.chief_complaint && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-destructive" />
                    Chief Complaint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.chief_complaint}</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Video Sessions */}
            {videoSessions.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-500" />
                    פגישות וידאו אחרונות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videoSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50">
                        <div>
                          <p className="font-medium text-sm">
                            {format(new Date(session.started_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            משך: {formatDuration(session.duration_seconds)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          וידאו
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Visits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-jade" />
                  Recent Visits
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="#" onClick={() => document.querySelector('[value="visits"]')?.dispatchEvent(new MouseEvent('click'))}>
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No visits recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {visits.slice(0, 3).map((visit) => (
                      <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">
                            {format(new Date(visit.visit_date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {visit.chief_complaint || 'General visit'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {visit.cupping && <Badge variant="outline" className="text-xs">Cupping</Badge>}
                          {visit.moxa && <Badge variant="outline" className="text-xs">Moxa</Badge>}
                          {visit.points_used && visit.points_used.length > 0 && (
                            <Badge variant="outline" className="text-xs">{visit.points_used.length} points</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Sessions Tab */}
          <TabsContent value="video-sessions" className="space-y-4">
            {videoSessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">אין פגישות וידאו מתועדות</p>
                </CardContent>
              </Card>
            ) : (
              videoSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-500" />
                        {format(new Date(session.started_at), 'EEEE, d בMMMM yyyy', { locale: he })}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          התחלה: {format(new Date(session.started_at), 'HH:mm')}
                        </span>
                        {session.ended_at && (
                          <span>
                            סיום: {format(new Date(session.ended_at), 'HH:mm')}
                          </span>
                        )}
                        <Badge variant="outline">
                          משך: {formatDuration(session.duration_seconds)}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteVideoSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {session.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">הערות</p>
                        <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
                      </div>
                    )}
                    {Array.isArray(session.anxiety_qa_responses) && session.anxiety_qa_responses.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-xs text-amber-700 font-medium mb-2">שאלון חרדה</p>
                        <div className="text-sm text-amber-900 space-y-1">
                          {(session.anxiety_qa_responses as string[]).slice(0, 3).map((response, idx) => (
                            <p key={idx}>{response}</p>
                          ))}
                          {session.anxiety_qa_responses.length > 3 && (
                            <p className="text-xs text-amber-600">
                              +{session.anxiety_qa_responses.length - 3} נוספים
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Voice Recordings Tab */}
          <TabsContent value="recordings" className="space-y-4">
            {voiceRecordings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mic className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">אין הקלטות קוליות</p>
                </CardContent>
              </Card>
            ) : (
              voiceRecordings.map((recording) => (
                <Card key={recording.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mic className="h-4 w-4 text-amber-500" />
                        {format(new Date(recording.created_at), 'EEEE, d בMMMM yyyy HH:mm', { locale: he })}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-1">
                        <Badge variant="outline">
                          {recording.recording_type === 'treatment_plan' ? 'תוכנית טיפול' : recording.recording_type}
                        </Badge>
                        {recording.duration_seconds && (
                          <span className="text-xs">
                            משך: {formatDuration(recording.duration_seconds)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => toggleAudioPlayback(recording)}
                      >
                        {playingAudioId === recording.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteVoiceRecording(recording.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  {recording.transcription && (
                    <CardContent>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">תמלול</p>
                        <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                          {recording.transcription}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-4">
            {visits.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No visit records yet</p>
                  <Button 
                    className="bg-jade hover:bg-jade/90"
                    onClick={() => {
                      setSelectedVisit(null);
                      setVisitDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Visit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              visits.map((visit) => (
                <Card key={visit.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">
                        {format(new Date(visit.visit_date), 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                      <CardDescription>
                        {visit.chief_complaint || 'General visit'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedVisit(visit);
                          setVisitDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteVisit(visit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Diagnosis */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {visit.tongue_diagnosis && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tongue Diagnosis</p>
                          <p className="text-sm">{visit.tongue_diagnosis}</p>
                        </div>
                      )}
                      {visit.pulse_diagnosis && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Pulse Diagnosis</p>
                          <p className="text-sm">{visit.pulse_diagnosis}</p>
                        </div>
                      )}
                    </div>

                    {visit.tcm_pattern && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">TCM Pattern</p>
                        <Badge variant="secondary">{visit.tcm_pattern}</Badge>
                      </div>
                    )}

                    {visit.treatment_principle && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Treatment Principle</p>
                        <p className="text-sm">{visit.treatment_principle}</p>
                      </div>
                    )}

                    {/* Treatment */}
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      {visit.cupping && (
                        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">Cupping</Badge>
                      )}
                      {visit.moxa && (
                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">Moxibustion</Badge>
                      )}
                      {visit.points_used && visit.points_used.length > 0 && (
                        <Badge className="bg-jade/10 text-jade border-jade/30">
                          {visit.points_used.length} Acupuncture Points
                        </Badge>
                      )}
                    </div>

                    {visit.points_used && visit.points_used.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Points Used</p>
                        <div className="flex flex-wrap gap-1">
                          {visit.points_used.map((point, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{point}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {visit.herbs_prescribed && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          Herbs Prescribed
                        </p>
                        <p className="text-sm">{visit.herbs_prescribed}</p>
                      </div>
                    )}

                    {visit.other_techniques && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Other Techniques</p>
                        <p className="text-sm">{visit.other_techniques}</p>
                      </div>
                    )}

                    {visit.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{visit.notes}</p>
                      </div>
                    )}

                    {visit.follow_up_recommended && (
                      <div className="p-3 rounded-lg bg-jade/5 border border-jade/20">
                        <p className="text-xs text-jade mb-1 font-medium">Follow-up Recommended</p>
                        <p className="text-sm">{visit.follow_up_recommended}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Medical Info Tab */}
          <TabsContent value="medical" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.medical_history || 'Not provided'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.allergies || 'None reported'}</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="h-4 w-4 text-jade" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.medications || 'None reported'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Pregnancy Section */}
            {patient.is_pregnant && (
              <Card className="border-pink-200 bg-pink-50/30 dark:bg-pink-950/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Baby className="h-4 w-4 text-pink-500" />
                    Pregnancy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {patient.pregnancy_weeks && (
                      <div>
                        <p className="text-xs text-muted-foreground">Weeks Pregnant</p>
                        <p className="font-medium">{patient.pregnancy_weeks} weeks</p>
                      </div>
                    )}
                    {patient.due_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-medium">{format(new Date(patient.due_date), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>
                  {patient.obstetric_history && (
                    <div>
                      <p className="text-xs text-muted-foreground">Obstetric History</p>
                      <p className="text-sm mt-1">{patient.obstetric_history}</p>
                    </div>
                  )}
                  {patient.pregnancy_notes && (
                    <div>
                      <p className="text-xs text-muted-foreground">Pregnancy Notes</p>
                      <p className="text-sm mt-1">{patient.pregnancy_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Sleep Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {patient.sleep_quality || 'Not assessed'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Stress Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${
                      patient.stress_level === 'severe' ? 'border-red-500 text-red-500' :
                      patient.stress_level === 'high' ? 'border-orange-500 text-orange-500' :
                      patient.stress_level === 'moderate' ? 'border-yellow-500 text-yellow-500' :
                      'border-green-500 text-green-500'
                    }`}
                  >
                    {patient.stress_level || 'Not assessed'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    Exercise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {patient.exercise_frequency || 'Not assessed'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-amber-500" />
                  Diet & Nutrition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{patient.diet_notes || 'Not provided'}</p>
              </CardContent>
            </Card>

            {patient.lifestyle_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Lifestyle Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{patient.lifestyle_notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TCM Tab */}
          <TabsContent value="tcm" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-jade">Constitution Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.constitution_type ? (
                    <Badge className="bg-jade/10 text-jade border-jade/30">
                      {patient.constitution_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assessed</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tongue Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.tongue_notes || 'Not recorded'}</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Pulse Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{patient.pulse_notes || 'Not recorded'}</p>
                </CardContent>
              </Card>
            </div>

            {patient.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Visit Form Dialog */}
        <VisitFormDialog
          open={visitDialogOpen}
          onOpenChange={setVisitDialogOpen}
          patientId={id!}
          visit={selectedVisit}
          onSaved={handleVisitSaved}
        />
      </div>
    </CRMLayout>
  );
}