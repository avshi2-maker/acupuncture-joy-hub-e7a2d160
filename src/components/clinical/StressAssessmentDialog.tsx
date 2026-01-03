import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Brain, 
  Moon, 
  Zap, 
  Leaf, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StressAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (result: StressAssessmentResult) => void;
}

interface Question {
  id: string;
  text: string;
  textHe: string;
  category: 'physical' | 'emotional' | 'sleep' | 'energy' | 'mental';
  icon: React.ComponentType<{ className?: string }>;
}

interface StressAssessmentResult {
  score: number;
  level: 'low' | 'moderate' | 'high' | 'severe';
  tcmPatterns: TcmPattern[];
  recommendations: string[];
  answers: Record<string, number>;
}

interface TcmPattern {
  name: string;
  nameHe: string;
  description: string;
  points: string[];
  formula: string;
}

const QUESTIONS: Question[] = [
  { id: 'q1', text: 'I feel tense or wound up', textHe: 'אני מרגיש/ה מתוח/ה או לחוץ/ה', category: 'physical', icon: Zap },
  { id: 'q2', text: 'I get a sort of frightened feeling', textHe: 'יש לי תחושת פחד או חרדה', category: 'emotional', icon: Heart },
  { id: 'q3', text: 'Worrying thoughts go through my mind', textHe: 'מחשבות דאגה עוברות לי בראש', category: 'mental', icon: Brain },
  { id: 'q4', text: 'I have difficulty falling asleep', textHe: 'קשה לי להירדם', category: 'sleep', icon: Moon },
  { id: 'q5', text: 'I feel restless, as if I have to be on the move', textHe: 'אני מרגיש/ה חוסר מנוחה', category: 'physical', icon: Zap },
  { id: 'q6', text: 'I get sudden feelings of panic', textHe: 'יש לי התקפי פאניקה פתאומיים', category: 'emotional', icon: AlertTriangle },
  { id: 'q7', text: 'I feel tired and low on energy', textHe: 'אני מרגיש/ה עייף/ה וחסר/ת אנרגיה', category: 'energy', icon: Leaf },
  { id: 'q8', text: 'I have trouble concentrating', textHe: 'קשה לי להתרכז', category: 'mental', icon: Brain },
  { id: 'q9', text: 'I wake up during the night', textHe: 'אני מתעורר/ת באמצע הלילה', category: 'sleep', icon: Moon },
  { id: 'q10', text: 'I feel irritable or easily angered', textHe: 'אני עצבני/ת או כועס/ת בקלות', category: 'emotional', icon: Zap },
];

const ANSWER_OPTIONS = [
  { value: 0, label: 'Not at all', labelHe: 'כלל לא' },
  { value: 1, label: 'Sometimes', labelHe: 'לפעמים' },
  { value: 2, label: 'Often', labelHe: 'לעתים קרובות' },
  { value: 3, label: 'Very often', labelHe: 'כמעט תמיד' },
];

const TCM_PATTERNS: Record<string, TcmPattern> = {
  liverQiStagnation: {
    name: 'Liver Qi Stagnation',
    nameHe: 'סטגנציית צ\'י הכבד',
    description: 'Stress causes the Liver Qi to stagnate, leading to irritability, sighing, and chest tightness.',
    points: ['LV3 (Taichong)', 'LV14 (Qimen)', 'GB34 (Yanglingquan)', 'PC6 (Neiguan)'],
    formula: 'Xiao Yao San / Chai Hu Shu Gan San',
  },
  heartYinDeficiency: {
    name: 'Heart Yin Deficiency',
    nameHe: 'חוסר יין הלב',
    description: 'Anxiety and restlessness due to Heart Yin failing to anchor the Shen (spirit).',
    points: ['HT7 (Shenmen)', 'HT6 (Yinxi)', 'PC7 (Daling)', 'KD6 (Zhaohai)'],
    formula: 'Tian Wang Bu Xin Dan',
  },
  spleenQiDeficiency: {
    name: 'Spleen Qi Deficiency',
    nameHe: 'חוסר צ\'י הטחול',
    description: 'Overthinking and worry weaken the Spleen, causing fatigue and poor concentration.',
    points: ['SP3 (Taibai)', 'SP6 (Sanyinjiao)', 'ST36 (Zusanli)', 'BL20 (Pishu)'],
    formula: 'Gui Pi Tang',
  },
  kidneyYinDeficiency: {
    name: 'Kidney Yin Deficiency',
    nameHe: 'חוסר יין הכליות',
    description: 'Chronic stress depletes Kidney Yin, causing night sweats, insomnia, and anxiety.',
    points: ['KD3 (Taixi)', 'KD6 (Zhaohai)', 'SP6 (Sanyinjiao)', 'HT6 (Yinxi)'],
    formula: 'Liu Wei Di Huang Wan',
  },
};

