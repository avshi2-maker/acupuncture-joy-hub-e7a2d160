import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, RefreshCw, CheckCircle, XCircle, MapPin, Pill, Video, Brain, Home, Share2, Users, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import retreatQuizBg from '@/assets/retreat-quiz-bg.png';

interface QuestionData {
  q: string;
  pts: string;
  herb: string;
  weight: number;
  category?: string;
}

interface CollectedTCM {
  q: string;
  pts: string;
  herb: string;
}

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
}

const questionsDB: QuestionData[] = [
  // Energy & Fatigue
  { q: "Do you wake up feeling exhausted even after a full night's sleep?", pts: "UB23, KI3", herb: "Bu Zhong Yi Qi Tang", weight: 10, category: "Energy" },
  { q: "Do you rely on coffee to get through the day?", pts: "KI3, SP6", herb: "Liu Wei Di Huang Wan", weight: 5, category: "Energy" },
  { q: "Do you experience afternoon energy crashes?", pts: "ST36, SP3", herb: "Si Jun Zi Tang", weight: 6, category: "Energy" },
  { q: "Do you feel drained after social interactions?", pts: "HT7, SP6", herb: "Gui Pi Tang", weight: 7, category: "Energy" },
  
  // Sleep & Mind
  { q: "Do you have trouble falling asleep (racing mind)?", pts: "HT7, Anmian", herb: "Gui Pi Tang", weight: 8, category: "Sleep" },
  { q: "Do you wake up frequently during the night?", pts: "HT7, KI6", herb: "Tian Wang Bu Xin Dan", weight: 8, category: "Sleep" },
  { q: "Do you have vivid dreams or nightmares?", pts: "HT7, SP6", herb: "An Shen Ding Zhi Wan", weight: 5, category: "Sleep" },
  { q: "On a scale of 1-10, is it hard to disconnect from your phone?", pts: "Yintang, HT7", herb: "Tian Wang Bu Xin Dan", weight: 10, category: "Mind" },
  
  // Physical Tension
  { q: "Do you experience chronic neck or shoulder tension?", pts: "GB20, LI4", herb: "Xiao Yao San", weight: 5, category: "Physical" },
  { q: "Do you frequently experience headaches or migraines?", pts: "GB20, LI4, Taiyang", herb: "Chuan Xiong Cha Tiao San", weight: 7, category: "Physical" },
  { q: "Do you have chronic lower back pain?", pts: "UB23, UB40, GV4", herb: "Du Huo Ji Sheng Tang", weight: 6, category: "Physical" },
  { q: "Do you grind your teeth or clench your jaw?", pts: "ST6, ST7, LI4", herb: "Tian Ma Gou Teng Yin", weight: 5, category: "Physical" },
  
  // Emotional State
  { q: "Are you going through a major life transition?", pts: "PC6, HT7", herb: "Gan Mai Da Zao Tang", weight: 15, category: "Emotional" },
  { q: "Do you feel a sense of 'stuckness' in life?", pts: "LV3, GB34", herb: "Chai Hu Shu Gan San", weight: 8, category: "Emotional" },
  { q: "Do you feel emotionally numb?", pts: "HT5, PC6", herb: "Ban Xia Hou Po Tang", weight: 12, category: "Emotional" },
  { q: "Do you experience frequent irritability or anger?", pts: "LV3, LI4, GB34", herb: "Long Dan Xie Gan Tang", weight: 8, category: "Emotional" },
  { q: "Do you feel anxious without clear reason?", pts: "PC6, HT7, Yintang", herb: "Chai Hu Jia Long Gu Mu Li Tang", weight: 10, category: "Emotional" },
  { q: "Do you cry easily or feel overwhelmed?", pts: "LV3, SP6, CV17", herb: "Xiao Yao San", weight: 7, category: "Emotional" },
  
  // Digestion & Appetite
  { q: "Do you have irregular eating habits due to stress?", pts: "ST36, SP6", herb: "Xiang Sha Liu Jun Zi", weight: 5, category: "Digestion" },
  { q: "Do you experience bloating or digestive discomfort?", pts: "CV12, ST36, SP6", herb: "Bao He Wan", weight: 5, category: "Digestion" },
  { q: "Do you have food cravings (especially sweets)?", pts: "SP6, ST36", herb: "Liu Jun Zi Tang", weight: 4, category: "Digestion" },
  { q: "Do you experience nausea or loss of appetite?", pts: "PC6, ST36, CV12", herb: "Xiang Sha Liu Jun Zi Tang", weight: 6, category: "Digestion" },
  
  // Vitality & Constitution
  { q: "Is your libido significantly lower than usual?", pts: "CV4, UB23", herb: "Zuo Gui Wan", weight: 10, category: "Vitality" },
  { q: "Do you feel cold easily, especially hands and feet?", pts: "CV4, ST36, KI7", herb: "Jin Gui Shen Qi Wan", weight: 6, category: "Vitality" },
  { q: "Do you experience frequent colds or infections?", pts: "LI4, LU7, ST36", herb: "Yu Ping Feng San", weight: 7, category: "Vitality" },
  { q: "Do you bruise easily or have slow wound healing?", pts: "SP10, UB17, ST36", herb: "Gui Pi Tang", weight: 5, category: "Vitality" },
  
  // Women's Health
  { q: "Do you experience menstrual irregularities or PMS?", pts: "SP6, LV3, CV6", herb: "Xiao Yao San", weight: 7, category: "Hormonal" },
  { q: "Do you have hot flashes or night sweats?", pts: "KI6, HT6, SP6", herb: "Zhi Bai Di Huang Wan", weight: 8, category: "Hormonal" },
  
  // Lifestyle Indicators
  { q: "Do you work more than 50 hours per week?", pts: "UB23, KI3, ST36", herb: "Bu Zhong Yi Qi Tang", weight: 8, category: "Lifestyle" },
  { q: "Have you taken a real vacation in the past year?", pts: "HT7, PC6", herb: "Gan Mai Da Zao Tang", weight: 6, category: "Lifestyle" },
  { q: "Do you feel disconnected from nature?", pts: "LV3, GB34, KI1", herb: "Xiao Yao San", weight: 5, category: "Lifestyle" },
];

