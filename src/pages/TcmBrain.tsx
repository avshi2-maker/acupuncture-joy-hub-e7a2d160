import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { ChatMessage, ChatTypingIndicator } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';
import { 
  Brain, 
  Send, 
  Loader2, 
  Leaf, 
  MapPin, 
  Stethoscope,
  ArrowRight,
  Sparkles,
  LogOut,
  Apple,
  Heart,
  Moon,
  Briefcase,
  Compass,
  Activity,
  Dumbbell,
  Star,
  Mic,
  MicOff,
  FileText,
  ClipboardList,
  Pill,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mic as MicIcon, History, MessageSquare } from 'lucide-react';
import {
  herbsQuestions,
  pointsQuestions,
  conditionsQuestions,
  nutritionQuestions,
  mentalQuestions,
  sleepQuestions,
  worklifeQuestions,
  baziQuestions,
  wellnessQuestions,
  sportsQuestions,
  astroQuestions
} from '@/data/tcmBrainQuestions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tcm-chat`;

type QuickNavSection = 'chat' | 'voice' | 'history' | 'feedback';

// Feature tabs configuration
const featureTabs = [
  { id: 'chat', icon: Sparkles, label: 'שאל AI' },
  { id: 'symptoms', icon: FileText, label: 'סימפטומים' },
  { id: 'diagnosis', icon: ClipboardList, label: 'אבחון' },
  { id: 'treatment', icon: Pill, label: 'טיפול' },
  { id: 'herbs', icon: Leaf, label: 'עשבים' },
  { id: 'points', icon: MapPin, label: 'נקודות' },
  { id: 'conditions', icon: Stethoscope, label: 'מצבים' },
  { id: 'nutrition', icon: Apple, label: 'תזונה' },
  { id: 'mental', icon: Heart, label: 'מנטלי' },
  { id: 'sleep', icon: Moon, label: 'שינה' },
  { id: 'worklife', icon: Briefcase, label: 'איזון' },
  { id: 'bazi', icon: Compass, label: 'באזי' },
  { id: 'wellness', icon: Activity, label: 'רווחה' },
  { id: 'sports', icon: Dumbbell, label: 'ספורט' },
  { id: 'astro', icon: Star, label: 'אסטרולוגיה' },
];

