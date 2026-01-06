import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, Heart, User } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Question {
  id: string;
  textHe: string;
  textEn: string;
  category: string;
}

const questions: Question[] = [
  {
    id: 'chief_complaint',
    textHe: 'במשפט אחד, מהו הקושי הבריאותי העיקרי שמפריע לאיכות החיים שלך כיום?',
    textEn: 'In one sentence, what is the main health difficulty affecting your quality of life today?',
    category: 'Chief Complaint'
  },
  {
    id: 'digestion_lower',
    textHe: 'האם היציאות שלך סדירות, או שאת/ה סובל/ת מעצירות כרונית (צורך במישלשלים) או משלשולים תכופים?',
    textEn: 'Are your bowel movements regular, or do you suffer from chronic constipation (need for laxatives) or frequent diarrhea?',
    category: 'Digestion (Lower)'
  },
  {
    id: 'digestion_upper',
    textHe: 'האם את/ה סובל/ת מצרבות, תחושת "שריפה" בחזה, או חוסר נוחות בבטן העליונה לאחר האוכל?',
    textEn: 'Do you suffer from heartburn, burning sensation in chest, or upper abdominal discomfort after eating?',
    category: 'Digestion (Upper)'
  },
  {
    id: 'nutrition',
    textHe: 'האם יש לך תיאבון בריא ואת/ה מצליח/ה לשמור על משקל יציב, או שיש ירידה במשקל ובחשק לאכול?',
    textEn: 'Do you have a healthy appetite and maintain stable weight, or is there weight loss and decreased desire to eat?',
    category: 'Nutrition'
  },
  {
    id: 'breath',
    textHe: 'האם את/ה חווה קוצר נשימה או התעייפות מהירה גם במאמץ קל (כמו הליכה קצרה או עלייה במדרגות)?',
    textEn: 'Do you experience shortness of breath or quick fatigue even with mild exertion (like short walks or climbing stairs)?',
    category: 'Breath'
  },
  {
    id: 'sleep',
    textHe: 'האם שנת הלילה שלך שקטה, או שאת/ה מתעורר/ת לעיתים קרובות (מכאב, צורך בשירותים, או דום נשימה)?',
    textEn: 'Is your night sleep peaceful, or do you wake up frequently (from pain, bathroom needs, or sleep apnea)?',
    category: 'Sleep'
  },
  {
    id: 'balance',
    textHe: 'האם את/ה מרגיש/ה לעיתים סחרחורת (ורטיגו), חוסר יציבות בהליכה, או חשש מנפילה?',
    textEn: 'Do you sometimes feel dizziness (vertigo), unsteady walking, or fear of falling?',
    category: 'Balance'
  },
  {
    id: 'pain',
    textHe: 'האם כאבים במפרקים (ברכיים, ירכיים) או בגב מגבילים את התנועה שלך בבית או בחוץ?',
    textEn: 'Do joint pains (knees, hips) or back pain limit your movement at home or outside?',
    category: 'Pain'
  },
  {
    id: 'circulation',
    textHe: 'האם את/ה סובל/ת מקור קיצוני בכפות הידיים והרגליים (תופעת ריינו), או דווקא מגלי חום והזעה?',
    textEn: 'Do you suffer from extreme cold in hands and feet (Raynaud\'s), or rather from hot flashes and sweating?',
    category: 'Circulation'
  },
  {
    id: 'memory',
    textHe: 'האם את/ה או הקרובים אליך מבחינים בשינויים בזיכרון, בלבול, או קושי בריכוז לאחרונה?',
    textEn: 'Do you or those close to you notice changes in memory, confusion, or difficulty concentrating recently?',
    category: 'Memory'
  },
  {
    id: 'mood',
    textHe: 'האם מצב הרוח שלך יציב, או שאת/ה חווה תקופות של עצבות עמוקה, חרדה או תחושת בדידות?',
    textEn: 'Is your mood stable, or do you experience periods of deep sadness, anxiety, or loneliness?',
    category: 'Mood'
  },
  {
    id: 'urinary',
    textHe: 'האם את/ה נתקל/ת בקושי לשלוט בשתן (דליפה), או בקושי להתחיל במתן שתן (פרוסטטה)?',
    textEn: 'Do you have difficulty controlling urine (leakage), or difficulty starting urination (prostate)?',
    category: 'Urinary'
  },
  {
    id: 'senses',
    textHe: 'האם חלה ירידה משמעותית בראייה או בשמיעה (טינטון) שמפריעה לך בתקשורת עם הסביבה?',
    textEn: 'Has there been significant decline in vision or hearing (tinnitus) that interferes with communication?',
    category: 'Senses'
  },
  {
    id: 'medication',
    textHe: 'האם את/ה נעזר/ת במטפל/ת סיעודי/ת, והאם ריבוי התרופות גורם לך לתופעות לוואי במערכת העיכול?',
    textEn: 'Do you have caregiver assistance, and does polypharmacy cause digestive side effects?',
    category: 'Medication'
  },
  {
    id: 'the_goal',
    textHe: 'מהו הדבר החשוב לך ביותר לשמר בשנים הקרובות? (למשל: צלילות הדעת, הליכה עצמאית, או רוגע נפשי)',
    textEn: 'What is most important for you to preserve in the coming years? (e.g., mental clarity, independent walking, or peace of mind)',
    category: 'The Goal'
  }
];

