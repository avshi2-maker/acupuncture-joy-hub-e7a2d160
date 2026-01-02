import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wind, Snowflake, Music, Heart, Timer, Play, Pause, 
  RotateCcw, CheckCircle, ChevronRight, Ear, AlertCircle,
  ThermometerSnowflake, Waves, Languages
} from 'lucide-react';

interface BreathingExercise {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  inhale: number;
  hold?: number;
  exhale: number;
  holdAfter?: number;
  cycles: number;
  benefits: string[];
  benefitsHe: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface ColdExposureProtocol {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  duration: string;
  temperature: string;
  frequency: string;
  benefits: string[];
  benefitsHe: string[];
  contraindications: string[];
  contraindicationsHe: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic Breathing',
    nameHe: 'נשימה דיאפרגמטית',
    description: 'Deep belly breathing that directly stimulates the vagus nerve through diaphragm movement',
    descriptionHe: 'נשימה עמוקה מהבטן שמעוררת ישירות את עצב הוואגוס דרך תנועת הסרעפת',
    inhale: 4,
    exhale: 6,
    cycles: 10,
    benefits: ['Activates parasympathetic nervous system', 'Reduces heart rate', 'Lowers blood pressure'],
    benefitsHe: ['מפעיל את מערכת העצבים הפאראסימפתטית', 'מוריד דופק', 'מוריד לחץ דם'],
    level: 'beginner'
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing (4-4-4-4)',
    nameHe: 'נשימת קופסה (4-4-4-4)',
    description: 'Military-grade stress reduction technique used by Navy SEALs',
    descriptionHe: 'טכניקה צבאית להפחתת מתח בשימוש על ידי כוחות מיוחדים',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 8,
    benefits: ['Calms fight-or-flight response', 'Improves focus', 'Regulates HRV'],
    benefitsHe: ['מרגיע תגובת הילחם או ברח', 'משפר ריכוז', 'מווסת HRV'],
    level: 'intermediate'
  },
  {
    id: '4-7-8',
    name: '4-7-8 Relaxation Breath',
    nameHe: 'נשימת הרפיה 4-7-8',
    description: "Dr. Andrew Weil's natural tranquilizer for the nervous system",
    descriptionHe: 'מרגיע טבעי למערכת העצבים של ד"ר אנדרו וייל',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    benefits: ['Natural sedative effect', 'Helps with sleep', 'Reduces anxiety'],
    benefitsHe: ['אפקט מרגיע טבעי', 'עוזר לשינה', 'מפחית חרדה'],
    level: 'intermediate'
  },
  {
    id: 'resonance',
    name: 'Resonance Breathing (5.5-5.5)',
    nameHe: 'נשימת תהודה (5.5-5.5)',
    description: 'Optimal HRV breathing at 5.5 breaths per minute for maximum vagal tone',
    descriptionHe: 'נשימת HRV אופטימלית ב-5.5 נשימות לדקה לטונוס וואגאלי מקסימלי',
    inhale: 5.5,
    exhale: 5.5,
    cycles: 12,
    benefits: ['Maximizes HRV coherence', 'Synchronizes heart-brain', 'Peak vagal stimulation'],
    benefitsHe: ['ממקסם קוהרנטיות HRV', 'מסנכרן לב-מוח', 'גירוי וואגאלי מקסימלי'],
    level: 'advanced'
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril (Nadi Shodhana)',
    nameHe: 'נשימה מתחלפת (נאדי שודהנה)',
    description: 'Ancient yogic technique that balances left and right brain hemispheres',
    descriptionHe: 'טכניקה יוגית עתיקה שמאזנת את חצאי הכדורים השמאליים והימניים של המוח',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 10,
    benefits: ['Balances nervous system', 'Clears nadis/channels', 'Improves mental clarity'],
    benefitsHe: ['מאזן מערכת עצבים', 'מנקה נאדים/ערוצים', 'משפר בהירות מנטלית'],
    level: 'intermediate'
  }
];

