import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Send, Bookmark, BookmarkCheck, FileText } from 'lucide-react';

// Symptom questions organized by category
const symptomQuestions = [
  { id: 's1', question: 'Any allergies present?', category: 'Medical' },
  { id: 's2', question: 'Any anxiety or excessive worry?', category: 'Emotions' },
  { id: 's3', question: 'Any back pain present?', category: 'Body' },
  { id: 's4', question: 'Any bloating or swelling?', category: 'Body' },
  { id: 's5', question: 'Any chronic fatigue present?', category: 'Energy' },
  { id: 's6', question: 'Any cold extremities?', category: 'Heat/Cold' },
  { id: 's7', question: 'Any constipation or diarrhea?', category: 'Digestion' },
  { id: 's8', question: 'Any depression symptoms?', category: 'Emotions' },
  { id: 's9', question: 'Any difficulty falling asleep?', category: 'Sleep' },
  { id: 's10', question: 'Any discharge present? (women)', category: 'Women' },
  { id: 's11', question: 'Any dizziness or vertigo?', category: 'Head' },
  { id: 's12', question: 'Any excessive dreams?', category: 'Sleep' },
  { id: 's13', question: 'Any excessive sweating?', category: 'Heat/Cold' },
  { id: 's14', question: 'Any excessive thirst?', category: 'Digestion' },
  { id: 's15', question: 'Any feeling of cold?', category: 'Heat/Cold' },
  { id: 's16', question: 'Any fever or heat sensation?', category: 'Heat/Cold' },
  { id: 's17', question: 'Any headaches present?', category: 'Head' },
  { id: 's18', question: 'Any irritability present?', category: 'Emotions' },
  { id: 's19', question: 'Any joint pain?', category: 'Body' },
  { id: 's20', question: 'Any menstrual cycle issues? (women)', category: 'Women' },
  { id: 's21', question: 'Any menstrual pain? (women)', category: 'Women' },
  { id: 's22', question: 'Any nausea present?', category: 'Digestion' },
  { id: 's23', question: 'Any night wakings?', category: 'Sleep' },
  { id: 's24', question: 'Any pain during urination?', category: 'Urination' },
  { id: 's25', question: 'Any pain present? Where?', category: 'Pain' },
  { id: 's26', question: 'Any physical exercise routine?', category: 'Lifestyle' },
  { id: 's27', question: 'Any pre-existing conditions?', category: 'Medical' },
  { id: 's28', question: 'Any skin problems?', category: 'Body' },
  { id: 's29', question: 'Any tinnitus or ear ringing?', category: 'Head' },
  { id: 's30', question: 'Any vision problems?', category: 'Head' },
  { id: 's31', question: 'Current emotional state?', category: 'Emotions' },
  { id: 's32', question: 'Current medication use?', category: 'Medical' },
  { id: 's33', question: 'Current stress level?', category: 'Lifestyle' },
  { id: 's34', question: 'Eating habits and patterns?', category: 'Lifestyle' },
  { id: 's35', question: 'How is the appetite?', category: 'Digestion' },
  { id: 's36', question: 'Is the pain constant or intermittent?', category: 'Pain' },
  { id: 's37', question: 'Pain character? (sharp, dull, stabbing)', category: 'Pain' },
  { id: 's38', question: 'Pulse quality? (fast, slow, weak)', category: 'Diagnosis' },
  { id: 's39', question: 'Sleep quality assessment?', category: 'Sleep' },
  { id: 's40', question: 'Stool frequency and quality?', category: 'Digestion' },
  { id: 's41', question: 'Tongue condition? (color, coating)', category: 'Diagnosis' },
  { id: 's42', question: 'Urination frequency?', category: 'Urination' },
  { id: 's43', question: 'Urine color assessment?', category: 'Urination' },
  { id: 's44', question: 'What aggravates the pain?', category: 'Pain' },
  { id: 's45', question: 'What is the energy level?', category: 'Energy' },
  { id: 's46', question: 'What is the main symptom?', category: 'General' },
  { id: 's47', question: 'What relieves the pain?', category: 'Pain' },
  { id: 's48', question: 'What time of day is fatigue worse?', category: 'Energy' },
  { id: 's49', question: 'When did symptoms begin?', category: 'General' },
  { id: 's50', question: 'Where is the headache located?', category: 'Head' },
];

interface SymptomsTabProps {
  streamChat: (message: string) => void;
  isLoading: boolean;
}

export function SymptomsTab({ streamChat, isLoading }: SymptomsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tcm_symptom_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [...new Set(symptomQuestions.map(q => q.category))].sort();
  
  const filteredQuestions = symptomQuestions.filter(q => {
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
    localStorage.setItem('tcm_symptom_bookmarks', JSON.stringify(updated));
  };

  const handleQuestionClick = (question: string) => {
    if (!isLoading) {
      streamChat(question);
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-jade" />
            Symptom Analysis
          </h2>
          <p className="text-sm text-muted-foreground">P3 Priority - Organ Symptoms</p>
        </div>
        <Badge variant="outline" className="text-jade border-jade">
          {filteredQuestions.length} questions
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symptoms..."
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
      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="space-y-4">
          {categories.filter(cat => categoryFilter === 'all' || cat === categoryFilter).map(category => {
            const categoryQuestions = filteredQuestions.filter(q => q.category === category);
            if (categoryQuestions.length === 0) return null;
            
            return (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-semibold text-jade flex items-center justify-between">
                    {category}
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
