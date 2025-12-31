import { useState, useEffect } from 'react';
import { format, differenceInYears } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  User, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Loader2,
  Stethoscope,
  Brain,
  Pill,
  Apple,
  Moon
} from 'lucide-react';

interface PatientData {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  chief_complaint?: string;
  diet_notes?: string;
  sleep_quality?: string;
  stress_level?: string;
  exercise_frequency?: string;
  lifestyle_notes?: string;
  constitution_type?: string;
  tongue_notes?: string;
  pulse_notes?: string;
  is_pregnant?: boolean;
  pregnancy_weeks?: number;
  notes?: string;
}

interface IntakeReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  onComplete?: () => void;
}

export function IntakeReviewDialog({ 
  open, 
  onOpenChange, 
  patientId, 
  patientName,
  onComplete 
}: IntakeReviewDialogProps) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedPatient, setEditedPatient] = useState<PatientData | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (open && patientId) {
      fetchPatient();
    }
  }, [open, patientId]);

  const fetchPatient = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setPatient(data);
      setEditedPatient(data);
    } catch (err) {
      console.error('Failed to fetch patient:', err);
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedPatient || !patientId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          full_name: editedPatient.full_name,
          phone: editedPatient.phone,
          email: editedPatient.email,
          address: editedPatient.address,
          emergency_contact: editedPatient.emergency_contact,
          emergency_phone: editedPatient.emergency_phone,
          medical_history: editedPatient.medical_history,
          allergies: editedPatient.allergies,
          medications: editedPatient.medications,
          chief_complaint: editedPatient.chief_complaint,
          diet_notes: editedPatient.diet_notes,
          sleep_quality: editedPatient.sleep_quality,
          stress_level: editedPatient.stress_level,
          lifestyle_notes: editedPatient.lifestyle_notes,
          tongue_notes: editedPatient.tongue_notes,
          pulse_notes: editedPatient.pulse_notes,
          notes: editedPatient.notes,
        })
        .eq('id', patientId);

      if (error) throw error;
      
      setPatient(editedPatient);
      setIsEditing(false);
      toast.success('Patient information updated');
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = () => {
    toast.success('Intake review completed ✓');
    onComplete?.();
    onOpenChange(false);
  };

  const updateField = (field: keyof PatientData, value: string | boolean | number) => {
    if (editedPatient) {
      setEditedPatient({ ...editedPatient, [field]: value });
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
  };

  if (!patientId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Intake Review
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="font-medium">No Patient Selected</p>
            <p className="text-sm mt-2">Please select a patient first to review their intake form.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-jade" />
                Intake Review: {patientName || patient?.full_name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Review and verify patient details during session
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditedPatient(patient);
                      setIsEditing(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-jade hover:bg-jade/90"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-jade" />
          </div>
        ) : patient ? (
          <ScrollArea className="h-[60vh]">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full mb-4">
                  <TabsTrigger value="basic" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="medical" className="text-xs">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Medical
                  </TabsTrigger>
                  <TabsTrigger value="tcm" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    TCM
                  </TabsTrigger>
                  <TabsTrigger value="lifestyle" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Lifestyle
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Full Name</Label>
                          {isEditing ? (
                            <Input 
                              value={editedPatient?.full_name || ''} 
                              onChange={(e) => updateField('full_name', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{patient.full_name}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Age</Label>
                          <p className="font-medium">
                            {calculateAge(patient.date_of_birth) 
                              ? `${calculateAge(patient.date_of_birth)} years` 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Phone
                          </Label>
                          {isEditing ? (
                            <Input 
                              value={editedPatient?.phone || ''} 
                              onChange={(e) => updateField('phone', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{patient.phone || 'N/A'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </Label>
                          {isEditing ? (
                            <Input 
                              value={editedPatient?.email || ''} 
                              onChange={(e) => updateField('email', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{patient.email || 'N/A'}</p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Emergency Contact</Label>
                          {isEditing ? (
                            <Input 
                              value={editedPatient?.emergency_contact || ''} 
                              onChange={(e) => updateField('emergency_contact', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{patient.emergency_contact || 'N/A'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Emergency Phone</Label>
                          {isEditing ? (
                            <Input 
                              value={editedPatient?.emergency_phone || ''} 
                              onChange={(e) => updateField('emergency_phone', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{patient.emergency_phone || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" /> Chief Complaint
                        </Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.chief_complaint || ''} 
                            onChange={(e) => updateField('chief_complaint', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.chief_complaint || 'Not specified'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" /> Allergies
                        </Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.allergies || ''} 
                            onChange={(e) => updateField('allergies', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-red-500/5 border border-red-500/20 rounded text-sm">
                            {patient.allergies || 'No known allergies'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Pill className="h-3 w-3" /> Current Medications
                        </Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.medications || ''} 
                            onChange={(e) => updateField('medications', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.medications || 'None reported'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Medical History</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.medical_history || ''} 
                            onChange={(e) => updateField('medical_history', e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.medical_history || 'No significant history'}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tcm" className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Constitution Type</Label>
                        <Badge variant="outline" className="mt-1">
                          {patient.constitution_type || 'Not assessed'}
                        </Badge>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Tongue Diagnosis</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.tongue_notes || ''} 
                            onChange={(e) => updateField('tongue_notes', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.tongue_notes || 'Not recorded'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Pulse Diagnosis</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.pulse_notes || ''} 
                            onChange={(e) => updateField('pulse_notes', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.pulse_notes || 'Not recorded'}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-4">
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Moon className="h-3 w-3" /> Sleep Quality
                          </Label>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {patient.sleep_quality || 'N/A'}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Stress Level</Label>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 capitalize ${
                              patient.stress_level === 'high' || patient.stress_level === 'severe' 
                                ? 'border-red-500 text-red-600' 
                                : ''
                            }`}
                          >
                            {patient.stress_level || 'N/A'}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Exercise</Label>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {patient.exercise_frequency || 'N/A'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Apple className="h-3 w-3" /> Diet Notes
                        </Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.diet_notes || ''} 
                            onChange={(e) => updateField('diet_notes', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.diet_notes || 'No diet notes'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Lifestyle Notes</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editedPatient?.lifestyle_notes || ''} 
                            onChange={(e) => updateField('lifestyle_notes', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 p-2 bg-muted/50 rounded text-sm">
                            {patient.lifestyle_notes || 'No lifestyle notes'}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Card>
                    <CardContent className="pt-4">
                      <Label className="text-xs text-muted-foreground">Additional Notes</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editedPatient?.notes || ''} 
                          onChange={(e) => updateField('notes', e.target.value)}
                          className="mt-1"
                          rows={6}
                          placeholder="Add any additional notes about this patient..."
                        />
                      ) : (
                        <p className="mt-1 p-3 bg-muted/50 rounded text-sm min-h-[150px]">
                          {patient.notes || 'No additional notes'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Last updated: {patient?.date_of_birth ? 'Recently' : 'Unknown'}
          </Badge>
          <Button 
            onClick={handleComplete}
            className="bg-jade hover:bg-jade/90"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Review Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
