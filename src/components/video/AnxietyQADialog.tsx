import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Wind, TreePine, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AnxietyQADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationSave: (conversation: string[]) => void;
}

// Anti-anxiety Q&A for needle fear
const anxietyQuestions = [
  {
    id: 'fear_level',
    question: 'בסולם של 1-10, כמה את/ה חושש/ת מהמחטים?',
    type: 'scale',
    helpText: 'זה מאוד טבעי לחשוש. הבנה של רמת החששות עוזרת לנו להתאים את הטיפול.',
    icon: <Heart className="h-5 w-5 text-rose-500" />,
  },
  {
    id: 'past_experience',
    question: 'האם היה לך ניסיון שלילי עם מחטים בעבר?',
    type: 'text',
    helpText: 'לפעמים חוויות עבר משפיעות על התחושה הנוכחית. שיתוף עוזר.',
    icon: <TreePine className="h-5 w-5 text-jade" />,
  },
  {
    id: 'physical_symptoms',
    question: 'מה קורה בגוף שלך כשאת/ה חושב/ת על הטיפול?',
    type: 'text',
    helpText: 'דופק מואץ, זיעה, מתח בשרירים - כולם תגובות נורמליות.',
    icon: <Wind className="h-5 w-5 text-sky-500" />,
  },
  {
    id: 'coping_strategies',
    question: 'מה בדרך כלל עוזר לך להירגע במצבים מלחיצים?',
    type: 'text',
    helpText: 'נשימות עמוקות, מוזיקה, דמיון מודרך - נמצא יחד את מה שעובד.',
    icon: <Sparkles className="h-5 w-5 text-gold" />,
  },
  {
    id: 'support_needs',
    question: 'איך נוכל לגרום לך להרגיש יותר בנוח היום?',
    type: 'text',
    helpText: 'אולי תאורה עמומה יותר? מוזיקה מרגיעה? הפסקות?',
    icon: <Heart className="h-5 w-5 text-rose-500" />,
  },
];

const relaxationTips = [
  '🌬️ נסה/י נשימה עמוקה: שאוף 4 שניות, החזק 4 שניות, הוצא 6 שניות',
  '🎵 מוזיקה מרגיעה יכולה לעזור - האם יש לך אוזניות?',
  '🌳 דמייני מקום שליו ורגוע - חוף ים, יער, גינה',
  '💪 המחטים דקות מאוד - דקות מחוט שיער!',
  '🤝 אני כאן איתך לאורך כל הדרך',
];

export function AnxietyQADialog({ open, onOpenChange, onConversationSave }: AnxietyQADialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customNotes, setCustomNotes] = useState('');
  const [showTips, setShowTips] = useState(false);

  const currentQuestion = anxietyQuestions[currentStep];
  const progress = ((currentStep + 1) / anxietyQuestions.length) * 100;

  const handleNext = () => {
    if (currentStep < anxietyQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTips(true);
    }
  };

  const handleBack = () => {
    if (showTips) {
      setShowTips(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const conversation = anxietyQuestions.map((q, i) => {
      return `שאלה ${i + 1}: ${q.question}\nתשובה: ${answers[q.id] || 'לא ענה'}`;
    });
    
    if (customNotes) {
      conversation.push(`הערות נוספות: ${customNotes}`);
    }
    
    onConversationSave(conversation);
    toast.success('השיחה נשמרה בדוח הפגישה');
    onOpenChange(false);
    
    // Reset
    setCurrentStep(0);
    setAnswers({});
    setCustomNotes('');
    setShowTips(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setCustomNotes('');
    setShowTips(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            שאלון הקלת חרדה מפחד מחטים
          </DialogTitle>
          <DialogDescription>
            שאלון תמיכה למטופלים עם חרדה מטיפולי דיקור
          </DialogDescription>
        </DialogHeader>

        {!showTips ? (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2" />
              <span className="text-sm text-muted-foreground">
                {currentStep + 1}/{anxietyQuestions.length}
              </span>
            </div>

            {/* Question Card */}
            <Card className="border-jade/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  {currentQuestion.icon}
                  <div className="flex-1">
                    <p className="font-medium text-lg mb-2">{currentQuestion.question}</p>
                    <p className="text-sm text-muted-foreground">{currentQuestion.helpText}</p>
                  </div>
                </div>

                {currentQuestion.type === 'scale' ? (
                  <div className="flex gap-1 justify-center my-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Button
                        key={num}
                        variant={answers[currentQuestion.id] === String(num) ? 'default' : 'outline'}
                        size="sm"
                        className={`w-8 h-8 ${
                          answers[currentQuestion.id] === String(num) ? 'bg-jade hover:bg-jade/90' : ''
                        }`}
                        onClick={() => setAnswers({ ...answers, [currentQuestion.id]: String(num) })}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                    placeholder="הקלד/י את התשובה..."
                    rows={3}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronRight className="h-4 w-4 ml-1" />
                הקודם
              </Button>
              <Button 
                onClick={handleNext}
                className="bg-jade hover:bg-jade/90"
              >
                {currentStep === anxietyQuestions.length - 1 ? 'לטיפים' : 'הבא'}
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Relaxation Tips */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                טיפים להרגעה:
              </h4>
              {relaxationTips.map((tip, i) => (
                <Badge key={i} variant="outline" className="block p-3 text-right">
                  {tip}
                </Badge>
              ))}
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">הערות נוספות:</label>
              <Textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="רשום/י הערות נוספות..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleBack}>
                <ChevronRight className="h-4 w-4 ml-1" />
                חזור לשאלות
              </Button>
              <Button variant="outline" onClick={handleReset}>
                התחל מחדש
              </Button>
              <Button onClick={handleSave} className="bg-jade hover:bg-jade/90 gap-2">
                <Save className="h-4 w-4" />
                שמור לדוח
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
