import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  X, 
  Flame,
  Droplets,
  Brain,
  Wind,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmotionalShenDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmotion?: 'grief' | 'anger' | 'fear' | 'trauma';
  onAskQuestion?: (question: string) => void;
}

// Clinical data from verified TCM CSV files
const SHEN_EMOTIONS_DATA = {
  grief: {
    id: 'grief',
    name: 'Grief',
    nameHe: 'אבל',
    icon: Heart,
    organ: 'Lung',
    organHe: 'ריאות',
    element: 'Metal',
    spirit: 'Po',
    spiritHe: 'פו',
    colorClass: 'text-rose-500',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-300',
    qaItems: [
      {
        question: 'How does grief manifest in the Lung system?',
        questionHe: 'כיצד אבל מתבטא במערכת הריאות?',
        answer: 'Grief depletes Lung Qi, leading to fatigue, shallow breathing, and weakened immunity (Wei Qi). The Lungs house the Po (Corporeal Soul). Unresolved grief manifests as chest oppression, withdrawal, and "muddled thinking".',
        points: 'LU-1, LU-3, LU-7, LU-9',
        formula: 'Gan Mai Da Zao Tang'
      },
      {
        question: 'The Grief-to-Anger Transition',
        questionHe: 'מעבר מאבל לכעס',
        answer: 'Unexpressed grief accumulates and transforms into Liver Qi Stagnation. This is the "Liver insults Lung" pattern. Symptoms shift from sadness to irritability, chest tightness, sighing, and frustration.',
        points: 'LR-3, LR-14, GB-34, PC-6',
        formula: 'Chai Hu Shu Gan San'
      },
      {
        question: 'Prolonged Grief & Kidney Depletion',
        questionHe: 'אבל ממושך ודלדול כליות',
        answer: 'Chronic grief drains Kidney Essence (Jing) and Willpower (Zhi). As the Lungs fail to descend Qi, the Kidneys fail to grasp it. This leads to deep fatigue, back pain, and a shift from sadness to deep fear and anxiety.',
        points: 'KI-3, KI-7, BL-23, GV-4',
        formula: 'Kaixinsan (Open Heart)'
      },
      {
        question: 'Heart-Lung Fragility (Shen-Po)',
        questionHe: 'שבריריות לב-ריאות (שן-פו)',
        answer: 'Grief affects the Upper Jiao, impacting both Lung (Po) and Heart (Shen). When Lung Qi fails to nourish the Heart, patients experience palpitations, insomnia, and emotional fragility. The protocol focuses on "calming the adverse Qi."',
        points: 'HT-7, PC-7, ST-36, CV-17',
        formula: 'Banxia Houpo Tang'
      }
    ]
  },
  anger: {
    id: 'anger',
    name: 'Anger',
    nameHe: 'כעס',
    icon: Flame,
    organ: 'Liver',
    organHe: 'כבד',
    element: 'Wood',
    spirit: 'Hun',
    spiritHe: 'הון',
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-300',
    qaItems: [
      {
        question: 'How does anger affect Liver Qi?',
        questionHe: 'כיצד כעס משפיע על צ\'י הכבד?',
        answer: 'Anger causes Liver Qi to rise excessively (Liver Yang Rising). This manifests as headaches, red eyes, dizziness, tinnitus, and a flushed face. The Hun becomes unrooted, causing irritability and poor decision-making.',
        points: 'LV-3, GB-20, GV-20, Taiyang',
        formula: 'Tian Ma Gou Teng Yin'
      },
      {
        question: 'Liver-Lung Relationship (Wood Insulting Metal)',
        questionHe: 'קשר כבד-ריאות (עץ פוגע במתכת)',
        answer: 'When Liver Fire rises uncontrolled, it can "insult" the Lungs (counter-acting cycle). This causes coughing, chest pain, and hemoptysis. Emotions oscillate between anger and grief. The Hun overrides the Po.',
        points: 'LV-14, LU-1, PC-6, GB-34',
        formula: 'Long Dan Xie Gan Tang'
      },
      {
        question: 'Suppressed Anger & Liver Qi Stagnation',
        questionHe: 'כעס מודחק וסטגנציית צ\'י כבד',
        answer: 'Unexpressed anger stagnates Liver Qi, leading to sighing, chest distention, alternating mood swings, and menstrual irregularities. The stagnation can transform to Fire or Blood Stasis over time.',
        points: 'LV-3, LI-4, GB-34, CV-17',
        formula: 'Chai Hu Shu Gan San'
      },
      {
        question: 'Four Gates Protocol for Anger Release',
        questionHe: 'פרוטוקול ארבעת השערים לשחרור כעס',
        answer: 'The Four Gates (LV-3 + LI-4 bilaterally) is the primary treatment for moving stagnant Qi and releasing anger. It strongly courses Liver Qi, calms the Hun, and restores the smooth flow of emotions.',
        points: 'LV-3, LI-4 (bilateral)',
        formula: 'Xiao Yao San'
      }
    ]
  },
  fear: {
    id: 'fear',
    name: 'Fear',
    nameHe: 'פחד',
    icon: Droplets,
    organ: 'Kidney',
    organHe: 'כליות',
    element: 'Water',
    spirit: 'Zhi',
    spiritHe: 'ג\'י',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-300',
    qaItems: [
      {
        question: 'How does fear affect Kidney Qi?',
        questionHe: 'כיצד פחד משפיע על צ\'י הכליות?',
        answer: 'Fear causes Kidney Qi to descend abnormally, manifesting as urinary incontinence, nocturnal enuresis, weak knees, and lower back pain. Chronic fear depletes Kidney Essence (Jing) and weakens the Zhi (willpower).',
        points: 'KI-3, KI-7, BL-23, GV-4',
        formula: 'Liu Wei Di Huang Wan'
      },
      {
        question: 'Prolonged Grief & Kidney Essence Depletion',
        questionHe: 'אבל ממושך ודלדול תמצית הכליות',
        answer: 'Chronic grief drains Kidney Essence (Jing) and Willpower (Zhi). As the Lungs fail to descend Qi, the Kidneys fail to grasp it. This leads to deep fatigue, back pain, and a transformation from sadness to deep fear and anxiety.',
        points: 'KI-3, KI-7, BL-23, GV-4',
        formula: 'Kaixinsan (Open Heart)'
      },
      {
        question: 'Fear, Fright, and the Heart-Kidney Axis',
        questionHe: 'פחד, בהלה וציר לב-כליות',
        answer: 'Sudden fright scatters the Shen (Heart) while chronic fear depletes the Kidneys. The Heart-Kidney axis becomes disrupted—Fire and Water fail to communicate. Symptoms include palpitations, anxiety, insomnia, and cold extremities.',
        points: 'HT-7, KI-3, PC-6, BL-15',
        formula: 'Tian Wang Bu Xin Dan'
      },
      {
        question: 'Kidney-Gallbladder Relationship and Courage',
        questionHe: 'קשר כליות-כיס מרה ואומץ',
        answer: 'The Gallbladder provides decisiveness and courage, supported by Kidney Zhi. Deficiency of both leads to timidity, inability to make decisions, and being easily startled. Treatment tonifies Kidney and strengthens Gallbladder Qi.',
        points: 'GB-40, KI-3, BL-23, GV-4',
        formula: 'Wen Dan Tang + Kidney tonics'
      }
    ]
  },
  trauma: {
    id: 'trauma',
    name: 'Trauma',
    nameHe: 'טראומה',
    icon: Brain,
    organ: 'Heart / Kidney',
    organHe: 'לב / כליות',
    element: 'Fire / Water',
    spirit: 'Shen / Zhi',
    spiritHe: 'שן / ג\'י',
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-300',
    qaItems: [
      {
        question: 'How does trauma affect the Shen?',
        questionHe: 'כיצד טראומה משפיעה על השן?',
        answer: 'Trauma causes the Shen to scatter and become unrooted from the Heart. This manifests as anxiety, insomnia, poor concentration, dissociation, and hypervigilance. The Heart Blood and Yin become depleted over time.',
        points: 'HT-7, PC-6, GV-20, Yintang',
        formula: 'An Shen Ding Zhi Wan'
      },
      {
        question: 'Heart-Lung Fragility (Shen-Po Connection)',
        questionHe: 'שבריריות לב-ריאות (חיבור שן-פו)',
        answer: 'Trauma affects the Upper Jiao, impacting both Lung (Po) and Heart (Shen). When Lung Qi fails to nourish the Heart, patients experience palpitations, insomnia, and emotional fragility. Treatment calms the Shen and anchors the Po.',
        points: 'HT-7, LU-7, PC-7, CV-17',
        formula: 'Banxia Houpo Tang'
      },
      {
        question: 'Trauma and the Heart-Kidney Axis',
        questionHe: 'טראומה וציר לב-כליות',
        answer: 'Trauma disrupts the Heart-Kidney axis—Fire and Water fail to communicate. The Shen becomes unrooted while Kidney Jing depletes. Symptoms include palpitations, night sweats, insomnia, tinnitus, and deep exhaustion.',
        points: 'HT-7, KI-3, KI-6, BL-15, BL-23',
        formula: 'Tian Wang Bu Xin Dan'
      },
      {
        question: 'Blood Stasis and Emotional Trauma',
        questionHe: 'סטגנציית דם וטראומה רגשית',
        answer: 'Chronic trauma can lead to Blood Stasis in the Heart and Liver. Symptoms include fixed chest pain, purple tongue, and emotional numbness. The Blood fails to nourish the Shen, causing depression and disconnection.',
        points: 'PC-6, SP-10, LV-3, BL-17',
        formula: 'Xue Fu Zhu Yu Tang'
      }
    ]
  }
};

