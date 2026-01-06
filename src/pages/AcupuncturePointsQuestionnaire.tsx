import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, CheckCircle, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatients } from '@/hooks/usePatients';
import { usePatientAssessments } from '@/hooks/usePatientAssessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const questions = [
  {
    id: 1,
    question: 'מהי ה"אנרגיה העמוקה" (Deep Energy) של מרידיאן הריאות לפי הספר?',
    category: 'אנרגטיקה'
  },
  {
    id: 2,
    question: 'מהי נקודת ההשפעה (Influence Point) הטובה ביותר לבעיות גידים?',
    category: 'נקודות השפעה'
  },
  {
    id: 3,
    question: 'מהו המיקום המדויק ואזהרות הבטיחות לדיקור ב-BL-1?',
    category: 'מיקום ובטיחות'
  },
  {
    id: 4,
    question: 'אילו נקודות נחשבות ל"נקודות ים" (He-Sea) ומה תפקידן העיקרי?',
    category: 'נקודות חמש אלמנטים'
  },
  {
    id: 5,
    question: 'איזה שילוב נקודות מומלץ לחיזוק ה-Wei Qi (מערכת החיסון)?',
    category: 'שילובי נקודות'
  },
  {
    id: 6,
    question: 'מהי המשמעות האנרגטית של השם של נקודה ST-36 לפי הספר?',
    category: 'אנרגטיקה'
  },
  {
    id: 7,
    question: 'אילו נקודות מצוינות כאסורות לדיקור בהריון בקובץ זה?',
    category: 'התוויות נגד'
  },
  {
    id: 8,
    question: 'מהן חמש נקודות ה-Shu העתיקות של מרידיאן הכליות?',
    category: 'נקודות חמש אלמנטים'
  },
  {
    id: 9,
    question: 'כיצד משתמשים בנקודות ה-Luo כדי לטפל ברגשות?',
    category: 'נקודות לואו'
  },
  {
    id: 10,
    question: 'מהי הנקודה הטובה ביותר להורדת יאנג הכבד במצבי מיגרנה?',
    category: 'יישומים קליניים'
  },
  {
    id: 11,
    question: 'מהו התפקוד הייחודי של נקודת המקור (Yuan) של הלב (HT-7)?',
    category: 'נקודות יואן'
  },
  {
    id: 12,
    question: 'אילו נקודות מומלצות לטיפול בבחילות והקאות (Rebellious Stomach Qi)?',
    category: 'יישומים קליניים'
  },
  {
    id: 13,
    question: 'מהי הקטגוריה של נקודה SP-6 ומה טווח הפעולה שלה?',
    category: 'נקודות מפתח'
  },
  {
    id: 14,
    question: 'איזה שילוב נקודות מתאים לטיפול ב"רוח חיצונית"?',
    category: 'שילובי נקודות'
  },
  {
    id: 15,
    question: 'הסבר את השימוש בנקודות ה-Mu הקדמיות באבחנה ובטיפול.',
    category: 'נקודות מו'
  },
  {
    id: 16,
    question: 'איזו נקודה נחשבת ל"נקודת הפיקוד" (Command Point) של הגב התחתון?',
    category: 'נקודות פיקוד'
  },
  {
    id: 17,
    question: 'מהי הטכניקה הנכונה לדיקור בנקודה Ren-12?',
    category: 'טכניקות דיקור'
  },
  {
    id: 18,
    question: 'אילו נקודות פותחות את מרידיאן ה-Dai Mai (החגורה)?',
    category: 'מרידיאנים יוצאי דופן'
  },
  {
    id: 19,
    question: 'מהו התפקוד הרוחני/נפשי של נקודה GV-20 (Baihui)?',
    category: 'אנרגטיקה'
  },
  {
    id: 20,
    question: 'אילו נקודות משמשות להוצאת חום (Clearing Heat) מהגוף?',
    category: 'יישומים קליניים'
  }
];

const AcupuncturePointsQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const { data: patients } = usePatients();
  const { createAssessment, isCreating } = usePatientAssessments(selectedPatientId);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error(language === 'he' ? 'נא לבחור מטופל' : 'Please select a patient');
      return;
    }

    const answeredQuestions = Object.keys(answers).length;
    const score = (answeredQuestions / questions.length) * 100;

    await createAssessment({
      patient_id: selectedPatientId,
      assessment_type: 'acupuncture_points',
      status: answeredQuestions === questions.length ? 'completed' : 'in_progress',
      score,
      summary: `${language === 'he' ? 'שאלון נקודות דיקור' : 'Acupuncture Points Questionnaire'}: ${answeredQuestions}/${questions.length}`,
      details: { answers, questions: questions.map(q => ({ id: q.id, question: q.question, category: q.category })) }
    });

    toast.success(language === 'he' ? 'השאלון נשמר בהצלחה' : 'Questionnaire saved successfully');
    navigate('/questionnaire-hub');
  };

  const currentQ = questions[currentQuestion];

  const labels = {
    he: {
      title: 'שאלון ספר הנקודות',
      subtitle: 'מיקומים, תפקודים ואנרגטיקה',
      question: 'שאלה',
      of: 'מתוך',
      category: 'קטגוריה',
      yourAnswer: 'התשובה שלך',
      answerPlaceholder: 'הקלד את תשובתך כאן...',
      previous: 'הקודם',
      next: 'הבא',
      save: 'שמור שאלון',
      selectPatient: 'בחר מטופל',
      back: 'חזרה'
    },
    en: {
      title: 'Acupuncture Points Questionnaire',
      subtitle: 'Locations, Functions & Energetics',
      question: 'Question',
      of: 'of',
      category: 'Category',
      yourAnswer: 'Your Answer',
      answerPlaceholder: 'Type your answer here...',
      previous: 'Previous',
      next: 'Next',
      save: 'Save Questionnaire',
      selectPatient: 'Select Patient',
      back: 'Back'
    }
  };

  const t = labels[language];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/questionnaire-hub')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.back}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
          >
            <Globe className="h-4 w-4 mr-2" />
            {language === 'he' ? 'EN' : 'עב'}
          </Button>
        </div>

        {/* Title Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </CardHeader>
        </Card>

        {/* Patient Selection */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label>{t.selectPatient}</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t.selectPatient} />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
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
            <span>{t.question} {currentQuestion + 1} {t.of} {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t.category}: {currentQ.category}</span>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQ.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="text-muted-foreground mb-2 block">{t.yourAnswer}</Label>
                <Textarea
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={t.answerPlaceholder}
                  className="min-h-[150px] text-lg"
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            {t.previous}
          </Button>

          <div className="flex gap-2">
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSave} disabled={isCreating} className="bg-green-500 hover:bg-green-600">
                <Save className="h-4 w-4 ml-2" />
                {t.save}
              </Button>
            ) : (
              <Button onClick={goToNext}>
                {t.next}
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? 'bg-green-500 text-white'
                      : answers[q.id]
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {answers[q.id] ? <CheckCircle className="h-4 w-4 mx-auto" /> : index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcupuncturePointsQuestionnaire;
