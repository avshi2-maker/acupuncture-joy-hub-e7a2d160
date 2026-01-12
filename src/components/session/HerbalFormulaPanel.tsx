import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Pill, 
  Plus, 
  Sparkles,
  BookOpen,
  Leaf,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Top 50 classic TCM formulas with pattern associations
const CLASSIC_FORMULAS = [
  // Liver Patterns
  { id: '1', name: 'Xiao Yao San', pinyin: '逍遥散', english: 'Free Wanderer Powder', patterns: ['Liver Qi Stagnation', 'Spleen Qi Deficiency', 'Blood Deficiency'], composition: 'Chai Hu, Dang Gui, Bai Shao, Bai Zhu, Fu Ling, Zhi Gan Cao, Bo He, Sheng Jiang', dosage: '6-9g each herb, 2x daily', actions: 'Spreads Liver Qi, Strengthens Spleen, Nourishes Blood' },
  { id: '2', name: 'Chai Hu Shu Gan San', pinyin: '柴胡疏肝散', english: 'Bupleurum Soothing the Liver Powder', patterns: ['Liver Qi Stagnation'], composition: 'Chai Hu, Chen Pi, Zhi Ke, Bai Shao, Xiang Fu, Chuan Xiong, Zhi Gan Cao', dosage: '9g each, 2x daily', actions: 'Spreads Liver Qi, Relieves constraint, Harmonizes Blood' },
  { id: '3', name: 'Long Dan Xie Gan Tang', pinyin: '龙胆泻肝汤', english: 'Gentiana Draining Liver Decoction', patterns: ['Liver Fire', 'Damp-Heat in Liver/Gallbladder'], composition: 'Long Dan Cao, Huang Qin, Zhi Zi, Ze Xie, Mu Tong, Che Qian Zi, Chai Hu, Sheng Di, Dang Gui, Gan Cao', dosage: '3-9g each, 2x daily', actions: 'Drains Liver Fire, Clears Damp-Heat' },
  { id: '4', name: 'Tian Ma Gou Teng Yin', pinyin: '天麻钩藤饮', english: 'Gastrodia & Uncaria Decoction', patterns: ['Liver Yang Rising', 'Liver Wind'], composition: 'Tian Ma, Gou Teng, Shi Jue Ming, Zhi Zi, Huang Qin, Chuan Niu Xi, Du Zhong, Yi Mu Cao, Sang Ji Sheng, Ye Jiao Teng, Fu Shen', dosage: '9-15g each, 2x daily', actions: 'Calms Liver, Extinguishes Wind, Clears Heat' },
  
  // Spleen Patterns
  { id: '5', name: 'Si Jun Zi Tang', pinyin: '四君子汤', english: 'Four Gentlemen Decoction', patterns: ['Spleen Qi Deficiency', 'Qi Deficiency'], composition: 'Ren Shen, Bai Zhu, Fu Ling, Zhi Gan Cao', dosage: '9g each, 2x daily', actions: 'Tonifies Qi, Strengthens Spleen' },
  { id: '6', name: 'Liu Jun Zi Tang', pinyin: '六君子汤', english: 'Six Gentlemen Decoction', patterns: ['Spleen Qi Deficiency', 'Dampness', 'Phlegm'], composition: 'Ren Shen, Bai Zhu, Fu Ling, Zhi Gan Cao, Chen Pi, Ban Xia', dosage: '9g each, 2x daily', actions: 'Tonifies Qi, Strengthens Spleen, Transforms Phlegm' },
  { id: '7', name: 'Bu Zhong Yi Qi Tang', pinyin: '补中益气汤', english: 'Tonify Middle & Augment Qi Decoction', patterns: ['Spleen Qi Deficiency', 'Qi Sinking'], composition: 'Huang Qi, Ren Shen, Bai Zhu, Zhi Gan Cao, Dang Gui, Chen Pi, Sheng Ma, Chai Hu', dosage: '15-30g Huang Qi, 9g others, 2x daily', actions: 'Tonifies Qi, Raises Yang, Lifts Prolapse' },
  { id: '8', name: 'Shen Ling Bai Zhu San', pinyin: '参苓白术散', english: 'Ginseng, Poria & Atractylodes Powder', patterns: ['Spleen Qi Deficiency', 'Dampness'], composition: 'Ren Shen, Bai Zhu, Fu Ling, Shan Yao, Lian Zi, Bai Bian Dou, Yi Yi Ren, Sha Ren, Jie Geng, Zhi Gan Cao', dosage: '6-9g each, 2x daily', actions: 'Augments Qi, Strengthens Spleen, Resolves Dampness' },
  { id: '9', name: 'Li Zhong Wan', pinyin: '理中丸', english: 'Regulate the Middle Pill', patterns: ['Spleen Yang Deficiency', 'Cold in Middle Jiao'], composition: 'Ren Shen, Bai Zhu, Gan Jiang, Zhi Gan Cao', dosage: '9g each, 2x daily', actions: 'Warms Middle Jiao, Tonifies Spleen Yang' },
  
  // Kidney Patterns
  { id: '10', name: 'Liu Wei Di Huang Wan', pinyin: '六味地黄丸', english: 'Six Ingredient Pill with Rehmannia', patterns: ['Kidney Yin Deficiency', 'Liver Yin Deficiency'], composition: 'Shu Di Huang, Shan Zhu Yu, Shan Yao, Ze Xie, Mu Dan Pi, Fu Ling', dosage: '24g Shu Di, 12g Shan Zhu Yu, Shan Yao, 9g others', actions: 'Nourishes Kidney Yin' },
  { id: '11', name: 'Jin Gui Shen Qi Wan', pinyin: '金匮肾气丸', english: 'Kidney Qi Pill from Golden Cabinet', patterns: ['Kidney Yang Deficiency'], composition: 'Shu Di Huang, Shan Zhu Yu, Shan Yao, Ze Xie, Mu Dan Pi, Fu Ling, Fu Zi, Rou Gui', dosage: '24g Shu Di, 12g Shan Zhu Yu, Shan Yao, 3-6g Fu Zi, Rou Gui', actions: 'Warms Kidney Yang' },
  { id: '12', name: 'Zhi Bai Di Huang Wan', pinyin: '知柏地黄丸', english: 'Anemarrhena, Phellodendron & Rehmannia Pill', patterns: ['Kidney Yin Deficiency', 'Deficiency Heat'], composition: 'Shu Di Huang, Shan Zhu Yu, Shan Yao, Ze Xie, Mu Dan Pi, Fu Ling, Zhi Mu, Huang Bai', dosage: 'Standard Liu Wei + 9g each Zhi Mu, Huang Bai', actions: 'Nourishes Yin, Clears Deficiency Heat' },
  { id: '13', name: 'You Gui Wan', pinyin: '右归丸', english: 'Restore the Right Pill', patterns: ['Kidney Yang Deficiency', 'Jing Deficiency'], composition: 'Shu Di Huang, Shan Yao, Shan Zhu Yu, Gou Qi Zi, Du Zhong, Tu Si Zi, Fu Zi, Rou Gui, Dang Gui, Lu Jiao Jiao', dosage: '9-15g each, 2x daily', actions: 'Warms and Tonifies Kidney Yang' },
  { id: '14', name: 'Zuo Gui Wan', pinyin: '左归丸', english: 'Restore the Left Pill', patterns: ['Kidney Yin Deficiency', 'Kidney Jing Deficiency'], composition: 'Shu Di Huang, Shan Yao, Shan Zhu Yu, Gou Qi Zi, Chuan Niu Xi, Tu Si Zi, Lu Jiao Jiao, Gui Ban Jiao', dosage: '9-15g each, 2x daily', actions: 'Nourishes Kidney Yin and Jing' },
  
  // Heart Patterns
  { id: '15', name: 'Gui Pi Tang', pinyin: '归脾汤', english: 'Restore the Spleen Decoction', patterns: ['Heart Blood Deficiency', 'Spleen Qi Deficiency'], composition: 'Ren Shen, Huang Qi, Bai Zhu, Fu Shen, Suan Zao Ren, Long Yan Rou, Mu Xiang, Dang Gui, Yuan Zhi, Zhi Gan Cao, Sheng Jiang, Da Zao', dosage: '9g each, 2x daily', actions: 'Augments Qi, Nourishes Blood, Calms Spirit' },
  { id: '16', name: 'Tian Wang Bu Xin Dan', pinyin: '天王补心丹', english: 'Emperor of Heaven Special Pill to Tonify Heart', patterns: ['Heart Yin Deficiency', 'Heart Blood Deficiency'], composition: 'Sheng Di, Xuan Shen, Tian Men Dong, Mai Men Dong, Dang Gui, Dan Shen, Ren Shen, Fu Ling, Suan Zao Ren, Bai Zi Ren, Yuan Zhi, Wu Wei Zi, Jie Geng, Zhu Sha', dosage: '9g each, 2x daily', actions: 'Nourishes Yin, Nourishes Blood, Calms Spirit' },
  { id: '17', name: 'Huang Lian Jie Du Tang', pinyin: '黄连解毒汤', english: 'Coptis Decoction to Relieve Toxicity', patterns: ['Heart Fire', 'Toxic Heat'], composition: 'Huang Lian, Huang Qin, Huang Bai, Zhi Zi', dosage: '9g each, 2x daily', actions: 'Drains Fire, Relieves Toxicity' },
  { id: '18', name: 'An Shen Ding Zhi Wan', pinyin: '安神定志丸', english: 'Calm Spirit Pill', patterns: ['Heart Blood Deficiency', 'Heart Qi Deficiency'], composition: 'Ren Shen, Fu Ling, Fu Shen, Yuan Zhi, Shi Chang Pu, Long Chi', dosage: '9g each, 2x daily', actions: 'Tonifies Heart Qi, Calms Spirit' },
  
  // Lung Patterns
  { id: '19', name: 'Bu Fei Tang', pinyin: '补肺汤', english: 'Tonify Lung Decoction', patterns: ['Lung Qi Deficiency'], composition: 'Ren Shen, Huang Qi, Shu Di Huang, Wu Wei Zi, Zi Wan, Sang Bai Pi', dosage: '9g each, 2x daily', actions: 'Tonifies Lung Qi' },
  { id: '20', name: 'Bai He Gu Jin Tang', pinyin: '百合固金汤', english: 'Lily Bulb to Preserve Metal Decoction', patterns: ['Lung Yin Deficiency', 'Kidney Yin Deficiency'], composition: 'Bai He, Sheng Di, Shu Di, Mai Men Dong, Xuan Shen, Bei Mu, Jie Geng, Dang Gui, Bai Shao, Gan Cao', dosage: '9g each, 2x daily', actions: 'Nourishes Yin, Moistens Lung' },
  { id: '21', name: 'Er Chen Tang', pinyin: '二陈汤', english: 'Two Aged Decoction', patterns: ['Phlegm in Lungs', 'Dampness'], composition: 'Ban Xia, Chen Pi, Fu Ling, Zhi Gan Cao', dosage: '9-15g each, 2x daily', actions: 'Dries Dampness, Transforms Phlegm' },
  { id: '22', name: 'Qing Qi Hua Tan Wan', pinyin: '清气化痰丸', english: 'Clear Qi & Transform Phlegm Pill', patterns: ['Phlegm-Heat in Lungs'], composition: 'Dan Nan Xing, Ban Xia, Gua Lou Ren, Huang Qin, Chen Pi, Xing Ren, Zhi Shi, Fu Ling', dosage: '9g each, 2x daily', actions: 'Clears Heat, Transforms Phlegm' },
  
  // Blood Patterns
  { id: '23', name: 'Si Wu Tang', pinyin: '四物汤', english: 'Four Substance Decoction', patterns: ['Blood Deficiency', 'Liver Blood Deficiency'], composition: 'Shu Di Huang, Dang Gui, Bai Shao, Chuan Xiong', dosage: '9-12g each, 2x daily', actions: 'Tonifies Blood, Regulates Blood' },
  { id: '24', name: 'Xue Fu Zhu Yu Tang', pinyin: '血府逐瘀汤', english: 'Drive Out Stasis from Mansion of Blood Decoction', patterns: ['Blood Stasis'], composition: 'Tao Ren, Hong Hua, Dang Gui, Sheng Di, Chuan Xiong, Chi Shao, Niu Xi, Jie Geng, Chai Hu, Zhi Ke, Gan Cao', dosage: '9g each, 2x daily', actions: 'Invigorates Blood, Dispels Stasis' },
  { id: '25', name: 'Tao Hong Si Wu Tang', pinyin: '桃红四物汤', english: 'Four Substance Decoction with Safflower & Peach Pit', patterns: ['Blood Stasis', 'Blood Deficiency'], composition: 'Shu Di Huang, Dang Gui, Bai Shao, Chuan Xiong, Tao Ren, Hong Hua', dosage: '9g each, 2x daily', actions: 'Tonifies Blood, Invigorates Blood' },
  { id: '26', name: 'Shao Fu Zhu Yu Tang', pinyin: '少腹逐瘀汤', english: 'Drive Out Blood Stasis from Lower Abdomen Decoction', patterns: ['Blood Stasis', 'Cold in Lower Jiao'], composition: 'Xiao Hui Xiang, Gan Jiang, Yuan Hu, Mo Yao, Dang Gui, Chuan Xiong, Guan Gui, Chi Shao, Pu Huang, Wu Ling Zhi', dosage: '6-9g each, 2x daily', actions: 'Invigorates Blood, Warms Channels' },
  
  // Qi Patterns
  { id: '27', name: 'Sheng Mai San', pinyin: '生脉散', english: 'Generate the Pulse Powder', patterns: ['Qi Deficiency', 'Yin Deficiency'], composition: 'Ren Shen, Mai Men Dong, Wu Wei Zi', dosage: '9g Ren Shen, 15g Mai Men Dong, 6g Wu Wei Zi', actions: 'Augments Qi, Generates Fluids' },
  { id: '28', name: 'Ban Xia Hou Po Tang', pinyin: '半夏厚朴汤', english: 'Pinellia & Magnolia Bark Decoction', patterns: ['Qi Stagnation', 'Phlegm'], composition: 'Ban Xia, Hou Po, Fu Ling, Sheng Jiang, Zi Su Ye', dosage: '9-12g each, 2x daily', actions: 'Moves Qi, Transforms Phlegm' },
  
  // Dampness Patterns
  { id: '29', name: 'Wu Ling San', pinyin: '五苓散', english: 'Five Ingredient Powder with Poria', patterns: ['Dampness', 'Water Accumulation'], composition: 'Ze Xie, Fu Ling, Zhu Ling, Bai Zhu, Gui Zhi', dosage: '9-15g each, 2x daily', actions: 'Promotes Urination, Drains Dampness' },
  { id: '30', name: 'Ping Wei San', pinyin: '平胃散', english: 'Calm the Stomach Powder', patterns: ['Dampness', 'Food Stagnation'], composition: 'Cang Zhu, Hou Po, Chen Pi, Zhi Gan Cao', dosage: '9g each, 2x daily', actions: 'Dries Dampness, Harmonizes Stomach' },
  { id: '31', name: 'San Ren Tang', pinyin: '三仁汤', english: 'Three Seed Decoction', patterns: ['Dampness', 'Damp-Heat'], composition: 'Xing Ren, Bai Dou Kou, Yi Yi Ren, Ban Xia, Hou Po, Tong Cao, Zhu Ye, Hua Shi', dosage: '9-15g each, 2x daily', actions: 'Transforms Dampness, Clears Heat' },
  
  // Exterior Patterns
  { id: '32', name: 'Ma Huang Tang', pinyin: '麻黄汤', english: 'Ephedra Decoction', patterns: ['Wind-Cold', 'Exterior Excess'], composition: 'Ma Huang, Gui Zhi, Xing Ren, Zhi Gan Cao', dosage: '6-9g each, 2x daily', actions: 'Releases Exterior, Dispels Cold' },
  { id: '33', name: 'Gui Zhi Tang', pinyin: '桂枝汤', english: 'Cinnamon Twig Decoction', patterns: ['Wind-Cold', 'Exterior Deficiency'], composition: 'Gui Zhi, Bai Shao, Sheng Jiang, Da Zao, Zhi Gan Cao', dosage: '9g each, 2x daily', actions: 'Releases Exterior, Harmonizes Ying & Wei' },
  { id: '34', name: 'Yin Qiao San', pinyin: '银翘散', english: 'Honeysuckle & Forsythia Powder', patterns: ['Wind-Heat'], composition: 'Jin Yin Hua, Lian Qiao, Jie Geng, Bo He, Dan Dou Chi, Niu Bang Zi, Jing Jie, Dan Zhu Ye, Lu Gen, Gan Cao', dosage: '9g each, 2x daily', actions: 'Releases Exterior Wind-Heat' },
  { id: '35', name: 'Sang Ju Yin', pinyin: '桑菊饮', english: 'Mulberry Leaf & Chrysanthemum Decoction', patterns: ['Wind-Heat', 'Lung Heat'], composition: 'Sang Ye, Ju Hua, Lian Qiao, Bo He, Xing Ren, Jie Geng, Lu Gen, Gan Cao', dosage: '9g each, 2x daily', actions: 'Disperses Wind-Heat, Benefits Throat' },
  
  // Additional Classic Formulas
  { id: '36', name: 'Xiang Sha Liu Jun Zi Tang', pinyin: '香砂六君子汤', english: 'Six Gentlemen with Aucklandia & Amomum', patterns: ['Spleen Qi Deficiency', 'Qi Stagnation'], composition: 'Ren Shen, Bai Zhu, Fu Ling, Zhi Gan Cao, Chen Pi, Ban Xia, Mu Xiang, Sha Ren', dosage: '9g each, 2x daily', actions: 'Tonifies Qi, Moves Qi, Transforms Phlegm' },
  { id: '37', name: 'Wen Dan Tang', pinyin: '温胆汤', english: 'Warm the Gallbladder Decoction', patterns: ['Phlegm-Heat', 'Gallbladder Deficiency'], composition: 'Ban Xia, Zhu Ru, Zhi Shi, Chen Pi, Fu Ling, Gan Cao, Sheng Jiang, Da Zao', dosage: '9g each, 2x daily', actions: 'Regulates Qi, Transforms Phlegm, Clears Heat' },
  { id: '38', name: 'Suan Zao Ren Tang', pinyin: '酸枣仁汤', english: 'Sour Jujube Decoction', patterns: ['Heart Blood Deficiency', 'Liver Blood Deficiency'], composition: 'Suan Zao Ren, Fu Ling, Zhi Mu, Chuan Xiong, Gan Cao', dosage: '15-30g Suan Zao Ren, 9g others', actions: 'Nourishes Blood, Calms Spirit' },
  { id: '39', name: 'Gan Mai Da Zao Tang', pinyin: '甘麦大枣汤', english: 'Licorice, Wheat & Jujube Decoction', patterns: ['Heart Qi Deficiency', 'Heart Blood Deficiency'], composition: 'Zhi Gan Cao, Xiao Mai, Da Zao', dosage: '9g Gan Cao, 15-30g Xiao Mai, 10 Da Zao', actions: 'Nourishes Heart, Calms Spirit' },
  { id: '40', name: 'Dang Gui Bu Xue Tang', pinyin: '当归补血汤', english: 'Tangkuei Decoction to Tonify Blood', patterns: ['Blood Deficiency', 'Qi Deficiency'], composition: 'Huang Qi, Dang Gui', dosage: '30g Huang Qi, 6g Dang Gui', actions: 'Tonifies Qi to Generate Blood' },
  { id: '41', name: 'Ba Zhen Tang', pinyin: '八珍汤', english: 'Eight Treasure Decoction', patterns: ['Qi Deficiency', 'Blood Deficiency'], composition: 'Ren Shen, Bai Zhu, Fu Ling, Zhi Gan Cao, Shu Di, Dang Gui, Bai Shao, Chuan Xiong', dosage: '9g each, 2x daily', actions: 'Tonifies Qi and Blood' },
  { id: '42', name: 'Shi Quan Da Bu Tang', pinyin: '十全大补汤', english: 'All-Inclusive Great Tonifying Decoction', patterns: ['Qi Deficiency', 'Blood Deficiency', 'Yang Deficiency'], composition: 'Ba Zhen Tang + Huang Qi, Rou Gui', dosage: '9g each, 2x daily', actions: 'Warms and Tonifies Qi and Blood' },
  { id: '43', name: 'Da Bu Yin Wan', pinyin: '大补阴丸', english: 'Great Tonify Yin Pill', patterns: ['Yin Deficiency', 'Deficiency Heat'], composition: 'Shu Di Huang, Gui Ban, Huang Bai, Zhi Mu', dosage: '9-15g each, 2x daily', actions: 'Enriches Yin, Subdues Fire' },
  { id: '44', name: 'Qing Hao Bie Jia Tang', pinyin: '青蒿鳖甲汤', english: 'Artemisia Annua & Soft-Shelled Turtle Shell Decoction', patterns: ['Yin Deficiency', 'Deficiency Heat'], composition: 'Qing Hao, Bie Jia, Sheng Di, Zhi Mu, Mu Dan Pi', dosage: '9g each, 2x daily', actions: 'Nourishes Yin, Clears Deficiency Heat' },
  { id: '45', name: 'Yi Guan Jian', pinyin: '一贯煎', english: 'Linking Decoction', patterns: ['Liver Yin Deficiency', 'Liver Qi Stagnation'], composition: 'Sheng Di, Gou Qi Zi, Sha Shen, Mai Men Dong, Dang Gui, Chuan Lian Zi', dosage: '9-15g each, 2x daily', actions: 'Enriches Yin, Spreads Liver Qi' },
  { id: '46', name: 'Zhen Gan Xi Feng Tang', pinyin: '镇肝熄风汤', english: 'Sedate Liver & Extinguish Wind Decoction', patterns: ['Liver Yang Rising', 'Liver Wind'], composition: 'Huai Niu Xi, Dai Zhe Shi, Long Gu, Mu Li, Gui Ban, Bai Shao, Xuan Shen, Tian Men Dong, Yin Chen Hao, Chuan Lian Zi, Mai Ya, Gan Cao', dosage: '9-30g each, 2x daily', actions: 'Sedates Liver, Extinguishes Wind, Nourishes Yin' },
  { id: '47', name: 'Ling Gui Zhu Gan Tang', pinyin: '苓桂术甘汤', english: 'Poria, Cinnamon Twig, Atractylodes & Licorice Decoction', patterns: ['Spleen Yang Deficiency', 'Phlegm-Fluid'], composition: 'Fu Ling, Gui Zhi, Bai Zhu, Zhi Gan Cao', dosage: '12g Fu Ling, 9g others', actions: 'Warms Yang, Transforms Phlegm-Fluid' },
  { id: '48', name: 'Zhen Wu Tang', pinyin: '真武汤', english: 'True Warrior Decoction', patterns: ['Kidney Yang Deficiency', 'Water Overflow'], composition: 'Fu Zi, Bai Zhu, Fu Ling, Sheng Jiang, Bai Shao', dosage: '9g each, Fu Zi 3-9g', actions: 'Warms Yang, Promotes Urination' },
  { id: '49', name: 'Ge Gen Tang', pinyin: '葛根汤', english: 'Kudzu Decoction', patterns: ['Wind-Cold', 'Stiff Neck'], composition: 'Ge Gen, Ma Huang, Gui Zhi, Bai Shao, Sheng Jiang, Da Zao, Zhi Gan Cao', dosage: '12g Ge Gen, 9g others', actions: 'Releases Exterior, Relaxes Muscles' },
  { id: '50', name: 'Xiao Chai Hu Tang', pinyin: '小柴胡汤', english: 'Minor Bupleurum Decoction', patterns: ['Shaoyang Pattern', 'Liver Qi Stagnation'], composition: 'Chai Hu, Huang Qin, Ban Xia, Ren Shen, Zhi Gan Cao, Sheng Jiang, Da Zao', dosage: '24g Chai Hu, 9g others', actions: 'Harmonizes Shaoyang, Resolves Constraint' },
];