export function EmotionalShenDashboard({ 
  isOpen, 
  onClose, 
  initialEmotion = 'grief',
  onAskQuestion 
}: EmotionalShenDashboardProps) {
  const [activeEmotion, setActiveEmotion] = useState<'grief' | 'anger' | 'fear' | 'trauma'>(initialEmotion);
  const currentEmotion = SHEN_EMOTIONS_DATA[activeEmotion];

  if (!isOpen) return null;

  const tabs = [
    { id: 'grief' as const, label: 'Grief', labelHe: 'אבל', sublabel: 'Lung' },
    { id: 'anger' as const, label: 'Anger', labelHe: 'כעס', sublabel: 'Liver' },
    { id: 'fear' as const, label: 'Fear', labelHe: 'פחד', sublabel: 'Kidney' },
    { id: 'trauma' as const, label: 'Trauma', labelHe: 'טראומה', sublabel: 'Heart' },
  ];

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative h-36 bg-gradient-to-br from-purple-600/90 via-purple-700/80 to-purple-900/90 p-5 flex flex-col justify-end">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBjNS41MjMgMCAxMC00LjQ3NyAxMC0xMFMyNS41MjMgMCAyMCAwIDEwIDQuNDc3IDEwIDEwczQuNDc3IDEwIDEwIDEwem0wIDIwYzUuNTIzIDAgMTAtNC40NzcgMTAtMTBzLTQuNDc3LTEwLTEwLTEwLTEwIDQuNDc3LTEwIDEwIDQuNDc3IDEwIDEwIDEweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-3 left-3 text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="relative z-10">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <span className="text-2xl">☯️</span>
                איזון רגשי (Emotional Balance)
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Integrative Shen & Trauma Support (Updated CSV)
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-muted/50 border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveEmotion(tab.id)}
                className={`flex-1 px-4 py-3.5 text-center transition-all border-b-2 ${
                  activeEmotion === tab.id 
                    ? 'bg-card text-primary border-primary font-semibold' 
                    : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-sm">{tab.label}</span>
                <span className="text-xs text-muted-foreground block">({tab.sublabel})</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="h-[calc(90vh-220px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEmotion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-5"
              >
                {/* Q&A Cards */}
                {currentEmotion.qaItems.map((item, idx) => (
                  <Card key={idx} className={`${currentEmotion.bgClass} border ${currentEmotion.borderClass}`}>
                    <CardContent className="p-5">
                      {/* Question */}
                      <div className={`font-semibold ${currentEmotion.colorClass} mb-3 flex items-start gap-2`}>
                        <span className="text-lg">❓</span>
                        <div>
                          <span className="block">{item.question}</span>
                          <span className="text-xs text-muted-foreground font-normal">{item.questionHe}</span>
                        </div>
                      </div>
                      
                      {/* Answer */}
                      <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        {item.answer}
                      </p>

                      {/* Protocol Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card p-3 rounded-lg border border-border">
                          <span className="text-xs text-muted-foreground font-semibold uppercase block mb-1">
                            Acupuncture Points
                          </span>
                          <span className="font-semibold text-sm text-foreground">{item.points}</span>
                        </div>
                        <div className="bg-card p-3 rounded-lg border border-border">
                          <span className="text-xs text-muted-foreground font-semibold uppercase block mb-1">
                            Herbal Formula
                          </span>
                          <span className="font-semibold text-sm text-foreground">{item.formula}</span>
                        </div>
                      </div>

                      {/* Ask AI Button */}
                      {onAskQuestion && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-3 text-jade hover:text-jade hover:bg-jade/10 p-0 h-auto"
                          onClick={() => onAskQuestion(item.question)}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Ask AI for more details
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Overview Badge Bar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className={currentEmotion.colorClass}>
                    <currentEmotion.icon className="w-3 h-3 mr-1" />
                    {currentEmotion.organ}
                  </Badge>
                  <Badge variant="outline">
                    {currentEmotion.element} Element
                  </Badge>
                  <Badge variant="outline">
                    {currentEmotion.spirit} ({currentEmotion.spiritHe})
                  </Badge>
                </div>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
