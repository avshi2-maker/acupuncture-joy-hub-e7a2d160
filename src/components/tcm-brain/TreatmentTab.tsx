import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Send, Bookmark, BookmarkCheck, Pill, Leaf, MapPin, Flame } from 'lucide-react';
import { QuickActionsBar } from './QuickActionsBar';
import { Message } from '@/hooks/useTcmBrainState';
import { SelectedPatient } from '@/components/crm/PatientSelectorDropdown';

// Treatment questions organized by category
const treatmentQuestions = [
  { id: 't1', question: 'Any additional tests needed?', category: 'Planning' },
  { id: 't2', question: 'Any breathing exercises recommended?', category: 'Practice' },
  { id: 't3', question: 'Any circadian rhythm considerations?', category: 'Seasonal' },
  { id: 't4', question: 'Any contraindications present?', category: 'Herbs' },
  { id: 't5', question: 'Any ear points recommended?', category: 'Ear' },
  { id: 't6', question: 'Any exercise recommendations?', category: 'Lifestyle' },
  { id: 't7', question: 'Any foods to add?', category: 'Nutrition' },
  { id: 't8', question: 'Any foods to avoid?', category: 'Nutrition' },
  { id: 't9', question: 'Any meditation recommendations?', category: 'Emotional' },
  { id: 't10', question: 'Any safety precautions?', category: 'Safety' },
  { id: 't11', question: 'Any sleep recommendations?', category: 'Lifestyle' },
  { id: 't12', question: 'Any stress management tips?', category: 'Lifestyle' },
  { id: 't13', question: 'Expected treatment duration?', category: 'Planning' },
  { id: 't14', question: 'How many acupuncture sessions needed?', category: 'Acupuncture' },
  { id: 't15', question: 'How long to take herbs?', category: 'Herbs' },
  { id: 't16', question: 'Lifestyle recommendations?', category: 'Lifestyle' },
  { id: 't17', question: 'Recommended herb dosage?', category: 'Herbs' },
  { id: 't18', question: 'Recommended herbal formula?', category: 'Herbs' },
  { id: 't19', question: 'Should cupping be used?', category: 'Techniques' },
  { id: 't20', question: 'Should moxibustion be used?', category: 'Techniques' },
  { id: 't21', question: 'Treatment frequency recommended?', category: 'Acupuncture' },
  { id: 't22', question: 'What acupuncture points recommended?', category: 'Acupuncture' },
  { id: 't23', question: 'What is the main treatment principle?', category: 'Principles' },
  { id: 't24', question: 'When to follow up?', category: 'Planning' },
  { id: 't25', question: 'When to refer to physician?', category: 'Safety' },
];

interface TreatmentTabProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClear: () => void;
  selectedPatient?: SelectedPatient | null;
  sessionSeconds?: number;
  questionsAsked?: string[];
  formatSessionTime?: (seconds: number) => string;
}

export function TreatmentTab({ 
  messages,
  isLoading,
  onSendMessage, 
  onClear,
  selectedPatient,
  sessionSeconds = 0,
  questionsAsked = [],
  formatSessionTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`,
}: TreatmentTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tcm_treatment_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [...new Set(treatmentQuestions.map(q => q.category))].sort();
  
  const filteredQuestions = treatmentQuestions.filter(q => {
    const matchesSearch = searchTerm === '' || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (question: string) => {
    const updated = bookmarkedQuestions.includes(question)
      ? bookmarkedQuestions.filter(q => q !== question)
      : [...bookmarkedQuestions, question];
    setBookmarkedQuestions(updated);
    localStorage.setItem('tcm_treatment_bookmarks', JSON.stringify(updated));
  };

  const handleQuestionClick = (question: string) => {
    if (!isLoading) {
      onSendMessage(question);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Herbs': return <Leaf className="h-4 w-4" />;
      case 'Acupuncture': return <MapPin className="h-4 w-4" />;
      case 'Techniques': return <Flame className="h-4 w-4" />;
      default: return <Pill className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {/* Quick Actions Bar */}
      <QuickActionsBar
        messages={messages}
        sessionSeconds={sessionSeconds}
        selectedPatient={selectedPatient || null}
        questionsAsked={questionsAsked}
        formatSessionTime={formatSessionTime}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Pill className="h-5 w-5 text-jade" />
            Treatment Planning
          </h2>
          <p className="text-sm text-muted-foreground">P4-P6 Priority - Points, Q&A, Protocols</p>
        </div>
        <Badge variant="outline" className="text-jade border-jade">
          {filteredQuestions.length} questions
        </Badge>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-card to-jade/5 border-jade/20 hover:border-jade/40 transition-all cursor-pointer p-3"
              onClick={() => handleQuestionClick('What acupuncture points are recommended for this pattern?')}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-jade" />
            <span className="text-sm font-medium">Points</span>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-card to-green/5 border-green/20 hover:border-green/40 transition-all cursor-pointer p-3"
              onClick={() => handleQuestionClick('What herbal formula is recommended?')}>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Herbs</span>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-card to-amber/5 border-amber/20 hover:border-amber/40 transition-all cursor-pointer p-3"
              onClick={() => handleQuestionClick('Should moxibustion or cupping be used?')}>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Moxa/Cup</span>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-card to-blue/5 border-blue/20 hover:border-blue/40 transition-all cursor-pointer p-3"
              onClick={() => handleQuestionClick('What lifestyle and dietary recommendations?')}>
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Lifestyle</span>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookmarked Questions */}
      {bookmarkedQuestions.length > 0 && (
        <Card className="bg-gradient-to-r from-gold/10 to-jade/10 border-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4 text-gold" />
              Bookmarked ({bookmarkedQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {bookmarkedQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuestionClick(q)}
                  disabled={isLoading}
                  className="text-xs gap-1"
                >
                  <Send className="h-3 w-3" />
                  {q.length > 30 ? q.substring(0, 30) + '...' : q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions by Category */}
      <ScrollArea className="h-[calc(100vh-500px)]">
        <div className="space-y-4">
          {categories.filter(cat => categoryFilter === 'all' || cat === categoryFilter).map(category => {
            const categoryQuestions = filteredQuestions.filter(q => q.category === category);
            if (categoryQuestions.length === 0) return null;
            
            return (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-semibold text-jade flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryQuestions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-2">
                    {categoryQuestions.map(q => (
                      <div
                        key={q.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuestionClick(q.question)}
                          disabled={isLoading}
                          className="flex-1 justify-start text-left text-sm h-auto py-2"
                        >
                          <Send className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 text-jade" />
                          {q.question}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(q.question)}
                          className="h-8 w-8 p-0"
                        >
                          {bookmarkedQuestions.includes(q.question) ? (
                            <BookmarkCheck className="h-4 w-4 text-jade" />
                          ) : (
                            <Bookmark className="h-4 w-4 text-muted-foreground hover:text-jade" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
