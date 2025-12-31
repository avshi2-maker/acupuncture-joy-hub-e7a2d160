import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { User, History, Calendar, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SelectedPatient } from '@/components/crm/PatientSelectorDropdown';
import { TcmSession } from '@/hooks/useTcmSessionHistory';
import { ChainedWorkflow } from '@/hooks/useTcmBrainState';

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  tcm_pattern: string | null;
  notes: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
}

interface PatientHistoryTabProps {
  selectedPatient: SelectedPatient | null;
  patientSessions: TcmSession[];
  onLoadWorkflow: (workflow: Partial<ChainedWorkflow>) => void;
}

export function PatientHistoryTab({ 
  selectedPatient, 
  patientSessions,
  onLoadWorkflow 
}: PatientHistoryTabProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisits = async () => {
      if (!selectedPatient?.id) {
        setVisits([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('visits')
          .select('id, visit_date, chief_complaint, tcm_pattern, notes, points_used, herbs_prescribed')
          .eq('patient_id', selectedPatient.id)
          .order('visit_date', { ascending: false })
          .limit(10);

        if (error) throw error;
        setVisits(data || []);
      } catch (e) {
        console.error('Failed to fetch visits:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [selectedPatient?.id]);

  if (!selectedPatient) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Patient Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a patient from the header to view their history
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {/* Patient Info */}
      <Card className="bg-gradient-to-r from-jade/10 to-primary/10 border-jade/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-jade/20">
              <User className="h-5 w-5 text-jade" />
            </div>
            <div>
              <h3 className="font-semibold">{selectedPatient.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPatient.email || selectedPatient.phone || 'No contact info'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CRM Visits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-jade" />
            CRM Visit Records
            <Badge variant="secondary" className="ml-auto">{visits.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No visit records found
            </p>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {visits.map((visit) => (
                  <div 
                    key={visit.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      if (visit.notes) {
                        // Parse workflow from notes if available
                        const sections = visit.notes.split('\n\n## ');
                        const symptomsData = sections.find(s => s.startsWith('Symptoms'))?.replace('Symptoms\n', '') || '';
                        const diagnosisData = sections.find(s => s.startsWith('Diagnosis'))?.replace('Diagnosis\n', '') || '';
                        const treatmentData = sections.find(s => s.startsWith('Treatment'))?.replace('Treatment\n', '') || '';
                        
                        onLoadWorkflow({
                          isActive: true,
                          currentPhase: 'complete',
                          symptomsData,
                          diagnosisData,
                          treatmentData,
                        });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {new Date(visit.visit_date).toLocaleDateString()}
                          </span>
                          {visit.tcm_pattern && (
                            <Badge variant="outline" className="text-xs">
                              {visit.tcm_pattern.substring(0, 30)}
                              {visit.tcm_pattern.length > 30 && '...'}
                            </Badge>
                          )}
                        </div>
                        {visit.chief_complaint && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {visit.chief_complaint}
                          </p>
                        )}
                        {visit.points_used && visit.points_used.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {visit.points_used.slice(0, 5).map((point, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                            {visit.points_used.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{visit.points_used.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* TCM Brain Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-jade" />
            TCM Brain Sessions
            <Badge variant="secondary" className="ml-auto">{patientSessions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patientSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No TCM Brain sessions found
            </p>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {patientSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {new Date(session.startTime).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {session.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.totalQuestions} questions • {session.totalResponses} responses
                    </p>
                    {session.templateUsed && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        <FileText className="h-3 w-3 mr-1" />
                        {session.templateUsed}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