export default function LongevityDignityQuestionnaire() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  
  const { data: patients = [] } = usePatients();
  const createAssessment = useCreateAssessment();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('נא לבחור מטופל');
      return;
    }

    try {
      await createAssessment.mutateAsync({
        patient_id: selectedPatientId,
        assessment_type: 'longevity_dignity',
        details: { answers, questionnaire_version: '1.0' },
        summary: `Longevity & Dignity Assessment - ${Object.keys(answers).length} questions answered`,
        status: 'completed'
      });
      
      toast.success('השאלון נשמר בהצלחה!');
      navigate(-1);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast.error('שגיאה בשמירת השאלון');
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-rose-500/5 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-rose-500" />
            <h1 className="text-3xl font-bold text-foreground">אריכות ימים ואיכות חיים</h1>
          </div>
          <p className="text-muted-foreground text-lg">שאלון הערכת בריאות לגיל השלישי | Longevity & Dignity</p>
        </motion.div>

        {/* Patient Selection */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="border-rose-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-rose-500" />
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="בחר מטופל..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Bar */}
        {!isComplete && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>שאלה {currentQuestion + 1} מתוך {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-rose-500/20">
                <CardHeader>
                  <div className="text-sm font-medium text-rose-600 mb-2">
                    {currentQ.category}
                  </div>
                  <CardTitle className="text-xl leading-relaxed text-foreground">
                    {currentQ.textHe}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 italic" dir="ltr">
                    {currentQ.textEn}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="הקלד/י את תשובתך כאן..."
                    className="min-h-[120px] text-lg"
                    dir="rtl"
                  />

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                      className="gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      הקודם
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      className="gap-2 bg-rose-500 hover:bg-rose-600"
                    >
                      {currentQuestion === questions.length - 1 ? 'סיום' : 'הבא'}
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="shadow-lg border-rose-500/20">
                <CardContent className="py-12">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    השאלון הושלם!
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    נענו {Object.keys(answers).filter(k => answers[k]).length} מתוך {questions.length} שאלות
                  </p>
                  
                  {!selectedPatientId && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-2">בחר מטופל לשמירה:</p>
                      <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger className="max-w-xs mx-auto">
                          <SelectValue placeholder="בחר מטופל..." />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setIsComplete(false)}
                    >
                      חזרה לעריכה
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={createAssessment.isPending || !selectedPatientId}
                      className="gap-2 bg-rose-500 hover:bg-rose-600"
                    >
                      {createAssessment.isPending ? 'שומר...' : 'שמור תוצאות'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
