import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, Heart, Stethoscope, Leaf, Apple, Activity,
  Users, User, Sparkles, FileText, Mail,
  MapPin, AlertTriangle, CheckCircle2,
  Loader2, ArrowLeft, ChevronsUpDown, Search, List, GitCompare, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CLINICAL_QUESTIONNAIRES, 
  MODULE_CATEGORIES,
  QuestionnaireModule,
  QuestionItem
} from '@/data/clinical-navigator-questionnaires';
import { useClinicalDeepSearch, DeepSearchRequest, QuestionAnswer } from '@/hooks/useClinicalDeepSearch';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { ComparisonBodyDisplay } from '@/components/acupuncture/ComparisonBodyDisplay';
import { 
  ProtocolCompareSelector, 
  ProtocolComparisonView, 
  ProtocolRecord,
  getComparisonColoredPoints 
} from './ProtocolCompare';
import { ProtocolPDFExport } from './ProtocolPDFExport';
import { SaveToPatientDialog } from './SaveToPatientDialog';
import { EmailProtocolDialog } from './EmailProtocolDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import clinicalNavigatorBg from '@/assets/clinical-navigator-bg.jpg';

// Category icons mapping (5 categories) - larger for boxes
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  diagnostic: <Stethoscope className="h-8 w-8" />,
  constitutional: <Brain className="h-8 w-8" />,
  specialty: <Heart className="h-8 w-8" />,
  wellness: <Leaf className="h-8 w-8" />,
  'age-specific': <Users className="h-8 w-8" />,
};

// Small icons for tabs and badges
const CATEGORY_ICONS_SMALL: Record<string, React.ReactNode> = {
  diagnostic: <Stethoscope className="h-4 w-4" />,
  constitutional: <Brain className="h-4 w-4" />,
  specialty: <Heart className="h-4 w-4" />,
  wellness: <Leaf className="h-4 w-4" />,
  'age-specific': <Users className="h-4 w-4" />,
};

