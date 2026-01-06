import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, 
  Search, 
  Activity,
  Brain,
  Sparkles,
  Filter,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { allPulseFindings } from '@/data/pulse-diagnosis-data';

// Extended type with category
type PulseFindingWithCategory = typeof allPulseFindings[number];

// TCM Pattern categories for filtering
const TCM_PATTERNS = [
  { id: 'all', label: 'הכל', labelEn: 'All Patterns' },
  { id: 'heat', label: 'חום', labelEn: 'Heat Patterns' },
  { id: 'cold', label: 'קור', labelEn: 'Cold Patterns' },
  { id: 'excess', label: 'עודף', labelEn: 'Excess Patterns' },
  { id: 'deficiency', label: 'חוסר', labelEn: 'Deficiency Patterns' },
  { id: 'blood', label: 'דם', labelEn: 'Blood Patterns' },
  { id: 'qi', label: 'צ\'י', labelEn: 'Qi Patterns' },
  { id: 'yin', label: 'יין', labelEn: 'Yin Patterns' },
  { id: 'yang', label: 'יאנג', labelEn: 'Yang Patterns' },
  { id: 'dampness', label: 'לחות', labelEn: 'Dampness Patterns' },
  { id: 'phlegm', label: 'ליחה', labelEn: 'Phlegm Patterns' },
  { id: 'stagnation', label: 'סטגנציה', labelEn: 'Stagnation Patterns' },
];

