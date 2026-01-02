import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Hand, Footprints, Brain, Baby, Sparkles, Activity } from 'lucide-react';

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

// All 37 body figures from the master CSV with their metadata
const bodyFigures = [
  // Head & Neck
  { id: 'face_front', name: 'Face', category: 'Head', image: faceFrontImg, priority: 'Medium', meridians: 'ST, LI, GB, BL, GV' },
  { id: 'head_lateral', name: 'Head Side', category: 'Head', image: headLateralImg, priority: 'High', meridians: 'GB, ST, TE, SI' },
  { id: 'scalp_top', name: 'Scalp Top', category: 'Head', image: scalpTopImg, priority: 'High', meridians: 'GV, BL' },
  { id: 'neck_front', name: 'Neck Front', category: 'Head', image: neckFrontImg, priority: 'High', meridians: 'CV, ST' },
  { id: 'neck_posterior', name: 'Neck Back', category: 'Head', image: neckPosteriorImg, priority: 'High', meridians: 'BL, SI, GB, GV' },
  
  // Upper Extremity
  { id: 'shoulder_anterior', name: 'Shoulder Front', category: 'Arms', image: shoulderAnteriorImg, priority: 'High', meridians: 'LU, LI, ST' },
  { id: 'shoulder_side', name: 'Shoulder Side', category: 'Arms', image: shoulderSideImg, priority: 'High', meridians: 'LI, SI, TE, GB' },
  { id: 'arm_full', name: 'Arm', category: 'Arms', image: armFullImg, priority: 'Medium', meridians: 'LI, TE, SI / LU, PC, HT' },
  { id: 'elbow_inner', name: 'Elbow', category: 'Arms', image: elbowInnerImg, priority: 'Medium', meridians: 'LU, PC, HT, LI, TE, SI' },
  { id: 'wrist', name: 'Wrist', category: 'Arms', image: wristImg, priority: 'High', meridians: 'LU, PC, HT' },
  { id: 'hand', name: 'Hand Palm', category: 'Arms', image: handImg, priority: 'High', meridians: 'PC, HT, LU' },
  { id: 'hand_dorsum', name: 'Hand Dorsum', category: 'Arms', image: handDorsumImg, priority: 'High', meridians: 'LI, SI, TE' },
  
  // Torso
  { id: 'chest', name: 'Chest', category: 'Torso', image: chestImg, priority: 'High', meridians: 'LU, KI, ST, SP, CV' },
  { id: 'abdomen', name: 'Abdomen', category: 'Torso', image: abdomenImg, priority: 'High', meridians: 'CV, ST, KI, SP' },
  { id: 'abdomen_zoomed', name: 'Abdomen Detail', category: 'Torso', image: abdomenZoomedImg, priority: 'High', meridians: 'CV, ST, KI, SP' },
  { id: 'abdomen_female', name: 'Abdomen Female', category: 'Torso', image: abdomenFemaleImg, priority: 'High', meridians: 'CV, ST, KI, SP' },
  { id: 'upper_back', name: 'Upper Back', category: 'Torso', image: upperBackImg, priority: 'High', meridians: 'BL, SI, GV' },
  { id: 'lower_back', name: 'Lower Back', category: 'Torso', image: lowerBackImg, priority: 'High', meridians: 'BL, GV' },
  { id: 'sacrum', name: 'Sacrum', category: 'Torso', image: sacrumImg, priority: 'Medium', meridians: 'BL, GV' },
  { id: 'sacrum_back', name: 'Sacrum Back', category: 'Torso', image: sacrumBackImg, priority: 'Medium', meridians: 'BL, GV' },
  
  // Lower Extremity
  { id: 'thigh_hip', name: 'Thigh/Hip', category: 'Legs', image: thighHipImg, priority: 'Medium', meridians: 'ST, SP, LR, GB' },
  { id: 'knee_front', name: 'Knee Front', category: 'Legs', image: kneeFrontImg, priority: 'Medium', meridians: 'ST, SP, LR, GB' },
  { id: 'knee_lateral', name: 'Knee Side', category: 'Legs', image: kneeLateralImg, priority: 'Medium', meridians: 'GB, ST' },
  { id: 'knee_medial', name: 'Knee Inner', category: 'Legs', image: kneeMedialImg, priority: 'Medium', meridians: 'SP, LR, KI' },
  { id: 'knee_back', name: 'Knee Back', category: 'Legs', image: kneeBackImg, priority: 'Medium', meridians: 'BL' },
  { id: 'legs_posterior', name: 'Legs Back', category: 'Legs', image: legsPosteriorImg, priority: 'Medium', meridians: 'BL' },
  { id: 'lower_leg', name: 'Lower Leg', category: 'Legs', image: lowerLegImg, priority: 'Medium', meridians: 'ST, SP, GB, BL' },
  { id: 'ankle', name: 'Ankle Front', category: 'Legs', image: ankleImg, priority: 'Medium', meridians: 'ST, SP, LR, GB, KI' },
  { id: 'ankle_medial', name: 'Ankle Inner', category: 'Legs', image: ankleMedialImg, priority: 'Medium', meridians: 'KI, SP, LR' },
  { id: 'ankle_side', name: 'Ankle Side', category: 'Legs', image: ankleSideImg, priority: 'Medium', meridians: 'BL, KI, GB' },
  { id: 'foot', name: 'Foot', category: 'Legs', image: footImg, priority: 'Medium', meridians: 'ST, GB, BL, LR' },
  { id: 'foot_top', name: 'Foot Top', category: 'Legs', image: footTopImg, priority: 'Medium', meridians: 'ST, GB, BL, LR' },
  { id: 'foot_sole', name: 'Foot Sole', category: 'Legs', image: footSoleImg, priority: 'High', meridians: 'KI' },
  
  // Microsystems
  { id: 'ear', name: 'Ear', category: 'Microsystem', image: earImg, priority: 'High', meridians: 'Auricular' },
  { id: 'tongue', name: 'Tongue', category: 'Microsystem', image: tongueImg, priority: 'High', meridians: 'Diagnostic' },
  
  // Pediatric
  { id: 'child_front', name: 'Child Front', category: 'Pediatric', image: childFrontImg, priority: 'Medium', meridians: 'Pediatric' },
  { id: 'child_back', name: 'Child Back', category: 'Pediatric', image: childBackImg, priority: 'Medium', meridians: 'Pediatric' },
];

