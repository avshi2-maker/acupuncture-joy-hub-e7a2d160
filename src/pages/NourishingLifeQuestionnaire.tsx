import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, ChevronLeft, Utensils } from 'lucide-react';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { usePatients } from '@/hooks/usePatients';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const questions = [
  {
    id: 'challenge',
    title: 'Challenge',
    questionHe: 'במשפט אחד, מהו האתגר התזונתי הגדול ביותר שלך כיום? (למשל: חשקים למתוק, אי-סדירות, נפיחות, או עייפות אחרי אוכל)',
    questionEn: 'In one sentence, what is your biggest nutritional challenge today? (e.g., sweet cravings, irregularity, bloating, or fatigue after eating)'
  },
  {
    id: 'breakfast',
    title: 'Breakfast',
    questionHe: 'האם את/ה אוכל/ת ארוחת בוקר? אם כן, האם היא חמה (דייסה/ביצה) או קרה (יוגורט/שייק)?',
    questionEn: 'Do you eat breakfast? If so, is it warm (porridge/eggs) or cold (yogurt/shake)?'
  },
  {
    id: 'timing',
    title: 'Timing',
    questionHe: 'האם את/ה נוהג/ת לאכול ארוחות כבדות בשעות המאוחרות של הלילה (אחרי 19:00)?',
    questionEn: 'Do you tend to eat heavy meals late at night (after 7:00 PM)?'
  },
  {
    id: 'temperature',
    title: 'Temperature',
    questionHe: 'מהי העדפת המזון שלך? האם את/ה אוכל/ת בעיקר מזון נא/קר (סלטים, סמודיז) או מזון מבושל וחם?',
    questionEn: 'What is your food preference? Do you mainly eat raw/cold food (salads, smoothies) or cooked and warm food?'
  },
  {
    id: 'energy_drop',
    title: 'Energy Drop',
    questionHe: 'האם את/ה מרגיש/ה "צניחת אנרגיה" (עייפות כבדה) וצורך לישון מיד לאחר האוכל?',
    questionEn: 'Do you feel an "energy drop" (heavy fatigue) and need to sleep immediately after eating?'
  },
  {
    id: 'bloating',
    title: 'Bloating',
    questionHe: 'האם את/ה סובל/ת מנפיחות בבטן, גזים או תחושת "בלון" שמתגברת במהלך היום?',
    questionEn: 'Do you suffer from abdominal bloating, gas, or a "balloon" feeling that intensifies during the day?'
  },
  {
    id: 'hydration',
    title: 'Hydration',
    questionHe: 'האם את/ה מעדיף/ה לשתות מים קפואים/קרים מאוד, או שאת/ה נמשך/ת למשקאות חמים/פושרים?',
    questionEn: 'Do you prefer to drink icy/very cold water, or are you drawn to warm/lukewarm drinks?'
  },
  {
    id: 'sweet_cravings',
    title: 'Sweet Cravings',
    questionHe: 'האם יש לך צורך עז במתוקים או בפחמימות (לחם/פסטה), במיוחד בשעות אחר הצהריים?',
    questionEn: 'Do you have strong cravings for sweets or carbohydrates (bread/pasta), especially in the afternoon?'
  },
  {
    id: 'salt_spice',
    title: 'Salt/Spice',
    questionHe: 'האם את/ה מוצא/ת את עצמך ממליח/ה את האוכל בצורה מוגזמת, או מחפש/ת טעמים חריפים?',
    questionEn: 'Do you find yourself over-salting food, or seeking spicy flavors?'
  },
  {
    id: 'dairy',
    title: 'Dairy',
    questionHe: 'האם צריכת מוצרי חלב גורמת לך לליחה (בגרון/סינוסים), נזלת או אי-נוחות בבטן?',
    questionEn: 'Does dairy consumption cause mucus (in throat/sinuses), runny nose, or abdominal discomfort?'
  },
  {
    id: 'raw_veg',
    title: 'Raw Veg',
    questionHe: 'האם אכילת סלט גדול או ירקות חיים גורמת לך לכאבי בטן או ליציאות רכות?',
    questionEn: 'Does eating a large salad or raw vegetables cause stomach pain or loose stools?'
  },
  {
    id: 'appetite',
    title: 'Appetite',
    questionHe: 'האם את/ה חווה רעב תמידי שלא יודע שובע, או חוסר תיאבון מוחלט?',
    questionEn: 'Do you experience constant hunger that is never satisfied, or complete lack of appetite?'
  },
  {
    id: 'emotions',
    title: 'Emotions',
    questionHe: 'האם את/ה נוטה לפנות לאוכל (מנחם) בזמנים של מתח, עצב או שעמום?',
    questionEn: 'Do you tend to turn to food (comfort eating) during times of stress, sadness, or boredom?'
  },
  {
    id: 'caffeine',
    title: 'Caffeine',
    questionHe: 'כמה כוסות קפה את/ה שותה ביום? האם את/ה מרגיש/ה שבלעדיו המערכת לא מתפקדת?',
    questionEn: 'How many cups of coffee do you drink per day? Do you feel that without it your system does not function?'
  },
  {
    id: 'one_change',
    title: 'One Change',
    questionHe: 'אם היית יכול/ה לשנות הרגל תזונתי אחד בלבד שישפר את בריאותך, מה הוא היה?',
    questionEn: 'If you could change just one nutritional habit to improve your health, what would it be?'
  }
];

export default function NourishingLifeQuestionnaire() {
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
      assessment_type: 'nourishing_life',
      score: Math.round((answeredCount / questions.length) * 100),
      summary: `שאלון הזנת החיים - ${answeredCount}/${questions.length} שאלות נענו`,
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
            <Utensils className="h-5 w-5" />
            <span className="font-medium">הזנת החיים</span>
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
