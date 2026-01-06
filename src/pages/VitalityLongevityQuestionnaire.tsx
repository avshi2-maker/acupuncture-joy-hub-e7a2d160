import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, Battery, Activity, Heart } from 'lucide-react';
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
  // Part 1: המאגר הפנימי (Energy & Reserve)
  { id: 1, text: "הסוללה הפנימית: האם את/ה מרגיש/ה שהאנרגיה שלך נגמרת בשעות הצהריים, או שיש לך כוח יציב לאורך כל היום?", section: "המאגר הפנימי", sectionIcon: <Battery className="h-5 w-5" /> },
  { id: 2, text: "איכות השינה: האם את/ה מתעורר/ת מספר פעמים בלילה (לצורך הליכה לשירותים או מתוך אי-שקט), או מתקשה לחזור לישון לפנות בוקר?", section: "המאגר הפנימי", sectionIcon: <Battery className="h-5 w-5" /> },
  { id: 3, text: "חום וקור: האם חל שינוי בתחושת הטמפרטורה שלך לאחרונה – גלי חום פתאומיים, או להפך, תחושת קור עמוקה בגב התחתון ובברכיים?", section: "המאגר הפנימי", sectionIcon: <Battery className="h-5 w-5" /> },
  { id: 4, text: "זיכרון ומיקוד: האם את/ה מרגיש/ה ירידה בחדות הזיכרון לטווח קצר (\"שכחתי למה נכנסתי לחדר\"), או קושי לשלוף מילים?", section: "המאגר הפנימי", sectionIcon: <Battery className="h-5 w-5" /> },
  { id: 5, text: "התאוששות: כשאת/ה חולה או מבצע/ת מאמץ פיזי, האם לגוף לוקח זמן רב יותר לחזור לעצמו בהשוואה לעבר?", section: "המאגר הפנימי", sectionIcon: <Battery className="h-5 w-5" /> },
  
  // Part 2: זרימה ותנועה (Circulation & Body)
  { id: 6, text: "פרקים ותנועה: האם את/ה סובל/ת מנוקשות בוקר במפרקים (אצבעות, גב, ברכיים) שמשתחררת רק אחרי תנועה וחימום?", section: "זרימה ותנועה", sectionIcon: <Activity className="h-5 w-5" /> },
  { id: 7, text: "לחץ דם וראש: האם את/ה סובל/ת לעיתים מסחרחורות, טינטון (צפצוף באוזניים) או תחושת \"לחץ\" וכבדות בראש?", section: "זרימה ותנועה", sectionIcon: <Activity className="h-5 w-5" /> },
  { id: 8, text: "עיכול וחילוף חומרים: האם יש תחושת כבדות או נפיחות בבטן גם אחרי ארוחות קטנות וקלות (חולשת עיכול)?", section: "זרימה ותנועה", sectionIcon: <Activity className="h-5 w-5" /> },
  { id: 9, text: "זרימת דם: האם את/ה מרגיש/ה נימול או הירדמות של הגפיים (ידיים/רגליים) בזמן מנוחה או בשינה?", section: "זרימה ותנועה", sectionIcon: <Activity className="h-5 w-5" /> },
  { id: 10, text: "כאב כרוני: האם ישנו כאב קבוע המלווה אותך (גב תחתון, צוואר, כתפיים) ומחמיר במזג אוויר קר או לח?", section: "זרימה ותנועה", sectionIcon: <Activity className="h-5 w-5" /> },
  
  // Part 3: רגש ומשמעות (Spirit & Lifestyle)
  { id: 11, text: "מעברים: האם השינויים בחיים (ילדים עוזבים, פרישה, שינוי קריירה) מעוררים בך תחושת חופש ושמחה, או ריקנות וחרדה?", section: "רגש ומשמעות", sectionIcon: <Heart className="h-5 w-5" /> },
  { id: 12, text: "מצב רוח: האם את/ה מוצא/ת את עצמך חסר/ת סבלנות או כעוס/ה יותר מהרגיל, או נוטה למצבי רוח דכדוכיים?", section: "רגש ומשמעות", sectionIcon: <Heart className="h-5 w-5" /> },
  { id: 13, text: "תזונה ותרופות: האם את/ה נוטל/ת מספר תרופות מרשם באופן קבוע? (חשוב לנו להבין את העומס על הכבד).", section: "רגש ומשמעות", sectionIcon: <Heart className="h-5 w-5" /> },
  { id: 14, text: "יובש: האם את/ה סובל/ת מיובש טורדני – בעיניים, בפה, בעור או בריריות? (סימן לחוסר יין - Yin Deficiency).", section: "רגש ומשמעות", sectionIcon: <Heart className="h-5 w-5" /> },
  { id: 15, text: "המטרה הבריאותית: מהו הדבר האחד שתרצה/י להמשיך לעשות ב-10 השנים הבאות ללא הגבלה (למשל: לטייל ברגל, לשחק עם הנכדים, לקרוא, לעסוק בספורט)?", section: "רגש ומשמעות", sectionIcon: <Heart className="h-5 w-5" /> },
];

const VitalityLongevityQuestionnaire: React.FC = () => {
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
        assessment_type: 'vitality_longevity',
        details: { 
          questionnaire: 'חיוניות ואריכות ימים',
          answers,
          sections: {
            energy_reserve: Object.fromEntries(
              Object.entries(answers).filter(([key]) => parseInt(key) <= 5)
            ),
            circulation_body: Object.fromEntries(
              Object.entries(answers).filter(([key]) => parseInt(key) >= 6 && parseInt(key) <= 10)
            ),
            spirit_lifestyle: Object.fromEntries(
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
              <Battery className="h-6 w-6" />
              {isHebrew ? 'חיוניות ואריכות ימים' : 'Vitality & Longevity Assessment'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {isHebrew ? 'הערכת אנרגיה ובריאות לטווח ארוך' : 'Assessing energy and long-term health'}
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

export default VitalityLongevityQuestionnaire;
