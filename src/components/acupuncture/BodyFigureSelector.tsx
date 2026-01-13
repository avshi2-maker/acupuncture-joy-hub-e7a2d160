import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, MapPin, ZoomIn, ZoomOut, CheckSquare, Square, Sparkles, X, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PointTooltip, usePointTooltip } from './PointTooltip';
import { MeridianGlow } from './MeridianGlow';

// Import all 37 body figure images from the master CSV
import abdomenImg from '@/assets/body-figures/abdomen.png';
import shoulderSideImg from '@/assets/body-figures/shoulder_side.png';
import neckPosteriorImg from '@/assets/body-figures/neck_posterior.png';
import handDorsumImg from '@/assets/body-figures/hand_dorsum.png';
import scalpTopImg from '@/assets/body-figures/scalp_top.png';
import faceFrontImg from '@/assets/body-figures/face_front.png';
import kneeFrontImg from '@/assets/body-figures/knee_front.png';
import ankleImg from '@/assets/body-figures/ankle.png';
import sacrumBackImg from '@/assets/body-figures/sacrum_back.png';
import neckFrontImg from '@/assets/body-figures/neck_front.png';
import shoulderAnteriorImg from '@/assets/body-figures/shoulder_anterior.png';
import ankleMedialImg from '@/assets/body-figures/ankle_medial.png';
import kneeLateralImg from '@/assets/body-figures/knee_lateral.png';
import kneeMedialImg from '@/assets/body-figures/knee_medial.png';
import kneeBackImg from '@/assets/body-figures/knee_back.png';
import headLateralImg from '@/assets/body-figures/head_lateral.png';
import earImg from '@/assets/body-figures/ear.png';
import tongueImg from '@/assets/body-figures/tongue.png';
import chestImg from '@/assets/body-figures/chest.png';
import upperBackImg from '@/assets/body-figures/upper_back.png';
import lowerBackImg from '@/assets/body-figures/lower_back.png';
import armFullImg from '@/assets/body-figures/arm_full.png';
import elbowInnerImg from '@/assets/body-figures/elbow_inner.png';
import wristImg from '@/assets/body-figures/wrist.png';
import thighHipImg from '@/assets/body-figures/thigh_hip.png';
import lowerLegImg from '@/assets/body-figures/lower_leg.png';
import footTopImg from '@/assets/body-figures/foot_top.png';
import footSoleImg from '@/assets/body-figures/foot_sole.png';
import childFrontImg from '@/assets/body-figures/child_front.png';
import childBackImg from '@/assets/body-figures/child_back.png';
import abdomenZoomedImg from '@/assets/body-figures/abdomen_zoomed.png';
import ankleSideImg from '@/assets/body-figures/ankle_side.png';
import handImg from '@/assets/body-figures/hand.png';
import footImg from '@/assets/body-figures/foot.png';
import legsPosteriorImg from '@/assets/body-figures/legs_posterior.png';
import sacrumImg from '@/assets/body-figures/sacrum.png';
import abdomenFemaleImg from '@/assets/body-figures/abdomen_female.png';

// Map image names to imports (all 37 body figures from master CSV)
const imageMap: Record<string, string> = {
  'abdomen.png': abdomenImg,
  'shoulder_side.png': shoulderSideImg,
  'neck_posterior.png': neckPosteriorImg,
  'hand_dorsum.png': handDorsumImg,
  'scalp_top.png': scalpTopImg,
  'face_front.png': faceFrontImg,
  'knee_front.png': kneeFrontImg,
  'ankle.png': ankleImg,
  'sacrum_back.png': sacrumBackImg,
  'neck_front.png': neckFrontImg,
  'shoulder_anterior.png': shoulderAnteriorImg,
  'ankle_medial.png': ankleMedialImg,
  'knee_lateral.png': kneeLateralImg,
  'knee_medial.png': kneeMedialImg,
  'knee_back.png': kneeBackImg,
  'head_lateral.png': headLateralImg,
  'ear.png': earImg,
  'tongue.png': tongueImg,
  'chest.png': chestImg,
  'upper_back.png': upperBackImg,
  'lower_back.png': lowerBackImg,
  'arm_full.png': armFullImg,
  'elbow_inner.png': elbowInnerImg,
  'wrist.png': wristImg,
  'thigh_hip.png': thighHipImg,
  'lower_leg.png': lowerLegImg,
  'foot_top.png': footTopImg,
  'foot_sole.png': footSoleImg,
  'child_front.png': childFrontImg,
  'child_back.png': childBackImg,
  'abdomen_zoomed.png': abdomenZoomedImg,
  'ankle_side.png': ankleSideImg,
  'hand.png': handImg,
  'foot.png': footImg,
  'legs_posterior.png': legsPosteriorImg,
  'sacrum.png': sacrumImg,
  'abdomen_female.png': abdomenFemaleImg,
};

