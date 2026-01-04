import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  X, 
  ChevronDown, 
  ChevronUp,
  Leaf,
  Wind,
  Flame,
  Droplets,
  Brain,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EmotionalProcessingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmotion?: 'grief' | 'trauma' | 'fear' | 'anger';
  onAskQuestion?: (question: string) => void;
}

interface EmotionData {
  id: string;
  name: string;
  nameHe: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  organ: string;
  organHe: string;
  element: string;
  spirit: string;
  spiritHe: string;
  description: string;
  descriptionHe: string;
  keyPoints: string[];
  keyFormulas: string[];
  qaItems: { q: string; qHe: string; summary: string }[];
}

const EMOTIONS_DATA: EmotionData[] = [
  {
    id: 'grief',
    name: 'Grief',
    nameHe: 'אבל',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-300',
    organ: 'Lung',
    organHe: 'ריאות',
    element: 'Metal',
    spirit: 'Po (Corporeal Soul)',
    spiritHe: 'פו (נשמה גופנית)',
    description: 'Grief affects the Lung Qi, causing it to disperse. Associated with letting go, attachment, and the Po spirit.',
    descriptionHe: 'אבל פוגע בצ\'י הריאות וגורם לו להתפזר. קשור לשחרור, התקשרות ורוח הפו.',
    keyPoints: ['LU-1 Zhongfu', 'LU-7 Lieque', 'PC-6 Neiguan', 'HT-7 Shenmen', 'CV-17 Danzhong', 'BL-42 Pohu'],
    keyFormulas: ['Ban Xia Hou Po Tang', 'Gan Mai Da Zao Tang', 'Xiao Yao San', 'Gui Pi Tang'],
    qaItems: [
      { q: 'How does grief affect the Lung according to TCM?', qHe: 'כיצד אבל משפיע על הריאות לפי הרפואה הסינית?', summary: 'Grief causes Lung Qi to disperse and weaken, affecting respiration and Wei Qi' },
      { q: 'What is the relationship between grief and the Po?', qHe: 'מה הקשר בין אבל לפו?', summary: 'The Po resides in the Lung and is affected by grief, impacting bodily instincts' },
      { q: 'Best acupoints for acute grief?', qHe: 'נקודות דיקור מומלצות לאבל חריף?', summary: 'LU-1, CV-17, PC-6, HT-7 for opening chest and calming Shen' },
    ]
  },
  {
    id: 'trauma',
    name: 'Trauma',
    nameHe: 'טראומה',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-300',
    organ: 'Kidney / Heart',
    organHe: 'כליות / לב',
    element: 'Water / Fire',
    spirit: 'Zhi (Will) & Shen (Spirit)',
    spiritHe: 'ג\'י (רצון) ושן (רוח)',
    description: 'Trauma scatters the Shen and depletes Kidney essence. Affects the Heart-Kidney axis and the Zhi.',
    descriptionHe: 'טראומה מפזרת את השן ומרוקנת את תמצית הכליות. משפיעה על ציר לב-כליות והג\'י.',
    keyPoints: ['KI-1 Yongquan', 'KI-3 Taixi', 'HT-7 Shenmen', 'GV-20 Baihui', 'Yintang', 'PC-6 Neiguan', 'BL-15 Xinshu'],
    keyFormulas: ['Tian Wang Bu Xin Dan', 'Suan Zao Ren Tang', 'Gui Pi Tang', 'An Shen Ding Zhi Wan'],
    qaItems: [
      { q: 'How does trauma affect the Heart-Kidney axis?', qHe: 'כיצד טראומה משפיעה על ציר לב-כליות?', summary: 'Disrupts communication between Fire and Water, scatters Shen, depletes Jing' },
      { q: 'What is Shen disturbance in trauma?', qHe: 'מהי הפרעת שן בטראומה?', summary: 'Shen becomes unrooted, causing anxiety, insomnia, dissociation, hypervigilance' },
      { q: 'Best acupoints for grounding after trauma?', qHe: 'נקודות דיקור מומלצות להארקה לאחר טראומה?', summary: 'KI-1, ST-36, SP-6, GV-20 for grounding and reconnecting spirit to body' },
    ]
  },
  {
    id: 'fear',
    name: 'Fear',
    nameHe: 'פחד',
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-300',
    organ: 'Kidney',
    organHe: 'כליות',
    element: 'Water',
    spirit: 'Zhi (Will)',
    spiritHe: 'ג\'י (רצון)',
    description: 'Fear causes Kidney Qi to descend. Chronic fear depletes Kidney essence and weakens the Zhi (willpower).',
    descriptionHe: 'פחד גורם לצ\'י הכליות לרדת. פחד כרוני מרוקן את תמצית הכליות ומחליש את הג\'י (כוח הרצון).',
    keyPoints: ['KI-3 Taixi', 'KI-7 Fuliu', 'KI-27 Shufu', 'BL-23 Shenshu', 'BL-52 Zhishi', 'GV-4 Mingmen'],
    keyFormulas: ['Liu Wei Di Huang Wan', 'Jin Gui Shen Qi Wan', 'Zuo Gui Wan', 'You Gui Wan'],
    qaItems: [
      { q: 'How does fear affect Kidney Qi?', qHe: 'כיצד פחד משפיע על צ\'י הכליות?', summary: 'Fear causes Qi to descend, leading to incontinence, weak knees, lower back pain' },
      { q: 'What is the Zhi and how does fear affect it?', qHe: 'מהו הג\'י וכיצד פחד משפיע עליו?', summary: 'Zhi is willpower stored in Kidneys; fear weakens determination and courage' },
      { q: 'Best acupoints for chronic anxiety and fear?', qHe: 'נקודות דיקור מומלצות לחרדה ופחד כרוני?', summary: 'KI-3, BL-23, GV-4 to tonify Kidney; HT-7, PC-6 to calm Shen' },
    ]
  },
  {
    id: 'anger',
    name: 'Anger',
    nameHe: 'כעס',
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-300',
    organ: 'Liver',
    organHe: 'כבד',
    element: 'Wood',
    spirit: 'Hun (Ethereal Soul)',
    spiritHe: 'הון (נשמה אתרית)',
    description: 'Anger causes Liver Qi to rise and stagnate. Affects the Hun, planning, and decision-making.',
    descriptionHe: 'כעס גורם לצ\'י הכבד לעלות ולסטגנציה. משפיע על ההון, תכנון וקבלת החלטות.',
    keyPoints: ['LV-3 Taichong', 'LV-14 Qimen', 'GB-34 Yanglingquan', 'GB-20 Fengchi', 'LI-4 Hegu', 'Taiyang'],
    keyFormulas: ['Xiao Yao San', 'Long Dan Xie Gan Tang', 'Chai Hu Shu Gan San', 'Jia Wei Xiao Yao San'],
    qaItems: [
      { q: 'How does anger affect Liver Qi?', qHe: 'כיצד כעס משפיע על צ\'י הכבד?', summary: 'Anger causes Liver Qi to rise, leading to headaches, red eyes, irritability' },
      { q: 'What is Liver Qi stagnation from repressed anger?', qHe: 'מהי סטגנציית צ\'י כבד מכעס מודחק?', summary: 'Unexpressed anger stagnates Qi, causing chest tightness, sighing, mood swings' },
      { q: 'Best acupoints for releasing anger?', qHe: 'נקודות דיקור מומלצות לשחרור כעס?', summary: 'LV-3, LI-4 (Four Gates), GB-34 to move Liver Qi and release tension' },
    ]
  }
];

