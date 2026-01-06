import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ClipboardList, 
  Plus, 
  FileText, 
  Brain, 
  Heart, 
  Leaf, 
  Activity, 
  Shield, 
  Sun, 
  Flame,
  Sparkles,
  Upload,
  ArrowLeft,
  ExternalLink,
  Download,
  Eye,
  Stethoscope,
  MapPin
} from 'lucide-react';
import { usePatientAssessments, AssessmentType } from '@/hooks/usePatientAssessments';
import { usePatients } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuestionnaireInfo {
  id: AssessmentType;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  icon: React.ReactNode;
  path: string;
  category: 'general' | 'vitality' | 'mental' | 'physical' | 'special';
  questionCount: number;
}

const questionnaires: QuestionnaireInfo[] = [
  {
    id: 'health_compass',
    titleHe: 'מצפן הבריאות',
    titleEn: 'Health Compass',
    descriptionHe: 'שאלון בריאות כללי להערכת מצב בריאותי כולל',
    descriptionEn: 'General health questionnaire for comprehensive health assessment',
    icon: <Heart className="h-6 w-6" />,
    path: '/health-compass',
    category: 'general',
    questionCount: 15
  },
  {
    id: 'patient_questionnaire',
    titleHe: 'שאלון מטופל',
    titleEn: 'Patient Questionnaire',
    descriptionHe: 'שאלון קבלה למטופלים חדשים',
    descriptionEn: 'Intake questionnaire for new patients',
    icon: <ClipboardList className="h-6 w-6" />,
    path: '/patient-questionnaire',
    category: 'general',
    questionCount: 15
  },
  {
    id: 'internal_climate',
    titleHe: 'אקלים פנימי',
    titleEn: 'Internal Climate',
    descriptionHe: 'הערכת מזג הגוף וחום/קור פנימי',
    descriptionEn: 'Assessment of body constitution and internal heat/cold',
    icon: <Flame className="h-6 w-6" />,
    path: '/internal-climate',
    category: 'vitality',
    questionCount: 15
  },
  {
    id: 'vitality_longevity',
    titleHe: 'חיוניות ואריכות ימים',
    titleEn: 'Vitality & Longevity',
    descriptionHe: 'הערכת רמות אנרגיה וחיוניות כללית',
    descriptionEn: 'Assessment of energy levels and overall vitality',
    icon: <Sun className="h-6 w-6" />,
    path: '/vitality-longevity',
    category: 'vitality',
    questionCount: 15
  },
  {
    id: 'balance_strength_adult',
    titleHe: 'איזון וכוח - מבוגרים',
    titleEn: 'Balance & Strength - Adults',
    descriptionHe: 'שאלון בריאות הוליסטי למבוגרים',
    descriptionEn: 'Holistic health questionnaire for adults',
    icon: <Activity className="h-6 w-6" />,
    path: '/balance-strength-adult',
    category: 'physical',
    questionCount: 15
  },
  {
    id: 'golden_age_vitality',
    titleHe: 'חיוניות גיל הזהב',
    titleEn: 'Golden Age Vitality',
    descriptionHe: 'שאלון בריאות ותפקוד לגיל השלישי',
    descriptionEn: 'Health and function questionnaire for seniors',
    icon: <Sparkles className="h-6 w-6" />,
    path: '/golden-age-vitality',
    category: 'special',
    questionCount: 15
  },
  {
    id: 'longevity_dignity',
    titleHe: 'אריכות ימים בכבוד',
    titleEn: 'Longevity with Dignity',
    descriptionHe: 'שאלון חיוניות והזדקנות בריאה',
    descriptionEn: 'Vitality and healthy aging questionnaire',
    icon: <Leaf className="h-6 w-6" />,
    path: '/longevity-dignity',
    category: 'vitality',
    questionCount: 15
  },
  {
    id: 'nourishing_life',
    titleHe: 'הזנת החיים',
    titleEn: 'Nourishing Life',
    descriptionHe: 'שאלון תזונה ואורח חיים בריא',
    descriptionEn: 'Nutrition and healthy lifestyle questionnaire',
    icon: <Leaf className="h-6 w-6" />,
    path: '/nourishing-life',
    category: 'vitality',
    questionCount: 15
  },
  {
    id: 'mental_clarity',
    titleHe: 'בהירות וחוסן מנטלי',
    titleEn: 'Mental Clarity & Resilience',
    descriptionHe: 'שאלון תפקוד מנטלי ורגשי',
    descriptionEn: 'Mental and emotional function questionnaire',
    icon: <Brain className="h-6 w-6" />,
    path: '/mental-clarity',
    category: 'mental',
    questionCount: 15
  },
  {
    id: 'pain_rehabilitation',
    titleHe: 'שיקום וטיפול בכאב',
    titleEn: 'Pain Rehabilitation',
    descriptionHe: 'שאלון הערכת כאב ושיקום',
    descriptionEn: 'Pain assessment and rehabilitation questionnaire',
    icon: <Activity className="h-6 w-6" />,
    path: '/pain-rehabilitation',
    category: 'physical',
    questionCount: 15
  },
  {
    id: 'immune_shield',
    titleHe: 'חוסן חיסוני והתאוששות',
    titleEn: 'Immune Shield & Recovery',
    descriptionHe: 'שאלון מערכת חיסון והתאוששות',
    descriptionEn: 'Immune system and recovery questionnaire',
    icon: <Shield className="h-6 w-6" />,
    path: '/immune-shield',
    category: 'physical',
    questionCount: 15
  },
  {
    id: 'zang_fu_syndromes',
    titleHe: 'תסמונות זאנג-פו',
    titleEn: 'Zang Fu Syndromes',
    descriptionHe: 'שאלון אבחון ופתולוגיה של תסמונות האיברים',
    descriptionEn: 'Diagnosis & pathology questionnaire for organ syndromes',
    icon: <Stethoscope className="h-6 w-6" />,
    path: '/zang-fu-syndromes',
    category: 'special',
    questionCount: 20
  },
  {
    id: 'pulse_tongue_diagnosis',
    titleHe: 'אבחון דופק ולשון',
    titleEn: 'Pulse & Tongue Diagnosis',
    descriptionHe: 'שאלון אבחון חזותי ומישושי - דופק ולשון',
    descriptionEn: 'Visual & tactile diagnosis questionnaire for pulse and tongue',
    icon: <Eye className="h-6 w-6" />,
    path: '/pulse-tongue-diagnosis',
    category: 'special',
    questionCount: 20
  },
  {
    id: 'acupuncture_points',
    titleHe: 'ספר הנקודות',
    titleEn: 'Acupuncture Points Book',
    descriptionHe: 'שאלון מיקומים, תפקודים ואנרגטיקה של נקודות דיקור',
    descriptionEn: 'Locations, functions & energetics questionnaire for acupuncture points',
    icon: <MapPin className="h-6 w-6" />,
    path: '/acupuncture-points',
    category: 'special',
    questionCount: 20
  },
  {
    id: 'brain',
    titleHe: 'הערכת בריאות המוח',
    titleEn: 'Brain Health Assessment',
    descriptionHe: 'שאלון הערכת תפקוד קוגניטיבי ובריאות המוח',
    descriptionEn: 'Cognitive function and brain health assessment',
    icon: <Brain className="h-6 w-6" />,
    path: '/brain-assessment',
    category: 'mental',
    questionCount: 15
  },
  {
    id: 'body',
    titleHe: 'הערכת גוף מלאה',
    titleEn: 'Full Body Assessment',
    descriptionHe: 'שאלון הערכת בריאות גופנית כוללת',
    descriptionEn: 'Comprehensive physical health assessment',
    icon: <Activity className="h-6 w-6" />,
    path: '/full-body-assessment',
    category: 'physical',
    questionCount: 15
  },
  {
    id: 'retreat',
    titleHe: 'שאלון ריטריט',
    titleEn: 'Retreat Quiz',
    descriptionHe: 'שאלון הכנה לריטריט בריאות',
    descriptionEn: 'Health retreat preparation questionnaire',
    icon: <Sparkles className="h-6 w-6" />,
    path: '/retreat-quiz',
    category: 'special',
    questionCount: 15
  }
];