type Screen = 'welcome' | 'question' | 'result';

export default function RetreatQuiz() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [collectedTCM, setCollectedTCM] = useState<CollectedTCM[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const createAssessment = useCreateAssessment();

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const startQuiz = () => {
    setScreen('question');
    setCurrentIdx(0);
    setScore(0);
    setCollectedTCM([]);
    setSaved(false);
  };

  const answer = (isYes: boolean) => {
    if (isYes) {
      setScore(prev => prev + questionsDB[currentIdx].weight);
      setCollectedTCM(prev => [...prev, {
        q: questionsDB[currentIdx].q,
        pts: questionsDB[currentIdx].pts,
        herb: questionsDB[currentIdx].herb,
      }]);
    }

    if (currentIdx + 1 >= questionsDB.length) {
      setScreen('result');
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const restart = () => {
    setScreen('welcome');
    setCurrentIdx(0);
    setScore(0);
    setCollectedTCM([]);
    setSelectedPatient('');
    setSaved(false);
  };

  // SECURITY: Only static content - never include user input in these messages
  const getResultStatus = () => {
    if (score > 60) {
      return {
        badge: 'RETREAT URGENT',
        color: 'bg-destructive',
        messagePrefix: 'Your body is showing signs of ',
        messageHighlight: 'Deep Depletion',
        messageSuffix: '. Home care is likely insufficient. A structured retreat is recommended.',
      };
    } else if (score > 30) {
      return {
        badge: 'RETREAT RECOMMENDED',
        color: 'bg-amber-500',
        messagePrefix: 'You are showing signs of ',
        messageHighlight: 'Qi Stagnation',
        messageSuffix: ' and stress. A retreat would be very beneficial to prevent burnout.',
      };
    } else {
      return {
        badge: 'MAINTENANCE MODE',
        color: 'bg-sky-500',
        messagePrefix: '',
        messageHighlight: '',
        messageSuffix: 'Your balance is reasonable. Maintenance acupuncture and lifestyle changes should be sufficient.',
      };
    }
  };

  const saveResults = async () => {
    if (!userId) {
      toast.error('Please log in to save results');
      return;
    }

    setSaving(true);
    try {
      // Save to retreat_quiz_results (original behavior)
      const insertData = {
        therapist_id: userId,
        score,
        status: getResultStatus().badge,
        collected_tcm: JSON.parse(JSON.stringify(collectedTCM)),
        total_questions: questionsDB.length,
        answered_yes: collectedTCM.length,
        ...(selectedPatient && selectedPatient !== 'none' ? { patient_id: selectedPatient } : {}),
      };

      const { error } = await supabase.from('retreat_quiz_results').insert([insertData]);

      if (error) throw error;

      // Also save to patient_assessments if patient is selected
      if (selectedPatient && selectedPatient !== 'none') {
        await createAssessment.mutateAsync({
          patient_id: selectedPatient,
          assessment_type: 'retreat',
          score,
          summary: getResultStatus().badge,
          details: JSON.parse(JSON.stringify({
            collectedTCM,
            totalQuestions: questionsDB.length,
            answeredYes: collectedTCM.length,
          })),
          status: 'saved',
        });
      }
      
      setSaved(true);
      toast.success('Quiz results saved to patient record');
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const shareViaWhatsApp = () => {
    const status = getResultStatus();
    const tcmSummary = collectedTCM.length > 0 
      ? collectedTCM.slice(0, 5).map(item => `• ${item.pts} - ${item.herb}`).join('\n')
      : 'No specific patterns detected';
    
    const message = `🌿 *TCM Retreat Assessment Results*

📊 *Status:* ${status.badge}
📈 *Score:* ${score} points

🎯 *Key Patterns Detected:*
${tcmSummary}

${collectedTCM.length > 5 ? `...and ${collectedTCM.length - 5} more patterns\n` : ''}
✨ Take your assessment: ${window.location.origin}/retreat-quiz`;

    // If patient selected with phone, send directly
    const patient = patients.find(p => p.id === selectedPatient);
    if (patient?.phone) {
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast.success(`Opening WhatsApp for ${patient.full_name}`);
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast.success('Opening WhatsApp to share results');
    }
  };

  const progress = (currentIdx / questionsDB.length) * 100;
  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${retreatQuizBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#2c4a3e',
      }}
    >
      <Helmet>
        <title>Retreat Assessment Quiz | TCM Clinic</title>
        <meta name="description" content="Discover if your body is signaling a need for deep restoration with our TCM-based retreat assessment quiz." />
      </Helmet>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border-0">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {/* Welcome Screen */}
            {screen === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center text-center p-8 min-h-[70vh]"
              >
                <h1 className="text-2xl font-bold text-jade mb-2">Retreat Assessment</h1>
                <p className="text-muted-foreground mb-6">
                  Discover if your body is signaling a need for deep restoration.
                </p>
                <div className="text-6xl mb-6">🌿</div>
                
                {/* Patient Selector */}
                {patients.length > 0 && (
                  <div className="w-full mb-6">
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Select a patient (optional)
                    </label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingPatients ? "Loading..." : "Choose patient..."} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No patient (general assessment)</SelectItem>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-jade" />
                              {patient.full_name}
                              {patient.phone && <span className="text-xs text-muted-foreground">📱</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button
                  onClick={startQuiz}
                  className="w-full bg-gold hover:bg-gold/90 text-white font-bold py-6 text-lg rounded-full"
                >
                  Start Assessment
                </Button>
              </motion.div>
            )}

            {/* Question Screen */}
            {screen === 'question' && (
              <motion.div
                key={`question-${currentIdx}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col p-6 min-h-[70vh]"
              >
                {/* Header */}
                <div className="mb-6">
                  {selectedPatientData && (
                    <p className="text-xs text-jade text-center mb-1 flex items-center justify-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedPatientData.full_name}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Question {currentIdx + 1} / {questionsDB.length}
                  </p>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question */}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-xl font-semibold text-foreground text-center leading-relaxed mb-10">
                    {questionsDB[currentIdx].q}
                  </p>

                  {/* Buttons */}
                  <div className="space-y-4">
                    <Button
                      onClick={() => answer(true)}
                      className="w-full bg-jade hover:bg-jade/90 text-white font-bold py-6 text-lg rounded-full flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      YES
                    </Button>
                    <Button
                      onClick={() => answer(false)}
                      variant="secondary"
                      className="w-full py-6 text-lg rounded-full font-bold flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      NO
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result Screen */}
            {screen === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 min-h-[70vh] overflow-y-auto"
              >
                <div className="text-left">
                  {selectedPatientData && (
                    <p className="text-xs text-jade mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Results for: {selectedPatientData.full_name}
                    </p>
                  )}
                  
                  <Badge className={`${getResultStatus().color} text-white font-bold px-4 py-2 text-sm mb-4`}>
                    {getResultStatus().badge}
                  </Badge>
                  
                  <h2 className="text-xl font-bold text-jade mb-3">Assessment Complete</h2>
                  <p className="text-muted-foreground mb-6">
                    {getResultStatus().messagePrefix}
                    {getResultStatus().messageHighlight && (
                      <strong>{getResultStatus().messageHighlight}</strong>
                    )}
                    {getResultStatus().messageSuffix}
                  </p>

                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Detected Patterns & Formulae:
                  </h3>
                  
                  <div className="bg-muted/50 rounded-xl p-4 max-h-44 overflow-y-auto border space-y-3">
                    {collectedTCM.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No specific patterns detected.</p>
                    ) : (
                      collectedTCM.map((item, idx) => (
                        <div key={idx} className="text-sm border-b border-dashed pb-3 last:border-0 last:pb-0">
                          <p className="font-medium text-foreground mb-1">{item.q}</p>
                          <p className="text-jade flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Points: {item.pts}
                          </p>
                          <p className="text-gold flex items-center gap-1">
                            <Pill className="h-3 w-3" />
                            Formula: {item.herb}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mt-6">
                    {/* Save Results Button */}
                    {userId && (
                      <Button
                        onClick={saveResults}
                        disabled={saving || saved}
                        className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${
                          saved 
                            ? 'bg-emerald-500 hover:bg-emerald-500' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saved ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saved ? 'Saved to Records' : 'Save to Patient Record'}
                      </Button>
                    )}
                    
                    {/* WhatsApp Share Button */}
                    <Button
                      onClick={shareViaWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      {selectedPatientData?.phone 
                        ? `Send to ${selectedPatientData.full_name}` 
                        : 'Share Results via WhatsApp'}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => navigate('/video-session')}
                        className="bg-jade hover:bg-jade/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Video Session
                      </Button>
                      <Button
                        onClick={() => navigate('/tcm-brain')}
                        variant="outline"
                        className="border-jade text-jade hover:bg-jade/10 font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        TCM Brain
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="secondary"
                      className="w-full py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Button>
                    
                    <Button
                      onClick={restart}
                      variant="ghost"
                      className="w-full text-muted-foreground py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Restart Assessment
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