function getStressLevel(score: number): 'low' | 'moderate' | 'high' | 'severe' {
  if (score <= 7) return 'low';
  if (score <= 14) return 'moderate';
  if (score <= 21) return 'high';
  return 'severe';
}

function getPatterns(answers: Record<string, number>): TcmPattern[] {
  const patterns: TcmPattern[] = [];
  
  // Calculate category scores
  const categoryScores = {
    physical: 0,
    emotional: 0,
    sleep: 0,
    energy: 0,
    mental: 0,
  };
  
  QUESTIONS.forEach(q => {
    categoryScores[q.category] += answers[q.id] || 0;
  });
  
  // Determine patterns based on scores
  if (categoryScores.emotional >= 4 || categoryScores.physical >= 4) {
    patterns.push(TCM_PATTERNS.liverQiStagnation);
  }
  if (categoryScores.sleep >= 4 || categoryScores.emotional >= 3) {
    patterns.push(TCM_PATTERNS.heartYinDeficiency);
  }
  if (categoryScores.energy >= 2 || categoryScores.mental >= 4) {
    patterns.push(TCM_PATTERNS.spleenQiDeficiency);
  }
  if (categoryScores.sleep >= 4 && categoryScores.energy >= 2) {
    patterns.push(TCM_PATTERNS.kidneyYinDeficiency);
  }
  
  // Default pattern if none detected
  if (patterns.length === 0) {
    patterns.push(TCM_PATTERNS.liverQiStagnation);
  }
  
  return patterns;
}

function getRecommendations(level: string, patterns: TcmPattern[]): string[] {
  const recommendations: string[] = [];
  
  // General recommendations
  recommendations.push('Practice deep breathing exercises for 5-10 minutes daily');
  recommendations.push('Consider acupuncture treatment focusing on calming points');
  
  if (level === 'high' || level === 'severe') {
    recommendations.push('Prioritize sleep hygiene and aim for 7-8 hours');
    recommendations.push('Reduce stimulants (caffeine, alcohol)');
    recommendations.push('Consider guided meditation or Qigong practice');
  }
  
  // Pattern-specific recommendations
  if (patterns.some(p => p.name === 'Liver Qi Stagnation')) {
    recommendations.push('Gentle stretching and movement to promote Qi flow');
    recommendations.push('Avoid suppressing emotions - express feelings constructively');
  }
  
  if (patterns.some(p => p.name === 'Heart Yin Deficiency')) {
    recommendations.push('Avoid overstimulation before bedtime');
    recommendations.push('Consider yin-nourishing foods: lotus seeds, lily bulb');
  }
  
  return recommendations;
}

const LEVEL_COLORS = {
  low: 'text-emerald-500 bg-emerald-500/10',
  moderate: 'text-amber-500 bg-amber-500/10',
  high: 'text-orange-500 bg-orange-500/10',
  severe: 'text-red-500 bg-red-500/10',
};

const LEVEL_LABELS = {
  low: { en: 'Low Stress', he: 'לחץ נמוך' },
  moderate: { en: 'Moderate Stress', he: 'לחץ בינוני' },
  high: { en: 'High Stress', he: 'לחץ גבוה' },
  severe: { en: 'Severe Stress', he: 'לחץ חמור' },
};

