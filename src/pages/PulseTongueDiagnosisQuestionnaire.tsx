import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, Eye, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Question {
  id: string;
  textHe: string;
  textEn: string;
  type: 'text';
}

const questions: Question[] = [
  {
    id: 'pale_swollen_tongue',
    textHe: 'מה המשמעות הקלינית של לשון חיוורת ונפוחה עם סימני שיניים?',
    textEn: 'What is the clinical significance of a pale, swollen tongue with teeth marks?',
    type: 'text',
  },
  {
    id: 'yellow_thick_coating',
    textHe: 'על מה מעיד חיפוי לשון צהוב ועבה במחמם האמצעי?',
    textEn: 'What does a thick yellow tongue coating in the Middle Jiao indicate?',
    type: 'text',
  },
  {
    id: 'wiry_pulse',
    textHe: 'כיצד מתואר דופק "מיתרי" (Wiry) ומה הוא מסמל?',
    textEn: 'How is a "Wiry" pulse described and what does it signify?',
    type: 'text',
  },
  {
    id: 'purple_vs_crimson',
    textHe: 'מה ההבדל באבחנה בין לשון סגולה (Purple) לבין לשון אדומה כהה (Crimson)?',
    textEn: 'What is the diagnostic difference between a Purple tongue and a Crimson tongue?',
    type: 'text',
  },
  {
    id: 'central_crack',
    textHe: 'מהי המשמעות של חריץ מרכזי המגיע עד קצה הלשון?',
    textEn: 'What is the significance of a central crack extending to the tip of the tongue?',
    type: 'text',
  },
  {
    id: 'slippery_pulse_phlegm',
    textHe: 'כיצד נזהה דופק "מתגלגל" (Slippery) ומה הקשר שלו לליחה?',
    textEn: 'How do we identify a "Slippery" pulse and what is its connection to phlegm?',
    type: 'text',
  },
  {
    id: 'red_tip_points',
    textHe: 'מה מעיד קצה לשון אדום מאוד עם נקודות אדומות (Red Points)?',
    textEn: 'What does a very red tongue tip with red points indicate?',
    type: 'text',
  },
  {
    id: 'floating_vs_deep',
    textHe: 'מהי האינדיקציה של דופק "צף" (Floating) לעומת דופק "שוקע" (Deep)?',
    textEn: 'What is the indication of a "Floating" pulse versus a "Deep" pulse?',
    type: 'text',
  },
  {
    id: 'peeled_coating',
    textHe: 'מה מסמל חיפוי לשון "מקורף" (Peeled) או גאוגרפי?',
    textEn: 'What does a "Peeled" or geographic tongue coating signify?',
    type: 'text',
  },
  {
    id: 'yin_def_tongue',
    textHe: 'כיצד מתבטא חוסר יין (Yin Def) במראה הלשון?',
    textEn: 'How does Yin Deficiency manifest in the tongue appearance?',
    type: 'text',
  },
  {
    id: 'thin_vs_weak_pulse',
    textHe: 'מה ההבדל בין דופק "דק" (Thin/Fine) לדופק "חלש" (Weak)?',
    textEn: 'What is the difference between a "Thin/Fine" pulse and a "Weak" pulse?',
    type: 'text',
  },
  {
    id: 'sublingual_veins',
    textHe: 'האם ורידים תת-לשוניים (Sublingual) כהים מוזכרים, ומה משמעותם?',
    textEn: 'Are dark sublingual veins mentioned, and what is their significance?',
    type: 'text',
  },
  {
    id: 'quivering_tongue',
    textHe: 'מה המשמעות של לשון רועדת (Quivering) אצל מטופל מבוגר?',
    textEn: 'What is the significance of a quivering tongue in an elderly patient?',
    type: 'text',
  },
  {
    id: 'damp_heat_coating',
    textHe: 'כיצד נראה חיפוי של "לחות-חמה" (Damp-Heat) על הלשון?',
    textEn: 'How does a "Damp-Heat" coating appear on the tongue?',
    type: 'text',
  },
  {
    id: 'rapid_vs_racing',
    textHe: 'מה ההבדל בין דופק מהיר (Rapid) לדופק דהור (Racing/Hurried)?',
    textEn: 'What is the difference between a Rapid pulse and a Racing/Hurried pulse?',
    type: 'text',
  },
  {
    id: 'short_contracted',
    textHe: 'מה המשמעות של לשון קצרה ומכווצת?',
    textEn: 'What is the significance of a short and contracted tongue?',
    type: 'text',
  },
  {
    id: 'pregnancy_pulse',
    textHe: 'איזה דופק צפוי להימצא אצל אישה בהריון לפי הקובץ?',
    textEn: 'What pulse is expected to be found in a pregnant woman according to the source?',
    type: 'text',
  },
  {
    id: 'orange_sides',
    textHe: 'מה מעיד צבע לשון "כתום" או צהבהב בצדדים?',
    textEn: 'What does an "orange" or yellowish tongue color on the sides indicate?',
    type: 'text',
  },
  {
    id: 'antibiotic_coating',
    textHe: 'כיצד משפיעה אנטיביוטיקה על חיפוי הלשון לפי הנחיות האבחון?',
    textEn: 'How do antibiotics affect the tongue coating according to diagnostic guidelines?',
    type: 'text',
  },
  {
    id: 'shock_pulse',
    textHe: 'מהו הדופק האופייני למצב של "הלם" או איבוד דם רב?',
    textEn: 'What is the characteristic pulse for a state of "shock" or severe blood loss?',
    type: 'text',
  },
];

