import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  History, 
  FileText, 
  Stethoscope, 
  Pill, 
  CalendarDays, 
  User,
  ClipboardList,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  tcm_pattern: string | null;
  treatment_principle: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
  notes: string | null;
  cupping: boolean | null;
  moxa: boolean | null;
  tongue_diagnosis: string | null;
  pulse_diagnosis: string | null;
}

export interface WorkflowData {
  symptomsData: string;
  diagnosisData: string;
  treatmentData: string;
}

interface PatientVisitHistoryDialogProps {
  patientId: string | null;
  patientName: string | null;
  trigger?: React.ReactNode;
  onLoadWorkflow?: (data: WorkflowData) => void;
}

export function PatientVisitHistoryDialog({ 
  patientId, 
  patientName,
  trigger,
  onLoadWorkflow
}: PatientVisitHistoryDialogProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId || !open) {
      setVisits([]);
      return;
    }

    const fetchVisits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false })
          .limit(20);

        if (error) throw error;
        setVisits(data || []);
      } catch (err) {
        console.error('Error fetching patient visits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [patientId, open]);

  const toggleExpand = (visitId: string) => {
    setExpandedVisit(expandedVisit === visitId ? null : visitId);
  };

  const isAutoChainWorkflow = (complaint: string | null) => {
    return complaint?.includes('[Auto-Chain Workflow]');
  };

  const handleLoadWorkflow = (visit: Visit) => {
    if (!onLoadWorkflow) return;

    // Extract workflow data from the visit
    // For auto-chain visits, the notes contain the full workflow
    // For regular visits, we construct from available fields
    const symptomsData = visit.chief_complaint?.replace('[Auto-Chain Workflow]\n', '') || '';
    const diagnosisData = visit.tcm_pattern || '';
    const treatmentData = visit.treatment_principle || '';

    onLoadWorkflow({
      symptomsData,
      diagnosisData,
      treatmentData,
    });

    setOpen(false);
    toast.success('Workflow loaded from previous visit');
  };

  const canLoadWorkflow = (visit: Visit) => {
    // Can load if visit has any meaningful data
    return !!(visit.chief_complaint || visit.tcm_pattern || visit.treatment_principle);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1.5 text-xs"
            disabled={!patientId}
            title={patientId ? `View ${patientName}'s history` : 'Select a patient first'}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Visits</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {patientName ? (
              <>
                <span>{patientName}'s Visit History</span>
                <Badge variant="secondary" className="ml-2">
                  {visits.length} visits
                </Badge>
              </>
            ) : (
              <span>Patient Visit History</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No visits recorded</p>
              <p className="text-sm">Visit history will appear here after sessions are saved</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((visit, index) => {
                const isWorkflow = isAutoChainWorkflow(visit.chief_complaint);
                const isExpanded = expandedVisit === visit.id;

                return (
                  <Card 
                    key={visit.id} 
                    className={`transition-all ${
                      index === 0 
                        ? 'border-primary/40 bg-primary/5' 
                        : isWorkflow 
                          ? 'border-jade/30 bg-jade/5' 
                          : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(visit.visit_date), 'dd/MM/yyyy HH:mm')}
                          </span>
                          {index === 0 && (
                            <Badge className="bg-primary text-primary-foreground text-[10px]">
                              Latest
                            </Badge>
                          )}
                          {isWorkflow && (
                            <Badge variant="outline" className="gap-1 text-[10px] border-jade/40 text-jade">
                              <Sparkles className="h-2.5 w-2.5" />
                              Auto-Chain
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(visit.id)}
                          className="h-6 px-2"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Chief Complaint */}
                      {visit.chief_complaint && (
                        <p className="text-sm mb-2 line-clamp-2">
                          <span className="font-medium text-foreground">Complaint: </span>
                          {visit.chief_complaint.replace('[Auto-Chain Workflow]\n', '')}
                        </p>
                      )}

                      {/* Quick Info Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {visit.tcm_pattern && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Stethoscope className="h-2.5 w-2.5" />
                            {visit.tcm_pattern.length > 30 
                              ? visit.tcm_pattern.slice(0, 30) + '...' 
                              : visit.tcm_pattern}
                          </Badge>
                        )}
                        {visit.points_used && visit.points_used.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            {visit.points_used.length} points
                          </Badge>
                        )}
                        {visit.herbs_prescribed && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Pill className="h-2.5 w-2.5" />
                            Herbs
                          </Badge>
                        )}
                        {visit.cupping && (
                          <Badge variant="secondary" className="text-[10px]">Cupping</Badge>
                        )}
                        {visit.moxa && (
                          <Badge variant="secondary" className="text-[10px]">Moxa</Badge>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t space-y-3 text-sm">
                          {visit.tcm_pattern && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">TCM Pattern/Diagnosis:</p>
                              <p className="text-foreground whitespace-pre-wrap">{visit.tcm_pattern}</p>
                            </div>
                          )}
                          
                          {visit.treatment_principle && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Treatment Principle:</p>
                              <p className="text-foreground whitespace-pre-wrap">{visit.treatment_principle}</p>
                            </div>
                          )}

                          {visit.tongue_diagnosis && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Tongue:</p>
                              <p className="text-foreground">{visit.tongue_diagnosis}</p>
                            </div>
                          )}

                          {visit.pulse_diagnosis && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Pulse:</p>
                              <p className="text-foreground">{visit.pulse_diagnosis}</p>
                            </div>
                          )}

                          {visit.points_used && visit.points_used.length > 0 && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Points Used:</p>
                              <div className="flex flex-wrap gap-1">
                                {visit.points_used.map((point, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {point}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {visit.herbs_prescribed && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Herbs Prescribed:</p>
                              <p className="text-foreground whitespace-pre-wrap">{visit.herbs_prescribed}</p>
                            </div>
                          )}

                          {visit.notes && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Notes:</p>
                              <p className="text-foreground whitespace-pre-wrap text-xs bg-muted/50 p-2 rounded max-h-40 overflow-y-auto">
                                {visit.notes}
                              </p>
                            </div>
                          )}

                          {/* Load into Workflow Button */}
                          {onLoadWorkflow && canLoadWorkflow(visit) && (
                            <div className="pt-2 border-t">
                              <Button
                                onClick={() => handleLoadWorkflow(visit)}
                                size="sm"
                                variant="outline"
                                className="w-full gap-2 text-jade border-jade/40 hover:bg-jade/10"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Load into Auto-Chain Workflow
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