const categories = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'Head', name: 'Head', icon: Brain },
  { id: 'Arms', name: 'Arms', icon: Hand },
  { id: 'Torso', name: 'Torso', icon: User },
  { id: 'Legs', name: 'Legs', icon: Footprints },
  { id: 'Microsystem', name: 'Micro', icon: Activity },
  { id: 'Pediatric', name: 'Pediatric', icon: Baby },
];

export default function BodyFiguresGallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFigure, setSelectedFigure] = useState<typeof bodyFigures[0] | null>(null);

  const filteredFigures = activeCategory === 'all' 
    ? bodyFigures 
    : bodyFigures.filter(f => f.category === activeCategory);

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
            {bodyFigures.length} anatomical figures covering all major meridian pathways
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map(cat => {
            const Icon = cat.icon;
            const count = cat.id === 'all' 
              ? bodyFigures.length 
              : bodyFigures.filter(f => f.category === cat.id).length;
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
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Figures Grid with Scroll */}
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {filteredFigures.map(figure => (
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
                  <p className="text-[10px] text-muted-foreground text-center truncate">{figure.meridians}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Preview Dialog */}
        <Dialog open={!!selectedFigure} onOpenChange={() => setSelectedFigure(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                {selectedFigure?.name}
                <span className="text-sm font-normal text-muted-foreground">({selectedFigure?.category})</span>
                {selectedFigure?.priority === 'High' && (
                  <Badge className="bg-jade ml-2">High Priority</Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedFigure && (
              <div className="space-y-4">
                <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 overflow-auto max-h-[60vh]">
                  <img 
                    src={selectedFigure.image} 
                    alt={selectedFigure.name}
                    className="w-full max-h-[55vh] object-contain mx-auto"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Key Meridians:</span>
                  {selectedFigure.meridians.split(', ').map(m => (
                    <Badge key={m} variant="outline" className="text-xs">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
