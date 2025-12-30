import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, X, Search, ExternalLink, 
  Brain, Calendar, Users, FileText, Settings,
  Stethoscope, ClipboardList, Video, Home,
  Compass, Leaf, MapPin, Heart, Moon, Activity,
  Star, Dumbbell, Apple, Briefcase, ChevronRight,
  Database, Shield, Bell, Printer, Mic, MessageCircle,
  User, Clock, BookOpen, Calculator, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HelpItem {
  id: string;
  title: string;
  titleHe: string;
  description: string;
  route?: string;
  category: string;
  icon: any;
  keywords: string[];
}

const HELP_ITEMS: HelpItem[] = [
  // Main Navigation
  { id: 'dashboard', title: 'Dashboard', titleHe: 'לוח בקרה', description: 'Main dashboard with quick access to all features', route: '/dashboard', category: 'Navigation', icon: Home, keywords: ['home', 'main', 'start', 'בית', 'ראשי'] },
  { id: 'tcm-brain', title: 'TCM Brain AI', titleHe: 'מוח רפואה סינית', description: 'AI-powered TCM knowledge assistant with diagnosis, treatment, and symptom analysis', route: '/tcm-brain', category: 'AI Tools', icon: Brain, keywords: ['ai', 'chat', 'question', 'diagnosis', 'treatment', 'herbs', 'points', 'בינה', 'שאלה', 'אבחון'] },
  { id: 'video-session', title: 'Video Session', titleHe: 'פגישת וידאו', description: 'Video consultation room with patient tools', route: '/video-session', category: 'Sessions', icon: Video, keywords: ['video', 'call', 'consultation', 'meeting', 'וידאו', 'פגישה'] },
  
  // CRM
  { id: 'crm', title: 'CRM Dashboard', titleHe: 'ניהול מרפאה', description: 'Patient and clinic management system', route: '/crm', category: 'CRM', icon: Users, keywords: ['crm', 'patients', 'clinic', 'management', 'מטופלים', 'ניהול'] },
  { id: 'crm-calendar', title: 'Appointment Calendar', titleHe: 'יומן תורים', description: 'Schedule and manage appointments', route: '/crm/calendar', category: 'CRM', icon: Calendar, keywords: ['calendar', 'appointments', 'schedule', 'booking', 'יומן', 'תורים', 'זימון'] },
  { id: 'crm-patients', title: 'Patient List', titleHe: 'רשימת מטופלים', description: 'View and manage all patients', route: '/crm/patients', category: 'CRM', icon: Users, keywords: ['patients', 'list', 'records', 'מטופלים', 'רשימה'] },
  { id: 'crm-new-patient', title: 'Add New Patient', titleHe: 'הוספת מטופל', description: 'Register a new patient', route: '/crm/patients/new', category: 'CRM', icon: User, keywords: ['new', 'add', 'patient', 'register', 'הוספה', 'חדש'] },
  
  // AI Tools
  { id: 'symptom-checker', title: 'AI Symptom Checker', titleHe: 'בודק סימפטומים', description: 'Analyze symptoms and get TCM pattern suggestions', route: '/symptom-checker', category: 'AI Tools', icon: Stethoscope, keywords: ['symptoms', 'check', 'analyze', 'סימפטומים', 'בדיקה'] },
  { id: 'treatment-planner', title: 'Treatment Planner', titleHe: 'מתכנן טיפול', description: 'Generate comprehensive treatment protocols', route: '/treatment-planner', category: 'AI Tools', icon: ClipboardList, keywords: ['treatment', 'plan', 'protocol', 'טיפול', 'תוכנית'] },
  
  // TCM Brain Features
  { id: 'body-map', title: 'Body Map', titleHe: 'מפת גוף', description: 'Interactive body map with acupuncture points', route: '/tcm-brain', category: 'TCM Brain', icon: MapPin, keywords: ['body', 'map', 'points', 'acupuncture', 'גוף', 'נקודות', 'דיקור'] },
  { id: 'herbs', title: 'Herbs Database', titleHe: 'מאגר צמחים', description: 'Chinese herbal medicine reference', route: '/tcm-brain', category: 'TCM Brain', icon: Leaf, keywords: ['herbs', 'herbal', 'medicine', 'צמחים', 'צמחי מרפא'] },
  { id: 'conditions', title: 'TCM Conditions', titleHe: 'תסמונות', description: 'TCM patterns and conditions reference', route: '/tcm-brain', category: 'TCM Brain', icon: Stethoscope, keywords: ['conditions', 'patterns', 'diagnosis', 'תסמונות', 'אבחון'] },
  { id: 'nutrition', title: 'TCM Nutrition', titleHe: 'תזונה', description: 'Food therapy and dietary recommendations', route: '/tcm-brain', category: 'TCM Brain', icon: Apple, keywords: ['nutrition', 'food', 'diet', 'תזונה', 'אוכל'] },
  { id: 'mental', title: 'Mental Health', titleHe: 'בריאות נפשית', description: 'Emotional and mental health in TCM', route: '/tcm-brain', category: 'TCM Brain', icon: Heart, keywords: ['mental', 'emotional', 'anxiety', 'depression', 'נפשי', 'רגשי'] },
  { id: 'sleep', title: 'Sleep Patterns', titleHe: 'שינה', description: 'Sleep disorders and TCM treatment', route: '/tcm-brain', category: 'TCM Brain', icon: Moon, keywords: ['sleep', 'insomnia', 'dreams', 'שינה', 'נדודי'] },
  { id: 'wellness', title: 'Wellness', titleHe: 'בריאות', description: 'General wellness and prevention', route: '/tcm-brain', category: 'TCM Brain', icon: Activity, keywords: ['wellness', 'health', 'prevention', 'בריאות', 'מניעה'] },
  { id: 'bazi', title: 'Bazi Calculator', titleHe: 'באזי', description: 'Chinese astrology and constitution analysis', route: '/bazi-calculator', category: 'Tools', icon: Compass, keywords: ['bazi', 'astrology', 'constitution', 'באזי', 'אסטרולוגיה'] },
  
  // Features
  { id: 'voice-input', title: 'Voice Input', titleHe: 'קלט קולי', description: 'Use microphone for voice-to-text input', route: '', category: 'Features', icon: Mic, keywords: ['voice', 'microphone', 'speech', 'dictation', 'קול', 'מיקרופון', 'הקלטה'] },
  { id: 'print', title: 'Print Reports', titleHe: 'הדפסה', description: 'Print patient reports and treatment plans', route: '', category: 'Features', icon: Printer, keywords: ['print', 'report', 'pdf', 'הדפסה', 'דוח'] },
  { id: 'session-timer', title: 'Session Timer', titleHe: 'טיימר טיפול', description: 'Track treatment session duration', route: '', category: 'Features', icon: Clock, keywords: ['timer', 'session', 'duration', 'טיימר', 'זמן'] },
  
  // Admin
  { id: 'therapist-profile', title: 'Therapist Profile', titleHe: 'פרופיל מטפל', description: 'Manage your therapist profile', route: '/therapist-profile', category: 'Settings', icon: User, keywords: ['profile', 'therapist', 'settings', 'פרופיל', 'הגדרות'] },
  { id: 'disclaimer', title: 'Therapist Disclaimer', titleHe: 'הצהרת מטפל', description: 'Sign the therapist disclaimer', route: '/therapist-disclaimer', category: 'Settings', icon: FileText, keywords: ['disclaimer', 'sign', 'legal', 'הצהרה', 'חתימה'] },
  { id: 'encyclopedia', title: 'Encyclopedia', titleHe: 'אנציקלופדיה', description: 'TCM knowledge encyclopedia', route: '/encyclopedia', category: 'Knowledge', icon: BookOpen, keywords: ['encyclopedia', 'knowledge', 'learn', 'אנציקלופדיה', 'לימוד'] },
  { id: 'scenarios', title: 'ROI Scenarios', titleHe: 'תרחישים', description: 'Business ROI calculator and scenarios', route: '/scenarios', category: 'Tools', icon: BarChart3, keywords: ['roi', 'scenarios', 'business', 'calculator', 'תרחישים', 'חישוב'] },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CATEGORIES = [...new Set(HELP_ITEMS.map(item => item.category))];

export function FloatingHelpGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredItems = useMemo(() => {
    let items = HELP_ITEMS;
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.titleHe.includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    
    // Filter by letter
    if (selectedLetter) {
      items = items.filter(item => 
        item.title.toUpperCase().startsWith(selectedLetter)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [searchQuery, selectedLetter, selectedCategory]);

  const handleItemClick = (item: HelpItem) => {
    if (item.route) {
      navigate(item.route);
      setIsOpen(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLetter(null);
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Floating Help Button - Animated Yellow */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 left-4 z-40 h-14 w-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600',
          'transition-all duration-300 hover:scale-110',
          'animate-pulse hover:animate-none',
          isOpen && 'hidden'
        )}
        size="icon"
        title="עזרה / Help"
      >
        <HelpCircle className="h-7 w-7 text-amber-900" />
      </Button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-4 md:inset-auto md:bottom-20 md:left-4 md:w-[420px] md:max-h-[600px] z-50 animate-fade-in-up">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-400/20 to-yellow-400/10 border-b border-border/50">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold">עזרה / Help Guide</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search features... / חיפוש..."
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="px-3 py-2 border-b border-border/50 bg-muted/30">
              <ScrollArea className="w-full">
                <div className="flex gap-1 pb-1">
                  <Button
                    variant={selectedLetter === null ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs shrink-0"
                    onClick={() => setSelectedLetter(null)}
                  >
                    All
                  </Button>
                  {ALPHABET.map(letter => (
                    <Button
                      key={letter}
                      variant={selectedLetter === letter ? "default" : "ghost"}
                      size="sm"
                      className="h-7 w-7 p-0 text-xs shrink-0"
                      onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Category Filter */}
            <div className="px-3 py-2 border-b border-border/50">
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-xs transition-colors",
                      selectedCategory === cat && "bg-amber-500 hover:bg-amber-600"
                    )}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  >
                    {cat}
                  </Badge>
                ))}
                {(searchQuery || selectedLetter || selectedCategory) && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                  >
                    Clear ×
                  </Badge>
                )}
              </div>
            </div>

            {/* Results */}
            <ScrollArea className="flex-1 max-h-[350px]">
              <div className="p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No results found</p>
                    <p className="text-xs">לא נמצאו תוצאות</p>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all",
                        "bg-background hover:bg-amber-50 dark:hover:bg-amber-900/20",
                        "border border-transparent hover:border-amber-200 dark:hover:border-amber-800",
                        "group"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <item.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            <span className="text-xs text-muted-foreground truncate">{item.titleHe}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                          <Badge variant="outline" className="text-[10px] mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        {item.route && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-border/50 bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">
                {filteredItems.length} of {HELP_ITEMS.length} features
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
