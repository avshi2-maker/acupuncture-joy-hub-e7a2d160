import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Brain, Wind } from 'lucide-react';
import { StressAssessmentDialog } from './StressAssessmentDialog';
import { HRVTrackerDialog } from './HRVTrackerDialog';
import { BreathingExerciseDialog } from './BreathingExerciseDialog';
import stressWellnessBg from '@/assets/stress-wellness.png';

interface StressWellnessCardProps {
  animationDelay?: number;
}

export const StressWellnessCard: React.FC<StressWellnessCardProps> = ({
  animationDelay = 0,
}) => {
  const [showStressAssessment, setShowStressAssessment] = useState(false);
  const [showHRVTracker, setShowHRVTracker] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  return (
    <>
      <Card 
        className="relative overflow-hidden h-full min-h-[200px] opacity-0 animate-fade-in hover:shadow-xl transition-all duration-300 cursor-pointer group"
        style={{ 
          animationDelay: `${animationDelay}ms`, 
          animationFillMode: 'forwards',
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${stressWellnessBg})` }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <CardContent className="relative h-full flex flex-col justify-between p-5 z-10">
          {/* Title Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">לחץ וחרדה</h3>
                <p className="text-white/70 text-xs">Stress & Anxiety</p>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-4">
              הערכת לחץ, מעקב HRV ותרגילי נשימה
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStressAssessment(true);
                }}
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">הערכת לחץ</span>
                <span className="sm:hidden">לחץ</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHRVTracker(true);
                }}
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">HRV מעקב</span>
                <span className="sm:hidden">HRV</span>
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white border-emerald-500/30 backdrop-blur-sm gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowBreathing(true);
              }}
            >
              <Wind className="h-4 w-4" />
              תרגיל נשימה 4-7-8
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StressAssessmentDialog 
        open={showStressAssessment} 
        onOpenChange={setShowStressAssessment}
      />
      <HRVTrackerDialog 
        open={showHRVTracker} 
        onOpenChange={setShowHRVTracker}
      />
      <BreathingExerciseDialog
        open={showBreathing}
        onOpenChange={setShowBreathing}
      />
    </>
  );
};
