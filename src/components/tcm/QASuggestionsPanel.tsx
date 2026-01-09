import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Lightbulb, MessageSquare, Shuffle, Search, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Q&A data from patient-qa-knowledge.csv format
const QA_SUGGESTIONS = [
  // Before Treatment
  { id: 'b1', stage: 'Before', question: 'What is your primary reason for seeking acupuncture?', hint: 'Chief complaint', treatment: 'Use 6–10 needles; focus on affected meridians' },
  { id: 'b2', stage: 'Before', question: 'When did your symptoms begin?', hint: 'Timeline', treatment: 'Choose acute vs chronic protocol' },
  { id: 'b3', stage: 'Before', question: 'What makes your symptoms better or worse?', hint: 'Triggers', treatment: 'Target reactive points' },
  { id: 'b4', stage: 'Before', question: 'Are you under physician\'s care or other therapies?', hint: 'Coordination', treatment: 'Avoid overlapping modalities' },
  { id: 'b5', stage: 'Before', question: 'Do you have allergies, chronic conditions, or surgeries?', hint: 'Safety', treatment: 'Avoid sensitive areas' },
  { id: 'b6', stage: 'Before', question: 'What medications or supplements are you taking?', hint: 'Interactions', treatment: 'Avoid conflicting herbs' },
  { id: 'b7', stage: 'Before', question: 'How is your sleep, digestion, and energy?', hint: 'Wellness', treatment: 'SP6, ST36, LI4; 8–12 needles' },
  { id: 'b8', stage: 'Before', question: 'Do you experience stress, anxiety, or mood swings?', hint: 'Emotional', treatment: 'GV20, HT7, PC6; calming points' },
  { id: 'b9', stage: 'Before', question: 'What is your diet and exercise routine?', hint: 'Lifestyle', treatment: 'ST36, CV12; 6–10 needles' },
  { id: 'b10', stage: 'Before', question: 'History of trauma (physical/emotional)?', hint: 'Approach', treatment: 'Gentle needling; KD1, ST36' },
  { id: 'b11', stage: 'Before', question: 'Regular bowel movements? Any issues?', hint: 'TCM diagnostic', treatment: 'ST25, CV6, SP15; 6–8 needles' },
  { id: 'b12', stage: 'Before', question: 'Menstrual cycle regularity and symptoms?', hint: 'Hormonal', treatment: 'SP6, CV4, LV3; cycle-based' },
  { id: 'b13', stage: 'Before', question: 'Night sweats, chills, hot flashes?', hint: 'Yin/Yang', treatment: 'KD3, LI11, GV14; 8–10 needles' },
  { id: 'b14', stage: 'Before', question: 'Do you dream often? Are they vivid/disturbing?', hint: 'Mental health', treatment: 'HT7, Anmian, PC6' },
  { id: 'b15', stage: 'Before', question: 'Time of day you feel most energetic/fatigued?', hint: 'Qi flow', treatment: 'Circadian-based points' },
  { id: 'b16', stage: 'Before', question: 'Have you had acupuncture before?', hint: 'Experience', treatment: 'Start with fewer needles if new' },
  { id: 'b17', stage: 'Before', question: 'Comfortable with needles and process?', hint: 'Consent', treatment: 'Shallow insertion' },
  
  // During Treatment
  { id: 'd1', stage: 'During', question: 'How are you feeling today vs last visit?', hint: 'Progress', treatment: 'Adjust needle count based on feedback' },
  { id: 'd2', stage: 'During', question: 'Changes in symptoms?', hint: 'Effectiveness', treatment: 'Reinforce effective points' },
  { id: 'd3', stage: 'During', question: 'New concerns or discomforts?', hint: 'Adjustments', treatment: 'Consider cupping or moxa' },
  { id: 'd4', stage: 'During', question: 'How did you feel after last treatment?', hint: 'Response', treatment: 'Adjust retention time' },
  { id: 'd5', stage: 'During', question: 'Followed aftercare instructions?', hint: 'Compliance', treatment: 'Reinforce hydration and rest' },
  { id: 'd6', stage: 'During', question: 'Tingling, heaviness, warmth during needling?', hint: 'De Qi', treatment: 'Adjust depth or technique' },
  { id: 'd7', stage: 'During', question: 'Want cupping, moxibustion, or herbs today?', hint: 'Modalities', treatment: 'Add based on condition' },
  { id: 'd8', stage: 'During', question: 'Areas to focus more on?', hint: 'Preferences', treatment: 'Prioritize zones' },
  
  // Ongoing Meetings
  { id: 'o1', stage: 'Ongoing', question: 'How has your condition evolved?', hint: 'Long-term', treatment: 'Reduce frequency or maintain' },
  { id: 'o2', stage: 'Ongoing', question: 'Fewer flare-ups or episodes?', hint: 'Reduction', treatment: 'Consider maintenance plan' },
  { id: 'o3', stage: 'Ongoing', question: 'Sleep, mood, energy now?', hint: 'Overall', treatment: 'Adjust points for balance' },
  { id: 'o4', stage: 'Ongoing', question: 'Able to perform daily activities more easily?', hint: 'Functional', treatment: 'Reinforce musculoskeletal points' },
  { id: 'o5', stage: 'Ongoing', question: 'Lifestyle changes (diet, exercise, stress)?', hint: 'Habits', treatment: 'Encourage supportive points' },
  { id: 'o6', stage: 'Ongoing', question: 'Need support with herbs, nutrition, mindfulness?', hint: 'Holistic', treatment: 'Recommend adjunct therapies' },
  { id: 'o7', stage: 'Ongoing', question: 'Feel informed and supported?', hint: 'Satisfaction', treatment: 'Offer education' },
  { id: 'o8', stage: 'Ongoing', question: 'Want educational materials or wellness tips?', hint: 'Engagement', treatment: 'Provide handouts' },
  { id: 'o9', stage: 'Ongoing', question: 'Satisfied with communication style/frequency?', hint: 'Quality', treatment: 'Adjust follow-up method' },
  { id: 'o10', stage: 'Ongoing', question: 'Would you recommend acupuncture to others?', hint: 'Feedback', treatment: 'Ask for testimonial' },
] as const;

