import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, X, Search, ExternalLink, 
  Brain, Calendar, Users, FileText, Settings,
  Stethoscope, ClipboardList, Video, Home,
  Compass, Leaf, MapPin, Heart, Moon, Activity,
  Star, Dumbbell, Apple, Briefcase, ChevronRight,
  Database, Shield, Bell, Printer, Mic, MessageCircle,
  User, Clock, BookOpen, Calculator, BarChart3,
  Keyboard, Lightbulb, Zap, Command, ArrowUp, ArrowDown,
  CornerDownLeft, Option, Sparkles
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

interface ShortcutItem {
  id: string;
  keys: string[];
  action: string;
  actionHe: string;
  category: string;
}

interface QuickTip {
  id: string;
  tip: string;
  tipHe: string;
  icon: any;
  category: string;
}

const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { id: 'home', keys: ['Alt', 'H'], action: 'Go to Dashboard', actionHe: 'עבור ללוח בקרה', category: 'Navigation' },
  { id: 'brain', keys: ['Alt', 'B'], action: 'Open TCM Brain', actionHe: 'פתח מוח TCM', category: 'Navigation' },
  { id: 'calendar', keys: ['Alt', 'C'], action: 'Open Calendar', actionHe: 'פתח יומן', category: 'Navigation' },
  { id: 'patients', keys: ['Alt', 'P'], action: 'Open Patient List', actionHe: 'פתח רשימת מטופלים', category: 'Navigation' },
  { id: 'help', keys: ['Alt', '?'], action: 'Toggle Help Guide', actionHe: 'פתח/סגור עזרה', category: 'Navigation' },
  
  // Actions
  { id: 'new-patient', keys: ['Ctrl', 'N'], action: 'New Patient', actionHe: 'מטופל חדש', category: 'Actions' },
  { id: 'search', keys: ['Ctrl', 'K'], action: 'Quick Search', actionHe: 'חיפוש מהיר', category: 'Actions' },
  { id: 'save', keys: ['Ctrl', 'S'], action: 'Save Current Form', actionHe: 'שמור טופס', category: 'Actions' },
  { id: 'voice', keys: ['Ctrl', 'M'], action: 'Toggle Voice Input', actionHe: 'הפעל/כבה קלט קולי', category: 'Actions' },
  { id: 'print', keys: ['Ctrl', 'P'], action: 'Print Report', actionHe: 'הדפס דוח', category: 'Actions' },
  
  // Session
  { id: 'timer-start', keys: ['Alt', 'T'], action: 'Start/Pause Timer', actionHe: 'התחל/עצור טיימר', category: 'Session' },
  { id: 'quick-note', keys: ['Alt', 'N'], action: 'Quick Note', actionHe: 'הערה מהירה', category: 'Session' },
  { id: 'end-session', keys: ['Alt', 'E'], action: 'End Session', actionHe: 'סיים טיפול', category: 'Session' },
  
  // UI
  { id: 'escape', keys: ['Esc'], action: 'Close Dialog/Panel', actionHe: 'סגור חלון', category: 'UI' },
  { id: 'tab', keys: ['Tab'], action: 'Next Field', actionHe: 'שדה הבא', category: 'UI' },
  { id: 'shift-tab', keys: ['Shift', 'Tab'], action: 'Previous Field', actionHe: 'שדה קודם', category: 'UI' },
  { id: 'enter', keys: ['Enter'], action: 'Confirm/Submit', actionHe: 'אישור/שליחה', category: 'UI' },
];

