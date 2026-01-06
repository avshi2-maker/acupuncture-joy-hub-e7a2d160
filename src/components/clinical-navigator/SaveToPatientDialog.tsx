import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { UserPlus, Loader2, Save } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useProtocolHistory } from '@/hooks/useProtocolHistory';

interface SaveToPatientDialogProps {
  moduleId: number;
  moduleName: string;
  diagnosis: string;
  acupuncturePoints: string[];
  herbalFormula?: string;
  herbalIngredients?: string[];
  nutritionAdvice?: string[];
  lifestyleAdvice?: string[];
  answers?: Record<string, any>;
  language: 'en' | 'he';
  onSaved?: () => void;
}

export function SaveToPatientDialog({
  moduleId,
  moduleName,
  diagnosis,
  acupuncturePoints,
  herbalFormula,
  herbalIngredients = [],
  nutritionAdvice = [],
  lifestyleAdvice = [],
  answers = {},
  language,
  onSaved,
}: SaveToPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [distressLevel, setDistressLevel] = useState<number>(5);
  
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { saveProtocol, isSaving } = useProtocolHistory();

  const handleSave = () => {
    if (!selectedPatientId) return;

    saveProtocol({
      patientId: selectedPatientId,
      moduleId,
      moduleName,
      diagnosis,
      acupuncturePoints,
      herbalFormula,
      herbalIngredients,
      nutritionAdvice,
      lifestyleAdvice,
      answers,
      distressLevel,
    }, {
      onSuccess: () => {
        setOpen(false);
        setSelectedPatientId('');
        setDistressLevel(5);
        onSaved?.();
      },
    });
  };

  const getDistressLabel = (level: number) => {
    if (level <= 3) return language === 'he' ? 'נמוך' : 'Low';
    if (level <= 6) return language === 'he' ? 'בינוני' : 'Moderate';
    return language === 'he' ? 'גבוה' : 'High';
  };

  const getDistressColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <UserPlus className="h-4 w-4" />
          {language === 'he' ? 'שמור למטופל' : 'Save to Patient'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-jade" />
            {language === 'he' ? 'שמור פרוטוקול לתיק מטופל' : 'Save Protocol to Patient Record'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{language === 'he' ? 'בחר מטופל' : 'Select Patient'}</Label>
            {patientsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'he' ? 'טוען...' : 'Loading...'}
              </div>
            ) : (
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'he' ? 'בחר מטופל...' : 'Select patient...'} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                      {patient.phone && ` (${patient.phone})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Distress Scale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{language === 'he' ? 'רמת מצוקה סובייקטיבית' : 'Subjective Distress Level'}</Label>
              <span className={`text-lg font-bold ${getDistressColor(distressLevel)}`}>
                {distressLevel}/10 ({getDistressLabel(distressLevel)})
              </span>
            </div>
            <Slider
              value={[distressLevel]}
              onValueChange={([value]) => setDistressLevel(value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{language === 'he' ? 'אין מצוקה' : 'No distress'}</span>
              <span>{language === 'he' ? 'מצוקה קשה' : 'Severe distress'}</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <p><strong>{language === 'he' ? 'מודול:' : 'Module:'}</strong> {moduleName}</p>
            <p><strong>{language === 'he' ? 'נקודות:' : 'Points:'}</strong> {acupuncturePoints.length}</p>
            {herbalFormula && (
              <p><strong>{language === 'he' ? 'פורמולה:' : 'Formula:'}</strong> {herbalFormula}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedPatientId || isSaving}
            className="bg-jade hover:bg-jade/90 gap-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {language === 'he' ? 'שמור' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