type Stage = 'Before' | 'During' | 'Ongoing' | 'Favorites';

const FAVORITES_STORAGE_KEY = 'tcm-qa-favorites';

// Session stage thresholds (in seconds)
const STAGE_THRESHOLDS = {
  Before: 0,        // 0-10 min
  During: 600,      // 10-30 min
  Ongoing: 1800,    // 30+ min
};

function getAutoStage(sessionSeconds: number): 'Before' | 'During' | 'Ongoing' {
  if (sessionSeconds >= STAGE_THRESHOLDS.Ongoing) return 'Ongoing';
  if (sessionSeconds >= STAGE_THRESHOLDS.During) return 'During';
  return 'Before';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface QASuggestionsPanelProps {
  onSelectQuestion: (question: string) => void;
  sessionSeconds?: number;
  className?: string;
}

export function QASuggestionsPanel({ 
  onSelectQuestion,
  sessionSeconds = 0,
  className 
}: QASuggestionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Stage>('Before');
  const [autoMode, setAutoMode] = useState(true);
  
  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }, []);

  // Auto-detect stage based on session timer
  useEffect(() => {
    if (autoMode && sessionSeconds > 0) {
      const detectedStage = getAutoStage(sessionSeconds);
      if (detectedStage !== activeTab && activeTab !== 'Favorites') {
        setActiveTab(detectedStage);
      }
    }
  }, [sessionSeconds, autoMode, activeTab]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id];
      
      // Save to localStorage
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      } catch (e) {
        console.error('Failed to save favorites:', e);
      }
      
      return newFavorites;
    });
  };

  const filteredQuestions = useMemo(() => {
    let questions = activeTab === 'Favorites'
      ? QA_SUGGESTIONS.filter(q => favorites.includes(q.id))
      : QA_SUGGESTIONS.filter(q => q.stage === activeTab);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(term) || 
        q.hint.toLowerCase().includes(term) ||
        q.treatment.toLowerCase().includes(term)
      );
    }
    return questions;
  }, [activeTab, searchTerm, favorites]);

  const getRandomQuestion = () => {
    const questions = activeTab === 'Favorites'
      ? QA_SUGGESTIONS.filter(q => favorites.includes(q.id))
      : QA_SUGGESTIONS.filter(q => q.stage === activeTab);
    const random = questions[Math.floor(Math.random() * questions.length)];
    if (random) onSelectQuestion(random.question);
  };

  const stageConfig = {
    Before: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: '🔹' },
    During: { color: 'bg-jade/10 text-jade border-jade/30', icon: '🔸' },
    Ongoing: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: '🔶' },
    Favorites: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: '⭐' },
  };

  const autoDetectedStage = getAutoStage(sessionSeconds);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between p-3 h-auto bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 hover:from-violet-500/15 hover:to-fuchsia-500/15 border border-violet-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600">
              Ready-Made Questions
            </span>
            <Badge variant="secondary" className="text-xs bg-violet-500/20 text-violet-600">
              {QA_SUGGESTIONS.length} Q&A
            </Badge>
            {favorites.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600">
                <Star className="w-3 h-3 mr-0.5 fill-current" />
                {favorites.length}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-violet-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-violet-500" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2 space-y-2">
        {/* Auto-detect indicator */}
        {sessionSeconds > 0 && (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/50 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                Session: <strong>{formatTime(sessionSeconds)}</strong>
              </span>
              <span className="text-violet-600">
                → Auto: <strong>{autoDetectedStage}</strong>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoMode(!autoMode)}
              className={cn(
                "h-5 text-[10px] px-2",
                autoMode ? "text-violet-600" : "text-muted-foreground"
              )}
            >
              {autoMode ? '🔄 Auto' : '✋ Manual'}
            </Button>
          </div>
        )}

        {/* Stage Tabs + Favorites */}
        <div className="flex gap-1 flex-wrap">
          {(['Before', 'During', 'Ongoing', 'Favorites'] as Stage[]).map((stage) => {
            const count = stage === 'Favorites' 
              ? favorites.length
              : QA_SUGGESTIONS.filter(q => q.stage === stage).length;
            const isActive = activeTab === stage;
            const isAutoSuggested = autoMode && stage !== 'Favorites' && stage === autoDetectedStage;
            
            return (
              <Button
                key={stage}
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab(stage);
                  if (stage !== 'Favorites') setAutoMode(false);
                }}
                className={cn(
                  "text-xs h-7 transition-all",
                  isActive && stageConfig[stage].color,
                  isAutoSuggested && !isActive && "ring-1 ring-violet-400 ring-offset-1"
                )}
              >
                {stage === 'Favorites' ? (
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-500" />
                ) : (
                  <span className="mr-1">{stageConfig[stage].icon}</span>
                )}
                {stage}
                <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                  {count}
                </Badge>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomQuestion}
            className="text-xs h-7 ml-auto text-violet-600 hover:text-violet-700"
          >
            <Shuffle className="w-3 h-3 mr-1" />
            Random
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs pl-7"
          />
        </div>

        {/* Questions List */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-1.5 pr-2">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {activeTab === 'Favorites' ? (
                  <>
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No favorites yet</p>
                    <p className="text-[10px]">Click ⭐ on questions to save them</p>
                  </>
                ) : (
                  <p className="text-xs">No matching questions</p>
                )}
              </div>
            ) : (
              filteredQuestions.map((qa) => {
                const isFavorite = favorites.includes(qa.id);
                return (
                  <div
                    key={qa.id}
                    className="flex items-start gap-1 p-2 rounded-md bg-muted/50 hover:bg-violet-500/10 transition-colors group border border-transparent hover:border-violet-500/30"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(qa.id);
                      }}
                      className={cn(
                        "h-6 w-6 p-0 shrink-0",
                        isFavorite ? "text-yellow-500" : "text-muted-foreground/40 hover:text-yellow-400"
                      )}
                    >
                      <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
                    </Button>
                    <button
                      onClick={() => onSelectQuestion(qa.question)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 mt-1 text-violet-500 opacity-60 group-hover:opacity-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-violet-700 leading-tight">
                            {qa.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-muted-foreground">
                              {qa.hint}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground truncate">
                              → {qa.treatment}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <p className="text-[9px] text-center text-violet-500/70">
          💡 Click question to send • ⭐ to favorite • Auto-switches by session time
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