const COLD_EXPOSURE_PROTOCOLS: ColdExposureProtocol[] = [
  {
    id: 'face-immersion',
    name: 'Cold Water Face Immersion',
    nameHe: 'טבילת פנים במים קרים',
    description: 'Mammalian dive reflex activation - the fastest way to stimulate vagus',
    descriptionHe: 'הפעלת רפלקס הצלילה של היונקים - הדרך המהירה ביותר לעורר את הוואגוס',
    duration: '15-30 seconds',
    temperature: '10-15°C (50-59°F)',
    frequency: '1-3x daily',
    benefits: ['Immediate vagal activation', 'Slows heart rate 10-25%', 'Reduces panic response'],
    benefitsHe: ['הפעלה וואגאלית מיידית', 'מאט דופק 10-25%', 'מפחית תגובת פאניקה'],
    contraindications: ['Heart conditions', "Raynaud's disease", 'Recent stroke'],
    contraindicationsHe: ['מחלות לב', 'מחלת ריינו', 'שבץ אחרון'],
    level: 'beginner'
  },
  {
    id: 'cold-shower',
    name: 'Cold Shower Protocol',
    nameHe: 'פרוטוקול מקלחת קרה',
    description: 'Progressive cold adaptation following Wim Hof methodology',
    descriptionHe: 'התאמה הדרגתית לקור לפי שיטת וים הוף',
    duration: 'Start 30sec, build to 2-3min',
    temperature: '15-20°C (59-68°F)',
    frequency: 'Daily, morning preferred',
    benefits: ['Boosts norepinephrine 200-300%', 'Increases cold shock proteins', 'Builds stress resilience'],
    benefitsHe: ['מעלה נוראפינפרין 200-300%', 'מגביר חלבוני הלם קור', 'בונה חוסן למתח'],
    contraindications: ['Pregnancy', 'Heart arrhythmias', 'Severe hypertension'],
    contraindicationsHe: ['הריון', 'הפרעות קצב לב', 'יתר לחץ דם חמור'],
    level: 'beginner'
  },
  {
    id: 'ice-bath',
    name: 'Ice Bath Immersion',
    nameHe: 'טבילת אמבט קרח',
    description: 'Full body cold immersion for deep parasympathetic activation',
    descriptionHe: 'טבילת גוף מלאה בקור להפעלה פאראסימפתטית עמוקה',
    duration: '2-10 minutes',
    temperature: '0-5°C (32-41°F)',
    frequency: '2-4x weekly',
    benefits: ['Profound vagal reset', 'Reduces inflammation (CAP)', 'Increases brown fat activity'],
    benefitsHe: ['איפוס וואגאלי עמוק', 'מפחית דלקת (CAP)', 'מגביר פעילות שומן חום'],
    contraindications: ['Cardiovascular disease', 'Epilepsy', 'Cold urticaria'],
    contraindicationsHe: ['מחלות קרדיווסקולריות', 'אפילפסיה', 'אורטיקריה קרה'],
    level: 'advanced'
  },
  {
    id: 'contrast-therapy',
    name: 'Hot-Cold Contrast Therapy',
    nameHe: 'טיפול בניגודי חום-קור',
    description: 'Alternating between sauna/hot and cold exposure',
    descriptionHe: 'החלפה בין סאונה/חום לחשיפה לקור',
    duration: '3min hot / 1min cold × 3-4 cycles',
    temperature: 'Hot: 38-40°C | Cold: 10-15°C',
    frequency: '2-3x weekly',
    benefits: ['Improves vascular function', 'Lymphatic drainage', 'Hormetic stress adaptation'],
    benefitsHe: ['משפר תפקוד וסקולרי', 'ניקוז לימפתי', 'הסתגלות לחץ הורמטי'],
    contraindications: ['Acute inflammation', 'Open wounds', 'Fever'],
    contraindicationsHe: ['דלקת אקוטית', 'פצעים פתוחים', 'חום'],
    level: 'intermediate'
  }
];

