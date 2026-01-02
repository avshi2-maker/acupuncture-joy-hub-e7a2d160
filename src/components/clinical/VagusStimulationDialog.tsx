import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VagusStimulationGuide } from './VagusStimulationGuide';

interface VagusStimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VagusStimulationDialog: React.FC<VagusStimulationDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Vagus Nerve Stimulation Guide</DialogTitle>
        </DialogHeader>
        <VagusStimulationGuide />
      </DialogContent>
    </Dialog>
  );
};
