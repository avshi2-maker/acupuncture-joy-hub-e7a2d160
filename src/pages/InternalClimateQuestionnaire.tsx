import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, Thermometer, Wind, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  section: string;
  sectionIcon: React.ReactNode;
}

const questions: Question[] = [
  // Part 1: הרדאר הפנימי (Sensitivity & Environment)
  { id: 1, text: "החזאי האישי: האם את/ה מרגיש/ה שינויים פיזיים בגוף (כאבי ראש, מפרקים, עייפות) עוד לפני שמזג האוויר משתנה בחוץ?", section: "הרדאר הפנימי", sectionIcon: <Thermometer className="h-5 w-5" /> },
  { id: 2, text: "טמפרטורת ליבה: האם את/ה סובל/ת יותר בחום הקיץ (חוסר שקט, הזעה, אדמומיות) או בקור החורף (קיפאון, כיווץ שרירים)?", section: "הרדאר הפנימי", sectionIcon: <Thermometer className="h-5 w-5" /> },
  { id: 3, text: "לחות וכבדות: בימים לחים ודביקים, האם את/ה מרגיש/ה תחושת \"משקולת\" על הגוף, נפיחות או ערפל מחשבתי?", section: "הרדאר הפנימי", sectionIcon: <Thermometer className="h-5 w-5" /> },
  { id: 4, text: "רוח ושינוי: האם חשיפה לרוח חזקה או למזגן ישיר גורמת לך לכאבי ראש, צוואר תפוס או צינון מיידי?", section: "הרדאר הפנימי", sectionIcon: <Thermometer className="h-5 w-5" /> },
  { id: 5, text: "יובש: האם את/ה נוטה לסבול מיובש קיצוני (עור סדוק, צמא תמידי, שיעול יבש) בסביבות ממוזגות או בעונות מעבר?", section: "הרדאר הפנימי", sectionIcon: <Thermometer className="h-5 w-5" /> },
  
  // Part 2: תגובות הגוף (Physical Response)
  { id: 6, text: "כאבי ראש: האם כאבי הראש שלך מופיעים בעיקר כשחם מאוד (פעימות ברקות) או כשיש לחץ ברומטרי נמוך/סופות?", section: "תגובות הגוף", sectionIcon: <Wind className="h-5 w-5" /> },
  { id: 7, text: "נשימה ואלרגיה: האם את/ה חווה קשיי נשימה או החמרה באלרגיות בעונות מעבר (אביב/סתיו) או כשמזג האוויר מאובק?", section: "תגובות הגוף", sectionIcon: <Wind className="h-5 w-5" /> },
  { id: 8, text: "מפרקים: האם המפרקים שלך \"נוקשים\" וכואבים יותר בימים גשומים וקרים (קור-לחות)?", section: "תגובות הגוף", sectionIcon: <Wind className="h-5 w-5" /> },
  { id: 9, text: "עיכול עונתי: האם את/ה סובל/ת משלשולים או חוסר נוחות בבטן בקיץ (בגלל לחות-חום) או מכאבי בטן בחורף?", section: "תגובות הגוף", sectionIcon: <Wind className="h-5 w-5" /> },
  { id: 10, text: "עור: האם העור שלך מגיב בפריחות מגרדות בחום (Heat Rash) או באקזמה וסדקים בקור?", section: "תגובות הגוף", sectionIcon: <Wind className="h-5 w-5" /> },
  
  // Part 3: אנרגיה ומחזוריות (Cycles & Adaptation)
  { id: 11, text: "שעון ביולוגי: האם את/ה מתקשה להתעורר או לתפקד בימים אפורים וחסרי שמש (SAD - דיכאון חורף)?", section: "אנרגיה ומחזוריות", sectionIcon: <Sun className="h-5 w-5" /> },
  { id: 12, text: "נוזלים: האם את/ה מרגיש/ה מיובש/ת באופן כרוני למרות שתייה מרובה, או שאת/ה צובר/ת נוזלים (בצקות) בקלות?", section: "אנרגיה ומחזוריות", sectionIcon: <Sun className="h-5 w-5" /> },
  { id: 13, text: "שינה: האם השינה שלך מופרעת יותר בלילות חמים (חום פנימי) או שאת/ה מתעורר/ת מקור?", section: "אנרגיה ומחזוריות", sectionIcon: <Sun className="h-5 w-5" /> },
  { id: 14, text: "הסתגלות: כשאת/ה טס/ה או משנה סביבה גיאוגרפית, האם לוקח לגוף שלך זמן רב \"להתאפס\" (ג'ט-לג קשה, עצירות, נדודי שינה)?", section: "אנרגיה ומחזוריות", sectionIcon: <Sun className="h-5 w-5" /> },
  { id: 15, text: "היעד: אם הטיפול יכול לעזור לך להתמודד עם עונה אחת בלבד בצורה מושלמת – איזו עונה הכי קשה לך כיום?", section: "אנרגיה ומחזוריות", sectionIcon: <Sun className="h-5 w-5" /> },
];

const InternalClimateQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHebrew = language === 'he';
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentAnswer.trim()) {
      setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: currentAnswer }));
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setCurrentAnswer(answers[questions[currentQuestion + 1]?.id] || '');
      } else {
        setIsCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: currentAnswer }));
      setCurrentQuestion(prev => prev - 1);
      setCurrentAnswer(answers[questions[currentQuestion - 1]?.id] || '');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(isHebrew ? 'יש להתחבר כדי לשמור' : 'Please login to save');
        return;
      }

      const assessmentData = {
        patient_id: user.id,
        therapist_id: user.id,
        assessment_type: 'internal_climate',
        details: { 
          questionnaire: 'בקרת אקלים פנימית',
          answers,
          sections: {
            sensitivity_environment: Object.fromEntries(
              Object.entries(answers).filter(([key]) => parseInt(key) <= 5)
            ),
            physical_response: Object.fromEntries(
              Object.entries(answers).filter(([key]) => parseInt(key) >= 6 && parseInt(key) <= 10)
            ),
            cycles_adaptation: Object.fromEntries(
              Object.entries(answers).filter(([key]) => parseInt(key) >= 11)
            )
          }
        },
        status: 'completed',
        score: Object.keys(answers).length
      };

      const { error } = await supabase
        .from('patient_assessments')
        .insert(assessmentData);

      if (error) throw error;

      toast.success(isHebrew ? 'השאלון נשמר בהצלחה!' : 'Questionnaire saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error(isHebrew ? 'שגיאה בשמירה' : 'Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center border-b border-border/50">
            <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <Thermometer className="h-6 w-6" />
              {isHebrew ? 'בקרת אקלים פנימית' : 'Internal Climate Control'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {isHebrew ? 'הבנת תגובות הגוף לסביבה' : 'Understanding body responses to environment'}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {!isCompleted ? (
              <>
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{isHebrew ? `שאלה ${currentQuestion + 1} מתוך ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}</span>
                    <span className="flex items-center gap-1">
                      {question.sectionIcon}
                      {question.section}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: isHebrew ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isHebrew ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <p className="text-lg font-medium leading-relaxed text-foreground">
                      {question.text}
                    </p>

                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={isHebrew ? 'הקלד/י את תשובתך כאן...' : 'Type your answer here...'}
                      className="w-full h-32 p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    {isHebrew ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    {isHebrew ? 'הקודם' : 'Previous'}
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim()}
                    className="gap-2"
                  >
                    {currentQuestion === questions.length - 1 
                      ? (isHebrew ? 'סיום' : 'Finish') 
                      : (isHebrew ? 'הבא' : 'Next')}
                    {isHebrew ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {isHebrew ? 'השאלון הושלם!' : 'Questionnaire Completed!'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isHebrew ? 'ענית על כל 15 השאלות' : 'You answered all 15 questions'}
                </p>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Check className="h-4 w-4" />
                  {isSaving 
                    ? (isHebrew ? 'שומר...' : 'Saving...') 
                    : (isHebrew ? 'שמור תוצאות' : 'Save Results')}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternalClimateQuestionnaire;