const OTHER_TECHNIQUES = [
  {
    name: 'Humming/Chanting',
    nameHe: 'זימזום/מנטרה',
    icon: Music,
    description: 'Vibrates laryngeal muscles connected to vagus nerve. "Om" chanting at 6Hz matches vagal resonance.',
    descriptionHe: 'מרטיט שרירי גרון המחוברים לעצב הוואגוס. שירת "אום" ב-6Hz תואמת תהודה וואגאלית.'
  },
  {
    name: 'Ear Massage (Tragus)',
    nameHe: 'עיסוי אוזן (טרגוס)',
    icon: Ear,
    description: 'Stimulates auricular branch of vagus (ABVN). Gently massage the tragus for 2-3 minutes.',
    descriptionHe: 'מגרה את הענף האוריקולרי של הוואגוס (ABVN). עסו בעדינות את הטרגוס למשך 2-3 דקות.'
  },
  {
    name: 'Gargling',
    nameHe: 'גרגור',
    icon: Waves,
    description: 'Activates pharyngeal muscles innervated by vagus. Gargle water vigorously for 30-60 seconds.',
    descriptionHe: 'מפעיל שרירי לוע מעוצבבים על ידי הוואגוס. גרגרו מים בעוצמה למשך 30-60 שניות.'
  }
];

interface VagusStimulationGuideProps {
  compact?: boolean;
}

