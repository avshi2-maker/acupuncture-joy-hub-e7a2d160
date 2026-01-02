import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { User, Hand, Footprints, Brain, Baby, Sparkles, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import all body figure images (updated collection)
import armFullImg from '@/assets/body-figures/arm_full.png';
import chestImg from '@/assets/body-figures/chest.png';
import childFrontImg from '@/assets/body-figures/child_front.png';
import earImg from '@/assets/body-figures/ear.png';
import elbowInnerImg from '@/assets/body-figures/elbow_inner.png';
import faceFrontImg from '@/assets/body-figures/face_front.png';
import footImg from '@/assets/body-figures/foot.png';
import footSoleImg from '@/assets/body-figures/foot_sole.png';
import handImg from '@/assets/body-figures/hand.png';
import headLateralImg from '@/assets/body-figures/head_lateral.png';
import kneeFrontImg from '@/assets/body-figures/knee_front.png';
import kneeLateralImg from '@/assets/body-figures/knee_lateral.png';
import kneeMedialImg from '@/assets/body-figures/knee_medial.png';
import legsPosteriorImg from '@/assets/body-figures/legs_posterior.png';
import neckFrontImg from '@/assets/body-figures/neck_front.png';
import neckPosteriorImg from '@/assets/body-figures/neck_posterior.png';
import sacrumImg from '@/assets/body-figures/sacrum.png';
import scalpTopImg from '@/assets/body-figures/scalp_top.png';
import shoulderAnteriorImg from '@/assets/body-figures/shoulder_anterior.png';
import shoulderSideImg from '@/assets/body-figures/shoulder_side.png';
import thighHipImg from '@/assets/body-figures/thigh_hip.png';
import tongueImg from '@/assets/body-figures/tongue.png';
import upperBackImg from '@/assets/body-figures/upper_back.png';
import wristImg from '@/assets/body-figures/wrist.png';

// Point coordinates for new body figures
const pointCoordinates: { point_code: string; image_name: string; x: number; y: number }[] = [
  // Hand points
  { point_code: 'LI4', image_name: 'hand.png', x: 35, y: 35 },
  { point_code: 'PC8', image_name: 'hand.png', x: 50, y: 55 },
  { point_code: 'SI3', image_name: 'hand.png', x: 75, y: 45 },
  // Wrist points
  { point_code: 'PC7', image_name: 'wrist.png', x: 50, y: 45 },
  { point_code: 'HT7', image_name: 'wrist.png', x: 65, y: 45 },
  { point_code: 'TE5', image_name: 'wrist.png', x: 50, y: 25 },
  // Arm full
  { point_code: 'LI10', image_name: 'arm_full.png', x: 55, y: 65 },
  { point_code: 'LI11', image_name: 'arm_full.png', x: 50, y: 50 },
  // Elbow
  { point_code: 'PC3', image_name: 'elbow_inner.png', x: 50, y: 55 },
  { point_code: 'LU5', image_name: 'elbow_inner.png', x: 40, y: 48 },
  // Shoulder
  { point_code: 'LU1', image_name: 'shoulder_anterior.png', x: 35, y: 40 },
  { point_code: 'GB21', image_name: 'shoulder_side.png', x: 40, y: 25 },
  // Face
  { point_code: 'ST2', image_name: 'face_front.png', x: 38, y: 42 },
  { point_code: 'LI20', image_name: 'face_front.png', x: 42, y: 55 },
  { point_code: 'Yintang', image_name: 'face_front.png', x: 50, y: 32 },
  // Head lateral / scalp
  { point_code: 'GB20', image_name: 'head_lateral.png', x: 25, y: 55 },
  { point_code: 'GV20', image_name: 'scalp_top.png', x: 50, y: 50 },
  // Neck
  { point_code: 'CV22', image_name: 'neck_front.png', x: 50, y: 70 },
  { point_code: 'GV16', image_name: 'neck_posterior.png', x: 50, y: 35 },
  // Chest
  { point_code: 'CV17', image_name: 'chest.png', x: 50, y: 50 },
  // Upper back
  { point_code: 'BL13', image_name: 'upper_back.png', x: 38, y: 35 },
  { point_code: 'GV14', image_name: 'upper_back.png', x: 50, y: 15 },
  // Sacrum
  { point_code: 'BL32', image_name: 'sacrum.png', x: 40, y: 40 },
  { point_code: 'GB30', image_name: 'sacrum.png', x: 30, y: 45 },
  // Thigh/Hip
  { point_code: 'GB31', image_name: 'thigh_hip.png', x: 50, y: 55 },
  // Knee
  { point_code: 'ST36', image_name: 'knee_front.png', x: 55, y: 65 },
  { point_code: 'GB34', image_name: 'knee_lateral.png', x: 55, y: 55 },
  { point_code: 'SP9', image_name: 'knee_medial.png', x: 45, y: 55 },
  // Legs posterior
  { point_code: 'BL40', image_name: 'legs_posterior.png', x: 50, y: 25 },
  // Foot
  { point_code: 'LV3', image_name: 'foot.png', x: 35, y: 50 },
  { point_code: 'KI1', image_name: 'foot_sole.png', x: 50, y: 35 },
  // Ear
  { point_code: 'Ear-Shenmen', image_name: 'ear.png', x: 35, y: 35 },
  // Tongue
  { point_code: 'Tongue-Heart', image_name: 'tongue.png', x: 50, y: 25 },
  // Pediatric
  { point_code: 'Kid-Tui', image_name: 'child_front.png', x: 50, y: 55 },
];

interface PointInfo {
  code: string;
  name_english: string;
  name_chinese: string;
  name_pinyin: string;
  meridian: string;
  location: string;
  indications: string[] | null;
  actions: string[] | null;
}

const bodyFigures = [
  { id: 'face_front', name: 'Face', category: 'Head', image: faceFrontImg },
  { id: 'head_lateral', name: 'Head Side', category: 'Head', image: headLateralImg },
  { id: 'scalp_top', name: 'Scalp', category: 'Head', image: scalpTopImg },
  { id: 'neck_front', name: 'Neck Front', category: 'Head', image: neckFrontImg },
  { id: 'neck_posterior', name: 'Neck Back', category: 'Head', image: neckPosteriorImg },
  { id: 'ear', name: 'Ear', category: 'Microsystem', image: earImg },
  { id: 'tongue', name: 'Tongue', category: 'Microsystem', image: tongueImg },
  { id: 'shoulder_anterior', name: 'Shoulder Front', category: 'Arms', image: shoulderAnteriorImg },
  { id: 'shoulder_side', name: 'Shoulder Side', category: 'Arms', image: shoulderSideImg },
  { id: 'arm_full', name: 'Arm', category: 'Arms', image: armFullImg },
  { id: 'elbow_inner', name: 'Elbow', category: 'Arms', image: elbowInnerImg },
  { id: 'wrist', name: 'Wrist', category: 'Arms', image: wristImg },
  { id: 'hand', name: 'Hand', category: 'Arms', image: handImg },
  { id: 'chest', name: 'Chest', category: 'Torso', image: chestImg },
  { id: 'upper_back', name: 'Upper Back', category: 'Torso', image: upperBackImg },
  { id: 'sacrum', name: 'Sacrum', category: 'Torso', image: sacrumImg },
  { id: 'thigh_hip', name: 'Thigh/Hip', category: 'Legs', image: thighHipImg },
  { id: 'knee_front', name: 'Knee Front', category: 'Legs', image: kneeFrontImg },
  { id: 'knee_lateral', name: 'Knee Side', category: 'Legs', image: kneeLateralImg },
  { id: 'knee_medial', name: 'Knee Inner', category: 'Legs', image: kneeMedialImg },
  { id: 'legs_posterior', name: 'Legs Back', category: 'Legs', image: legsPosteriorImg },
  { id: 'foot', name: 'Foot', category: 'Legs', image: footImg },
  { id: 'foot_sole', name: 'Foot Sole', category: 'Legs', image: footSoleImg },
  { id: 'child_front', name: 'Child', category: 'Pediatric', image: childFrontImg },
];

const categories = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'Head', name: 'Head', icon: Brain },
  { id: 'Arms', name: 'Arms', icon: Hand },
  { id: 'Torso', name: 'Torso', icon: User },
  { id: 'Legs', name: 'Legs', icon: Footprints },
  { id: 'Microsystem', name: 'Micro', icon: Sparkles },
  { id: 'Pediatric', name: 'Pediatric', icon: Baby },
];