export const StressAssessmentDialog: React.FC<StressAssessmentDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<StressAssessmentResult | null>(null);

  const handleAnswer = (value: number) => {
    const questionId = QUESTIONS[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate results
      const newAnswers = { ...answers, [questionId]: value };
      const totalScore = Object.values(newAnswers).reduce((sum, v) => sum + v, 0);
      const level = getStressLevel(totalScore);
      const patterns = getPatterns(newAnswers);
      const recommendations = getRecommendations(level, patterns);
      
      const assessmentResult: StressAssessmentResult = {
        score: totalScore,
        level,
        tcmPatterns: patterns,
        recommendations,
        answers: newAnswers,
      };
      
      setResult(assessmentResult);
      setShowResults(true);
      onComplete?.(assessmentResult);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResult(null);
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];
  const Icon = currentQ?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-500" />
            הערכת לחץ ומתח - TCM
          </DialogTitle>
          <DialogDescription>
            שאלון להערכת רמת הלחץ ומתן המלצות טיפוליות מותאמות
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!showResults ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>שאלה {currentQuestion + 1} מתוך {QUESTIONS.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question Card */}
              <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10">
                <CardContent className="pt-6 pb-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">{currentQ.textHe}</p>
                      <p className="text-sm text-muted-foreground">{currentQ.text}</p>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {ANSWER_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        className={cn(
                          "h-auto py-4 flex flex-col gap-1 transition-all",
                          answers[currentQ.id] === option.value && "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/30"
                        )}
                        onClick={() => handleAnswer(option.value)}
                      >
                        <span className="font-medium">{option.labelHe}</span>
                        <span className="text-xs text-muted-foreground">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentQuestion === 0}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  הקודם
                </Button>
                <Button variant="ghost" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  התחל מחדש
                </Button>
              </div>
            </div>
          ) : result && (
            <div className="space-y-6">
              {/* Score Card */}
              <Card className={cn("border-2", LEVEL_COLORS[result.level].replace('text-', 'border-').replace('/10', '/30'))}>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-3", LEVEL_COLORS[result.level])}>
                      {result.level === 'low' && <CheckCircle2 className="h-5 w-5" />}
                      {result.level !== 'low' && <AlertTriangle className="h-5 w-5" />}
                      {LEVEL_LABELS[result.level].he}
                    </div>
                    <p className="text-4xl font-bold mb-2">{result.score} / 30</p>
                    <p className="text-muted-foreground">{LEVEL_LABELS[result.level].en}</p>
                  </div>

                  {/* Score Bar */}
                  <div className="relative h-4 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full mb-2">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-foreground rounded-full shadow-lg"
                      style={{ left: `${(result.score / 30) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>נמוך</span>
                    <span>בינוני</span>
                    <span>גבוה</span>
                    <span>חמור</span>
                  </div>
                </CardContent>
              </Card>

              {/* TCM Patterns */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-jade" />
                  דפוסי TCM שזוהו
                </h3>
                {result.tcmPatterns.map((pattern, idx) => (
                  <Card key={idx} className="border-jade/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-jade/10 flex items-center justify-center shrink-0">
                          <Leaf className="h-4 w-4 text-jade" />
                        </div>
                        <div>
                          <p className="font-medium">{pattern.nameHe}</p>
                          <p className="text-sm text-muted-foreground">{pattern.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                      
                      <div className="grid gap-2 text-sm">
                        <div>
                          <span className="font-medium">נקודות מומלצות: </span>
                          <span className="text-jade">{pattern.points.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium">פורמולה: </span>
                          <Badge variant="secondary">{pattern.formula}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  המלצות טיפוליות
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-jade mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleReset} variant="outline" className="flex-1 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  בצע שוב
                </Button>
                <Button onClick={() => onOpenChange(false)} className="flex-1 bg-jade hover:bg-jade/90">
                  סיום
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
