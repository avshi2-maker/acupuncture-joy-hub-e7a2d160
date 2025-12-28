import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Save,
  Download,
  Upload,
  RotateCcw,
  Move,
  Target,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

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

const allFigures = Object.keys(imageMap);

interface PointCoordinate {
  point_code: string;
  image_name: string;
  x: number;
  y: number;
}

// Default coordinates - same as in BodyFigureSelector
const defaultCoordinates: PointCoordinate[] = [
  // Hand points
  { point_code: 'LI4', image_name: 'hand.png', x: 35, y: 35 },
  { point_code: 'PC8', image_name: 'hand.png', x: 50, y: 55 },
  { point_code: 'HT8', image_name: 'hand.png', x: 55, y: 60 },
  { point_code: 'LU10', image_name: 'hand.png', x: 25, y: 50 },
  { point_code: 'LU11', image_name: 'hand.png', x: 15, y: 70 },
  { point_code: 'SI3', image_name: 'hand.png', x: 75, y: 45 },
  { point_code: 'TE3', image_name: 'hand.png', x: 60, y: 30 },
  // Wrist points
  { point_code: 'PC7', image_name: 'wrist.png', x: 50, y: 45 },
  { point_code: 'HT7', image_name: 'wrist.png', x: 65, y: 45 },
  { point_code: 'LU9', image_name: 'wrist.png', x: 35, y: 45 },
  { point_code: 'SI4', image_name: 'wrist.png', x: 75, y: 50 },
  { point_code: 'SI6', image_name: 'wrist.png', x: 70, y: 35 },
  { point_code: 'TE5', image_name: 'wrist.png', x: 50, y: 25 },
  // Arm points
  { point_code: 'LI10', image_name: 'arm.png', x: 55, y: 65 },
  { point_code: 'LI11', image_name: 'arm.png', x: 50, y: 50 },
  { point_code: 'LI15', image_name: 'arm.png', x: 45, y: 15 },
  { point_code: 'TE6', image_name: 'arm.png', x: 50, y: 60 },
  { point_code: 'TE14', image_name: 'arm.png', x: 55, y: 20 },
  // Arm inner points
  { point_code: 'PC3', image_name: 'arm_inner.png', x: 50, y: 50 },
  { point_code: 'PC6', image_name: 'arm_inner.png', x: 50, y: 70 },
  { point_code: 'HT3', image_name: 'arm_inner.png', x: 60, y: 48 },
  { point_code: 'LU5', image_name: 'arm_inner.png', x: 40, y: 48 },
  { point_code: 'LU7', image_name: 'arm_inner.png', x: 35, y: 75 },
  // Head front points
  { point_code: 'ST2', image_name: 'head_front.png', x: 38, y: 42 },
  { point_code: 'ST3', image_name: 'head_front.png', x: 35, y: 52 },
  { point_code: 'ST4', image_name: 'head_front.png', x: 38, y: 62 },
  { point_code: 'ST6', image_name: 'head_front.png', x: 30, y: 65 },
  { point_code: 'ST8', image_name: 'head_front.png', x: 32, y: 22 },
  { point_code: 'GB14', image_name: 'head_front.png', x: 35, y: 28 },
  { point_code: 'GV20', image_name: 'head_front.png', x: 50, y: 8 },
  { point_code: 'GV24', image_name: 'head_front.png', x: 50, y: 18 },
  { point_code: 'GV26', image_name: 'head_front.png', x: 50, y: 58 },
  { point_code: 'BL1', image_name: 'head_front.png', x: 42, y: 38 },
  { point_code: 'BL2', image_name: 'head_front.png', x: 40, y: 32 },
  { point_code: 'CV23', image_name: 'head_front.png', x: 50, y: 75 },
  { point_code: 'EX-HN1', image_name: 'head_front.png', x: 50, y: 5 },
  { point_code: 'EX-HN3', image_name: 'head_front.png', x: 50, y: 32 },
  { point_code: 'EX-HN5', image_name: 'head_front.png', x: 50, y: 40 },
  { point_code: 'Yintang', image_name: 'head_front.png', x: 50, y: 32 },
  // Head side points
  { point_code: 'ST7', image_name: 'head_side.png', x: 55, y: 55 },
  { point_code: 'GB1', image_name: 'head_side.png', x: 70, y: 40 },
  { point_code: 'GB2', image_name: 'head_side.png', x: 48, y: 48 },
  { point_code: 'GB8', image_name: 'head_side.png', x: 40, y: 25 },
  { point_code: 'GB20', image_name: 'head_side.png', x: 25, y: 55 },
  { point_code: 'Taiyang', image_name: 'head_side.png', x: 65, y: 38 },
  // Body front points
  { point_code: 'ST25', image_name: 'body_front.png', x: 35, y: 55 },
  { point_code: 'SP15', image_name: 'body_front.png', x: 32, y: 50 },
  { point_code: 'LV13', image_name: 'body_front.png', x: 28, y: 42 },
  { point_code: 'CV3', image_name: 'body_front.png', x: 50, y: 78 },
  { point_code: 'CV4', image_name: 'body_front.png', x: 50, y: 72 },
  { point_code: 'CV6', image_name: 'body_front.png', x: 50, y: 62 },
  { point_code: 'CV8', image_name: 'body_front.png', x: 50, y: 55 },
  { point_code: 'CV12', image_name: 'body_front.png', x: 50, y: 38 },
  // Chest points
  { point_code: 'LV14', image_name: 'chest.png', x: 30, y: 70 },
  { point_code: 'KI27', image_name: 'chest.png', x: 38, y: 18 },
  { point_code: 'CV17', image_name: 'chest.png', x: 50, y: 50 },
  { point_code: 'CV22', image_name: 'chest.png', x: 50, y: 12 },
  // Body back points
  { point_code: 'BL10', image_name: 'bodyback.png', x: 40, y: 12 },
  { point_code: 'BL11', image_name: 'bodyback.png', x: 38, y: 18 },
  { point_code: 'BL13', image_name: 'bodyback.png', x: 38, y: 24 },
  { point_code: 'BL15', image_name: 'bodyback.png', x: 38, y: 30 },
  { point_code: 'BL17', image_name: 'bodyback.png', x: 38, y: 36 },
  { point_code: 'BL18', image_name: 'bodyback.png', x: 38, y: 40 },
  { point_code: 'BL20', image_name: 'bodyback.png', x: 38, y: 46 },
  { point_code: 'BL21', image_name: 'bodyback.png', x: 38, y: 50 },
  { point_code: 'BL23', image_name: 'bodyback.png', x: 38, y: 56 },
  { point_code: 'BL25', image_name: 'bodyback.png', x: 38, y: 62 },
  { point_code: 'GB21', image_name: 'bodyback.png', x: 32, y: 10 },
  { point_code: 'GB30', image_name: 'bodyback.png', x: 30, y: 72 },
  { point_code: 'GV14', image_name: 'bodyback.png', x: 50, y: 14 },
  { point_code: 'GV16', image_name: 'bodyback.png', x: 50, y: 8 },
  // Spine points
  { point_code: 'GV4', image_name: 'spine.png', x: 50, y: 60 },
  // Leg front points
  { point_code: 'ST34', image_name: 'leg_front.png', x: 55, y: 25 },
  { point_code: 'ST35', image_name: 'leg_front.png', x: 55, y: 32 },
  { point_code: 'ST36', image_name: 'leg_front.png', x: 55, y: 42 },
  { point_code: 'ST37', image_name: 'leg_front.png', x: 55, y: 52 },
  { point_code: 'ST40', image_name: 'leg_front.png', x: 55, y: 62 },
  { point_code: 'EX-LE10', image_name: 'leg_front.png', x: 45, y: 35 },
  // Leg inner points
  { point_code: 'SP6', image_name: 'leg_inner.png', x: 45, y: 75 },
  { point_code: 'SP9', image_name: 'leg_inner.png', x: 45, y: 45 },
  { point_code: 'SP10', image_name: 'leg_inner.png', x: 50, y: 30 },
  { point_code: 'LV8', image_name: 'leg_inner.png', x: 40, y: 40 },
  { point_code: 'KI7', image_name: 'leg_inner.png', x: 40, y: 80 },
  { point_code: 'KI10', image_name: 'leg_inner.png', x: 35, y: 42 },
  // Leg outer points
  { point_code: 'BL40', image_name: 'leg_outer.png', x: 50, y: 35 },
  { point_code: 'BL57', image_name: 'leg_outer.png', x: 50, y: 55 },
  { point_code: 'GB31', image_name: 'leg_outer.png', x: 50, y: 20 },
  { point_code: 'GB34', image_name: 'leg_outer.png', x: 55, y: 40 },
  { point_code: 'GB39', image_name: 'leg_outer.png', x: 50, y: 72 },
  // Foot points
  { point_code: 'ST41', image_name: 'foot.png', x: 50, y: 20 },
  { point_code: 'ST44', image_name: 'foot.png', x: 45, y: 75 },
  { point_code: 'SP3', image_name: 'foot.png', x: 25, y: 45 },
  { point_code: 'SP4', image_name: 'foot.png', x: 20, y: 35 },
  { point_code: 'LV2', image_name: 'foot.png', x: 40, y: 70 },
  { point_code: 'LV3', image_name: 'foot.png', x: 35, y: 50 },
  { point_code: 'KI3', image_name: 'foot.png', x: 15, y: 25 },
  { point_code: 'KI6', image_name: 'foot.png', x: 12, y: 30 },
  { point_code: 'BL60', image_name: 'foot.png', x: 85, y: 25 },
  { point_code: 'BL62', image_name: 'foot.png', x: 82, y: 32 },
  { point_code: 'GB40', image_name: 'foot.png', x: 75, y: 22 },
  { point_code: 'GB41', image_name: 'foot.png', x: 60, y: 55 },
  // Foot sole points
  { point_code: 'KI1', image_name: 'foot_sole.png', x: 50, y: 35 },
  // Ear points
  { point_code: 'Ear-Shenmen', image_name: 'ear.png', x: 35, y: 35 },
  { point_code: 'Ear-Heart', image_name: 'ear.png', x: 50, y: 55 },
  { point_code: 'Ear-Kidney', image_name: 'ear.png', x: 45, y: 70 },
  { point_code: 'Ear-Liver', image_name: 'ear.png', x: 55, y: 45 },
  { point_code: 'Ear-Lung', image_name: 'ear.png', x: 50, y: 65 },
  { point_code: 'Ear-Stomach', image_name: 'ear.png', x: 60, y: 50 },
  { point_code: 'Ear-Spleen', image_name: 'ear.png', x: 55, y: 60 },
  // Tongue points
  { point_code: 'Tongue-Heart', image_name: 'tongue.png', x: 50, y: 25 },
  { point_code: 'Tongue-Lung', image_name: 'tongue.png', x: 50, y: 35 },
  { point_code: 'Tongue-Spleen', image_name: 'tongue.png', x: 50, y: 50 },
  { point_code: 'Tongue-Kidney', image_name: 'tongue.png', x: 50, y: 75 },
  { point_code: 'Tongue-Liver', image_name: 'tongue.png', x: 30, y: 50 },
  // Pediatric points
  { point_code: 'Kid-Tui', image_name: 'child_front.png', x: 50, y: 55 },
  { point_code: 'Kid-Feishu', image_name: 'child_back.png', x: 38, y: 25 },
  { point_code: 'Kid-Pishu', image_name: 'child_back.png', x: 38, y: 45 },
  { point_code: 'Kid-Shenshu', image_name: 'child_back.png', x: 38, y: 55 },
];

