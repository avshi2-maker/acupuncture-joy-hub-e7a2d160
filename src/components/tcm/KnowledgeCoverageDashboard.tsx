import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  PieChart, 
  Database, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  BarChart3
} from 'lucide-react';

// Expected knowledge categories with minimum document thresholds
const KNOWLEDGE_CATEGORIES = [
  { id: 'tongue-diagnosis', label: 'Tongue Diagnosis', emoji: '👅', minDocs: 1 },
  { id: 'pulse-diagnosis', label: 'Pulse Diagnosis', emoji: '💓', minDocs: 1 },
  { id: 'diet-nutrition', label: 'Diet & Nutrition', emoji: '🍎', minDocs: 1 },
  { id: 'chronic-pain', label: 'Chronic Pain', emoji: '💪', minDocs: 1 },
  { id: 'digestive', label: 'Digestive Disorders', emoji: '🫃', minDocs: 1 },
  { id: 'immune', label: 'Immune Resilience', emoji: '🛡️', minDocs: 1 },
  { id: 'mental-health', label: 'Mental Health', emoji: '🧠', minDocs: 1 },
  { id: 'pediatric', label: 'Pediatric', emoji: '👶', minDocs: 1 },
  { id: 'sport-performance', label: 'Sport Performance', emoji: '🏃', minDocs: 1 },
  { id: 'womens-health', label: "Women's Health", emoji: '♀️', minDocs: 1 },
  { id: 'work-stress', label: 'Work Stress', emoji: '💼', minDocs: 1 },
  { id: 'extreme-weather', label: 'Climate/Weather', emoji: '🌡️', minDocs: 1 },
  { id: 'skin-disease', label: 'Skin Disease', emoji: '🩹', minDocs: 1 },
];

interface CategoryStats {
  category: string;
  documentCount: number;
  chunkCount: number;
}

interface QueryStats {
  totalQueries: number;
  avgChunksFound: number;
  externalAIPercent: number;
  recentQueries: Array<{
    query_text: string;
    chunks_found: number;
    created_at: string;
  }>;
}

export function KnowledgeCoverageDashboard() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch document stats by category
      const { data: docs } = await supabase
        .from('knowledge_documents')
        .select('id, category, file_name')
        .eq('status', 'indexed');

      // Fetch chunk counts
      const { count: chunkCount } = await supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true });

      // Fetch recent query logs
      const { data: queryLogs } = await supabase
        .from('rag_query_logs')
        .select('query_text, chunks_found, sources_used, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate category stats
      const catMap = new Map<string, { docs: number; chunks: number }>();
      
      if (docs) {
        docs.forEach(doc => {
          const cat = doc.category || 'general';
          const existing = catMap.get(cat) || { docs: 0, chunks: 0 };
          existing.docs += 1;
          catMap.set(cat, existing);
        });
        setTotalDocs(docs.length);
      }

      setTotalChunks(chunkCount || 0);

      // Convert to array
      const statsArray: CategoryStats[] = [];
      catMap.forEach((val, key) => {
        statsArray.push({
          category: key,
          documentCount: val.docs,
          chunkCount: val.chunks,
        });
      });
      setCategoryStats(statsArray);

      // Calculate query stats
      if (queryLogs && queryLogs.length > 0) {
        const totalQueries = queryLogs.length;
        const avgChunks = queryLogs.reduce((sum, q) => sum + (q.chunks_found || 0), 0) / totalQueries;
        const externalCount = queryLogs.filter(q => {
          const sources = q.sources_used as any[];
          return sources?.some(s => s?.type === 'external_ai');
        }).length;

        setQueryStats({
          totalQueries,
          avgChunksFound: Math.round(avgChunks * 10) / 10,
          externalAIPercent: Math.round((externalCount / totalQueries) * 100),
          recentQueries: queryLogs.slice(0, 5).map(q => ({
            query_text: q.query_text,
            chunks_found: q.chunks_found || 0,
            created_at: q.created_at,
          })),
        });
      }
    } catch (err) {
      console.error('Failed to fetch coverage stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall coverage
  const minRequired = KNOWLEDGE_CATEGORIES.length;
  const categoriesCovered = categoryStats.filter(c => c.documentCount > 0).length;
  const coveragePercent = Math.min(100, Math.round((categoriesCovered / minRequired) * 100));

  const coverageStatus = coveragePercent >= 100
    ? { color: 'text-green-600', bg: 'bg-green-500/10', label: 'Full Coverage' }
    : coveragePercent >= 70
      ? { color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Partial Coverage' }
      : { color: 'text-red-600', bg: 'bg-red-500/10', label: 'Low Coverage' };

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading coverage data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Main Coverage Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              <span>Knowledge Coverage Dashboard</span>
            </div>
            <Badge variant="outline" className={`${coverageStatus.color} ${coverageStatus.bg}`}>
              {coverageStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <Database className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{totalDocs}</p>
              <p className="text-[10px] text-muted-foreground">Documents</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
              <FileText className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-lg font-bold">{totalChunks}</p>
              <p className="text-[10px] text-muted-foreground">Chunks</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-lg font-bold">{categoriesCovered}/{minRequired}</p>
              <p className="text-[10px] text-muted-foreground">Categories</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <p className="text-lg font-bold">{coveragePercent}%</p>
              <p className="text-[10px] text-muted-foreground">Coverage</p>
            </div>
          </div>

          {/* Coverage Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall Knowledge Coverage</span>
              <span className={`font-medium ${coverageStatus.color}`}>{coveragePercent}%</span>
            </div>
            <Progress value={coveragePercent} className="h-3" />
          </div>

          {/* Category Breakdown */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Category Coverage</p>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {KNOWLEDGE_CATEGORIES.map(cat => {
                  const stat = categoryStats.find(s => 
                    s.category.toLowerCase().includes(cat.id.split('-')[0])
                  );
                  const docCount = stat?.documentCount || 0;
                  const hasCoverage = docCount > 0;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        hasCoverage 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat.emoji}</span>
                        <span className="text-xs">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${hasCoverage ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {docCount} docs
                        </Badge>
                        {hasCoverage ? (
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Query Statistics Card */}
      {queryStats && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-primary" />
              Query Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-background border text-center">
                <Search className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{queryStats.totalQueries}</p>
                <p className="text-[10px] text-muted-foreground">Total Queries</p>
              </div>
              <div className="p-3 rounded-lg bg-background border text-center">
                <FileText className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <p className="text-lg font-bold">{queryStats.avgChunksFound}</p>
                <p className="text-[10px] text-muted-foreground">Avg Chunks/Query</p>
              </div>
              <div className="p-3 rounded-lg bg-background border text-center">
                <AlertTriangle className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                <p className="text-lg font-bold">{queryStats.externalAIPercent}%</p>
                <p className="text-[10px] text-muted-foreground">External AI</p>
              </div>
            </div>

            {/* Recent Queries */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Queries</p>
              <div className="space-y-1">
                {queryStats.recentQueries.map((q, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                  >
                    <span className="truncate max-w-[200px]">{q.query_text}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${q.chunks_found > 0 ? 'text-green-600' : 'text-amber-600'}`}
                    >
                      {q.chunks_found} chunks
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
