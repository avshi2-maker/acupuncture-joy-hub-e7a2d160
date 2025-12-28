import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { User, Hand, Footprints, Brain, Baby, Sparkles, Loader2, MapPin } from 'lucide-react';
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

// Point coordinates from CSV - normalized to percentage values
const pointCoordinates: { point_code: string; image_name: string; x: number; y: number }[] = [
  { point_code: 'LI4', image_name: 'hand.png', x: 50, y: 40 },
  { point_code: 'LI10', image_name: 'arm.png', x: 52, y: 55 },
  { point_code: 'LI11', image_name: 'arm.png', x: 54, y: 45 },
  { point_code: 'LI15', image_name: 'arm.png', x: 43, y: 20 },
  { point_code: 'PC3', image_name: 'arm_inner.png', x: 52, y: 43 },
  { point_code: 'PC6', image_name: 'arm_inner.png', x: 50, y: 50 },
  { point_code: 'PC7', image_name: 'wrist.png', x: 50, y: 47 },
  { point_code: 'PC8', image_name: 'hand.png', x: 48, y: 43 },
  { point_code: 'HT3', image_name: 'arm_inner.png', x: 54, y: 40 },
  { point_code: 'HT7', image_name: 'wrist.png', x: 50, y: 50 },
  { point_code: 'HT8', image_name: 'hand.png', x: 47, y: 45 },
  { point_code: 'LU5', image_name: 'arm_inner.png', x: 50, y: 38 },
  { point_code: 'LU7', image_name: 'arm_inner.png', x: 47, y: 40 },
  { point_code: 'LU9', image_name: 'wrist.png', x: 48, y: 52 },
  { point_code: 'LU10', image_name: 'hand.png', x: 45, y: 38 },
  { point_code: 'LU11', image_name: 'hand.png', x: 43, y: 33 },
  { point_code: 'SI3', image_name: 'hand.png', x: 54, y: 43 },
  { point_code: 'SI4', image_name: 'wrist.png', x: 54, y: 49 },
  { point_code: 'SI6', image_name: 'wrist.png', x: 53, y: 54 },
  { point_code: 'TE3', image_name: 'hand.png', x: 52, y: 39 },
  { point_code: 'TE5', image_name: 'wrist.png', x: 52, y: 57 },
  { point_code: 'TE6', image_name: 'arm.png', x: 53, y: 53 },
  { point_code: 'TE14', image_name: 'arm.png', x: 45, y: 18 },
  { point_code: 'ST2', image_name: 'head_front.png', x: 47, y: 52 },
  { point_code: 'ST3', image_name: 'head_front.png', x: 46, y: 56 },
  { point_code: 'ST4', image_name: 'head_front.png', x: 45, y: 60 },
  { point_code: 'ST6', image_name: 'head_front.png', x: 43, y: 64 },
  { point_code: 'ST7', image_name: 'head_side.png', x: 47, y: 56 },
  { point_code: 'ST8', image_name: 'head_front.png', x: 43, y: 40 },
  { point_code: 'ST25', image_name: 'body_front.png', x: 43, y: 50 },
  { point_code: 'ST34', image_name: 'leg_front.png', x: 47, y: 30 },
  { point_code: 'ST35', image_name: 'leg_front.png', x: 45, y: 35 },
  { point_code: 'ST36', image_name: 'leg_front.png', x: 43, y: 50 },
  { point_code: 'ST37', image_name: 'leg_front.png', x: 45, y: 55 },
  { point_code: 'ST40', image_name: 'leg_front.png', x: 47, y: 60 },
  { point_code: 'ST41', image_name: 'foot.png', x: 50, y: 45 },
  { point_code: 'ST44', image_name: 'foot.png', x: 48, y: 55 },
  { point_code: 'SP3', image_name: 'foot.png', x: 47, y: 48 },
  { point_code: 'SP4', image_name: 'foot.png', x: 45, y: 45 },
  { point_code: 'SP6', image_name: 'leg_inner.png', x: 54, y: 55 },
  { point_code: 'SP9', image_name: 'leg_inner.png', x: 52, y: 48 },
  { point_code: 'SP10', image_name: 'leg_inner.png', x: 50, y: 40 },
  { point_code: 'SP15', image_name: 'body_front.png', x: 43, y: 47 },
  { point_code: 'LV2', image_name: 'foot.png', x: 50, y: 53 },
  { point_code: 'LV3', image_name: 'foot.png', x: 48, y: 50 },
  { point_code: 'LV8', image_name: 'leg_inner.png', x: 48, y: 43 },
  { point_code: 'LV13', image_name: 'body_front.png', x: 41, y: 43 },
  { point_code: 'LV14', image_name: 'chest.png', x: 43, y: 53 },
  { point_code: 'KI1', image_name: 'foot_sole.png', x: 50, y: 45 },
  { point_code: 'KI3', image_name: 'foot.png', x: 47, y: 53 },
  { point_code: 'KI6', image_name: 'foot.png', x: 48, y: 55 },
  { point_code: 'KI7', image_name: 'leg_inner.png', x: 53, y: 58 },
  { point_code: 'KI10', image_name: 'leg_inner.png', x: 50, y: 45 },
  { point_code: 'KI27', image_name: 'chest.png', x: 47, y: 27 },
  { point_code: 'BL1', image_name: 'head_front.png', x: 48, y: 46 },
  { point_code: 'BL2', image_name: 'head_front.png', x: 47, y: 44 },
  { point_code: 'BL10', image_name: 'bodyback.png', x: 47, y: 15 },
  { point_code: 'BL11', image_name: 'bodyback.png', x: 45, y: 17 },
  { point_code: 'BL13', image_name: 'bodyback.png', x: 45, y: 19 },
  { point_code: 'BL15', image_name: 'bodyback.png', x: 45, y: 21 },
  { point_code: 'BL17', image_name: 'bodyback.png', x: 45, y: 23 },
  { point_code: 'BL18', image_name: 'bodyback.png', x: 45, y: 25 },
  { point_code: 'BL20', image_name: 'bodyback.png', x: 45, y: 27 },
  { point_code: 'BL21', image_name: 'bodyback.png', x: 45, y: 29 },
  { point_code: 'BL23', image_name: 'bodyback.png', x: 45, y: 31 },
  { point_code: 'BL25', image_name: 'bodyback.png', x: 45, y: 33 },
  { point_code: 'BL40', image_name: 'leg_outer.png', x: 50, y: 48 },
  { point_code: 'BL57', image_name: 'leg_outer.png', x: 48, y: 55 },
  { point_code: 'BL60', image_name: 'foot.png', x: 45, y: 55 },
  { point_code: 'BL62', image_name: 'foot.png', x: 43, y: 53 },
  { point_code: 'GB1', image_name: 'head_side.png', x: 52, y: 44 },
  { point_code: 'GB2', image_name: 'head_side.png', x: 50, y: 52 },
  { point_code: 'GB8', image_name: 'head_side.png', x: 48, y: 36 },
  { point_code: 'GB14', image_name: 'head_front.png', x: 45, y: 38 },
  { point_code: 'GB20', image_name: 'head_side.png', x: 50, y: 48 },
  { point_code: 'GB21', image_name: 'bodyback.png', x: 43, y: 13 },
  { point_code: 'GB30', image_name: 'bodyback.png', x: 41, y: 48 },
  { point_code: 'GB31', image_name: 'leg_outer.png', x: 52, y: 43 },
  { point_code: 'GB34', image_name: 'leg_outer.png', x: 48, y: 50 },
  { point_code: 'GB39', image_name: 'leg_outer.png', x: 47, y: 58 },
  { point_code: 'GB40', image_name: 'foot.png', x: 50, y: 50 },
  { point_code: 'GB41', image_name: 'foot.png', x: 52, y: 53 },
  { point_code: 'GV4', image_name: 'spine.png', x: 50, y: 55 },
  { point_code: 'GV14', image_name: 'bodyback.png', x: 50, y: 17 },
  { point_code: 'GV16', image_name: 'bodyback.png', x: 50, y: 13 },
  { point_code: 'GV20', image_name: 'head_front.png', x: 50, y: 15 },
  { point_code: 'GV24', image_name: 'head_front.png', x: 50, y: 22 },
  { point_code: 'GV26', image_name: 'head_front.png', x: 50, y: 64 },
  { point_code: 'CV3', image_name: 'body_front.png', x: 50, y: 60 },
  { point_code: 'CV4', image_name: 'body_front.png', x: 50, y: 58 },
  { point_code: 'CV6', image_name: 'body_front.png', x: 50, y: 53 },
  { point_code: 'CV8', image_name: 'body_front.png', x: 50, y: 50 },
  { point_code: 'CV12', image_name: 'body_front.png', x: 50, y: 43 },
  { point_code: 'CV17', image_name: 'chest.png', x: 50, y: 40 },
  { point_code: 'CV22', image_name: 'chest.png', x: 50, y: 23 },
  { point_code: 'CV23', image_name: 'head_front.png', x: 50, y: 68 },
  { point_code: 'EX-HN1', image_name: 'head_front.png', x: 50, y: 10 },
  { point_code: 'EX-HN3', image_name: 'head_front.png', x: 50, y: 38 },
  { point_code: 'EX-HN5', image_name: 'head_front.png', x: 50, y: 48 },
  { point_code: 'EX-LE10', image_name: 'leg_front.png', x: 43, y: 43 },
  { point_code: 'Yintang', image_name: 'head_front.png', x: 50, y: 42 },
  { point_code: 'Taiyang', image_name: 'head_side.png', x: 54, y: 46 },
  { point_code: 'Ear-Shenmen', image_name: 'ear.png', x: 50, y: 40 },
  { point_code: 'Ear-Heart', image_name: 'ear.png', x: 48, y: 47 },
  { point_code: 'Ear-Kidney', image_name: 'ear.png', x: 47, y: 53 },
  { point_code: 'Ear-Liver', image_name: 'ear.png', x: 52, y: 50 },
  { point_code: 'Ear-Lung', image_name: 'ear.png', x: 50, y: 57 },
  { point_code: 'Ear-Stomach', image_name: 'ear.png', x: 48, y: 60 },
  { point_code: 'Ear-Spleen', image_name: 'ear.png', x: 47, y: 63 },
  { point_code: 'Kid-Tui', image_name: 'child_front.png', x: 50, y: 53 },
  { point_code: 'Kid-Feishu', image_name: 'child_back.png', x: 47, y: 33 },
  { point_code: 'Kid-Pishu', image_name: 'child_back.png', x: 47, y: 40 },
  { point_code: 'Kid-Shenshu', image_name: 'child_back.png', x: 47, y: 47 },
  { point_code: 'Tongue-Heart', image_name: 'tongue.png', x: 50, y: 33 },
  { point_code: 'Tongue-Lung', image_name: 'tongue.png', x: 50, y: 40 },
  { point_code: 'Tongue-Spleen', image_name: 'tongue.png', x: 50, y: 47 },
  { point_code: 'Tongue-Kidney', image_name: 'tongue.png', x: 50, y: 53 },
  { point_code: 'Tongue-Liver', image_name: 'tongue.png', x: 47, y: 43 },
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
  { id: 'body_front', name: 'Body Front', category: 'Full Body', image: bodyFrontImg },
  { id: 'bodyback', name: 'Body Back', category: 'Full Body', image: bodybackImg },
  { id: 'body_main', name: 'Body Main', category: 'Full Body', image: bodyMainImg },
  { id: 'spine', name: 'Spine', category: 'Full Body', image: spineImg },
  { id: 'head_front', name: 'Head Front', category: 'Head', image: headFrontImg },
  { id: 'head_side', name: 'Head Side', category: 'Head', image: headSideImg },
  { id: 'ear', name: 'Ear', category: 'Head', image: earImg },
  { id: 'tongue', name: 'Tongue', category: 'Head', image: tongueImg },
  { id: 'chest', name: 'Chest', category: 'Torso', image: chestImg },
  { id: 'arm', name: 'Arm Outer', category: 'Arms', image: armImg },
  { id: 'arm_inner', name: 'Arm Inner', category: 'Arms', image: armInnerImg },
  { id: 'wrist', name: 'Wrist', category: 'Arms', image: wristImg },
  { id: 'hand', name: 'Hand', category: 'Arms', image: handImg },
  { id: 'leg_front', name: 'Leg Front', category: 'Legs', image: legFrontImg },
  { id: 'leg_inner', name: 'Leg Inner', category: 'Legs', image: legInnerImg },
  { id: 'leg_outer', name: 'Leg Outer', category: 'Legs', image: legOuterImg },
  { id: 'foot', name: 'Foot', category: 'Legs', image: footImg },
  { id: 'foot_sole', name: 'Foot Sole', category: 'Legs', image: footSoleImg },
  { id: 'child_front', name: 'Child Front', category: 'Pediatric', image: childFrontImg },
  { id: 'child_back', name: 'Child Back', category: 'Pediatric', image: childBackImg },
];

const categories = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'Full Body', name: 'Body', icon: User },
  { id: 'Head', name: 'Head', icon: Brain },
  { id: 'Arms', name: 'Arms', icon: Hand },
  { id: 'Legs', name: 'Legs', icon: Footprints },
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