const STORAGE_KEY = 'acupoint-coordinates-editor';

export default function PointCoordinateEditor() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [selectedFigure, setSelectedFigure] = useState<string>('hand.png');
  const [coordinates, setCoordinates] = useState<PointCoordinate[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSpacing, setGridSpacing] = useState(10); // Grid lines every 10%
  const [showPoints, setShowPoints] = useState(true);
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Load saved coordinates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCoordinates(JSON.parse(saved));
      } catch {
        setCoordinates([...defaultCoordinates]);
      }
    } else {
      setCoordinates([...defaultCoordinates]);
    }
  }, []);

  // Get points for current figure
  const figurePoints = coordinates.filter(p => p.image_name === selectedFigure);

  // Handle image load
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  // Update point coordinates
  const updatePointCoordinates = useCallback((pointCode: string, x: number, y: number) => {
    setCoordinates(prev => prev.map(p => 
      p.point_code === pointCode && p.image_name === selectedFigure
        ? { ...p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
        : p
    ));
    setHasChanges(true);
  }, [selectedFigure]);

  // Handle mouse down on point
  const handlePointMouseDown = (e: React.MouseEvent, pointCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingPoint(pointCode);
    setSelectedPoint(pointCode);
  };

  // Throttle ref for mouse move
  const lastMoveTime = useRef(0);

  // Handle mouse move for dragging - throttled
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingPoint || !imageRef.current) return;
    
    // Throttle to ~60fps
    const now = Date.now();
    if (now - lastMoveTime.current < 16) return;
    lastMoveTime.current = now;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp to 0-100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    updatePointCoordinates(draggingPoint, clampedX, clampedY);
  }, [draggingPoint, updatePointCoordinates]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDraggingPoint(null);
  }, []);

  // Save coordinates to localStorage
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coordinates));
    setHasChanges(false);
    toast.success('Coordinates saved to local storage');
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Reset all coordinates to defaults? This cannot be undone.')) {
      setCoordinates([...defaultCoordinates]);
      localStorage.removeItem(STORAGE_KEY);
      setHasChanges(false);
      toast.info('Coordinates reset to defaults');
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const data = JSON.stringify(coordinates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acupoint-coordinates.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON');
  };

  // Export as TypeScript array
  const handleExportTS = () => {
    const lines = coordinates.map(p => 
      `  { point_code: '${p.point_code}', image_name: '${p.image_name}', x: ${p.x}, y: ${p.y} },`
    );
    const data = `const pointCoordinates = [\n${lines.join('\n')}\n];`;
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('TypeScript array copied to clipboard');
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setCoordinates(data);
          setHasChanges(true);
          toast.success('Coordinates imported');
        }
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Get current point data
  const currentPoint = figurePoints.find(p => p.point_code === selectedPoint);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Point Coordinate Editor | TCM Brain</title>
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Point Coordinate Editor
              </h1>
              <p className="text-xs text-muted-foreground">
                Dr. Roni Sapir - Acupuncture Point Positioning Tool
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-500 border-amber-500">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Panel - Figure Selection & Controls */}
          <Card className="lg:col-span-1">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Body Figures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-48">
                <div className="grid grid-cols-2 gap-2">
                  {allFigures.map(fig => (
                    <button
                      key={fig}
                      onClick={() => {
                        setSelectedFigure(fig);
                        setSelectedPoint(null);
                      }}
                      className={`p-2 rounded-lg border text-xs text-center transition-all ${
                        selectedFigure === fig
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {fig.replace('.png', '').replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Grid</Label>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>

                {showGrid && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Grid Spacing: {gridSpacing}%
                    </Label>
                    <Slider
                      value={[gridSpacing]}
                      onValueChange={([v]) => setGridSpacing(v)}
                      min={5}
                      max={25}
                      step={5}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Points</Label>
                  <Switch checked={showPoints} onCheckedChange={setShowPoints} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Zoom: {Math.round(zoom * 100)}%
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[zoom * 100]}
                      onValueChange={([v]) => setZoom(v / 100)}
                      min={25}
                      max={400}
                      step={25}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Export/Import */}
              <div className="space-y-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" onClick={handleExportJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={handleExportTS}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy as TypeScript
                </Button>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Import JSON
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Center - Image with Grid and Points */}
          <Card className="lg:col-span-2">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                {selectedFigure.replace('.png', '').replace(/_/g, ' ')} 
                <Badge variant="secondary" className="ml-auto">
                  {figurePoints.length} points
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[600px]">
                <div
                  ref={containerRef}
                  className="relative inline-block cursor-crosshair select-none"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Body figure image */}
                  <img
                    ref={imageRef}
                    src={imageMap[selectedFigure]}
                    alt={selectedFigure}
                    className="max-w-none"
                    onLoad={handleImageLoad}
                    draggable={false}
                  />

                  {/* Grid overlay - 50% transparent */}
                  {showGrid && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ opacity: 0.5 }}
                    >
                      {/* Vertical lines */}
                      {Array.from({ length: Math.floor(100 / gridSpacing) + 1 }, (_, i) => {
                        const x = i * gridSpacing;
                        return (
                          <g key={`v-${i}`}>
                            <line
                              x1={`${x}%`}
                              y1="0"
                              x2={`${x}%`}
                              y2="100%"
                              stroke={x === 50 ? '#ef4444' : '#3b82f6'}
                              strokeWidth={x === 50 ? 2 : 1}
                              strokeDasharray={x === 50 ? 'none' : '4,4'}
                            />
                            <text
                              x={`${x}%`}
                              y="12"
                              fill="#3b82f6"
                              fontSize="10"
                              textAnchor="middle"
                              className="font-mono"
                            >
                              {x}
                            </text>
                          </g>
                        );
                      })}
                      {/* Horizontal lines */}
                      {Array.from({ length: Math.floor(100 / gridSpacing) + 1 }, (_, i) => {
                        const y = i * gridSpacing;
                        return (
                          <g key={`h-${i}`}>
                            <line
                              x1="0"
                              y1={`${y}%`}
                              x2="100%"
                              y2={`${y}%`}
                              stroke={y === 50 ? '#ef4444' : '#3b82f6'}
                              strokeWidth={y === 50 ? 2 : 1}
                              strokeDasharray={y === 50 ? 'none' : '4,4'}
                            />
                            <text
                              x="4"
                              y={`${y}%`}
                              dy="3"
                              fill="#3b82f6"
                              fontSize="10"
                              className="font-mono"
                            >
                              {y}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* Acupuncture point markers */}
                  {showPoints && figurePoints.map((point) => {
                    const isSelected = selectedPoint === point.point_code;
                    const isDragging = draggingPoint === point.point_code;

                    return (
                      <button
                        key={point.point_code}
                        onMouseDown={(e) => handlePointMouseDown(e, point.point_code)}
                        className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 transition-all duration-100 flex items-center justify-center text-[8px] font-bold cursor-move ${
                          isDragging
                            ? 'bg-amber-500 border-amber-600 text-white scale-125 z-50 shadow-lg'
                            : isSelected 
                            ? 'bg-primary border-primary text-primary-foreground scale-110 ring-2 ring-primary/30 z-40' 
                            : 'bg-red-500 border-red-600 text-white hover:scale-110 hover:z-30'
                        }`}
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                        }}
                        title={`${point.point_code} (${point.x}, ${point.y})`}
                      >
                        <Move className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Panel - Point Details */}
          <Card className="lg:col-span-1">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Point Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPoint && currentPoint ? (
                <>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h3 className="text-xl font-bold text-primary">{currentPoint.point_code}</h3>
                    <p className="text-sm text-muted-foreground">{currentPoint.image_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">X Position</Label>
                      <Input
                        type="number"
                        value={currentPoint.x}
                        onChange={(e) => updatePointCoordinates(
                          currentPoint.point_code,
                          parseFloat(e.target.value) || 0,
                          currentPoint.y
                        )}
                        min={0}
                        max={100}
                        step={0.1}
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y Position</Label>
                      <Input
                        type="number"
                        value={currentPoint.y}
                        onChange={(e) => updatePointCoordinates(
                          currentPoint.point_code,
                          currentPoint.x,
                          parseFloat(e.target.value) || 0
                        )}
                        min={0}
                        max={100}
                        step={0.1}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted text-xs font-mono break-all">
                    {`{ point_code: '${currentPoint.point_code}', image_name: '${currentPoint.image_name}', x: ${currentPoint.x}, y: ${currentPoint.y} }`}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Click on a point to select it</p>
                  <p className="text-xs mt-2">Then drag to reposition</p>
                </div>
              )}

              {/* Points list for current figure */}
              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  All points on this figure:
                </Label>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {figurePoints.map(point => (
                      <button
                        key={point.point_code}
                        onClick={() => setSelectedPoint(point.point_code)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                          selectedPoint === point.point_code
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="font-medium">{point.point_code}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ({point.x}, {point.y})
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
