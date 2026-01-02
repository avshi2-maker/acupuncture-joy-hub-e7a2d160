import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Zap, Heart, Activity, RefreshCw, Pill, MapPin, ChevronLeft, ChevronRight, Languages, Loader2 } from 'lucide-react';
import vagusInfographic from '@/assets/vagus-infographic.png';
import { useVagusQuestions, VagusQuestion } from '@/hooks/useVagusQuestions';

const HEBREW_TRANSLATIONS: Record<string, string> = {
  'Vagus Nerve Assessment': 'הערכת עצב הוואגוס',
  'Symptoms Assessment': 'הערכת תסמינים',
  'Select the symptoms you experience:': 'בחר את התסמינים שאתה חווה:',
  'symptoms selected': 'תסמינים נבחרו',
  'Your Personalized Protocol': 'הפרוטוקול המותאם אישית שלך',
  'Based on': 'מבוסס על',
  'selected symptoms': 'תסמינים שנבחרו',
  'Recommended Acupoints': 'נקודות דיקור מומלצות',
  'Herbal Formulas': 'נוסחאות צמחים',
  'Scientific Mechanisms': 'מנגנונים מדעיים',
  'Reset Assessment': 'אפס הערכה',
  'Start Assessment': 'התחל הערכה',
  'Complete at least 3 symptoms': 'בחר לפחות 3 תסמינים',
  'View Results': 'צפה בתוצאות',
  'Back to Questions': 'חזרה לשאלות',
  'Vagal Tone Level': 'רמת טונוס הוואגוס',
  'Low': 'נמוך',
  'Moderate': 'בינוני',
  'High': 'גבוה',
  'Previous': 'הקודם',
  'Next': 'הבא',
};

interface VagusNerveAssessmentProps {
  compact?: boolean;
}

export const VagusNerveAssessment: React.FC<VagusNerveAssessmentProps> = ({ compact = false }) => {
  const { questions: VAGUS_QUESTIONS, loading, error } = useVagusQuestions();
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  
  const questionsPerPage = 5;
  const totalPages = Math.ceil(VAGUS_QUESTIONS.length / questionsPerPage);
  
  const t = (key: string) => language === 'he' ? (HEBREW_TRANSLATIONS[key] || key) : key;
  
  const currentQuestions = useMemo(() => {
    const start = currentPage * questionsPerPage;
    return VAGUS_QUESTIONS.slice(start, start + questionsPerPage);
  }, [currentPage, VAGUS_QUESTIONS]);
  
  const selectedQuestionData = useMemo(() => {
    return VAGUS_QUESTIONS.filter(q => selectedSymptoms.includes(q.id));
  }, [selectedSymptoms]);
  
  const aggregatedResults = useMemo(() => {
    if (selectedQuestionData.length === 0) return null;
    
    // Aggregate acupoints
    const acupointCounts: Record<string, number> = {};
    const formulas: Set<string> = new Set();
    const mechanisms: string[] = [];
    
    selectedQuestionData.forEach(q => {
      q.acupoints.split('+').forEach(point => {
        const cleaned = point.trim();
        acupointCounts[cleaned] = (acupointCounts[cleaned] || 0) + 1;
      });
      if (q.formula && q.formula !== 'None (Lifestyle)') {
        formulas.add(q.formula);
      }
      mechanisms.push(q.mechanism);
    });
    
    // Sort acupoints by frequency
    const sortedAcupoints = Object.entries(acupointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    return {
      acupoints: sortedAcupoints,
      formulas: Array.from(formulas).slice(0, 5),
      mechanisms: mechanisms.slice(0, 5),
      vagalToneLevel: selectedSymptoms.length <= 5 ? 'Low' : selectedSymptoms.length <= 10 ? 'Moderate' : 'High',
    };
  }, [selectedQuestionData, selectedSymptoms.length]);
  
  const toggleSymptom = (id: number) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };
  
  const resetAssessment = () => {
    setSelectedSymptoms([]);
    setShowResults(false);
    setCurrentPage(0);
  };

  if (compact) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-foreground">{t('Vagus Nerve Assessment')}</h3>
              <p className="text-xs text-muted-foreground">100 Symptoms • Acupoints • Formulas</p>
            </div>
          </div>
          <img 
            src={vagusInfographic} 
            alt="Vagus Nerve Healing Path" 
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
          <p className="text-sm text-muted-foreground">
            Interactive assessment tool linking vagal symptoms to TCM protocols
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header with Language Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('Vagus Nerve Assessment')}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedSymptoms.length} {t('symptoms selected')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(l => l === 'en' ? 'he' : 'en')}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          {language === 'en' ? 'עברית' : 'English'}
        </Button>
      </div>

      {/* Infographic */}
      <Card className="overflow-hidden">
        <img 
          src={vagusInfographic} 
          alt="Vagus Nerve Healing Path" 
          className="w-full h-48 object-cover"
        />
      </Card>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t('Symptoms Assessment')}</span>
          <span>{selectedSymptoms.length}/20</span>
        </div>
        <Progress value={(selectedSymptoms.length / 20) * 100} className="h-2" />
      </div>

      {!showResults ? (
        <>
          {/* Questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                {t('Select the symptoms you experience:')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {currentQuestions.map(q => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSymptoms.includes(q.id)
                          ? 'bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-600'
                          : 'bg-card hover:bg-muted/50 border-border'
                      }`}
                      onClick={() => toggleSymptom(q.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedSymptoms.includes(q.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{q.symptom}</p>
                          <p className="text-xs text-muted-foreground mt-1">{q.mechanism}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('Previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  {t('Next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Results Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowResults(true)}
            disabled={selectedSymptoms.length < 3}
          >
            {selectedSymptoms.length < 3 
              ? t('Complete at least 3 symptoms')
              : t('View Results')
            }
          </Button>
        </>
      ) : (
        <>
          {/* Results */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                {t('Your Personalized Protocol')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('Based on')} {selectedSymptoms.length} {t('selected symptoms')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vagal Tone Level */}
              <div className="p-4 bg-background/80 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t('Vagal Tone Level')}</span>
                  <Badge variant={
                    aggregatedResults?.vagalToneLevel === 'Low' ? 'default' :
                    aggregatedResults?.vagalToneLevel === 'Moderate' ? 'secondary' : 'destructive'
                  }>
                    {t(aggregatedResults?.vagalToneLevel || 'Low')}
                  </Badge>
                </div>
                <Progress 
                  value={
                    aggregatedResults?.vagalToneLevel === 'Low' ? 33 :
                    aggregatedResults?.vagalToneLevel === 'Moderate' ? 66 : 100
                  } 
                  className="h-3"
                />
              </div>

              {/* Recommended Acupoints */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {t('Recommended Acupoints')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aggregatedResults?.acupoints.map(([point, count]) => (
                    <Badge 
                      key={point} 
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-950/30 border-blue-200"
                    >
                      {point} <span className="ml-1 text-xs opacity-60">×{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Herbal Formulas */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4 text-green-600" />
                  {t('Herbal Formulas')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aggregatedResults?.formulas.map(formula => (
                    <Badge 
                      key={formula}
                      variant="outline"
                      className="bg-green-50 dark:bg-green-950/30 border-green-200"
                    >
                      {formula}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Scientific Mechanisms */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-600" />
                  {t('Scientific Mechanisms')}
                </h4>
                <ul className="space-y-2">
                  {aggregatedResults?.mechanisms.map((mech, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      {mech}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowResults(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('Back to Questions')}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetAssessment}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('Reset Assessment')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
