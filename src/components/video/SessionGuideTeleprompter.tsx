import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Shield,
  Heart,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  SESSION_PHASES,
  OBJECTION_SCRIPTS,
  SUCCESS_RATES,
  BODY_LANGUAGE_SIGNS,
  PERSUASION_TECHNIQUES,
  ETHICAL_GUIDELINES,
  POST_SESSION_TASKS,
  type SessionPhase,
  type PhaseItem,
  type ObjectionScript
} from '@/data/session-guide-scripts';

interface SessionGuideTeleprompterProps {
  sessionDuration: number; // in seconds
  isSessionActive: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  jade: 'bg-jade/20 border-jade/50 text-jade',
  blue: 'bg-blue-500/20 border-blue-500/50 text-blue-600',
  amber: 'bg-amber-500/20 border-amber-500/50 text-amber-600',
  purple: 'bg-purple-500/20 border-purple-500/50 text-purple-600',
  orange: 'bg-orange-500/20 border-orange-500/50 text-orange-600',
  green: 'bg-green-500/20 border-green-500/50 text-green-600',
};

const PHASE_BG_COLORS: Record<string, string> = {
  jade: 'from-jade/10 to-jade/5',
  blue: 'from-blue-500/10 to-blue-500/5',
  amber: 'from-amber-500/10 to-amber-500/5',
  purple: 'from-purple-500/10 to-purple-500/5',
  orange: 'from-orange-500/10 to-orange-500/5',
  green: 'from-green-500/10 to-green-500/5',
};

