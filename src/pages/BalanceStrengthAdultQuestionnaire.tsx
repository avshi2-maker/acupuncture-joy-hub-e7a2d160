import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, Activity, User } from 'lucide-react';
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
    textHe: 'במשפט אחד, מהו האתגר הבריאותי המרכזי שמונע ממך להרגיש במיטבך כיום?',
    textEn: 'In one sentence, what is the main health challenge preventing you from feeling your best today?',
    category: 'Chief Complaint'
  },
  {
    id: 'stress_liver',
    textHe: 'כיצד את/ה חווה מתח (סטרס) בחיי היומיום? (למשל: התפרצויות כעס, תחושת \'תקיעות\' בגרון/חזה, או חרדה ודאגה)',
    textEn: 'How do you experience stress in daily life? (e.g., anger outbursts, feeling of tightness in throat/chest, or anxiety and worry)',
    category: 'Stress (The Liver)'
  },
  {
    id: 'womens_health',
    textHe: '(לנשים) האם המחזור החודשי שלך סדיר? האם את סובלת מכאבים חזקים, תסמונת קדם-וסתית (PMS) או שינויים קיצוניים במצב הרוח?',
    textEn: '(For women) Is your menstrual cycle regular? Do you suffer from severe pain, PMS, or extreme mood changes?',
    category: "Women's Health (Cycle)"
  },
  {
    id: 'digestion',
    textHe: 'האם את/ה סובל/ת מנפיחות בבטן, צרבות, "מעי רגיז" (IBS) או עייפות בולטת לאחר ארוחות?',
    textEn: 'Do you suffer from bloating, heartburn, IBS, or noticeable fatigue after meals?',
    category: 'Digestion (The Gut)'
  },
  {
    id: 'sleep_quality',
    textHe: 'האם קשה לך להירדם בגלל "ראש רץ" (מחשבות), או שאת/ה מתעורר/ת עייף/ה גם אחרי שנת לילה?',
    textEn: 'Is it hard to fall asleep due to racing thoughts, or do you wake up tired even after a full night\'s sleep?',
    category: 'Sleep Quality'
  },
  {
    id: 'energy_levels',
    textHe: 'בסולם של 1-10, כמה אנרגיה יש לך באמצע היום? האם את/ה זקוק/ה לקפה או מתוק כדי להמשיך לתפקד?',
    textEn: 'On a scale of 1-10, how much energy do you have midday? Do you need coffee or sweets to keep functioning?',
    category: 'Energy Levels'
  },
  {
    id: 'headaches_tension',
    textHe: 'האם את/ה סובל/ת מכאבי ראש, מיגרנות, או מתח כרוני באזור הכתפיים והצוואר (במיוחד מול מחשב)?',
    textEn: 'Do you suffer from headaches, migraines, or chronic tension in shoulders and neck (especially at the computer)?',
    category: 'Headaches & Tension'
  },
  {
    id: 'pain_injury',
    textHe: 'האם יש לך פציעות ספורט ישנות שחוזרות להציק, או כאבי גב תחתון המוחמרים בישיבה/עמידה ממושכת?',
    textEn: 'Do you have old sports injuries that keep recurring, or lower back pain worsened by prolonged sitting/standing?',
    category: 'Pain & Injury'
  },
  {
    id: 'temperature',
    textHe: 'האם הידיים והרגליים שלך נוטות להיות קרות תמיד, או שאת/ה סובל/ת מחום והזעת יתר?',
    textEn: 'Are your hands and feet always cold, or do you suffer from heat and excessive sweating?',
    category: 'Temperature'
  },
  {
    id: 'immunity',
    textHe: 'האם את/ה נוטה לחלות לעיתים קרובות (צינון/שפעת), או סובל/ת מאלרגיות עונתיות וסינוסיטיס?',
    textEn: 'Do you tend to get sick often (cold/flu), or suffer from seasonal allergies and sinusitis?',
    category: 'Immunity (Wei Qi)'
  },
  {
    id: 'skin_health',
    textHe: 'האם העור שלך נוטה לאקנה, אדמומיות, פריחות או יובש קיצוני המחמיר במצבי לחץ?',
    textEn: 'Does your skin tend toward acne, redness, rashes, or extreme dryness that worsens under stress?',
    category: 'Skin Health'
  },
  {
    id: 'focus_mind',
    textHe: 'האם את/ה חווה קושי להתרכז, "ערפל מחשבתי" או מוסחות דעת גבוהה במהלך העבודה/לימודים?',
    textEn: 'Do you experience difficulty concentrating, brain fog, or high distractibility during work/studies?',
    category: 'Focus & Mind'
  },
  {
    id: 'lifestyle',
    textHe: 'האם אורח החיים שלך כולל ישיבה ממושכת ומיעוט תנועה, או פעילות גופנית אינטנסיבית (אולי אינטנסיבית מדי)?',
    textEn: 'Does your lifestyle include prolonged sitting and little movement, or intense (perhaps too intense) physical activity?',
    category: 'Lifestyle'
  },
  {
    id: 'cravings',
    textHe: 'האם יש לך חשקים עזים וספציפיים (למשל: למתוק, למלוח, או למזון שומני) כשאת/ה עייף/ה או לחוץ/ה?',
    textEn: 'Do you have intense specific cravings (e.g., sweet, salty, or fatty foods) when tired or stressed?',
    category: 'Cravings'
  },
  {
    id: 'the_goal',
    textHe: 'אם הטיפול יצליח מעבר למצופה, איך ייראו החיים שלך בעוד 3 חודשים מהיום? (מה תוכל/י לעשות שלא ניתן כיום)',
    textEn: 'If treatment succeeds beyond expectations, how will your life look 3 months from now? (What could you do that you can\'t today)',
    category: 'The Goal'
  }
];

export default function BalanceStrengthAdultQuestionnaire() {
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
        assessment_type: 'balance_strength_adult',
        details: { answers, questionnaire_version: '1.0' },
        summary: `Balance & Strength Adult Assessment - ${Object.keys(answers).length} questions answered`,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">שאלון איזון וחיזוק</h1>
          </div>
          <p className="text-muted-foreground text-lg">מבוגרים (18-50) | Balance & Strengthening</p>
        </motion.div>

        {/* Patient Selection */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
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
              <Card className="shadow-lg border-primary/20">
                <CardHeader>
                  <div className="text-sm font-medium text-primary mb-2">
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
                      className="gap-2"
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
              <Card className="shadow-lg border-primary/20">
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
                      className="gap-2"
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
