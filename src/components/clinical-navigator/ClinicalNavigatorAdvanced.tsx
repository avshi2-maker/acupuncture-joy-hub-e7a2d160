import { useState, useMemo, useCallback } from 'react';
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
import { 
  Brain, Heart, Stethoscope, Leaf, Apple, Activity,
  Users, User, Sparkles, FileText,
  MapPin, AlertTriangle, CheckCircle2,
  Loader2, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CLINICAL_QUESTIONNAIRES, 
  MODULE_CATEGORIES,
  QuestionnaireModule,
  QuestionItem
} from '@/data/clinical-navigator-questionnaires';
import { useClinicalDeepSearch, DeepSearchRequest } from '@/hooks/useClinicalDeepSearch';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { useLanguage } from '@/contexts/LanguageContext';

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  diagnostic: <Stethoscope className="h-4 w-4" />,
  constitutional: <Brain className="h-4 w-4" />,
  herbal: <Leaf className="h-4 w-4" />,
  specialty: <Heart className="h-4 w-4" />,
  lifestyle: <Apple className="h-4 w-4" />,
  'age-specific': <Users className="h-4 w-4" />,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  diagnostic: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  constitutional: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  herbal: 'bg-green-500/10 text-green-600 border-green-500/20',
  specialty: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  lifestyle: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'age-specific': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
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
  const [celebratedPoints, setCelebratedPoints] = useState<Set<string>>(new Set());

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

  // Calculate progress
  const progress = useMemo(() => {
    if (!selectedModule) return 0;
    const answered = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
    return Math.round((answered / selectedModule.questions.length) * 100);
  }, [selectedModule, answers]);

  // Submit questionnaire
  const handleSubmit = useCallback(async () => {
    if (!selectedModule) return;

    const request: DeepSearchRequest = {
      moduleId: selectedModule.id,
      questionnaireData: answers,
      patientAge: patientInfo.age ? parseInt(patientInfo.age) : undefined,
      patientGender: patientInfo.gender || undefined,
      chiefComplaint: patientInfo.chiefComplaint || undefined,
      language: language === 'he' ? 'he' : 'en',
    };

    await performDeepSearch(request);
    setShowResults(true);
  }, [selectedModule, answers, patientInfo, language, performDeepSearch]);

  // Handle point celebration (3D integration)
  const handlePointClick = useCallback((pointCode: string) => {
    if (!celebratedPoints.has(pointCode)) {
      setCelebratedPoints(prev => new Set(prev).add(pointCode));
      onPointCelebration?.(pointCode);
    }
  }, [celebratedPoints, onPointCelebration]);

  // Reset to category selection
  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
    } else if (selectedModule) {
      setSelectedModule(null);
      setAnswers({});
    } else {
      setSelectedCategory(null);
    }
  }, [showResults, selectedModule]);

  // Render category selection
  const renderCategorySelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {language === 'he' ? 'בחר קטגוריה קלינית' : 'Select Clinical Category'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' 
            ? '36 שאלונים מקצועיים עם חיפוש עמוק חוצה-מודולים'
            : '36 professional questionnaires with cross-module Deep Search'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(MODULE_CATEGORIES).map(([key, category]) => {
          const modules = modulesByCategory[key] || [];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg border-2 ${CATEGORY_COLORS[key]} hover:border-jade`}
                onClick={() => setSelectedCategory(key)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${CATEGORY_COLORS[key]}`}>
                      {CATEGORY_ICONS[key]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {language === 'he' ? category.he : category.en}
                      </CardTitle>
                      <CardDescription>
                        {modules.length} {language === 'he' ? 'שאלונים' : 'questionnaires'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {modules.slice(0, 3).map(m => language === 'he' ? m.module_name_he : m.module_name).join(', ')}
                    {modules.length > 3 && '...'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

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

        {/* Submit Button */}
        <div className="flex justify-end">
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
          {metadata && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {metadata.chunksFound} {language === 'he' ? 'מקורות' : 'sources'}
              </Badge>
              <Badge variant="outline">
                {metadata.crossReferencesFound} {language === 'he' ? 'הצלבות' : 'cross-refs'}
              </Badge>
            </div>
          )}
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
                    <p className="text-sm whitespace-pre-wrap">{report.primaryDiagnosis}</p>
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
                    </div>
                    {report.acupunctureProtocol.technique && (
                      <div>
                        <Label className="text-muted-foreground">
                          {language === 'he' ? 'טכניקה' : 'Technique'}
                        </Label>
                        <p className="text-sm mt-1">{report.acupunctureProtocol.technique}</p>
                      </div>
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
                    {report.herbalPrescription.formula && (
                      <div>
                        <Label className="text-muted-foreground">
                          {language === 'he' ? 'נוסחה' : 'Formula'}
                        </Label>
                        <p className="text-sm mt-1 font-medium">{report.herbalPrescription.formula}</p>
                      </div>
                    )}
                    {report.herbalPrescription.ingredients.length > 0 && (
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
                    )}
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
                        {report.nutritionAdvice.map((advice, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
                            <span>{advice}</span>
                          </li>
                        ))}
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
                        {report.lifestyleMindset.map((advice, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
                            <span>{advice}</span>
                          </li>
                        ))}
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

          {/* 3D Body Figure - Celebration Integration */}
          <div className="lg:col-span-1">
            <RAGBodyFigureDisplay
              pointCodes={report.extractedPoints}
              onPointSelect={handlePointClick}
              allowSelection={true}
              className="sticky top-4"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
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
            {renderModuleSelection()}
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
    </div>
  );
}
