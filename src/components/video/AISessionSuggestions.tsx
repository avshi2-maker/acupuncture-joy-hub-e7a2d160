import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  Lightbulb,
  Target,
  Zap,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Clock,
  X,
  RefreshCw,
  Loader2,
  ChevronRight,
  Shield,
  Heart,
  DollarSign,
  HelpCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  OBJECTION_SCRIPTS,
  BODY_LANGUAGE_SIGNS,
  SUCCESS_RATES,
  PERSUASION_TECHNIQUES,
  type ObjectionScript,
  type BodyLanguageSign
} from '@/data/session-guide-scripts';

interface AISessionSuggestionsProps {
  sessionDuration: number;
  isSessionActive: boolean;
  transcription?: string;
  patientName?: string;
  chiefComplaint?: string;
  currentPhase?: string;
  onSuggestionUsed?: (suggestion: string) => void;
  onClose?: () => void;
  isListening?: boolean;
}

interface Suggestion {
  id: string;
  type: 'objection' | 'technique' | 'body_language' | 'follow_up' | 'closing' | 'ai_insight';
  priority: 'high' | 'medium' | 'low';
  title: string;
  titleHe: string;
  content: string;
  contentHe: string;
  action?: string;
  actionHe?: string;
  timestamp: Date;
  used?: boolean;
  category?: string;
}

interface BodyLanguageCue {
  type: 'positive' | 'resistance' | 'red_flag';
  sign: string;
  action: string;
  timestamp: Date;
}

interface PatientSentiment {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
  objections: string[];
}

// Keywords to detect in transcription
const OBJECTION_KEYWORDS = {
  fear: ['afraid', 'scared', 'fear', 'needle', 'pain', 'hurt', 'מפחד', 'פוחד', 'מחטים', 'כאב'],
  cost: ['expensive', 'money', 'cost', 'afford', 'price', 'יקר', 'כסף', 'מחיר', 'עולה'],
  time: ['time', 'busy', 'schedule', 'can\'t', 'זמן', 'עסוק', 'לא יכול'],
  skepticism: ['doesn\'t work', 'placebo', 'proof', 'evidence', 'לא עובד', 'הוכחה', 'פלצבו'],
  other: ['think about it', 'maybe', 'later', 'not sure', 'לחשוב', 'אולי', 'אחר כך', 'לא בטוח']
};

const POSITIVE_KEYWORDS = ['interested', 'sounds good', 'when', 'how much', 'book', 'schedule', 'מעוניין', 'נשמע טוב', 'מתי', 'לקבוע'];
const RESISTANCE_KEYWORDS = ['but', 'however', 'not sure', 'maybe', 'אבל', 'אולי', 'לא בטוח'];