// Symptom Analysis Questions (50)
const symptomQuestions = [
  { id: 's1', question: 'מהו התסמין העיקרי?', category: 'כללי' },
  { id: 's2', question: 'מתי התחילו התסמינים?', category: 'כללי' },
  { id: 's3', question: 'האם יש כאב? היכן?', category: 'כאב' },
  { id: 's4', question: 'מהו אופי הכאב? (חד, עמום, דוקר)', category: 'כאב' },
  { id: 's5', question: 'האם הכאב קבוע או לסירוגין?', category: 'כאב' },
  { id: 's6', question: 'מה מחמיר את הכאב?', category: 'כאב' },
  { id: 's7', question: 'מה מקל על הכאב?', category: 'כאב' },
  { id: 's8', question: 'האם יש בחילות?', category: 'עיכול' },
  { id: 's9', question: 'מהי תדירות היציאות?', category: 'עיכול' },
  { id: 's10', question: 'האם יש שלשול או עצירות?', category: 'עיכול' },
  { id: 's11', question: 'מהי התיאבון?', category: 'עיכול' },
  { id: 's12', question: 'האם יש צמא מוגבר?', category: 'עיכול' },
  { id: 's13', question: 'מהי איכות השינה?', category: 'שינה' },
  { id: 's14', question: 'האם יש קושי להירדם?', category: 'שינה' },
  { id: 's15', question: 'האם יש התעוררויות בלילה?', category: 'שינה' },
  { id: 's16', question: 'האם יש חלומות מרובים?', category: 'שינה' },
  { id: 's17', question: 'מהי רמת האנרגיה?', category: 'אנרגיה' },
  { id: 's18', question: 'האם יש עייפות כרונית?', category: 'אנרגיה' },
  { id: 's19', question: 'באיזה שעה ביום העייפות גרועה יותר?', category: 'אנרגיה' },
  { id: 's20', question: 'האם יש הזעה מוגברת?', category: 'חום/קור' },
  { id: 's21', question: 'האם יש תחושת קור?', category: 'חום/קור' },
  { id: 's22', question: 'האם יש גפיים קרות?', category: 'חום/קור' },
  { id: 's23', question: 'האם יש חום או חמימות?', category: 'חום/קור' },
  { id: 's24', question: 'מהו צבע השתן?', category: 'שתן' },
  { id: 's25', question: 'מהי תדירות ההשתנה?', category: 'שתן' },
  { id: 's26', question: 'האם יש כאב בהשתנה?', category: 'שתן' },
  { id: 's27', question: 'מהו המצב הרגשי?', category: 'רגשות' },
  { id: 's28', question: 'האם יש חרדה או דאגנות?', category: 'רגשות' },
  { id: 's29', question: 'האם יש עצבנות?', category: 'רגשות' },
  { id: 's30', question: 'האם יש דיכאון?', category: 'רגשות' },
  { id: 's31', question: 'האם יש כאבי ראש?', category: 'ראש' },
  { id: 's32', question: 'היכן ממוקם כאב הראש?', category: 'ראש' },
  { id: 's33', question: 'האם יש סחרחורות?', category: 'ראש' },
  { id: 's34', question: 'האם יש בעיות ראייה?', category: 'ראש' },
  { id: 's35', question: 'האם יש טינטון?', category: 'ראש' },
  { id: 's36', question: 'מהו מצב הלשון? (צבע, ציפוי)', category: 'אבחון' },
  { id: 's37', question: 'מהו הדופק? (מהיר, איטי, חלש)', category: 'אבחון' },
  { id: 's38', question: 'האם יש נפיחות?', category: 'גוף' },
  { id: 's39', question: 'האם יש בעיות עור?', category: 'גוף' },
  { id: 's40', question: 'האם יש כאבי גב?', category: 'גוף' },
  { id: 's41', question: 'האם יש כאבי מפרקים?', category: 'גוף' },
  { id: 's42', question: 'מהו המחזור החודשי? (לנשים)', category: 'נשים' },
  { id: 's43', question: 'האם יש כאבי מחזור?', category: 'נשים' },
  { id: 's44', question: 'האם יש הפרשות?', category: 'נשים' },
  { id: 's45', question: 'מהם ההרגלי אכילה?', category: 'אורח חיים' },
  { id: 's46', question: 'האם יש פעילות גופנית?', category: 'אורח חיים' },
  { id: 's47', question: 'מהי רמת הסטרס?', category: 'אורח חיים' },
  { id: 's48', question: 'האם יש שימוש בתרופות?', category: 'רפואי' },
  { id: 's49', question: 'האם יש מחלות רקע?', category: 'רפואי' },
  { id: 's50', question: 'האם יש אלרגיות?', category: 'רפואי' },
];

// Diagnosis Questions (25+)
const diagnosisQuestions = [
  { id: 'd1', question: 'מהו דפוס האי-איזון העיקרי?', category: 'דפוס' },
  { id: 'd2', question: 'האם יש חוסר או עודף?', category: 'דפוס' },
  { id: 'd3', question: 'האם יש חום או קור?', category: 'דפוס' },
  { id: 'd4', question: 'האם יש לחות או יובש?', category: 'דפוס' },
  { id: 'd5', question: 'איזה איבר מעורב בעיקר?', category: 'איברים' },
  { id: 'd6', question: 'מהו מצב הכבד?', category: 'איברים' },
  { id: 'd7', question: 'מהו מצב הכליות?', category: 'איברים' },
  { id: 'd8', question: 'מהו מצב הטחול?', category: 'איברים' },
  { id: 'd9', question: 'מהו מצב הלב?', category: 'איברים' },
  { id: 'd10', question: 'מהו מצב הריאות?', category: 'איברים' },
  { id: 'd11', question: 'האם יש קיפאון צ\'י?', category: 'צ\'י/דם' },
  { id: 'd12', question: 'האם יש חוסר צ\'י?', category: 'צ\'י/דם' },
  { id: 'd13', question: 'האם יש קיפאון דם?', category: 'צ\'י/דם' },
  { id: 'd14', question: 'האם יש חוסר דם?', category: 'צ\'י/דם' },
  { id: 'd15', question: 'האם יש חוסר יין?', category: 'יין/יאנג' },
  { id: 'd16', question: 'האם יש חוסר יאנג?', category: 'יין/יאנג' },
  { id: 'd17', question: 'האם יש עודף יאנג?', category: 'יין/יאנג' },
  { id: 'd18', question: 'האם יש רוח פתוגנית?', category: 'גורמים' },
  { id: 'd19', question: 'האם יש קור פתוגני?', category: 'גורמים' },
  { id: 'd20', question: 'האם יש חום פתוגני?', category: 'גורמים' },
  { id: 'd21', question: 'האם יש לחות פתוגנית?', category: 'גורמים' },
  { id: 'd22', question: 'האם יש ליחה?', category: 'גורמים' },
  { id: 'd23', question: 'מהו עיקרון הטיפול?', category: 'טיפול' },
  { id: 'd24', question: 'איזה מרידיאן מעורב?', category: 'מרידיאנים' },
  { id: 'd25', question: 'מהי חומרת המצב?', category: 'הערכה' },
  { id: 'd26', question: 'האם המצב חריף או כרוני?', category: 'הערכה' },
];

