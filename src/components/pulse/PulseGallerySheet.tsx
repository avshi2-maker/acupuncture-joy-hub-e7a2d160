import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { PulseGalleryModule } from './PulseGalleryModule';
import { useClinicalNexus, type ClinicalNexusResult } from '@/hooks/useClinicalNexus';
import { allPulseFindings } from '@/data/pulse-diagnosis-data';

type PulseFindingWithCategory = typeof allPulseFindings[number];

interface PulseGallerySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPulseSelect?: (pulse: PulseFindingWithCategory, nexusResult: ClinicalNexusResult) => void;
  syncPulseToBody?: (nexusResult: ClinicalNexusResult) => void;
  selectedPulseId?: string | null;
  side?: 'left' | 'right';
}

/**
 * Pulse Gallery Sheet Component
 * Non-blocking overlay for Standard and Video Session pages
 * Integrates with Clinical Nexus for point mapping
 */
export function PulseGallerySheet({
  open,
  onOpenChange,
  onPulseSelect,
  syncPulseToBody,
  selectedPulseId,
  side = 'right',
}: PulseGallerySheetProps) {
  const navigate = useNavigate();

  const handlePulseSelect = (pulse: PulseFindingWithCategory, nexusResult: ClinicalNexusResult) => {
    // Trigger the syncPulseToBody function from Phase 1
    if (syncPulseToBody && nexusResult.found) {
      syncPulseToBody(nexusResult);
      toast.success(`נבחר: ${pulse.finding}`, {
        description: `${nexusResult.points.length} נקודות אקופונקטורה`,
        duration: 2000,
      });
    }
    
    // Call parent handler if provided
    if (onPulseSelect) {
      onPulseSelect(pulse, nexusResult);
    }
  };

  const handleAskBrain = (pulse: PulseFindingWithCategory) => {
    // Navigate to TCM Brain with pre-filled query
    navigate(`/tcm-brain?q=pulse+${encodeURIComponent(pulse.finding)}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side} 
        className="w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-jade/20 p-0 z-[60]"
      >
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-right">גלריית אבחון דופק</SheetTitle>
          <SheetDescription className="text-right">
            בחר דופק לצפייה בנקודות ודפוסי TCM
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden px-4 pb-4 h-[calc(100vh-120px)]">
          <PulseGalleryModule
            onPulseSelect={handlePulseSelect}
            onAskBrain={handleAskBrain}
            selectedPulseId={selectedPulseId}
            compact={true}
            showHeader={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