const categoryLabels = {
  general: { he: 'כללי', en: 'General' },
  vitality: { he: 'חיוניות', en: 'Vitality' },
  mental: { he: 'מנטלי', en: 'Mental' },
  physical: { he: 'גופני', en: 'Physical' },
  special: { he: 'מיוחד', en: 'Special' }
};

const categoryColors = {
  general: 'bg-blue-500/10 text-blue-700 border-blue-200',
  vitality: 'bg-amber-500/10 text-amber-700 border-amber-200',
  mental: 'bg-purple-500/10 text-purple-700 border-purple-200',
  physical: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  special: 'bg-rose-500/10 text-rose-700 border-rose-200'
};

export default function QuestionnaireHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'reports'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newQuestionnaire, setNewQuestionnaire] = useState({
    name: '',
    description: '',
    questions: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: assessments } = usePatientAssessments(selectedPatient || undefined);

  const handleUploadToRAG = async () => {
    if (!selectedPatient || !assessments?.length) {
      toast.error('אנא בחר מטופל עם שאלונים שמורים');
      return;
    }

    setIsUploading(true);
    try {
      const patient = patients?.find(p => p.id === selectedPatient);
      const reportContent = generateReportContent(assessments, patient);
      
      // Create a document for the knowledge base
      const { error } = await supabase
        .from('knowledge_chunks')
        .insert({
          document_id: crypto.randomUUID(),
          chunk_index: 0,
          content: reportContent,
          content_type: 'assessment_report',
          language: 'he',
          metadata: {
            patient_id: selectedPatient,
            patient_name: patient?.full_name,
            assessment_count: assessments.length,
            created_at: new Date().toISOString()
          }
        });

      if (error) throw error;
      toast.success('הדוח הועלה בהצלחה למאגר הידע');
    } catch (error) {
      console.error('Error uploading to RAG:', error);
      toast.error('שגיאה בהעלאת הדוח');
    } finally {
      setIsUploading(false);
    }
  };

  const generateReportContent = (assessments: any[], patient: any) => {
    let content = `# דוח שאלונים - ${patient?.full_name || 'לא ידוע'}\n\n`;
    content += `תאריך: ${new Date().toLocaleDateString('he-IL')}\n\n`;
    
    assessments.forEach((assessment, index) => {
      const questionnaire = questionnaires.find(q => q.id === assessment.assessment_type);
      content += `## ${index + 1}. ${questionnaire?.titleHe || assessment.assessment_type}\n`;
      content += `סטטוס: ${assessment.status}\n`;
      content += `ציון: ${assessment.score || 'לא זמין'}\n`;
      content += `סיכום: ${assessment.summary || 'לא זמין'}\n`;
      
      if (assessment.details) {
        content += `\n### תשובות:\n`;
        const details = typeof assessment.details === 'object' ? assessment.details : {};
        Object.entries(details).forEach(([key, value], qIndex) => {
          content += `${qIndex + 1}. ${key}: ${value}\n`;
        });
      }
      content += '\n---\n\n';
    });
    
    return content;
  };

  const handleAddQuestionnaire = async () => {
    if (!newQuestionnaire.name || !newQuestionnaire.questions) {
      toast.error('אנא מלא את כל השדות הנדרשים');
      return;
    }

    // Parse questions and save to knowledge base for future implementation
    toast.success('השאלון נוסף בהצלחה! (פונקציונליות מלאה בפיתוח)');
    setShowAddDialog(false);
    setNewQuestionnaire({ name: '', description: '', questions: '' });
  };

  const groupedQuestionnaires = questionnaires.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, QuestionnaireInfo[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">מרכז השאלונים</h1>
              <p className="text-sm text-muted-foreground">Questionnaire Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר מטופל" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף שאלון
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle>הוספת שאלון חדש</DialogTitle>
                  <DialogDescription>
                    הזן את פרטי השאלון החדש. השאלות יתווספו למערכת.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name">שם השאלון</Label>
                    <Input
                      id="name"
                      value={newQuestionnaire.name}
                      onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="למשל: שאלון בריאות העור"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">תיאור</Label>
                    <Input
                      id="description"
                      value={newQuestionnaire.description}
                      onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="תיאור קצר של השאלון"
                    />
                  </div>
                  <div>
                    <Label htmlFor="questions">שאלות (שאלה בכל שורה)</Label>
                    <Textarea
                      id="questions"
                      value={newQuestionnaire.questions}
                      onChange={(e) => setNewQuestionnaire(prev => ({ ...prev, questions: e.target.value }))}
                      placeholder="האם את/ה סובל/ת מ...&#10;כיצד את/ה מרגיש/ה כאשר...&#10;מהי תדירות..."
                      rows={10}
                    />
                  </div>
                  <Button onClick={handleAddQuestionnaire} className="w-full">
                    שמור שאלון
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="all" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              כל השאלונים
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              דוחות מלאים
            </TabsTrigger>
          </TabsList>

          {/* All Questionnaires Tab */}
          <TabsContent value="all" className="space-y-8">
            {Object.entries(groupedQuestionnaires).map(([category, items]) => (
              <motion.section
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                    {categoryLabels[category as keyof typeof categoryLabels].he}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({items.length} שאלונים)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full"
                            onClick={() => navigate(q.path)}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {q.icon}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {q.questionCount} שאלות
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mt-3">{q.titleHe}</CardTitle>
                          <p className="text-xs text-muted-foreground">{q.titleEn}</p>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-sm">
                            {q.descriptionHe}
                          </CardDescription>
                          <div className="mt-4 flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>התחל שאלון</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  דוח שאלונים מלא
                </CardTitle>
                <CardDescription>
                  בחר מטופל לצפייה בכל השאלונים שלו עם מספור שורות מלא
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPatient ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>בחר מטופל מהתפריט למעלה כדי לראות את הדוחות</p>
                  </div>
                ) : !assessments?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>אין שאלונים שמורים למטופל זה</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('all')}>
                      התחל שאלון חדש
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end border-b pb-4">
                      <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        הורד PDF
                      </Button>
                      <Button 
                        className="gap-2" 
                        onClick={handleUploadToRAG}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? 'מעלה...' : 'העלה ל-RAG'}
                      </Button>
                    </div>

                    {/* Full Report */}
                    <ScrollArea className="h-[600px] rounded-lg border p-4">
                      <div className="space-y-8">
                        {assessments.map((assessment, aIndex) => {
                          const questionnaire = questionnaires.find(q => q.id === assessment.assessment_type);
                          const details = typeof assessment.details === 'object' ? assessment.details as Record<string, string> : {};
                          
                          return (
                            <motion.div
                              key={assessment.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: aIndex * 0.1 }}
                              className="border-b pb-6 last:border-0"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                  {aIndex + 1}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {questionnaire?.titleHe || assessment.assessment_type}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(assessment.created_at).toLocaleDateString('he-IL')} | 
                                    סטטוס: {assessment.status} | 
                                    ציון: {assessment.score || 'לא זמין'}
                                  </p>
                                </div>
                              </div>
                              
                              {assessment.summary && (
                                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                                  <p className="text-sm font-medium">סיכום:</p>
                                  <p className="text-sm text-muted-foreground">{assessment.summary}</p>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <p className="text-sm font-medium mb-2">תשובות:</p>
                                {Object.entries(details).length > 0 ? (
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-right py-2 w-12">#</th>
                                        <th className="text-right py-2">שאלה</th>
                                        <th className="text-right py-2">תשובה</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(details).map(([key, value], qIndex) => (
                                        <tr key={key} className="border-b last:border-0">
                                          <td className="py-2 text-muted-foreground">{aIndex + 1}.{qIndex + 1}</td>
                                          <td className="py-2 font-medium">{key}</td>
                                          <td className="py-2 text-muted-foreground">{String(value)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">אין תשובות זמינות</p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{assessments.length}</p>
                        <p className="text-sm text-muted-foreground">שאלונים</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {assessments.reduce((sum, a) => sum + Object.keys(typeof a.details === 'object' ? a.details : {}).length, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">תשובות</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {assessments.filter(a => a.status === 'completed').length}
                        </p>
                        <p className="text-sm text-muted-foreground">הושלמו</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
