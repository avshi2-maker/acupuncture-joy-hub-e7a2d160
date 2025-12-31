import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Send, Bookmark, BookmarkCheck, Pill, Leaf, MapPin, Flame } from 'lucide-react';

// Treatment questions organized by category
const treatmentQuestions = [
  { id: 't1', question: 'Any additional tests needed?', category: 'Planning' },
  { id: 't2', question: 'Any breathing exercises recommended?', category: 'Practice' },
  { id: 't3', question: 'Any circadian rhythm considerations?', category: 'Seasonal' },
  { id: 't4', question: 'Any contraindications present?', category: 'Herbs' },
  { id: 't5', question: 'Any crystal therapy use?', category: 'Complementary' },
  { id: 't6', question: 'Any ear points recommended?', category: 'Ear' },
  { id: 't7', question: 'Any ear seed application?', category: 'Ear' },
  { id: 't8', question: 'Any emotional treatment needed?', category: 'Emotional' },
  { id: 't9', question: 'Any essential oil use?', category: 'Complementary' },
  { id: 't10', question: 'Any exercise recommendations?', category: 'Lifestyle' },
  { id: 't11', question: 'Any foods to add?', category: 'Nutrition' },
  { id: 't12', question: 'Any foods to avoid?', category: 'Nutrition' },
  { id: 't13', question: 'Any meditation recommendations?', category: 'Emotional' },
  { id: 't14', question: 'Any possible reactions?', category: 'Safety' },
  { id: 't15', question: 'Any preventive treatment available?', category: 'Prevention' },
  { id: 't16', question: 'Any Qi Gong exercises recommended?', category: 'Practice' },
  { id: 't17', question: 'Any reflexology recommendations?', category: 'Reflexology' },
  { id: 't18', question: 'Any safety precautions?', category: 'Safety' },
  { id: 't19', question: 'Any scalp points recommended?', category: 'Scalp' },
  { id: 't20', question: 'Any sleep recommendations?', category: 'Lifestyle' },
  { id: 't21', question: 'Any stress management tips?', category: 'Lifestyle' },
  { id: 't22', question: 'Any stretching exercises recommended?', category: 'Practice' },
  { id: 't23', question: 'Any Tai Chi recommendations?', category: 'Practice' },
  { id: 't24', question: 'Any tea or soup recommendations?', category: 'Nutrition' },
  { id: 't25', question: 'Expected treatment duration?', category: 'Planning' },
  { id: 't26', question: 'Five Element approach recommended?', category: 'Elements' },
  { id: 't27', question: 'How many acupuncture sessions needed?', category: 'Acupuncture' },
  { id: 't28', question: 'How long to take herbs?', category: 'Herbs' },
  { id: 't29', question: 'Lifestyle recommendations?', category: 'Lifestyle' },
  { id: 't30', question: 'Nutrition recommendations?', category: 'Nutrition' },
  { id: 't31', question: 'Recommended herb dosage?', category: 'Herbs' },
  { id: 't32', question: 'Recommended herbal formula?', category: 'Herbs' },
  { id: 't33', question: 'Seasonal treatment recommended?', category: 'Seasonal' },
  { id: 't34', question: 'Should cupping be used?', category: 'Techniques' },
  { id: 't35', question: 'Should electro-acupuncture be used?', category: 'Techniques' },
  { id: 't36', question: 'Should Gua Sha be used?', category: 'Techniques' },
  { id: 't37', question: 'Should moxibustion be used?', category: 'Techniques' },
  { id: 't38', question: 'Signs of expected improvement?', category: 'Planning' },
  { id: 't39', question: 'Tonify or disperse approach?', category: 'Principles' },
  { id: 't40', question: 'Treatment frequency recommended?', category: 'Acupuncture' },
  { id: 't41', question: 'Warm or cool approach?', category: 'Principles' },
  { id: 't42', question: 'What acupuncture points recommended?', category: 'Acupuncture' },
  { id: 't43', question: 'What acupuncture technique to use?', category: 'Acupuncture' },
  { id: 't44', question: 'What element to calm?', category: 'Elements' },
  { id: 't45', question: 'What element to strengthen?', category: 'Elements' },
  { id: 't46', question: 'What is the main treatment principle?', category: 'Principles' },
  { id: 't47', question: 'What is the prognosis?', category: 'Prognosis' },
  { id: 't48', question: 'When to follow up?', category: 'Planning' },
  { id: 't49', question: 'When to refer to physician?', category: 'Safety' },
  { id: 't50', question: 'Moisten or dry approach?', category: 'Principles' },
];

interface TreatmentTabProps {
  streamChat: (message: string) => void;
  isLoading: boolean;
}

export function TreatmentTab({ streamChat, isLoading }: TreatmentTabProps) {
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
      streamChat(question);
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
      <ScrollArea className="h-[calc(100vh-400px)]">
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
