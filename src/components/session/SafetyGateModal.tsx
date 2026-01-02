import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, Phone, CheckCircle, AlertTriangle, FileDown, Trash2 } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SafetyLogEntry {
  timestamp: string;
  patientName?: string;
  status: "cleared" | "sos";
  sosNotes?: string;
}

interface SafetyGateModalProps {
  open: boolean;
  onConfirmSafe: () => void;
  patientName?: string;
}

export const SAFETY_LOG_STORAGE_KEY = "safety-gate-log";

export function getSafetyLog(): SafetyLogEntry[] {
  try {
    const stored = localStorage.getItem(SAFETY_LOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearSafetyLog(): void {
  localStorage.removeItem(SAFETY_LOG_STORAGE_KEY);
}

export function exportSafetyLogToPDF(): void {
  const log = getSafetyLog();
  if (log.length === 0) {
    return;
  }

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text("Session Safety Log Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);
  doc.text(`Total Entries: ${log.length}`, 14, 36);
  
  const sosCount = log.filter(e => e.status === "sos").length;
  const clearedCount = log.filter(e => e.status === "cleared").length;
  doc.text(`Cleared: ${clearedCount} | SOS Triggered: ${sosCount}`, 14, 42);
  
  // Table
  const tableData = log.slice().reverse().map((entry) => [
    format(new Date(entry.timestamp), "dd/MM/yyyy"),
    format(new Date(entry.timestamp), "HH:mm"),
    entry.patientName || "Unknown",
    entry.status === "sos" ? "SOS TRIGGERED" : "Cleared",
    entry.sosNotes || "-"
  ]);

  autoTable(doc, {
    startY: 50,
    head: [["Date", "Time", "Patient", "Status", "SOS Notes"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [44, 62, 80] },
    columnStyles: {
      4: { cellWidth: 50 }
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        if (data.cell.raw === "SOS TRIGGERED") {
          data.cell.styles.textColor = [192, 57, 43];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [39, 174, 96];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  doc.save(`safety-log-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export function SafetyGateModal({ open, onConfirmSafe, patientName }: SafetyGateModalProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [showSosInput, setShowSosInput] = useState(false);
  const [sosNotes, setSosNotes] = useState("");
  const [log, setLog] = useState<SafetyLogEntry[]>([]);
  
  useBodyScrollLock(open);

  // Load log from localStorage
  useEffect(() => {
    if (open) {
      setLog(getSafetyLog());
      setShowSosInput(false);
      setSosNotes("");
      setIsLocked(false);
    }
  }, [open]);

  const saveLog = (entries: SafetyLogEntry[]) => {
    const trimmed = entries.slice(-50); // Keep last 50
    localStorage.setItem(SAFETY_LOG_STORAGE_KEY, JSON.stringify(trimmed));
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

  const handleNoClick = () => {
    setShowSosInput(true);
  };

  const handleConfirmSOS = () => {
    const entry: SafetyLogEntry = {
      timestamp: new Date().toISOString(),
      patientName,
      status: "sos",
      sosNotes: sosNotes.trim() || undefined,
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
          ) : showSosInput ? (
            <div className="space-y-3">
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-destructive font-semibold text-center mb-3">
                  Add SOS Notes (Optional)
                </p>
                <Textarea
                  value={sosNotes}
                  onChange={(e) => setSosNotes(e.target.value)}
                  placeholder="Describe the situation briefly..."
                  className="min-h-[80px] bg-background"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSosInput(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmSOS}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call 101 Now
                </Button>
              </div>
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
                onClick={handleNoClick}
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
        {log.length > 0 && !showSosInput && (
          <div className="bg-muted/50 border-t px-6 py-4 max-h-40 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                📅 Session Safety Log
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportSafetyLogToPDF()}
                className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <FileDown className="w-3 h-3" />
                PDF
              </Button>
            </div>
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
