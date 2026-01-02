import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, MapPin, ZoomIn, ZoomOut, CheckSquare, Square, Sparkles, X, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
 * Map common point names / pinyin to standard codes.
 */
const POINT_NAME_MAP: Record<string, string> = {
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
  
  // Multi-select mode
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

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
