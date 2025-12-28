import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Leaf, MapPin, Stethoscope, ArrowRight, Sparkles, Search, Brain } from 'lucide-react';
import { herbsQuestions, pointsQuestions, conditionsQuestions } from '@/data/tcmBrainQuestions';

const queryBoxes = [
  {
    id: 'herbs',
    icon: Leaf,
    title: 'Herbs & Formulas',
    description: '35 questions about TCM herbs',
    questions: herbsQuestions,
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-600',
    buttonBg: 'bg-green-600 hover:bg-green-700',
  },
  {
    id: 'points',
    icon: MapPin,
    title: 'Acupuncture Points',
    description: '28 questions about points',
    questions: pointsQuestions,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'conditions',
    icon: Stethoscope,
    title: 'TCM Conditions',
    description: '20 questions about patterns',
    questions: conditionsQuestions,
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
  },
];

export default function EnglishQASection() {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, string>>({});
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  const handleQuestionSelect = (boxId: string, question: string) => {
    setSelectedQuestions(prev => ({ ...prev, [boxId]: question }));
    setOpenPopovers(prev => ({ ...prev, [boxId]: false }));
  };

  const handleSendToAI = (question: string) => {
    const encodedQuestion = encodeURIComponent(question);
    navigate(`/gate?redirect=/tcm-brain&question=${encodedQuestion}`);
  };

  const getFilteredQuestions = (questions: typeof herbsQuestions, boxId: string) => {
    const filter = searchFilters[boxId]?.toLowerCase() || '';
    if (!filter) return questions;
    return questions.filter(q => 
      q.question.toLowerCase().includes(filter) || 
      q.category.toLowerCase().includes(filter)
    );
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jade/10 border border-jade/20 mb-4">
            <Brain className="h-5 w-5 text-jade" />
            <span className="text-jade font-medium">TCM Knowledge Base</span>
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-3 bg-gradient-to-r from-jade to-jade-dark bg-clip-text text-transparent">
            Ask the AI Expert
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select a pre-built question and send directly to CM Brain for professional answers
          </p>
        </div>

        {/* Query Boxes Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {queryBoxes.map((box) => {
            const Icon = box.icon;
            const categories = [...new Set(box.questions.map(q => q.category))];
            const selectedQuestion = selectedQuestions[box.id] || '';

            return (
              <Card 
                key={box.id} 
                className={`bg-gradient-to-br ${box.gradient} ${box.borderColor} border-2 hover:shadow-elevated transition-all duration-300`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl ${box.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${box.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{box.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{box.questions.length} questions</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{box.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Popup Button */}
                  <Popover 
                    open={openPopovers[box.id] || false} 
                    onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [box.id]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 bg-background/50 border-border/50 text-left"
                      >
                        <Search className="h-4 w-4" />
                        {selectedQuestion || 'Select a question...'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-3 border-b border-border">
                        <Input
                          placeholder="Search by keyword..."
                          value={searchFilters[box.id] || ''}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, [box.id]: e.target.value }))}
                        />
                      </div>
                      <ScrollArea className="h-64">
                        <div className="p-2">
                          {categories.map(category => {
                            const filteredQuestions = getFilteredQuestions(box.questions, box.id)
                              .filter(q => q.category === category);
                            if (filteredQuestions.length === 0) return null;
                            return (
                              <div key={category} className="mb-3">
                                <div className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-muted/50 rounded mb-1">
                                  {category}
                                </div>
                                {filteredQuestions.map(q => (
                                  <button
                                    key={q.id}
                                    onClick={() => handleQuestionSelect(box.id, q.question)}
                                    className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${
                                      selectedQuestion === q.question ? 'bg-primary/10 text-primary' : ''
                                    }`}
                                  >
                                    {q.question}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                          {getFilteredQuestions(box.questions, box.id).length === 0 && (
                            <p className="text-center text-muted-foreground text-sm py-4">
                              No results found
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Question Display & Send Button */}
                  {selectedQuestion && (
                    <div className="pt-3 border-t border-border/30 space-y-3">
                      <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                        <p className="text-sm font-medium">{selectedQuestion}</p>
                      </div>
                      <Button 
                        onClick={() => handleSendToAI(selectedQuestion)}
                        className={`w-full gap-2 ${box.buttonBg}`}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Send to CM Brain
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Q&A Categories */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            + 6 more categories: Nutrition, Mental Health, Sleep, Work-Life, Bazi, Wellness
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/gate?redirect=/tcm-brain')}
            className="gap-2 border-jade/30 hover:bg-jade/10"
          >
            <Brain className="h-5 w-5 text-jade" />
            Access Full CM Brain
          </Button>
        </div>
      </div>
    </section>
  );
}
