import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, Activity, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Question {
  id: string;
  textHe: string;
  textEn: string;
  type: 'text' | 'scale' | 'choice';
  options?: { value: string; labelHe: string; labelEn: string }[];
}

const questions: Question[] = [
  {
    id: 'injury_details',
    textHe: 'במשפט אחד, מהי הפציעה או הטראומה העיקרית שמביאה אותך לטיפול היום? (למשל: תאונה, נפילה, פציעת ספורט, או כאב כרוני)',
    textEn: 'In one sentence, what is the main injury or trauma that brings you to treatment today? (e.g., accident, fall, sports injury, or chronic pain)',
    type: 'text',
  },
  {
    id: 'pain_quality',
    textHe: 'כיצד היית מתאר/ת את הכאב? האם הוא חד ודוקר (כמו סכין), עמום ולוחץ, או שורף?',
    textEn: 'How would you describe the pain? Is it sharp and stabbing (like a knife), dull and pressing, or burning?',
    type: 'choice',
    options: [
      { value: 'sharp', labelHe: 'חד ודוקר', labelEn: 'Sharp and stabbing' },
      { value: 'dull', labelHe: 'עמום ולוחץ', labelEn: 'Dull and pressing' },
      { value: 'burning', labelHe: 'שורף', labelEn: 'Burning' },
      { value: 'mixed', labelHe: 'משולב', labelEn: 'Mixed' },
    ],
  },
  {
    id: 'night_pain',
    textHe: 'האם הכאב מחמיר באופן משמעותי בלילה, או אפילו מעיר אותך משינה?',
    textEn: 'Does the pain significantly worsen at night, or even wake you from sleep?',
    type: 'choice',
    options: [
      { value: 'yes_wakes', labelHe: 'כן, מעיר אותי משינה', labelEn: 'Yes, wakes me from sleep' },
      { value: 'yes_worse', labelHe: 'כן, מחמיר בלילה', labelEn: 'Yes, worsens at night' },
      { value: 'no_difference', labelHe: 'לא, אין הבדל', labelEn: 'No difference' },
      { value: 'better_night', labelHe: 'משתפר בלילה', labelEn: 'Better at night' },
    ],
  },
  {
    id: 'weather',
    textHe: 'האם את/ה מרגיש/ה החמרה בכאב או בנוקשות כשמזג האוויר משתנה (קור, גשם, או רוח)?',
    textEn: 'Do you feel worsening pain or stiffness when the weather changes (cold, rain, or wind)?',
    type: 'choice',
    options: [
      { value: 'cold', labelHe: 'כן, בקור', labelEn: 'Yes, in cold' },
      { value: 'rain', labelHe: 'כן, בגשם', labelEn: 'Yes, in rain' },
      { value: 'humidity', labelHe: 'כן, בלחות', labelEn: 'Yes, in humidity' },
      { value: 'no', labelHe: 'לא מושפע', labelEn: 'Not affected' },
    ],
  },
  {
    id: 'swelling',
    textHe: 'האם יש נפיחות נראית לעין, בצקת או תחושת "מלאות" באזור הפגוע?',
    textEn: 'Is there visible swelling, edema, or a feeling of "fullness" in the affected area?',
    type: 'choice',
    options: [
      { value: 'visible_swelling', labelHe: 'כן, נפיחות נראית', labelEn: 'Yes, visible swelling' },
      { value: 'feeling_fullness', labelHe: 'תחושת מלאות', labelEn: 'Feeling of fullness' },
      { value: 'sometimes', labelHe: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'movement',
    textHe: 'האם הכאב מחמיר בתחילת תנועה ומשתפר לאחר "חימום", או שהוא מחמיר ככל שאת/ה פעיל/ה יותר?',
    textEn: 'Does the pain worsen at the start of movement and improve after "warming up", or does it worsen the more active you are?',
    type: 'choice',
    options: [
      { value: 'improves_warmup', labelHe: 'משתפר אחרי חימום', labelEn: 'Improves after warming up' },
      { value: 'worse_activity', labelHe: 'מחמיר עם פעילות', labelEn: 'Worsens with activity' },
      { value: 'constant', labelHe: 'קבוע', labelEn: 'Constant' },
      { value: 'unpredictable', labelHe: 'לא ניתן לחזות', labelEn: 'Unpredictable' },
    ],
  },
  {
    id: 'stiffness',
    textHe: 'האם את/ה סובל/ת מנוקשות שמגבילה את טווח התנועה (למשל: קושי להרים יד, להתכופף)?',
    textEn: 'Do you suffer from stiffness that limits your range of motion (e.g., difficulty raising arm, bending)?',
    type: 'choice',
    options: [
      { value: 'severe', labelHe: 'כן, מגביל מאוד', labelEn: 'Yes, very limiting' },
      { value: 'moderate', labelHe: 'כן, מתון', labelEn: 'Yes, moderate' },
      { value: 'mild', labelHe: 'קל', labelEn: 'Mild' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'temperature',
    textHe: 'האם המקום הפגוע מרגיש חם למגע ואדום, או קר ונוטה להכחיל?',
    textEn: 'Does the affected area feel hot to the touch and red, or cold and tends to turn blue?',
    type: 'choice',
    options: [
      { value: 'hot_red', labelHe: 'חם ואדום', labelEn: 'Hot and red' },
      { value: 'cold_blue', labelHe: 'קר ומכחיל', labelEn: 'Cold and bluish' },
      { value: 'normal', labelHe: 'רגיל', labelEn: 'Normal' },
      { value: 'varies', labelHe: 'משתנה', labelEn: 'Varies' },
    ],
  },
  {
    id: 'nerve_pain',
    textHe: 'האם יש תחושת נימול, הירדמות, או זרמים חשמליים המקרינים מהאזור הפגוע לגפיים?',
    textEn: 'Is there numbness, tingling, or electrical currents radiating from the affected area to the limbs?',
    type: 'choice',
    options: [
      { value: 'numbness', labelHe: 'נימול/הירדמות', labelEn: 'Numbness/tingling' },
      { value: 'electric', labelHe: 'זרמים חשמליים', labelEn: 'Electric currents' },
      { value: 'both', labelHe: 'שניהם', labelEn: 'Both' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'bruising',
    textHe: 'האם נוצרים אצלך שטפי דם (סימנים כחולים) בקלות? האם הם נשארים זמן רב?',
    textEn: 'Do you bruise easily? Do bruises stay for a long time?',
    type: 'choice',
    options: [
      { value: 'easy_long', labelHe: 'כן, בקלות ונשארים זמן רב', labelEn: 'Yes, easily and stay long' },
      { value: 'easy_short', labelHe: 'בקלות אך נעלמים מהר', labelEn: 'Easily but disappear fast' },
      { value: 'normal', labelHe: 'רגיל', labelEn: 'Normal' },
      { value: 'rarely', labelHe: 'לעיתים רחוקות', labelEn: 'Rarely' },
    ],
  },
  {
    id: 'trauma_memory',
    textHe: 'האם האירוע שגרם לפציעה עדיין מעורר בך פחד, חרדה או זיכרונות לא נעימים?',
    textEn: 'Does the event that caused the injury still evoke fear, anxiety, or unpleasant memories?',
    type: 'choice',
    options: [
      { value: 'strong', labelHe: 'כן, מאוד', labelEn: 'Yes, very much' },
      { value: 'sometimes', labelHe: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'mild', labelHe: 'קצת', labelEn: 'A little' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'healing_speed',
    textHe: 'האם באופן כללי פצעים וחתכים מחלימים אצלך לאט, או שאת/ה מחלים/ה במהירות?',
    textEn: 'In general, do wounds and cuts heal slowly for you, or do you heal quickly?',
    type: 'choice',
    options: [
      { value: 'slow', labelHe: 'לאט', labelEn: 'Slowly' },
      { value: 'normal', labelHe: 'רגיל', labelEn: 'Normal' },
      { value: 'fast', labelHe: 'מהר', labelEn: 'Quickly' },
    ],
  },
  {
    id: 'fatigue',
    textHe: 'מאז הפציעה, האם את/ה מרגיש/ה עייפות כללית גדולה מהרגיל?',
    textEn: 'Since the injury, do you feel more general fatigue than usual?',
    type: 'choice',
    options: [
      { value: 'severe', labelHe: 'כן, עייפות קשה', labelEn: 'Yes, severe fatigue' },
      { value: 'moderate', labelHe: 'כן, עייפות מתונה', labelEn: 'Yes, moderate fatigue' },
      { value: 'mild', labelHe: 'קצת', labelEn: 'A little' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'scars',
    textHe: 'האם יש צלקות ישנות באזור הכואב שמורגשות כנוקשות או רגישות למגע?',
    textEn: 'Are there old scars in the painful area that feel stiff or sensitive to touch?',
    type: 'choice',
    options: [
      { value: 'stiff', labelHe: 'כן, נוקשות', labelEn: 'Yes, stiff' },
      { value: 'sensitive', labelHe: 'כן, רגישות', labelEn: 'Yes, sensitive' },
      { value: 'both', labelHe: 'שניהם', labelEn: 'Both' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'goal',
    textHe: 'מהי הפעולה הספציפית שאת/ה הכי רוצה לחזור לעשות ללא כאב? (למשל: לרוץ, להרים נכדים, לישון בנוחות)',
    textEn: 'What specific activity do you most want to return to doing without pain? (e.g., run, lift grandchildren, sleep comfortably)',
    type: 'text',
  },
];

export default function PainRehabilitationQuestionnaire() {
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
        assessment_type: 'pain_rehabilitation',
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

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id] || '';

  return (
    <div className="min-h-screen bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? 'שאלון שיקום וטיפול בכאב' : 'Pain Rehabilitation Questionnaire'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL ? 'הערכה מקיפה לטיפול בכאב ושיקום' : 'Comprehensive pain treatment and rehabilitation assessment'}
          </p>
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
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">
                  {isRTL ? currentQ.textHe : currentQ.textEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentQ.type === 'text' && (
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={isRTL ? 'הקלד/י את תשובתך כאן...' : 'Type your answer here...'}
                    className="min-h-[120px]"
                  />
                )}

                {currentQ.type === 'choice' && currentQ.options && (
                  <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-3">
                    {currentQ.options.map(option => (
                      <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer">
                          {isRTL ? option.labelHe : option.labelEn}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
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
              className="flex items-center gap-2"
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
      </div>
    </div>
  );
}
