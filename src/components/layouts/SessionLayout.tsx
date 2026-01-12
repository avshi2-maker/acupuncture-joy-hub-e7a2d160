import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RagSearchPanel } from '@/components/session/RagSearchPanel';
import { BodyMapWorkspace } from '@/components/session/BodyMapWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Clock, 
  Save, 
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  full_name: string;
}

export function SessionLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [leftPanelExpanded, setLeftPanelExpanded] = useState(false);

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
    // TODO: Save session data before navigating
    navigate('/crm');
  };

  const handleSaveSession = () => {
    // TODO: Implement session save
    console.log('Saving session...');
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
      <header className="h-14 border-b border-border/50 bg-card/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/crm')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to CRM
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-jade-400 to-jade-600 flex items-center justify-center text-white text-sm font-semibold">
              {patient?.full_name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isLoading ? 'Loading...' : patient?.full_name || 'Unknown Patient'}
              </p>
              <p className="text-xs text-muted-foreground">Active Session</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Session Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-medium">{formatTime(elapsed)}</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleSaveSession} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button variant="destructive" size="sm" onClick={handleEndSession} className="gap-2">
            <X className="h-4 w-4" />
            End Session
          </Button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - RAG Search */}
        <aside 
          className={cn(
            "border-r border-border/30 transition-all duration-300 ease-in-out flex flex-col",
            leftPanelExpanded ? "w-1/2" : "w-[40%]"
          )}
        >
          <div className="flex items-center justify-end p-1 border-b border-border/30 bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setLeftPanelExpanded(!leftPanelExpanded)}
            >
              {leftPanelExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <RagSearchPanel />
          </div>
        </aside>

        {/* Right Panel - Body Map Workspace */}
        <section 
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            leftPanelExpanded ? "w-1/2" : "w-[60%]"
          )}
        >
          <BodyMapWorkspace 
            patientId={patientId} 
            patientName={patient?.full_name} 
          />
        </section>
      </main>

      {/* Session Footer - Quick Actions */}
      <footer className="h-12 border-t border-border/50 bg-card/95 backdrop-blur-sm flex items-center justify-center px-4 shrink-0">
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
