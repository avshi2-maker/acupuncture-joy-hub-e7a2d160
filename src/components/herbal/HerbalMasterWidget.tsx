import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRef } from 'react';
import { 
  Search, 
  Pill, 
  GraduationCap, 
  BookOpen, 
  Baby, 
  User, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Leaf,
  Shield,
  Zap,
  Heart,
  Scale,
  X,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormulaData {
  id: string;
  formula_name: string;
  question?: string;
  answer?: string;
  content: string;
  source?: string;
  acupoints?: string;
  pharmacopeia?: string;
}

interface SafetyFilter {
  pregnancy: boolean;
  children: boolean;
  elderly: boolean;
  bleeding: boolean;
  yinFire: boolean;
}

// Expanded Embedded Database (v7) - 22 Formulas with Safety Warnings including Bleeding/Yin-Fire
const SAMPLE_FORMULAS: FormulaData[] = [
  {
    id: '1',
    formula_name: 'Si Jun Zi Tang (四君子汤)',
    question: 'What is Si Jun Zi Tang used for?',
    answer: 'Si Jun Zi Tang is a foundational formula for tonifying Qi. It treats Spleen and Stomach Qi deficiency presenting with fatigue, poor appetite, loose stools, and a pale tongue.',
    content: 'Si Jun Zi Tang: Ren Shen, Bai Zhu, Fu Ling, Zhi Gan Cao. Tonifies Qi, strengthens Spleen. Pattern: Spleen Qi Deficiency. Safe for children with dose adjustment.',
    acupoints: 'ST36, SP6, CV12, BL20',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '2',
    formula_name: 'Ba Zhen Tang (八珍汤)',
    question: 'What does Ba Zhen Tang treat?',
    answer: 'Ba Zhen Tang tonifies both Qi and Blood. It is the combination of Si Jun Zi Tang and Si Wu Tang, treating dual deficiency of Qi and Blood with pallor, fatigue, dizziness, and palpitations.',
    content: 'Ba Zhen Tang: Ren Shen, Bai Zhu, Fu Ling, Zhi Gan Cao, Dang Gui, Chuan Xiong, Bai Shao, Shu Di Huang. Pattern: Qi and Blood Deficiency. Postpartum recovery formula.',
    acupoints: 'ST36, SP6, BL17, BL20, CV4',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '3',
    formula_name: 'Liu Wei Di Huang Wan (六味地黄丸)',
    question: 'What is the primary indication for Liu Wei Di Huang Wan?',
    answer: 'Liu Wei Di Huang Wan nourishes Kidney Yin. It treats Kidney Yin deficiency with symptoms like night sweats, heat in the five palms, dizziness, tinnitus, and soreness of the lower back.',
    content: 'Liu Wei Di Huang Wan: Shu Di Huang, Shan Zhu Yu, Shan Yao, Ze Xie, Mu Dan Pi, Fu Ling. Pattern: Kidney Yin Deficiency. ⚠️ ELDERLY CAUTION: Cloying herbs may impair digestion. Use with SP-tonics if digestion is weak.',
    acupoints: 'KI3, KI6, SP6, CV4, BL23',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '4',
    formula_name: 'Xiao Yao San (逍遥散)',
    question: 'What is Xiao Yao San used for?',
    answer: 'Xiao Yao San spreads Liver Qi, strengthens Spleen, and nourishes Blood. It treats Liver Qi stagnation with Blood deficiency - irritability, depression, fatigue, irregular menstruation.',
    content: 'Xiao Yao San: Chai Hu, Dang Gui, Bai Shao, Bai Zhu, Fu Ling, Zhi Gan Cao, Sheng Jiang, Bo He. Pattern: Liver Qi Stagnation with Blood Deficiency. Safe in pregnancy at standard doses.',
    acupoints: 'LV3, LV14, PC6, SP6, GB34',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '5',
    formula_name: 'Gui Pi Tang (归脾汤)',
    question: 'What pattern does Gui Pi Tang address?',
    answer: 'Gui Pi Tang tonifies Spleen Qi and Heart Blood, calms the Shen. It treats Heart and Spleen deficiency with insomnia, poor memory, palpitations, fatigue, and poor appetite.',
    content: 'Gui Pi Tang: Ren Shen, Huang Qi, Bai Zhu, Fu Shen, Dang Gui, Long Yan Rou, Suan Zao Ren, Yuan Zhi, Mu Xiang, Zhi Gan Cao. Pattern: Heart and Spleen Deficiency.',
    acupoints: 'HT7, SP6, ST36, BL15, BL20',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '6',
    formula_name: 'Xue Fu Zhu Yu Tang (血府逐瘀汤)',
    question: 'What is Xue Fu Zhu Yu Tang used for?',
    answer: 'Xue Fu Zhu Yu Tang invigorates Blood and dispels stasis in the chest (Xue Fu). It treats chest pain, headache, chronic stubborn pain, and emotional disorders from Blood stasis.',
    content: 'Xue Fu Zhu Yu Tang: Tao Ren, Hong Hua, Dang Gui, Sheng Di Huang, Chuan Xiong, Chi Shao, Niu Xi, Chai Hu, Zhi Ke, Jie Geng, Gan Cao. Pattern: Blood Stasis in Chest. ⛔ PREGNANCY CONTRAINDICATED: Contains Hong Hua (Carthami), Tao Ren (Persicae), Niu Xi - strong blood movers. ⛔ BLEEDING CONTRAINDICATED: Do NOT use if active bleeding is present.',
    acupoints: 'PC6, LV3, SP10, BL17, CV17',
    pharmacopeia: 'Modern Chinese Patent Medicine Formulary',
  },
  {
    id: '7',
    formula_name: 'Tao He Cheng Qi Tang (桃核承气汤)',
    question: 'What does Tao He Cheng Qi Tang treat?',
    answer: 'Tao He Cheng Qi Tang drains Heat and breaks Blood stasis in the Lower Jiao. It treats acute Blood stasis with Heat signs - lower abdominal pain, restlessness, thirst.',
    content: 'Tao He Cheng Qi Tang: Tao Ren, Da Huang, Gui Zhi, Mang Xiao, Zhi Gan Cao. Pattern: Blood Stasis with Heat in Lower Jiao. ⛔ PREGNANCY FORBIDDEN: Contains Tao Ren (breaks blood), Da Huang, Mang Xiao (harsh purgatives). ⛔ BLEEDING CONTRAINDICATED: Strongly moves blood - avoid in hemorrhagic conditions.',
    acupoints: 'SP10, LV3, ST25, CV6',
    pharmacopeia: 'Shang Han Lun Classical Formula',
  },
  {
    id: '8',
    formula_name: 'Yin Qiao San (银翘散)',
    question: 'What does Yin Qiao San treat?',
    answer: 'Yin Qiao San releases the exterior and clears Heat. It is for early-stage Wind-Heat invasion - fever, sore throat, headache, slight thirst, and a floating rapid pulse.',
    content: 'Yin Qiao San: Jin Yin Hua, Lian Qiao, Jie Geng, Niu Bang Zi, Bo He, Dan Dou Chi, Jing Jie, Dan Zhu Ye, Gan Cao, Lu Gen. Pattern: Wind-Heat Invasion. Safe formula for children at adjusted doses.',
    acupoints: 'LI4, LI11, LU7, GV14',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '9',
    formula_name: 'Ma Huang Tang (麻黄汤)',
    question: 'When is Ma Huang Tang indicated?',
    answer: 'Ma Huang Tang releases the exterior and disperses Cold. It treats exterior Wind-Cold excess with aversion to cold, fever without sweating, body aches, and a floating tight pulse.',
    content: 'Ma Huang Tang: Ma Huang, Gui Zhi, Xing Ren, Zhi Gan Cao. Pattern: Wind-Cold Excess. ⚠️ CAUTION: Ma Huang is a stimulant. Reduce dose or avoid in children, elderly, hypertension, cardiovascular conditions.',
    acupoints: 'LU7, LI4, BL12, GV14',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  {
    id: '10',
    formula_name: 'Bu Zhong Yi Qi Tang (补中益气汤)',
    question: 'What is the key indication for Bu Zhong Yi Qi Tang?',
    answer: 'Bu Zhong Yi Qi Tang tonifies Qi of the Middle Jiao and raises Yang. It treats Spleen and Stomach Qi deficiency with sinking of Yang - organ prolapse, chronic diarrhea, shortness of breath.',
    content: 'Bu Zhong Yi Qi Tang: Huang Qi, Ren Shen, Bai Zhu, Zhi Gan Cao, Dang Gui, Chen Pi, Sheng Ma, Chai Hu. Pattern: Middle Qi Deficiency with Yang Sinking. Safe for elderly; good for chronic fatigue.',
    acupoints: 'CV6, ST36, BL20, GV20',
    pharmacopeia: 'Chinese Pharmacopoeia 2020 Edition, Vol. I',
  },
  // Wind-Damp, Phlegm-Damp, Food Stagnation
  {
    id: '11',
    formula_name: 'Du Huo Ji Sheng Tang (独活寄生汤)',
    question: 'What is Du Huo Ji Sheng Tang used for?',
    answer: 'Du Huo Ji Sheng Tang dispels Wind-Damp, tonifies Liver and Kidney, nourishes Qi and Blood. It treats chronic Bi syndrome with underlying deficiency - lower back/knee pain, joint stiffness, weakness.',
    content: 'Du Huo Ji Sheng Tang: Du Huo, Sang Ji Sheng, Du Zhong, Niu Xi, Xi Xin, Qin Jiao, Fu Ling, Rou Gui, Fang Feng, Chuan Xiong, Ren Shen, Gan Cao, Dang Gui, Bai Shao, Shu Di Huang. Pattern: Wind-Damp Bi with Liver/Kidney Deficiency. ⚠️ PREGNANCY CAUTION: Contains Niu Xi and blood-moving herbs - use with care or avoid.',
    acupoints: 'GB34, BL23, KI3, SP6, ST36',
    pharmacopeia: 'Bei Ji Qian Jin Yao Fang (Thousand Ducat Formulas)',
  },
  {
    id: '12',
    formula_name: 'Er Chen Tang (二陈汤)',
    question: 'What does Er Chen Tang treat?',
    answer: 'Er Chen Tang dries Dampness and transforms Phlegm, regulates Qi and harmonizes the Middle Jiao. It is the base formula for Phlegm-Damp conditions with nausea, cough with copious white phlegm, chest oppression.',
    content: 'Er Chen Tang: Ban Xia (Chen), Chen Pi (Chen), Fu Ling, Zhi Gan Cao, Sheng Jiang, Wu Mei. Pattern: Phlegm-Damp. ⚠️ PREGNANCY CAUTION: Ban Xia is traditionally contraindicated in pregnancy - use processed form (Fa Ban Xia) with care or substitute.',
    acupoints: 'ST40, CV12, SP9, PC6',
    pharmacopeia: 'Tai Ping Hui Min He Ji Ju Fang',
  },
  {
    id: '13',
    formula_name: 'Bao He Wan (保和丸)',
    question: 'What is Bao He Wan used for?',
    answer: 'Bao He Wan reduces Food Stagnation and harmonizes the Stomach. It treats acute food stagnation with epigastric fullness, belching, acid reflux, loose stools, and a thick greasy tongue coating.',
    content: 'Bao He Wan: Shan Zha, Shen Qu, Lai Fu Zi, Ban Xia, Chen Pi, Fu Ling, Lian Qiao. Pattern: Food Stagnation. ⚠️ PREGNANCY CAUTION: Contains Lai Fu Zi (draining) and Ban Xia - avoid or use short-term with modified formula.',
    acupoints: 'CV12, ST36, ST21, PC6',
    pharmacopeia: 'Dan Xi Xin Fa (Era of Dan-Xi)',
  },
  // Heat-Clearing, Exterior-Releasing, Shen-Calming
  {
    id: '14',
    formula_name: 'Huang Lian Jie Du Tang (黄连解毒汤)',
    question: 'What is Huang Lian Jie Du Tang used for?',
    answer: 'Huang Lian Jie Du Tang drains Fire and resolves Toxin from all three Jiaos. It treats severe Heat/Fire patterns with high fever, irritability, dry mouth, insomnia, or skin eruptions.',
    content: 'Huang Lian Jie Du Tang: Huang Lian, Huang Qin, Huang Bai, Zhi Zi. Pattern: Fire Toxin in All Three Jiaos. ⛔ PREGNANCY CONTRAINDICATED: Strongly draining and cold - may damage fetus. ⚠️ ELDERLY CAUTION: Very cold nature may damage Stomach Qi - use short-term only. ⚠️ YIN DEFICIENCY CAUTION: Extremely cold - may further damage Yin if Empty Heat is present.',
    acupoints: 'LI11, GV14, PC8, LV2',
    pharmacopeia: 'Wai Tai Mi Yao (Arcane Essentials)',
  },
  {
    id: '15',
    formula_name: 'Gui Zhi Tang (桂枝汤)',
    question: 'When is Gui Zhi Tang indicated?',
    answer: 'Gui Zhi Tang releases the exterior and harmonizes Ying and Wei. It treats Wind-Cold exterior deficiency with sweating, aversion to wind, fever, headache, and a floating moderate pulse.',
    content: 'Gui Zhi Tang: Gui Zhi, Bai Shao, Sheng Jiang, Da Zao, Zhi Gan Cao. Pattern: Wind-Cold with Wei Qi Deficiency. ⚠️ ELDERLY CAUTION: Promotes sweating - avoid excessive diaphoresis in weak or elderly patients. Monitor fluid intake.',
    acupoints: 'LU7, LI4, BL12, ST36',
    pharmacopeia: 'Shang Han Lun (Treatise on Cold Damage)',
  },
  {
    id: '16',
    formula_name: 'Tian Wang Bu Xin Dan (天王补心丹)',
    question: 'What does Tian Wang Bu Xin Dan treat?',
    answer: 'Tian Wang Bu Xin Dan nourishes Yin, nourishes Blood, tonifies Heart Qi, and calms the Shen. It treats Heart Yin deficiency with restlessness, insomnia, palpitations, poor memory, and night sweats.',
    content: 'Tian Wang Bu Xin Dan: Sheng Di Huang, Ren Shen, Dan Shen, Xuan Shen, Fu Ling, Wu Wei Zi, Yuan Zhi, Dang Gui, Tian Men Dong, Mai Men Dong, Bai Zi Ren, Suan Zao Ren, Jie Geng. Pattern: Heart Yin Deficiency with Shen Disturbance. ⚠️ ELDERLY/PEDIATRIC CAUTION: Cloying formula - hard to digest. Combine with Spleen-tonifying herbs or reduce dose if digestion is weak.',
    acupoints: 'HT7, PC6, SP6, KI6, CV14',
    pharmacopeia: 'She Sheng Mi Pou (Secret Investigations into Obtaining Health)',
  },
  // Interior-Warming, Drain Dampness, Regulate Qi
  {
    id: '17',
    formula_name: 'Li Zhong Wan (理中丸)',
    question: 'What is Li Zhong Wan used for?',
    answer: 'Li Zhong Wan warms the Middle Jiao and strengthens Spleen Yang. It treats Spleen Yang deficiency with cold abdomen, loose stools, poor appetite, and fatigue.',
    content: 'Li Zhong Wan: Ren Shen, Bai Zhu, Gan Jiang, Zhi Gan Cao. Pattern: Spleen Yang Deficiency with Interior Cold. ⚠️ YIN DEFICIENCY CAUTION: Do NOT use if signs of Empty Heat or Yin Deficiency exist - may aggravate heat symptoms. ⛔ YIN-FIRE CONTRAINDICATED: Hot nature will worsen Yin-Fire (虚火) conditions with night sweats, hot flashes, malar flush.',
    acupoints: 'CV12, ST36, CV6, BL20',
    pharmacopeia: 'Shang Han Lun (Treatise on Cold Damage)',
  },
  {
    id: '18',
    formula_name: 'Wu Ling San (五苓散)',
    question: 'What does Wu Ling San treat?',
    answer: 'Wu Ling San promotes urination and drains Dampness, warms Yang and promotes Qi transformation. It treats water metabolism disorders with edema, difficult urination, thirst with inability to drink.',
    content: 'Wu Ling San: Ze Xie, Fu Ling, Zhu Ling, Bai Zhu, Gui Zhi. Pattern: Bladder Qi Transformation Dysfunction / Dampness Accumulation. ⚠️ PREGNANCY CAUTION: Strong diuretic action alters fluid metabolism - use with care during pregnancy. Monitor hydration.',
    acupoints: 'BL22, CV9, SP9, BL28',
    pharmacopeia: 'Shang Han Lun (Treatise on Cold Damage)',
  },
  {
    id: '19',
    formula_name: 'Ban Xia Hou Po Tang (半夏厚朴汤)',
    question: 'When is Ban Xia Hou Po Tang indicated?',
    answer: 'Ban Xia Hou Po Tang promotes Qi movement, dissipates clumping, and directs rebellious Qi downward. It treats Plum-Pit Qi (Mei He Qi) - sensation of something stuck in throat, chest oppression, cough with phlegm.',
    content: 'Ban Xia Hou Po Tang: Ban Xia, Hou Po, Fu Ling, Sheng Jiang, Zi Su Ye. Pattern: Qi Stagnation with Phlegm Accumulation. ⛔ PREGNANCY CONTRAINDICATED: Contains Ban Xia (pregnancy-forbidden) and strong Qi-moving herbs Hou Po/Zi Su Ye that may stimulate uterus.',
    acupoints: 'CV22, PC6, ST40, LV3',
    pharmacopeia: 'Jin Gui Yao Lue (Essential Prescriptions of the Golden Cabinet)',
  },
  // NEW v7 FORMULAS - Yin-Nourishing, Yang-Warming, Blood-Stopping
  {
    id: '20',
    formula_name: 'Zhi Bai Di Huang Wan (知柏地黄丸)',
    question: 'What is Zhi Bai Di Huang Wan used for?',
    answer: 'Zhi Bai Di Huang Wan nourishes Kidney Yin and clears Empty Fire. It treats Kidney Yin deficiency with Fire flaring - night sweats, hot flashes, malar flush, dry mouth, tinnitus, and spermatorrhea.',
    content: 'Zhi Bai Di Huang Wan: Shu Di Huang, Shan Zhu Yu, Shan Yao, Ze Xie, Mu Dan Pi, Fu Ling, Zhi Mu, Huang Bai. Pattern: Kidney Yin Deficiency with Empty Fire (Yin-Fire/虚火). Base is Liu Wei Di Huang Wan + Zhi Mu/Huang Bai to clear deficiency heat. ⚠️ SPLEEN CAUTION: Cloying and cold - may impair digestion in Spleen Qi deficiency. Add tonics if digestion weak. ⛔ YANG DEFICIENCY CONTRAINDICATED: Cold herbs Zhi Mu/Huang Bai will damage Yang - avoid if true cold signs present.',
    acupoints: 'KI3, KI6, SP6, KI2, HT6',
    pharmacopeia: 'Yi Zong Jin Jian (Golden Mirror of Medicine)',
  },
  {
    id: '21',
    formula_name: 'Jin Gui Shen Qi Wan (金匮肾气丸)',
    question: 'What does Jin Gui Shen Qi Wan treat?',
    answer: 'Jin Gui Shen Qi Wan warms and tonifies Kidney Yang. It treats Kidney Yang deficiency with cold limbs, lower back weakness, frequent urination, edema of lower limbs, and fatigue.',
    content: 'Jin Gui Shen Qi Wan: Shu Di Huang, Shan Zhu Yu, Shan Yao, Ze Xie, Mu Dan Pi, Fu Ling, Rou Gui, Fu Zi (Aconite). Pattern: Kidney Yang Deficiency. Base is Liu Wei Di Huang Wan + Rou Gui/Fu Zi to warm Yang. ⛔ YIN DEFICIENCY CONTRAINDICATED: Warming herbs Fu Zi/Rou Gui will aggravate Empty Heat and Yin-Fire - avoid if night sweats, hot flashes, malar flush present. ⛔ PREGNANCY CONTRAINDICATED: Fu Zi is toxic and contraindicated in pregnancy. ⚠️ CAREFUL DOSING: Fu Zi requires proper preparation (Zhi Fu Zi) - raw form is toxic.',
    acupoints: 'KI3, KI7, CV4, CV6, BL23, GV4',
    pharmacopeia: 'Jin Gui Yao Lue (Essential Prescriptions of the Golden Cabinet)',
  },
  {
    id: '22',
    formula_name: 'Shi Hui San (十灰散)',
    question: 'What is Shi Hui San indicated for?',
    answer: 'Shi Hui San cools Blood and stops bleeding. It treats bleeding due to Blood Heat - hematemesis (vomiting blood), hemoptysis (coughing blood), epistaxis (nosebleed), and hematuria with bright red blood.',
    content: 'Shi Hui San: Da Ji (charred), Xiao Ji (charred), He Ye (charred), Ce Bai Ye (charred), Bai Mao Gen (charred), Qian Cao Gen (charred), Zhi Zi (charred), Da Huang (charred), Mu Dan Pi (charred), Zong Lu Pi (charred). Pattern: Blood Heat Causing Bleeding. All herbs are charred (炭) to enhance hemostatic action. ⛔ BLOOD STASIS CAUTION: Stops bleeding but may cause stasis if used long-term - discontinue once bleeding stops. ⚠️ COLD PATTERN CONTRAINDICATED: For Hot bleeding only - avoid if blood is dark, clotted, or accompanied by cold signs. ⛔ PREGNANCY CAUTION: Contains Da Huang (even charred) - use with extreme caution.',
    acupoints: 'SP1, SP10, LI11, PC3, BL17',
    pharmacopeia: 'Shi Yao Shen Shu (Divine Book of Ten Remedies)',
  },
];

// Forbidden herbs during pregnancy (expanded list v7)
const PREGNANCY_FORBIDDEN = [
  'Da Huang', 'Hong Hua', 'Niu Xi', 'San Leng', 'E Zhu', 'Shui Zhi', 
  'Mang Chong', 'Ban Mao', 'Wu Gong', 'Quan Xie', 'Chan Su', 'Xiong Huang',
  'Qian Niu Zi', 'Ba Dou', 'Gan Sui', 'Da Ji', 'Yuan Hua', 'She Xiang',
  'Tao Ren', 'Yi Mu Cao', 'Mang Xiao', 'Carthami', 'Persicae', 'Huang Lian', 'Huang Qin', 'Huang Bai',
  'Ban Xia', 'Hou Po', 'Zi Su Ye', 'Fu Zi', 'Aconite'
];

// Herbs requiring caution in elderly (cloying/stimulant/cold)
const ELDERLY_CAUTION = ['Ma Huang', 'Shu Di Huang', 'cardiovascular', 'stimulant', 'cloying', 'cold nature', 'sweating', 'Gui Zhi Tang'];

// Herbs requiring caution in children
const CHILDREN_CAUTION = ['Ma Huang', 'stimulant'];

// Formulas/herbs contraindicated with active bleeding
const BLEEDING_CONTRAINDICATED = [
  'Hong Hua', 'Tao Ren', 'Chuan Xiong', 'Niu Xi', 'San Leng', 'E Zhu',
  'blood moving', 'blood stasis', 'invigorate blood', 'Xue Fu Zhu Yu', 'Tao He Cheng Qi',
  'bleeding contraindicated'
];

// Formulas/herbs contraindicated with Yin Deficiency/Yin-Fire (虚火)
const YIN_FIRE_CONTRAINDICATED = [
  'Li Zhong Wan', 'Jin Gui Shen Qi Wan', 'Fu Zi', 'Aconite', 'Rou Gui', 'Gan Jiang',
  'interior warming', 'warm yang', 'yang deficiency contraindicated', 'yin-fire contraindicated',
  'yin deficiency contraindicated'
];

export function HerbalMasterWidget({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FormulaData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [safetyFilters, setSafetyFilters] = useState<SafetyFilter>({
    pregnancy: false,
    children: false,
    elderly: false,
    bleeding: false,
    yinFire: false,
  });
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);

  // Quiz state
  const [quizFormulas, setQuizFormulas] = useState<FormulaData[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Flashcard state
  const [flashcardFormulas, setFlashcardFormulas] = useState<FormulaData[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Legal disclaimer state
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('herbalLegalAccepted') === 'true';
    }
    return false;
  });
  const [isSavingAcknowledgment, setIsSavingAcknowledgment] = useState(false);
  const legalContentRef = useRef<HTMLDivElement>(null);

  // Show legal modal on first load
  useEffect(() => {
    if (!legalAccepted) {
      setShowLegalModal(true);
    }
  }, [legalAccepted]);

  const handleAcceptLegal = async () => {
    setIsSavingAcknowledgment(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save acknowledgment to database
      const { error } = await supabase
        .from('herbal_legal_acknowledgments')
        .insert({
          user_id: user?.id || null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          session_id: sessionStorage.getItem('sessionId') || crypto.randomUUID(),
          language: navigator.language || 'en',
        });

      if (error) {
        console.error('Failed to save legal acknowledgment:', error);
        // Still allow acceptance even if DB save fails
      }
      
      setLegalAccepted(true);
      setShowLegalModal(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('herbalLegalAccepted', 'true');
      }
      
      toast.success('Legal acknowledgment recorded');
    } catch (err) {
      console.error('Error saving acknowledgment:', err);
      // Still allow acceptance
      setLegalAccepted(true);
      setShowLegalModal(false);
      sessionStorage.setItem('herbalLegalAccepted', 'true');
    } finally {
      setIsSavingAcknowledgment(false);
    }
  };

  const openLegalModal = () => {
    setShowLegalModal(true);
  };

  const handlePrintDisclaimer = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Legal Disclaimer - Herbal Formulas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #c53030; border-bottom: 2px solid #c53030; padding-bottom: 10px; }
          .section { margin: 30px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .flag { font-size: 20px; margin-right: 8px; }
          p { line-height: 1.6; color: #4a5568; }
          strong { color: #2d3748; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>⚖️ Legal Disclaimer / הבהרה משפטית</h1>
        <p style="color: #718096; margin-bottom: 30px;">Important regulatory information regarding herbal formulas and dietary supplements</p>
        
        <div class="section" dir="rtl">
          <div class="section-title"><span class="flag">🇮🇱</span> הבהרה משפטית חשובה</div>
          <p>הפורמולות והצמחים המוצגים ביישום זה <strong>אינם מהווים תרופה</strong> ואינם מאושרים ככאלו על ידי משרד הבריאות. מדובר בתוספי תזונה/צמחים בלבד המשמשים כטיפול משלים.</p>
          <p><strong>הנחיות שימוש:</strong> השימוש במוצרים אלו מחייב התייעצות וקבלת <strong>מרשם כתוב ומסודר</strong> ממטפל מוסמך. המידע ביישום זה אינו מהווה תחליף לייעוץ רפואי מקצועי, אבחון או טיפול רפואי קונבנציונלי.</p>
        </div>

        <div class="section" dir="ltr">
          <div class="section-title"><span class="flag">🇺🇸</span> Legal Disclaimer</div>
          <p>The herbal formulas presented here are <strong>dietary supplements</strong> and are <strong>NOT medication approved by the Ministry of Health</strong>. They are intended for use solely as complementary support.</p>
          <p><strong>Usage Protocol:</strong> These products must be used strictly under the <strong>written guidance and prescription</strong> of a qualified therapist. This information does not constitute medical advice or a substitute for professional medical diagnosis or treatment.</p>
        </div>

        <div class="section" dir="ltr">
          <div class="section-title"><span class="flag">🇷🇺</span> Отказ от ответственности</div>
          <p>Представленные здесь травяные формулы являются <strong>пищевыми добавками</strong> и <strong>НЕ являются лекарственными средствами</strong>, одобренными Министерством здравоохранения. Они предназначены исключительно для использования в качестве дополнительной поддержки.</p>
          <p><strong>Правила использования:</strong> Эти продукты должны использоваться строго в соответствии с <strong>письменным предписанием</strong> квалифицированного специалиста. Данная информация не заменяет профессиональную медицинскую консультацию.</p>
        </div>

        <div class="footer">
          <p>Printed on: ${new Date().toLocaleString()}</p>
          <p>Document Version: 1.0</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Search formulas - uses embedded data as fallback
  const searchFormulas = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const lowerQuery = query.toLowerCase();
      
      // First try database search
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, content, question, answer, metadata, document_id')
        .or(`content.ilike.%${query}%,question.ilike.%${query}%,answer.ilike.%${query}%`)
        .limit(10);

      let formulas: FormulaData[] = [];

      if (!error && data && data.length > 0) {
        formulas = data.map((chunk: any) => ({
          id: chunk.id,
          formula_name: chunk.question || 'Unknown Formula',
          question: chunk.question,
          answer: chunk.answer,
          content: chunk.content,
          source: chunk.metadata?.source || 'Knowledge Base',
          acupoints: chunk.metadata?.acupoints,
          pharmacopeia: chunk.metadata?.pharmacopeia,
        }));
      } else {
        // Fallback to embedded sample data
        formulas = SAMPLE_FORMULAS.filter(f => 
          f.formula_name.toLowerCase().includes(lowerQuery) ||
          f.content.toLowerCase().includes(lowerQuery) ||
          (f.answer && f.answer.toLowerCase().includes(lowerQuery)) ||
          (f.question && f.question.toLowerCase().includes(lowerQuery))
        );
      }

      setSearchResults(formulas);

      // Run safety check if filters are active
      if (safetyFilters.pregnancy || safetyFilters.children || safetyFilters.elderly || safetyFilters.bleeding || safetyFilters.yinFire) {
        const warnings: string[] = [];
        formulas.forEach(formula => {
          const lowerContent = formula.content.toLowerCase();
          
          if (safetyFilters.pregnancy) {
            const foundForbidden = PREGNANCY_FORBIDDEN.filter(herb => 
              lowerContent.includes(herb.toLowerCase())
            );
            if (foundForbidden.length > 0 || lowerContent.includes('pregnancy contraindicated') || lowerContent.includes('pregnancy forbidden')) {
              warnings.push(`⛔ ${formula.formula_name}: PREGNANCY CONTRAINDICATED - Contains blood-moving or purgative herbs (${foundForbidden.slice(0, 3).join(', ')}${foundForbidden.length > 3 ? '...' : ''})`);
            }
          }
          if (safetyFilters.children) {
            const foundCaution = CHILDREN_CAUTION.some(term => lowerContent.includes(term.toLowerCase()));
            if (foundCaution || lowerContent.includes('caution') && lowerContent.includes('children')) {
              warnings.push(`⚠️ ${formula.formula_name}: PEDIATRIC CAUTION - Contains stimulants. Reduce dose or substitute.`);
            }
          }
          if (safetyFilters.elderly) {
            const foundCaution = ELDERLY_CAUTION.some(term => lowerContent.includes(term.toLowerCase()));
            if (foundCaution || lowerContent.includes('elderly caution')) {
              warnings.push(`⚠️ ${formula.formula_name}: ELDERLY CAUTION - Cloying/stimulant herbs. Monitor digestion & cardiovascular status.`);
            }
          }
          if (safetyFilters.bleeding) {
            const foundBleeding = BLEEDING_CONTRAINDICATED.some(term => lowerContent.includes(term.toLowerCase()));
            if (foundBleeding || lowerContent.includes('bleeding contraindicated')) {
              warnings.push(`🩸 ${formula.formula_name}: BLEEDING CONTRAINDICATED - Contains blood-moving herbs. Do NOT use with active bleeding.`);
            }
          }
          if (safetyFilters.yinFire) {
            const foundYinFire = YIN_FIRE_CONTRAINDICATED.some(term => lowerContent.includes(term.toLowerCase()));
            if (foundYinFire || lowerContent.includes('yin-fire contraindicated') || lowerContent.includes('yin deficiency contraindicated')) {
              warnings.push(`🔥 ${formula.formula_name}: YIN-FIRE CONTRAINDICATED - Warming herbs will aggravate Empty Heat. Avoid if night sweats/hot flashes present.`);
            }
          }
        });
        setSafetyWarnings(warnings);
      } else {
        setSafetyWarnings([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to embedded data on error
      const lowerQuery = query.toLowerCase();
      const formulas = SAMPLE_FORMULAS.filter(f => 
        f.formula_name.toLowerCase().includes(lowerQuery) ||
        f.content.toLowerCase().includes(lowerQuery)
      );
      setSearchResults(formulas);
    } finally {
      setIsSearching(false);
    }
  }, [safetyFilters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'search') {
        searchFormulas(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, searchFormulas]);

  // Load quiz formulas - uses embedded data as fallback
  const loadQuizFormulas = useCallback(async () => {
    setQuizLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, content, question, answer, metadata')
        .not('question', 'is', null)
        .limit(20);

      let formulas: FormulaData[] = [];

      if (!error && data && data.length > 0) {
        formulas = data
          .filter((chunk: any) => chunk.question && chunk.answer)
          .map((chunk: any) => ({
            id: chunk.id,
            formula_name: chunk.question || 'Unknown',
            question: chunk.question,
            answer: chunk.answer,
            content: chunk.content,
          }));
      }

      // Use embedded data as fallback if no data from DB
      if (formulas.length === 0) {
        formulas = SAMPLE_FORMULAS.map(f => ({
          ...f,
          question: f.question || f.formula_name,
          answer: f.answer || f.content,
        }));
      }

      // Shuffle for randomness
      const shuffled = formulas.sort(() => Math.random() - 0.5);
      setQuizFormulas(shuffled);
      setCurrentQuizIndex(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('Quiz load error:', error);
      // Use embedded data on error
      const shuffled = [...SAMPLE_FORMULAS].sort(() => Math.random() - 0.5);
      setQuizFormulas(shuffled);
      setCurrentQuizIndex(0);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  // Load flashcard formulas - uses embedded data as fallback
  const loadFlashcardFormulas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, content, question, answer, metadata')
        .not('question', 'is', null)
        .limit(30);

      let formulas: FormulaData[] = [];

      if (!error && data && data.length > 0) {
        formulas = data.map((chunk: any) => ({
          id: chunk.id,
          formula_name: chunk.question || 'Unknown',
          question: chunk.question,
          answer: chunk.answer,
          content: chunk.content,
        }));
      }

      // Use embedded data as fallback
      if (formulas.length === 0) {
        formulas = SAMPLE_FORMULAS;
      }

      setFlashcardFormulas(formulas);
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Flashcard load error:', error);
      setFlashcardFormulas(SAMPLE_FORMULAS);
      setCurrentFlashcardIndex(0);
    }
  }, []);

  // Load data when tabs change
  useEffect(() => {
    if (activeTab === 'quiz' && quizFormulas.length === 0) {
      loadQuizFormulas();
    }
    if (activeTab === 'flashcards' && flashcardFormulas.length === 0) {
      loadFlashcardFormulas();
    }
  }, [activeTab, quizFormulas.length, flashcardFormulas.length, loadQuizFormulas, loadFlashcardFormulas]);

  // Quiz navigation
  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizFormulas.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  // Flashcard navigation
  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcardFormulas.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const toggleSafetyFilter = (filter: keyof SafetyFilter) => {
    setSafetyFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const currentQuiz = quizFormulas[currentQuizIndex];
  const currentFlashcard = flashcardFormulas[currentFlashcardIndex];

  return (
    <Card className={cn(
      "overflow-hidden border-jade/30 bg-gradient-to-b from-background to-jade/5",
      className
    )}>
      {/* Header with Apothecary Theme */}
      <CardHeader className="p-0">
        <div className="relative h-32 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 border-2 border-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 border-2 border-amber-400 rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          
          {/* Golden qi particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-60"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="relative z-10 p-4 h-full flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pill className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white tracking-wide">
                  אנציקלופדיית צמחים
                </h3>
              </div>
              <p className="text-xs text-white/70">
                Herbal Master v7 • 22 Formulas
              </p>
            </div>
            
            <Badge className="bg-amber-500/20 border-amber-400 text-amber-400 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Evidence Based
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-slate-800 rounded-none h-12">
          <TabsTrigger 
            value="search" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 text-slate-400 rounded-none"
          >
            <Search className="h-4 w-4 mr-1" />
            איתור & בטיחות
          </TabsTrigger>
          <TabsTrigger 
            value="quiz"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 text-slate-400 rounded-none"
          >
            <GraduationCap className="h-4 w-4 mr-1" />
            חידון קליני
          </TabsTrigger>
          <TabsTrigger 
            value="flashcards"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 text-slate-400 rounded-none"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            כרטיסיות
          </TabsTrigger>
        </TabsList>

        {/* Search & Safety Tab */}
        <TabsContent value="search" className="p-4 min-h-[300px]">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="חפש פורמולה, צמח או תסמינים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-2 focus:border-jade"
              dir="rtl"
            />
          </div>

          {/* Safety Toggles */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">פילטר בטיחות (Safety Checks):</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('pregnancy')}
                className={cn(
                  "transition-all",
                  safetyFilters.pregnancy && "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                )}
              >
                <Heart className="h-3.5 w-3.5 mr-1" />
                🤰 הריון
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('children')}
                className={cn(
                  "transition-all",
                  safetyFilters.children && "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                )}
              >
                <Baby className="h-3.5 w-3.5 mr-1" />
                🧒 ילדים
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('elderly')}
                className={cn(
                  "transition-all",
                  safetyFilters.elderly && "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                )}
              >
                <User className="h-3.5 w-3.5 mr-1" />
                👴 גיל שלישי
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('bleeding')}
                className={cn(
                  "transition-all",
                  safetyFilters.bleeding && "bg-red-600 text-white border-red-600 hover:bg-red-700"
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                🩸 דימום
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('yinFire')}
                className={cn(
                  "transition-all",
                  safetyFilters.yinFire && "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                )}
              >
                <Zap className="h-3.5 w-3.5 mr-1" />
                🔥 יין-אש
              </Button>
            </div>
          </div>

          {/* Safety Warnings */}
          {safetyWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-rose-500 font-semibold mb-2">
                <AlertTriangle className="h-4 w-4" />
                אזהרות בטיחות
              </div>
              {safetyWarnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-rose-400">{warning}</p>
              ))}
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-jade border-t-transparent rounded-full mx-auto mb-2" />
                מחפש...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((formula) => (
                <div 
                  key={formula.id}
                  className="p-3 border rounded-lg hover:bg-jade/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-jade" />
                        {formula.formula_name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {formula.answer || formula.content}
                      </p>
                      {formula.acupoints && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          נקודות: {formula.acupoints}
                        </Badge>
                      )}
                    </div>
                    <Shield className="h-4 w-4 text-jade/50" />
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                לא נמצאו תוצאות
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                הקלד שם פורמולה או תסמינים לחיפוש
              </div>
            )}
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="p-4 min-h-[300px]">
          {quizLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-jade border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground">טוען שאלות...</p>
            </div>
          ) : currentQuiz ? (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>שאלה {currentQuizIndex + 1} מתוך {quizFormulas.length}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={loadQuizFormulas}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  ערבב מחדש
                </Button>
              </div>

              {/* Question Card */}
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6 text-center">
                  <p className="text-lg font-semibold mb-4" dir="auto">
                    {currentQuiz.question}
                  </p>
                  
                  {showAnswer ? (
                    <div className="mt-4 p-4 bg-jade/10 rounded-lg text-jade animate-fade-in">
                      <p className="font-medium" dir="auto">{currentQuiz.answer}</p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowAnswer(true)}
                      className="bg-slate-800 hover:bg-slate-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      הצג תשובה
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevQuizQuestion}
                  disabled={currentQuizIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <Badge variant="secondary">
                  מבוסס על מאגר CSV
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextQuizQuestion}
                  disabled={currentQuizIndex === quizFormulas.length - 1}
                >
                  הבא
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>אין שאלות זמינות כרגע</p>
              <p className="text-xs mt-1">יש לייבא את קובץ הפורמולות</p>
            </div>
          )}
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="p-4 min-h-[300px]">
          {flashcardFormulas.length > 0 && currentFlashcard ? (
            <div className="space-y-4">
              {/* Presentation Mode Header */}
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <BookOpen className="h-5 w-5 text-jade" />
                <div>
                  <p className="font-semibold text-sm">מצב הצגה (Presentation Mode)</p>
                  <p className="text-xs text-muted-foreground">
                    מציג את ה-Q&A המלא מהקובץ למטפל בזמן אמת
                  </p>
                </div>
              </div>

              {/* Flashcard */}
              <div 
                className="relative min-h-[180px] cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <Card className={cn(
                  "absolute inset-0 transition-all duration-500 backface-hidden",
                  "bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-amber-900/20",
                  "border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center p-6",
                  isFlipped && "rotate-y-180 opacity-0"
                )}>
                  <CardContent className="text-center">
                    <Badge className="mb-3 bg-jade/20 text-jade">לחץ להפוך</Badge>
                    <p className="text-lg font-semibold" dir="auto">
                      {currentFlashcard.question}
                    </p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "absolute inset-0 transition-all duration-500 backface-hidden",
                  "bg-gradient-to-br from-jade/10 to-emerald-50 dark:from-jade/20 dark:to-emerald-900/20",
                  "border-2 border-jade flex items-center justify-center p-6",
                  !isFlipped && "rotate-y-180 opacity-0"
                )}>
                  <CardContent className="text-center">
                    <Badge className="mb-3 bg-amber-500/20 text-amber-600">תשובה</Badge>
                    <p className="text-md font-medium text-jade" dir="auto">
                      {currentFlashcard.answer}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevFlashcard}
                  disabled={currentFlashcardIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentFlashcardIndex + 1} / {flashcardFormulas.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextFlashcard}
                  disabled={currentFlashcardIndex === flashcardFormulas.length - 1}
                >
                  הבא
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>אין כרטיסיות זמינות כרגע</p>
              <p className="text-xs mt-1">יש לייבא את קובץ הפורמולות</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Legal Disclaimer Footer */}
      <div 
        className="bg-muted/50 border-t border-border p-3 text-center cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={openLegalModal}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Scale className="h-3.5 w-3.5" />
          <span>הבהרה משפטית: המוצרים אינם תרופות (לחץ לפרטים)</span>
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          Disclaimer: Not MOH Approved Medicine | Отказ от ответственности
        </p>
      </div>

      {/* Legal Disclaimer Modal */}
      <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          {/* Red top border indicator */}
          <div className="h-1.5 bg-destructive w-full" />
          
          <DialogHeader className="px-6 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Scale className="h-5 w-5 text-destructive" />
              Legal Disclaimer / הבהרה משפטית
            </DialogTitle>
            <DialogDescription>
              Important regulatory information in multiple languages
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Hebrew Section */}
            <div className="border-b border-dashed border-border pb-6" dir="rtl">
              <div className="flex items-center gap-2 font-bold text-lg mb-3 text-foreground">
                <span>🇮🇱</span>
                <span>הבהרה משפטית חשובה</span>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  הפורמולות והצמחים המוצגים ביישום זה <strong className="text-foreground">אינם מהווים תרופה</strong> ואינם מאושרים ככאלו על ידי משרד הבריאות. מדובר בתוספי תזונה/צמחים בלבד המשמשים כטיפול משלים.
                </p>
                <p>
                  <strong className="text-foreground">הנחיות שימוש:</strong> השימוש במוצרים אלו מחייב התייעצות וקבלת <strong className="text-foreground">מרשם כתוב ומסודר</strong> ממטפל מוסמך. המידע ביישום זה אינו מהווה תחליף לייעוץ רפואי מקצועי, אבחון או טיפול רפואי קונבנציונלי.
                </p>
              </div>
            </div>

            {/* English Section */}
            <div className="border-b border-dashed border-border pb-6" dir="ltr">
              <div className="flex items-center gap-2 font-bold text-lg mb-3 text-foreground">
                <span>🇺🇸</span>
                <span>Legal Disclaimer</span>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  The herbal formulas presented here are <strong className="text-foreground">dietary supplements</strong> and are <strong className="text-foreground">NOT medication approved by the Ministry of Health</strong>. They are intended for use solely as complementary support.
                </p>
                <p>
                  <strong className="text-foreground">Usage Protocol:</strong> These products must be used strictly under the <strong className="text-foreground">written guidance and prescription</strong> of a qualified therapist. This information does not constitute medical advice or a substitute for professional medical diagnosis or treatment.
                </p>
              </div>
            </div>

            {/* Russian Section */}
            <div dir="ltr">
              <div className="flex items-center gap-2 font-bold text-lg mb-3 text-foreground">
                <span>🇷🇺</span>
                <span>Отказ от ответственности</span>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  Представленные здесь травяные формулы являются <strong className="text-foreground">пищевыми добавками</strong> и <strong className="text-foreground">НЕ являются лекарственными средствами</strong>, одобренными Министерством здравоохранения. Они предназначены исключительно для использования в качестве дополнительной поддержки.
                </p>
                <p>
                  <strong className="text-foreground">Правила использования:</strong> Эти продукты должны использоваться строго в соответствии с <strong className="text-foreground">письменным предписанием</strong> квалифицированного специалиста. Данная информация не заменяет профессиональную медицинскую консультацию.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={handlePrintDisclaimer}
              className="w-full sm:w-auto"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print / הדפס
            </Button>
            <Button 
              onClick={handleAcceptLegal}
              className="w-full sm:w-auto"
              disabled={isSavingAcknowledgment}
            >
              {isSavingAcknowledgment ? 'Saving...' : 'I Acknowledge / אני מאשר/ת'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default HerbalMasterWidget;