export default function PulseTongueDiagnosisQuestionnaire() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: patients } = usePatients();
  const createAssessment = useCreateAssessment();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = language === 'he';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error(isRTL ? 'נא לבחור מטופל' : 'Please select a patient');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssessment.mutateAsync({
        patient_id: selectedPatientId,
        assessment_type: 'pulse_tongue_diagnosis',
        details: { answers, questions: questions.map(q => ({ id: q.id, textHe: q.textHe, textEn: q.textEn })) },
        status: 'completed',
      });
      toast.success(isRTL ? 'השאלון נשמר בהצלחה' : 'Questionnaire saved successfully');
      navigate(-1);
    } catch (error) {
      toast.error(isRTL ? 'שגיאה בשמירת השאלון' : 'Error saving questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQuestions = () => {
    const BOM = '\uFEFF';
    const headers = ['מספר', 'מזהה שאלה', 'שאלה בעברית', 'Question in English'];
    const rows = questions.map((q, idx) => [
      idx + 1,
      q.id,
      `"${q.textHe.replace(/"/g, '""')}"`,
      `"${q.textEn.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse_tongue_diagnosis_questions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(isRTL ? 'השאלות הורדו בהצלחה' : 'Questions downloaded successfully');
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id] || '';

  return (
    <div className="min-h-screen bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-8 w-8 text-teal-500" />
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? 'אבחון דופק ולשון' : 'Pulse & Tongue Diagnosis'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL ? 'אבחון חזותי ומישושי - שאלון מעמיק' : 'Visual & Tactile Diagnosis - In-depth Questionnaire'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadQuestions}
            className="mt-2 gap-2"
          >
            <Download className="h-4 w-4" />
            {isRTL ? `הורד ${questions.length} שאלות` : `Download ${questions.length} Questions`}
          </Button>
        </div>

        {/* Patient Selection */}
        <Card>
          <CardContent className="pt-4">
            <Label className="mb-2 block">
              {isRTL ? 'בחר מטופל' : 'Select Patient'}
            </Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? 'בחר מטופל...' : 'Select patient...'} />
              </SelectTrigger>
              <SelectContent>
                {patients?.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{isRTL ? `שאלה ${currentQuestion + 1} מתוך ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-teal-200 dark:border-teal-800">
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">
                  {isRTL ? currentQ.textHe : currentQ.textEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={isRTL ? 'הקלד/י את תשובתך כאן...' : 'Type your answer here...'}
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isRTL ? 'הקודם' : 'Previous'}
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedPatientId}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? (isRTL ? 'שומר...' : 'Saving...') : (isRTL ? 'סיום ושמירה' : 'Finish & Save')}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex items-center gap-2"
            >
              {isRTL ? 'הבא' : 'Next'}
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            {isRTL ? 'חזרה' : 'Back'}
          </Button>
        </div>
      </div>
    </div>
  );
}
