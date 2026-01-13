import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Search, Loader2, MessageCircleQuestion, Sparkles, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
  content_type: string;
}

interface QuickPromptDropdownProps {
  onSelectQuestion: (question: string) => void;
  onAutoSubmit?: boolean; // If true, trigger search immediately
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

// Content type labels in Hebrew
const CONTENT_TYPE_LABELS: Record<string, string> = {
  'questionnaire': 'שאלון קליני',
  'qa': 'שאלות ותשובות',
  'pulse_type': 'דופק',
  'tongue_coating': 'לשון',
  'five_elements': 'חמשת היסודות',
  'clinical_patterns': 'דפוסים קליניים',
  'yin_yang': 'יין-יאנג',
};

// Content type colors
const CONTENT_TYPE_COLORS: Record<string, string> = {
  'questionnaire': 'bg-violet-500/10 text-violet-700 border-violet-500/30',
  'qa': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  'pulse_type': 'bg-rose-500/10 text-rose-700 border-rose-500/30',
  'tongue_coating': 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  'five_elements': 'bg-green-500/10 text-green-700 border-green-500/30',
  'clinical_patterns': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30',
};

export function QuickPromptDropdown({
  onSelectQuestion,
  onAutoSubmit = true,
  disabled = false,
  className,
  placeholder = 'בחר שאלה מהיה...',
}: QuickPromptDropdownProps) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch Hebrew questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('knowledge_chunks')
          .select('id, question, answer, content_type')
          .eq('language', 'he')
          .in('content_type', ['questionnaire', 'qa', 'pulse_type', 'tongue_coating', 'five_elements', 'clinical_patterns'])
          .not('question', 'is', null)
          .order('content_type')
          .limit(300);

        if (error) {
          console.error('Error fetching questions:', error);
        } else if (data) {
          setQuestions(data.filter(q => q.question && q.question.trim().length > 0));
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open && questions.length === 0) {
      fetchQuestions();
    }
  }, [open, questions.length]);

  // Get unique content types for filtering
  const contentTypes = useMemo(() => {
    const types = new Set(questions.map(q => q.content_type));
    return Array.from(types);
  }, [questions]);

  // Filter questions by search and category
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    if (activeCategory) {
      filtered = filtered.filter(q => q.content_type === activeCategory);
    }

    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(search) ||
        q.answer?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [questions, searchFilter, activeCategory]);

  // Group questions by content type
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, QuestionItem[]> = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.content_type]) {
        groups[q.content_type] = [];
      }
      groups[q.content_type].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const handleSelect = (question: string) => {
    onSelectQuestion(question);
    setOpen(false);
    setSearchFilter('');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 justify-between bg-gradient-to-r from-violet-500/10 to-jade/10 border-violet-500/30 hover:from-violet-500/20 hover:to-jade/20",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <MessageCircleQuestion className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium" dir="rtl">{placeholder}</span>
          </div>
          <div className="flex items-center gap-1">
            {questions.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {questions.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-96 max-h-[500px] overflow-hidden z-50 bg-background border shadow-xl"
        align="start"
      >
        <div dir="rtl">
        {/* Search Input */}
        <div className="p-2 border-b sticky top-0 bg-background z-10">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש שאלות..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pr-8 text-sm h-8"
              dir="rtl"
            />
          </div>
        </div>

        {/* Category Filters */}
        {contentTypes.length > 1 && (
          <div className="p-2 border-b flex flex-wrap gap-1">
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className="cursor-pointer text-[10px]"
              onClick={() => setActiveCategory(null)}
            >
              הכל
            </Badge>
            {contentTypes.map(type => (
              <Badge
                key={type}
                variant={activeCategory === type ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-[10px]",
                  activeCategory !== type && CONTENT_TYPE_COLORS[type]
                )}
                onClick={() => setActiveCategory(type === activeCategory ? null : type)}
              >
                {CONTENT_TYPE_LABELS[type] || type}
              </Badge>
            ))}
          </div>
        )}

        {/* Questions List */}
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
              <span className="mr-2 text-sm text-muted-foreground">טוען שאלות...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {searchFilter ? 'לא נמצאו שאלות תואמות' : 'אין שאלות זמינות'}
            </div>
          ) : (
            <div className="p-1">
              {Object.entries(groupedQuestions).map(([type, items]) => (
                <div key={type}>
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground flex items-center gap-1 py-1">
                    <Sparkles className="h-3 w-3" />
                    {CONTENT_TYPE_LABELS[type] || type} ({items.length})
                  </DropdownMenuLabel>
                  {items.map((q) => (
                    <DropdownMenuItem
                      key={q.id}
                      onClick={() => handleSelect(q.question)}
                      className="flex flex-col items-start gap-1 py-2 px-3 cursor-pointer focus:bg-violet-500/10"
                    >
                      <span className="text-sm font-medium text-foreground leading-relaxed">
                        {q.question}
                      </span>
                      {q.answer && (
                        <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {q.answer.slice(0, 100)}...
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t bg-muted/30 text-center">
          <span className="text-[10px] text-muted-foreground">
            💡 לחץ על שאלה כדי למלא אותה אוטומטית
          </span>
        </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default QuickPromptDropdown;