// Category colors (5 categories)
const CATEGORY_COLORS: Record<string, string> = {
  diagnostic: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  constitutional: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  specialty: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  wellness: 'bg-green-500/10 text-green-600 border-green-500/20',
  'age-specific': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

// Category box gradient backgrounds for visual appeal
const CATEGORY_BOX_STYLES: Record<string, string> = {
  diagnostic: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/60 text-blue-700',
  constitutional: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/60 text-purple-700',
  specialty: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-500/60 text-rose-700',
  wellness: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/60 text-green-700',
  'age-specific': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/60 text-cyan-700',
};

interface ClinicalNavigatorAdvancedProps {
  className?: string;
  onPointCelebration?: (pointCode: string) => void;
}

export function ClinicalNavigatorAdvanced({ 
  className = '',
  onPointCelebration 
}: ClinicalNavigatorAdvancedProps) {
  const { language } = useLanguage();
  const { performDeepSearch, isLoading, result, reset } = useClinicalDeepSearch();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<QuestionnaireModule | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    chiefComplaint: '',
  });
  const [showResults, setShowResults] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [celebratedPoints, setCelebratedPoints] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activePointForCelebration, setActivePointForCelebration] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Protocol comparison state
  const [savedProtocols, setSavedProtocols] = useState<ProtocolRecord[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<ProtocolRecord[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonProtocols, setComparisonProtocols] = useState<{ a: ProtocolRecord; b: ProtocolRecord } | null>(null);
  
  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  // Filter modules by category
  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, QuestionnaireModule[]> = {};
    CLINICAL_QUESTIONNAIRES.forEach(module => {
      if (!grouped[module.category]) {
        grouped[module.category] = [];
      }
      grouped[module.category].push(module);
    });
    return grouped;
  }, []);

  // Handle module selection from dropdown
  const handleDropdownSelect = useCallback((moduleId: string) => {
    const module = CLINICAL_QUESTIONNAIRES.find(m => m.id.toString() === moduleId);
    if (module) {
      setSelectedModule(module);
      setSelectedCategory(module.category);
      setAnswers({});
      setShowResults(false);
      reset();
    }
    setDropdownOpen(false);
  }, [reset]);

  // Handle module selection
  const handleSelectModule = useCallback((module: QuestionnaireModule) => {
    setSelectedModule(module);
    setAnswers({});
    setShowResults(false);
    reset();
  }, [reset]);

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  // Handle voice auto-fill
  const handleVoiceAutoFill = useCallback((autoFilledAnswers: Record<string, any>) => {
    setAnswers(prev => ({ ...prev, ...autoFilledAnswers }));
  }, []);
  // Calculate progress
  const progress = useMemo(() => {
    if (!selectedModule) return 0;
    const answered = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
    return Math.round((answered / selectedModule.questions.length) * 100);
  }, [selectedModule, answers]);

  // Submit questionnaire
  const handleSubmit = useCallback(async () => {
    if (!selectedModule) return;

    // Build structured questionnaire data with question text for each answer
    const structuredAnswers: Record<string, QuestionAnswer> = {};
    for (const question of selectedModule.questions) {
      const answer = answers[question.id];
      if (answer !== undefined && answer !== '') {
        structuredAnswers[question.id] = {
          questionId: question.id,
          questionText: language === 'he' ? question.question_he : question.question_en,
          answer: answer,
        };
      }
    }

    const request: DeepSearchRequest = {
      moduleId: selectedModule.id,
      questionnaireData: structuredAnswers,
      patientAge: patientInfo.age ? parseInt(patientInfo.age) : undefined,
      patientGender: patientInfo.gender || undefined,
      chiefComplaint: patientInfo.chiefComplaint || undefined,
      language: language === 'he' ? 'he' : 'en',
    };

    await performDeepSearch(request);
    setShowResults(true);
  }, [selectedModule, answers, patientInfo, language, performDeepSearch]);

  // Handle point celebration (3D integration) with animation trigger
  const handlePointClick = useCallback((pointCode: string) => {
    // Set active point for celebration animation
    setActivePointForCelebration(pointCode);
    
    if (!celebratedPoints.has(pointCode)) {
      setCelebratedPoints(prev => new Set(prev).add(pointCode));
    }
    
    // Trigger the 3D celebration callback
    onPointCelebration?.(pointCode);
    
    // Clear the active point after animation
    setTimeout(() => {
      setActivePointForCelebration(null);
    }, 2000);
  }, [celebratedPoints, onPointCelebration]);

  // Save current result as a protocol for comparison
  const handleSaveProtocol = useCallback(() => {
    if (!result?.success || !result.report || !selectedModule) return;
    
    const protocol: ProtocolRecord = {
      id: `protocol-${Date.now()}`,
      name: `${selectedModule.module_name} - ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      points: result.report.extractedPoints || [],
      diagnosis: result.report.primaryDiagnosis || '',
      module: selectedModule.module_name,
    };
    
    setSavedProtocols(prev => [...prev, protocol]);
  }, [result, selectedModule]);

  // Handle protocol selection for comparison
  const handleSelectProtocolForComparison = useCallback((protocol: ProtocolRecord) => {
    setSelectedForComparison(prev => {
      const isSelected = prev.some(p => p.id === protocol.id);
      if (isSelected) {
        return prev.filter(p => p.id !== protocol.id);
      }
      if (prev.length >= 2) {
        return prev; // Max 2 selections
      }
      return [...prev, protocol];
    });
  }, []);

  // Start comparison
  const handleStartComparison = useCallback((protocolA: ProtocolRecord, protocolB: ProtocolRecord) => {
    setComparisonProtocols({ a: protocolA, b: protocolB });
    setIsComparing(true);
  }, []);

  // Close comparison
  const handleCloseComparison = useCallback(() => {
    setIsComparing(false);
    setComparisonProtocols(null);
    setSelectedForComparison([]);
  }, []);

  // Reset to category selection
  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
    } else if (showSummary) {
      setShowSummary(false);
    } else if (selectedModule) {
      setSelectedModule(null);
      setAnswers({});
    } else {
      setSelectedCategory(null);
    }
  }, [showResults, showSummary, selectedModule]);

  // Get answered questions for summary
  const answeredQuestions = useMemo(() => {
    if (!selectedModule) return [];
    return selectedModule.questions.filter(q => 
      answers[q.id] !== undefined && answers[q.id] !== ''
    );
  }, [selectedModule, answers]);

  // Handle show summary
  const handleShowSummary = useCallback(() => {
    setShowSummary(true);
  }, []);

  // Render the Master Dropdown for all 36 modules
  const renderMasterDropdown = () => (
    <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={dropdownOpen}
          className="w-full md:w-[400px] justify-between bg-background border-2 hover:border-jade transition-colors"
        >
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-jade" />
            <span>Clinical Modules</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[400px] p-0 bg-background border shadow-lg z-50" align="start">
        <Command className="bg-background">
          <CommandInput placeholder="Search modules (e.g., Oncology, Pain, Shen)..." className="h-10" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No module found.</CommandEmpty>
            {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => (
              <CommandGroup key={categoryKey} heading={category.en} className="text-xs text-muted-foreground">
                {modulesByCategory[categoryKey]?.map((module) => (
                  <CommandItem
                    key={module.id}
                    value={`${module.id}. ${module.module_name}`}
                    onSelect={() => handleDropdownSelect(module.id.toString())}
                    className="cursor-pointer hover:bg-jade/10"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Badge variant="outline" className="text-xs px-1.5 py-0 min-w-[28px] justify-center">
                        {module.id}
                      </Badge>
                      <span className="flex-1 truncate">{module.module_name}</span>
                      <Badge className={cn("text-[10px]", CATEGORY_COLORS[module.category])}>
                        {module.questions.length}Q
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  // Render category selection as 5 clickable boxes
  const renderCategorySelection = () => {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">
            {language === 'he' ? 'נווט קליני' : 'Clinical Navigator'}
          </h2>
          <p className="text-muted-foreground font-medium text-lg">
            {language === 'he' 
              ? '36 שאלונים מקצועיים עם חיפוש עמוק חוצה-מודולים'
              : '36 professional questionnaires with cross-module Deep Search'}
          </p>
        </div>

        {/* 5 Category Boxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(MODULE_CATEGORIES).map(([key, category], index) => {
            const count = (modulesByCategory[key] || []).length;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-2 bg-gradient-to-br backdrop-blur-sm",
                    "hover:shadow-xl hover:shadow-primary/10",
                    CATEGORY_BOX_STYLES[key],
                    "min-h-[180px] flex flex-col justify-center"
                  )}
                  onClick={() => setSelectedCategory(key)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 p-3 rounded-full bg-background/50 backdrop-blur-sm">
                      {CATEGORY_ICONS[key]}
                    </div>
                    <CardTitle className="text-lg font-bold">
                      {language === 'he' ? category.he : category.en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <Badge 
                      variant="secondary" 
                      className="text-sm px-3 py-1 font-bold bg-background/60"
                    >
                      {count} {language === 'he' ? 'שאלונים' : 'Modules'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Search Bar */}
        <div className="flex justify-center mt-8">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedCategory('all');
                }
              }}
              placeholder={language === 'he' ? 'או חפש ישירות שאלון...' : 'Or search directly for a questionnaire...'}
              className="pl-12 pr-12 py-6 text-lg font-medium bg-background/80 backdrop-blur-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Master Dropdown for Power Users */}
        <div className="flex justify-center mt-4">
          {renderMasterDropdown()}
        </div>
      </div>
    );
  };

  // Render modules after category is selected
  const renderModulesInCategory = () => {
    const modules = selectedCategory === 'all' 
      ? CLINICAL_QUESTIONNAIRES.filter(m => 
          searchQuery.trim() 
            ? m.module_name.toLowerCase().includes(searchQuery.toLowerCase()) || m.module_name_he.includes(searchQuery)
            : true
        )
      : (modulesByCategory[selectedCategory!] || []);

    const category = selectedCategory === 'all' 
      ? { en: 'All Modules', he: 'כל השאלונים' }
      : MODULE_CATEGORIES[selectedCategory as keyof typeof MODULE_CATEGORIES];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'he' ? 'חזור לקטגוריות' : 'Back to Categories'}
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {selectedCategory !== 'all' && CATEGORY_ICONS_SMALL[selectedCategory!]}
              {language === 'he' ? category.he : category.en}
            </h2>
            <p className="text-sm text-muted-foreground">
              {modules.length} {language === 'he' ? 'שאלונים זמינים' : 'questionnaires available'}
            </p>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-l-4 bg-background/80 backdrop-blur-sm",
                    CATEGORY_COLORS[module.category],
                    "hover:border-jade"
                  )}
                  onClick={() => handleSelectModule(module)}
                >
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className="shrink-0 text-xs px-1.5 font-bold">
                          {module.id}
                        </Badge>
                        <CardTitle className="text-sm font-bold truncate">
                          {language === 'he' ? module.module_name_he : module.module_name}
                        </CardTitle>
                      </div>
                      <Badge className={cn("shrink-0 text-[10px] font-bold", CATEGORY_COLORS[module.category])}>
                        {module.questions.length}Q
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Render module selection
  const renderModuleSelection = () => {
    const modules = modulesByCategory[selectedCategory!] || [];
    const category = MODULE_CATEGORIES[selectedCategory as keyof typeof MODULE_CATEGORIES];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'he' ? 'חזור' : 'Back'}
          </Button>
          <div>
            <h2 className="text-xl font-bold">
              {language === 'he' ? category?.he : category?.en}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'בחר שאלון' : 'Select a questionnaire'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card 
                className="cursor-pointer hover:border-jade transition-all"
                onClick={() => handleSelectModule(module)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {language === 'he' ? module.module_name_he : module.module_name}
                    </CardTitle>
                    <Badge variant="outline">
                      {module.questions.length} {language === 'he' ? 'שאלות' : 'questions'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{module.linked_knowledge_base}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Render question based on type
  const renderQuestion = (question: QuestionItem) => {
    switch (question.type) {
      case 'open':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={language === 'he' ? 'הזן תשובה...' : 'Enter your answer...'}
            className="mt-2"
          />
        );
      case 'yesno':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(v) => handleAnswerChange(question.id, v)}
            className="mt-2 flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">
                {language === 'he' ? 'כן' : 'Yes'}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="cursor-pointer">
                {language === 'he' ? 'לא' : 'No'}
              </Label>
            </div>
          </RadioGroup>
        );
      case 'scale':
        return (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Button
                key={num}
                size="sm"
                variant={answers[question.id] === num ? 'default' : 'outline'}
                className={answers[question.id] === num ? 'bg-jade' : ''}
                onClick={() => handleAnswerChange(question.id, num)}
              >
                {num}
              </Button>
            ))}
          </div>
        );
      case 'multi':
        if (!question.options) return null;
        return (
          <div className="mt-2 space-y-2">
            {question.options.map((option) => {
              const currentValue = answers[question.id] || [];
              const isChecked = Array.isArray(currentValue) 
                ? currentValue.includes(option)
                : currentValue === option;
              return (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newValue = Array.isArray(currentValue) 
                          ? [...currentValue, option]
                          : [option];
                        handleAnswerChange(question.id, newValue);
                      } else {
                        const newValue = Array.isArray(currentValue)
                          ? currentValue.filter((v: string) => v !== option)
                          : [];
                        handleAnswerChange(question.id, newValue);
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer capitalize">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  // Render questionnaire
  const renderQuestionnaire = () => {
    if (!selectedModule) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'he' ? 'חזור' : 'Back'}
            </Button>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'he' ? selectedModule.module_name_he : selectedModule.module_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedModule.questions.length} {language === 'he' ? 'שאלות' : 'questions'}
              </p>
            </div>
          </div>
          <Badge className="bg-jade">
            {progress}% {language === 'he' ? 'הושלם' : 'Complete'}
          </Badge>
        </div>

        <Progress value={progress} className="h-2" />

        {/* Patient Info */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              {language === 'he' ? 'פרטי מטופל' : 'Patient Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{language === 'he' ? 'גיל' : 'Age'}</Label>
              <Input 
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                placeholder="45"
              />
            </div>
            <div>
              <Label>{language === 'he' ? 'מין' : 'Gender'}</Label>
              <Select 
                value={patientInfo.gender}
                onValueChange={(v) => setPatientInfo(prev => ({ ...prev, gender: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'he' ? 'בחר' : 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{language === 'he' ? 'זכר' : 'Male'}</SelectItem>
                  <SelectItem value="female">{language === 'he' ? 'נקבה' : 'Female'}</SelectItem>
                  <SelectItem value="other">{language === 'he' ? 'אחר' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label>{language === 'he' ? 'תלונה עיקרית' : 'Chief Complaint'}</Label>
              <Input 
                value={patientInfo.chiefComplaint}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                placeholder={language === 'he' ? 'כאב ראש, עייפות...' : 'Headache, fatigue...'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="single" collapsible className="space-y-2">
            {selectedModule.questions.map((question, index) => (
              <AccordionItem 
                key={question.id} 
                value={question.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      answers[question.id] !== undefined && answers[question.id] !== ''
                        ? 'bg-jade text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {answers[question.id] !== undefined && answers[question.id] !== '' 
                        ? <CheckCircle2 className="h-4 w-4" /> 
                        : index + 1
                      }
                    </div>
                    <span className="text-sm font-medium">
                      {language === 'he' ? question.question_he : question.question_en}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {renderQuestion(question)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="sticky bottom-0 -mx-4 mt-4 border-t bg-background/80 backdrop-blur-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {answeredQuestions.length} / {selectedModule.questions.length}{' '}
            {language === 'he' ? 'שאלות נענו' : 'questions answered'}
            {progress < 20 && (
              <span className="ml-2">
                {language === 'he' ? '(ענה על עוד שאלות כדי להפעיל חיפוש)' : '(Answer more to enable search)'}
              </span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            {answeredQuestions.length > 0 && (
              <Button variant="outline" onClick={handleShowSummary} className="gap-2">
                <FileText className="h-4 w-4" />
                {language === 'he' ? 'סיכום תשובות' : 'View Summary'}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || progress < 20}
              className="bg-jade hover:bg-jade/90 gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'he' ? 'מנתח...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {language === 'he' ? 'הפעל חיפוש עמוק' : 'Run Deep Search'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render answers summary view
  const renderSummary = () => {
    if (!selectedModule) return null;

    const yesAnswers = answeredQuestions.filter(q => answers[q.id] === 'yes');
    const noAnswers = answeredQuestions.filter(q => answers[q.id] === 'no');
    const unanswered = selectedModule.questions.filter(q => 
      answers[q.id] === undefined || answers[q.id] === ''
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'he' ? 'חזור לשאלון' : 'Back to Questions'}
            </Button>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'he' ? 'סיכום תשובות' : 'Answers Summary'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? selectedModule.module_name_he : selectedModule.module_name}
              </p>
            </div>
          </div>
          <Badge className="bg-jade">
            {answeredQuestions.length} / {selectedModule.questions.length} {language === 'he' ? 'נענו' : 'answered'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yes Answers */}
          <Card className="border-jade/30 bg-jade/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-jade">
                <CheckCircle2 className="h-5 w-5" />
                {language === 'he' ? 'תשובות "כן"' : 'Yes Answers'} ({yesAnswers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                {yesAnswers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {language === 'he' ? 'אין תשובות "כן"' : 'No "Yes" answers'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {yesAnswers.map((q, idx) => (
                      <li key={q.id} className="text-sm flex gap-2">
                        <span className="text-jade font-medium shrink-0">{idx + 1}.</span>
                        <span>{language === 'he' ? q.question_he : q.question_en}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* No Answers */}
          <Card className="border-muted bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-5 w-5" />
                {language === 'he' ? 'תשובות "לא"' : 'No Answers'} ({noAnswers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                {noAnswers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {language === 'he' ? 'אין תשובות "לא"' : 'No "No" answers'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {noAnswers.map((q, idx) => (
                      <li key={q.id} className="text-sm flex gap-2 text-muted-foreground">
                        <span className="font-medium shrink-0">{idx + 1}.</span>
                        <span>{language === 'he' ? q.question_he : q.question_en}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Unanswered Questions */}
        {unanswered.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                {language === 'he' ? 'שאלות שלא נענו' : 'Unanswered Questions'} ({unanswered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unanswered.slice(0, 10).map((q) => (
                  <Badge key={q.id} variant="outline" className="text-amber-600 border-amber-500/30">
                    Q{selectedModule.questions.indexOf(q) + 1}
                  </Badge>
                ))}
                {unanswered.length > 10 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                    +{unanswered.length - 10} {language === 'he' ? 'עוד' : 'more'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Info Summary */}
        {(patientInfo.age || patientInfo.gender || patientInfo.chiefComplaint) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5" />
                {language === 'he' ? 'פרטי מטופל' : 'Patient Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                {patientInfo.age && (
                  <div>
                    <span className="text-muted-foreground">{language === 'he' ? 'גיל:' : 'Age:'}</span>{' '}
                    <span className="font-medium">{patientInfo.age}</span>
                  </div>
                )}
                {patientInfo.gender && (
                  <div>
                    <span className="text-muted-foreground">{language === 'he' ? 'מין:' : 'Gender:'}</span>{' '}
                    <span className="font-medium">{patientInfo.gender}</span>
                  </div>
                )}
                {patientInfo.chiefComplaint && (
                  <div>
                    <span className="text-muted-foreground">{language === 'he' ? 'תלונה:' : 'Complaint:'}</span>{' '}
                    <span className="font-medium">{patientInfo.chiefComplaint}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setShowSummary(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'he' ? 'ערוך תשובות' : 'Edit Answers'}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || progress < 20}
            className="bg-jade hover:bg-jade/90 gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'he' ? 'מנתח...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {language === 'he' ? 'הפעל חיפוש עמוק' : 'Run Deep Search'}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render results with 3D Celebration
  const renderResults = () => {
    if (!result?.success || !result.report) {
      return (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-3" />
            <p className="text-destructive font-medium">
              {result?.error || (language === 'he' ? 'שגיאה בניתוח' : 'Analysis failed')}
            </p>
            <Button variant="outline" onClick={handleBack} className="mt-4">
              {language === 'he' ? 'נסה שוב' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    const { report, metadata } = result;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'he' ? 'חזור לשאלון' : 'Back to Questionnaire'}
            </Button>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-jade" />
                {language === 'he' ? 'דוח קליני מלא' : 'Complete Clinical Report'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? 'חיפוש עמוק חוצה-מודולים' : 'Cross-module Deep Search'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Save to Patient button */}
            {selectedModule && (
              <SaveToPatientDialog
                moduleId={selectedModule.id}
                moduleName={selectedModule.module_name}
                diagnosis={report.primaryDiagnosis || ''}
                acupuncturePoints={report.acupunctureProtocol?.points || []}
                herbalFormula={report.herbalPrescription?.formula}
                herbalIngredients={report.herbalPrescription?.ingredients}
                nutritionAdvice={report.nutritionAdvice.map(a => typeof a === 'string' ? a : a.text)}
                lifestyleAdvice={report.lifestyleMindset.map(a => typeof a === 'string' ? a : a.text)}
                answers={answers}
                language={language === 'he' ? 'he' : 'en'}
              />
            )}
            
            {/* PDF Export button */}
            {selectedModule && (
              <ProtocolPDFExport
                moduleName={selectedModule.module_name}
                diagnosis={report.primaryDiagnosis || ''}
                acupuncturePoints={report.acupunctureProtocol?.points || []}
                herbalFormula={report.herbalPrescription?.formula}
                herbalIngredients={report.herbalPrescription?.ingredients}
                nutritionAdvice={report.nutritionAdvice.map(a => typeof a === 'string' ? a : a.text)}
                lifestyleAdvice={report.lifestyleMindset.map(a => typeof a === 'string' ? a : a.text)}
                language={language === 'he' ? 'he' : 'en'}
              />
            )}
            
            {/* Email to Patient button */}
            {selectedModule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailDialog(true)}
                className="gap-1"
              >
                <Mail className="h-4 w-4" />
                {language === 'he' ? 'שלח למטופל' : 'Email to Patient'}
              </Button>
            )}
            
            {/* Save for Compare button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProtocol}
              className="gap-1"
            >
              <GitCompare className="h-4 w-4" />
              {language === 'he' ? 'שמור להשוואה' : 'Save for Compare'}
            </Button>
            {metadata && (
              <>
                <Badge variant="outline">
                  {metadata.chunksFound} {language === 'he' ? 'מקורות' : 'sources'}
                </Badge>
                <Badge variant="outline">
                  {metadata.crossReferencesFound} {language === 'he' ? 'הצלבות' : 'cross-refs'}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Report */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="diagnosis" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="diagnosis">
                  {language === 'he' ? 'אבחנה' : 'Diagnosis'}
                </TabsTrigger>
                <TabsTrigger value="acupuncture">
                  {language === 'he' ? 'דיקור' : 'Acupuncture'}
                </TabsTrigger>
                <TabsTrigger value="herbs">
                  {language === 'he' ? 'צמחים' : 'Herbs'}
                </TabsTrigger>
                <TabsTrigger value="nutrition">
                  {language === 'he' ? 'תזונה' : 'Nutrition'}
                </TabsTrigger>
                <TabsTrigger value="lifestyle">
                  {language === 'he' ? 'אורח חיים' : 'Lifestyle'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="diagnosis" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-jade" />
                      {language === 'he' ? 'אבחנה ראשית' : 'Primary Diagnosis'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.primaryDiagnosis?.trim() ? (
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{report.primaryDiagnosis}</p>
                        {report.primaryDiagnosisSources && report.primaryDiagnosisSources.length > 0 && (
                          <p className="mt-3 text-xs text-muted-foreground italic border-t pt-2">
                            {language === 'he' ? 'מקורות:' : 'Sources:'} {report.primaryDiagnosisSources.join(', ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? 'לא התקבלה אבחנה מהמערכת' : 'No diagnosis returned from the analysis'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="acupuncture" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-jade" />
                      {language === 'he' ? 'פרוטוקול דיקור' : 'Acupuncture Protocol'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">
                        {language === 'he' ? 'נקודות' : 'Points'}
                      </Label>

                      {report.acupunctureProtocol.points.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.acupunctureProtocol.points.map((point) => (
                            <Badge
                              key={point}
                              className={`cursor-pointer transition-all ${
                                celebratedPoints.has(point)
                                  ? 'bg-jade text-white'
                                  : 'bg-jade/20 text-jade hover:bg-jade hover:text-white'
                              }`}
                              onClick={() => handlePointClick(point)}
                            >
                              [PT:{point}]
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          {language === 'he' ? 'לא הוחזרו נקודות דיקור לבעיה זו' : 'No acupuncture points were returned for this case'}
                        </p>
                      )}
                    </div>

                    {report.acupunctureProtocol.technique?.trim() ? (
                      <div>
                        <Label className="text-muted-foreground">
                          {language === 'he' ? 'טכניקה' : 'Technique'}
                        </Label>
                        <p className="text-sm mt-1">{report.acupunctureProtocol.technique}</p>
                      </div>
                    ) : null}

                    {report.acupunctureProtocol.sources && report.acupunctureProtocol.sources.length > 0 && (
                      <p className="text-xs text-muted-foreground italic border-t pt-2 mt-2">
                        {language === 'he' ? 'מקורות:' : 'Sources:'} {report.acupunctureProtocol.sources.join(', ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="herbs" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-jade" />
                      {language === 'he' ? 'מרשם צמחי' : 'Herbal Prescription'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {report.herbalPrescription.formula?.trim() ? (
                      <div>
                        <Label className="text-muted-foreground">
                          {language === 'he' ? 'נוסחה' : 'Formula'}
                        </Label>
                        <p className="text-sm mt-1 font-medium">{report.herbalPrescription.formula}</p>
                      </div>
                    ) : null}

                    {report.herbalPrescription.ingredients.length > 0 ? (
                      <div>
                        <Label className="text-muted-foreground">
                          {language === 'he' ? 'רכיבים' : 'Ingredients'}
                        </Label>
                        <ul className="text-sm mt-1 list-disc list-inside">
                          {report.herbalPrescription.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {!report.herbalPrescription.formula?.trim() && report.herbalPrescription.ingredients.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? 'לא הוחזר מרשם צמחי לבעיה זו' : 'No herbal prescription was returned for this case'}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-jade" />
                      {language === 'he' ? 'המלצות תזונתיות' : 'Nutrition Advice'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.nutritionAdvice.length > 0 ? (
                      <ul className="text-sm space-y-2">
                        {report.nutritionAdvice.map((advice, i) => {
                          const text = typeof advice === 'string' ? advice : advice.text;
                          const source = typeof advice === 'string' ? undefined : advice.source;
                          return (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span>{text}</span>
                                {source && (
                                  <span className="ml-2 text-xs text-muted-foreground italic">
                                    ({language === 'he' ? 'מקור:' : 'Source:'} {source})
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? 'לא נמצאו המלצות ספציפיות' : 'No specific recommendations found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifestyle" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-jade" />
                      {language === 'he' ? 'אורח חיים ומנטליות' : 'Lifestyle & Mindset'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.lifestyleMindset.length > 0 ? (
                      <ul className="text-sm space-y-2">
                        {report.lifestyleMindset.map((advice, i) => {
                          const text = typeof advice === 'string' ? advice : advice.text;
                          const source = typeof advice === 'string' ? undefined : advice.source;
                          return (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span>{text}</span>
                                {source && (
                                  <span className="ml-2 text-xs text-muted-foreground italic">
                                    ({language === 'he' ? 'מקור:' : 'Source:'} {source})
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? 'לא נמצאו המלצות ספציפיות' : 'No specific recommendations found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 3D Body Figure - Celebration Integration with Sequential Tour & Narration */}
          <div className="lg:col-span-1 space-y-4">
            <RAGBodyFigureDisplay
              pointCodes={report.extractedPoints}
              onPointSelect={handlePointClick}
              allowSelection={true}
              celebratingPoint={activePointForCelebration}
              enableTour={true}
              autoStartTour={true}
              enableNarration={true}
              language={language === 'he' ? 'he' : 'en'}
              className="sticky top-4"
            />
            
            {/* Protocol Comparison Section */}
            {savedProtocols.length > 0 && (
              <ProtocolCompareSelector
                protocols={savedProtocols}
                selectedProtocols={selectedForComparison}
                onSelectProtocol={handleSelectProtocolForComparison}
                onCompare={handleStartComparison}
                language={language === 'he' ? 'he' : 'en'}
              />
            )}
          </div>
        </div>
        
        {/* Comparison Dialog */}
        <Dialog open={isComparing} onOpenChange={(open) => !open && handleCloseComparison()}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {comparisonProtocols && (
              <div className="space-y-6">
                <ProtocolComparisonView
                  protocolA={comparisonProtocols.a}
                  protocolB={comparisonProtocols.b}
                  onPointClick={(point, source) => handlePointClick(point)}
                  onClose={handleCloseComparison}
                  language={language === 'he' ? 'he' : 'en'}
                />
                
                {/* 3D Comparison Body Display */}
                <ComparisonBodyDisplay
                  coloredPoints={getComparisonColoredPoints(comparisonProtocols.a, comparisonProtocols.b)}
                  onPointClick={(point, color) => handlePointClick(point)}
                  language={language === 'he' ? 'he' : 'en'}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div 
      className={`relative min-h-screen ${className}`}
      style={{
        backgroundImage: `url(${clinicalNavigatorBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-background/70" />
      
      {/* Content container */}
      <div className="relative z-10 p-6">
      <AnimatePresence mode="wait">
        {showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderResults()}
          </motion.div>
        ) : showSummary && selectedModule ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderSummary()}
          </motion.div>
        ) : selectedModule ? (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderQuestionnaire()}
          </motion.div>
        ) : selectedCategory ? (
          <motion.div
            key="modules"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderModulesInCategory()}
          </motion.div>
        ) : (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderCategorySelection()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Protocol Dialog */}
      {result?.success && result.report && selectedModule && (
        <EmailProtocolDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          protocolData={{
            diagnosis: result.report.primaryDiagnosis ?? '',
            herbalFormula: result.report.herbalPrescription?.formula,
            acupuncturePoints: result.report.acupunctureProtocol?.points || [],
            nutritionAdvice: (result.report.nutritionAdvice || []).map(a => typeof a === 'string' ? a : a.text),
            lifestyleAdvice: (result.report.lifestyleMindset || []).map(a => typeof a === 'string' ? a : a.text),
            moduleName: selectedModule.module_name,
          }}
          language={language === 'he' ? 'he' : 'en'}
        />
      )}
      </div>
    </div>
  );
}