const QUICK_TIPS: QuickTip[] = [
  { id: 'voice-anywhere', tip: 'Use the floating microphone button to dictate text into any input field across the app', tipHe: 'השתמש בכפתור המיקרופון הצף להקלטת טקסט בכל שדה קלט באפליקציה', icon: Mic, category: 'Productivity' },
  { id: 'paste-transcript', tip: 'After recording, click "Paste" to insert the transcript into the currently focused field', tipHe: 'לאחר הקלטה, לחץ "הדבק" להכנסת התמלול לשדה הנוכחי', icon: ClipboardList, category: 'Productivity' },
  { id: 'body-map', tip: 'Click on body figures to see acupuncture point details and add them to treatment plans', tipHe: 'לחץ על דמויות גוף לצפייה בפרטי נקודות דיקור והוספתן לתוכניות טיפול', icon: MapPin, category: 'TCM' },
  { id: 'ai-chat', tip: 'Ask TCM Brain questions in natural language - it understands Hebrew and English', tipHe: 'שאל את מוח TCM שאלות בשפה טבעית - הוא מבין עברית ואנגלית', icon: Brain, category: 'AI' },
  { id: 'timer-widget', tip: 'The session timer automatically tracks treatment duration and can send reminders', tipHe: 'טיימר הטיפול עוקב אוטומטית אחר משך הטיפול ויכול לשלוח תזכורות', icon: Clock, category: 'Session' },
  { id: 'whatsapp', tip: 'Use WhatsApp templates to quickly send appointment reminders to patients', tipHe: 'השתמש בתבניות וואטסאפ לשליחת תזכורות תורים מהירות למטופלים', icon: MessageCircle, category: 'Communication' },
  { id: 'print-reports', tip: 'Generate PDF reports with patient summaries, treatment plans, and session notes', tipHe: 'צור דוחות PDF עם סיכומי מטופלים, תוכניות טיפול והערות', icon: Printer, category: 'Documentation' },
  { id: 'quick-search', tip: 'Use the help guide search to find any feature by name in Hebrew or English', tipHe: 'השתמש בחיפוש העזרה למציאת כל פיצ\'ר בעברית או אנגלית', icon: Search, category: 'Navigation' },
  { id: 'symptom-checker', tip: 'The AI Symptom Checker suggests TCM patterns based on symptoms you describe', tipHe: 'בודק הסימפטומים מציע תסמונות TCM בהתבסס על הסימפטומים שתתאר', icon: Stethoscope, category: 'AI' },
  { id: 'consent-forms', tip: 'Send digital consent forms to patients before their first appointment', tipHe: 'שלח טפסי הסכמה דיגיטליים למטופלים לפני הפגישה הראשונה', icon: FileText, category: 'Compliance' },
  { id: 'calendar-colors', tip: 'Appointments are color-coded by status - green for confirmed, yellow for pending', tipHe: 'תורים מקודדים בצבעים לפי סטטוס - ירוק לאושר, צהוב לממתין', icon: Calendar, category: 'Organization' },
  { id: 'bazi-calc', tip: 'Use the Bazi calculator to analyze patient constitution based on birth date/time', tipHe: 'השתמש במחשבון באזי לניתוח מבנה המטופל לפי תאריך/שעת לידה', icon: Calculator, category: 'TCM' },
];

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
const SHORTCUT_CATEGORIES = [...new Set(KEYBOARD_SHORTCUTS.map(s => s.category))];
const TIP_CATEGORIES = [...new Set(QUICK_TIPS.map(t => t.category))];

