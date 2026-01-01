import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PregnancySafetyCalculator, PregnancyData } from './PregnancySafetyCalculator';

interface PregnancySafetyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
  patientId?: string;
  therapistName?: string;
  onSaveToPatient?: (data: PregnancyData) => void;
}

export function PregnancySafetyDialog({
  open,
  onOpenChange,
  patientName,
  patientId,
  therapistName,
  onSaveToPatient
}: PregnancySafetyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>CM Pregnancy Safety Calculator</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4">
            <PregnancySafetyCalculator
              patientName={patientName}
              patientId={patientId}
              therapistName={therapistName}
              onClose={() => onOpenChange(false)}
              onSaveToPatient={onSaveToPatient}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
