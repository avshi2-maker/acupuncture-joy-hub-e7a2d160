import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Compass, Heart, Activity, Leaf, ChevronRight, ChevronLeft, CheckCircle2, ArrowLeft, User, Save, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface Question {
  id: number;
  title: string;
  question: string;
  type: 'open' | 'choice' | 'yesno' | 'scale';
  options?: { value: string; label: string }[];
  section: 'emotional' | 'physical' | 'lifestyle';
}

const questions: Question[] = [
  // Section: Emotional Landscape (Shen & Spirit)
  {
    id: 1,
    title: 'המוקד העיקרי',
    question: 'במשפט אחד, מהו האתגר המרכזי שמונע ממך להרגיש במיטבך היום?',
    type: 'open',
    section: 'emotional'
  },
  {
    id: 2,
    title: 'האקלים הרגשי',
    question: 'האם את/ה מוצא/ת את עצמך מרגיש/ה לעיתים קרובות יותר:',
    type: 'choice',
    options: [
      { value: 'frustrated', label: 'מתוסכל/ת או חסר/ת סבלנות' },
      { value: 'anxious', label: 'חרד/ה או חסר/ת שקט' },
      { value: 'sad', label: 'עצוב/ה או מסוגר/ת' },
      { value: 'overwhelmed', label: 'מוצף/ת או דאגן/ית' }
    ],
    section: 'emotional'
  },
  {
    id: 3,
    title: 'נקודת המפנה',
    question: 'האם מצב הרוח שלך משתנה בפתאומיות (כמו "מתג") במצבי לחץ, או שמדובר בתחושה קבועה בעוצמה נמוכה?',
    type: 'choice',
    options: [
      { value: 'sudden', label: 'משתנה בפתאומיות' },
      { value: 'constant', label: 'תחושה קבועה בעוצמה נמוכה' }
    ],
    section: 'emotional'
  },
  {
    id: 4,
    title: 'המחשבות',
    question: 'האם קשה לך "לכבות" את המחשבות לפני השינה, או שאת/ה מתעורר/ת עם מחשבות מתרוצצות?',
    type: 'choice',
    options: [
      { value: 'before_sleep', label: 'קשה לכבות מחשבות לפני השינה' },
      { value: 'racing_morning', label: 'מתעורר/ת עם מחשבות מתרוצצות' },
      { value: 'both', label: 'שניהם' },
      { value: 'neither', label: 'אף אחד מהם' }
    ],
    section: 'emotional'
  },
  // Section: Physical Signals (Qi & Blood)
  {
    id: 5,
    title: 'איכות השינה',
    question: 'האם את/ה מתעורר/ת ספציפית בין השעות 1:00 ל-3:00 לפנות בוקר, או מתקשה להירדם בתחילת הלילה?',
    type: 'choice',
    options: [
      { value: 'wake_1_3', label: 'מתעורר/ת בין 1:00 ל-3:00' },
      { value: 'hard_fall_asleep', label: 'קשה להירדם בתחילת הלילה' },
      { value: 'both', label: 'שניהם' },
      { value: 'neither', label: 'אף אחד מהם' }
    ],
    section: 'physical'
  },
  {
    id: 6,
    title: 'רמת האנרגיה',
    question: 'בסולם של 1 עד 10, מהי רמת האנרגיה שלך בבוקר בהשוואה לשעות אחר הצהריים המאוחרות?',
    type: 'scale',
    section: 'physical'
  },
  {
    id: 7,
    title: 'טמפרטורה',
    question: 'האם את/ה נוטה לסבול מידיים ורגליים קרות, או שאת/ה מרגיש/ה לעיתים קרובות חום יתר (במיוחד בלילה)?',
    type: 'choice',
    options: [
      { value: 'cold', label: 'ידיים ורגליים קרות' },
      { value: 'hot', label: 'חום יתר (במיוחד בלילה)' },
      { value: 'both', label: 'משתנה' },
      { value: 'neither', label: 'לא סובל/ת מאף אחד' }
    ],
    section: 'physical'
  },
  {
    id: 8,
    title: 'עיכול ורגש',
    question: 'האם את/ה חווה נפיחות בבטן או חוסר תיאבון בזמנים של מתח או חרדה?',
    type: 'yesno',
    section: 'physical'
  },
  {
    id: 9,
    title: 'מוקדי כאב',
    question: 'האם את/ה נוטה לצבור מתח באזור הצוואר והכתפיים, או סובל/ת מכאבי ראש/מיגרנות תכופים?',
    type: 'choice',
    options: [
      { value: 'neck_shoulders', label: 'מתח בצוואר וכתפיים' },
      { value: 'headaches', label: 'כאבי ראש/מיגרנות' },
      { value: 'both', label: 'שניהם' },
      { value: 'neither', label: 'לא סובל/ת מאף אחד' }
    ],
    section: 'physical'
  },
  {
    id: 10,
    title: 'תחושה בגרון',
    question: 'האם את/ה מרגיש/ה לעיתים תחושה של "גוש" בגרון שמקשה על הבליעה (ללא סיבה רפואית)?',
    type: 'yesno',
    section: 'physical'
  },
  // Section: Lifestyle & Environment (Jing & Essence)
  {
    id: 11,
    title: 'סוללה חברתית',
    question: 'האם שהייה בקבוצות של אנשים מרוקנת אותך מאנרגיה, או שאת/ה מרגיש/ה טוב יותר בחברה?',
    type: 'choice',
    options: [
      { value: 'drained', label: 'מרוקן/ת מאנרגיה' },
      { value: 'energized', label: 'מרגיש/ה טוב יותר בחברה' },
      { value: 'depends', label: 'תלוי במצב' }
    ],
    section: 'lifestyle'
  },
  {
    id: 12,
    title: 'ריכוז וזיכרון',
    question: 'האם קשה לך להתרכז במשימות או בלימודים, ולעיתים קרובות את/ה מרגיש/ה תחושת "ערפל" מחשבתי?',
    type: 'yesno',
    section: 'lifestyle'
  },
  {
    id: 13,
    title: 'תנועה',
    question: 'האם את/ה מרגיש/ה טוב יותר או רע יותר (מותש/ת) לאחר פעילות גופנית מאומצת?',
    type: 'choice',
    options: [
      { value: 'better', label: 'מרגיש/ה טוב יותר' },
      { value: 'worse', label: 'מרגיש/ה מותש/ת' },
      { value: 'depends', label: 'תלוי בסוג הפעילות' }
    ],
    section: 'lifestyle'
  },
  {
    id: 14,
    title: 'חשקים',
    question: 'האם יש לך חשקים ספציפיים למתוק, מלוח, או למשקאות קרים במיוחד?',
    type: 'choice',
    options: [
      { value: 'sweet', label: 'מתוק' },
      { value: 'salty', label: 'מלוח' },
      { value: 'cold', label: 'משקאות קרים' },
      { value: 'none', label: 'אין חשקים ספציפיים' }
    ],
    section: 'lifestyle'
  },
  {
    id: 15,
    title: 'המטרה',
    question: 'אם היינו יכולים לשפר סימפטום אחד בלבד ב-50% במהלך החודש הקרוב, איזה שינוי ישפיע הכי הרבה על איכות חייך?',
    type: 'open',
    section: 'lifestyle'
  }
];