interface HerbalFormulaPanelProps {
  selectedPattern?: string;
  onAddToPlan: (formulaText: string) => void;
}

export function HerbalFormulaPanel({ selectedPattern, onAddToPlan }: HerbalFormulaPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);

  // Filter formulas based on pattern and search query
  const filteredFormulas = useMemo(() => {
    let results = CLASSIC_FORMULAS;

    // First, prioritize by selected pattern
    if (selectedPattern) {
      const patternMatches = results.filter(f => 
        f.patterns.some(p => 
          p.toLowerCase().includes(selectedPattern.toLowerCase()) ||
          selectedPattern.toLowerCase().includes(p.toLowerCase())
        )
      );
      const otherFormulas = results.filter(f => 
        !f.patterns.some(p => 
          p.toLowerCase().includes(selectedPattern.toLowerCase()) ||
          selectedPattern.toLowerCase().includes(p.toLowerCase())
        )
      );
      results = [...patternMatches, ...otherFormulas];
    }

    // Then filter by search query
    if (searchQuery) {
      results = results.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.pinyin.includes(searchQuery) ||
        f.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.patterns.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return results;
  }, [selectedPattern, searchQuery]);

  const suggestedFormulas = useMemo(() => {
    if (!selectedPattern) return [];
    return CLASSIC_FORMULAS.filter(f => 
      f.patterns.some(p => 
        p.toLowerCase().includes(selectedPattern.toLowerCase()) ||
        selectedPattern.toLowerCase().includes(p.toLowerCase())
      )
    ).slice(0, 5);
  }, [selectedPattern]);

  const handleAddToPlan = (formula: typeof CLASSIC_FORMULAS[0]) => {
    const formulaText = `**${formula.name}** (${formula.pinyin}) - ${formula.english}
• Composition: ${formula.composition}
• Dosage: ${formula.dosage}
• Actions: ${formula.actions}`;
    
    onAddToPlan(formulaText);
    toast.success(`${formula.name} added to treatment plan`);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Herbal Pharmacy</h3>
            <p className="text-xs text-muted-foreground">Classic TCM formulas</p>
          </div>
        </div>
      </div>

      {/* Pattern Alert */}
      {selectedPattern && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Pattern Detected: {selectedPattern}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {suggestedFormulas.length} recommended formula{suggestedFormulas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search formulas, herbs, or patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Formulas List */}
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3">
          {filteredFormulas.map((formula) => {
            const isRecommended = selectedPattern && formula.patterns.some(p => 
              p.toLowerCase().includes(selectedPattern.toLowerCase()) ||
              selectedPattern.toLowerCase().includes(p.toLowerCase())
            );
            const isExpanded = expandedFormula === formula.id;

            return (
              <Card 
                key={formula.id}
                className={cn(
                  "transition-all",
                  isRecommended && "ring-2 ring-amber-400 dark:ring-amber-600"
                )}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm font-semibold">
                          {formula.name}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formula.pinyin}
                        </span>
                        {isRecommended && (
                          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formula.english}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1 text-jade-600 hover:text-jade-700 hover:bg-jade-50 dark:hover:bg-jade-950/30"
                      onClick={() => handleAddToPlan(formula)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formula.patterns.map((pattern, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          selectedPattern && pattern.toLowerCase().includes(selectedPattern.toLowerCase()) 
                            ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300"
                            : ""
                        )}
                      >
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setExpandedFormula(isExpanded ? null : formula.id)}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 text-xs border-t pt-3">
                      <div>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Leaf className="h-3 w-3 text-green-600" />
                          Composition:
                        </span>
                        <p className="text-muted-foreground mt-0.5">{formula.composition}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Dosage:</span>
                        <p className="text-muted-foreground mt-0.5">{formula.dosage}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Actions:</span>
                        <p className="text-muted-foreground mt-0.5">{formula.actions}</p>
                      </div>
                      <div className="flex items-start gap-1 p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>Always verify contraindications and adjust dosage for individual patients.</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredFormulas.length === 0 && (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No formulas found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
