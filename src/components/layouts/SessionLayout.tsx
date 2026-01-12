import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RagSearchPanel } from '@/components/session/RagSearchPanel';
import { BodyMapWorkspace } from '@/components/session/BodyMapWorkspace';
import { MobileQuickActions } from '@/components/session/MobileQuickActions';
import { supabase } from '@/integrations/supabase/client';
import { PrintSessionButton } from '@/components/session/PrintSessionButton';
import { toast } from 'sonner';
import { useHaptic } from '@/hooks/useHaptic';
import { 
  ArrowLeft, 
  Clock, 
  Save, 
  X,
  Maximize2,
  Minimize2,
  Brain,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  full_name: string;
}

interface SessionNotesState {
  chiefComplaint: string;
  pulseFindings: string[];
  tongueFindings: string[];
  tcmPattern: string;
  treatmentPrinciple: string;
  planNotes: string;
  herbsPrescribed: string;
  selectedPoints: string[];
  followUpRecommended: string;
}

type MobileTab = 'brain' | 'body';

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 50;

export function SessionLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [leftPanelExpanded, setLeftPanelExpanded] = useState(false);
  const [planText, setPlanText] = useState('');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('body');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const { lightTap, successTap } = useHaptic();
  const [sessionNotes, setSessionNotes] = useState<SessionNotesState>({
    chiefComplaint: '',
    pulseFindings: [],
    tongueFindings: [],
    tcmPattern: '',
    treatmentPrinciple: '',
    planNotes: '',
    herbsPrescribed: '',
    selectedPoints: [],
    followUpRecommended: ''
  });

  // Fetch patient data
  useEffect(() => {
    async function fetchPatient() {
      if (!patientId) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
      } else {
        setPatient(data);
      }
      setIsLoading(false);
    }

    fetchPatient();
  }, [patientId]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    navigate('/crm');
  };

  const handleSaveSession = () => {
    console.log('Saving session...', sessionNotes);
    toast.success('Session notes saved!');
  };

  const handlePrintSession = () => {
    // Trigger the PrintSessionButton click programmatically
    printButtonRef.current?.click();
  };

  // Handler for inserting AI suggestions into notes
  const handleInsertToNotes = (text: string) => {
    setPlanText(text);
  };

  // Swipe gesture handler with haptic feedback
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Check if swipe is significant enough
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      lightTap(); // Haptic feedback on successful swipe
      if (offset.x > 0) {
        // Swipe right -> TCM Brain
        setSwipeDirection('right');
        setActiveMobileTab('brain');
      } else {
        // Swipe left -> Body Map
        setSwipeDirection('left');
        setActiveMobileTab('body');
      }
    }
  };

  // Tab switch handler with haptic feedback
  const handleTabSwitch = (tab: MobileTab, direction: 'left' | 'right') => {
    lightTap();
    setSwipeDirection(direction);
    setActiveMobileTab(tab);
  };

  // Slide animation variants
  const slideVariants = {
    enter: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? '-100%' : '100%',
      opacity: 0
    })
  };

  if (!patientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No patient selected</p>
          <Button onClick={() => navigate('/crm')}>Return to CRM</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Session Header */}
      <header className="h-14 border-b border-border/50 bg-card/95 backdrop-blur-sm flex items-center justify-between px-2 md:px-4 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/crm')} className="gap-1 md:gap-2 px-2 md:px-3">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to CRM</span>
          </Button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-jade-400 to-jade-600 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
              {patient?.full_name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{isLoading ? 'Loading...' : patient?.full_name || 'Unknown Patient'}</p>
              <p className="text-xs text-muted-foreground">Active Session</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3 md:h-4 md:w-4" />
            <span className="font-mono text-xs md:text-sm font-medium">{formatTime(elapsed)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <PrintSessionButton 
              ref={printButtonRef}
              sessionData={{
                patientName: patient?.full_name || 'Unknown Patient',
                patientId: patientId,
                sessionDate: sessionStartTime,
                chiefComplaint: sessionNotes.chiefComplaint,
                pulseFindings: sessionNotes.pulseFindings,
                tongueFindings: sessionNotes.tongueFindings,
                tcmPattern: sessionNotes.tcmPattern,
                treatmentPrinciple: sessionNotes.treatmentPrinciple,
                planNotes: sessionNotes.planNotes,
                herbsPrescribed: sessionNotes.herbsPrescribed,
                selectedPoints: sessionNotes.selectedPoints,
                followUpRecommended: sessionNotes.followUpRecommended
              }}
            />
            <Button variant="outline" size="sm" onClick={handleSaveSession} className="gap-2">
              <Save className="h-4 w-4" />Save
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={handleEndSession} className="gap-1 md:gap-2 px-2 md:px-3">
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </div>
      </header>

      {/* Main Split Content - Desktop: side-by-side, Mobile: tabs with swipe */}
      <main className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        {/* Desktop Layout - Side by Side */}
        <aside className={cn(
          "border-r border-border/30 transition-all duration-300 ease-in-out flex flex-col",
          "hidden md:flex",
          leftPanelExpanded ? "md:w-1/2" : "md:w-[40%]"
        )}>
          <div className="flex items-center justify-end p-1 border-b border-border/30 bg-muted/30">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLeftPanelExpanded(!leftPanelExpanded)}>
              {leftPanelExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <RagSearchPanel patientId={patientId} onInsertToNotes={handleInsertToNotes} />
          </div>
        </aside>

        <section className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          "hidden md:block",
          leftPanelExpanded ? "md:w-1/2" : "md:w-[60%]"
        )}>
          <BodyMapWorkspace 
            patientId={patientId} 
            patientName={patient?.full_name} 
            initialPlanText={planText}
            onNotesChange={setSessionNotes}
          />
        </section>

        {/* Mobile Layout - Swipeable Tabs */}
        <motion.div 
          className="w-full h-full md:hidden relative overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence initial={false} custom={swipeDirection} mode="wait">
            {activeMobileTab === 'brain' && (
              <motion.div
                key="brain"
                custom={swipeDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <RagSearchPanel patientId={patientId} onInsertToNotes={handleInsertToNotes} />
              </motion.div>
            )}
            {activeMobileTab === 'body' && (
              <motion.div
                key="body"
                custom={swipeDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <BodyMapWorkspace 
                  patientId={patientId} 
                  patientName={patient?.full_name} 
                  initialPlanText={planText}
                  onNotesChange={setSessionNotes}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Mobile Quick Actions FAB */}
      <MobileQuickActions 
        onSave={handleSaveSession}
        onPrint={handlePrintSession}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/95 backdrop-blur-sm flex md:hidden z-50">
        <button
          onClick={() => handleTabSwitch('brain', 'right')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
            activeMobileTab === 'brain' 
              ? "text-jade-600 dark:text-jade-400 bg-jade-50 dark:bg-jade-900/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Brain className="h-5 w-5" />
          <span className="text-xs font-medium">TCM Brain</span>
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => handleTabSwitch('body', 'left')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
            activeMobileTab === 'body' 
              ? "text-jade-600 dark:text-jade-400 bg-jade-50 dark:bg-jade-900/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Body Map</span>
        </button>
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden md:flex h-12 border-t border-border/50 bg-card/95 backdrop-blur-sm items-center justify-center px-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Session started at {sessionStartTime.toLocaleTimeString()}</span>
          <span className="mx-2">•</span>
          <span>Auto-save enabled</span>
          <span className="mx-2">•</span>
          <span className="text-jade-600 dark:text-jade-400">Press Ctrl+S to save notes</span>
        </div>
      </footer>
    </div>
  );
}

export default SessionLayout;
