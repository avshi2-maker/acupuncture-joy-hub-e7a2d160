import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ElderlyLifestyleGuide } from './ElderlyLifestyleGuide';
import { Heart } from 'lucide-react';

interface ElderlyLifestyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ElderlyLifestyleDialog({ open, onOpenChange }: ElderlyLifestyleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-500" />
            Healthy Lifestyle Guide for Adults 70+
          </DialogTitle>
        </DialogHeader>
        <ElderlyLifestyleGuide />
      </DialogContent>
    </Dialog>
  );
}
