import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, Wind } from 'lucide-react';
import { VagusNerveDialog } from './VagusNerveDialog';
import { VagusStimulationDialog } from './VagusStimulationDialog';
import vagusInfographic from '@/assets/vagus-infographic.png';

export const VagusNerveCard: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showStimulationDialog, setShowStimulationDialog] = useState(false);

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
        <div 
          className="relative h-40 overflow-hidden cursor-pointer"
          onClick={() => setShowDialog(true)}
        >
          <img 
            src={vagusInfographic} 
            alt="Vagus Nerve Healing Path" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5" />
              <span className="font-semibold">Vagus Nerve Assessment</span>
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Interactive questionnaire linking 100 vagal symptoms to TCM acupoints & herbal formulas.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-purple-100 dark:hover:bg-purple-900/30"
            onClick={() => setShowDialog(true)}
          >
            <Brain className="h-4 w-4 mr-2" />
            Start Assessment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-cyan-100 dark:hover:bg-cyan-900/30 border-cyan-300 text-cyan-700 dark:text-cyan-400"
            onClick={() => setShowStimulationDialog(true)}
          >
            <Wind className="h-4 w-4 mr-2" />
            Stimulation Guide
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
      
      <VagusNerveDialog open={showDialog} onOpenChange={setShowDialog} />
      <VagusStimulationDialog open={showStimulationDialog} onOpenChange={setShowStimulationDialog} />
    </>
  );
};
