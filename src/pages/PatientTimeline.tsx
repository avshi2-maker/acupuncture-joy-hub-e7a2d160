import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  GitCompare, 
  Loader2,
  Sparkles,
  Pill,
  Clock,
  Play
} from 'lucide-react';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { ComparisonBodyDisplay } from '@/components/acupuncture/ComparisonBodyDisplay';
import { getComparisonColoredPointsFromArrays } from '@/components/clinical-navigator/ProtocolCompare';
import { ProgressChart } from '@/components/clinical-navigator/ProgressChart';
import { SavedProtocol } from '@/hooks/useProtocolHistory';
import { Helmet } from 'react-helmet-async';

interface TimelineEntry {
  id: string;
  date: string;
  primaryComplaint: string;
  diagnosis: string;
  moduleName: string;
  acupuncturePoints: string[];
  herbalFormula: string | null;
  nutritionAdvice: string[];
  lifestyleAdvice: string[];
  distressLevel: number | null;
}

export default function PatientTimeline() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [replaySessionId, setReplaySessionId] = useState<string | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  // Fetch patient info
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, chief_complaint')
        .eq('id', patientId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch timeline entries (protocols)
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['patient-timeline', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('assessment_type', 'clinical_navigator')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => {
        const details = item.details as any;
        return {
          id: item.id,
          date: item.created_at,
          primaryComplaint: details?.chiefComplaint || details?.moduleName || 'General Assessment',
          diagnosis: details?.diagnosis || '',
          moduleName: details?.moduleName || 'Clinical Navigator',
          acupuncturePoints: details?.acupuncturePoints || [],
          herbalFormula: details?.herbalFormula || null,
          nutritionAdvice: details?.nutritionAdvice || [],
          lifestyleAdvice: details?.lifestyleAdvice || [],
          distressLevel: item.score ?? details?.distressLevel ?? null,
        } as TimelineEntry;
      });
    },
    enabled: !!patientId,
  });

  // Get replay session data
  const replayEntry = useMemo(() => {
    return entries.find(e => e.id === replaySessionId);
  }, [entries, replaySessionId]);

  // Get comparison entries
  const comparisonEntries = useMemo(() => {
    if (selectedForCompare.length !== 2) return null;
    const entryA = entries.find(e => e.id === selectedForCompare[0]);
    const entryB = entries.find(e => e.id === selectedForCompare[1]);
    if (!entryA || !entryB) return null;
    return { entryA, entryB };
  }, [entries, selectedForCompare]);

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      setShowCompareDialog(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>{patient?.full_name || 'Patient'} Timeline | TCM Clinical</title>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{patient?.full_name || 'Patient'}</h1>
              <p className="text-muted-foreground">Clinical Journey Timeline</p>
            </div>
            {selectedForCompare.length === 2 && (
              <Button onClick={handleCompare} className="gap-2 bg-jade hover:bg-jade/90">
                <GitCompare className="h-4 w-4" />
                Compare Selected
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-jade" />
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start a clinical assessment to build this patient's treatment history.
                </p>
                <Button onClick={() => navigate('/clinical-navigator')}>
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Progress Chart */}
              <ProgressChart
                data={entries.map(e => ({
                  date: e.date,
                  distressLevel: e.distressLevel ?? 0,
                  complaint: e.primaryComplaint,
                }))}
              />

              <div className="grid md:grid-cols-[1fr,auto] gap-6">
                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
                
                  <div className="space-y-4">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 bg-background ${
                        selectedForCompare.includes(entry.id) 
                          ? 'border-jade bg-jade/10' 
                          : 'border-border'
                      }`}>
                        <Checkbox
                          checked={selectedForCompare.includes(entry.id)}
                          onCheckedChange={() => toggleSelectForCompare(entry.id)}
                        />
                      </div>

                      {/* Card */}
                      <Card className={`flex-1 transition-all ${
                        selectedForCompare.includes(entry.id) 
                          ? 'ring-2 ring-jade shadow-lg' 
                          : 'hover:shadow-md'
                      }`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(entry.date), 'PPP')}
                                <Clock className="h-3.5 w-3.5 ml-2" />
                                {format(new Date(entry.date), 'p')}
                              </div>
                              <CardTitle className="text-lg">{entry.primaryComplaint}</CardTitle>
                              <CardDescription className="mt-1">{entry.moduleName}</CardDescription>
                            </div>
                            <Badge variant="outline">{entry.acupuncturePoints.length} points</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {/* Diagnosis preview */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {entry.diagnosis.substring(0, 150)}...
                          </p>

                          {/* Points preview */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {entry.acupuncturePoints.slice(0, 6).map(point => (
                              <Badge key={point} variant="secondary" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                            {entry.acupuncturePoints.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.acupuncturePoints.length - 6}
                              </Badge>
                            )}
                          </div>

                          {/* Herbal formula if present */}
                          {entry.herbalFormula && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Pill className="h-3.5 w-3.5" />
                              <span className="line-clamp-1">{entry.herbalFormula}</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setReplaySessionId(entry.id)}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Replay 3D
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => toggleSelectForCompare(entry.id)}
                            >
                              <GitCompare className="h-3.5 w-3.5" />
                              {selectedForCompare.includes(entry.id) ? 'Deselect' : 'Compare'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats sidebar */}
              <div className="hidden md:block w-64">
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-jade">{entries.length}</p>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {new Set(entries.flatMap(e => e.acupuncturePoints)).size}
                      </p>
                      <p className="text-sm text-muted-foreground">Unique Points Used</p>
                    </div>
                    {entries.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">First Visit</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entries[entries.length - 1].date), 'PP')}
                        </p>
                      </div>
                    )}
                    {entries.length > 1 && (
                      <div>
                        <p className="text-sm font-medium">Last Visit</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entries[0].date), 'PP')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Replay 3D Dialog */}
      <Dialog open={!!replaySessionId} onOpenChange={(open) => !open && setReplaySessionId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-jade" />
              Replay Session - {replayEntry?.primaryComplaint}
            </DialogTitle>
          </DialogHeader>
          {replayEntry && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {format(new Date(replayEntry.date), 'PPP')} • {replayEntry.acupuncturePoints.length} points
              </p>
              <RAGBodyFigureDisplay
                pointCodes={replayEntry.acupuncturePoints}
                enableTour
                autoStartTour
                enableNarration
                language="en"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-jade" />
              Protocol Comparison
            </DialogTitle>
          </DialogHeader>
          {comparisonEntries && (
            <div className="space-y-6">
              {/* 3D Body Comparison */}
              <ComparisonBodyDisplay
                coloredPoints={getComparisonColoredPointsFromArrays(
                  comparisonEntries.entryA.acupuncturePoints,
                  comparisonEntries.entryB.acupuncturePoints
                )}
              />

              {/* Side-by-side text comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-blue-500/30">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-blue-500">Protocol A</Badge>
                    <CardTitle className="text-base mt-2">{comparisonEntries.entryA.primaryComplaint}</CardTitle>
                    <CardDescription>
                      {format(new Date(comparisonEntries.entryA.date), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {comparisonEntries.entryA.diagnosis}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-orange-500/30">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-orange-500">Protocol B</Badge>
                    <CardTitle className="text-base mt-2">{comparisonEntries.entryB.primaryComplaint}</CardTitle>
                    <CardDescription>
                      {format(new Date(comparisonEntries.entryB.date), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {comparisonEntries.entryB.diagnosis}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
