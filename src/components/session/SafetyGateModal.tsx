import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stethoscope, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { format } from "date-fns";

interface SafetyLogEntry {
  timestamp: string;
  patientName?: string;
  status: "cleared" | "sos";
}

interface SafetyGateModalProps {
  open: boolean;
  onConfirmSafe: () => void;
  patientName?: string;
}

const STORAGE_KEY = "safety-gate-log";

export function SafetyGateModal({ open, onConfirmSafe, patientName }: SafetyGateModalProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [log, setLog] = useState<SafetyLogEntry[]>([]);
  
  useBodyScrollLock(open);

  // Load log from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLog(JSON.parse(stored));
      } catch {
        setLog([]);
      }
    }
  }, [open]);

  const saveLog = (entries: SafetyLogEntry[]) => {
    const trimmed = entries.slice(-50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    setLog(trimmed);
  };

  const handleYes = () => {
    const entry: SafetyLogEntry = {
      timestamp: new Date().toISOString(),
      patientName,
      status: "cleared",
    };
    saveLog([...log, entry]);
    onConfirmSafe();
  };

  const handleNo = () => {
    const entry: SafetyLogEntry = {
      timestamp: new Date().toISOString(),
      patientName,
      status: "sos",
    };
    saveLog([...log, entry]);
    setIsLocked(true);
    
    // Trigger emergency call
    window.location.href = "tel:101";
  };

  return (
    <Dialog open={open} modal>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden border-t-8 border-t-primary"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header Icon */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground text-center">
            First Look Check-Up
          </h2>
          
          <p className="text-muted-foreground text-center mt-3 leading-relaxed">
            Is the patient currently in a <strong>stable Physical, Mental, and Medical</strong> position to receive acupuncture treatment?
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 space-y-3">
          {isLocked ? (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-destructive font-semibold">SOS Triggered</p>
              <p className="text-sm text-muted-foreground mt-1">
                Session locked. Emergency services contacted.
              </p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleYes}
                className="w-full h-14 text-lg gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                YES - Patient is Stable
              </Button>
              
              <Button
                onClick={handleNo}
                variant="outline"
                className="w-full h-14 text-lg gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Phone className="w-5 h-5" />
                NO - Stop & Call 101
              </Button>
            </>
          )}
        </div>

        {/* Session Log */}
        {log.length > 0 && (
          <div className="bg-muted/50 border-t px-6 py-4 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              📅 Session Safety Log
            </p>
            <div className="space-y-1">
              {log.slice().reverse().slice(0, 10).map((entry, i) => (
                <div 
                  key={i} 
                  className={`text-xs flex justify-between items-center py-1 px-2 rounded ${
                    entry.status === "sos" 
                      ? "bg-destructive/10 text-destructive font-semibold" 
                      : "text-muted-foreground"
                  }`}
                >
                  <span>
                    {format(new Date(entry.timestamp), "HH:mm")} - {entry.patientName || "Unknown"}
                  </span>
                  <span>
                    {entry.status === "sos" ? "🚨 SOS" : "✅ Cleared"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage safety gate state
export function useSafetyGate() {
  const [showGate, setShowGate] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const onConfirmCallbackRef = useRef<(() => void) | null>(null);

  const openGate = (onConfirmCallback?: () => void) => {
    if (onConfirmCallback) {
      onConfirmCallbackRef.current = onConfirmCallback;
    }
    setShowGate(true);
    setIsCleared(false);
  };

  const handleConfirm = () => {
    setShowGate(false);
    setIsCleared(true);
    if (onConfirmCallbackRef.current) {
      onConfirmCallbackRef.current();
      onConfirmCallbackRef.current = null;
    }
  };

  return {
    showGate,
    isCleared,
    openGate,
    closeGate: () => setShowGate(false),
    handleConfirm,
    SafetyGateModal: (props: Omit<SafetyGateModalProps, "open" | "onConfirmSafe">) => (
      <SafetyGateModal 
        open={showGate} 
        onConfirmSafe={handleConfirm} 
        {...props} 
      />
    ),
  };
}
