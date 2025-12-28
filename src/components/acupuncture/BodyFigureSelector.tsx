import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, MapPin, Info, ZoomIn, ZoomOut, CheckSquare, Square, Sparkles, X, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import all body figure images
import armImg from '@/assets/body-figures/arm.png';
import armInnerImg from '@/assets/body-figures/arm_inner.png';
import bodyFrontImg from '@/assets/body-figures/body_front.png';
import bodyMainImg from '@/assets/body-figures/body_main.png';
import bodybackImg from '@/assets/body-figures/bodyback.png';
import chestImg from '@/assets/body-figures/chest.png';
import childBackImg from '@/assets/body-figures/child_back.png';
import childFrontImg from '@/assets/body-figures/child_front.png';
import earImg from '@/assets/body-figures/ear.png';
import footImg from '@/assets/body-figures/foot.png';
import footSoleImg from '@/assets/body-figures/foot_sole.png';
import handImg from '@/assets/body-figures/hand.png';
import headFrontImg from '@/assets/body-figures/head_front.png';
import headSideImg from '@/assets/body-figures/head_side.png';
import legFrontImg from '@/assets/body-figures/leg_front.png';
import legInnerImg from '@/assets/body-figures/leg_inner.png';
import legOuterImg from '@/assets/body-figures/leg_outer.png';
import spineImg from '@/assets/body-figures/spine.png';
import tongueImg from '@/assets/body-figures/tongue.png';
import wristImg from '@/assets/body-figures/wrist.png';

// Map image names to imports
const imageMap: Record<string, string> = {
  'arm.png': armImg,
  'arm_inner.png': armInnerImg,
  'body_front.png': bodyFrontImg,
  'body_main.png': bodyMainImg,
  'bodyback.png': bodybackImg,
  'chest.png': chestImg,
  'child_back.png': childBackImg,
  'child_front.png': childFrontImg,
  'ear.png': earImg,
  'foot.png': footImg,
  'foot_sole.png': footSoleImg,
  'hand.png': handImg,
  'head_front.png': headFrontImg,
  'head_side.png': headSideImg,
  'leg_front.png': legFrontImg,
  'leg_inner.png': legInnerImg,
  'leg_outer.png': legOuterImg,
  'spine.png': spineImg,
  'tongue.png': tongueImg,
  'wrist.png': wristImg,
};

// Body figure categories for better organization
const figureCategories = [
  {
    name: 'Full Body',
    figures: ['body_front.png', 'bodyback.png', 'body_main.png', 'spine.png']
  },
  {
    name: 'Head & Face',
    figures: ['head_front.png', 'head_side.png', 'ear.png', 'tongue.png']
  },
  {
    name: 'Upper Limbs',
    figures: ['arm.png', 'arm_inner.png', 'wrist.png', 'hand.png']
  },
  {
    name: 'Lower Limbs',
    figures: ['leg_front.png', 'leg_inner.png', 'leg_outer.png', 'foot.png', 'foot_sole.png']
  },
  {
    name: 'Torso',
    figures: ['chest.png']
  },
  {
    name: 'Pediatric',
    figures: ['child_front.png', 'child_back.png']
  }
];