export function EmotionalProcessingPanel({ 
  isOpen, 
  onClose, 
  initialEmotion = 'grief',
  onAskQuestion 
}: EmotionalProcessingPanelProps) {
  const [activeEmotion, setActiveEmotion] = useState(initialEmotion);
  const currentEmotion = EMOTIONS_DATA.find(e => e.id === activeEmotion) || EMOTIONS_DATA[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Emotional Processing</h2>
                  <p className="text-sm text-muted-foreground">עיבוד רגשי בראי הרפואה הסינית</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Emotion Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {EMOTIONS_DATA.map(emotion => (
                <button
                  key={emotion.id}
                  onClick={() => setActiveEmotion(emotion.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeEmotion === emotion.id 
                      ? `${emotion.bgColor} ${emotion.color} border-2 ${emotion.borderColor}` 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <emotion.icon className="w-4 h-4" />
                  <span className="font-medium">{emotion.name}</span>
                  <span className="text-xs opacity-70">{emotion.nameHe}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Overview Card */}
              <Card className={`${currentEmotion.bgColor} border-2 ${currentEmotion.borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${currentEmotion.bgColor}`}>
                      <currentEmotion.icon className={`w-8 h-8 ${currentEmotion.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant="outline" className={currentEmotion.color}>
                          {currentEmotion.organ} • {currentEmotion.organHe}
                        </Badge>
                        <Badge variant="outline">
                          {currentEmotion.element}
                        </Badge>
                        <Badge variant="outline">
                          {currentEmotion.spirit}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{currentEmotion.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentEmotion.descriptionHe}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Points & Formulas */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-jade" />
                      Key Acupoints • נקודות מרכזיות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentEmotion.keyPoints.map((point, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-jade/20 transition-colors"
                          onClick={() => onAskQuestion?.(`Tell me about ${point} for ${currentEmotion.name.toLowerCase()} processing`)}
                        >
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wind className="w-4 h-4 text-emerald-600" />
                      Key Formulas • פורמולות מרכזיות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentEmotion.keyFormulas.map((formula, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-emerald-500/20 transition-colors"
                          onClick={() => onAskQuestion?.(`Tell me about ${formula} for ${currentEmotion.name.toLowerCase()}`)}
                        >
                          {formula}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Q&A Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Clinical Q&A • שאלות ותשובות קליניות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {currentEmotion.qaItems.map((item, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`}>
                        <AccordionTrigger className="text-sm hover:no-underline">
                          <div className="flex flex-col items-start text-right w-full">
                            <span>{item.q}</span>
                            <span className="text-xs text-muted-foreground">{item.qHe}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm">{item.summary}</p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="mt-2 p-0 h-auto text-jade"
                              onClick={() => onAskQuestion?.(item.q)}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Ask AI for full answer
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAskQuestion?.(`What are the best treatment strategies for ${currentEmotion.name.toLowerCase()} according to TCM?`)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Full Treatment Protocol
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAskQuestion?.(`What lifestyle and dietary advice for ${currentEmotion.name.toLowerCase()}?`)}
                >
                  Lifestyle Advice
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAskQuestion?.(`What are the 5 Element relationships with ${currentEmotion.name.toLowerCase()}?`)}
                >
                  5 Element Theory
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => window.open('/knowledge/TCM_Grief_Treatment_Complete_Resource.html', '_blank')}
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  מדריך פרוטוקול אבל
                </Button>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