export function FloatingHelpGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shortcutFilter, setShortcutFilter] = useState<string | null>(null);
  const [tipFilter, setTipFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  // Keyboard shortcut to toggle help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    let items = HELP_ITEMS;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.titleHe.includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    
    if (selectedLetter) {
      items = items.filter(item => 
        item.title.toUpperCase().startsWith(selectedLetter)
      );
    }
    
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [searchQuery, selectedLetter, selectedCategory]);

  const filteredShortcuts = useMemo(() => {
    let shortcuts = KEYBOARD_SHORTCUTS;
    if (shortcutFilter) {
      shortcuts = shortcuts.filter(s => s.category === shortcutFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      shortcuts = shortcuts.filter(s => 
        s.action.toLowerCase().includes(query) ||
        s.actionHe.includes(query) ||
        s.keys.some(k => k.toLowerCase().includes(query))
      );
    }
    return shortcuts;
  }, [shortcutFilter, searchQuery]);

  const filteredTips = useMemo(() => {
    let tips = QUICK_TIPS;
    if (tipFilter) {
      tips = tips.filter(t => t.category === tipFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tips = tips.filter(t => 
        t.tip.toLowerCase().includes(query) ||
        t.tipHe.includes(query)
      );
    }
    return tips;
  }, [tipFilter, searchQuery]);

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
    setShortcutFilter(null);
    setTipFilter(null);
  };

  const renderKeyBadge = (key: string) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    let displayKey = key;
    let icon = null;
    
    if (key === 'Ctrl') {
      displayKey = isMac ? '⌘' : 'Ctrl';
      icon = isMac ? <Command className="h-3 w-3" /> : null;
    } else if (key === 'Alt') {
      displayKey = isMac ? '⌥' : 'Alt';
      icon = isMac ? <Option className="h-3 w-3" /> : null;
    } else if (key === 'Shift') {
      displayKey = isMac ? '⇧' : 'Shift';
      icon = isMac ? <ArrowUp className="h-3 w-3" /> : null;
    } else if (key === 'Enter') {
      displayKey = '↵';
      icon = <CornerDownLeft className="h-3 w-3" />;
    } else if (key === 'Esc') {
      displayKey = 'Esc';
    } else if (key === 'Tab') {
      displayKey = '⇥';
    }
    
    return (
      <kbd 
        key={key}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded text-xs font-mono"
      >
        {icon}
        {displayKey}
      </kbd>
    );
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
        title="עזרה / Help (Alt+?)"
      >
        <HelpCircle className="h-7 w-7 text-amber-900" />
      </Button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-4 md:inset-auto md:bottom-20 md:left-4 md:w-[460px] md:max-h-[650px] z-50 animate-fade-in-up">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-400/20 to-yellow-400/10 border-b border-border/50">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold">עזרה / Help Guide</span>
                <kbd className="hidden md:inline-flex px-1.5 py-0.5 bg-muted/50 border border-border/50 rounded text-[10px] font-mono">
                  Alt+?
                </kbd>
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
                  placeholder="Search features, shortcuts, tips... / חיפוש..."
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full justify-start px-3 py-2 h-auto bg-muted/30 rounded-none border-b border-border/50">
                <TabsTrigger value="features" className="gap-1.5 text-xs">
                  <Compass className="h-3.5 w-3.5" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="shortcuts" className="gap-1.5 text-xs">
                  <Keyboard className="h-3.5 w-3.5" />
                  Shortcuts
                </TabsTrigger>
                <TabsTrigger value="tips" className="gap-1.5 text-xs">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Quick Tips
                </TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features" className="flex-1 flex flex-col overflow-hidden mt-0">
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
                <ScrollArea className="flex-1">
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
              </TabsContent>

              {/* Shortcuts Tab */}
              <TabsContent value="shortcuts" className="flex-1 flex flex-col overflow-hidden mt-0">
                {/* Category Filter */}
                <div className="px-3 py-2 border-b border-border/50">
                  <div className="flex flex-wrap gap-1">
                    {SHORTCUT_CATEGORIES.map(cat => (
                      <Badge
                        key={cat}
                        variant={shortcutFilter === cat ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer text-xs transition-colors",
                          shortcutFilter === cat && "bg-amber-500 hover:bg-amber-600"
                        )}
                        onClick={() => setShortcutFilter(shortcutFilter === cat ? null : cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                    {shortcutFilter && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setShortcutFilter(null)}
                      >
                        Clear ×
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {filteredShortcuts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Keyboard className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No shortcuts found</p>
                      </div>
                    ) : (
                      filteredShortcuts.map(shortcut => (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 hover:border-amber-200 dark:hover:border-amber-800 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{shortcut.action}</p>
                            <p className="text-xs text-muted-foreground">{shortcut.actionHe}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, idx) => (
                              <span key={idx} className="flex items-center">
                                {renderKeyBadge(key)}
                                {idx < shortcut.keys.length - 1 && (
                                  <span className="text-muted-foreground text-xs mx-0.5">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Tips Tab */}
              <TabsContent value="tips" className="flex-1 flex flex-col overflow-hidden mt-0">
                {/* Category Filter */}
                <div className="px-3 py-2 border-b border-border/50">
                  <div className="flex flex-wrap gap-1">
                    {TIP_CATEGORIES.map(cat => (
                      <Badge
                        key={cat}
                        variant={tipFilter === cat ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer text-xs transition-colors",
                          tipFilter === cat && "bg-amber-500 hover:bg-amber-600"
                        )}
                        onClick={() => setTipFilter(tipFilter === cat ? null : cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                    {tipFilter && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setTipFilter(null)}
                      >
                        Clear ×
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {filteredTips.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No tips found</p>
                      </div>
                    ) : (
                      filteredTips.map(tip => (
                        <div
                          key={tip.id}
                          className="p-3 rounded-lg bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-200/50 dark:border-amber-800/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                              <tip.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{tip.tip}</p>
                              <p className="text-xs text-muted-foreground mt-1 text-right" dir="rtl">{tip.tipHe}</p>
                              <Badge variant="outline" className="text-[10px] mt-2">
                                {tip.category}
                              </Badge>
                            </div>
                            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="p-3 border-t border-border/50 bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">
                {activeTab === 'features' && `${filteredItems.length} of ${HELP_ITEMS.length} features`}
                {activeTab === 'shortcuts' && `${filteredShortcuts.length} keyboard shortcuts`}
                {activeTab === 'tips' && `${filteredTips.length} quick tips`}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
