import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Brain,
  Languages,
  Database,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HebrewQAItem {
  id: string;
  question: string;
  answer: string;
  acupoints: string | null;
  formula: string | null;
  documentName: string;
  category: string;
}

const RAGHebrewReport: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HebrewQAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalChunks: 0,
    uniqueQuestions: 0,
    documentsWithHebrew: 0,
    categories: [] as string[]
  });

  useEffect(() => {
    fetchHebrewContent();
  }, []);

  const fetchHebrewContent = async () => {
    try {
      setLoading(true);
      
      // Fetch Hebrew Q&A items
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select(`
          id,
          question,
          answer,
          metadata,
          document_id,
          knowledge_documents!inner(original_name, category)
        `)
        .not('question', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for Hebrew content
      const hebrewItems = data?.filter(item => {
        const answer = item.answer || '';
        const question = item.question || '';
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(answer) || hebrewPattern.test(question);
      }) || [];

      // Transform data
      const transformedItems: HebrewQAItem[] = hebrewItems.map(item => ({
        id: item.id,
        question: item.question || '',
        answer: item.answer || '',
        acupoints: (item.metadata as any)?.Acupuncture_Points || null,
        formula: (item.metadata as any)?.Pharmacopeia || null,
        documentName: (item.knowledge_documents as any)?.original_name || 'Unknown',
        category: (item.knowledge_documents as any)?.category || 'general'
      }));

      setItems(transformedItems);

      // Calculate stats
      const uniqueCategories = [...new Set(transformedItems.map(i => i.category))];
      const uniqueDocs = [...new Set(transformedItems.map(i => i.documentName))];
      
      setStats({
        totalChunks: transformedItems.length,
        uniqueQuestions: new Set(transformedItems.map(i => i.question)).size,
        documentsWithHebrew: uniqueDocs.length,
        categories: uniqueCategories
      });

    } catch (error) {
      console.error('Error fetching Hebrew content:', error);
      toast.error('שגיאה בטעינת התוכן העברי');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.question.toLowerCase().includes(searchLower) ||
      item.answer.toLowerCase().includes(searchLower) ||
      (item.acupoints?.toLowerCase().includes(searchLower)) ||
      item.documentName.toLowerCase().includes(searchLower)
    );
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredItems.map(i => i.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const exportToCSV = () => {
    const headers = ['#', 'שאלה', 'תשובה', 'נקודות דיקור', 'נוסחה', 'מקור', 'קטגוריה'];
    const rows = filteredItems.map((item, idx) => [
      idx + 1,
      `"${item.question.replace(/"/g, '""')}"`,
      `"${item.answer.replace(/"/g, '""')}"`,
      `"${item.acupoints || ''}"`,
      `"${item.formula || ''}"`,
      `"${item.documentName}"`,
      `"${item.category}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAG_Hebrew_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('הקובץ הורד בהצלחה');
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'tcm_theory': 'תיאוריית TCM',
      'clinical_protocols': 'פרוטוקולים קליניים',
      'tcm_diagnosis': 'אבחון TCM',
      'womens_health': 'בריאות האישה',
      'neurology': 'נוירולוגיה',
      'pediatric': 'ילדים',
      'geriatric': 'קשישים',
      'dermatology': 'דרמטולוגיה',
      'digestive': 'מערכת עיכול',
      'anxiety_mental': 'חרדה ובריאות נפש',
      'oncology': 'אונקולוגיה',
      'general': 'כללי'
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'tcm_theory': 'bg-blue-500/20 text-blue-400',
      'clinical_protocols': 'bg-green-500/20 text-green-400',
      'tcm_diagnosis': 'bg-purple-500/20 text-purple-400',
      'womens_health': 'bg-pink-500/20 text-pink-400',
      'neurology': 'bg-cyan-500/20 text-cyan-400',
      'pediatric': 'bg-orange-500/20 text-orange-400',
      'geriatric': 'bg-amber-500/20 text-amber-400',
      'dermatology': 'bg-rose-500/20 text-rose-400',
      'digestive': 'bg-lime-500/20 text-lime-400',
      'anxiety_mental': 'bg-violet-500/20 text-violet-400',
      'oncology': 'bg-red-500/20 text-red-400',
      'general': 'bg-gray-500/20 text-gray-400'
    };
    return colors[cat] || colors.general;
  };

  return (
    <>
      <Helmet>
        <title>דוח שאלות עבריות ב-RAG | TCM Brain</title>
        <meta name="description" content="דוח מפורט של כל השאלות והתשובות בעברית במאגר הידע של TCM Brain" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Languages className="h-8 w-8 text-primary" />
                  דוח שאלות עבריות במאגר RAG
                </h1>
                <p className="text-muted-foreground mt-1">
                  כל התוכן העברי הנוכחי במאגר הידע - {new Date().toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>

            <Button onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              ייצוא ל-CSV
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{stats.totalChunks}</div>
                <div className="text-sm text-muted-foreground">פריטים עבריים</div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-500">{stats.uniqueQuestions}</div>
                <div className="text-sm text-muted-foreground">שאלות ייחודיות</div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-500">{stats.documentsWithHebrew}</div>
                <div className="text-sm text-muted-foreground">מסמכי מקור</div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-500">{stats.categories.length}</div>
                <div className="text-sm text-muted-foreground">קטגוריות</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search & Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="חיפוש בשאלות, תשובות, נקודות..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={expandAll}>
                      <ChevronDown className="h-4 w-4 ml-1" />
                      הרחב הכל
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>
                      <ChevronUp className="h-4 w-4 ml-1" />
                      כווץ הכל
                    </Button>
                  </div>
                </div>

                {searchTerm && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    נמצאו {filteredItems.length} תוצאות עבור "{searchTerm}"
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Content List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  רשימת שאלות ותשובות עבריות ({filteredItems.length})
                </CardTitle>
                <CardDescription>
                  לחץ על כל שורה לצפייה בתשובה המלאה
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {filteredItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            <Collapsible
                              open={expandedItems.has(item.id)}
                              onOpenChange={() => toggleExpanded(item.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="w-full cursor-pointer rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-all p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                          #{index + 1}
                                        </Badge>
                                        <Badge className={getCategoryColor(item.category)}>
                                          {getCategoryLabel(item.category)}
                                        </Badge>
                                        {item.acupoints && (
                                          <Badge variant="secondary" className="text-xs">
                                            נקודות: {item.acupoints.split(',').length}
                                          </Badge>
                                        )}
                                      </div>
                                      <h3 className="font-medium text-foreground text-right line-clamp-2">
                                        {item.question}
                                      </h3>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        מקור: {item.documentName}
                                      </p>
                                    </div>
                                    <div className="shrink-0">
                                      {expandedItems.has(item.id) ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 mr-4 p-4 rounded-lg bg-muted/30 border border-border/30"
                                >
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-primary mb-2">תשובה:</h4>
                                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {item.answer}
                                      </p>
                                    </div>

                                    {item.acupoints && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-green-500 mb-2">נקודות דיקור:</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {item.acupoints.split(',').map((point, i) => (
                                            <Badge 
                                              key={i} 
                                              variant="outline" 
                                              className="text-xs bg-green-500/10 text-green-400 border-green-500/30"
                                            >
                                              {point.trim()}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {item.formula && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-amber-500 mb-2">נוסחת צמחים:</h4>
                                        <p className="text-sm text-foreground/80">{item.formula}</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </CollapsibleContent>
                            </Collapsible>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-20 text-muted-foreground">
                          <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>לא נמצאו תוצאות</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>סיכום לפי קטגוריה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right p-3 font-semibold">קטגוריה</th>
                        <th className="text-center p-3 font-semibold">מספר פריטים</th>
                        <th className="text-center p-3 font-semibold">אחוז</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.categories.map(cat => {
                        const count = items.filter(i => i.category === cat).length;
                        const percent = ((count / items.length) * 100).toFixed(1);
                        return (
                          <tr key={cat} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-3">
                              <Badge className={getCategoryColor(cat)}>
                                {getCategoryLabel(cat)}
                              </Badge>
                            </td>
                            <td className="text-center p-3 font-mono">{count}</td>
                            <td className="text-center p-3">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-muted-foreground">{percent}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RAGHebrewReport;
