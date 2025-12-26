import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MapPin, Info, ZoomIn, ZoomOut, CheckSquare, Square, Sparkles, X, Trash2 } from 'lucide-react';
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
const pointCoordinates = [
  // Hand points
  { point_code: 'LI4', image_name: 'hand.png', x: 1400, y: 800 },
  { point_code: 'PC8', image_name: 'hand.png', x: 1350, y: 850 },
  { point_code: 'HT8', image_name: 'hand.png', x: 1300, y: 900 },
  { point_code: 'LU10', image_name: 'hand.png', x: 1250, y: 750 },
  { point_code: 'LU11', image_name: 'hand.png', x: 1200, y: 650 },
  { point_code: 'SI3', image_name: 'hand.png', x: 1500, y: 850 },
  { point_code: 'TE3', image_name: 'hand.png', x: 1450, y: 780 },
  // Wrist points
  { point_code: 'PC7', image_name: 'wrist.png', x: 1400, y: 650 },
  { point_code: 'HT7', image_name: 'wrist.png', x: 1400, y: 700 },
  { point_code: 'LU9', image_name: 'wrist.png', x: 1350, y: 720 },
  { point_code: 'SI4', image_name: 'wrist.png', x: 1500, y: 680 },
  { point_code: 'SI6', image_name: 'wrist.png', x: 1480, y: 750 },
  { point_code: 'TE5', image_name: 'wrist.png', x: 1450, y: 800 },
  // Arm outer points
  { point_code: 'LI10', image_name: 'arm.png', x: 1450, y: 1100 },
  { point_code: 'LI11', image_name: 'arm.png', x: 1500, y: 900 },
  { point_code: 'LI15', image_name: 'arm.png', x: 1200, y: 400 },
  { point_code: 'TE6', image_name: 'arm.png', x: 1480, y: 1050 },
  { point_code: 'TE14', image_name: 'arm.png', x: 1250, y: 350 },
  // Arm inner points
  { point_code: 'PC3', image_name: 'arm_inner.png', x: 1450, y: 850 },
  { point_code: 'PC6', image_name: 'arm_inner.png', x: 1400, y: 1000 },
  { point_code: 'HT3', image_name: 'arm_inner.png', x: 1500, y: 800 },
  { point_code: 'LU5', image_name: 'arm_inner.png', x: 1400, y: 750 },
  { point_code: 'LU7', image_name: 'arm_inner.png', x: 1300, y: 800 },
  // Head front points
  { point_code: 'ST2', image_name: 'head_front.png', x: 1300, y: 650 },
  { point_code: 'ST3', image_name: 'head_front.png', x: 1280, y: 700 },
  { point_code: 'ST4', image_name: 'head_front.png', x: 1250, y: 750 },
  { point_code: 'ST6', image_name: 'head_front.png', x: 1200, y: 800 },
  { point_code: 'ST8', image_name: 'head_front.png', x: 1200, y: 500 },
  { point_code: 'GB14', image_name: 'head_front.png', x: 1250, y: 480 },
  { point_code: 'GV20', image_name: 'head_front.png', x: 1400, y: 400 },
  { point_code: 'GV24', image_name: 'head_front.png', x: 1400, y: 450 },
  { point_code: 'GV26', image_name: 'head_front.png', x: 1400, y: 800 },
  { point_code: 'BL1', image_name: 'head_front.png', x: 1350, y: 580 },
  { point_code: 'BL2', image_name: 'head_front.png', x: 1300, y: 550 },
  { point_code: 'CV23', image_name: 'head_front.png', x: 1400, y: 850 },
  { point_code: 'EX-HN1', image_name: 'head_front.png', x: 1400, y: 350 },
  { point_code: 'EX-HN3', image_name: 'head_front.png', x: 1400, y: 480 },
  { point_code: 'EX-HN5', image_name: 'head_front.png', x: 1400, y: 600 },
  { point_code: 'Yintang', image_name: 'head_front.png', x: 1400, y: 530 },
  // Head side points
  { point_code: 'ST7', image_name: 'head_side.png', x: 1300, y: 700 },
  { point_code: 'GB1', image_name: 'head_side.png', x: 1450, y: 550 },
  { point_code: 'GB2', image_name: 'head_side.png', x: 1400, y: 650 },
  { point_code: 'GB8', image_name: 'head_side.png', x: 1350, y: 450 },
  { point_code: 'GB20', image_name: 'head_side.png', x: 1400, y: 600 },
  { point_code: 'Taiyang', image_name: 'head_side.png', x: 1500, y: 580 },
  // Body front points
  { point_code: 'ST25', image_name: 'body_front.png', x: 1200, y: 750 },
  { point_code: 'SP15', image_name: 'body_front.png', x: 1200, y: 700 },
  { point_code: 'LV13', image_name: 'body_front.png', x: 1150, y: 650 },
  { point_code: 'CV3', image_name: 'body_front.png', x: 1400, y: 900 },
  { point_code: 'CV4', image_name: 'body_front.png', x: 1400, y: 870 },
  { point_code: 'CV6', image_name: 'body_front.png', x: 1400, y: 800 },
  { point_code: 'CV8', image_name: 'body_front.png', x: 1400, y: 750 },
  { point_code: 'CV12', image_name: 'body_front.png', x: 1400, y: 650 },
  // Chest points
  { point_code: 'LV14', image_name: 'chest.png', x: 1200, y: 800 },
  { point_code: 'KI27', image_name: 'chest.png', x: 1300, y: 400 },
  { point_code: 'CV17', image_name: 'chest.png', x: 1400, y: 600 },
  { point_code: 'CV22', image_name: 'chest.png', x: 1400, y: 350 },
  // Body back points
  { point_code: 'BL10', image_name: 'bodyback.png', x: 1300, y: 450 },
  { point_code: 'BL11', image_name: 'bodyback.png', x: 1250, y: 500 },
  { point_code: 'BL13', image_name: 'bodyback.png', x: 1250, y: 550 },
  { point_code: 'BL15', image_name: 'bodyback.png', x: 1250, y: 600 },
  { point_code: 'BL17', image_name: 'bodyback.png', x: 1250, y: 650 },
  { point_code: 'BL18', image_name: 'bodyback.png', x: 1250, y: 700 },
  { point_code: 'BL20', image_name: 'bodyback.png', x: 1250, y: 750 },
  { point_code: 'BL21', image_name: 'bodyback.png', x: 1250, y: 800 },
  { point_code: 'BL23', image_name: 'bodyback.png', x: 1250, y: 850 },
  { point_code: 'BL25', image_name: 'bodyback.png', x: 1250, y: 900 },
  { point_code: 'GB21', image_name: 'bodyback.png', x: 1200, y: 400 },
  { point_code: 'GB30', image_name: 'bodyback.png', x: 1150, y: 950 },
  { point_code: 'GV14', image_name: 'bodyback.png', x: 1400, y: 500 },
  { point_code: 'GV16', image_name: 'bodyback.png', x: 1400, y: 400 },
  // Spine points
  { point_code: 'GV4', image_name: 'spine.png', x: 1400, y: 850 },
  // Leg front points
  { point_code: 'ST34', image_name: 'leg_front.png', x: 1300, y: 600 },
  { point_code: 'ST35', image_name: 'leg_front.png', x: 1250, y: 700 },
  { point_code: 'ST36', image_name: 'leg_front.png', x: 1200, y: 1000 },
  { point_code: 'ST37', image_name: 'leg_front.png', x: 1250, y: 1100 },
  { point_code: 'ST40', image_name: 'leg_front.png', x: 1300, y: 1200 },
  { point_code: 'EX-LE10', image_name: 'leg_front.png', x: 1200, y: 850 },
  // Leg inner points
  { point_code: 'SP6', image_name: 'leg_inner.png', x: 1500, y: 1100 },
  { point_code: 'SP9', image_name: 'leg_inner.png', x: 1450, y: 950 },
  { point_code: 'SP10', image_name: 'leg_inner.png', x: 1400, y: 800 },
  { point_code: 'LV8', image_name: 'leg_inner.png', x: 1350, y: 850 },
  { point_code: 'KI7', image_name: 'leg_inner.png', x: 1480, y: 1150 },
  { point_code: 'KI10', image_name: 'leg_inner.png', x: 1400, y: 900 },
  // Leg outer points
  { point_code: 'BL40', image_name: 'leg_outer.png', x: 1400, y: 950 },
  { point_code: 'BL57', image_name: 'leg_outer.png', x: 1350, y: 1100 },
  { point_code: 'GB31', image_name: 'leg_outer.png', x: 1450, y: 850 },
  { point_code: 'GB34', image_name: 'leg_outer.png', x: 1350, y: 1000 },
  { point_code: 'GB39', image_name: 'leg_outer.png', x: 1300, y: 1150 },
  // Foot points
  { point_code: 'ST41', image_name: 'foot.png', x: 1400, y: 900 },
  { point_code: 'ST44', image_name: 'foot.png', x: 1350, y: 1100 },
  { point_code: 'SP3', image_name: 'foot.png', x: 1300, y: 950 },
  { point_code: 'SP4', image_name: 'foot.png', x: 1250, y: 900 },
  { point_code: 'LV2', image_name: 'foot.png', x: 1400, y: 1050 },
  { point_code: 'LV3', image_name: 'foot.png', x: 1350, y: 1000 },
  { point_code: 'KI3', image_name: 'foot.png', x: 1300, y: 1050 },
  { point_code: 'KI6', image_name: 'foot.png', x: 1350, y: 1100 },
  { point_code: 'BL60', image_name: 'foot.png', x: 1250, y: 1100 },
  { point_code: 'BL62', image_name: 'foot.png', x: 1200, y: 1050 },
  { point_code: 'GB40', image_name: 'foot.png', x: 1400, y: 1000 },
  { point_code: 'GB41', image_name: 'foot.png', x: 1450, y: 1050 },
  // Foot sole points
  { point_code: 'KI1', image_name: 'foot_sole.png', x: 1400, y: 900 },
  // Ear points
  { point_code: 'Ear-Shenmen', image_name: 'ear.png', x: 1400, y: 600 },
  { point_code: 'Ear-Heart', image_name: 'ear.png', x: 1350, y: 700 },
  { point_code: 'Ear-Kidney', image_name: 'ear.png', x: 1300, y: 800 },
  { point_code: 'Ear-Liver', image_name: 'ear.png', x: 1450, y: 750 },
  { point_code: 'Ear-Lung', image_name: 'ear.png', x: 1400, y: 850 },
  { point_code: 'Ear-Stomach', image_name: 'ear.png', x: 1350, y: 900 },
  { point_code: 'Ear-Spleen', image_name: 'ear.png', x: 1300, y: 950 },
  // Tongue points
  { point_code: 'Tongue-Heart', image_name: 'tongue.png', x: 1400, y: 500 },
  { point_code: 'Tongue-Lung', image_name: 'tongue.png', x: 1400, y: 600 },
  { point_code: 'Tongue-Spleen', image_name: 'tongue.png', x: 1400, y: 700 },
  { point_code: 'Tongue-Kidney', image_name: 'tongue.png', x: 1400, y: 800 },
  { point_code: 'Tongue-Liver', image_name: 'tongue.png', x: 1300, y: 650 },
  // Child points
  { point_code: 'Kid-Tui', image_name: 'child_front.png', x: 1400, y: 800 },
  { point_code: 'Kid-Feishu', image_name: 'child_back.png', x: 1300, y: 500 },
  { point_code: 'Kid-Pishu', image_name: 'child_back.png', x: 1300, y: 600 },
  { point_code: 'Kid-Shenshu', image_name: 'child_back.png', x: 1300, y: 700 },
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
  
  // Multi-select mode
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

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
          {/* Image with points */}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="py-3">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <MapPin className="h-5 w-5 text-primary" />
                {getFigureName(selectedFigure)}
                <Badge variant="secondary" className="ml-2">
                  {figurePoints.length} points
                </Badge>
                {highlightedPoints.length > 0 && (
                  <Badge variant="default" className="ml-1 bg-jade">
                    {figurePoints.filter(p => highlightedPoints.includes(p.point_code)).length} recommended
                  </Badge>
                )}
                {multiSelectMode && (
                  <Badge variant="outline" className="ml-1 border-jade text-jade">
                    Click points to select
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div 
                  className="relative inline-block"
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <img
                    src={imageMap[selectedFigure]}
                    alt={getFigureName(selectedFigure)}
                    className="max-w-none"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  
                  {/* Acupuncture point markers */}
                  {figurePoints.map((point) => {
                    const isSelected = selectedPoint?.code === point.point_code;
                    const isHighlighted = highlightedPoints.includes(point.point_code);
                    const isMultiSelected = selectedPoints.includes(point.point_code);
                    // Convert coordinates to percentages (assuming image is ~2800x1400)
                    const xPercent = (point.x / 2800) * 100;
                    const yPercent = (point.y / 1400) * 100;
                    
                    return (
                      <button
                        key={point.point_code}
                        onClick={() => handlePointClick(point)}
                        className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold ${
                          isMultiSelected
                            ? 'bg-primary border-primary text-primary-foreground scale-125 ring-4 ring-primary/30'
                            : isSelected 
                            ? 'bg-primary border-primary text-primary-foreground scale-125 ring-4 ring-primary/30' 
                            : isHighlighted
                            ? 'bg-red-500 border-red-600 text-white scale-125 ring-4 ring-red-500/50 animate-pulse shadow-lg'
                            : 'bg-destructive/80 border-destructive text-destructive-foreground hover:scale-110 hover:bg-destructive'
                        }`}
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                        }}
                        title={point.point_code}
                      >
                        {isMultiSelected && <span className="text-[8px]">✓</span>}
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Interactive Body Map</h2>
        <p className="text-muted-foreground">
          Select a body part to explore acupuncture points
        </p>
        {highlightedPoints.length > 0 && (
          <p className="text-sm text-jade mt-2">
            {highlightedPoints.length} points recommended • Select a body part to view
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

      {figureCategories.map((category) => {
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
      })}
    </div>
  );
}
