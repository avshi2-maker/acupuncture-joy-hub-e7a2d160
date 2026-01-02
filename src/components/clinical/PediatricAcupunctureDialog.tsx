import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Baby } from 'lucide-react';
import { PediatricAcupunctureGuide } from './PediatricAcupunctureGuide';

interface PediatricAcupunctureDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  defaultLanguage?: 'en' | 'he';
}

export function PediatricAcupunctureDialog({ 
  open, 
  onOpenChange,
  trigger,
  defaultLanguage = 'he'
}: PediatricAcupunctureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>מדריך דיקור ילדים</DialogTitle>
        </DialogHeader>
        <PediatricAcupunctureGuide defaultLanguage={defaultLanguage} className="border-0 shadow-none" />
      </DialogContent>
    </Dialog>
  );
}

// Quick button component for easy integration
export function PediatricGuideButton({ className }: { className?: string }) {
  return (
    <PediatricAcupunctureDialog
      trigger={
        <Button variant="outline" size="sm" className={className}>
          <Baby className="h-4 w-4 mr-2" />
          מדריך ילדים
        </Button>
      }
    />
  );
}

export default PediatricAcupunctureDialog;
