import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { PulseChangeRequest } from '@/hooks/useSessionSummary';

interface PulseChangeConfirmModalProps {
  open: boolean;
  changeRequest: PulseChangeRequest | null;
  onConfirm: (updateProtocol: boolean) => void;
  onCancel: () => void;
}

export function PulseChangeConfirmModal({
  open,
  changeRequest,
  onConfirm,
  onCancel,
}: PulseChangeConfirmModalProps) {
  if (!changeRequest) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-md" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            החלפת דופק?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              שינית את אבחנת הדופק מ-
              <strong className="text-foreground mx-1">{changeRequest.oldPulse.pulseName}</strong>
              ל-
              <strong className="text-foreground mx-1">{changeRequest.newPulseName}</strong>.
            </p>
            
            {changeRequest.affectedPoints.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium mb-2">
                  הנקודות הבאות נוספו על בסיס הדופק הקודם:
                </p>
                <div className="flex flex-wrap gap-1">
                  {changeRequest.affectedPoints.map(code => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm font-medium">האם לעדכן גם את פרוטוקול הדיקור?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="gap-2">
            <XCircle className="h-4 w-4" />
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(false)}
            className="bg-muted text-foreground hover:bg-muted/80 gap-2"
          >
            שמור נקודות קיימות
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => onConfirm(true)}
            className="bg-jade hover:bg-jade/90 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            עדכן פרוטוקול
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PulseChangeConfirmModal;
