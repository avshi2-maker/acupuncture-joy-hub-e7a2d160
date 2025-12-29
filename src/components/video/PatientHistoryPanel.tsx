import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { History, FileText, Stethoscope, Pill, CalendarDays } from 'lucide-react';

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  tcm_pattern: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
  notes: string | null;
}

interface PatientHistoryPanelProps {
  patientId: string | null;
  patientName: string | null;
  className?: string;
}

export function PatientHistoryPanel({ patientId, patientName, className }: PatientHistoryPanelProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setVisits([]);
      return;
    }

    const fetchVisits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('visits')
          .select('id, visit_date, chief_complaint, tcm_pattern, points_used, herbs_prescribed, notes')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false })
          .limit(3);

        if (error) throw error;
        setVisits(data || []);
      } catch (err) {
        console.error('Error fetching patient visits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [patientId]);

  if (!patientId) {
    return null;
  }

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs flex items-center gap-1.5 text-primary">
          <History className="h-3.5 w-3.5" />
          ביקורים אחרונים - {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            <FileText className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
            <p>אין ביקורים קודמים</p>
          </div>
        ) : (
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {visits.map((visit, index) => (
                <div 
                  key={visit.id} 
                  className={`p-2 rounded-lg border text-xs ${
                    index === 0 ? 'bg-background border-primary/30' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      <span>{format(new Date(visit.visit_date), 'dd/MM/yy')}</span>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        אחרון
                      </Badge>
                    )}
                  </div>
                  
                  {visit.chief_complaint && (
                    <p className="text-foreground font-medium mb-1 line-clamp-1">
                      {visit.chief_complaint}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {visit.tcm_pattern && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 gap-0.5">
                        <Stethoscope className="h-2.5 w-2.5" />
                        {visit.tcm_pattern.length > 15 ? visit.tcm_pattern.slice(0, 15) + '...' : visit.tcm_pattern}
                      </Badge>
                    )}
                    {visit.points_used && visit.points_used.length > 0 && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        {visit.points_used.length} pts
                      </Badge>
                    )}
                    {visit.herbs_prescribed && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 gap-0.5">
                        <Pill className="h-2.5 w-2.5" />
                        צמחים
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
