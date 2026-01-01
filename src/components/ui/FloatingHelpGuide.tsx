import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  HelpCircle, X, Search, ExternalLink, 
  Brain, Calendar, Users, FileText, Settings,
  Stethoscope, ClipboardList, Video, Home,
  Compass, Leaf, MapPin, Heart, Moon, Activity,
  Star, Dumbbell, Apple, Briefcase, ChevronRight,
  Database, Shield, Bell, Printer, Mic, MessageCircle,
  User, Clock, BookOpen, Calculator, BarChart3,
  Keyboard, Lightbulb, Zap, Command, ArrowUp, ArrowDown,
  CornerDownLeft, Option, Sparkles, Send, Mail,
  Gift, Rocket, CheckCircle2, AlertCircle, MicOff
} from 'lucide-react';
import { useVoiceCommands, COMMON_COMMAND_PATTERNS, VoiceCommand } from '@/hooks/useVoiceCommands';
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

interface WhatsNewItem {
  id: string;
  date: string;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  type: 'feature' | 'improvement' | 'fix';
  icon: any;
}

const WHATS_NEW: WhatsNewItem[] = [
  { id: 'voice-multilang', date: '2024-12-30', title: 'Multi-language Voice Input', titleHe: 'קלט קולי רב-לשוני', description: 'Voice input now supports Hebrew, English, Russian, Arabic, and Chinese', descriptionHe: 'קלט קולי תומך כעת בעברית, אנגלית, רוסית, ערבית וסינית', type: 'feature', icon: Mic },
  { id: 'help-guide', date: '2024-12-30', title: 'Interactive Help Guide', titleHe: 'מדריך עזרה אינטראקטיבי', description: 'New floating help button with searchable features, shortcuts, and tips', descriptionHe: 'כפתור עזרה צף חדש עם חיפוש פיצ\'רים, קיצורים וטיפים', type: 'feature', icon: HelpCircle },
  { id: 'keyboard-nav', date: '2024-12-30', title: 'Keyboard Navigation', titleHe: 'ניווט מקלדת', description: 'Navigate through features with arrow keys and enter', descriptionHe: 'נווט בין פיצ\'רים עם מקשי חצים ואנטר', type: 'improvement', icon: Keyboard },
  { id: 'session-timer', date: '2024-12-29', title: 'Session Timer Widget', titleHe: 'ווידג\'ט טיימר טיפול', description: 'Track session duration with pause/resume and milestone celebrations', descriptionHe: 'עקוב אחר משך הטיפול עם השהיה/המשך וחגיגות אבני דרך', type: 'feature', icon: Clock },
  { id: 'consent-forms', date: '2024-12-28', title: 'Digital Consent Forms', titleHe: 'טפסי הסכמה דיגיטליים', description: 'Patients can sign consent forms digitally before appointments', descriptionHe: 'מטופלים יכולים לחתום על טפסי הסכמה דיגיטלית לפני תורים', type: 'feature', icon: FileText },
  { id: 'whatsapp-templates', date: '2024-12-27', title: 'WhatsApp Templates', titleHe: 'תבניות וואטסאפ', description: 'Quick templates for appointment reminders and follow-ups', descriptionHe: 'תבניות מהירות לתזכורות תורים ומעקבים', type: 'feature', icon: MessageCircle },
];

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
  
  // Video Session Specific
  { id: 'vs-space', keys: ['Space'], action: 'Start/Pause/Resume Timer (Video Session)', actionHe: 'התחל/השהה/המשך טיימר (פגישת וידאו)', category: 'Video Session' },
  { id: 'vs-voice', keys: ['Alt', 'V'], action: 'Voice Dictation', actionHe: 'הקלטה קולית', category: 'Video Session' },
  { id: 'vs-anxiety', keys: ['Alt', 'A'], action: 'Anxiety Q&A Dialog', actionHe: 'שאלות חרדה', category: 'Video Session' },
  { id: 'vs-followup', keys: ['Alt', 'F'], action: 'Follow-up Plan', actionHe: 'תוכנית המשך', category: 'Video Session' },
  { id: 'vs-report', keys: ['Alt', 'S'], action: 'Session Report', actionHe: 'דוח טיפול', category: 'Video Session' },
  { id: 'vs-patient', keys: ['Alt', 'P'], action: 'Quick Patient', actionHe: 'מטופל מהיר', category: 'Video Session' },
  { id: 'vs-appt', keys: ['Alt', 'C'], action: 'Quick Appointment', actionHe: 'תור מהיר', category: 'Video Session' },
  { id: 'vs-zoom', keys: ['Alt', 'Z'], action: 'Zoom Invite', actionHe: 'הזמנת Zoom', category: 'Video Session' },
  { id: 'vs-reset', keys: ['Alt', 'R'], action: 'Reset Timer', actionHe: 'אפס טיימר', category: 'Video Session' },
  { id: 'vs-timestamp', keys: ['Alt', 'T'], action: 'Add Timestamp to Notes', actionHe: 'הוסף חותמת זמן', category: 'Video Session' },
  
  // UI
  { id: 'escape', keys: ['Esc'], action: 'Close Dialog/Panel', actionHe: 'סגור חלון', category: 'UI' },
  { id: 'tab', keys: ['Tab'], action: 'Next Field', actionHe: 'שדה הבא', category: 'UI' },
  { id: 'shift-tab', keys: ['Shift', 'Tab'], action: 'Previous Field', actionHe: 'שדה קודם', category: 'UI' },
  { id: 'enter', keys: ['Enter'], action: 'Confirm/Submit', actionHe: 'אישור/שליחה', category: 'UI' },
];

