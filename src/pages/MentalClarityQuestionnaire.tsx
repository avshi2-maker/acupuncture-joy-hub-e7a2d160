import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, ChevronLeft, Brain } from 'lucide-react';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { usePatients } from '@/hooks/usePatients';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const questions = [
  {
    id: 'focus',
    title: 'Focus',
    questionHe: 'האם קשה לך להתרכז במשימה אחת לאורך זמן, או שדעתך מוסחת בקלות (תחושת "ערפל")?',
    questionEn: 'Is it difficult for you to concentrate on one task for a long time, or is your mind easily distracted (feeling of "fog")?'
  },
  {
    id: 'memory',
    title: 'Memory',
    questionHe: 'האם את/ה שם/ה לב לירידה בזיכרון (שכחת שמות, מילים, או היכן הנחת חפצים)?',
    questionEn: 'Do you notice a decline in memory (forgetting names, words, or where you put things)?'
  },
  {
    id: 'decisions',
    title: 'Decisions',
    questionHe: 'האם את/ה מתקשה לקבל החלטות, ולעיתים קרובות מרגיש/ה "שיתוק" מול אפשרויות?',
    questionEn: 'Do you have difficulty making decisions, and often feel "paralyzed" when facing options?'
  },
  {
    id: 'overthinking',
    title: 'Overthinking',
    questionHe: 'האם המחשבות שלך נוטות "לרוץ במעגלים" סביב אותו נושא (דאגה), במיוחד לפני השינה?',
    questionEn: 'Do your thoughts tend to "run in circles" around the same topic (worry), especially before sleep?'
  },
  {
    id: 'burnout',
    title: 'Burnout',
    questionHe: 'האם את/ה חווה תשישות מנטלית, כאילו המוח "מלא" ולא מסוגל לקלוט מידע חדש?',
    questionEn: 'Do you experience mental exhaustion, as if the brain is "full" and unable to absorb new information?'
  },
  {
    id: 'pressure',
    title: 'Pressure',
    questionHe: 'כיצד את/ה מגיב/ה לדד-ליין או ללחץ? האם את/ה נכנס/ת לחרדה וקיפאון, או פועל/ת?',
    questionEn: 'How do you respond to deadlines or pressure? Do you get anxious and freeze, or take action?'
  },
  {
    id: 'motivation',
    title: 'Motivation',
    questionHe: 'האם יש לך רעיונות ורצונות, אך חסר לך ה"דרייב" (הכוח המניע) כדי להתחיל ולבצע?',
    questionEn: 'Do you have ideas and desires, but lack the "drive" (motivating force) to start and execute?'
  },
  {
    id: 'creativity',
    title: 'Creativity',
    questionHe: 'האם את/ה מרגיש/ה חסום/ה יצירתית, ללא השראה או "זרימה"?',
    questionEn: 'Do you feel creatively blocked, without inspiration or "flow"?'
  },
  {
    id: 'sensitivity',
    title: 'Sensitivity',
    questionHe: 'האם את/ה רגיש/ה מאוד לרעשים חזקים, המונים, או למצבי רוח של אנשים אחרים?',
    questionEn: 'Are you very sensitive to loud noises, crowds, or the moods of other people?'
  },
  {
    id: 'irritability',
    title: 'Irritability',
    questionHe: 'האם את/ה מאבד/ת סבלנות מהר או מתרגז/ת בקלות כשדברים לא מסתדרים?',
    questionEn: 'Do you lose patience quickly or get easily irritated when things do not work out?'
  },
  {
    id: 'confidence',
    title: 'Confidence',
    questionHe: 'האם את/ה חווה ספק עצמי לעיתים קרובות, או תחושה שאת/ה "לא מספיק טוב/ה"?',
    questionEn: 'Do you often experience self-doubt, or a feeling that you are "not good enough"?'
  },
  {
    id: 'clarity',
    title: 'Clarity',
    questionHe: 'האם בבוקר המוח שלך צלול, או שאת/ה מתעורר/ת עם תחושת כבדות וערפל?',
    questionEn: 'Is your mind clear in the morning, or do you wake up with a feeling of heaviness and fog?'
  },
  {
    id: 'adaptability',
    title: 'Adaptability',
    questionHe: 'האם קשה לך להתמודד עם שינויים בלתי צפויים בתוכניות?',
    questionEn: 'Is it difficult for you to cope with unexpected changes in plans?'
  },
  {
    id: 'social_battery',
    title: 'Social Battery',
    questionHe: 'האם אינטראקציה חברתית ממושכת מרוקנת אותך מאנרגיה מנטלית?',
    questionEn: 'Does prolonged social interaction drain you of mental energy?'
  },
  {
    id: 'goal',
    title: 'Goal',
    questionHe: 'מהו הכוח המנטלי שהכי היית רוצה לחזק? (מיקוד, רוגע, זיכרון, או ביטחון עצמי)',
    questionEn: 'What mental strength would you most like to strengthen? (focus, calmness, memory, or self-confidence)'
  }
];

export default function MentalClarityQuestionnaire() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const { data: patients = [] } = usePatients();
  const createAssessment = useCreateAssessment();

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

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

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('נא לבחור מטופל');
      return;
    }

    const answeredCount = Object.keys(answers).length;
    
    await createAssessment.mutateAsync({
      patient_id: selectedPatientId,
      assessment_type: 'mental_clarity',
      score: Math.round((answeredCount / questions.length) * 100),
      summary: `שאלון בהירות וחוסן מנטלי - ${answeredCount}/${questions.length} שאלות נענו`,
      details: { answers, completedAt: new Date().toISOString() },
      status: 'completed'
    });

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            חזרה
          </Button>
          <div className="flex items-center gap-2 text-primary">
            <Brain className="h-5 w-5" />
            <span className="font-medium">בהירות וחוסן מנטלי</span>
          </div>
        </div>

        {/* Patient Selection */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label className="text-base mb-2 block">בחירת מטופל</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>שאלה {currentQuestion + 1} מתוך {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="px-2 py-1 bg-primary/10 rounded-md text-primary font-medium">
                    {currentQ.title}
                  </span>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQ.questionHe}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2 text-left" dir="ltr">
                  {currentQ.questionEn}
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="הקלד/י את תשובתך כאן..."
                  className="min-h-[120px] text-base"
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            הקודם
          </Button>

          <div className="flex gap-2">
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSave}
                disabled={createAssessment.isPending || !selectedPatientId}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                שמור שאלון
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                הבא
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Dots */}
        <div className="flex justify-center gap-1.5 mt-8 flex-wrap">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentQuestion
                  ? 'bg-primary scale-125'
                  : answers[questions[index].id]
                  ? 'bg-primary/50'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