const sectionInfo = {
  emotional: { 
    icon: Heart, 
    title: 'הנוף הרגשי', 
    subtitle: 'Shen & Spirit',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20'
  },
  physical: { 
    icon: Activity, 
    title: 'איתותים פיזיים', 
    subtitle: 'Qi & Blood',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20'
  },
  lifestyle: { 
    icon: Leaf, 
    title: 'סגנון חיים', 
    subtitle: 'Jing & Essence',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20'
  }
};

interface Patient {
  id: string;
  full_name: string;
}

export default function HealthCompass() {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patient');
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [energyMorning, setEnergyMorning] = useState(5);
  const [energyAfternoon, setEnergyAfternoon] = useState(5);
  const [isComplete, setIsComplete] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(preselectedPatientId);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('therapist_id', user.id)
        .order('full_name');

      if (!error && data) {
        setPatients(data);
      }
    };
    fetchPatients();
  }, []);

  // Save assessment to database
  const saveAssessment = async () => {
    if (!selectedPatientId) {
      toast.error('יש לבחור מטופל לפני השמירה');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('יש להתחבר כדי לשמור');
        return;
      }

      // Build structured answers with question details
      const structuredAnswers = questions.map(q => ({
        questionId: q.id,
        title: q.title,
        question: q.question,
        section: q.section,
        type: q.type,
        answer: answers[q.id] || null
      }));

      const { data, error } = await supabase
        .from('patient_assessments')
        .insert({
          patient_id: selectedPatientId,
          therapist_id: user.id,
          assessment_type: 'health_compass',
          details: { 
            answers: structuredAnswers,
            version: '1.0',
            completedAt: new Date().toISOString()
          },
          status: 'completed',
          summary: `Health Compass - ${Object.keys(answers).length}/${questions.length} questions answered`
        })
        .select('id')
        .single();

      if (error) throw error;

      setSavedAssessmentId(data.id);
      toast.success('השאלון נשמר בהצלחה!');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('שגיאה בשמירת השאלון');
    } finally {
      setIsSaving(false);
    }
  };
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const section = sectionInfo[question.section];
  const SectionIcon = section.icon;

  const handleAnswer = (value: string | number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const canProceed = () => {
    if (question.type === 'scale') {
      return true; // Scale always has a value
    }
    return answers[question.id] !== undefined && answers[question.id] !== '';
  };

  if (isComplete) {
    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4" dir="rtl">
        <div className="max-w-2xl mx-auto pt-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">תודה על מילוי השאלון!</h1>
            <p className="text-muted-foreground text-lg mb-8">
              המידע שסיפקת יעזור לנו להתאים עבורך תוכנית טיפול אישית
            </p>

            {/* Patient selection and save */}
            {!savedAssessmentId && (
              <Card className="mb-6 text-right">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <Label className="text-base font-medium">שמירת השאלון לכרטיס מטופל</Label>
                    </div>
                    <Select 
                      value={selectedPatientId || ''} 
                      onValueChange={setSelectedPatientId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="בחר מטופל..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={saveAssessment} 
                      disabled={!selectedPatientId || isSaving}
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          שומר...
                        </>
                      ) : (
                        <>
                          <Save className="ml-2 h-4 w-4" />
                          שמור לכרטיס מטופל
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {savedAssessmentId && (
              <Card className="mb-6 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      השאלון נשמר בהצלחה לכרטיס של {selectedPatient?.full_name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/crm">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  חזרה ללוח הבקרה
                </Link>
              </Button>
              <Button onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setIsComplete(false);
                setSavedAssessmentId(null);
                setSelectedPatientId(preselectedPatientId);
              }}>
                מילוי שאלון חדש
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/crm">
                <ArrowLeft className="ml-2 h-4 w-4" />
                חזרה
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">המצפן הבריאותי שלך</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Section Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${section.bg} mb-6`}>
              <SectionIcon className={`h-4 w-4 ${section.color}`} />
              <span className="font-medium">{section.title}</span>
              <span className="text-xs text-muted-foreground">({section.subtitle})</span>
            </div>

            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                    {question.title}
                  </span>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {question.type === 'open' && (
                  <Textarea
                    placeholder="כתוב/י את תשובתך כאן..."
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="min-h-[120px] text-lg"
                    dir="rtl"
                  />
                )}

                {question.type === 'choice' && question.options && (
                  <RadioGroup
                    value={(answers[question.id] as string) || ''}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {question.options.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                          answers[question.id] === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                        onClick={() => handleAnswer(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="text-base cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === 'yesno' && (
                  <div className="flex gap-4">
                    <Button
                      variant={answers[question.id] === 'yes' ? 'default' : 'outline'}
                      size="lg"
                      className="flex-1 h-16 text-lg"
                      onClick={() => handleAnswer('yes')}
                    >
                      כן
                    </Button>
                    <Button
                      variant={answers[question.id] === 'no' ? 'default' : 'outline'}
                      size="lg"
                      className="flex-1 h-16 text-lg"
                      onClick={() => handleAnswer('no')}
                    >
                      לא
                    </Button>
                  </div>
                )}

                {question.type === 'scale' && (
                  <div className="space-y-8 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">אנרגיה בבוקר</Label>
                        <span className="text-2xl font-bold text-primary">{energyMorning}</span>
                      </div>
                      <Slider
                        value={[energyMorning]}
                        onValueChange={([val]) => {
                          setEnergyMorning(val);
                          handleAnswer(`morning:${val},afternoon:${energyAfternoon}`);
                        }}
                        min={1}
                        max={10}
                        step={1}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>נמוכה מאוד</span>
                        <span>גבוהה מאוד</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">אנרגיה אחר הצהריים</Label>
                        <span className="text-2xl font-bold text-primary">{energyAfternoon}</span>
                      </div>
                      <Slider
                        value={[energyAfternoon]}
                        onValueChange={([val]) => {
                          setEnergyAfternoon(val);
                          handleAnswer(`morning:${energyMorning},afternoon:${val}`);
                        }}
                        min={1}
                        max={10}
                        step={1}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>נמוכה מאוד</span>
                        <span>גבוהה מאוד</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            size="lg"
          >
            <ChevronRight className="ml-2 h-4 w-4" />
            הקודם
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            size="lg"
            className="min-w-[120px]"
          >
            {currentQuestion === questions.length - 1 ? 'סיום' : 'הבא'}
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