// Body figure categories based on master CSV - organized by clinical priority and body region
const figureCategories = [
  {
    name: 'Head & Neck',
    figures: ['face_front.png', 'head_lateral.png', 'scalp_top.png', 'neck_front.png', 'neck_posterior.png']
  },
  {
    name: 'Upper Limbs',
    figures: ['shoulder_anterior.png', 'shoulder_side.png', 'arm_full.png', 'elbow_inner.png', 'wrist.png', 'hand.png', 'hand_dorsum.png']
  },
  {
    name: 'Torso',
    figures: ['chest.png', 'abdomen.png', 'abdomen_zoomed.png', 'abdomen_female.png', 'upper_back.png', 'lower_back.png', 'sacrum.png', 'sacrum_back.png']
  },
  {
    name: 'Lower Limbs',
    figures: ['thigh_hip.png', 'knee_front.png', 'knee_lateral.png', 'knee_medial.png', 'knee_back.png', 'legs_posterior.png', 'lower_leg.png', 'ankle.png', 'ankle_medial.png', 'ankle_side.png', 'foot.png', 'foot_top.png', 'foot_sole.png']
  },
  {
    name: 'Microsystems',
    figures: ['ear.png', 'tongue.png']
  },
  {
    name: 'Pediatric',
    figures: ['child_front.png', 'child_back.png']
  }
];

interface AcuPoint {
  id: string;
  code: string;
  name_english: string;
  name_chinese: string;
  name_pinyin: string;
  meridian: string;
  location: string;
  indications: string[];
  actions: string[];
}

interface SelectedPoint {
  code: string;
  x: number;
  y: number;
  details?: AcuPoint | null;
}

interface BodyFigureSelectorProps {
  highlightedPoints?: string[]; // Array of point codes to highlight (from AI response)
  onPointSelect?: (pointCode: string) => void;
  onGenerateProtocol?: (points: string[]) => void; // Callback to generate treatment protocol
}

/**
 * COMPREHENSIVE SYNONYM DICTIONARY
 * Maps common TCM point names (pinyin, English, variants) to standard codes.
 * Critical for Body Map highlighting when AI returns names instead of codes.
 */