const QUICK_TIPS: QuickTip[] = [
  // Video Session Tips (prioritized)
  { id: 'vs-space-timer', tip: 'Press SPACE to quickly start, pause, or resume the session timer (when not typing)', tipHe: 'לחץ SPACE להתחלה, השהייה או המשך הטיימר (כשלא מקלידים)', icon: Clock, category: 'Video Session' },
  { id: 'vs-gestures', tip: 'Double-tap the notes area to add a timestamp. Shake your phone to undo the last entry', tipHe: 'הקש פעמיים על ההערות להוספת חותמת זמן. נער את הטלפון לביטול', icon: Zap, category: 'Video Session' },
  { id: 'vs-voice-cmd', tip: 'Say "Hey CM" followed by commands like "start", "pause", "timestamp", or "feeling better"', tipHe: 'אמור "Hey CM" ואחריו פקודות כמו "start", "pause", "timestamp"', icon: Mic, category: 'Video Session' },
  { id: 'vs-three-finger', tip: 'Three-finger tap toggles between Notes and AI Chat panels on mobile', tipHe: 'הקשת שלוש אצבעות מחליפה בין הערות וצ\'אט AI במובייל', icon: Activity, category: 'Video Session' },
  { id: 'vs-long-press', tip: 'Long-press the timer for quick actions menu with shortcuts to all tools', tipHe: 'לחיצה ארוכה על הטיימר פותחת תפריט פעולות מהירות', icon: Star, category: 'Video Session' },
  { id: 'vs-autosave', tip: 'Session notes auto-save every second. Look for the green checkmark indicator', tipHe: 'הערות נשמרות אוטומטית כל שניה. חפש את סימן הוי הירוק', icon: CheckCircle2, category: 'Video Session' },
  { id: 'vs-header-tools', tip: 'All session tools are in the header row - scroll horizontally to see Zoom, Calendar, Q&A, Voice, Guide, AI Tips, Report', tipHe: 'כל הכלים בשורת הכותרת - גלול הצידה לזום, יומן, שאלות, הקלטה, מדריך, טיפים AI, דוח', icon: Settings, category: 'Video Session' },
  { id: 'vs-carousel', tip: 'The inspiration carousel auto-syncs with your session phase and shows relevant tips', tipHe: 'הקרוסלה מסתנכרנת אוטומטית עם שלב הטיפול ומציגה טיפים רלוונטיים', icon: Sparkles, category: 'Video Session' },
  { id: 'vs-qa-inline', tip: 'Use the inline Q&A chat on the right to ask AI questions during the session without leaving the page', tipHe: 'השתמש בצ\'אט Q&A המשובץ בימין לשאלות AI במהלך הטיפול', icon: MessageCircle, category: 'Video Session' },
  { id: 'vs-quick-chips', tip: 'Click quick question chips below the Q&A input for instant common questions', tipHe: 'לחץ על שבבי השאלות המהירות מתחת לקלט לשאלות נפוצות', icon: Lightbulb, category: 'Video Session' },
  
  // General Tips
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

interface FloatingHelpGuideProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FloatingHelpGuide({ isOpen: controlledIsOpen, onOpenChange }: FloatingHelpGuideProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise internal
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  
  const [activeTab, setActiveTab] = useState('features');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shortcutFilter, setShortcutFilter] = useState<string | null>(null);
  const [tipFilter, setTipFilter] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [voiceAlwaysOn, setVoiceAlwaysOn] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Voice commands definition for always-on mode
  const voiceCommandsList: VoiceCommand[] = useMemo(() => [
    { patterns: COMMON_COMMAND_PATTERNS.help, action: () => setActiveTab('tips'), description: 'Show help tips', category: 'utility' },
    { patterns: COMMON_COMMAND_PATTERNS.save, action: () => { toast.success('Save triggered'); }, description: 'Save current form', category: 'utility' },
    { patterns: COMMON_COMMAND_PATTERNS.print, action: () => { window.print(); }, description: 'Print page', category: 'utility' },
    { patterns: ['features', 'פיצ\'רים'], action: () => setActiveTab('features'), description: 'Show features', category: 'navigation' },
    { patterns: ['shortcuts', 'קיצורים'], action: () => setActiveTab('shortcuts'), description: 'Show shortcuts', category: 'navigation' },
    { patterns: ['tips', 'טיפים'], action: () => setActiveTab('tips'), description: 'Show tips', category: 'navigation' },
    { patterns: ['close', 'סגור'], action: () => setIsOpen(false), description: 'Close help', category: 'navigation' },
  ], [setActiveTab, setIsOpen]);

  const { isListening, isSupported, toggleListening, lastCommand } = useVoiceCommands({
    commands: voiceCommandsList,
    enabled: voiceAlwaysOn && isOpen,
    language: 'he-IL',
    showToasts: true,
  });

  // Keyboard shortcut to toggle help and navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Keyboard navigation within the panel
  const handleKeyboardNav = useCallback((e: React.KeyboardEvent, items: any[], onSelect: (item: any) => void) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < items.length) {
      e.preventDefault();
      onSelect(items[focusedIndex]);
    }
  }, [focusedIndex]);

  // Reset focus when search/filters change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, selectedLetter, selectedCategory, shortcutFilter, tipFilter, activeTab]);

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

  const sendFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error('אנא הכנס הודעה');
      return;
    }
    
    setFeedbackSending(true);
    try {
      const subject = encodeURIComponent('בקשת שיפור - TCM Therapist App');
      const body = encodeURIComponent(`${feedbackText}\n\n---\nSent from: ${window.location.href}\nDate: ${new Date().toLocaleString('he-IL')}`);
      window.open(`mailto:ronisapir61@gmail.com?subject=${subject}&body=${body}`, '_blank');
      toast.success('נפתח חלון המייל');
      setFeedbackText('');
    } catch (error) {
      toast.error('שגיאה בפתיחת המייל');
    } finally {
      setFeedbackSending(false);
    }
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

  const getWhatsNewTypeIcon = (type: WhatsNewItem['type']) => {
    switch (type) {
      case 'feature': return <Rocket className="h-4 w-4 text-emerald-500" />;
      case 'improvement': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'fix': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  // Only show floating button when not controlled externally
  const showFloatingButton = controlledIsOpen === undefined;

  return (
    <>
      {/* Floating Help Button - positioned near clock on desktop, top-right on mobile */}
      {showFloatingButton && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed z-40 h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg',
            'bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600',
            'transition-all duration-300 hover:scale-110',
            'animate-pulse hover:animate-none',
            // Mobile: top right corner, Desktop: near clock (center-ish, offset left)
            'top-16 right-2 md:top-3 md:right-auto md:left-[calc(50%-80px)]',
            isOpen && 'hidden'
          )}
          size="icon"
          title="עזרה / Help (Alt+?)"
        >
          <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-900" />
        </Button>
      )}

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-4 md:inset-auto md:top-16 md:right-4 md:w-[480px] md:max-h-[80vh] z-50 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-400/20 to-yellow-400/10 border-b border-border/50">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-sm">עזרה / Help</span>
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
                  placeholder="חיפוש... / Search..."
                  className="pl-9 h-9 text-sm"
                  onKeyDown={(e) => {
                    if (activeTab === 'features') {
                      handleKeyboardNav(e, filteredItems, handleItemClick);
                    }
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                ↑↓ לניווט • Enter לבחירה
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full justify-start px-2 py-1.5 h-auto bg-muted/30 rounded-none border-b border-border/50 flex-wrap gap-1">
                <TabsTrigger value="features" className="gap-1 text-[11px] px-2 py-1">
                  <Compass className="h-3 w-3" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="shortcuts" className="gap-1 text-[11px] px-2 py-1">
                  <Keyboard className="h-3 w-3" />
                  Shortcuts
                </TabsTrigger>
                <TabsTrigger value="tips" className="gap-1 text-[11px] px-2 py-1">
                  <Lightbulb className="h-3 w-3" />
                  Tips
                </TabsTrigger>
                <TabsTrigger value="whatsnew" className="gap-1 text-[11px] px-2 py-1">
                  <Gift className="h-3 w-3" />
                  What's New
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-1 text-[11px] px-2 py-1">
                  <Mic className="h-3 w-3" />
                  Voice
                  {isListening && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-1 text-[11px] px-2 py-1">
                  <Mail className="h-3 w-3" />
                  בקשות
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
                  <div ref={listRef} className="p-2 space-y-1">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No results found</p>
                        <p className="text-xs">לא נמצאו תוצאות</p>
                      </div>
                    ) : (
                      filteredItems.map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-all",
                            "bg-background hover:bg-amber-50 dark:hover:bg-amber-900/20",
                            "border border-transparent hover:border-amber-200 dark:hover:border-amber-800",
                            "group",
                            focusedIndex === index && "ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <item.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{item.title}</span>
                                <span className="text-xs text-muted-foreground truncate">{item.titleHe}</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                            {item.route && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 shrink-0" />
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

              {/* What's New Tab */}
              <TabsContent value="whatsnew" className="flex-1 flex flex-col overflow-hidden mt-0">
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-3">
                    <div className="text-center pb-2">
                      <Gift className="h-8 w-8 mx-auto text-amber-500 mb-1" />
                      <h3 className="font-semibold text-sm">מה חדש? / What's New?</h3>
                    </div>
                    {WHATS_NEW.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-gradient-to-br from-background to-muted/50 border border-border/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getWhatsNewTypeIcon(item.type)}
                              <span className="font-medium text-sm">{item.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-1" dir="rtl">{item.descriptionHe}</p>
                            <span className="text-[10px] text-muted-foreground/60 mt-1 block">{item.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Voice Commands Tab */}
              <TabsContent value="voice" className="flex-1 flex flex-col overflow-hidden mt-0">
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-4">
                    {/* Always-on toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-jade/10 to-emerald-500/10 border border-jade/30">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          <Mic className="h-4 w-4 text-jade" />
                          Always-On Voice Commands
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isListening ? 'Listening for commands...' : 'Enable hands-free control'}
                        </p>
                        {lastCommand && (
                          <p className="text-xs text-jade mt-1">Last: "{lastCommand}"</p>
                        )}
                      </div>
                      <Button
                        variant={voiceAlwaysOn ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => {
                          setVoiceAlwaysOn(!voiceAlwaysOn);
                          if (!voiceAlwaysOn && isSupported) {
                            toggleListening();
                          }
                        }}
                        disabled={!isSupported}
                        className="gap-2"
                      >
                        {voiceAlwaysOn ? (
                          <>
                            <MicOff className="h-4 w-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {!isSupported && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                        <AlertCircle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Voice commands not supported in this browser
                        </p>
                      </div>
                    )}

                    {/* Session Commands */}
                    <div>
                      <Badge variant="outline" className="mb-2 bg-jade/20 text-jade border-jade/30">
                        Session Controls
                      </Badge>
                      <div className="grid gap-1.5">
                        {[
                          { cmd: 'Start / התחל', desc: 'Start session timer' },
                          { cmd: 'Stop / עצור', desc: 'End session' },
                          { cmd: 'Pause / השהה', desc: 'Pause session' },
                          { cmd: 'Resume / המשך', desc: 'Resume session' },
                          { cmd: 'Reset / איפוס', desc: 'Reset timer' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                            <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">"{item.cmd}"</code>
                            <span className="text-xs text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Commands */}
                    <div>
                      <Badge variant="outline" className="mb-2 bg-blue-500/20 text-blue-600 border-blue-300">
                        Navigation
                      </Badge>
                      <div className="grid gap-1.5">
                        {[
                          { cmd: 'Next / הבא', desc: 'Go to next section' },
                          { cmd: 'Back / אחורה', desc: 'Go to previous' },
                          { cmd: 'Save / שמור', desc: 'Save current form' },
                          { cmd: 'Calendar / יומן', desc: 'Open calendar' },
                          { cmd: 'Close / סגור', desc: 'Close dialogs' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                            <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">"{item.cmd}"</code>
                            <span className="text-xs text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Commands */}
                    <div>
                      <Badge variant="outline" className="mb-2 bg-purple-500/20 text-purple-600 border-purple-300">
                        AI & Diagnosis
                      </Badge>
                      <div className="grid gap-1.5">
                        {[
                          { cmd: 'Diagnose / אבחן', desc: 'Open AI diagnosis' },
                          { cmd: 'Summary / סיכום', desc: 'Generate summary' },
                          { cmd: 'Suggest / הצע', desc: 'Get AI suggestions' },
                          { cmd: 'Brain / מוח', desc: 'Open TCM Brain' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                            <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">"{item.cmd}"</code>
                            <span className="text-xs text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Utility Commands */}
                    <div>
                      <Badge variant="outline" className="mb-2 bg-amber-500/20 text-amber-600 border-amber-300">
                        Utilities
                      </Badge>
                      <div className="grid gap-1.5">
                        {[
                          { cmd: 'Help / עזרה', desc: 'Show help guide' },
                          { cmd: 'Print / הדפס', desc: 'Print report' },
                          { cmd: 'Share / שתף', desc: 'Share via WhatsApp' },
                          { cmd: 'Music / מוזיקה', desc: 'Toggle music' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                            <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">"{item.cmd}"</code>
                            <span className="text-xs text-muted-foreground">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Speak clearly in Hebrew or English. Uses Web Speech API.
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Feedback/Request Tab */}
              <TabsContent value="feedback" className="flex-1 flex flex-col overflow-hidden mt-0">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <Mail className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                      <h3 className="font-semibold">בקשת שיפור / Improvement Request</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        שלח הצעות לשיפור ישירות לד"ר רוני ספיר
                      </p>
                    </div>
                    
                    <Textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="תאר את השיפור או הפיצ'ר המבוקש... / Describe the improvement or feature you'd like..."
                      className="min-h-[120px] text-sm"
                      dir="auto"
                    />
                    
                    <Button
                      onClick={sendFeedback}
                      disabled={feedbackSending || !feedbackText.trim()}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-amber-900"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      שלח למייל / Send Email
                    </Button>
                    
                    <div className="text-center text-xs text-muted-foreground space-y-1">
                      <p>יישלח אל: ronisapir61@gmail.com</p>
                      <p className="flex items-center justify-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        ההודעה תפתח במייל שלך
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="p-2 border-t border-border/50 bg-muted/30 text-center">
              <p className="text-[10px] text-muted-foreground">
                {activeTab === 'features' && `${filteredItems.length}/${HELP_ITEMS.length} features`}
                {activeTab === 'shortcuts' && `${filteredShortcuts.length} shortcuts`}
                {activeTab === 'tips' && `${filteredTips.length} tips`}
                {activeTab === 'whatsnew' && `${WHATS_NEW.length} updates`}
                {activeTab === 'voice' && (isListening ? '🎤 Listening...' : 'Voice commands')}
                {activeTab === 'feedback' && 'Dr. Roni Sapir'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