export function AISessionSuggestions({
  sessionDuration,
  isSessionActive,
  transcription = '',
  patientName = 'מטופל',
  chiefComplaint = '',
  currentPhase = 'phase-1',
  onSuggestionUsed,
  onClose,
  isListening = false
}: AISessionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [bodyLanguageCues, setBodyLanguageCues] = useState<BodyLanguageCue[]>([]);
  const [sentiment, setSentiment] = useState<PatientSentiment>({
    overall: 'neutral',
    confidence: 50,
    keywords: [],
    objections: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'he'>('he');
  const [autoMode, setAutoMode] = useState(true);
  const lastAnalyzedRef = useRef<string>('');
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Analyze transcription for objections and sentiment
  const analyzeTranscription = useCallback((text: string) => {
    if (!text || text === lastAnalyzedRef.current) return;
    lastAnalyzedRef.current = text;

    const lowerText = text.toLowerCase();
    const newSuggestions: Suggestion[] = [];
    const detectedObjections: string[] = [];
    const detectedKeywords: string[] = [];

    // Check for objection keywords
    Object.entries(OBJECTION_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          detectedObjections.push(category);
          detectedKeywords.push(keyword);

          // Find matching objection script
          const script = OBJECTION_SCRIPTS.find(s => s.category === category);
          if (script && !suggestions.some(s => s.id === `objection-${script.id}`)) {
            newSuggestions.push({
              id: `objection-${script.id}`,
              type: 'objection',
              priority: 'high',
              title: script.objection,
              titleHe: script.objectionHe,
              content: script.response,
              contentHe: script.responseHe,
              action: script.followUp,
              actionHe: script.followUpHe,
              timestamp: new Date(),
              category
            });
          }
        }
      });
    });

    // Check for positive signals
    let positiveCount = 0;
    let negativeCount = 0;

    POSITIVE_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        positiveCount++;
        detectedKeywords.push(keyword);
      }
    });

    RESISTANCE_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        negativeCount++;
      }
    });

    // Update sentiment
    const total = positiveCount + negativeCount;
    let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
    let confidence = 50;

    if (total > 0) {
      const ratio = positiveCount / total;
      if (ratio > 0.6) {
        overall = 'positive';
        confidence = Math.min(90, 50 + ratio * 40);
      } else if (ratio < 0.4) {
        overall = 'negative';
        confidence = Math.min(90, 50 + (1 - ratio) * 40);
      }
    }

    setSentiment({
      overall,
      confidence,
      keywords: [...new Set(detectedKeywords)],
      objections: [...new Set(detectedObjections)]
    });

    // Add phase-based suggestions
    const phaseNum = parseInt(currentPhase.replace('phase-', '')) || 1;
    
    if (phaseNum >= 4 && positiveCount > 0 && !suggestions.some(s => s.type === 'closing')) {
      newSuggestions.push({
        id: 'closing-signal',
        type: 'closing',
        priority: 'high',
        title: 'Positive buying signal detected',
        titleHe: 'זוהה סימן קנייה חיובי',
        content: 'Patient showing interest. Consider trial close.',
        contentHe: 'המטופל מראה עניין. שקול לסגור לפגישת ניסיון.',
        action: 'Offer single trial session at $120',
        actionHe: 'הצע פגישת ניסיון בודדת ב-₪400',
        timestamp: new Date()
      });
    }

    if (newSuggestions.length > 0) {
      setSuggestions(prev => [...newSuggestions, ...prev].slice(0, 10));
    }
  }, [suggestions, currentPhase]);

  // Debounced analysis when transcription changes
  useEffect(() => {
    if (!autoMode || !transcription) return;

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeTranscription(transcription);
    }, 1000);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [transcription, autoMode, analyzeTranscription]);

  // Get AI-powered suggestion based on context
  const getAISuggestion = useCallback(async () => {
    if (!transcription && !chiefComplaint) {
      toast.info(language === 'he' ? 'אין מספיק מידע לניתוח' : 'Not enough context for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `You are an AI assistant helping a TCM therapist during a patient consultation.

Current session context:
- Patient: ${patientName}
- Chief complaint: ${chiefComplaint || 'Not specified'}
- Session duration: ${Math.floor(sessionDuration / 60)} minutes
- Current phase: ${currentPhase}
- Recent transcription: "${transcription.slice(-500)}"
- Detected sentiment: ${sentiment.overall}
- Detected objections: ${sentiment.objections.join(', ') || 'None'}

Based on this context, provide:
1. One specific suggestion for what the therapist should say or do next
2. Any concerns or red flags you notice
3. A recommended closing strategy if appropriate

Respond in ${language === 'he' ? 'Hebrew' : 'English'}. Keep it concise and actionable.`;

      const { data, error } = await supabase.functions.invoke('tcm-chat', {
        body: {
          query: prompt,
          history: [],
          useExternalAI: true
        }
      });

      if (error) throw error;

      const aiResponse = data?.response || data?.text || '';
      
      if (aiResponse) {
        const newSuggestion: Suggestion = {
          id: `ai-${Date.now()}`,
          type: 'ai_insight',
          priority: 'high',
          title: language === 'he' ? '💡 המלצת AI' : '💡 AI Recommendation',
          titleHe: '💡 המלצת AI',
          content: aiResponse,
          contentHe: aiResponse,
          timestamp: new Date()
        };
        setSuggestions(prev => [newSuggestion, ...prev].slice(0, 10));
        toast.success(language === 'he' ? 'ניתוח AI הושלם' : 'AI analysis complete');
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error(language === 'he' ? 'שגיאה בניתוח AI' : 'AI analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcription, chiefComplaint, patientName, sessionDuration, currentPhase, sentiment, language]);

  // Add manual body language cue
  const addBodyLanguageCue = useCallback((type: BodyLanguageCue['type'], sign: BodyLanguageSign) => {
    const newCue: BodyLanguageCue = {
      type,
      sign: language === 'he' ? sign.signHe : sign.sign,
      action: language === 'he' ? sign.actionHe : sign.action,
      timestamp: new Date()
    };
    setBodyLanguageCues(prev => [newCue, ...prev].slice(0, 10));

    // Add corresponding suggestion
    const suggestionType = type === 'positive' ? 'closing' : type === 'red_flag' ? 'objection' : 'technique';
    const newSuggestion: Suggestion = {
      id: `body-${Date.now()}`,
      type: suggestionType,
      priority: type === 'red_flag' ? 'high' : type === 'resistance' ? 'medium' : 'low',
      title: `Body language: ${sign.sign}`,
      titleHe: `שפת גוף: ${sign.signHe}`,
      content: sign.action,
      contentHe: sign.actionHe,
      timestamp: new Date()
    };
    setSuggestions(prev => [newSuggestion, ...prev].slice(0, 10));
  }, [language]);

  // Mark suggestion as used
  const markAsUsed = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, used: true } : s
    ));
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      onSuggestionUsed?.(language === 'he' ? suggestion.contentHe : suggestion.content);
    }
  }, [suggestions, onSuggestionUsed, language]);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'objection': return <AlertTriangle className="h-4 w-4" />;
      case 'technique': return <Lightbulb className="h-4 w-4" />;
      case 'body_language': return <Eye className="h-4 w-4" />;
      case 'follow_up': return <ArrowRight className="h-4 w-4" />;
      case 'closing': return <Target className="h-4 w-4" />;
      case 'ai_insight': return <Brain className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/50 text-red-700';
      case 'medium': return 'bg-amber-500/20 border-amber-500/50 text-amber-700';
      case 'low': return 'bg-green-500/20 border-green-500/50 text-green-700';
    }
  };

  const getSentimentColor = (sentiment: PatientSentiment['overall']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-amber-600';
    }
  };

  const getSentimentIcon = (sentiment: PatientSentiment['overall']) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-background">
      {/* Header */}
      <CardHeader className="pb-2 pt-3 border-b bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm">
              {language === 'he' ? 'עוזר AI בזמן אמת' : 'Real-Time AI Assistant'}
            </CardTitle>
            {isListening && (
              <Badge variant="outline" className="text-[10px] bg-green-500/20 border-green-500/50 animate-pulse">
                <Mic className="h-2.5 w-2.5 mr-1" />
                {language === 'he' ? 'מאזין' : 'Listening'}
              </Badge>
            )}
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
              onClick={getAISuggestion}
              disabled={isAnalyzing}
              className="h-6 px-2 text-[10px]"
              title={language === 'he' ? 'קבל המלצת AI' : 'Get AI suggestion'}
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
            </Button>
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

        {/* Sentiment Indicator */}
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('flex items-center gap-1', getSentimentColor(sentiment.overall))}>
                {getSentimentIcon(sentiment.overall)}
                <span className="text-[10px] font-medium">
                  {language === 'he' 
                    ? sentiment.overall === 'positive' ? 'חיובי' : sentiment.overall === 'negative' ? 'שלילי' : 'ניטרלי'
                    : sentiment.overall.charAt(0).toUpperCase() + sentiment.overall.slice(1)
                  }
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({Math.round(sentiment.confidence)}% {language === 'he' ? 'ביטחון' : 'confidence'})
              </span>
            </div>
            {sentiment.objections.length > 0 && (
              <Badge variant="destructive" className="text-[9px]">
                {sentiment.objections.length} {language === 'he' ? 'התנגדויות' : 'objections'}
              </Badge>
            )}
          </div>
          <Progress 
            value={sentiment.overall === 'positive' ? sentiment.confidence : sentiment.overall === 'negative' ? 100 - sentiment.confidence : 50} 
            className="h-1.5"
          />
        </div>
      </CardHeader>

      {/* Body Language Quick Buttons */}
      <div className="px-2 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
          <Eye className="h-3 w-3" />
          {language === 'he' ? 'סמן שפת גוף:' : 'Mark body language:'}
        </div>
        <div className="flex flex-wrap gap-1">
          {BODY_LANGUAGE_SIGNS.slice(0, 6).map((sign, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => addBodyLanguageCue(sign.meaning, sign)}
              className={cn(
                'h-6 px-2 text-[9px]',
                sign.meaning === 'positive' && 'border-green-500/50 hover:bg-green-500/10',
                sign.meaning === 'resistance' && 'border-amber-500/50 hover:bg-amber-500/10',
                sign.meaning === 'red_flag' && 'border-red-500/50 hover:bg-red-500/10'
              )}
            >
              {sign.meaning === 'positive' && <ThumbsUp className="h-2.5 w-2.5 mr-1 text-green-600" />}
              {sign.meaning === 'resistance' && <HelpCircle className="h-2.5 w-2.5 mr-1 text-amber-600" />}
              {sign.meaning === 'red_flag' && <AlertTriangle className="h-2.5 w-2.5 mr-1 text-red-600" />}
              {language === 'he' ? sign.signHe.slice(0, 15) : sign.sign.slice(0, 15)}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          <AnimatePresence mode="popLayout">
            {suggestions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {language === 'he' 
                    ? 'המלצות יופיעו כאן בזמן אמת' 
                    : 'Suggestions will appear here in real-time'
                  }
                </p>
                <p className="text-xs mt-1">
                  {language === 'he'
                    ? isListening ? 'מנתח את השיחה...' : 'התחל הקלטה לקבלת המלצות'
                    : isListening ? 'Analyzing conversation...' : 'Start recording for suggestions'
                  }
                </p>
              </motion.div>
            ) : (
              suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className={cn(
                    'p-2.5 rounded-lg border transition-all',
                    suggestion.used 
                      ? 'opacity-50 bg-muted/30' 
                      : getPriorityColor(suggestion.priority)
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      'p-1 rounded shrink-0',
                      suggestion.type === 'ai_insight' ? 'bg-purple-500 text-white' : 'bg-muted'
                    )}>
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-semibold text-xs">
                          {language === 'he' ? suggestion.titleHe : suggestion.title}
                        </span>
                        {suggestion.priority === 'high' && !suggestion.used && (
                          <Badge variant="destructive" className="text-[8px] px-1">
                            {language === 'he' ? 'דחוף' : 'URGENT'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {language === 'he' ? suggestion.contentHe : suggestion.content}
                      </p>
                      {(suggestion.action || suggestion.actionHe) && (
                        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-primary">
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span className="font-medium">
                            {language === 'he' ? suggestion.actionHe : suggestion.action}
                          </span>
                        </div>
                      )}
                    </div>
                    {!suggestion.used && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsUsed(suggestion.id)}
                        className="h-6 w-6 p-0 shrink-0"
                        title={language === 'he' ? 'סמן כהשתמש' : 'Mark as used'}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Quick Actions Footer */}
      <div className="p-2 border-t bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={getAISuggestion}
            disabled={isAnalyzing}
            className="flex-1 h-7 text-[10px]"
          >
            {isAnalyzing ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Brain className="h-3 w-3 mr-1" />
            )}
            {language === 'he' ? 'ניתוח AI' : 'AI Analysis'}
          </Button>
          <Button
            variant={autoMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoMode(!autoMode)}
            className="h-7 text-[10px]"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', autoMode && 'animate-spin')} />
            {language === 'he' ? 'אוטומטי' : 'Auto'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
