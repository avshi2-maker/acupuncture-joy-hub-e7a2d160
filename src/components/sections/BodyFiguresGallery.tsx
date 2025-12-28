import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Hand, Footprints, Brain, Ear, Baby, Sparkles, X } from 'lucide-react';

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
            20 anatomical figures for precise point location and treatment planning
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
                  <p className="text-[10px] text-muted-foreground text-center">{figure.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Preview Dialog */}
        <Dialog open={!!selectedFigure} onOpenChange={() => setSelectedFigure(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                {selectedFigure?.name}
                <span className="text-sm font-normal text-muted-foreground">({selectedFigure?.category})</span>
              </DialogTitle>
            </DialogHeader>
            {selectedFigure && (
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4">
                <img 
                  src={selectedFigure.image} 
                  alt={selectedFigure.name}
                  className="w-full max-h-[60vh] object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