// Treatment Questions (50)
const treatmentQuestions = [
  { id: 't1', question: 'מהו עיקרון הטיפול העיקרי?', category: 'עקרונות' },
  { id: 't2', question: 'האם לחזק או לפזר?', category: 'עקרונות' },
  { id: 't3', question: 'האם לחמם או לקרר?', category: 'עקרונות' },
  { id: 't4', question: 'האם ללחלח או לייבש?', category: 'עקרונות' },
  { id: 't5', question: 'איזו נוסחת עשבים מומלצת?', category: 'עשבים' },
  { id: 't6', question: 'מהי המינון המומלץ?', category: 'עשבים' },
  { id: 't7', question: 'כמה זמן לקחת את העשבים?', category: 'עשבים' },
  { id: 't8', question: 'האם יש התוויות נגד?', category: 'עשבים' },
  { id: 't9', question: 'אילו נקודות דיקור מומלצות?', category: 'דיקור' },
  { id: 't10', question: 'באיזו טכניקת דיקור להשתמש?', category: 'דיקור' },
  { id: 't11', question: 'כמה טיפולי דיקור נדרשים?', category: 'דיקור' },
  { id: 't12', question: 'מהי תדירות הטיפולים?', category: 'דיקור' },
  { id: 't13', question: 'האם להשתמש במוקסה?', category: 'טכניקות' },
  { id: 't14', question: 'האם להשתמש בכוסות רוח?', category: 'טכניקות' },
  { id: 't15', question: 'האם להשתמש בגואשה?', category: 'טכניקות' },
  { id: 't16', question: 'האם להשתמש באלקטרו-דיקור?', category: 'טכניקות' },
  { id: 't17', question: 'מהן המלצות התזונה?', category: 'תזונה' },
  { id: 't18', question: 'אילו מזונות להימנע?', category: 'תזונה' },
  { id: 't19', question: 'אילו מזונות להוסיף?', category: 'תזונה' },
  { id: 't20', question: 'האם יש המלצות לתה או מרק?', category: 'תזונה' },
  { id: 't21', question: 'מהן המלצות אורח החיים?', category: 'אורח חיים' },
  { id: 't22', question: 'האם יש המלצות לפעילות גופנית?', category: 'אורח חיים' },
  { id: 't23', question: 'האם יש המלצות לשינה?', category: 'אורח חיים' },
  { id: 't24', question: 'האם יש המלצות לניהול סטרס?', category: 'אורח חיים' },
  { id: 't25', question: 'מהן תרגילי צ\'י גונג מומלצים?', category: 'תרגול' },
  { id: 't26', question: 'האם יש תרגילי נשימה מומלצים?', category: 'תרגול' },
  { id: 't27', question: 'האם יש תרגילי מתיחה מומלצים?', category: 'תרגול' },
  { id: 't28', question: 'האם יש המלצות לטאי צ\'י?', category: 'תרגול' },
  { id: 't29', question: 'מהו משך הטיפול הצפוי?', category: 'תכנון' },
  { id: 't30', question: 'מהם סימני שיפור צפויים?', category: 'תכנון' },
  { id: 't31', question: 'מתי לבצע מעקב?', category: 'תכנון' },
  { id: 't32', question: 'האם יש צורך בבדיקות נוספות?', category: 'תכנון' },
  { id: 't33', question: 'מהן נקודות אוזן מומלצות?', category: 'אוזן' },
  { id: 't34', question: 'האם להשתמש בזרעי אוזן?', category: 'אוזן' },
  { id: 't35', question: 'מהן נקודות קרקפת מומלצות?', category: 'קרקפת' },
  { id: 't36', question: 'האם יש המלצות לרפלקסולוגיה?', category: 'רפלקסולוגיה' },
  { id: 't37', question: 'מהו טיפול עונתי מומלץ?', category: 'עונתי' },
  { id: 't38', question: 'האם יש התייחסות לשעון הביולוגי?', category: 'עונתי' },
  { id: 't39', question: 'מהי גישת 5 האלמנטים?', category: 'אלמנטים' },
  { id: 't40', question: 'איזה אלמנט לחזק?', category: 'אלמנטים' },
  { id: 't41', question: 'איזה אלמנט להרגיע?', category: 'אלמנטים' },
  { id: 't42', question: 'האם יש טיפול רגשי נדרש?', category: 'רגשי' },
  { id: 't43', question: 'מהן המלצות למדיטציה?', category: 'רגשי' },
  { id: 't44', question: 'האם יש שימוש בשמנים אתריים?', category: 'משלים' },
  { id: 't45', question: 'האם יש שימוש בקריסטלים?', category: 'משלים' },
  { id: 't46', question: 'מהן אמצעי זהירות?', category: 'בטיחות' },
  { id: 't47', question: 'מהן תגובות אפשריות?', category: 'בטיחות' },
  { id: 't48', question: 'מתי להפנות לרופא?', category: 'בטיחות' },
  { id: 't49', question: 'מהו הפרוגנוזיס?', category: 'תחזית' },
  { id: 't50', question: 'האם יש טיפול מניעתי?', category: 'מניעה' },
];