function PointMarker({ point, onFetchInfo }: { 
  point: { point_code: string; x: number; y: number }; 
  onFetchInfo: (code: string) => Promise<PointInfo | null>;
}) {
  const [info, setInfo] = useState<PointInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    if (open && !fetched) {
      setLoading(true);
      const data = await onFetchInfo(point.point_code);
      setInfo(data);
      setLoading(false);
      setFetched(true);
    }
  };

  return (
    <HoverCard onOpenChange={handleOpenChange} openDelay={100}>
      <HoverCardTrigger asChild>
        <button
          className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/80 border-2 border-white shadow-lg hover:bg-amber-400 hover:scale-125 transition-all duration-200 cursor-pointer z-10 flex items-center justify-center"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <span className="sr-only">{point.point_code}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3" side="top">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          </div>
        ) : info ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 hover:bg-amber-600">{info.code}</Badge>
              <span className="text-sm font-medium">{info.meridian}</span>
            </div>
            <h4 className="font-semibold text-sm">{info.name_english}</h4>
            <p className="text-xs text-muted-foreground">{info.name_pinyin} • {info.name_chinese}</p>
            <div className="text-xs">
              <span className="font-medium">Location:</span> {info.location?.slice(0, 100)}...
            </div>
            {info.indications && info.indications.length > 0 && (
              <div className="text-xs">
                <span className="font-medium">Indications:</span>{' '}
                {info.indications.slice(0, 3).join(', ')}
                {info.indications.length > 3 && '...'}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <Badge variant="outline">{point.point_code}</Badge>
            <p className="text-xs text-muted-foreground mt-1">Point data not available</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export default function BodyFiguresGallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFigure, setSelectedFigure] = useState<typeof bodyFigures[0] | null>(null);
  const [showPoints, setShowPoints] = useState(true);

  const filteredFigures = activeCategory === 'all' 
    ? bodyFigures 
    : bodyFigures.filter(f => f.category === activeCategory);

  const getPointsForFigure = (figureId: string) => {
    const imageName = `${figureId}.png`;
    return pointCoordinates.filter(p => p.image_name === imageName);
  };

  const fetchPointInfo = async (code: string): Promise<PointInfo | null> => {
    try {
      const { data, error } = await supabase
        .from('acupuncture_points')
        .select('code, name_english, name_chinese, name_pinyin, meridian, location, indications, actions')
        .eq('code', code)
        .single();
      
      if (error) return null;
      return data as PointInfo;
    } catch {
      return null;
    }
  };

  const figurePoints = selectedFigure ? getPointsForFigure(selectedFigure.id) : [];

  return (
    <section className="py-16 bg-gradient-to-b from-card/50 to-background">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <User className="h-5 w-5 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">Body Atlas</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-3 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            Acupuncture Point Figures
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            20 anatomical figures with interactive point markers - hover to see details
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`gap-1.5 ${activeCategory === cat.id ? 'bg-amber-500 hover:bg-amber-600' : 'hover:bg-amber-50 dark:hover:bg-amber-950'}`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Figures Grid with Scroll */}
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {filteredFigures.map(figure => {
              const pointCount = getPointsForFigure(figure.id).length;
              return (
                <Card 
                  key={figure.id}
                  className="flex-shrink-0 w-36 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-amber-200/50 dark:border-amber-800/50"
                  onClick={() => setSelectedFigure(figure)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-[3/4] bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-lg overflow-hidden mb-2">
                      <img 
                        src={figure.image} 
                        alt={figure.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-medium text-center truncate">{figure.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-amber-500" />
                      <p className="text-[10px] text-muted-foreground">{pointCount} points</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Preview Dialog with Interactive Points */}
        <Dialog open={!!selectedFigure} onOpenChange={() => setSelectedFigure(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-500" />
                  {selectedFigure?.name}
                  <span className="text-sm font-normal text-muted-foreground">({selectedFigure?.category})</span>
                  {figurePoints.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {figurePoints.length} points
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPoints(!showPoints)}
                  className="gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  {showPoints ? 'Hide' : 'Show'} Points
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedFigure && (
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 overflow-auto max-h-[70vh]">
                <div className="relative inline-block w-full">
                  <img 
                    src={selectedFigure.image} 
                    alt={selectedFigure.name}
                    className="w-full max-h-[60vh] object-contain"
                  />
                  {showPoints && figurePoints.map(point => (
                    <PointMarker 
                      key={point.point_code} 
                      point={point}
                      onFetchInfo={fetchPointInfo}
                    />
                  ))}
                </div>
              </div>
            )}
            {figurePoints.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Hover over the orange markers to see point details
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
