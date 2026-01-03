import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, AlertTriangle, Database, FileText, Shield, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// All knowledge documents indexed in the RAG system (auto-generated from database)
const EXPECTED_KNOWLEDGE_FILES = [
  // Acupuncture Points
  { name: 'acupuncture-points-sapir-guide.pdf', aliases: ['acupuncture_points', 'points_categories'] },
  
  // Anxiety & Mental Health
  { name: 'mental-health-tcm.csv', aliases: ['mental-health', 'mental'] },
  { name: 'tcm_teenage_mental_health_qa.csv', aliases: ['teenage_mental', 'teen_mental'] },
  
  // Brain Health
  { name: 'brain-health-tcm.csv', aliases: ['brain-health', 'brain'] },
  
  // Clinic Intake
  { name: 'clinic_allergies_intake_form.csv', aliases: ['allergies_intake', 'allergies'] },
  { name: 'clinic_medications_supplements_intake.csv', aliases: ['medications_intake', 'supplements'] },
  
  // Clinical Protocols
  { name: 'CAF_Master_Studies.csv', aliases: ['caf_master', 'caf', 'ferrari'] },
  { name: 'chronic-pain-management.csv', aliases: ['chronic-pain', 'pain'] },
  
  // Clinical QA
  { name: 'QA_Professional_Corrected_4Columns.csv', aliases: ['qa_professional', 'professional_qa'] },
  
  // Crisis & Emergency
  { name: 'Profound_Crisis_QA_100_Complete.csv', aliases: ['crisis', 'profound_crisis', 'emergency'] },
  
  // Dermatology
  { name: 'skin_disease_qa_100.csv', aliases: ['skin_disease', 'skin'] },
  { name: 'tcm_renovada_skin_renewal_100qa.csv', aliases: ['skin_renewal', 'renovada'] },
  
  // Digestive
  { name: 'Gastric_Conditions.csv', aliases: ['gastric', 'stomach', 'esophagus'] },
  { name: 'digestive-disorders.csv', aliases: ['digestive'] },
  
  // Energy Channels
  { name: 'energy-channels-100-qa.csv', aliases: ['energy_channels', 'channels'] },
  
  // Environmental Health
  { name: 'extreme_weather_climate_conditions_qa_100.csv', aliases: ['extreme_weather', 'climate', 'weather'] },
  
  // General Health
  { name: 'Age_Prompts_Adults.csv', aliases: ['age_prompts', 'adults_18_50'] },
  { name: 'chief-complaints-tcm.csv', aliases: ['chief_complaints', 'complaints', 'chief'] },
  
  // Geriatric
  { name: 'adults_50_70.csv', aliases: ['adults_50_70', 'middle_age'] },
  { name: 'elderly_lifestyle_recommendations.csv', aliases: ['elderly_lifestyle', 'elderly'] },
  { name: 'tcm_elderly_70-120_qa_50.csv', aliases: ['elderly_70_120', 'seniors'] },
  
  // Herbal Medicine
  { name: 'herbal_200_formula.csv', aliases: ['herbal_200', 'herbal_formula'] },
  { name: 'Herbal_Formulas.csv', aliases: ['herbal_formulas', 'formulas'] },
  
  // Neurology
  { name: 'Vagus_Nerve_QA.csv', aliases: ['vagus_nerve', 'vagus', 'vagal'] },
  { name: 'neuro-degenerative-tcm-100.csv', aliases: ['neuro_degenerative', 'neurodegenerative'] },
  
  // Nutrition
  { name: 'NUTRITION.csv', aliases: ['nutrition'] },
  
  // Pediatric
  { name: 'tcm_children_7-13_qa_50.csv', aliases: ['children_7_13', 'children'] },
  { name: 'pediatric-acupuncture.csv', aliases: ['pediatric', 'pediatric_acupuncture'] },
  { name: 'Pediatric_QA_with_acupuncture_points.csv', aliases: ['pediatric_qa', 'pediatric_points'] },
  
  // Safety Warnings
  { name: 'acupuncture_point_warnings_comprehensive.csv', aliases: ['point_warnings', 'warnings', 'safety'] },
  
  // TCM Constitution
  { name: 'nine_constitutions_qa_100.csv', aliases: ['nine_constitutions', 'constitution', 'constitutions'] },
  
  // TCM Diagnosis
  { name: 'clinic_pulse_diagnosis_reference.csv', aliases: ['pulse_diagnosis', 'pulse'] },
  { name: 'clinic_tongue_diagnosis_reference.csv', aliases: ['tongue_diagnosis', 'tongue'] },
  { name: 'Diagnostics_Professional_Corrected_4Columns.csv', aliases: ['diagnostics_professional', 'diagnostics'] },
  { name: 'Four_Examinations_Si_Zhen.csv', aliases: ['four_examinations', 'si_zhen'] },
  { name: 'pulse_and_tongue_diagnosis-2.pdf', aliases: ['pulse_tongue_pdf'] },
  
  // TCM Theory
  { name: 'pulse-diagnosis.csv', aliases: ['pulse_qa'] },
  { name: 'tcm_adults_18-50_qa_50_enhanced.csv', aliases: ['adults_18_50_enhanced'] },
  { name: 'tcm_clinic_diet_nutrition_intake_form.csv', aliases: ['diet_nutrition', 'diet'] },
  { name: 'tcm_newborn_qa_50.csv', aliases: ['newborn', 'infants'] },
  { name: 'tcm_toddlers_1-3_qa_50.csv', aliases: ['toddlers_1_3', 'toddlers'] },
  { name: 'tcm_young_children_4-6_qa_50.csv', aliases: ['young_children_4_6'] },
  { name: 'tongue-diagnosis.csv', aliases: ['tongue_qa'] },
  { name: 'Zang_Fu_Organs_100_QA.csv', aliases: ['zang_fu', 'organs'] },
  
  // TCM Training
  { name: 'TCM_Training_Syllabus_250_QA.csv', aliases: ['training_syllabus', 'syllabus'] },
  
  // Treatment Planning
  { name: 'Treatment_Planning_Professional_Corrected_4Columns.csv', aliases: ['treatment_planning', 'treatment'] },
  
  // Wellness & Lifestyle
  { name: 'immune-resilience-tcm.csv', aliases: ['immune', 'resilience'] },
  { name: 'sport-performance-recovery.csv', aliases: ['sport_performance', 'sport'] },
  { name: 'womens-health-tcm.csv', aliases: ['womens_health', 'women'] },
  { name: 'Work_Stress_Burnout_TCM_QA.csv', aliases: ['work_stress', 'burnout', 'stress'] },
  
  // Dr. Zanfu Syndromes & Clinical
  { name: 'dr-zanfu-clinic-syndromes.csv', aliases: ['zanfu_clinic', 'clinic_syndromes', 'trigger_points'] },
  { name: 'dr-zanfu-syndromes-qa.csv', aliases: ['zanfu_syndromes', 'syndromes_qa'] },
];

