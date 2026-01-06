import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, Shield } from 'lucide-react';
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
    id: 'illness_frequency',
    textHe: 'באיזו תדירות את/ה חולה (צינון/שפעת) במהלך השנה? האם את/ה מרגיש/ה שאת/ה "תופס/ת" כל וירוס שעובר בסביבה?',
    textEn: 'How often do you get sick (cold/flu) during the year? Do you feel like you "catch" every virus around?',
    type: 'choice',
    options: [
      { value: 'rarely', labelHe: 'לעיתים רחוקות (1-2 בשנה)', labelEn: 'Rarely (1-2 per year)' },
      { value: 'sometimes', labelHe: 'לפעמים (3-4 בשנה)', labelEn: 'Sometimes (3-4 per year)' },
      { value: 'often', labelHe: 'לעיתים קרובות (5+ בשנה)', labelEn: 'Often (5+ per year)' },
      { value: 'constantly', labelHe: 'כמעט תמיד חולה', labelEn: 'Almost always sick' },
    ],
  },
  {
    id: 'response_to_symptoms',
    textHe: 'כשאת/ה מרגיש/ה סימנים ראשונים של מחלה, האם את/ה עוצר/ת ונח/ה, או ממשיך/ה בשגרה כרגיל ("להתעלם ולדחוף")?',
    textEn: 'When you feel first signs of illness, do you stop and rest, or continue as usual ("ignore and push through")?',
    type: 'choice',
    options: [
      { value: 'rest', labelHe: 'עוצר/ת ונח/ה מייד', labelEn: 'Stop and rest immediately' },
      { value: 'slow_down', labelHe: 'מאט/ה קצת', labelEn: 'Slow down a bit' },
      { value: 'push_through', labelHe: 'ממשיך/ה בשגרה', labelEn: 'Continue as usual' },
      { value: 'ignore', labelHe: 'מתעלם/ת לחלוטין', labelEn: 'Completely ignore' },
    ],
  },
  {
    id: 'recovery_speed',
    textHe: 'כאשר את/ה חולה, כמה זמן לוקח לך להחלים לחלוטין ולחזור לאנרגיה מלאה? (ימים בודדים או שבועות ארוכים?)',
    textEn: 'When sick, how long does it take you to fully recover and return to full energy? (few days or long weeks?)',
    type: 'choice',
    options: [
      { value: 'fast', labelHe: 'ימים בודדים', labelEn: 'A few days' },
      { value: 'week', labelHe: 'כשבוע', labelEn: 'About a week' },
      { value: 'two_weeks', labelHe: 'שבועיים', labelEn: 'Two weeks' },
      { value: 'long', labelHe: 'יותר משבועיים', labelEn: 'More than two weeks' },
    ],
  },
  {
    id: 'exposure',
    textHe: 'האם את/ה חשוף/ה באופן קבוע לאנשים חולים (עבודה בבית ספר, בית חולים, משרד צפוף)?',
    textEn: 'Are you regularly exposed to sick people (work in school, hospital, crowded office)?',
    type: 'choice',
    options: [
      { value: 'high', labelHe: 'כן, חשיפה גבוהה', labelEn: 'Yes, high exposure' },
      { value: 'moderate', labelHe: 'חשיפה בינונית', labelEn: 'Moderate exposure' },
      { value: 'low', labelHe: 'חשיפה נמוכה', labelEn: 'Low exposure' },
      { value: 'minimal', labelHe: 'כמעט ללא חשיפה', labelEn: 'Almost no exposure' },
    ],
  },
  {
    id: 'temperature',
    textHe: 'האם את/ה נוטה לסבול מקור, במיוחד בידיים וברגליים, או מרגיש/ה צמרמורות בקלות כשיש רוח/מזגן?',
    textEn: 'Do you tend to suffer from cold, especially in hands and feet, or easily feel chills in wind/AC?',
    type: 'choice',
    options: [
      { value: 'always_cold', labelHe: 'תמיד קר לי', labelEn: 'Always cold' },
      { value: 'cold_extremities', labelHe: 'ידיים ורגליים קרות', labelEn: 'Cold hands and feet' },
      { value: 'sensitive_ac', labelHe: 'רגיש/ה למזגן/רוח', labelEn: 'Sensitive to AC/wind' },
      { value: 'normal', labelHe: 'רגיל', labelEn: 'Normal' },
    ],
  },
  {
    id: 'sleep_immunity',
    textHe: 'האם את/ה שם/ה לב שחוסר שינה או תקופות עמוסות מובילים כמעט מייד למחלה?',
    textEn: 'Do you notice that lack of sleep or busy periods lead almost immediately to illness?',
    type: 'choice',
    options: [
      { value: 'always', labelHe: 'כן, תמיד', labelEn: 'Yes, always' },
      { value: 'often', labelHe: 'לעיתים קרובות', labelEn: 'Often' },
      { value: 'sometimes', labelHe: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'rarely', labelHe: 'לעיתים רחוקות', labelEn: 'Rarely' },
    ],
  },
  {
    id: 'exercise',
    textHe: 'האם את/ה נוטה לחזור לפעילות גופנית מאומצת מיד כשאת/ה מרגיש/ה מעט יותר טוב, או נותן/ת לגוף זמן להתאושש?',
    textEn: 'Do you tend to return to strenuous exercise immediately when feeling better, or give your body time to recover?',
    type: 'choice',
    options: [
      { value: 'immediately', labelHe: 'חוזר/ת מייד', labelEn: 'Return immediately' },
      { value: 'soon', labelHe: 'חוזר/ת מהר מדי', labelEn: 'Return too soon' },
      { value: 'gradual', labelHe: 'חזרה הדרגתית', labelEn: 'Gradual return' },
      { value: 'full_rest', labelHe: 'נותן/ת זמן מלא', labelEn: 'Give full time' },
    ],
  },
  {
    id: 'morning_symptoms',
    textHe: 'האם את/ה מתעורר/ת בבוקר עם גודש באף, ליחה בגרון או התעטשויות (שעוברים בהמשך היום)?',
    textEn: 'Do you wake up in the morning with nasal congestion, phlegm in throat, or sneezing (that pass later in the day)?',
    type: 'choice',
    options: [
      { value: 'daily', labelHe: 'כן, כל יום', labelEn: 'Yes, every day' },
      { value: 'often', labelHe: 'לעיתים קרובות', labelEn: 'Often' },
      { value: 'sometimes', labelHe: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'rarely', labelHe: 'לעיתים רחוקות', labelEn: 'Rarely' },
    ],
  },
  {
    id: 'digestion',
    textHe: 'האם שינויים בתזונה (כמו אכילת סוכר או מוצרי חלב) משפיעים לרעה על מערכת הנשימה שלך (יותר ליחה/צינונים)?',
    textEn: 'Do dietary changes (like eating sugar or dairy) negatively affect your respiratory system (more phlegm/colds)?',
    type: 'choice',
    options: [
      { value: 'dairy', labelHe: 'כן, מוצרי חלב', labelEn: 'Yes, dairy products' },
      { value: 'sugar', labelHe: 'כן, סוכר', labelEn: 'Yes, sugar' },
      { value: 'both', labelHe: 'שניהם', labelEn: 'Both' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'stress_pattern',
    textHe: 'האם את/ה חולה לעיתים קרובות דווקא בסופי שבוע או בחופשות (כשמפלס הלחץ יורד)?',
    textEn: 'Do you often get sick specifically on weekends or vacations (when stress levels drop)?',
    type: 'choice',
    options: [
      { value: 'always', labelHe: 'כן, תמיד', labelEn: 'Yes, always' },
      { value: 'often', labelHe: 'לעיתים קרובות', labelEn: 'Often' },
      { value: 'sometimes', labelHe: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'chronic_cough',
    textHe: 'האם יש לך נטייה לשיעול מתמשך שנשאר שבועות אחרי שהצינון חלף?',
    textEn: 'Do you tend to have a persistent cough that stays for weeks after the cold passes?',
    type: 'choice',
    options: [
      { value: 'always', labelHe: 'כן, תמיד', labelEn: 'Yes, always' },
      { value: 'often', labelHe: 'לעיתים קרובות', labelEn: 'Often' },
      { value: 'sometimes', labelHe: 'לפעמים', labelEn: 'Sometimes' },
      { value: 'no', labelHe: 'לא', labelEn: 'No' },
    ],
  },
  {
    id: 'household',
    textHe: 'האם יש ילדים קטנים בבית ש"מביאים" וירוסים מהגן/בית ספר באופן קבוע?',
    textEn: 'Are there young children at home who regularly "bring" viruses from kindergarten/school?',
    type: 'choice',
    options: [
      { value: 'yes_young', labelHe: 'כן, ילדים קטנים', labelEn: 'Yes, young children' },
      { value: 'yes_school', labelHe: 'כן, ילדים בבי"ס', labelEn: 'Yes, school-age children' },
      { value: 'no_children', labelHe: 'אין ילדים בבית', labelEn: 'No children at home' },
      { value: 'grown', labelHe: 'ילדים גדולים', labelEn: 'Grown children' },
    ],
  },
  {
    id: 'hydration',
    textHe: 'האם את/ה מקפיד/ה על שתייה מספקת במהלך היום, או שאת/ה נוטה לשכוח לשתות?',
    textEn: 'Do you make sure to drink enough during the day, or do you tend to forget to drink?',
    type: 'choice',
    options: [
      { value: 'good', labelHe: 'מקפיד/ה על שתייה', labelEn: 'Make sure to drink' },
      { value: 'moderate', labelHe: 'שותה בינוני', labelEn: 'Drink moderately' },
      { value: 'forget', labelHe: 'נוטה לשכוח', labelEn: 'Tend to forget' },
      { value: 'poor', labelHe: 'שותה מעט מאוד', labelEn: 'Drink very little' },
    ],
  },
  {
    id: 'seasons',
    textHe: 'האם יש עונה מסוימת בשנה שבה הבריאות שלך תמיד מתערערת (מעברי עונות, חורף)?',
    textEn: 'Is there a specific season when your health always deteriorates (seasonal transitions, winter)?',
    type: 'choice',
    options: [
      { value: 'winter', labelHe: 'חורף', labelEn: 'Winter' },
      { value: 'transitions', labelHe: 'מעברי עונות', labelEn: 'Seasonal transitions' },
      { value: 'spring', labelHe: 'אביב (אלרגיות)', labelEn: 'Spring (allergies)' },
      { value: 'no_pattern', labelHe: 'אין דפוס מסוים', labelEn: 'No specific pattern' },
    ],
  },
  {
    id: 'goal',
    textHe: 'מהי המטרה העיקרית שלך בחיזוק המערכת החיסונית? (פחות ימי מחלה, יותר אנרגיה בחורף, או התאוששות מהירה יותר)',
    textEn: 'What is your main goal in strengthening your immune system? (fewer sick days, more energy in winter, or faster recovery)',
    type: 'text',
  },
];

export default function ImmuneShieldQuestionnaire() {
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
        assessment_type: 'immune_shield',
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
            <Shield className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? 'שאלון חוסן חיסוני והתאוששות' : 'Immune Shield & Recovery Questionnaire'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL ? 'הערכה מקיפה של המערכת החיסונית והתאוששות' : 'Comprehensive immune system and recovery assessment'}
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
