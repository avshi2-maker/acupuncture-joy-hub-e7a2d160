import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HRVTracker } from './HRVTracker';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HRVTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
}

export const HRVTrackerDialog: React.FC<HRVTrackerDialogProps> = ({
  open,
  onOpenChange,
  patientId,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>HRV & Vagal Tone Tracker</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <HRVTracker patientId={patientId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