interface RAGVerificationPanelProps {
  showQueryLogs?: boolean;
}

export function RAGVerificationPanel({ showQueryLogs = false }: RAGVerificationPanelProps) {
  // Fetch indexed documents
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['rag-verification-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('id, file_name, original_name, status, row_count, category, indexed_at')
        .eq('status', 'indexed')
        .order('indexed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch chunk stats
  const { data: chunkStats } = useQuery({
    queryKey: ['rag-verification-chunks'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return { total: count || 0 };
    },
  });

  // Fetch recent query logs (if admin)
  const { data: queryLogs } = useQuery({
    queryKey: ['rag-query-logs'],
    enabled: showQueryLogs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rag_query_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Check which expected files are indexed
  const indexedFileNames = new Set(
    documents?.map(d => d.file_name.toLowerCase().replace(/[^a-z0-9.]/g, '-')) || []
  );
  const indexedOriginalNames = new Set(
    documents?.map(d => d.original_name?.toLowerCase()) || []
  );

  const verificationStatus = EXPECTED_KNOWLEDGE_FILES.map(fileConfig => {
    const normalizedName = fileConfig.name.toLowerCase();
    const aliases = fileConfig.aliases.map(a => a.toLowerCase());
    
    // Check if any alias or the main name matches indexed files
    const isIndexed = indexedFileNames.has(normalizedName) || 
      indexedOriginalNames.has(normalizedName) ||
      Array.from(indexedFileNames).some(f => f.includes(normalizedName.replace('.csv', ''))) ||
      Array.from(indexedOriginalNames).some(f => f?.includes(normalizedName.replace('.csv', ''))) ||
      aliases.some(alias => 
        Array.from(indexedFileNames).some(f => f.includes(alias)) ||
        Array.from(indexedOriginalNames).some(f => f?.includes(alias))
      );
    
    const doc = documents?.find(d => 
      d.file_name.toLowerCase().includes(normalizedName.replace('.csv', '')) ||
      d.original_name?.toLowerCase().includes(normalizedName.replace('.csv', '')) ||
      aliases.some(alias => 
        d.file_name.toLowerCase().includes(alias) ||
        d.original_name?.toLowerCase().includes(alias)
      )
    );
    
    return {
      fileName: fileConfig.name,
      isIndexed,
      document: doc,
    };
  });

  const indexedCount = verificationStatus.filter(s => s.isIndexed).length;
  const totalExpected = EXPECTED_KNOWLEDGE_FILES.length;
  const allIndexed = indexedCount === totalExpected;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                RAG Knowledge Verification
              </CardTitle>
              <CardDescription>
                Verify all proprietary CSV files are indexed in the AI search system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link to="/knowledge-registry">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Knowledge Registry
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{documents?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Documents Indexed</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{chunkStats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">Total Chunks</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{indexedCount}/{totalExpected}</div>
              <div className="text-xs text-muted-foreground">Expected Files</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${allIndexed ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
              {allIndexed ? (
                <CheckCircle2 className="w-6 h-6 mx-auto text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 mx-auto text-amber-600" />
              )}
              <div className="text-xs mt-1">{allIndexed ? 'All Indexed' : 'Missing Files'}</div>
            </div>
          </div>

          {/* Verification Table */}
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected File</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Indexed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationStatus.map((item) => (
                  <TableRow key={item.fileName}>
                    <TableCell>
                      {item.isIndexed ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Indexed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.fileName}</TableCell>
                    <TableCell>{item.document?.row_count || '-'}</TableCell>
                    <TableCell>{item.document?.category || '-'}</TableCell>
                    <TableCell className="text-xs">
                      {item.document?.indexed_at 
                        ? format(new Date(item.document.indexed_at), 'MMM d, yyyy HH:mm')
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {!allIndexed && (
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-600 font-medium mb-1">
                <AlertTriangle className="w-4 h-4" />
                Action Required
              </div>
              <p className="text-sm text-muted-foreground">
                Some expected knowledge files are not indexed. Go to{' '}
                <Link to="/knowledge-registry" className="text-primary underline">
                  Knowledge Registry
                </Link>{' '}
                to import them.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Logs (for admin view) */}
      {showQueryLogs && queryLogs && queryLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5" />
              Recent RAG Query Audit Log
            </CardTitle>
            <CardDescription>
              All AI queries with source tracking for legal compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Chunks Found</TableHead>
                    <TableHead>Sources Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queryLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {log.query_text}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.chunks_found}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {Array.isArray(log.sources_used) 
                          ? log.sources_used.slice(0, 3).map((s: any) => s.fileName).join(', ')
                          : '-'
                        }
                        {Array.isArray(log.sources_used) && log.sources_used.length > 3 && (
                          <span className="text-muted-foreground"> +{log.sources_used.length - 3} more</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}