const POINT_NAME_MAP: Record<string, string> = {
  // === LARGE INTESTINE (LI) ===
  'hegu': 'LI4',
  'he gu': 'LI4',
  'joining valley': 'LI4',
  'union valley': 'LI4',
  'quchi': 'LI11',
  'qu chi': 'LI11',
  'pool at the crook': 'LI11',
  'shangyang': 'LI1',
  'erjian': 'LI2',
  'sanjian': 'LI3',
  'yangxi': 'LI5',
  'pianli': 'LI6',
  'wenliu': 'LI7',
  'shousanli': 'LI10',
  'binao': 'LI14',
  'jianyu': 'LI15',
  'yingxiang': 'LI20',
  
  // === STOMACH (ST) ===
  'zusanli': 'ST36',
  'zu san li': 'ST36',
  'leg three miles': 'ST36',
  'three leg mile': 'ST36',
  'fenglong': 'ST40',
  'feng long': 'ST40',
  'abundant bulge': 'ST40',
  'tianshu': 'ST25',
  'tian shu': 'ST25',
  'celestial pivot': 'ST25',
  'sibai': 'ST2',
  'juliao': 'ST3',
  'dicang': 'ST4',
  'jiache': 'ST6',
  'xiaguan': 'ST7',
  'touwei': 'ST8',
  'renying': 'ST9',
  'shuitu': 'ST10',
  'qishe': 'ST11',
  'quepen': 'ST12',
  'qihu': 'ST13',
  'kufang': 'ST14',
  'wuyi': 'ST15',
  'yingchuang': 'ST16',
  'ruzhong': 'ST17',
  'rugen': 'ST18',
  'burong': 'ST19',
  'chengman': 'ST20',
  'liangmen': 'ST21',
  'guanmen': 'ST22',
  'taiyi': 'ST23',
  'huaroumen': 'ST24',
  'wailing': 'ST26',
  'daju': 'ST27',
  'shuidao': 'ST28',
  'guilai': 'ST29',
  'qichong': 'ST30',
  'biguan': 'ST31',
  'futu': 'ST32',
  'yinshi': 'ST33',
  'liangqiu': 'ST34',
  'dubi': 'ST35',
  'shangjuxu': 'ST37',
  'tiaokou': 'ST38',
  'xiajuxu': 'ST39',
  'jiexi': 'ST41',
  'chongyang': 'ST42',
  'xiangu': 'ST43',
  'neiting': 'ST44',
  'lidui': 'ST45',
  
  // === SPLEEN (SP) ===
  'sanyinjiao': 'SP6',
  'san yin jiao': 'SP6',
  'three yin intersection': 'SP6',
  'three yin meeting': 'SP6',
  'xuehai': 'SP10',
  'xue hai': 'SP10',
  'sea of blood': 'SP10',
  'yinlingquan': 'SP9',
  'yin ling quan': 'SP9',
  'yin mound spring': 'SP9',
  'taibai': 'SP3',
  'gongsun': 'SP4',
  'shangqiu': 'SP5',
  'lougu': 'SP7',
  'diji': 'SP8',
  'jimen': 'SP11',
  'chongmen': 'SP12',
  'fushe': 'SP13',
  'fujie': 'SP14',
  'daheng': 'SP15',
  'fuai': 'SP16',
  'shidou': 'SP17',
  'tianxi': 'SP18',
  'xiongxiang': 'SP19',
  'zhourong': 'SP20',
  'dabao': 'SP21',
  
  // === HEART (HT) ===
  'shenmen': 'HT7',
  'shen men': 'HT7',
  'spirit gate': 'HT7',
  'shaohai': 'HT3',
  'lingdao': 'HT4',
  'tongli': 'HT5',
  'yinxi': 'HT6',
  'shaofu': 'HT8',
  'shaochong': 'HT9',
  
  // === SMALL INTESTINE (SI) ===
  'houxi': 'SI3',
  'hou xi': 'SI3',
  'back stream': 'SI3',
  'wangu': 'SI4',
  'yanggu': 'SI5',
  'yanglao': 'SI6',
  'zhizheng': 'SI7',
  'xiaohai': 'SI8',
  'jianzhen': 'SI9',
  'naoshu': 'SI10',
  'tianzong': 'SI11',
  'bingfeng': 'SI12',
  'quyuan': 'SI13',
  'jianwaishu': 'SI14',
  'jianzhongshu': 'SI15',
  'tianchuang': 'SI16',
  'tianrong': 'SI17',
  'quanliao': 'SI18',
  'tinggong': 'SI19',
  
  // === BLADDER (BL) ===
  // Note: fengchi is GB20, not BL - listed in GB section
  'jingming': 'BL1',
  'zanzhu': 'BL2',
  'meichong': 'BL3',
  'qucha': 'BL4',
  'wuchu': 'BL5',
  'chengguang': 'BL6',
  'tongtian': 'BL7',
  'luoque': 'BL8',
  'yuzhen': 'BL9',
  'tianzhu': 'BL10',
  'dashu': 'BL11',
  'fengmen': 'BL12',
  'feishu': 'BL13',
  'jueyinshu': 'BL14',
  'xinshu': 'BL15',
  'dushu': 'BL16',
  'geshu': 'BL17',
  'ganshu': 'BL18',
  'danshu': 'BL19',
  'pishu': 'BL20',
  'weishu': 'BL21',
  'sanjiaoshu': 'BL22',
  'shenshu': 'BL23',
  'qihaishu': 'BL24',
  'dachangshu': 'BL25',
  'guanyuanshu': 'BL26',
  'xiaochangshu': 'BL27',
  'pangguangshu': 'BL28',
  'zhonglvshu': 'BL29',
  'baihuanshu': 'BL30',
  'shangliao': 'BL31',
  'ciliao': 'BL32',
  'zhongliao': 'BL33',
  'xialiao': 'BL34',
  'huiyang': 'BL35',
  'chengfu': 'BL36',
  'yinmen': 'BL37',
  'fuxi': 'BL38',
  'weiyang': 'BL39',
  'weizhong': 'BL40',
  'wei zhong': 'BL40',
  'kunlun': 'BL60',
  'kun lun': 'BL60',
  'shenmai': 'BL62',
  'zhiyin': 'BL67',
  
  // === KIDNEY (KI) ===
  'yongquan': 'KI1',
  'yong quan': 'KI1',
  'bubbling spring': 'KI1',
  'gushing spring': 'KI1',
  'taixi': 'KI3',
  'tai xi': 'KI3',
  'supreme stream': 'KI3',
  'zhaohai': 'KI6',
  'zhao hai': 'KI6',
  'shining sea': 'KI6',
  'rangu': 'KI2',
  'dazhong': 'KI4',
  'shuiquan': 'KI5',
  'fuliu': 'KI7',
  'jiaoxin': 'KI8',
  'zhubin': 'KI9',
  'yingu': 'KI10',
  
  // === PERICARDIUM (PC) ===
  'neiguan': 'PC6',
  'nei guan': 'PC6',
  'inner gate': 'PC6',
  'inner pass': 'PC6',
  'quze': 'PC3',
  'ximen': 'PC4',
  'jianshi': 'PC5',
  'daling': 'PC7',
  'laogong': 'PC8',
  'lao gong': 'PC8',
  'palace of toil': 'PC8',
  'zhongchong': 'PC9',
  
  // === TRIPLE ENERGIZER (TE/SJ) ===
  'waiguan': 'TE5',
  'wai guan': 'TE5',
  'outer gate': 'TE5',
  'outer pass': 'TE5',
  'zhigou': 'TE6',
  'yemen': 'TE2',
  'zhongzhu': 'TE3',
  'yangchi': 'TE4',
  'huizong': 'TE7',
  'sanyangluo': 'TE8',
  'sidu': 'TE9',
  'tianjing': 'TE10',
  'qinglengyuan': 'TE11',
  'xiaoluo': 'TE12',
  'naohui': 'TE13',
  'jianliao': 'TE14',
  'tianliao': 'TE15',
  'tianyou': 'TE16',
  'yifeng': 'TE17',
  'chimai': 'TE18',
  'luxi': 'TE19',
  'jiaosun': 'TE20',
  'ermen': 'TE21',
  'heliao': 'TE22',
  'sizhukong': 'TE23',
  
  // === GALLBLADDER (GB) ===
  'fengchi': 'GB20',
  'feng chi': 'GB20',
  'wind pool': 'GB20',
  'yanglingquan': 'GB34',
  'yang ling quan': 'GB34',
  'yang mound spring': 'GB34',
  'xuanzhong': 'GB39',
  'xuan zhong': 'GB39',
  'suspended bell': 'GB39',
  'tongziliao': 'GB1',
  'tinghui': 'GB2',
  'shangguan': 'GB3',
  'hanyan': 'GB4',
  'xuanlu': 'GB5',
  'xuanli': 'GB6',
  'qubin': 'GB7',
  'shuaigu': 'GB8',
  'tianchong': 'GB9',
  'fubai': 'GB10',
  'touqiaoyin': 'GB11',
  'gb wangu': 'GB12', // renamed to avoid conflict with SI4 wangu
  'benshen': 'GB13',
  'yangbai': 'GB14',
  'toulinqi': 'GB15',
  'muchuang': 'GB16',
  'zhengying': 'GB17',
  'chengling': 'GB18',
  'naokong': 'GB19',
  'jianjing': 'GB21',
  'jian jing': 'GB21',
  'shoulder well': 'GB21',
  'yuanye': 'GB22',
  'zhejin': 'GB23',
  'riyue': 'GB24',
  'jingmen': 'GB25',
  'daimai': 'GB26',
  'wushu': 'GB27',
  'weidao': 'GB28',
  'gb juliao': 'GB29', // renamed to avoid conflict with ST3 juliao
  'huantiao': 'GB30',
  'huan tiao': 'GB30',
  'jumping round': 'GB30',
  'fengshi': 'GB31',
  'feng shi': 'GB31',
  'wind market': 'GB31',
  'gb zhongdu': 'GB32', // renamed to avoid conflict with LV6 zhongdu
  'xiyangguan': 'GB33',
  'waiqiu': 'GB36',
  'guangming': 'GB37',
  'yangfu': 'GB38',
  'qiuxu': 'GB40',
  'zulinqi': 'GB41',
  'diwuhui': 'GB42',
  'xiaxi': 'GB43',
  'zuqiaoyin': 'GB44',
  
  // === LIVER (LV/LR) ===
  'taichong': 'LV3',
  'tai chong': 'LV3',
  'great surge': 'LV3',
  'supreme rushing': 'LV3',
  'dadun': 'LV1',
  'xingjian': 'LV2',
  'zhongfeng': 'LV4',
  'ligou': 'LV5',
  'zhongdu': 'LV6',
  'xiguan': 'LV7',
  'ququan': 'LV8',
  'yinbao': 'LV9',
  'zuwuli': 'LV10',
  'yinlian': 'LV11',
  'jimai': 'LV12',
  'zhangmen': 'LV13',
  'qimen': 'LV14',
  
  // === LUNG (LU) ===
  'lieque': 'LU7',
  'lie que': 'LU7',
  'broken sequence': 'LU7',
  'zhongfu': 'LU1',
  'yunmen': 'LU2',
  'tianfu': 'LU3',
  'xiabai': 'LU4',
  'chize': 'LU5',
  'kongzui': 'LU6',
  'jingqu': 'LU8',
  'taiyuan': 'LU9',
  'yuji': 'LU10',
  'shaoshang': 'LU11',
  
  // === GOVERNING VESSEL (GV/DU) ===
  'baihui': 'GV20',
  'bai hui': 'GV20',
  'hundred meetings': 'GV20',
  'hundred convergences': 'GV20',
  'dazhui': 'GV14',
  'da zhui': 'GV14',
  'great vertebra': 'GV14',
  'renzhong': 'GV26',
  'ren zhong': 'GV26',
  'shuigou': 'GV26',
  'water trough': 'GV26',
  'changqiang': 'GV1',
  'yaoshu': 'GV2',
  'yaoyangguan': 'GV3',
  'mingmen': 'GV4',
  'ming men': 'GV4',
  'gate of life': 'GV4',
  'xuanshu': 'GV5',
  'jizhong': 'GV6',
  'zhongshu': 'GV7',
  'jinsuo': 'GV8',
  'zhiyang': 'GV9',
  'lingtai': 'GV10',
  'shendao': 'GV11',
  'shenzhu': 'GV12',
  'taodao': 'GV13',
  'yamen': 'GV15',
  'fengfu': 'GV16',
  'feng fu': 'GV16',
  'wind mansion': 'GV16',
  'naohu': 'GV17',
  'qiangjian': 'GV18',
  'houding': 'GV19',
  'qianding': 'GV21',
  'xinhui': 'GV22',
  'shangxing': 'GV23',
  'shenting': 'GV24',
  'suliao': 'GV25',
  'duiduan': 'GV27',
  'gv yinjiao': 'GV28', // renamed to avoid conflict with CV7 yinjiao
  
  // === CONCEPTION VESSEL (CV/REN) ===
  'shanzhong': 'CV17',
  'shan zhong': 'CV17',
  'chest center': 'CV17',
  'qihai': 'CV6',
  'qi hai': 'CV6',
  'sea of qi': 'CV6',
  'guanyuan': 'CV4',
  'guan yuan': 'CV4',
  'gate of origin': 'CV4',
  'zhongwan': 'CV12',
  'zhong wan': 'CV12',
  'middle cavity': 'CV12',
  'huiyin': 'CV1',
  'qugu': 'CV2',
  'zhongji': 'CV3',
  'shimen': 'CV5',
  'cv yinjiao': 'CV7', // renamed to avoid conflict with GV28
  'shenque': 'CV8',
  'shen que': 'CV8',
  'spirit gate tower': 'CV8',
  'shuifen': 'CV9',
  'xiawan': 'CV10',
  'jianli': 'CV11',
  'shangwan': 'CV13',
  'juque': 'CV14',
  'jiuwei': 'CV15',
  'zhongting': 'CV16',
  'yutang': 'CV18',
  'zigong': 'CV19',
  'huagai': 'CV20',
  'xuanji': 'CV21',
  'tiantu': 'CV22',
  'tian tu': 'CV22',
  'celestial chimney': 'CV22',
  'lianquan': 'CV23',
  'chengjiang': 'CV24',
  
  // === EXTRA POINTS ===
  'yintang': 'Yintang',
  'yin tang': 'Yintang',
  'hall of impression': 'Yintang',
  'third eye': 'Yintang',
  'taiyang': 'Taiyang',
  'tai yang': 'Taiyang',
  'sun point': 'Taiyang',
  'temple': 'Taiyang',
  'sishencong': 'Sishencong',
  'four alert spirit': 'Sishencong',
  'anmian': 'Anmian',
  'peaceful sleep': 'Anmian',
  'yaoyan': 'Yaoyan',
  'lumbar eyes': 'Yaoyan',
  'dingchuan': 'Dingchuan',
  'ding chuan': 'Dingchuan',
  'stop asthma': 'Dingchuan',
  'huatuojiaji': 'Huatuojiaji',
  'jiaji': 'Huatuojiaji',
  'baxie': 'Baxie',
  'eight pathogens': 'Baxie',
  'shixuan': 'Shixuan',
  'ten dispersions': 'Shixuan',
  'sifeng': 'Sifeng',
  'four seams': 'Sifeng',
  'ear erjian': 'Erjian', // renamed to avoid conflict with LI2 erjian
  'ear apex': 'Erjian',
};

