import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  Pill, 
  Bookmark,
  MapPin,
  X,
  Trash2
} from 'lucide-react';
import { InteractiveBodyMap } from '@/components/session/body-map/InteractiveBodyMap';
import { SessionNotes } from '@/components/session/SessionNotes';
import { HerbalFormulaPanel } from '@/components/session/HerbalFormulaPanel';
import { cn } from '@/lib/utils';

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

interface BodyMapWorkspaceProps {
  patientId: string;
  patientName?: string;
  onPlanUpdate?: (text: string) => void;
  initialPlanText?: string;
  onNotesChange?: (notes: SessionNotesState) => void;
}

export function BodyMapWorkspace({ 
  patientId, 
  patientName, 
  onPlanUpdate, 
  initialPlanText,
  onNotesChange 
}: BodyMapWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('bodymap');
  const [selectedPoints, setSelectedPoints] = useState<Array<{ code: string; name: string }>>([]);
  const [tcmPattern, setTcmPattern] = useState('');
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

  const handlePointSelect = (point: { code: string; name: string }) => {
    setSelectedPoints(prev => {
      const exists = prev.find(p => p.code === point.code);
      if (exists) {
        return prev.filter(p => p.code !== point.code);
      }
      return [...prev, point];
    });
  };

  const removePoint = (code: string) => {
    setSelectedPoints(prev => prev.filter(p => p.code !== code));
  };

  const clearAllPoints = () => {
    setSelectedPoints([]);
  };

  const selectedPointCodes = selectedPoints.map(p => p.code);

  // Handler for when herbs are added to plan
  const handleAddHerbsToPlan = useCallback((formulaText: string) => {
    const newHerbs = sessionNotes.herbsPrescribed 
      ? `${sessionNotes.herbsPrescribed}\n\n${formulaText}`
      : formulaText;
    
    setSessionNotes(prev => ({ ...prev, herbsPrescribed: newHerbs }));
    onPlanUpdate?.(formulaText);
    onNotesChange?.({ ...sessionNotes, herbsPrescribed: newHerbs });
  }, [sessionNotes, onPlanUpdate, onNotesChange]);

  // Handler for pattern changes from SessionNotes
  const handlePatternChange = useCallback((pattern: string) => {
    setTcmPattern(pattern);
    setSessionNotes(prev => ({ ...prev, tcmPattern: pattern }));
    onNotesChange?.({ ...sessionNotes, tcmPattern: pattern });
  }, [sessionNotes, onNotesChange]);

  // Handler for notes changes
  const handleNotesUpdate = useCallback((notes: Partial<SessionNotesState>) => {
    const updated = { ...sessionNotes, ...notes };
    setSessionNotes(updated);
    if (notes.tcmPattern !== undefined) {
      setTcmPattern(notes.tcmPattern);
    }
    onNotesChange?.(updated);
  }, [sessionNotes, onNotesChange]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Patient Header Bar */}
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-jade-500/10 to-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-jade-400 to-jade-600 flex items-center justify-center text-white font-semibold shadow-md">
              {patientName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {patientName || 'Patient Session'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Session in progress • ID: {patientId.slice(0, 8)}...
              </p>
            </div>
          </div>
          {tcmPattern && (
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700">
              {tcmPattern}
            </Badge>
          )}
        </div>
      </div>

      {/* Selected Points Bar */}
      {selectedPoints.length > 0 && (
        <div className="px-4 py-2 border-b border-border/30 bg-jade-50/50 dark:bg-jade-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-jade-600" />
              <span className="text-sm font-medium">Selected Points ({selectedPoints.length})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllPoints}
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedPoints.map((point) => (
              <Badge
                key={point.code}
                variant="secondary"
                className="bg-jade-100 dark:bg-jade-900/40 text-jade-700 dark:text-jade-300 pl-2 pr-1 gap-1"
              >
                <span className="font-semibold">{point.code}</span>
                <span className="text-jade-600/70 dark:text-jade-400/70">- {point.name}</span>
                <button
                  onClick={() => removePoint(point.code)}
                  className="ml-1 p-0.5 rounded-full hover:bg-jade-200 dark:hover:bg-jade-800 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3 border-b border-border/30">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="bodymap" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" />
              Body Map
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5" />
              Points
            </TabsTrigger>
            <TabsTrigger value="herbs" className="gap-1.5 text-xs">
              <Pill className="h-3.5 w-3.5" />
              Herbs
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="bodymap" className="h-full m-0">
            <InteractiveBodyMap
              onPointSelect={handlePointSelect}
              selectedPoints={selectedPointCodes}
            />
          </TabsContent>

          <TabsContent value="points" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* Selected Points Summary */}
                <div className="p-4 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-jade-600" />
                      Treatment Protocol
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {selectedPoints.length} points selected
                    </span>
                  </div>
                  {selectedPoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Click on points in the Body Map to add them to your protocol.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPoints.map((point, idx) => (
                        <div
                          key={point.code}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-jade-500 text-white text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-sm">{point.code}</p>
                              <p className="text-xs text-muted-foreground">{point.name}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removePoint(point.code)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Common Point Combinations */}
                <div className="p-4 rounded-xl border border-border/50 bg-card">
                  <h4 className="font-medium mb-3">Common Combinations</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: 'Four Gates', points: ['LI4', 'LV3'] },
                      { name: 'Immune Boost', points: ['ST36', 'LI4', 'LI11'] },
                      { name: 'Calm Spirit', points: ['HT7', 'PC6', 'Yintang'] },
                      { name: 'Digestive', points: ['ST36', 'SP6', 'CV12'] },
                    ].map((combo) => (
                      <button
                        key={combo.name}
                        onClick={() => {
                          combo.points.forEach(code => {
                            if (!selectedPointCodes.includes(code)) {
                              handlePointSelect({ code, name: code });
                            }
                          });
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors",
                          "hover:border-jade-300 hover:bg-jade-50 dark:hover:bg-jade-950/30"
                        )}
                      >
                        <p className="font-medium text-sm">{combo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {combo.points.join(' + ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="herbs" className="h-full m-0">
            <HerbalFormulaPanel 
              selectedPattern={tcmPattern}
              onAddToPlan={handleAddHerbsToPlan}
            />
          </TabsContent>

          <TabsContent value="notes" className="h-full m-0">
            <SessionNotes 
              patientId={patientId} 
              onPlanUpdate={onPlanUpdate}
              initialPlanText={initialPlanText}
              onPatternChange={handlePatternChange}
              onNotesUpdate={handleNotesUpdate}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