// Point coordinates data - maps point codes to body figures
// Coordinates are now in percentage (0-100) relative to each figure's dimensions
// for precise anatomical placement
const pointCoordinates = [
  // Hand points - dorsal view, thumb on left side
  { point_code: 'LI4', image_name: 'hand.png', x: 35, y: 35 },      // Hegu - between thumb & index metacarpals
  { point_code: 'PC8', image_name: 'hand.png', x: 50, y: 55 },      // Laogong - center of palm
  { point_code: 'HT8', image_name: 'hand.png', x: 55, y: 60 },      // Shaofu - palm, between 4th-5th metacarpals
  { point_code: 'LU10', image_name: 'hand.png', x: 25, y: 50 },     // Yuji - thenar eminence
  { point_code: 'LU11', image_name: 'hand.png', x: 15, y: 70 },     // Shaoshang - thumb tip lateral
  { point_code: 'SI3', image_name: 'hand.png', x: 75, y: 45 },      // Houxi - ulnar side, 5th metacarpal
  { point_code: 'TE3', image_name: 'hand.png', x: 60, y: 30 },      // Zhongzhu - between 4th-5th metacarpals
  
  // Wrist points - anterior/volar view
  { point_code: 'PC7', image_name: 'wrist.png', x: 50, y: 45 },     // Daling - center of wrist crease
  { point_code: 'HT7', image_name: 'wrist.png', x: 65, y: 45 },     // Shenmen - ulnar side of wrist crease
  { point_code: 'LU9', image_name: 'wrist.png', x: 35, y: 45 },     // Taiyuan - radial side wrist crease
  { point_code: 'SI4', image_name: 'wrist.png', x: 75, y: 50 },     // Wangu - ulnar styloid
  { point_code: 'SI6', image_name: 'wrist.png', x: 70, y: 35 },     // Yanglao - above ulnar styloid
  { point_code: 'TE5', image_name: 'wrist.png', x: 50, y: 25 },     // Waiguan - 2 cun above wrist dorsal
  
  // Arm outer/lateral points
  { point_code: 'LI10', image_name: 'arm.png', x: 55, y: 65 },      // Shousanli - 2 cun below LI11
  { point_code: 'LI11', image_name: 'arm.png', x: 50, y: 50 },      // Quchi - lateral elbow crease
  { point_code: 'LI15', image_name: 'arm.png', x: 45, y: 15 },      // Jianyu - anterior shoulder
  { point_code: 'TE6', image_name: 'arm.png', x: 50, y: 60 },       // Zhigou - 3 cun above wrist
  { point_code: 'TE14', image_name: 'arm.png', x: 55, y: 20 },      // Jianliao - posterior shoulder
  
  // Arm inner/medial points
  { point_code: 'PC3', image_name: 'arm_inner.png', x: 50, y: 50 }, // Quze - elbow crease center
  { point_code: 'PC6', image_name: 'arm_inner.png', x: 50, y: 70 }, // Neiguan - 2 cun above wrist
  { point_code: 'HT3', image_name: 'arm_inner.png', x: 60, y: 48 }, // Shaohai - medial elbow
  { point_code: 'LU5', image_name: 'arm_inner.png', x: 40, y: 48 }, // Chize - lateral elbow crease
  { point_code: 'LU7', image_name: 'arm_inner.png', x: 35, y: 75 }, // Lieque - above radial styloid
  
  // Head front points - face view
  { point_code: 'ST2', image_name: 'head_front.png', x: 38, y: 42 },   // Sibai - below eye
  { point_code: 'ST3', image_name: 'head_front.png', x: 35, y: 52 },   // Juliao - level with nose
  { point_code: 'ST4', image_name: 'head_front.png', x: 38, y: 62 },   // Dicang - corner of mouth
  { point_code: 'ST6', image_name: 'head_front.png', x: 30, y: 65 },   // Jiache - jaw angle
  { point_code: 'ST8', image_name: 'head_front.png', x: 32, y: 22 },   // Touwei - forehead corner
  { point_code: 'GB14', image_name: 'head_front.png', x: 35, y: 28 },  // Yangbai - above eyebrow
  { point_code: 'GV20', image_name: 'head_front.png', x: 50, y: 8 },   // Baihui - crown
  { point_code: 'GV24', image_name: 'head_front.png', x: 50, y: 18 },  // Shenting - hairline center
  { point_code: 'GV26', image_name: 'head_front.png', x: 50, y: 58 },  // Renzhong - philtrum
  { point_code: 'BL1', image_name: 'head_front.png', x: 42, y: 38 },   // Jingming - inner canthus
  { point_code: 'BL2', image_name: 'head_front.png', x: 40, y: 32 },   // Zanzhu - inner eyebrow
  { point_code: 'CV23', image_name: 'head_front.png', x: 50, y: 75 },  // Lianquan - above Adam's apple
  { point_code: 'EX-HN1', image_name: 'head_front.png', x: 50, y: 5 }, // Sishencong - around GV20
  { point_code: 'EX-HN3', image_name: 'head_front.png', x: 50, y: 32 },// Yintang area
  { point_code: 'EX-HN5', image_name: 'head_front.png', x: 50, y: 40 },// Nose bridge
  { point_code: 'Yintang', image_name: 'head_front.png', x: 50, y: 32 },// Third eye point
  
  // Head side points - lateral view
  { point_code: 'ST7', image_name: 'head_side.png', x: 55, y: 55 },    // Xiaguan - TMJ area
  { point_code: 'GB1', image_name: 'head_side.png', x: 70, y: 40 },    // Tongziliao - outer canthus
  { point_code: 'GB2', image_name: 'head_side.png', x: 48, y: 48 },    // Tinghui - anterior to ear
  { point_code: 'GB8', image_name: 'head_side.png', x: 40, y: 25 },    // Shuaigu - above ear
  { point_code: 'GB20', image_name: 'head_side.png', x: 25, y: 55 },   // Fengchi - occiput
  { point_code: 'Taiyang', image_name: 'head_side.png', x: 65, y: 38 },// Temple
  
  // Body front points - anterior torso
  { point_code: 'ST25', image_name: 'body_front.png', x: 35, y: 55 },  // Tianshu - 2 cun lateral to navel
  { point_code: 'SP15', image_name: 'body_front.png', x: 32, y: 50 },  // Daheng - 4 cun lateral to navel
  { point_code: 'LV13', image_name: 'body_front.png', x: 28, y: 42 },  // Zhangmen - floating rib
  { point_code: 'CV3', image_name: 'body_front.png', x: 50, y: 78 },   // Zhongji - 4 cun below navel
  { point_code: 'CV4', image_name: 'body_front.png', x: 50, y: 72 },   // Guanyuan - 3 cun below navel
  { point_code: 'CV6', image_name: 'body_front.png', x: 50, y: 62 },   // Qihai - 1.5 cun below navel
  { point_code: 'CV8', image_name: 'body_front.png', x: 50, y: 55 },   // Shenque - navel
  { point_code: 'CV12', image_name: 'body_front.png', x: 50, y: 38 },  // Zhongwan - 4 cun above navel
  
  // Chest points
  { point_code: 'LV14', image_name: 'chest.png', x: 30, y: 70 },       // Qimen - 6th intercostal
  { point_code: 'KI27', image_name: 'chest.png', x: 38, y: 18 },       // Shufu - below clavicle
  { point_code: 'CV17', image_name: 'chest.png', x: 50, y: 50 },       // Danzhong - sternum center
  { point_code: 'CV22', image_name: 'chest.png', x: 50, y: 12 },       // Tiantu - suprasternal notch
  
  // Body back points - posterior view
  { point_code: 'BL10', image_name: 'bodyback.png', x: 40, y: 12 },    // Tianzhu - C1-C2 level
  { point_code: 'BL11', image_name: 'bodyback.png', x: 38, y: 18 },    // Dazhu - T1 level
  { point_code: 'BL13', image_name: 'bodyback.png', x: 38, y: 24 },    // Feishu - T3 Lung
  { point_code: 'BL15', image_name: 'bodyback.png', x: 38, y: 30 },    // Xinshu - T5 Heart
  { point_code: 'BL17', image_name: 'bodyback.png', x: 38, y: 36 },    // Geshu - T7 Diaphragm
  { point_code: 'BL18', image_name: 'bodyback.png', x: 38, y: 40 },    // Ganshu - T9 Liver
  { point_code: 'BL20', image_name: 'bodyback.png', x: 38, y: 46 },    // Pishu - T11 Spleen
  { point_code: 'BL21', image_name: 'bodyback.png', x: 38, y: 50 },    // Weishu - T12 Stomach
  { point_code: 'BL23', image_name: 'bodyback.png', x: 38, y: 56 },    // Shenshu - L2 Kidney
  { point_code: 'BL25', image_name: 'bodyback.png', x: 38, y: 62 },    // Dachangshu - L4 LI
  { point_code: 'GB21', image_name: 'bodyback.png', x: 32, y: 10 },    // Jianjing - shoulder top
  { point_code: 'GB30', image_name: 'bodyback.png', x: 30, y: 72 },    // Huantiao - hip/buttock
  { point_code: 'GV14', image_name: 'bodyback.png', x: 50, y: 14 },    // Dazhui - C7-T1
  { point_code: 'GV16', image_name: 'bodyback.png', x: 50, y: 8 },     // Fengfu - below occiput
  
  // Spine points - midline
  { point_code: 'GV4', image_name: 'spine.png', x: 50, y: 60 },        // Mingmen - L2
  
  // Leg front points - anterior thigh/leg
  { point_code: 'ST34', image_name: 'leg_front.png', x: 55, y: 25 },   // Liangqiu - above knee
  { point_code: 'ST35', image_name: 'leg_front.png', x: 55, y: 32 },   // Dubi - below patella
  { point_code: 'ST36', image_name: 'leg_front.png', x: 55, y: 42 },   // Zusanli - 3 cun below knee
  { point_code: 'ST37', image_name: 'leg_front.png', x: 55, y: 52 },   // Shangjuxu - 6 cun below knee
  { point_code: 'ST40', image_name: 'leg_front.png', x: 55, y: 62 },   // Fenglong - mid-calf lateral
  { point_code: 'EX-LE10', image_name: 'leg_front.png', x: 45, y: 35 },// Heding - above patella center
  
  // Leg inner points - medial view
  { point_code: 'SP6', image_name: 'leg_inner.png', x: 45, y: 75 },    // Sanyinjiao - 3 cun above ankle
  { point_code: 'SP9', image_name: 'leg_inner.png', x: 45, y: 45 },    // Yinlingquan - below knee medial
  { point_code: 'SP10', image_name: 'leg_inner.png', x: 50, y: 30 },   // Xuehai - above knee medial
  { point_code: 'LV8', image_name: 'leg_inner.png', x: 40, y: 40 },    // Ququan - knee crease medial
  { point_code: 'KI7', image_name: 'leg_inner.png', x: 40, y: 80 },    // Fuliu - 2 cun above KI3
  { point_code: 'KI10', image_name: 'leg_inner.png', x: 35, y: 42 },   // Yingu - popliteal medial
  
  // Leg outer points - lateral view
  { point_code: 'BL40', image_name: 'leg_outer.png', x: 50, y: 35 },   // Weizhong - popliteal center
  { point_code: 'BL57', image_name: 'leg_outer.png', x: 50, y: 55 },   // Chengshan - calf center
  { point_code: 'GB31', image_name: 'leg_outer.png', x: 50, y: 20 },   // Fengshi - lateral thigh
  { point_code: 'GB34', image_name: 'leg_outer.png', x: 55, y: 40 },   // Yanglingquan - fibular head
  { point_code: 'GB39', image_name: 'leg_outer.png', x: 50, y: 72 },   // Xuanzhong - 3 cun above ankle
  
  // Foot points - dorsal/medial view
  { point_code: 'ST41', image_name: 'foot.png', x: 50, y: 20 },        // Jiexi - ankle crease center
  { point_code: 'ST44', image_name: 'foot.png', x: 45, y: 75 },        // Neiting - 2nd-3rd toe web
  { point_code: 'SP3', image_name: 'foot.png', x: 25, y: 45 },         // Taibai - medial foot
  { point_code: 'SP4', image_name: 'foot.png', x: 20, y: 35 },         // Gongsun - medial arch
  { point_code: 'LV2', image_name: 'foot.png', x: 40, y: 70 },         // Xingjian - 1st-2nd toe web
  { point_code: 'LV3', image_name: 'foot.png', x: 35, y: 50 },         // Taichong - dorsum
  { point_code: 'KI3', image_name: 'foot.png', x: 15, y: 25 },         // Taixi - medial ankle
  { point_code: 'KI6', image_name: 'foot.png', x: 12, y: 30 },         // Zhaohai - below medial malleolus
  { point_code: 'BL60', image_name: 'foot.png', x: 85, y: 25 },        // Kunlun - lateral ankle
  { point_code: 'BL62', image_name: 'foot.png', x: 82, y: 32 },        // Shenmai - below lateral malleolus
  { point_code: 'GB40', image_name: 'foot.png', x: 75, y: 22 },        // Qiuxu - anterior to lateral malleolus
  { point_code: 'GB41', image_name: 'foot.png', x: 60, y: 55 },        // Zulinqi - 4th-5th metatarsal
  
  // Foot sole points
  { point_code: 'KI1', image_name: 'foot_sole.png', x: 50, y: 35 },    // Yongquan - sole center anterior
  
  // Ear points - auricular view
  { point_code: 'Ear-Shenmen', image_name: 'ear.png', x: 35, y: 35 },  // Upper triangular fossa
  { point_code: 'Ear-Heart', image_name: 'ear.png', x: 50, y: 55 },    // Concha center
  { point_code: 'Ear-Kidney', image_name: 'ear.png', x: 45, y: 70 },   // Upper concha
  { point_code: 'Ear-Liver', image_name: 'ear.png', x: 55, y: 45 },    // Lower concha lateral
  { point_code: 'Ear-Lung', image_name: 'ear.png', x: 50, y: 65 },     // Around heart point
  { point_code: 'Ear-Stomach', image_name: 'ear.png', x: 60, y: 50 },  // Helix root
  { point_code: 'Ear-Spleen', image_name: 'ear.png', x: 55, y: 60 },   // Below liver
  
  // Tongue diagnostic areas
  { point_code: 'Tongue-Heart', image_name: 'tongue.png', x: 50, y: 25 },  // Tip
  { point_code: 'Tongue-Lung', image_name: 'tongue.png', x: 50, y: 35 },   // Behind tip
  { point_code: 'Tongue-Spleen', image_name: 'tongue.png', x: 50, y: 50 }, // Center
  { point_code: 'Tongue-Kidney', image_name: 'tongue.png', x: 50, y: 75 }, // Root
  { point_code: 'Tongue-Liver', image_name: 'tongue.png', x: 30, y: 50 },  // Left edge
  
  // Pediatric points
  { point_code: 'Kid-Tui', image_name: 'child_front.png', x: 50, y: 55 },    // Abdomen
  { point_code: 'Kid-Feishu', image_name: 'child_back.png', x: 38, y: 25 },  // Upper back
  { point_code: 'Kid-Pishu', image_name: 'child_back.png', x: 38, y: 45 },   // Mid back
  { point_code: 'Kid-Shenshu', image_name: 'child_back.png', x: 38, y: 55 }, // Lower back
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

// Get point coordinate info by point code
export function getPointCoordinate(pointCode: string) {
  return pointCoordinates.find(p => p.point_code === pointCode);
}

// Get all available point codes
export function getAllPointCodes(): string[] {
  return pointCoordinates.map(p => p.point_code);
}

/**
 * Map common point names / pinyin to standard codes.
 * Expand as needed.
 */
const POINT_NAME_MAP: Record<string, string> = {
  // Pinyin names (lower-cased for matching)
  zusanli: 'ST36',
  hegu: 'LI4',
  quchi: 'LI11',
  sanyinjiao: 'SP6',
  taichong: 'LV3',
  neiguan: 'PC6',
  waiguan: 'TE5',
  yintang: 'Yintang',
  baihui: 'GV20',
  fengchi: 'GB20',
  taiyang: 'Taiyang',
  shenmen: 'HT7',
  lieque: 'LU7',
  zhaohai: 'KI6',
  dazhui: 'GV14',
  renzhong: 'GV26',
  shanzhong: 'CV17',
  qihai: 'CV6',
  guanyuan: 'CV4',
  zhongwan: 'CV12',
  yanglingquan: 'GB34',
  xuanzhong: 'GB39',
  xuehai: 'SP10',
  yinlingquan: 'SP9',
  fenglong: 'ST40',
  tianshu: 'ST25',
};

/**
 * Normalize a raw point string (e.g. "ST-36", "ST 36", "st36") to the canonical code format (e.g. "ST36").
 */
function normalizePointCode(raw: string): string {
  // Remove hyphens/spaces, uppercase
  return raw.replace(/[-\s]/g, '').toUpperCase();
}

/**
 * Extract acupuncture point codes from AI-generated text.
 * Supports:
 *  - Canonical codes: ST36, LI4
 *  - Hyphenated: ST-36, LI-4
 *  - Spaced: ST 36, LI 4
 *  - Common pinyin names: Zusanli, Hegu, etc.
 */
export function parsePointReferences(text: string): string[] {
  const knownCodes = getAllPointCodes();
  const knownSet = new Set(knownCodes.map((c) => c.toUpperCase()));
  const found: Set<string> = new Set();

  // 1) Match code-style patterns: ST36 / ST-36 / ST 36 (case-insensitive)
  //    Allow 1-3 letters, optional hyphen/space, 1-2 digits
  const codePattern = /\b([A-Za-z]{1,3})[-\s]?(\d{1,2})\b/g;
  let match: RegExpExecArray | null;
  while ((match = codePattern.exec(text)) !== null) {
    const normalized = `${match[1].toUpperCase()}${match[2]}`;
    if (knownSet.has(normalized)) {
      // Return the original canonical code from knownCodes (preserves casing like 'Yintang')
      const original = knownCodes.find((c) => c.toUpperCase() === normalized);
      if (original) found.add(original);
    }
  }

  // 2) Match known point names (case-insensitive whole-word)
  const lowerText = text.toLowerCase();
  for (const [name, code] of Object.entries(POINT_NAME_MAP)) {
    // Whole-word boundary check
    const regex = new RegExp(`\\b${name}\\b`, 'i');
    if (regex.test(lowerText)) {
      // Check if canonical code is in our known list
      const upperCode = code.toUpperCase();
      const original = knownCodes.find((c) => c.toUpperCase() === upperCode);
      if (original) found.add(original);
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
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number}>({ width: 2800, height: 1400 });
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Multi-select mode
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  // Get figures that have highlighted points
  const relevantFigures = useMemo(() => {
    if (highlightedPoints.length === 0) return [];
    const figures = new Set<string>();
    highlightedPoints.forEach(pointCode => {
      const coord = getPointCoordinate(pointCode);
      if (coord) {
        figures.add(coord.image_name);
      }
    });
    return Array.from(figures);
  }, [highlightedPoints]);

  // Auto-select figure if highlighted points are provided
  useEffect(() => {
    if (highlightedPoints.length > 0 && !selectedFigure) {
      const firstPoint = highlightedPoints[0];
      const coord = getPointCoordinate(firstPoint);
      if (coord) {
        setSelectedFigure(coord.image_name);
      }
    }
  }, [highlightedPoints, selectedFigure]);

  // Handle image load to get actual dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

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

  // Get points for selected figure
  const figurePoints = useMemo(() => {
    if (!selectedFigure) return [];
    return pointCoordinates.filter(p => p.image_name === selectedFigure);
  }, [selectedFigure]);

  // Get point details from database (normalize codes for matching)
  const getPointDetails = (code: string): AcuPoint | undefined => {
    // Normalize: remove hyphens/spaces and compare uppercase
    const normalizedCode = code.replace(/[-\s]/g, '').toUpperCase();
    return acuPoints.find(p => p.code.replace(/[-\s]/g, '').toUpperCase() === normalizedCode);
  };

  // Handle point click
  const handlePointClick = (point: typeof pointCoordinates[0]) => {
    if (multiSelectMode) {
      // Toggle point selection in multi-select mode
      setSelectedPoints(prev => {
        if (prev.includes(point.point_code)) {
          return prev.filter(p => p !== point.point_code);
        } else {
          return [...prev, point.point_code];
        }
      });
    } else {
      // Single select mode - show details
      const details = getPointDetails(point.point_code);
      setSelectedPoint({
        code: point.point_code,
        x: point.x,
        y: point.y,
        details: details || null,
      });
      onPointSelect?.(point.point_code);
    }
  };

  // Get figure display name
  const getFigureName = (filename: string) => {
    return filename
      .replace('.png', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Count points per figure
  const getPointCount = (filename: string) => {
    return pointCoordinates.filter(p => p.image_name === filename).length;
  };

  // Check if figure has highlighted points
  const getFigureHighlightedCount = (filename: string) => {
    return pointCoordinates.filter(
      p => p.image_name === filename && highlightedPoints.includes(p.point_code)
    ).length;
  };

  // Get count of selected points on a figure
  const getFigureSelectedCount = (filename: string) => {
    return pointCoordinates.filter(
      p => p.image_name === filename && selectedPoints.includes(p.point_code)
    ).length;
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
      // Clear selected points when exiting multi-select mode
      setSelectedPoints([]);
    }
  };

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
              The final treatment decision must be made by a licensed therapist using their professional expertise, 
              patient assessment, and clinical judgment.
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
            {/* Multi-select toggle */}
            <Button
              variant={multiSelectMode ? "default" : "outline"}
              size="sm"
              onClick={toggleMultiSelectMode}
              className={`gap-2 ${multiSelectMode ? 'bg-jade hover:bg-jade/90' : ''}`}
            >
              {multiSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              Multi-Select
            </Button>
            
            {/* Zoom controls */}
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
          {/* Image with points - Enhanced with thicker border */}
          <Card className="lg:col-span-2 overflow-hidden border-4 border-jade/40 shadow-xl ring-2 ring-jade/20 bg-gradient-to-br from-card to-jade/5">
            <CardHeader className="py-4 bg-gradient-to-r from-jade/10 to-transparent border-b-2 border-jade/20">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-jade/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-jade" />
                </div>
                {getFigureName(selectedFigure)}
                <Badge variant="secondary" className="ml-2 bg-jade/10 border-jade/30">
                  {figurePoints.length} points
                </Badge>
                {highlightedPoints.length > 0 && (
                  <Badge variant="default" className="ml-1 bg-jade shadow-md">
                    {figurePoints.filter(p => highlightedPoints.includes(p.point_code)).length} recommended
                  </Badge>
                )}
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
                    onLoad={handleImageLoad}
                  />
                  
                  {/* Acupuncture point markers */}
                  {figurePoints.map((point) => {
                    const isSelected = selectedPoint?.code === point.point_code;
                    const isHighlighted = highlightedPoints.includes(point.point_code);
                    const isMultiSelected = selectedPoints.includes(point.point_code);
                    // Coordinates are now stored as direct percentages (0-100)
                    // Simply clamp to ensure they stay within visible bounds
                    const xPercent = Math.min(92, Math.max(8, point.x));
                    const yPercent = Math.min(92, Math.max(8, point.y));
                    
                    return (
                      <button
                        key={point.point_code}
                        onClick={() => handlePointClick(point)}
                        className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-[8px] font-bold ${
                          isMultiSelected
                            ? 'bg-primary border-primary text-primary-foreground scale-110 ring-2 ring-primary/30'
                            : isSelected 
                            ? 'bg-primary border-primary text-primary-foreground scale-110 ring-2 ring-primary/30' 
                            : isHighlighted
                            ? 'bg-red-500 border-red-600 text-white scale-110 ring-2 ring-red-500/50 animate-pulse shadow-lg'
                            : 'bg-destructive/80 border-destructive text-destructive-foreground hover:scale-105 hover:bg-destructive'
                        }`}
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                        }}
                        title={point.point_code}
                      >
                        {isMultiSelected && <span className="text-[6px]">✓</span>}
                        <span className="sr-only">{point.point_code}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Point details panel / Multi-select panel */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {multiSelectMode ? 'Selected Points' : 'Point Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {multiSelectMode ? (
                // Multi-select summary
                <div className="space-y-4">
                  {selectedPoints.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {selectedPoints.length} points selected for protocol generation
                      </p>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {selectedPoints.map(code => {
                            const details = getPointDetails(code);
                            return (
                              <div key={code} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                                <Badge variant="default" className="shrink-0">{code}</Badge>
                                <div className="flex-1 min-w-0">
                                  {details ? (
                                    <>
                                      <p className="text-sm font-medium truncate">{details.name_english}</p>
                                      <p className="text-xs text-muted-foreground">{details.meridian} Meridian</p>
                                    </>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">Details not in database</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => setSelectedPoints(prev => prev.filter(p => p !== code))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <Button
                        className="w-full gap-2 bg-jade hover:bg-jade/90"
                        onClick={handleGenerateProtocol}
                        disabled={!onGenerateProtocol}
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate Treatment Protocol
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Click on points to select them</p>
                      <p className="text-xs mt-2">
                        Selected points will be used to generate a treatment protocol
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedPoint ? (
                // Single point details
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">
                      {selectedPoint.code}
                    </h3>
                    {selectedPoint.details ? (
                      <>
                        <p className="text-lg">{selectedPoint.details.name_english}</p>
                        <p className="text-muted-foreground">
                          {selectedPoint.details.name_pinyin} • {selectedPoint.details.name_chinese}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Point data not found in database
                      </p>
                    )}
                  </div>

                  {selectedPoint.details && (
                    <>
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {selectedPoint.details.meridian} Meridian
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">Location</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedPoint.details.location}
                        </p>
                      </div>

                      {selectedPoint.details.actions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">Actions</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedPoint.details.actions.map((action, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPoint.details.indications.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">Indications</h4>
                          <ScrollArea className="h-32">
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {selectedPoint.details.indications.map((ind, i) => (
                                <li key={i}>• {ind}</li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Click on a point marker to view details</p>
                  {highlightedPoints.length > 0 && (
                    <p className="text-xs mt-2 text-jade">
                      Green points are recommended by AI
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Points list */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Points on this figure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {figurePoints.map((point) => {
                const details = getPointDetails(point.point_code);
                const isSelected = selectedPoint?.code === point.point_code;
                const isHighlighted = highlightedPoints.includes(point.point_code);
                const isMultiSelected = selectedPoints.includes(point.point_code);
                return (
                  <Button
                    key={point.point_code}
                    variant={isMultiSelected || isSelected ? "default" : isHighlighted ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePointClick(point)}
                    className={`gap-1 ${
                      isMultiSelected 
                        ? 'bg-primary' 
                        : isHighlighted && !isSelected 
                        ? 'bg-jade hover:bg-jade/90' 
                        : ''
                    }`}
                  >
                    {isMultiSelected && <CheckSquare className="h-3 w-3" />}
                    {!isMultiSelected && <MapPin className="h-3 w-3" />}
                    {point.point_code}
                    {details && (
                      <span className="text-xs opacity-70">
                        ({details.name_pinyin})
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Figure selection grid
  return (
    <div className="space-y-6">
      {/* Disclaimer Alert for AI suggestions */}
      {showDisclaimer && highlightedPoints.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">AI Suggestion - Not Medical Advice</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
            These acupuncture points are <strong>optional suggestions</strong> based on AI analysis. 
            The final treatment decision must be made by a licensed therapist using their professional expertise, 
            patient assessment, and clinical judgment.
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

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Interactive Body Map</h2>
        <p className="text-muted-foreground">
          {highlightedPoints.length > 0 
            ? 'Showing body parts with recommended points'
            : 'Select a body part to explore acupuncture points'}
        </p>
        {highlightedPoints.length > 0 && (
          <p className="text-sm text-jade mt-2">
            {highlightedPoints.length} points recommended across {relevantFigures.length} body part{relevantFigures.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Multi-select summary bar */}
      {selectedPoints.length > 0 && (
        <Card className="bg-jade-light/20 border-jade/30">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="bg-jade">
                  {selectedPoints.length} points selected
                </Badge>
                {selectedPoints.slice(0, 5).map(code => (
                  <Badge key={code} variant="outline" className="gap-1">
                    {code}
                  </Badge>
                ))}
                {selectedPoints.length > 5 && (
                  <Badge variant="outline">+{selectedPoints.length - 5} more</Badge>
                )}
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

      {/* Show only relevant figures when highlighted points exist, otherwise show all */}
      {highlightedPoints.length > 0 ? (
        // Filtered view - only show relevant body parts
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">
            Relevant Body Parts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relevantFigures.map((figure) => {
              const pointCount = getPointCount(figure);
              const highlightedCount = getFigureHighlightedCount(figure);
              const selectedCount = getFigureSelectedCount(figure);
              return (
                <Card
                  key={figure}
                  className={`cursor-pointer transition-all overflow-hidden group ring-2 ring-jade hover:ring-jade/80`}
                  onClick={() => setSelectedFigure(figure)}
                >
                  <div className="aspect-square relative bg-muted/30 overflow-hidden">
                    <img
                      src={imageMap[figure]}
                      alt={getFigureName(figure)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-jade">
                      {highlightedCount} recommended
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-center truncate">
                      {getFigureName(figure)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        // Full view - show all categories
        figureCategories.map((category) => {
          const availableFigures = category.figures.filter(f => imageMap[f]);
          if (availableFigures.length === 0) return null;

          return (
            <div key={category.name}>
              <h3 className="text-lg font-semibold mb-3 text-primary">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableFigures.map((figure) => {
                  const pointCount = getPointCount(figure);
                  const highlightedCount = getFigureHighlightedCount(figure);
                  const selectedCount = getFigureSelectedCount(figure);
                return (
                  <Card
                    key={figure}
                    className={`cursor-pointer transition-all overflow-hidden group ${
                      selectedCount > 0
                        ? 'ring-2 ring-primary hover:ring-primary/80'
                        : highlightedCount > 0 
                        ? 'ring-2 ring-jade hover:ring-jade/80' 
                        : 'hover:ring-2 hover:ring-primary/50'
                    }`}
                    onClick={() => setSelectedFigure(figure)}
                  >
                    <div className="aspect-square relative bg-muted/30 overflow-hidden">
                      <img
                        src={imageMap[figure]}
                        alt={getFigureName(figure)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {selectedCount > 0 && (
                        <Badge 
                          className="absolute top-2 right-2 bg-primary"
                        >
                          {selectedCount} selected
                        </Badge>
                      )}
                      {highlightedCount > 0 && selectedCount === 0 && (
                        <Badge 
                          className="absolute top-2 right-2 bg-jade"
                        >
                          {highlightedCount} recommended
                        </Badge>
                      )}
                      {pointCount > 0 && highlightedCount === 0 && selectedCount === 0 && (
                        <Badge 
                          className="absolute top-2 right-2 bg-destructive"
                        >
                          {pointCount} pts
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-center truncate">
                        {getFigureName(figure)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })
      )}
    </div>
  );
}