export const VagusStimulationGuide: React.FC<VagusStimulationGuideProps> = ({ compact = false }) => {
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'idle'>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [language, setLanguage] = useState<'en' | 'he'>('en');

  const t = (en: string, he: string) => language === 'he' ? he : en;

  const startExercise = (exercise: BreathingExercise) => {
    setActiveExercise(exercise);
    setCycleCount(0);
    setBreathPhase('inhale');
    setIsRunning(true);
    setPhaseProgress(0);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setBreathPhase('idle');
    setPhaseProgress(0);
  };

  const resetExercise = () => {
    setCycleCount(0);
    setBreathPhase('idle');
    setIsRunning(false);
    setPhaseProgress(0);
  };

  // Breathing timer effect
  React.useEffect(() => {
    if (!isRunning || !activeExercise) return;

    const phaseDurations: Record<string, number> = {
      inhale: activeExercise.inhale,
      hold: activeExercise.hold || 0,
      exhale: activeExercise.exhale,
      holdAfter: activeExercise.holdAfter || 0
    };

    const currentDuration = phaseDurations[breathPhase] || 0;
    if (currentDuration === 0 && breathPhase !== 'idle') {
      // Skip phases with 0 duration
      if (breathPhase === 'inhale') setBreathPhase(activeExercise.hold ? 'hold' : 'exhale');
      else if (breathPhase === 'hold') setBreathPhase('exhale');
      else if (breathPhase === 'exhale') setBreathPhase(activeExercise.holdAfter ? 'holdAfter' : 'inhale');
      else if (breathPhase === 'holdAfter') {
        setCycleCount(c => c + 1);
        setBreathPhase('inhale');
      }
      return;
    }

    const interval = setInterval(() => {
      setPhaseProgress(p => {
        const newProgress = p + (100 / (currentDuration * 10));
        if (newProgress >= 100) {
          // Move to next phase
          if (breathPhase === 'inhale') {
            setBreathPhase(activeExercise.hold ? 'hold' : 'exhale');
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
          } else if (breathPhase === 'exhale') {
            if (activeExercise.holdAfter) {
              setBreathPhase('holdAfter');
            } else {
              setCycleCount(c => {
                if (c + 1 >= activeExercise.cycles) {
                  setIsRunning(false);
                  setBreathPhase('idle');
                  return c + 1;
                }
                setBreathPhase('inhale');
                return c + 1;
              });
            }
          } else if (breathPhase === 'holdAfter') {
            setCycleCount(c => {
              if (c + 1 >= activeExercise.cycles) {
                setIsRunning(false);
                setBreathPhase('idle');
                return c + 1;
              }
              setBreathPhase('inhale');
              return c + 1;
            });
          }
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, breathPhase, activeExercise]);

  // Check completion
  React.useEffect(() => {
    if (activeExercise && cycleCount >= activeExercise.cycles && isRunning) {
      setIsRunning(false);
      setBreathPhase('idle');
    }
  }, [cycleCount, activeExercise, isRunning]);

  if (compact) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Wind className="h-8 w-8 text-cyan-600" />
            <div>
              <h3 className="font-semibold text-foreground">{t('Vagus Stimulation Guide', 'מדריך גירוי הוואגוס')}</h3>
              <p className="text-xs text-muted-foreground">{t('Breathing • Cold Exposure • Techniques', 'נשימה • חשיפה לקור • טכניקות')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950/30">
              <Wind className="h-3 w-3 mr-1" /> 5 {t('Breathing', 'נשימה')}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
              <Snowflake className="h-3 w-3 mr-1" /> 4 {t('Cold', 'קור')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wind className="h-8 w-8 text-cyan-600" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('Vagus Nerve Stimulation Guide', 'מדריך גירוי עצב הוואגוס')}</h2>
            <p className="text-sm text-muted-foreground">{t('Evidence-based techniques for vagal tone', 'טכניקות מבוססות ראיות לטונוס וואגאלי')}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(l => l === 'en' ? 'he' : 'en')}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          {language === 'en' ? 'עברית' : 'English'}
        </Button>
      </div>

      <Tabs defaultValue="breathing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breathing" className="gap-2">
            <Wind className="h-4 w-4" />
            {t('Breathing', 'נשימה')}
          </TabsTrigger>
          <TabsTrigger value="cold" className="gap-2">
            <Snowflake className="h-4 w-4" />
            {t('Cold Exposure', 'חשיפה לקור')}
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-2">
            <Heart className="h-4 w-4" />
            {t('Other', 'אחר')}
          </TabsTrigger>
        </TabsList>

        {/* Breathing Exercises Tab */}
        <TabsContent value="breathing" className="space-y-4">
          {/* Active Exercise Timer */}
          {activeExercise && (
            <Card className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 border-cyan-300 dark:border-cyan-700">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="font-bold text-lg">{language === 'he' ? activeExercise.nameHe : activeExercise.name}</h3>
                  
                  {/* Breath Circle */}
                  <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                    breathPhase === 'inhale' ? 'border-cyan-500 bg-cyan-100 dark:bg-cyan-900/50 scale-110' :
                    breathPhase === 'hold' || breathPhase === 'holdAfter' ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/50' :
                    breathPhase === 'exhale' ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50 scale-90' :
                    'border-muted bg-muted/50'
                  }`}>
                    <div className="text-center">
                      <p className="text-2xl font-bold capitalize">
                        {breathPhase === 'idle' ? t('Ready', 'מוכן') : 
                         breathPhase === 'holdAfter' ? t('Hold', 'עצור') :
                         t(breathPhase.charAt(0).toUpperCase() + breathPhase.slice(1), 
                           breathPhase === 'inhale' ? 'שאף' : 
                           breathPhase === 'hold' ? 'עצור' : 'נשוף')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('Cycle', 'מחזור')} {cycleCount + 1}/{activeExercise.cycles}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <Progress value={phaseProgress} className="h-2" />

                  {/* Controls */}
                  <div className="flex justify-center gap-3">
                    {isRunning ? (
                      <Button variant="outline" onClick={stopExercise}>
                        <Pause className="h-4 w-4 mr-2" />
                        {t('Pause', 'השהה')}
                      </Button>
                    ) : (
                      <Button onClick={() => setIsRunning(true)}>
                        <Play className="h-4 w-4 mr-2" />
                        {breathPhase === 'idle' ? t('Start', 'התחל') : t('Resume', 'המשך')}
                      </Button>
                    )}
                    <Button variant="ghost" onClick={resetExercise}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t('Reset', 'אפס')}
                    </Button>
                  </div>

                  {/* Completion */}
                  {cycleCount >= activeExercise.cycles && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">{t('Session Complete!', 'הסיחה הסתיימה!')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exercise List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {BREATHING_EXERCISES.map(exercise => (
                <Card 
                  key={exercise.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeExercise?.id === exercise.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                  onClick={() => startExercise(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {language === 'he' ? exercise.nameHe : exercise.name}
                          </h4>
                          <Badge variant={
                            exercise.level === 'beginner' ? 'default' :
                            exercise.level === 'intermediate' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {t(exercise.level, 
                              exercise.level === 'beginner' ? 'מתחיל' :
                              exercise.level === 'intermediate' ? 'בינוני' : 'מתקדם')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'he' ? exercise.descriptionHe : exercise.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {exercise.inhale}s : {exercise.hold || 0}s : {exercise.exhale}s
                            {exercise.holdAfter ? ` : ${exercise.holdAfter}s` : ''}
                          </span>
                          <span>{exercise.cycles} {t('cycles', 'מחזורים')}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Cold Exposure Tab */}
        <TabsContent value="cold" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {COLD_EXPOSURE_PROTOCOLS.map(protocol => (
                <Card key={protocol.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <ThermometerSnowflake className="h-6 w-6 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {language === 'he' ? protocol.nameHe : protocol.name}
                          </h4>
                          <Badge variant={
                            protocol.level === 'beginner' ? 'default' :
                            protocol.level === 'intermediate' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {t(protocol.level,
                              protocol.level === 'beginner' ? 'מתחיל' :
                              protocol.level === 'intermediate' ? 'בינוני' : 'מתקדם')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === 'he' ? protocol.descriptionHe : protocol.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          <div className="bg-muted/50 p-2 rounded">
                            <p className="text-muted-foreground">{t('Duration', 'משך')}</p>
                            <p className="font-medium">{protocol.duration}</p>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <p className="text-muted-foreground">{t('Temp', 'טמפ')}</p>
                            <p className="font-medium">{protocol.temperature}</p>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <p className="text-muted-foreground">{t('Frequency', 'תדירות')}</p>
                            <p className="font-medium">{protocol.frequency}</p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <p className="text-xs font-medium text-green-600 mb-1">{t('Benefits:', 'יתרונות:')}</p>
                          <div className="flex flex-wrap gap-1">
                            {(language === 'he' ? protocol.benefitsHe : protocol.benefits).map((b, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {t('Contraindications:', 'התוויות נגד:')}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(language === 'he' ? protocol.contraindicationsHe : protocol.contraindications).map((c, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-red-50 dark:bg-red-950/30 border-red-200">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Other Techniques Tab */}
        <TabsContent value="other" className="space-y-4">
          <div className="space-y-3">
            {OTHER_TECHNIQUES.map((tech, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <tech.icon className="h-6 w-6 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {language === 'he' ? tech.nameHe : tech.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? tech.descriptionHe : tech.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Science Box */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-600" />
                {t('Why These Work', 'למה זה עובד')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                {t(
                  'The vagus nerve (cranial nerve X) is the main parasympathetic pathway. It controls heart rate, digestion, and immune response through the Cholinergic Anti-inflammatory Pathway (CAP).',
                  'עצב הוואגוס (עצב קרניאלי X) הוא המסלול הפאראסימפתטי הראשי. הוא שולט בקצב הלב, עיכול ותגובה חיסונית דרך המסלול האנטי-דלקתי הכולינרגי (CAP).'
                )}
              </p>
              <p>
                {t(
                  'Stimulating the vagus activates the "rest and digest" state, reducing cortisol and inflammation while improving Heart Rate Variability (HRV) - a key marker of resilience.',
                  'גירוי הוואגוס מפעיל מצב "מנוחה ועיכול", מפחית קורטיזול ודלקת תוך שיפור שונות קצב הלב (HRV) - סמן מפתח לחוסן.'
                )}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