export default function PulseGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [selectedPulse, setSelectedPulse] = useState<PulseFindingWithCategory | null>(null);

  // Filter pulse findings based on search and pattern
  const filteredFindings = useMemo(() => {
    return allPulseFindings.filter(finding => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        finding.finding.toLowerCase().includes(query) ||
        finding.chineseName.toLowerCase().includes(query) ||
        finding.description.toLowerCase().includes(query) ||
        finding.tcmPattern.toLowerCase().includes(query) ||
        finding.clinicalSignificance.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (selectedPattern === 'all') return true;

      // Pattern-based filtering
      const patternLower = finding.tcmPattern.toLowerCase();
      switch (selectedPattern) {
        case 'heat':
          return patternLower.includes('heat') || patternLower.includes('fire');
        case 'cold':
          return patternLower.includes('cold');
        case 'excess':
          return patternLower.includes('excess');
        case 'deficiency':
          return patternLower.includes('deficiency') || patternLower.includes('vacuity');
        case 'blood':
          return patternLower.includes('blood');
        case 'qi':
          return patternLower.includes('qi');
        case 'yin':
          return patternLower.includes('yin');
        case 'yang':
          return patternLower.includes('yang');
        case 'dampness':
          return patternLower.includes('damp');
        case 'phlegm':
          return patternLower.includes('phlegm');
        case 'stagnation':
          return patternLower.includes('stagnation') || patternLower.includes('stasis');
        default:
          return true;
      }
    });
  }, [searchQuery, selectedPattern]);

  // Group findings by category
  const groupedFindings = useMemo(() => {
    const groups: Record<string, typeof filteredFindings> = {};
    filteredFindings.forEach(finding => {
      if (!groups[finding.category]) {
        groups[finding.category] = [];
      }
      groups[finding.category].push(finding);
    });
    return groups;
  }, [filteredFindings]);

  const getPulseIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'pulse rate':
        return '💓';
      case 'pulse depth':
        return '📏';
      case 'pulse width':
        return '↔️';
      case 'pulse strength':
        return '💪';
      case 'pulse quality':
        return '🌊';
      case 'pulse length':
        return '📐';
      case 'pulse rhythm':
        return '🎵';
      case 'special pulse qualities':
        return '✨';
      case 'pulse position analysis':
        return '🎯';
      case 'constitutional variations':
        return '👤';
      case 'seasonal variations':
        return '🍂';
      default:
        return '🔍';
    }
  };

  // Split tcmPattern string into array for display
  const getTcmPatternArray = (pattern: string): string[] => {
    return pattern.split(',').map(p => p.trim()).filter(Boolean);
  };

  return (
    <>
      <Helmet>
        <title>TCM Pulse Diagnosis Gallery | Traditional Chinese Medicine Reference</title>
        <meta name="description" content="Comprehensive visual library of pulse diagnosis patterns in Traditional Chinese Medicine. AI-analyzed pulse qualities with TCM pattern descriptions." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">גלריית אבחון דופק</h1>
                <p className="text-sm text-muted-foreground">ספריית דפוסי דופק TCM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                {filteredFindings.length} דפוסים
              </Badge>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/tcm-brain">
                  <Brain className="h-4 w-4" />
                  TCM Brain
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Search & Filters */}
          <Card className="mb-6">
            <CardContent className="pt-4 space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש דופק לפי שם, דפוס TCM, או משמעות קלינית..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              {/* TCM Pattern Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {TCM_PATTERNS.map((pattern) => (
                  <Badge
                    key={pattern.id}
                    variant={selectedPattern === pattern.id ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedPattern === pattern.id 
                        ? 'bg-jade hover:bg-jade/90' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedPattern(pattern.id)}
                  >
                    {pattern.label}
                    {selectedPattern === pattern.id && pattern.id !== 'all' && (
                      <X 
                        className="h-3 w-3 mr-1 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPattern('all');
                        }}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pulse Gallery */}
          {filteredFindings.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">לא נמצאו דפוסי דופק</h3>
                <p className="text-muted-foreground">
                  נסה לשנות את החיפוש או הסינון
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedFindings).map(([category, findings]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getPulseIcon(category)}</span>
                    <h2 className="text-lg font-semibold">{category}</h2>
                    <Badge variant="secondary">{findings.length}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {findings.map((pulse) => (
                      <Card 
                        key={`${pulse.category}-${pulse.finding}`}
                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-jade/50 hover:border-l-jade"
                        onClick={() => setSelectedPulse(pulse)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-jade transition-colors">
                                {pulse.finding}
                              </h3>
                              <p className="text-sm text-muted-foreground">{pulse.chineseName}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {pulse.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {getTcmPatternArray(pulse.tcmPattern).slice(0, 2).map((pattern, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {pattern}
                              </Badge>
                            ))}
                            {getTcmPatternArray(pulse.tcmPattern).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{getTcmPatternArray(pulse.tcmPattern).length - 2}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Pulse Detail Dialog */}
        <Dialog open={!!selectedPulse} onOpenChange={() => setSelectedPulse(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogTitle className="sr-only">פרטי דופק {selectedPulse?.finding}</DialogTitle>
            {selectedPulse && (
              <ScrollArea className="max-h-[80vh] pr-4" dir="rtl">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPulse.finding}</h2>
                      <p className="text-lg text-jade">{selectedPulse.chineseName}</p>
                      <Badge variant="secondary" className="mt-2">{selectedPulse.category}</Badge>
                    </div>
                    <div className="text-4xl">{getPulseIcon(selectedPulse.category)}</div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">תיאור</h3>
                    <p className="text-foreground">{selectedPulse.description}</p>
                  </div>

                  {/* TCM Patterns */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-jade" />
                      דפוסי TCM
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {getTcmPatternArray(selectedPulse.tcmPattern).map((pattern, idx) => (
                        <Badge key={idx} className="bg-jade/20 text-jade hover:bg-jade/30">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Significance */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">משמעות קלינית</h3>
                    <p className="text-foreground">{selectedPulse.clinicalSignificance}</p>
                  </div>

                  {/* Treatment Principles */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">עקרונות טיפול</h3>
                    <p className="text-foreground">{selectedPulse.treatmentPrinciple}</p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-border">
                    <Button asChild className="w-full gap-2">
                      <Link to={`/tcm-brain?q=pulse+${encodeURIComponent(selectedPulse.finding)}`}>
                        <Brain className="h-4 w-4" />
                        שאל את TCM Brain על דופק זה
                      </Link>
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