export function SessionGuideTeleprompter({
  sessionDuration,
  isSessionActive,
  onClose,
  isExpanded = false,
  onToggleExpand
}: SessionGuideTeleprompterProps) {
  const [activeTab, setActiveTab] = useState<'script' | 'objections' | 'stats' | 'body' | 'ethics'>('script');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase-1']));
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'he'>('he');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate current phase based on session duration
  const currentMinute = Math.floor(sessionDuration / 60);
  const currentPhase = useMemo(() => {
    return SESSION_PHASES.find(
      phase => currentMinute >= phase.startMinute && currentMinute < phase.endMinute
    ) || SESSION_PHASES[0];
  }, [currentMinute]);

  // Auto-expand current phase when session is active
  useEffect(() => {
    if (isSessionActive && currentPhase) {
      setExpandedPhases(prev => new Set([...prev, currentPhase.id]));
    }
  }, [currentPhase?.id, isSessionActive]);

  // Calculate overall progress
  const totalItems = SESSION_PHASES.reduce((acc, phase) => acc + phase.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercent = (completedCount / totalItems) * 100;

  // Phase progress
  const phaseProgress = useMemo(() => {
    return SESSION_PHASES.map(phase => {
      const phaseItems = phase.items.length;
      const phaseCompleted = phase.items.filter(item => completedItems.has(item.id)).length;
      return { id: phase.id, percent: phaseItems > 0 ? (phaseCompleted / phaseItems) * 100 : 0 };
    });
  }, [completedItems]);

  const toggleItem = (itemId: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const copyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    toast.success('Script copied!');
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const resetProgress = () => {
    setCompletedItems(new Set());
    toast.info('Progress reset');
  };

  const formatTime = (minutes: number) => {
    return `${minutes}:00`;
  };

  const getItemIcon = (type: PhaseItem['type']) => {
    switch (type) {
      case 'script': return <MessageSquare className="h-3 w-3" />;
      case 'action': return <Zap className="h-3 w-3" />;
      case 'demo': return <Eye className="h-3 w-3" />;
      case 'question': return <MessageSquare className="h-3 w-3" />;
      case 'checkpoint': return <Target className="h-3 w-3" />;
      default: return <BookOpen className="h-3 w-3" />;
    }
  };

  const getBodyLanguageColor = (meaning: 'positive' | 'resistance' | 'red_flag') => {
    switch (meaning) {
      case 'positive': return 'bg-green-500/20 border-green-500/50 text-green-700';
      case 'resistance': return 'bg-amber-500/20 border-amber-500/50 text-amber-700';
      case 'red_flag': return 'bg-red-500/20 border-red-500/50 text-red-700';
    }
  };

  return (
    <Card className={cn(
      'flex flex-col h-full overflow-hidden border-2',
      isExpanded ? 'fixed inset-4 z-50' : ''
    )}>
      {/* Header */}
      <CardHeader className="pb-2 pt-3 border-b bg-gradient-to-r from-jade/10 to-gold/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-jade" />
            <CardTitle className="text-sm">
              {language === 'he' ? 'מדריך פגישה' : 'Session Guide'}
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {language === 'he' ? currentPhase.nameHe : currentPhase.name}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(l => l === 'en' ? 'he' : 'en')}
              className="h-6 px-2 text-[10px]"
            >
              {language === 'he' ? 'EN' : 'עב'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetProgress}
              className="h-6 w-6 p-0"
              title="Reset progress"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">
              {language === 'he' ? 'התקדמות כללית' : 'Overall Progress'}
            </span>
            <span className="font-bold text-jade">{completedCount}/{totalItems}</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          
          {/* Phase Timeline */}
          <div className="flex gap-0.5 mt-2">
            {SESSION_PHASES.map((phase, idx) => {
              const isCurrentPhase = phase.id === currentPhase.id;
              const phaseProgressData = phaseProgress.find(p => p.id === phase.id);
              return (
                <div
                  key={phase.id}
                  className={cn(
                    'flex-1 h-2 rounded-full relative overflow-hidden cursor-pointer transition-all',
                    isCurrentPhase ? 'ring-2 ring-jade ring-offset-1' : '',
                    PHASE_COLORS[phase.color]
                  )}
                  onClick={() => togglePhase(phase.id)}
                  title={language === 'he' ? phase.nameHe : phase.name}
                >
                  <div
                    className={cn('absolute inset-y-0 left-0 bg-current opacity-50')}
                    style={{ width: `${phaseProgressData?.percent || 0}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                    {idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-5 mx-2 mt-2 h-7">
          <TabsTrigger value="script" className="text-[10px] h-6">
            {language === 'he' ? 'תסריט' : 'Script'}
          </TabsTrigger>
          <TabsTrigger value="objections" className="text-[10px] h-6">
            {language === 'he' ? 'התנגדויות' : 'Objections'}
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-[10px] h-6">
            {language === 'he' ? 'נתונים' : 'Stats'}
          </TabsTrigger>
          <TabsTrigger value="body" className="text-[10px] h-6">
            {language === 'he' ? 'שפת גוף' : 'Body'}
          </TabsTrigger>
          <TabsTrigger value="ethics" className="text-[10px] h-6">
            {language === 'he' ? 'אתיקה' : 'Ethics'}
          </TabsTrigger>
        </TabsList>

        {/* Script Tab - Main Teleprompter */}
        <TabsContent value="script" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="p-2 space-y-2">
              {SESSION_PHASES.map((phase) => {
                const isCurrentPhase = phase.id === currentPhase.id;
                const isExpanded = expandedPhases.has(phase.id);
                const phaseProgressData = phaseProgress.find(p => p.id === phase.id);

                return (
                  <Collapsible
                    key={phase.id}
                    open={isExpanded}
                    onOpenChange={() => togglePhase(phase.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border',
                          isCurrentPhase
                            ? `${PHASE_COLORS[phase.color]} border-2 shadow-md`
                            : 'bg-muted/30 border-border hover:bg-muted/50'
                        )}
                      >
                        <span className="text-lg">{phase.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs truncate">
                              {language === 'he' ? phase.nameHe : phase.name}
                            </span>
                            <Badge variant="outline" className="text-[8px] shrink-0">
                              {formatTime(phase.startMinute)}-{formatTime(phase.endMinute)}
                            </Badge>
                          </div>
                          <Progress 
                            value={phaseProgressData?.percent || 0} 
                            className="h-1 mt-1" 
                          />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className={cn(
                        'mt-1 rounded-lg border p-2 space-y-2 bg-gradient-to-b',
                        PHASE_BG_COLORS[phase.color]
                      )}>
                        {phase.items.map((item) => {
                          const isCompleted = completedItems.has(item.id);
                          const isCheckpoint = item.type === 'checkpoint';

                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                'p-2 rounded-md border transition-all',
                                isCheckpoint
                                  ? 'bg-jade/20 border-jade/50'
                                  : isCompleted
                                  ? 'bg-green-500/10 border-green-500/30 opacity-70'
                                  : 'bg-background/80 border-border'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => toggleItem(item.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={cn(
                                      'p-0.5 rounded',
                                      isCheckpoint ? 'bg-jade text-white' : 'bg-muted'
                                    )}>
                                      {getItemIcon(item.type)}
                                    </span>
                                    <span className={cn(
                                      'font-medium text-[11px]',
                                      isCompleted && 'line-through'
                                    )}>
                                      {language === 'he' ? item.titleHe : item.title}
                                    </span>
                                  </div>

                                  {/* Script Content */}
                                  {(item.script || item.scriptHe) && (
                                    <div className="relative group">
                                      <p className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-jade/50 italic">
                                        "{language === 'he' ? item.scriptHe : item.script}"
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyScript(
                                          language === 'he' ? item.scriptHe! : item.script!,
                                          item.id
                                        )}
                                        className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        {copiedScript === item.id ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {/* Tips */}
                                  {(item.tips || item.tipsHe) && (
                                    <div className="mt-1.5 space-y-0.5">
                                      {(language === 'he' ? item.tipsHe : item.tips)?.map((tip, idx) => (
                                        <div key={idx} className="flex items-center gap-1 text-[9px] text-amber-600">
                                          <Zap className="h-2.5 w-2.5" />
                                          <span>{tip}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Objections Tab */}
        <TabsContent value="objections" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {OBJECTION_SCRIPTS.map((obj) => (
                <Card key={obj.id} className="border">
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-[8px] shrink-0 capitalize">
                        {obj.category}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[11px] text-destructive mb-1">
                          "{language === 'he' ? obj.objectionHe : obj.objection}"
                        </p>
                        <div className="relative group">
                          <p className="text-[10px] bg-green-500/10 p-2 rounded border-l-2 border-green-500/50">
                            {language === 'he' ? obj.responseHe : obj.response}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyScript(
                              language === 'he' ? obj.responseHe : obj.response,
                              obj.id
                            )}
                            className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                          >
                            {copiedScript === obj.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {(obj.followUp || obj.followUpHe) && (
                          <p className="text-[9px] text-muted-foreground mt-1 italic">
                            + {language === 'he' ? obj.followUpHe : obj.followUp}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-3">
              <h4 className="font-semibold text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-jade" />
                {language === 'he' ? 'שיעורי הצלחה' : 'Success Rates'}
              </h4>
              <div className="space-y-1.5">
                {SUCCESS_RATES.map((rate) => (
                  <div key={rate.condition} className="flex items-center gap-2 p-2 bg-muted/50 rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-[11px]">
                        {language === 'he' ? rate.conditionHe : rate.condition}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{rate.evidence}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-jade text-white text-[10px]">{rate.successRate}</Badge>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{rate.sessions} sessions</p>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="font-semibold text-xs flex items-center gap-1 mt-4">
                <Heart className="h-3 w-3 text-purple-500" />
                {language === 'he' ? 'טכניקות שכנוע' : 'Persuasion Techniques'}
              </h4>
              <div className="space-y-1.5">
                {PERSUASION_TECHNIQUES.map((tech) => (
                  <div key={tech.name} className="p-2 bg-purple-500/10 rounded border border-purple-500/30">
                    <p className="font-medium text-[11px] text-purple-700">
                      {language === 'he' ? tech.nameHe : tech.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground italic">
                      {language === 'he' ? tech.exampleHe : tech.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Body Language Tab */}
        <TabsContent value="body" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-3">
              {(['positive', 'resistance', 'red_flag'] as const).map((category) => {
                const signs = BODY_LANGUAGE_SIGNS.filter(s => s.meaning === category);
                const categoryLabels = {
                  positive: { en: '✅ Positive Signs (Encourage Closing)', he: '✅ סימנים חיוביים (עודד סגירה)' },
                  resistance: { en: '⚠️ Resistance Signs (Slow Down)', he: '⚠️ סימני התנגדות (האט)' },
                  red_flag: { en: '🚫 Red Flags (STOP)', he: '🚫 דגלים אדומים (עצור)' }
                };

                return (
                  <div key={category}>
                    <h4 className="font-semibold text-xs mb-1.5">
                      {language === 'he' ? categoryLabels[category].he : categoryLabels[category].en}
                    </h4>
                    <div className="space-y-1">
                      {signs.map((sign) => (
                        <div
                          key={sign.sign}
                          className={cn(
                            'p-2 rounded border text-[10px]',
                            getBodyLanguageColor(sign.meaning)
                          )}
                        >
                          <p className="font-medium">
                            {language === 'he' ? sign.signHe : sign.sign}
                          </p>
                          <p className="opacity-80 mt-0.5">
                            → {language === 'he' ? sign.actionHe : sign.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Ethics Tab */}
        <TabsContent value="ethics" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-3">
              <div>
                <h4 className="font-semibold text-xs flex items-center gap-1 text-green-600 mb-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {language === 'he' ? 'תמיד חייב' : 'Must Always'}
                </h4>
                <div className="space-y-1">
                  {(language === 'he' ? ETHICAL_GUIDELINES.mustAlwaysHe : ETHICAL_GUIDELINES.mustAlways).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px] p-1.5 bg-green-500/10 rounded">
                      <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs flex items-center gap-1 text-red-600 mb-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  {language === 'he' ? 'אסור לעולם' : 'Must Never'}
                </h4>
                <div className="space-y-1">
                  {(language === 'he' ? ETHICAL_GUIDELINES.mustNeverHe : ETHICAL_GUIDELINES.mustNever).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px] p-1.5 bg-red-500/10 rounded">
                      <X className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs flex items-center gap-1 mb-1.5">
                  <Clock className="h-3 w-3" />
                  {language === 'he' ? 'משימות לאחר הפגישה' : 'Post-Session Tasks'}
                </h4>
                <div className="space-y-1">
                  {POST_SESSION_TASKS.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-[10px] p-1.5 bg-muted/50 rounded">
                      <Checkbox />
                      <span>{language === 'he' ? task.taskHe : task.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
