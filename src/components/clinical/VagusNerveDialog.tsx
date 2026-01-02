import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VagusNerveAssessment } from './VagusNerveAssessment';
import { Brain } from 'lucide-react';

interface VagusNerveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VagusNerveDialog: React.FC<VagusNerveDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Vagus Nerve Assessment
          </DialogTitle>
        </DialogHeader>
        <VagusNerveAssessment />
      </DialogContent>
    </Dialog>
  );
};
