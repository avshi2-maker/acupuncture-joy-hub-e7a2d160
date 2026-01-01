import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, RefreshCw, CheckCircle, XCircle, MapPin, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import retreatQuizBg from '@/assets/retreat-quiz-bg.png';

interface QuestionData {
  q: string;
  pts: string;
  herb: string;
  weight: number;
}

interface CollectedTCM {
  q: string;
  pts: string;
  herb: string;
}

const questionsDB: QuestionData[] = [
  { q: "Do you wake up feeling exhausted even after a full night's sleep?", pts: "UB23, KI3", herb: "Bu Zhong Yi Qi Tang", weight: 10 },
  { q: "On a scale of 1-10, is it hard to disconnect from your phone?", pts: "Yintang, HT7", herb: "Tian Wang Bu Xin Dan", weight: 10 },
  { q: "Do you experience chronic neck or shoulder tension?", pts: "GB20, LI4", herb: "Xiao Yao San", weight: 5 },
  { q: "Are you going through a major life transition?", pts: "PC6, HT7", herb: "Gan Mai Da Zao Tang", weight: 15 },
  { q: "Do you have irregular eating habits due to stress?", pts: "ST36, SP6", herb: "Xiang Sha Liu Jun Zi", weight: 5 },
  { q: "Do you feel a sense of 'stuckness' in life?", pts: "LV3, GB34", herb: "Chai Hu Shu Gan San", weight: 8 },
  { q: "Is your libido significantly lower than usual?", pts: "CV4, UB23", herb: "Zuo Gui Wan", weight: 10 },
  { q: "Do you feel emotionally numb?", pts: "HT5, PC6", herb: "Ban Xia Hou Po Tang", weight: 12 },
  { q: "Do you rely on coffee to get through the day?", pts: "KI3, SP6", herb: "Liu Wei Di Huang Wan", weight: 5 },
  { q: "Do you have trouble falling asleep (racing mind)?", pts: "HT7, Anmian", herb: "Gui Pi Tang", weight: 8 },
];

type Screen = 'welcome' | 'question' | 'result';

export default function RetreatQuiz() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [collectedTCM, setCollectedTCM] = useState<CollectedTCM[]>([]);

  const startQuiz = () => {
    setScreen('question');
    setCurrentIdx(0);
    setScore(0);
    setCollectedTCM([]);
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
  };

  const getResultStatus = () => {
    if (score > 60) {
      return {
        badge: 'RETREAT URGENT',
        color: 'bg-destructive',
        message: 'Your body is showing signs of <strong>Deep Depletion</strong>. Home care is likely insufficient. A structured retreat is recommended.',
      };
    } else if (score > 30) {
      return {
        badge: 'RETREAT RECOMMENDED',
        color: 'bg-amber-500',
        message: 'You are showing signs of <strong>Qi Stagnation</strong> and stress. A retreat would be very beneficial to prevent burnout.',
      };
    } else {
      return {
        badge: 'MAINTENANCE MODE',
        color: 'bg-sky-500',
        message: 'Your balance is reasonable. Maintenance acupuncture and lifestyle changes should be sufficient.',
      };
    }
  };

  const progress = (currentIdx / questionsDB.length) * 100;

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
                <div className="text-6xl mb-8">🌿</div>
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
                  <Badge className={`${getResultStatus().color} text-white font-bold px-4 py-2 text-sm mb-4`}>
                    {getResultStatus().badge}
                  </Badge>
                  
                  <h2 className="text-xl font-bold text-jade mb-3">Assessment Complete</h2>
                  <p
                    className="text-muted-foreground mb-6"
                    dangerouslySetInnerHTML={{ __html: getResultStatus().message }}
                  />

                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Detected Patterns & Formulae:
                  </h3>
                  
                  <div className="bg-muted/50 rounded-xl p-4 max-h-52 overflow-y-auto border space-y-3">
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

                  <Button
                    onClick={restart}
                    className="w-full mt-6 bg-gold hover:bg-gold/90 text-white font-bold py-5 rounded-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restart Assessment
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