const quickQuestions = [
  { icon: Leaf, text: 'מהם העשבים הטובים לחיזוק הטחול?', textEn: 'Best herbs for Spleen Qi deficiency?' },
  { icon: MapPin, text: 'נקודות לכאבי ראש מסוג שאו יאנג', textEn: 'Points for Shao Yang headache?' },
  { icon: Stethoscope, text: 'דפוסי TCM לנדודי שינה', textEn: 'TCM patterns for insomnia?' },
];

export default function TcmBrain() {
  const navigate = useNavigate();
  const { tier, hasFeature } = useTier();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Selected question states for all tabs
  const [selectedSymptomQuestion, setSelectedSymptomQuestion] = useState('');
  const [selectedDiagnosisQuestion, setSelectedDiagnosisQuestion] = useState('');
  const [selectedTreatmentQuestion, setSelectedTreatmentQuestion] = useState('');
  const [selectedHerbsQuestion, setSelectedHerbsQuestion] = useState('');
  const [selectedPointsQuestion, setSelectedPointsQuestion] = useState('');
  const [selectedConditionsQuestion, setSelectedConditionsQuestion] = useState('');
  const [selectedNutritionQuestion, setSelectedNutritionQuestion] = useState('');
  const [selectedMentalQuestion, setSelectedMentalQuestion] = useState('');
  const [selectedSleepQuestion, setSelectedSleepQuestion] = useState('');
  const [selectedWorklifeQuestion, setSelectedWorklifeQuestion] = useState('');
  const [selectedBaziQuestion, setSelectedBaziQuestion] = useState('');
  const [selectedWellnessQuestion, setSelectedWellnessQuestion] = useState('');
  const [selectedSportsQuestion, setSelectedSportsQuestion] = useState('');
  const [selectedAstroQuestion, setSelectedAstroQuestion] = useState('');
  const [activeNavSection, setActiveNavSection] = useState<QuickNavSection>('chat');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const voiceBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    }
  }, [tier, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Scroll-spy: detect which section is in view
  useEffect(() => {
    const sections = [
      { id: 'chat-input-section', nav: 'chat' as QuickNavSection },
      { id: 'voice-btn-section', nav: 'voice' as QuickNavSection },
      { id: 'chat-history-section', nav: 'history' as QuickNavSection },
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          const section = sections.find(s => s.id === sectionId);
          if (section) {
            setActiveNavSection(section.nav);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.querySelector(`[data-section="${id}"]`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('יותר מדי בקשות. נסו שוב בעוד דקה.');
        } else if (response.status === 402) {
          toast.error('נגמרו הקרדיטים. יש להוסיף קרדיטים.');
        } else {
          toast.error('שגיאה בשירות AI');
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
                return newMessages;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('שגיאה בצ\'אט');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    streamChat(message);
  };

  const handleCustomPromptSubmit = () => {
    if (!customPrompt.trim() || isLoading) return;
    const message = customPrompt.trim();
    setCustomPrompt('');
    streamChat(message);
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  const handleQAQuestionSelect = (question: string) => {
    if (!question || isLoading) return;
    streamChat(question);
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Convert to base64 and send to transcription
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-to-text`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ audio: base64Audio }),
            });
            
            if (response.ok) {
              const { text } = await response.json();
              if (text) {
                setInput(text);
                toast.success('הקלטה תומללה בהצלחה');
              }
            } else {
              toast.error('שגיאה בתמלול הקלטה');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('שגיאה בתמלול');
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('מקליט... לחץ שוב לסיום');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('לא ניתן לגשת למיקרופון');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!tier || !hasFeature('tcm_brain')) return null;

  const renderQASection = (
    title: string,
    questions: typeof symptomQuestions,
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    const categories = [...new Set(questions.map(q => q.category))];
    
    return (
      <div className="space-y-6 p-4" dir="rtl">
        <div className="text-right">
          <h3 className="font-display text-xl mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">בחרו שאלה מהרשימה או כתבו שאלה משלכם</p>
        </div>
        
        <div className="grid gap-4">
          {categories.map(category => (
            <Card key={category} className="bg-card">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-jade text-right">{category}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Select
                  value={selectedValue}
                  onValueChange={(value) => {
                    onSelect(value);
                    handleQAQuestionSelect(value);
                  }}
                  dir="rtl"
                >
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue placeholder="בחרו שאלה..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-60" dir="rtl">
                    {questions
                      .filter(q => q.category === category)
                      .map(q => (
                        <SelectItem key={q.id} value={q.question} className="text-right">
                          {q.question}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Prompt Section */}
        <Card className="bg-jade-light/20 border-jade/30">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center justify-end gap-2 text-right">
              כתבו שאלה משלכם
              <FileText className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="הקלידו את השאלה שלכם כאן..."
              className="min-h-[100px] text-right"
              dir="rtl"
            />
            <div className="flex gap-2 flex-row-reverse">
              <Button
                onClick={handleCustomPromptSubmit}
                disabled={!customPrompt.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                שלח שאלה
              </Button>
              <Button
                variant="outline"
                onClick={toggleRecording}
                className={isRecording ? 'bg-red-500/10 border-red-500 text-red-500' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>TCM Brain | TCM Clinic</title>
        <meta name="description" content="מאגר ידע מקיף ברפואה סינית עם AI" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">חזרה</span>
              </Link>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-jade-light rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-jade" />
                </div>
                <span className="font-display text-lg">TCM Brain</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TierBadge />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Sticky Quick Navigation */}
        <nav className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 py-2" dir="rtl">
              <Button
                variant={activeNavSection === 'chat' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs gap-1.5 transition-all ${
                  activeNavSection === 'chat' 
                    ? 'bg-jade text-jade-foreground shadow-sm' 
                    : ''
                }`}
                onClick={() => {
                  setActiveNavSection('chat');
                  const tabsList = document.querySelector('[role="tablist"]');
                  const chatTab = tabsList?.querySelector('[value="chat"]') as HTMLButtonElement;
                  chatTab?.click();
                  setTimeout(() => {
                    const inputSection = document.querySelector('[data-section="chat-input-section"]');
                    inputSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    chatInputRef.current?.focus();
                  }, 100);
                }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                צ'אט
              </Button>
              <Button
                variant={activeNavSection === 'voice' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs gap-1.5 transition-all ${
                  activeNavSection === 'voice' 
                    ? 'bg-jade text-jade-foreground shadow-sm' 
                    : ''
                }`}
                onClick={() => {
                  setActiveNavSection('voice');
                  const tabsList = document.querySelector('[role="tablist"]');
                  const chatTab = tabsList?.querySelector('[value="chat"]') as HTMLButtonElement;
                  chatTab?.click();
                  setTimeout(() => {
                    const voiceSection = document.querySelector('[data-section="voice-btn-section"]');
                    voiceSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    voiceBtnRef.current?.focus();
                  }, 100);
                }}
              >
                <MicIcon className="h-3.5 w-3.5" />
                קולי
              </Button>
              <Button
                variant={activeNavSection === 'history' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs gap-1.5 transition-all ${
                  activeNavSection === 'history' 
                    ? 'bg-jade text-jade-foreground shadow-sm' 
                    : ''
                }`}
                onClick={() => {
                  setActiveNavSection('history');
                  const historySection = document.querySelector('[data-section="chat-history-section"]');
                  historySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <History className="h-3.5 w-3.5" />
                היסטוריה
              </Button>
              <Button
                variant={activeNavSection === 'feedback' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs gap-1.5 transition-all ${
                  activeNavSection === 'feedback' 
                    ? 'bg-jade text-jade-foreground shadow-sm' 
                    : ''
                }`}
                asChild
                onClick={() => setActiveNavSection('feedback')}
              >
                <Link to="/feedback">
                  <MessageSquare className="h-3.5 w-3.5" />
                  פידבק
                </Link>
              </Button>
            </div>
          </div>
        </nav>


        {/* Main Content */}
        <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="px-4 pt-4 overflow-x-auto">
              <TabsList className="w-max min-w-full justify-start gap-1">
                {featureTabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="gap-1 text-xs px-2 whitespace-nowrap">
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-4 pt-2">
              {/* Chat Header with Clear */}
              {messages.length > 0 && (
                <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMessages([])}
                    className="text-muted-foreground hover:text-destructive text-xs gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    נקה שיחה
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {messages.length} הודעות
                  </span>
                </div>
              )}

              <ScrollArea className="flex-1 pl-4" ref={scrollRef} data-section="chat-history-section">
                <div className="space-y-4 pb-4" dir="rtl">
                  {messages.length === 0 && (
                    <div className="text-right py-12">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-jade/20 rounded-full animate-pulse-soft" />
                        <div className="absolute inset-2 bg-gradient-to-br from-jade-light to-gold-light rounded-full flex items-center justify-center border-2 border-jade/30">
                          <Brain className="h-10 w-10 text-jade" />
                        </div>
                      </div>
                      <h2 className="font-display text-3xl mb-3 text-center bg-gradient-to-l from-jade to-jade-dark bg-clip-text text-transparent">
                        ברוכים הבאים ל-TCM Brain
                      </h2>
                      <p className="text-muted-foreground mb-8 text-center max-w-md mx-auto">
                        העוזר האישי שלכם ברפואה סינית מסורתית. שאלו כל שאלה על עשבים, נקודות דיקור, אבחון ועוד.
                      </p>
                      
                      <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        {quickQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickQuestion(q.text)}
                            className="p-5 bg-gradient-to-br from-card to-card/80 border border-border/80 rounded-xl text-right hover:border-jade hover:shadow-elevated transition-all group relative overflow-hidden"
                            dir="rtl"
                          >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jade/0 via-jade/50 to-jade/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-10 h-10 rounded-lg bg-jade-light flex items-center justify-center mb-3 mr-auto group-hover:scale-110 transition-transform">
                              <q.icon className="h-5 w-5 text-jade" />
                            </div>
                            <p className="text-sm font-medium text-right leading-relaxed">{q.text}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    // Find the previous user message for assistant responses
                    const userMessage = msg.role === 'assistant' && i > 0 
                      ? messages.slice(0, i).reverse().find(m => m.role === 'user')?.content
                      : undefined;
                    return (
                      <ChatMessage 
                        key={i} 
                        role={msg.role} 
                        content={msg.content} 
                        userMessage={userMessage}
                      />
                    );
                  })}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <ChatTypingIndicator />
                  )}
                </div>
              </ScrollArea>

              {/* Enhanced Input */}
              <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-border/50 bg-background/50 backdrop-blur-sm -mx-4 px-4 -mb-4 pb-4" data-section="chat-input-section">
                <div className="flex-1 relative" data-section="voice-btn-section">
                  <Input
                    ref={chatInputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="שאלו שאלה ברפואה סינית..."
                    disabled={isLoading}
                    className="text-right pr-4 pl-12 h-12 rounded-xl border-border/80 focus:border-jade transition-colors"
                    dir="rtl"
                    onFocus={() => setActiveNavSection('chat')}
                  />
                  <Button
                    ref={voiceBtnRef}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    data-voice-btn
                    className={`absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg ${
                      isRecording ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onFocus={() => setActiveNavSection('voice')}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="h-12 w-12 rounded-xl bg-jade hover:bg-jade/90"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Symptoms Tab */}
            <TabsContent value="symptoms" className="flex-1 overflow-auto">
              {renderQASection(
                'ניתוח סימפטומים',
                symptomQuestions,
                selectedSymptomQuestion,
                setSelectedSymptomQuestion
              )}
            </TabsContent>

            {/* Diagnosis Tab */}
            <TabsContent value="diagnosis" className="flex-1 overflow-auto">
              {renderQASection(
                'אבחון TCM',
                diagnosisQuestions,
                selectedDiagnosisQuestion,
                setSelectedDiagnosisQuestion
              )}
            </TabsContent>

            {/* Treatment Tab */}
            <TabsContent value="treatment" className="flex-1 overflow-auto">
              {renderQASection(
                'תכנית טיפול',
                treatmentQuestions,
                selectedTreatmentQuestion,
                setSelectedTreatmentQuestion
              )}
            </TabsContent>

            {/* Herbs Tab */}
            <TabsContent value="herbs" className="flex-1 overflow-auto">
              {renderQASection(
                'מאגר עשבים סיניים',
                herbsQuestions,
                selectedHerbsQuestion,
                setSelectedHerbsQuestion
              )}
            </TabsContent>

            {/* Points Tab */}
            <TabsContent value="points" className="flex-1 overflow-auto">
              {renderQASection(
                'נקודות דיקור',
                pointsQuestions,
                selectedPointsQuestion,
                setSelectedPointsQuestion
              )}
            </TabsContent>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="flex-1 overflow-auto">
              {renderQASection(
                'מצבים ודפוסי TCM',
                conditionsQuestions,
                selectedConditionsQuestion,
                setSelectedConditionsQuestion
              )}
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="flex-1 overflow-auto">
              {renderQASection(
                'תזונה לפי TCM',
                nutritionQuestions,
                selectedNutritionQuestion,
                setSelectedNutritionQuestion
              )}
            </TabsContent>

            {/* Mental Tab */}
            <TabsContent value="mental" className="flex-1 overflow-auto">
              {renderQASection(
                'בריאות מנטלית ב-TCM',
                mentalQuestions,
                selectedMentalQuestion,
                setSelectedMentalQuestion
              )}
            </TabsContent>

            {/* Sleep Tab */}
            <TabsContent value="sleep" className="flex-1 overflow-auto">
              {renderQASection(
                'איכות שינה ב-TCM',
                sleepQuestions,
                selectedSleepQuestion,
                setSelectedSleepQuestion
              )}
            </TabsContent>

            {/* Work-Life Tab */}
            <TabsContent value="worklife" className="flex-1 overflow-auto">
              {renderQASection(
                'איזון עבודה-חיים',
                worklifeQuestions,
                selectedWorklifeQuestion,
                setSelectedWorklifeQuestion
              )}
            </TabsContent>

            {/* Bazi Tab */}
            <TabsContent value="bazi" className="flex-1 overflow-auto">
              {renderQASection(
                'באזי - 4 עמודים',
                baziQuestions,
                selectedBaziQuestion,
                setSelectedBaziQuestion
              )}
            </TabsContent>

            {/* Wellness Tab */}
            <TabsContent value="wellness" className="flex-1 overflow-auto">
              {renderQASection(
                'רווחה כללית',
                wellnessQuestions,
                selectedWellnessQuestion,
                setSelectedWellnessQuestion
              )}
            </TabsContent>

            {/* Sports Tab */}
            <TabsContent value="sports" className="flex-1 overflow-auto">
              {renderQASection(
                'רפואת ספורט סינית',
                sportsQuestions,
                selectedSportsQuestion,
                setSelectedSportsQuestion
              )}
            </TabsContent>

            {/* Astrology Tab */}
            <TabsContent value="astro" className="flex-1 overflow-auto">
              {renderQASection(
                'אסטרולוגיה סינית',
                astroQuestions,
                selectedAstroQuestion,
                setSelectedAstroQuestion
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
