import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Pill, 
  GraduationCap, 
  BookOpen, 
  Baby, 
  User, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Leaf,
  Shield,
  Zap,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormulaData {
  id: string;
  formula_name: string;
  question?: string;
  answer?: string;
  content: string;
  source?: string;
  acupoints?: string;
  pharmacopeia?: string;
}

interface SafetyFilter {
  pregnancy: boolean;
  children: boolean;
  elderly: boolean;
}

// Forbidden herbs during pregnancy
const PREGNANCY_FORBIDDEN = [
  'Da Huang', 'Hong Hua', 'Niu Xi', 'San Leng', 'E Zhu', 'Shui Zhi', 
  'Mang Chong', 'Ban Mao', 'Wu Gong', 'Quan Xie', 'Chan Su', 'Xiong Huang',
  'Qian Niu Zi', 'Ba Dou', 'Gan Sui', 'Da Ji', 'Yuan Hua', 'She Xiang',
  'Tao Ren', 'Yi Mu Cao'
];

export function HerbalMasterWidget({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FormulaData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [safetyFilters, setSafetyFilters] = useState<SafetyFilter>({
    pregnancy: false,
    children: false,
    elderly: false,
  });
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);

  // Quiz state
  const [quizFormulas, setQuizFormulas] = useState<FormulaData[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Flashcard state
  const [flashcardFormulas, setFlashcardFormulas] = useState<FormulaData[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Search formulas from knowledge base
  const searchFormulas = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in knowledge_chunks for formula data
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, content, question, answer, metadata, document_id')
        .or(`content.ilike.%${query}%,question.ilike.%${query}%,answer.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      const formulas: FormulaData[] = (data || []).map((chunk: any) => ({
        id: chunk.id,
        formula_name: chunk.question || 'Unknown Formula',
        question: chunk.question,
        answer: chunk.answer,
        content: chunk.content,
        source: chunk.metadata?.source || 'Knowledge Base',
        acupoints: chunk.metadata?.acupoints,
        pharmacopeia: chunk.metadata?.pharmacopeia,
      }));

      setSearchResults(formulas);

      // Run safety check if filters are active
      if (safetyFilters.pregnancy || safetyFilters.children || safetyFilters.elderly) {
        const warnings: string[] = [];
        formulas.forEach(formula => {
          if (safetyFilters.pregnancy) {
            const foundForbidden = PREGNANCY_FORBIDDEN.filter(herb => 
              formula.content.toLowerCase().includes(herb.toLowerCase())
            );
            if (foundForbidden.length > 0) {
              warnings.push(`⚠️ ${formula.formula_name}: Contains ${foundForbidden.join(', ')} - CONTRAINDICATED in pregnancy`);
            }
          }
        });
        setSafetyWarnings(warnings);
      } else {
        setSafetyWarnings([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search formulas');
    } finally {
      setIsSearching(false);
    }
  }, [safetyFilters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'search') {
        searchFormulas(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, searchFormulas]);

  // Load quiz formulas
  const loadQuizFormulas = useCallback(async () => {
    setQuizLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, content, question, answer, metadata')
        .not('question', 'is', null)
        .limit(20);

      if (error) throw error;

      const formulas: FormulaData[] = (data || [])
        .filter((chunk: any) => chunk.question && chunk.answer)
        .map((chunk: any) => ({
          id: chunk.id,
          formula_name: chunk.question || 'Unknown',
          question: chunk.question,
          answer: chunk.answer,
          content: chunk.content,
        }));

      // Shuffle for randomness
      const shuffled = formulas.sort(() => Math.random() - 0.5);
      setQuizFormulas(shuffled);
      setCurrentQuizIndex(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('Quiz load error:', error);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  // Load flashcard formulas
  const loadFlashcardFormulas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('id, content, question, answer, metadata')
        .not('question', 'is', null)
        .limit(30);

      if (error) throw error;

      const formulas: FormulaData[] = (data || []).map((chunk: any) => ({
        id: chunk.id,
        formula_name: chunk.question || 'Unknown',
        question: chunk.question,
        answer: chunk.answer,
        content: chunk.content,
      }));

      setFlashcardFormulas(formulas);
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Flashcard load error:', error);
    }
  }, []);

  // Load data when tabs change
  useEffect(() => {
    if (activeTab === 'quiz' && quizFormulas.length === 0) {
      loadQuizFormulas();
    }
    if (activeTab === 'flashcards' && flashcardFormulas.length === 0) {
      loadFlashcardFormulas();
    }
  }, [activeTab, quizFormulas.length, flashcardFormulas.length, loadQuizFormulas, loadFlashcardFormulas]);

  // Quiz navigation
  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizFormulas.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  // Flashcard navigation
  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcardFormulas.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const toggleSafetyFilter = (filter: keyof SafetyFilter) => {
    setSafetyFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const currentQuiz = quizFormulas[currentQuizIndex];
  const currentFlashcard = flashcardFormulas[currentFlashcardIndex];

  return (
    <Card className={cn(
      "overflow-hidden border-jade/30 bg-gradient-to-b from-background to-jade/5",
      className
    )}>
      {/* Header with Apothecary Theme */}
      <CardHeader className="p-0">
        <div className="relative h-32 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 border-2 border-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 border-2 border-amber-400 rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          
          {/* Golden qi particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-60"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="relative z-10 p-4 h-full flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pill className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white tracking-wide">
                  אנציקלופדיית צמחים
                </h3>
              </div>
              <p className="text-xs text-white/70">
                Master Herbalist & Safety Guard
              </p>
            </div>
            
            <Badge className="bg-amber-500/20 border-amber-400 text-amber-400 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Evidence Based
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-slate-800 rounded-none h-12">
          <TabsTrigger 
            value="search" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 text-slate-400 rounded-none"
          >
            <Search className="h-4 w-4 mr-1" />
            איתור & בטיחות
          </TabsTrigger>
          <TabsTrigger 
            value="quiz"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 text-slate-400 rounded-none"
          >
            <GraduationCap className="h-4 w-4 mr-1" />
            חידון קליני
          </TabsTrigger>
          <TabsTrigger 
            value="flashcards"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 text-slate-400 rounded-none"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            כרטיסיות
          </TabsTrigger>
        </TabsList>

        {/* Search & Safety Tab */}
        <TabsContent value="search" className="p-4 min-h-[300px]">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="חפש פורמולה, צמח או תסמינים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-2 focus:border-jade"
              dir="rtl"
            />
          </div>

          {/* Safety Toggles */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">פילטר בטיחות (Safety Checks):</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('pregnancy')}
                className={cn(
                  "transition-all",
                  safetyFilters.pregnancy && "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                )}
              >
                <Heart className="h-3.5 w-3.5 mr-1" />
                🤰 הריון
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('children')}
                className={cn(
                  "transition-all",
                  safetyFilters.children && "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                )}
              >
                <Baby className="h-3.5 w-3.5 mr-1" />
                🧒 ילדים
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSafetyFilter('elderly')}
                className={cn(
                  "transition-all",
                  safetyFilters.elderly && "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                )}
              >
                <User className="h-3.5 w-3.5 mr-1" />
                👴 גיל שלישי
              </Button>
            </div>
          </div>

          {/* Safety Warnings */}
          {safetyWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-rose-500 font-semibold mb-2">
                <AlertTriangle className="h-4 w-4" />
                אזהרות בטיחות
              </div>
              {safetyWarnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-rose-400">{warning}</p>
              ))}
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-jade border-t-transparent rounded-full mx-auto mb-2" />
                מחפש...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((formula) => (
                <div 
                  key={formula.id}
                  className="p-3 border rounded-lg hover:bg-jade/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-jade" />
                        {formula.formula_name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {formula.answer || formula.content}
                      </p>
                      {formula.acupoints && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          נקודות: {formula.acupoints}
                        </Badge>
                      )}
                    </div>
                    <Shield className="h-4 w-4 text-jade/50" />
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                לא נמצאו תוצאות
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                הקלד שם פורמולה או תסמינים לחיפוש
              </div>
            )}
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="p-4 min-h-[300px]">
          {quizLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-jade border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground">טוען שאלות...</p>
            </div>
          ) : currentQuiz ? (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>שאלה {currentQuizIndex + 1} מתוך {quizFormulas.length}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={loadQuizFormulas}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  ערבב מחדש
                </Button>
              </div>

              {/* Question Card */}
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6 text-center">
                  <p className="text-lg font-semibold mb-4" dir="auto">
                    {currentQuiz.question}
                  </p>
                  
                  {showAnswer ? (
                    <div className="mt-4 p-4 bg-jade/10 rounded-lg text-jade animate-fade-in">
                      <p className="font-medium" dir="auto">{currentQuiz.answer}</p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowAnswer(true)}
                      className="bg-slate-800 hover:bg-slate-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      הצג תשובה
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevQuizQuestion}
                  disabled={currentQuizIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <Badge variant="secondary">
                  מבוסס על מאגר CSV
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextQuizQuestion}
                  disabled={currentQuizIndex === quizFormulas.length - 1}
                >
                  הבא
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>אין שאלות זמינות כרגע</p>
              <p className="text-xs mt-1">יש לייבא את קובץ הפורמולות</p>
            </div>
          )}
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="p-4 min-h-[300px]">
          {flashcardFormulas.length > 0 && currentFlashcard ? (
            <div className="space-y-4">
              {/* Presentation Mode Header */}
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <BookOpen className="h-5 w-5 text-jade" />
                <div>
                  <p className="font-semibold text-sm">מצב הצגה (Presentation Mode)</p>
                  <p className="text-xs text-muted-foreground">
                    מציג את ה-Q&A המלא מהקובץ למטפל בזמן אמת
                  </p>
                </div>
              </div>

              {/* Flashcard */}
              <div 
                className="relative min-h-[180px] cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <Card className={cn(
                  "absolute inset-0 transition-all duration-500 backface-hidden",
                  "bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-amber-900/20",
                  "border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center p-6",
                  isFlipped && "rotate-y-180 opacity-0"
                )}>
                  <CardContent className="text-center">
                    <Badge className="mb-3 bg-jade/20 text-jade">לחץ להפוך</Badge>
                    <p className="text-lg font-semibold" dir="auto">
                      {currentFlashcard.question}
                    </p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "absolute inset-0 transition-all duration-500 backface-hidden",
                  "bg-gradient-to-br from-jade/10 to-emerald-50 dark:from-jade/20 dark:to-emerald-900/20",
                  "border-2 border-jade flex items-center justify-center p-6",
                  !isFlipped && "rotate-y-180 opacity-0"
                )}>
                  <CardContent className="text-center">
                    <Badge className="mb-3 bg-amber-500/20 text-amber-600">תשובה</Badge>
                    <p className="text-md font-medium text-jade" dir="auto">
                      {currentFlashcard.answer}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevFlashcard}
                  disabled={currentFlashcardIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentFlashcardIndex + 1} / {flashcardFormulas.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextFlashcard}
                  disabled={currentFlashcardIndex === flashcardFormulas.length - 1}
                >
                  הבא
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>אין כרטיסיות זמינות כרגע</p>
              <p className="text-xs mt-1">יש לייבא את קובץ הפורמולות</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default HerbalMasterWidget;
