import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Loader2,
  Lightbulb,
  Target,
  HelpCircle,
  ClipboardList,
  Stethoscope,
  Heart,
  Activity,
  MessageCircle,
  Copy,
  Check,
  Zap,
  History,
  Calendar,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useSessionBrief, SuggestedQuestion, VisitHistorySummary } from '@/hooks/useSessionBrief';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SessionBriefPanelProps {
  patientId: string | null;
  patientName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onQuestionUsed?: (question: string) => void;
  autoTrigger?: boolean;
}

const categoryConfig: Record<SuggestedQuestion['category'], { icon: React.ElementType; color: string; label: string }> = {
  diagnostic: { icon: Stethoscope, color: 'text-blue-600 bg-blue-100', label: 'Diagnostic' },
  lifestyle: { icon: Activity, color: 'text-green-600 bg-green-100', label: 'Lifestyle' },
  symptoms: { icon: Heart, color: 'text-red-600 bg-red-100', label: 'Symptoms' },
  treatment: { icon: Target, color: 'text-purple-600 bg-purple-100', label: 'Treatment' },
  followup: { icon: MessageCircle, color: 'text-amber-600 bg-amber-100', label: 'Follow-up' }
};

const priorityColors = {
  high: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/30',
  medium: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30',
  low: 'border-l-green-500 bg-green-50/50 dark:bg-green-950/30'
};

export function SessionBriefPanel({
  patientId,
  patientName,
  isOpen,
  onClose,
  onQuestionUsed,
  autoTrigger = true
}: SessionBriefPanelProps) {
  const { isLoading, sessionBrief, error, generateSessionBrief, clearBrief } = useSessionBrief();
  const [analysisExpanded, setAnalysisExpanded] = useState(true);
  const [questionsExpanded, setQuestionsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  // Auto-trigger generation when patient is selected
  useEffect(() => {
    if (autoTrigger && patientId && isOpen && !sessionBrief && !isLoading && !hasAutoTriggered) {
      setHasAutoTriggered(true);
      generateSessionBrief(patientId);
    }
  }, [patientId, isOpen, autoTrigger, sessionBrief, isLoading, hasAutoTriggered, generateSessionBrief]);

  // Reset auto-trigger flag when patient changes
  useEffect(() => {
    setHasAutoTriggered(false);
    clearBrief();
  }, [patientId, clearBrief]);

  const handleRefresh = () => {
    if (patientId) {
      generateSessionBrief(patientId);
    }
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestion(index);
    toast.success('Question copied!');
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const handleUseQuestion = (question: string) => {
    onQuestionUsed?.(question);
    toast.success('Question added to notes');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-4 top-20 w-96 max-w-[calc(100vw-2rem)] z-50"
      >
        <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Session Brief
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </CardTitle>
                  {patientName && (
                    <p className="text-sm text-muted-foreground">{patientName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading || !patientId}
                  className="h-8 w-8"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)] max-h-[600px]">
              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Analyzing Patient Data...</p>
                      <p className="text-sm text-muted-foreground">
                        Generating session brief from intake form
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="text-center py-8">
                    <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto mb-3">
                      <X className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-destructive font-medium">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* No Patient Selected */}
                {!patientId && !isLoading && (
                  <div className="text-center py-8">
                    <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-3">
                      <HelpCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Select a patient to generate session brief
                    </p>
                  </div>
                )}

                {/* Session Brief Content */}
                {sessionBrief && !isLoading && (
                  <>
                    {/* Key Findings */}
                    {sessionBrief.keyFindings.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Lightbulb className="h-4 w-4" />
                          Key Findings
                        </div>
                        <div className="space-y-1">
                          {sessionBrief.keyFindings.map((finding, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-2"
                            >
                              <Zap className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                              <span>{finding}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatment Focus */}
                    {sessionBrief.treatmentFocus.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Target className="h-4 w-4" />
                          Treatment Focus
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sessionBrief.treatmentFocus.map((focus, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {focus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visit History Section */}
                    {sessionBrief.visitHistory && sessionBrief.visitHistory.length > 0 && (
                      <>
                        <Separator />
                        <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <History className="h-4 w-4 text-blue-600" />
                              Previous Visits
                              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                                {sessionBrief.totalVisits} total
                              </Badge>
                            </div>
                            {historyExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-2">
                              {sessionBrief.visitHistory.map((visit, i) => (
                                <motion.div
                                  key={visit.id}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3 text-blue-500" />
                                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                        {format(new Date(visit.visit_date), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                    {i === 0 && (
                                      <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                        Latest
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {visit.tcm_pattern && (
                                    <div className="text-xs mb-1">
                                      <span className="text-muted-foreground">Pattern: </span>
                                      <span className="font-medium">{visit.tcm_pattern}</span>
                                    </div>
                                  )}
                                  
                                  {visit.points_used && visit.points_used.length > 0 && (
                                    <div className="flex items-start gap-1 text-xs">
                                      <MapPin className="h-3 w-3 text-rose-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-muted-foreground">
                                        {visit.points_used.slice(0, 6).join(', ')}
                                        {visit.points_used.length > 6 && ` +${visit.points_used.length - 6} more`}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {visit.chief_complaint && (
                                    <div className="text-xs text-muted-foreground mt-1 italic truncate">
                                      "{visit.chief_complaint}"
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    )}

                    <Separator />

                    {/* AI Analysis (Collapsible) */}
                    <Collapsible open={analysisExpanded} onOpenChange={setAnalysisExpanded}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          Full Analysis
                        </div>
                        {analysisExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{sessionBrief.analysis}</ReactMarkdown>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    {/* Suggested Questions */}
                    <Collapsible open={questionsExpanded} onOpenChange={setQuestionsExpanded}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <HelpCircle className="h-4 w-4 text-primary" />
                          Smart Q&A Suggestions
                          <Badge variant="outline" className="text-xs">
                            {sessionBrief.suggestedQuestions.length}
                          </Badge>
                        </div>
                        {questionsExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-2">
                          {sessionBrief.suggestedQuestions.map((q, i) => {
                            const CategoryIcon = categoryConfig[q.category]?.icon || HelpCircle;
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                  "p-3 rounded-lg border-l-4 transition-all hover:shadow-md",
                                  priorityColors[q.priority]
                                )}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "p-1 rounded",
                                      categoryConfig[q.category]?.color
                                    )}>
                                      <CategoryIcon className="h-3 w-3" />
                                    </span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {q.priority}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleCopyQuestion(q.questionEn || q.questionHe, i)}
                                    >
                                      {copiedQuestion === i ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleUseQuestion(q.questionEn || q.questionHe)}
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                {q.questionEn && (
                                  <p className="text-sm font-medium">{q.questionEn}</p>
                                )}
                                {q.questionHe && (
                                  <p className="text-sm text-muted-foreground mt-1 text-right" dir="rtl">
                                    {q.questionHe}
                                  </p>
                                )}
                                {q.rationale && (
                                  <p className="text-xs text-muted-foreground mt-2 italic">
                                    💡 {q.rationale}
                                  </p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      Generated: {sessionBrief.timestamp.toLocaleTimeString()}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