/**
 * Extract acupuncture point codes from AI-generated text.
 * Supports canonical codes, hyphenated, spaced, and common pinyin names.
 */
export function parsePointReferences(text: string): string[] {
  const found: Set<string> = new Set();

  // Match code-style patterns: ST36 / ST-36 / ST 36 (case-insensitive)
  const codePattern = /\b([A-Za-z]{1,3})[-\s]?(\d{1,2})\b/g;
  let match: RegExpExecArray | null;
  while ((match = codePattern.exec(text)) !== null) {
    const normalized = `${match[1].toUpperCase()}${match[2]}`;
    found.add(normalized);
  }

  // Match known point names (case-insensitive whole-word)
  const lowerText = text.toLowerCase();
  for (const [name, code] of Object.entries(POINT_NAME_MAP)) {
    const regex = new RegExp(`\\b${name}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.add(code);
    }
  }

  return [...found];
}

export function BodyFigureSelector({ highlightedPoints = [], onPointSelect, onGenerateProtocol }: BodyFigureSelectorProps) {
  const [selectedFigure, setSelectedFigure] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [zoom, setZoom] = useState(1);
  const [acuPoints, setAcuPoints] = useState<AcuPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Multi-select mode
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  
  // Phase 4: HUD tooltip and meridian glow state
  const { activePoint, showTooltip, hideTooltip, isVisible: tooltipVisible } = usePointTooltip();
  const [activeMeridian, setActiveMeridian] = useState<string | null>(null);

  // Handle point hover for HUD tooltip
  const handlePointHover = useCallback((point: AcuPoint, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    showTooltip(point.code, { x: rect.right, y: rect.top });
  }, [showTooltip]);

  // Fetch acupuncture points from database
  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('acupuncture_points')
        .select('*');
      
      if (!error && data) {
        setAcuPoints(data.map(p => ({
          id: p.id,
          code: p.code,
          name_english: p.name_english,
          name_chinese: p.name_chinese,
          name_pinyin: p.name_pinyin,
          meridian: p.meridian,
          location: p.location,
          indications: p.indications || [],
          actions: p.actions || [],
        })));
      }
      setLoading(false);
    };
    fetchPoints();
  }, []);

  // Get point details from database
  const getPointDetails = (code: string): AcuPoint | undefined => {
    const normalizedCode = code.replace(/[-\s]/g, '').toUpperCase();
    return acuPoints.find(p => p.code.replace(/[-\s]/g, '').toUpperCase() === normalizedCode);
  };

  // Handle point click (for database points displayed on the figure)
  const handlePointClick = (point: AcuPoint) => {
    if (multiSelectMode) {
      setSelectedPoints(prev => {
        if (prev.includes(point.code)) {
          return prev.filter(p => p !== point.code);
        } else {
          return [...prev, point.code];
        }
      });
    } else {
      setSelectedPoint({
        code: point.code,
        x: 50,
        y: 50,
        details: point,
      });
      onPointSelect?.(point.code);
    }
  };

  // Get figure display name
  const getFigureName = (filename: string) => {
    return filename
      .replace('.png', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle generate protocol
  const handleGenerateProtocol = () => {
    if (selectedPoints.length > 0 && onGenerateProtocol) {
      onGenerateProtocol(selectedPoints);
    }
  };

  // Clear all selected points
  const clearSelectedPoints = () => {
    setSelectedPoints([]);
  };

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (multiSelectMode) {
      setSelectedPoints([]);
    }
  };

  // Get all available figures from imageMap
  const allFigures = Object.keys(imageMap);

  if (selectedFigure) {
    return (
      <div className="space-y-4">
        {/* Disclaimer Alert */}
        {showDisclaimer && highlightedPoints.length > 0 && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">AI Suggestion - Not Medical Advice</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
              These acupuncture points are <strong>optional suggestions</strong> based on AI analysis. 
              The final treatment decision must be made by a licensed therapist.
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-amber-700"
              onClick={() => setShowDisclaimer(false)}
            >
              I understand
            </Button>
          </Alert>
        )}

        {/* Header with back button and mode toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button 
            variant="ghost" 
            onClick={() => {
              setSelectedFigure(null);
              setSelectedPoint(null);
              setZoom(1);
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Body Parts
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant={multiSelectMode ? "default" : "outline"}
              size="sm"
              onClick={toggleMultiSelectMode}
              className={`gap-2 ${multiSelectMode ? 'bg-jade hover:bg-jade/90' : ''}`}
            >
              {multiSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              Multi-Select
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected points bar (multi-select mode) */}
        {multiSelectMode && selectedPoints.length > 0 && (
          <Card className="bg-jade-light/20 border-jade/30">
            <CardContent className="py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" className="bg-jade">
                    {selectedPoints.length} points selected
                  </Badge>
                  {selectedPoints.map(code => (
                    <Badge 
                      key={code} 
                      variant="outline" 
                      className="gap-1 cursor-pointer hover:bg-destructive/10"
                      onClick={() => setSelectedPoints(prev => prev.filter(p => p !== code))}
                    >
                      {code}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedPoints}
                    className="gap-1 text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateProtocol}
                    className="gap-1 bg-jade hover:bg-jade/90"
                    disabled={!onGenerateProtocol}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Protocol
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Image display */}
          <Card className="lg:col-span-2 overflow-hidden border-4 border-jade/40 shadow-xl ring-2 ring-jade/20 bg-gradient-to-br from-card to-jade/5">
            <CardHeader className="py-4 bg-gradient-to-r from-jade/10 to-transparent border-b-2 border-jade/20">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-jade/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-jade" />
                </div>
                {getFigureName(selectedFigure)}
                {multiSelectMode && (
                  <Badge variant="outline" className="ml-1 border-jade text-jade bg-jade/10">
                    Click points to select
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 bg-background/50">
              <ScrollArea className="h-[500px]">
                <div 
                  className="relative inline-block"
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageMap[selectedFigure]}
                    alt={getFigureName(selectedFigure)}
                    className="max-w-none"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Point details panel */}
          <Card className="h-fit">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium">Point Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedPoint?.details ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-jade hover:bg-jade">{selectedPoint.details.code}</Badge>
                    <span className="text-sm font-medium">{selectedPoint.details.meridian}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedPoint.details.name_english}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedPoint.details.name_pinyin} • {selectedPoint.details.name_chinese}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-1">Location</h5>
                    <p className="text-sm text-muted-foreground">{selectedPoint.details.location}</p>
                  </div>
                  {selectedPoint.details.indications.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Indications</h5>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {selectedPoint.details.indications.slice(0, 5).map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedPoint.details.actions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Actions</h5>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {selectedPoint.details.actions.slice(0, 5).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select a point from the list below to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available points from database */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Available Acupuncture Points</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading points...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {acuPoints.slice(0, 50).map(point => {
                  const isHighlighted = highlightedPoints.includes(point.code);
                  const isMultiSelected = selectedPoints.includes(point.code);
                  return (
                    <Badge
                      key={point.id}
                      variant={isHighlighted ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isHighlighted 
                          ? 'bg-jade hover:bg-jade/80' 
                          : isMultiSelected 
                            ? 'bg-jade/20 border-jade text-jade' 
                            : 'hover:bg-muted'
                      }`}
                      onClick={() => handlePointClick(point)}
                      onMouseEnter={(e) => handlePointHover(point, e)}
                      onMouseLeave={hideTooltip}
                    >
                      {point.code}
                    </Badge>
                  );
                })}
                {acuPoints.length > 50 && (
                  <Badge variant="secondary">+{acuPoints.length - 50} more</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Phase 4: Point HUD Tooltip */}
        {activePoint && (
          <PointTooltip
            pointCode={activePoint.code}
            anchorPosition={activePoint.position}
            containerRef={containerRef}
            isVisible={tooltipVisible}
            onClose={hideTooltip}
            onMeridianHover={setActiveMeridian}
          />
        )}
        
        {/* Phase 4: Meridian Context Glow */}
        <MeridianGlow activeMeridian={activeMeridian} />
      </div>
    );
  }

  // Body part selection grid
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Body Region</h3>
        <p className="text-sm text-muted-foreground">
          Choose an anatomical view to explore ({allFigures.length} figures available)
        </p>
      </div>

      {figureCategories.map((category) => (
        <div key={category.name} className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
            {category.name}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {category.figures.map((filename) => {
              if (!imageMap[filename]) return null;
              return (
                <Card
                  key={filename}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-jade/20 hover:border-jade/50"
                  onClick={() => setSelectedFigure(filename)}
                >
                  <CardContent className="p-2">
                    <div className="aspect-square bg-gradient-to-b from-jade/5 to-jade/10 rounded-lg overflow-hidden mb-1.5">
                      <img
                        src={imageMap[filename]}
                        alt={getFigureName(filename)}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[10px] font-medium text-center truncate">
                      {getFigureName(filename)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
