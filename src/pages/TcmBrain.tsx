import { useState, useRef, useEffect, useMemo } from 'react';
import { BodyFigureSelector, parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { AIResponseDisplay } from '@/components/tcm/AIResponseDisplay';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ChatMessage, ChatTypingIndicator } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedMic } from '@/components/ui/AnimatedMic';
import { BrowserVoiceInput } from '@/components/ui/BrowserVoiceInput';
import acupunctureRoomBg from '@/assets/acupuncture-room-bg.png';
import clockImg from '@/assets/clock.png';
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
  Trash2,
  User,
  MessageCircle,
  History,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Menu,
  AlertTriangle,
  Search,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  Sun,
  MoonStar,
  Monitor,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Square,
  Download,
  Mail,
  FileDown,
  Save,
  Shield,
  Database
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTcmSessionHistory, TcmSession, VoiceNoteData } from '@/hooks/useTcmSessionHistory';
import { SessionHistoryDialog } from '@/components/tcm/SessionHistoryDialog';
import { VoiceNoteRecorder, VoiceNote } from '@/components/tcm/VoiceNoteRecorder';
import { SessionTemplates, SessionTemplate } from '@/components/tcm/SessionTemplates';
import { MobileVoiceNotesDrawer } from '@/components/tcm/MobileVoiceNotesDrawer';
import { PatientSelectorDropdown, SelectedPatient } from '@/components/crm/PatientSelectorDropdown';
import { PatientVisitHistoryDialog } from '@/components/tcm/PatientVisitHistoryDialog';
import { RAGVerificationStatus } from '@/components/tcm/RAGSearchAnimation';
import { RAGVerificationPanel } from '@/components/tcm/RAGVerificationPanel';
import { AuditEvidencePanel } from '@/components/tcm/AuditEvidencePanel';
import { KnowledgeCoverageDashboard } from '@/components/tcm/KnowledgeCoverageDashboard';
import { LegalLiabilityExport } from '@/components/tcm/LegalLiabilityExport';
import { SourceTypeAlert } from '@/components/tcm/SourceTypeAlert';

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
  astroQuestions,
  traumaQuestions,
  pediatricQuestions,
  crisisQuestions,
  womensHealthQuestions,
  immuneResilienceQuestions,
  sportPerformanceQuestions,
  workStressBurnoutQuestions,
  skinDiseaseQuestions,
  extremeWeatherQuestions
} from '@/data/tcmBrainQuestions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Use RAG-enabled chat endpoint for real knowledge base search
const RAG_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tcm-rag-chat`;

// Feature tabs configuration (excluding symptoms/diagnosis/treatment which are on main page)
const featureTabs = [
  { id: 'chat', icon: Sparkles, label: 'Ask AI' },
  { id: 'symptom-checker', icon: Stethoscope, label: 'AI Symptom Checker', isLink: true, href: '/symptom-checker' },
  { id: 'treatment-planner', icon: ClipboardList, label: 'AI Treatment Planner', isLink: true, href: '/treatment-planner' },
  { id: 'bodymap', icon: User, label: 'Body Map' },
  { id: 'trauma', icon: FileText, label: 'Trauma' },
  { id: 'pediatric', icon: Heart, label: 'Pediatric' },
  { id: 'crisis', icon: AlertTriangle, label: 'Crisis' },
  { id: 'womens-health', icon: Heart, label: "Women's" },
  { id: 'immune', icon: Activity, label: 'Immune' },
  { id: 'sport-recovery', icon: Dumbbell, label: 'Sport' },
  { id: 'work-stress', icon: Briefcase, label: 'Stress' },
  { id: 'skin-disease', icon: Activity, label: 'Skin' },
  { id: 'climate', icon: Sun, label: 'Climate' },
  { id: 'herbs', icon: Leaf, label: 'Herbs' },
  { id: 'points', icon: MapPin, label: 'Points' },
  { id: 'conditions', icon: Stethoscope, label: 'Conditions' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'mental', icon: Heart, label: 'Mental' },
  { id: 'sleep', icon: Moon, label: 'Sleep' },
  { id: 'worklife', icon: Briefcase, label: 'Balance' },
  { id: 'bazi', icon: Compass, label: 'Bazi' },
  { id: 'wellness', icon: Activity, label: 'Wellness' },
  { id: 'sports', icon: Dumbbell, label: 'Sports' },
  { id: 'astro', icon: Star, label: 'Astrology' },
];

// Symptom Analysis Questions (50)
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

// Diagnosis Questions (26)
const diagnosisQuestions = [
  { id: 'd1', question: 'Any Blood deficiency present?', category: 'Qi/Blood' },
  { id: 'd2', question: 'Any Blood stagnation?', category: 'Qi/Blood' },
  { id: 'd3', question: 'Any Cold pathogen present?', category: 'Pathogens' },
  { id: 'd4', question: 'Any Dampness pathogen?', category: 'Pathogens' },
  { id: 'd5', question: 'Any Heat pathogen present?', category: 'Pathogens' },
  { id: 'd6', question: 'Any Phlegm accumulation?', category: 'Pathogens' },
  { id: 'd7', question: 'Any Qi deficiency present?', category: 'Qi/Blood' },
  { id: 'd8', question: 'Any Qi stagnation?', category: 'Qi/Blood' },
  { id: 'd9', question: 'Any Wind pathogen?', category: 'Pathogens' },
  { id: 'd10', question: 'Any Yang deficiency?', category: 'Yin/Yang' },
  { id: 'd11', question: 'Any Yang excess?', category: 'Yin/Yang' },
  { id: 'd12', question: 'Any Yin deficiency?', category: 'Yin/Yang' },
  { id: 'd13', question: 'Condition severity level?', category: 'Assessment' },
  { id: 'd14', question: 'Deficiency or excess pattern?', category: 'Pattern' },
  { id: 'd15', question: 'Heat or Cold pattern?', category: 'Pattern' },
  { id: 'd16', question: 'Is condition acute or chronic?', category: 'Assessment' },
  { id: 'd17', question: 'Moisture or Dryness pattern?', category: 'Pattern' },
  { id: 'd18', question: 'What is Heart condition?', category: 'Organs' },
  { id: 'd19', question: 'What is Kidney condition?', category: 'Organs' },
  { id: 'd20', question: 'What is Liver condition?', category: 'Organs' },
  { id: 'd21', question: 'What is Lung condition?', category: 'Organs' },
  { id: 'd22', question: 'What is Spleen condition?', category: 'Organs' },
  { id: 'd23', question: 'What is the main imbalance pattern?', category: 'Pattern' },
  { id: 'd24', question: 'What is the treatment principle?', category: 'Treatment' },
  { id: 'd25', question: 'Which meridian is involved?', category: 'Meridians' },
  { id: 'd26', question: 'Which organ is primarily affected?', category: 'Organs' },
];

// Treatment Questions (50)
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

// Quick Questions moved to detailed view
const quickQuestions = [
  { icon: Leaf, text: 'Best herbs for Spleen Qi deficiency?' },
  { icon: MapPin, text: 'Points for Shao Yang headache?' },
  { icon: Stethoscope, text: 'TCM patterns for insomnia?' },
];

// Main query categories for first page
const mainQueryCategories = [
  { 
    id: 'symptoms', 
    icon: FileText, 
    title: 'Symptoms Analysis', 
    description: 'Analyze patient symptoms and complaints',
    questions: symptomQuestions
  },
  { 
    id: 'diagnosis', 
    icon: ClipboardList, 
    title: 'TCM Diagnosis', 
    description: 'Pattern identification and assessment',
    questions: diagnosisQuestions
  },
  { 
    id: 'treatment', 
    icon: Pill, 
    title: 'Treatment Planning', 
    description: 'Treatment principles and protocols',
    questions: treatmentQuestions
  },
];

const DISCLAIMER_STORAGE_KEY = 'tcm_therapist_disclaimer_signed';

type DisclaimerStatus = {
  signed: boolean;
  expired: boolean;
};

export default function TcmBrain() {
  const navigate = useNavigate();
  const { tier, hasFeature } = useTier();
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [highlightedPoints, setHighlightedPoints] = useState<string[]>([]);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>('chat');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'running' | 'paused' | 'ended'>('idle');
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [voiceLang, setVoiceLang] = useState<string>('he-IL'); // Voice language for browser recognition
  
  // Real-time RAG query stats (updated after each query)
  const [lastRagStats, setLastRagStats] = useState<{
    chunksFound: number;
    documentsSearched: number;
    searchTerms: string;
    timestamp: Date | null;
    isExternal?: boolean;
    auditLogged?: boolean;
    auditLogId?: string | null;
    auditLoggedAt?: string | null;
  }>({
    chunksFound: 0,
    documentsSearched: 0,
    searchTerms: '',
    timestamp: null,
    isExternal: false,
    auditLogged: false,
    auditLogId: null,
    auditLoggedAt: null,
  });

  // Source type alert state
  const [sourceAlert, setSourceAlert] = useState<{
    visible: boolean;
    type: 'proprietary' | 'external' | 'no-match' | null;
    auditLogId: string | null;
    chunksFound: number;
  }>({
    visible: false,
    type: null,
    auditLogId: null,
    chunksFound: 0,
  });

  // Auto-chain workflow state
  const [chainedWorkflow, setChainedWorkflow] = useState<{
    isActive: boolean;
    currentPhase: 'idle' | 'symptoms' | 'diagnosis' | 'treatment' | 'complete';
    symptomsData: string;
    diagnosisData: string;
    treatmentData: string;
  }>({
    isActive: false,
    currentPhase: 'idle',
    symptomsData: '',
    diagnosisData: '',
    treatmentData: '',
  });

  // Voice input language for auto-chain workflow
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'he-IL'>('en-US');

  // Track if workflow was saved to patient record
  const [workflowSavedToPatient, setWorkflowSavedToPatient] = useState(false);
  const [savingToPatient, setSavingToPatient] = useState(false);

  // Edit mode for loaded workflow
  const [workflowEditMode, setWorkflowEditMode] = useState(false);
  const [editedWorkflow, setEditedWorkflow] = useState({
    symptomsData: '',
    diagnosisData: '',
    treatmentData: '',
  });

  // Comparison mode - stores the previous workflow to compare against
  const [comparisonWorkflow, setComparisonWorkflow] = useState<{
    active: boolean;
    visitDate: string;
    symptomsData: string;
    diagnosisData: string;
    treatmentData: string;
  } | null>(null);
  
  // Session history hook
  const { sessions, saveSession, exportSessionAsPDF, openGmailWithSession, openWhatsAppWithSession } = useTcmSessionHistory();
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Session timer
  useEffect(() => {
    if (!isSessionRunning) return;
    const timer = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isSessionRunning]);

  
  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Session control functions
  const startSession = () => {
    setSessionStartTime(new Date());
    setSessionSeconds(0);
    setIsSessionRunning(true);
    setSessionStatus('running');
    setQuestionsAsked([]);
    setMessages([]);
    setVoiceNotes([]);
    setActiveTemplate(null);
    toast.success('Session started');
  };
  
  const pauseSession = () => {
    setIsSessionRunning(false);
    setSessionStatus('paused');
    toast.info('Session paused');
  };
  
  const continueSession = () => {
    setIsSessionRunning(true);
    setSessionStatus('running');
    toast.success('Session resumed');
  };
  
  const endSession = () => {
    setIsSessionRunning(false);
    setSessionStatus('ended');
    
    // Convert VoiceNotes to VoiceNoteData for storage (exclude audio blobs)
    const voiceNoteData: VoiceNoteData[] = voiceNotes.map(vn => ({
      id: vn.id,
      transcription: vn.transcription,
      duration: vn.duration,
      timestamp: vn.timestamp
    }));
    
    // Prepare session report for localStorage
    const sessionData: TcmSession = {
      id: `TCM-${Date.now()}`,
      startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: formatSessionTime(sessionSeconds),
      durationSeconds: sessionSeconds,
      questionsAsked: questionsAsked,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      })),
      totalQuestions: questionsAsked.length,
      totalResponses: messages.filter(m => m.role === 'assistant').length,
      patientName: selectedPatient?.name,
      patientEmail: selectedPatient?.email,
      patientPhone: selectedPatient?.phone,
      voiceNotes: voiceNoteData,
      templateUsed: activeTemplate || undefined
    };
    
    // Save to localStorage
    saveSession(sessionData);
    
    // Export PDF automatically
    exportSessionAsPDF(sessionData);
    
    toast.success('Session ended & saved to history');
    
    // Reset for new session
    setTimeout(() => {
      setSessionStatus('idle');
      setSessionSeconds(0);
      setSessionStartTime(null);
      setVoiceNotes([]);
      setActiveTemplate(null);
    }, 2000);
  };
  
  // Voice note handlers
  const handleAddVoiceNote = (note: VoiceNote) => {
    setVoiceNotes(prev => [...prev, note]);
  };
  
  const handleDeleteVoiceNote = (id: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
  };
  
  // Template handler
  const handleApplyTemplate = (template: SessionTemplate) => {
    setActiveTemplate(template.name);
    // Add template questions to questionsAsked
    setQuestionsAsked(prev => [...new Set([...prev, ...template.questions])]);
    toast.success(`Template "${template.name}" applied - ${template.questions.length} questions loaded`);
  };
  
  // Quick share current session
  const shareCurrentSessionViaEmail = () => {
    if (questionsAsked.length === 0) {
      toast.error('No session data to share');
      return;
    }
    const sessionData: TcmSession = {
      id: `TCM-${Date.now()}`,
      startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: formatSessionTime(sessionSeconds),
      durationSeconds: sessionSeconds,
      questionsAsked: questionsAsked,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      })),
      totalQuestions: questionsAsked.length,
      totalResponses: messages.filter(m => m.role === 'assistant').length
    };
    openGmailWithSession(sessionData);
  };
  
  const shareCurrentSessionViaWhatsApp = () => {
    if (questionsAsked.length === 0) {
      toast.error('No session data to share');
      return;
    }
    const sessionData: TcmSession = {
      id: `TCM-${Date.now()}`,
      startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: formatSessionTime(sessionSeconds),
      durationSeconds: sessionSeconds,
      questionsAsked: questionsAsked,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      })),
      totalQuestions: questionsAsked.length,
      totalResponses: messages.filter(m => m.role === 'assistant').length
    };
    openWhatsAppWithSession(sessionData);
  };

  // Manual save session
  const manualSaveSession = () => {
    if (messages.length === 0) {
      toast.error('No session data to save');
      return;
    }
    
    const voiceNoteData = voiceNotes.map(vn => ({
      id: vn.id,
      transcription: vn.transcription,
      duration: vn.duration,
      timestamp: vn.timestamp
    }));
    
    const sessionData: TcmSession = {
      id: `TCM-${sessionStartTime?.getTime() || Date.now()}`,
      startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: formatSessionTime(sessionSeconds),
      durationSeconds: sessionSeconds,
      questionsAsked: questionsAsked,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      })),
      totalQuestions: questionsAsked.length,
      totalResponses: messages.filter(m => m.role === 'assistant').length,
      patientName: selectedPatient?.name,
      patientEmail: selectedPatient?.email,
      patientPhone: selectedPatient?.phone,
      voiceNotes: voiceNoteData,
      templateUsed: activeTemplate || undefined
    };
    
    saveSession(sessionData);
    setLastAutoSave(new Date());
    toast.success('Session saved');
  };

  const [disclaimerStatus, setDisclaimerStatus] = useState<DisclaimerStatus>(() => {
    try {
      const raw = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (!raw) return { signed: false, expired: false };
      const data = JSON.parse(raw);
      const signedDate = data?.signedAt ? new Date(data.signedAt) : null;
      if (!signedDate || Number.isNaN(signedDate.getTime())) return { signed: false, expired: false };
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      if (signedDate < oneYearAgo) return { signed: false, expired: true };
      return { signed: true, expired: false };
    } catch {
      return { signed: false, expired: false };
    }
  });
  
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
  const [selectedTraumaQuestion, setSelectedTraumaQuestion] = useState('');
  const [selectedPediatricQuestion, setSelectedPediatricQuestion] = useState('');
  const [selectedCrisisQuestion, setSelectedCrisisQuestion] = useState('');
  const [selectedWomensHealthQuestion, setSelectedWomensHealthQuestion] = useState('');
  const [selectedImmuneQuestion, setSelectedImmuneQuestion] = useState('');
  const [selectedSportRecoveryQuestion, setSelectedSportRecoveryQuestion] = useState('');
  const [selectedWorkStressQuestion, setSelectedWorkStressQuestion] = useState('');
  const [selectedSkinDiseaseQuestion, setSelectedSkinDiseaseQuestion] = useState('');
  const [selectedClimateQuestion, setSelectedClimateQuestion] = useState('');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const [showRAGPanel, setShowRAGPanel] = useState(false);
  
  // Patient selection for session linking
  const [patients, setPatients] = useState<Array<{ id: string; full_name: string; email?: string | null; phone?: string | null }>>([]);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  // Fetch patients from CRM
  useEffect(() => {
    const fetchPatients = async () => {
      if (!session?.user?.id) return;
      setLoadingPatients(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, email, phone')
          .eq('therapist_id', session.user.id)
          .order('full_name');
        if (error) throw error;
        setPatients(data || []);
      } catch (e) {
        console.error('Failed to load patients:', e);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, [session?.user?.id]);

  // Auto-save session every 30 seconds when running and has data
  useEffect(() => {
    if (!isSessionRunning || messages.length === 0) return;
    
    const autoSave = () => {
      const voiceNoteData = voiceNotes.map(vn => ({
        id: vn.id,
        transcription: vn.transcription,
        duration: vn.duration,
        timestamp: vn.timestamp
      }));
      
      const sessionData: TcmSession = {
        id: `TCM-${sessionStartTime?.getTime() || Date.now()}`,
        startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: formatSessionTime(sessionSeconds),
        durationSeconds: sessionSeconds,
        questionsAsked: questionsAsked,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString()
        })),
        totalQuestions: questionsAsked.length,
        totalResponses: messages.filter(m => m.role === 'assistant').length,
        patientName: selectedPatient?.name,
        patientEmail: selectedPatient?.email,
        patientPhone: selectedPatient?.phone,
        voiceNotes: voiceNoteData,
        templateUsed: activeTemplate || undefined
      };
      
      saveSession(sessionData);
      setLastAutoSave(new Date());
    };
    
    const timer = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(timer);
  }, [isSessionRunning, messages, questionsAsked, voiceNotes, sessionStartTime, sessionSeconds, selectedPatient, activeTemplate, saveSession, formatSessionTime]);

  // Get patient's past sessions
  const patientSessions = useMemo(() => {
    if (!selectedPatient?.name) return [];
    return sessions.filter(s => s.patientName === selectedPatient.name).slice(0, 5);
  }, [sessions, selectedPatient?.name]);
  
  // Search and filter states for main categories
  const [categorySearches, setCategorySearches] = useState<Record<string, string>>({
    symptoms: '',
    diagnosis: '',
    treatment: ''
  });
  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>({
    symptoms: 'all',
    diagnosis: 'all',
    treatment: 'all'
  });
  const [alphabetFilters, setAlphabetFilters] = useState<Record<string, string>>({
    symptoms: 'all',
    diagnosis: 'all',
    treatment: 'all'
  });
  
  // Bookmarked questions - stored in localStorage
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tcm_bookmarked_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const aiResponseRef = useRef<HTMLDivElement>(null);
  
  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('tcm_bookmarked_questions', JSON.stringify(bookmarkedQuestions));
  }, [bookmarkedQuestions]);
  
  const toggleBookmark = (question: string) => {
    setBookmarkedQuestions(prev => {
      if (prev.includes(question)) {
        toast.success('Bookmark removed');
        return prev.filter(q => q !== question);
      } else {
        toast.success('Question bookmarked!');
        return [...prev, question];
      }
    });
  };
  
  const isBookmarked = (question: string) => bookmarkedQuestions.includes(question);

  // Check if therapist has signed disclaimer (inline banner, no redirect)
  useEffect(() => {
    const raw = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (!raw) {
      setDisclaimerStatus({ signed: false, expired: false });
      return;
    }

    try {
      const data = JSON.parse(raw);
      const signedDate = data?.signedAt ? new Date(data.signedAt) : null;
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      if (!signedDate || Number.isNaN(signedDate.getTime())) {
        localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
        setDisclaimerStatus({ signed: false, expired: false });
        return;
      }

      if (signedDate < oneYearAgo) {
        localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
        setDisclaimerStatus({ signed: false, expired: true });
        return;
      }

      setDisclaimerStatus({ signed: true, expired: false });
    } catch {
      localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
      setDisclaimerStatus({ signed: false, expired: false });
    }
  }, []);

  // Ensure we scroll to the AI response panel as soon as loading starts
  useEffect(() => {
    if (!isLoading) return;
    requestAnimationFrame(() => {
      aiResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isLoading]);

  // Page is now publicly accessible - no tier gate redirect

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse highlighted points from last assistant message
  useEffect(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      const points = parsePointReferences(lastAssistantMsg.content);
      setHighlightedPoints(points);
    }
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setQuestionsAsked(prev => [...prev, userMessage]); // Track questions for session report
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setCurrentQuery(userMessage);

    // Disclaimer gate (inline banner shows; AI actions are blocked until signed)
    if (!disclaimerStatus.signed) {
      toast.error(disclaimerStatus.expired ? 'ההצהרה פגה תוקף — נא לחתום מחדש' : 'נא לחתום על ההצהרה לפני שימוש ב‑AI');
      setIsLoading(false);
      setLoadingStartTime(null);
      return;
    }

    // Check for authentication
    if (!session?.access_token) {
      toast.error('Please log in to use TCM Brain');
      setIsLoading(false);
      setLoadingStartTime(null);
      return;
    }

    let assistantContent = '';

    try {
      // Use RAG endpoint for real knowledge base search
      const response = await fetch(RAG_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          query: userMessage,
          messages: [...messages, userMsg],
          includeChunkDetails: true 
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else if (response.status === 429) {
          toast.error('Too many requests. Try again in a minute.');
        } else if (response.status === 402) {
          toast.error('Credits exhausted. Please add credits.');
        } else {
          toast.error('AI service error');
        }
        setIsLoading(false);
        return;
      }

      // tcm-rag-chat returns JSON with response and RAG stats
      const data = await response.json();
      
      // Update real-time RAG query stats
      setLastRagStats({
        chunksFound: data.chunksFound || 0,
        documentsSearched: data.documentsSearched || 0,
        searchTerms: data.searchTermsUsed || '',
        timestamp: new Date(),
        isExternal: !!data.isExternal,
        auditLogged: !!data.auditLogged,
        auditLogId: data.auditLogId ?? null,
        auditLoggedAt: data.auditLoggedAt ?? null,
      });
      
      // Show source type alert (auto-dismiss after 5 seconds)
      const alertType = data.isExternal 
        ? 'external' 
        : (data.chunksFound || 0) > 0 
          ? 'proprietary' 
          : 'no-match';
      
      setSourceAlert({
        visible: true,
        type: alertType,
        auditLogId: data.auditLogId ?? null,
        chunksFound: data.chunksFound || 0,
      });
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setSourceAlert(prev => ({ ...prev, visible: false }));
      }, 5000);
      
      // Show accurate backend verification status
      if (data.isExternal) {
        toast.warning('External AI used — not from proprietary materials');
      } else if ((data.chunksFound || 0) > 0) {
        toast.success(`Verified KB: ${data.chunksFound} chunks / ${data.documentsSearched} docs matched`);
      } else {
        toast.info('0 matches in proprietary knowledge base (no external AI used).');
      }
      
      // Add the assistant message
      assistantContent = data.response || 'No response generated';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Chat error');
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    streamChat(message);
  };

  const scrollToAiResponse = () => {
    requestAnimationFrame(() => {
      aiResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleCustomPromptSubmit = () => {
    if (!customPrompt.trim() || isLoading) return;
    const message = customPrompt.trim();
    setCustomPrompt('');
    streamChat(message);
    scrollToAiResponse();
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
    scrollToAiResponse();
  };

  const handleQAQuestionSelect = (question: string) => {
    if (!question || isLoading) return;
    streamChat(question);
    scrollToAiResponse();
  };

  // =============================================
  // AUTO-CHAIN WORKFLOW: Symptoms → Diagnosis → Treatment
  // with full 126-question context injection
  // =============================================
  
  // Build context from all curated questions for comprehensive analysis
  const buildQuestionContext = () => {
    const symptomQuestions = [
      ...conditionsQuestions.map(q => `- ${q.question} (${q.category})`),
      ...mentalQuestions.map(q => `- ${q.question} (${q.category})`),
      ...sleepQuestions.map(q => `- ${q.question} (${q.category})`),
      ...nutritionQuestions.map(q => `- ${q.question} (${q.category})`),
    ].join('\n');
    
    const diagnosisQuestions = [
      ...conditionsQuestions.map(q => `- ${q.question}`),
      ...herbsQuestions.filter(q => ['Blood', 'Heat/Cold', 'Formulas'].includes(q.category)).map(q => `- ${q.question}`),
      ...pointsQuestions.filter(q => ['Meridians', 'Techniques'].includes(q.category)).map(q => `- ${q.question}`),
    ].join('\n');
    
    const treatmentQuestions = [
      ...herbsQuestions.map(q => `- ${q.question} (${q.category})`),
      ...pointsQuestions.map(q => `- ${q.question} (${q.category})`),
      ...wellnessQuestions.map(q => `- ${q.question} (${q.category})`),
      ...sportsQuestions.filter(q => q.category === 'Treatment').map(q => `- ${q.question}`),
    ].join('\n');
    
    return { symptomQuestions, diagnosisQuestions, treatmentQuestions };
  };
  
  const runChainedWorkflow = async (symptomDescription: string) => {
    if (!session?.access_token || !disclaimerStatus.signed) {
      toast.error('Please log in and sign disclaimer first');
      return;
    }

    const { symptomQuestions, diagnosisQuestions, treatmentQuestions } = buildQuestionContext();

    setChainedWorkflow({
      isActive: true,
      currentPhase: 'symptoms',
      symptomsData: '',
      diagnosisData: '',
      treatmentData: '',
    });

    setIsLoading(true);
    setLoadingStartTime(Date.now());

    try {
      // PHASE 1: Symptom Analysis with full question context
      toast.info('🔍 Phase 1/3: Analyzing symptoms with 126-question framework...');
      setChainedWorkflow(prev => ({ ...prev, currentPhase: 'symptoms' }));
      
      const symptomPrompt = `You are analyzing patient symptoms using a comprehensive TCM clinical framework.

PATIENT PRESENTATION:
"${symptomDescription}"

CLINICAL ASSESSMENT FRAMEWORK (use these as your analysis guide):
${symptomQuestions}

Based on this framework, provide a thorough TCM symptom analysis:
1. **Chief Complaint** - Primary symptoms identified
2. **Associated Symptoms** - Secondary manifestations
3. **Onset & Duration** - Timeline and progression
4. **Aggravating/Relieving Factors** - What makes it better/worse
5. **Tongue Indicators** - What to look for (color, coat, shape)
6. **Pulse Indicators** - What to palpate (quality, rate, depth)
7. **Relevant TCM Patterns** - Preliminary pattern considerations`;

      const symptomResponse = await fetch(RAG_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: symptomPrompt, messages: [], includeChunkDetails: true }),
      });

      if (!symptomResponse.ok) throw new Error('Symptom analysis failed');
      const symptomData = await symptomResponse.json();
      const symptomsResult = symptomData.response || '';
      
      setChainedWorkflow(prev => ({ ...prev, symptomsData: symptomsResult }));
      setMessages(prev => [
        ...prev,
        { role: 'user', content: `[AUTO-CHAIN] Symptom Analysis: ${symptomDescription}` },
        { role: 'assistant', content: `## 📋 Phase 1: Symptom Analysis\n\n${symptomsResult}` }
      ]);

      // PHASE 2: TCM Diagnosis with pattern recognition framework
      toast.info('🔬 Phase 2/3: Pattern differentiation with TCM framework...');
      setChainedWorkflow(prev => ({ ...prev, currentPhase: 'diagnosis' }));

      const diagnosisPrompt = `You are performing TCM pattern differentiation using a comprehensive diagnostic framework.

SYMPTOM ANALYSIS FROM PHASE 1:
${symptomsResult}

TCM DIAGNOSTIC FRAMEWORK (consider these patterns and differentiations):
${diagnosisQuestions}

Based on this framework, provide a thorough TCM diagnosis:
1. **Primary Pattern/Syndrome (证)** - Main TCM pattern identification with rationale
2. **Secondary Patterns** - Contributing or complicating patterns
3. **Affected Organs/Meridians** - Zang-Fu involvement and meridian pathways
4. **Qi-Blood-Yin-Yang Analysis** - Specific imbalances identified
5. **Root vs Branch (本标)** - Distinguish root cause from manifestations
6. **Severity Assessment** - Acute/chronic, mild/moderate/severe
7. **Differential Diagnosis** - Rule out similar patterns`;

      const diagnosisResponse = await fetch(RAG_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: diagnosisPrompt, messages: [], includeChunkDetails: true }),
      });

      if (!diagnosisResponse.ok) throw new Error('Diagnosis failed');
      const diagnosisDataResponse = await diagnosisResponse.json();
      const diagnosisResult = diagnosisDataResponse.response || '';
      
      setChainedWorkflow(prev => ({ ...prev, diagnosisData: diagnosisResult }));
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `## 🔬 Phase 2: TCM Diagnosis\n\n${diagnosisResult}` }
      ]);

      // PHASE 3: Treatment Planning (based on diagnosis)
      toast.info('💊 Phase 3/3: Creating treatment plan...');
      setChainedWorkflow(prev => ({ ...prev, currentPhase: 'treatment' }));

      // PHASE 3: Treatment Planning with full protocol framework
      toast.info('💊 Phase 3/3: Building treatment protocol with full framework...');
      setChainedWorkflow(prev => ({ ...prev, currentPhase: 'treatment' }));

      const treatmentPrompt = `You are creating a comprehensive TCM treatment protocol using all available clinical knowledge.

TCM DIAGNOSIS FROM PHASE 2:
${diagnosisResult}

TREATMENT PROTOCOL FRAMEWORK (use these as your prescription guide):
${treatmentQuestions}

Based on this framework, provide a complete treatment protocol:
1. **Treatment Principle (治則)** - Therapeutic strategy with rationale
2. **Acupuncture Protocol**
   - Primary points with specific locations and functions
   - Supporting points for pattern
   - Needle technique (tonify/disperse/neutral)
   - Recommended needle retention time
3. **Herbal Formula**
   - Recommended formula with modifications
   - Key herbs and their roles
   - Dosage considerations
4. **Auxiliary Techniques**
   - Moxibustion (if applicable): locations and method
   - Cupping (if applicable): locations and duration
   - Tui Na or Gua Sha recommendations
5. **Lifestyle Prescriptions**
   - Dietary recommendations (foods to eat/avoid)
   - Exercise and Qi Gong suggestions
   - Sleep and stress management
6. **Treatment Course**
   - Frequency of sessions
   - Expected duration of treatment
   - Progress markers
7. **Safety & Contraindications**
   - Precautions for this patient
   - Points or herbs to avoid
   - Warning signs to monitor`;

      const treatmentResponse = await fetch(RAG_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: treatmentPrompt, messages: [], includeChunkDetails: true }),
      });

      if (!treatmentResponse.ok) throw new Error('Treatment planning failed');
      const treatmentDataResponse = await treatmentResponse.json();
      const treatmentResult = treatmentDataResponse.response || '';
      
      setChainedWorkflow(prev => ({ 
        ...prev, 
        treatmentData: treatmentResult,
        currentPhase: 'complete'
      }));
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `## 💊 Phase 3: Treatment Plan\n\n${treatmentResult}` }
      ]);

      // Update RAG stats with last query
      setLastRagStats({
        chunksFound: treatmentDataResponse.chunksFound || 0,
        documentsSearched: treatmentDataResponse.documentsSearched || 0,
        searchTerms: treatmentDataResponse.searchTermsUsed || '',
        timestamp: new Date(),
        isExternal: !!treatmentDataResponse.isExternal,
        auditLogged: !!treatmentDataResponse.auditLogged,
        auditLogId: treatmentDataResponse.auditLogId ?? null,
        auditLoggedAt: treatmentDataResponse.auditLoggedAt ?? null,
      });

      toast.success('✅ Complete workflow finished: Symptoms → Diagnosis → Treatment');
      
      // Reset saved state when new workflow completes
      setWorkflowSavedToPatient(false);
      
      // Track all questions
      setQuestionsAsked(prev => [
        ...prev,
        `[AUTO-CHAIN] ${symptomDescription}`
      ]);

    } catch (error) {
      console.error('Chained workflow error:', error);
      toast.error('Workflow failed. Please try individual queries.');
      setChainedWorkflow(prev => ({ ...prev, isActive: false, currentPhase: 'idle' }));
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  };

  // Save auto-chain workflow to patient's CRM record (visits table)
  const saveWorkflowToPatient = async () => {
    if (!session?.user?.id || !selectedPatient?.id) {
      toast.error('Please select a patient first');
      return;
    }

    if (!chainedWorkflow.symptomsData || !chainedWorkflow.diagnosisData || !chainedWorkflow.treatmentData) {
      toast.error('Complete the workflow before saving');
      return;
    }

    setSavingToPatient(true);

    try {
      // Extract key information from workflow results for structured storage
      const visitData = {
        patient_id: selectedPatient.id,
        therapist_id: session.user.id,
        visit_date: new Date().toISOString(),
        chief_complaint: `[Auto-Chain Workflow]\n${chainedWorkflow.symptomsData.slice(0, 500)}`,
        tcm_pattern: chainedWorkflow.diagnosisData.slice(0, 1000),
        treatment_principle: chainedWorkflow.treatmentData.slice(0, 500),
        notes: `## Symptoms Analysis\n${chainedWorkflow.symptomsData}\n\n## TCM Diagnosis\n${chainedWorkflow.diagnosisData}\n\n## Treatment Plan\n${chainedWorkflow.treatmentData}`,
      };

      const { error } = await supabase.from('visits').insert(visitData);

      if (error) throw error;

      setWorkflowSavedToPatient(true);
      toast.success(`Saved to ${selectedPatient.name}'s record`);
    } catch (error) {
      console.error('Error saving workflow to patient:', error);
      toast.error('Failed to save to patient record');
    } finally {
      setSavingToPatient(false);
    }
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
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            // Use supabase.functions.invoke which auto-passes the session JWT
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio },
            });
            
            if (error) {
              console.error('Transcription error:', error);
              toast.error('Transcription error');
            } else if (data?.text) {
              setInput(data.text);
              toast.success('Recording transcribed');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Transcription error');
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording... Click again to stop');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Cannot access microphone');
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
      <div className="space-y-6 p-4">
        <div className="text-left">
          <h3 className="font-display text-2xl mb-2">{title}</h3>
          <p className="text-muted-foreground text-base">Select a question from the list or write your own</p>
        </div>
        
        <div className="grid gap-4">
          {categories.map(category => (
            <Card key={category} className="bg-card">
              <CardHeader className="py-4">
                <CardTitle className="text-lg font-semibold text-jade text-left">{category}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Select
                  value={selectedValue}
                  onValueChange={(value) => {
                    onSelect(value);
                    handleQAQuestionSelect(value);
                  }}
                >
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Select a question..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-60">
                    {questions
                      .filter(q => q.category === category)
                      .map(q => (
                        <SelectItem key={q.id} value={q.question} className="text-left">
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
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-left">
              <FileText className="h-4 w-4" />
              Write your own question
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Type your question here..."
              className="min-h-[100px] text-left"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCustomPromptSubmit}
                disabled={!customPrompt.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Question
              </Button>
              <Button
                variant="outline"
                onClick={toggleRecording}
                className={isRecording ? 'bg-red-500/10 border-red-500 text-red-500' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <AnimatedMic size="sm" isRecording={isRecording} />}
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
        <meta name="description" content="Comprehensive TCM knowledge base with AI" />
      </Helmet>

      {/* Source Type Alert - Floating notification */}
      <SourceTypeAlert 
        isVisible={sourceAlert.visible}
        sourceType={sourceAlert.type}
        chunksFound={sourceAlert.chunksFound}
        auditLogId={sourceAlert.auditLogId}
      />

      <div className="min-h-screen bg-background flex flex-col relative">
        {/* Background Image with 75% transparency overlay + blur on input focus */}
        <div 
          className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-300 ${
            isInputFocused ? 'blur-sm scale-105' : ''
          }`}
          style={{ backgroundImage: `url(${acupunctureRoomBg})` }}
        />
        <div className={`fixed inset-0 z-0 transition-all duration-300 ${
          isInputFocused 
            ? 'bg-background/85' 
            : theme === 'dark' ? 'bg-background/80' : 'bg-background/75'
        }`} />
        
        {/* Minimal Header */}
        <header className="bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link 
                to="/dashboard" 
                className="group flex items-center gap-1.5 text-xs font-medium py-1 px-2 rounded-lg
                           bg-gradient-to-r from-jade-600/10 to-jade-500/5
                           text-jade-700 dark:text-jade-300
                           hover:from-jade-600/20 hover:to-jade-500/10
                           transition-all duration-300 hover:-translate-x-1"
              >
                <ArrowRight className="h-3 w-3 rotate-180 animate-pulse-arrow" />
                <span className="animate-bounce-subtle">🏠</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-jade-light rounded-full flex items-center justify-center">
                  <Brain className="h-3 w-3 text-jade" />
                </div>
                <span className="font-display text-sm">TCM Brain</span>
              </div>
              
              {/* Clock - circular with full background */}
              <div className="hidden md:block ml-4">
                <div className="relative h-12 w-12 rounded-full shadow-lg overflow-hidden ring-2 ring-jade/30">
                  <img
                    src={clockImg}
                    alt="Session clock"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-xs font-bold text-white font-mono drop-shadow-lg">
                      {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Session Timer with Controls */}
              <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg bg-jade/10 border border-jade/20">
                <Timer className={`h-3 w-3 ${sessionStatus === 'running' ? 'text-jade animate-pulse' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-mono font-medium ${sessionStatus === 'running' ? 'text-jade' : 'text-muted-foreground'}`}>
                  {formatSessionTime(sessionSeconds)}
                </span>
                
                {/* Session status badge */}
                {sessionStatus !== 'idle' && (
                  <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${
                    sessionStatus === 'running' ? 'border-jade text-jade bg-jade/10' :
                    sessionStatus === 'paused' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                    'border-muted-foreground text-muted-foreground'
                  }`}>
                    {sessionStatus === 'running' ? 'Live' : sessionStatus === 'paused' ? 'Paused' : 'Ended'}
                  </Badge>
                )}
                
                <div className="flex items-center gap-0.5 ml-1 border-l border-border/50 pl-1.5">
                  {/* Start / Continue / Pause */}
                  {sessionStatus === 'idle' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px] gap-0.5 text-jade hover:bg-jade/10"
                      onClick={startSession}
                      title="Start session"
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  ) : sessionStatus === 'running' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={pauseSession}
                      title="Pause session"
                    >
                      <Pause className="h-3 w-3 text-amber-500" />
                    </Button>
                  ) : sessionStatus === 'paused' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={continueSession}
                      title="Continue session"
                    >
                      <Play className="h-3 w-3 text-jade" />
                    </Button>
                  ) : null}
                  
                  {/* End Session (only when running or paused) */}
                  {(sessionStatus === 'running' || sessionStatus === 'paused') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={endSession}
                      title="End session & save report"
                    >
                      <Square className="h-3 w-3 text-red-500 fill-red-500" />
                    </Button>
                  )}
                  
                  {/* Questions count */}
                  {questionsAsked.length > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      {questionsAsked.length}Q
                    </span>
                  )}
                </div>
                
                {/* Share buttons - visible when session has data */}
                {questionsAsked.length > 0 && (
                  <div className="flex items-center gap-0.5 ml-1 border-l border-border/50 pl-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={shareCurrentSessionViaEmail}
                      title="Email session report"
                    >
                      <Mail className="h-3 w-3 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={shareCurrentSessionViaWhatsApp}
                      title="Send via WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3 text-green-500" />
                    </Button>
                  </div>
                )}
                
                {/* Auto-save indicator with manual save */}
                {isSessionRunning && (
                  <div className="flex items-center gap-1 ml-1 border-l border-border/50 pl-1.5">
                    {lastAutoSave && (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
                        <span className="text-[9px] text-muted-foreground" title={`Last saved: ${lastAutoSave.toLocaleTimeString()}`}>
                          {lastAutoSave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={manualSaveSession}
                      title="Save session now"
                    >
                      <Save className="h-3 w-3 text-jade" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Patient History Preview with Popover - show when patient selected */}
              {selectedPatient && patientSessions.length > 0 && (
                <HoverCard openDelay={200}>
                  <HoverCardTrigger asChild>
                    <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors">
                      <History className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {patientSessions.length} past session{patientSessions.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-jade">
                        Last: {new Date(patientSessions[0].startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-jade" />
                        <span className="font-medium text-sm">{selectedPatient.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Past session history</p>
                    </div>
                    <ScrollArea className="max-h-64">
                      <div className="p-2 space-y-2">
                        {patientSessions.map((session, idx) => (
                          <div key={session.id} className="p-2 rounded bg-muted/30 border border-border/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
                                {new Date(session.startTime).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">
                                {session.duration}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {session.questionsAsked.length} questions • {session.totalResponses} responses
                            </div>
                            {session.questionsAsked.length > 0 && (
                              <div className="mt-1.5 space-y-0.5">
                                {session.questionsAsked.slice(0, 3).map((q, i) => (
                                  <div key={i} className="text-[9px] text-foreground/70 truncate">
                                    • {q}
                                  </div>
                                ))}
                                {session.questionsAsked.length > 3 && (
                                  <div className="text-[9px] text-jade">
                                    +{session.questionsAsked.length - 3} more questions
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </HoverCardContent>
                </HoverCard>
              )}
              
              {/* Patient Selection Dropdown */}
              <PatientSelectorDropdown
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={setSelectedPatient}
                isLoading={loadingPatients}
                showOnMobile={true}
                onPatientAdded={() => {
                  // Refresh patients list after adding new patient
                  const fetchPatients = async () => {
                    if (!session?.user?.id) return;
                    const { data } = await supabase
                      .from('patients')
                      .select('id, full_name, email, phone')
                      .eq('therapist_id', session.user.id)
                      .order('full_name');
                    setPatients(data || []);
                  };
                  fetchPatients();
                }}
              />
              
              {/* Patient Visit History Button */}
              <PatientVisitHistoryDialog
                patientId={selectedPatient?.id || null}
                patientName={selectedPatient?.name || null}
                onLoadWorkflow={(data) => {
                  setChainedWorkflow({
                    isActive: true,
                    currentPhase: 'complete',
                    symptomsData: data.symptomsData,
                    diagnosisData: data.diagnosisData,
                    treatmentData: data.treatmentData,
                  });
                  setEditedWorkflow({
                    symptomsData: data.symptomsData,
                    diagnosisData: data.diagnosisData,
                    treatmentData: data.treatmentData,
                  });
                  setInput(data.symptomsData);
                  setWorkflowEditMode(true); // Enable edit mode for loaded workflow
                  setWorkflowSavedToPatient(false); // Not saved yet since we're editing
                  setComparisonWorkflow(null); // Clear comparison when loading
                }}
                onCompareWorkflow={(data) => {
                  setComparisonWorkflow({
                    active: true,
                    visitDate: data.visitDate || '',
                    symptomsData: data.symptomsData,
                    diagnosisData: data.diagnosisData,
                    treatmentData: data.treatmentData,
                  });
                }}
              />
              
              {/* Session Templates Button */}
              <SessionTemplates 
                onApplyTemplate={handleApplyTemplate}
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 gap-1.5 text-xs hidden sm:flex"
                    title="Session templates"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Templates</span>
                  </Button>
                }
              />
              
              {/* Session History Button */}
              <SessionHistoryDialog 
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 gap-1.5 text-xs hidden sm:flex"
                    title="View session history"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">History</span>
                  </Button>
                }
              />
              
              {/* RAG Verification Status Badge - shows REAL query stats */}
              <RAGVerificationStatus liveStats={lastRagStats} />
            </div>
            <div className="flex items-center gap-2">
              {/* Voice Notes - Only show when session is running */}
              {(sessionStatus === 'running' || sessionStatus === 'paused') && (
                <div className="hidden md:block">
                  <VoiceNoteRecorder
                    voiceNotes={voiceNotes}
                    onAddNote={handleAddVoiceNote}
                    onDeleteNote={handleDeleteVoiceNote}
                    disabled={sessionStatus === 'paused'}
                  />
                </div>
              )}
              
              {/* Active Template Badge */}
              {activeTemplate && (
                <Badge variant="secondary" className="text-xs gap-1 hidden sm:flex">
                  <FileText className="h-3 w-3" />
                  {activeTemplate}
                </Badge>
              )}
              
              {/* Theme Toggle with System Option */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 relative overflow-hidden"
                    title="Change theme"
                  >
                    <Sun className={`h-3.5 w-3.5 absolute transition-all duration-500 ${
                      theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                    } text-amber-500`} />
                    <MoonStar className={`h-3.5 w-3.5 absolute transition-all duration-500 ${
                      theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    } text-blue-400`} />
                    <Monitor className={`h-3.5 w-3.5 absolute transition-all duration-500 ${
                      theme === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                    }`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 cursor-pointer">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 cursor-pointer">
                    <MoonStar className="h-4 w-4 text-blue-400" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Voice Notes Drawer */}
              {(sessionStatus === 'running' || sessionStatus === 'paused') && (
                <MobileVoiceNotesDrawer
                  voiceNotes={voiceNotes}
                  onAddNote={handleAddVoiceNote}
                  onDeleteNote={handleDeleteVoiceNote}
                  disabled={sessionStatus === 'paused'}
                />
              )}
              
              <Button
                variant={showDetailedView ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="text-xs gap-1 h-7 px-2"
              >
                {showDetailedView ? (
                  <>
                    <ClipboardList className="h-3 w-3" />
                    Main
                  </>
                ) : (
                  <>
                    <Leaf className="h-3 w-3" />
                    All
                  </>
                )}
              </Button>
              <LanguageSwitcher variant="ghost" isScrolled={true} />
              <TierBadge />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
              {/* Right Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              >
                <Menu className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content with Right Sidebar */}
        <div className="flex-1 flex relative z-10">
          {/* Main Area */}
          <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
            {/* Disclaimer Banner - Show when not signed */}
            {!disclaimerStatus.signed && (
              <div className="mx-4 mt-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {disclaimerStatus.expired ? 'Disclaimer Expired' : 'Disclaimer Required'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {disclaimerStatus.expired 
                        ? 'Your professional disclaimer has expired. Please sign again to continue using AI features.'
                        : 'Please sign the professional disclaimer before using AI features.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/therapist-disclaimer')}
                  className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                >
                  Sign Disclaimer
                </Button>
              </div>
            )}

            {/* RAG Verification Panel - Collapsible */}
            <div className="mx-4 mt-4 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRAGPanel(!showRAGPanel)}
                className="w-full justify-between text-xs h-8"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Knowledge Base Status
                </span>
                <RAGVerificationStatus liveStats={lastRagStats} />
              </Button>
              {showRAGPanel && (
                <div className="space-y-4">
                  <RAGVerificationPanel showQueryLogs={true} />
                  <KnowledgeCoverageDashboard />
                  <LegalLiabilityExport sessionStart={sessionStartTime?.toISOString()} />
                </div>
              )}
              
              {/* Audit Evidence Panel - Shows after queries */}
              {lastRagStats.timestamp && (
                <AuditEvidencePanel 
                  ragMeta={lastRagStats}
                  queryText={currentQuery}
                />
              )}
            </div>

            {/* Feature tabs header */}
            {!showDetailedView && (
              <div className="px-4 pt-4 overflow-x-auto border-b border-border/30 pb-3">
                <div className="flex gap-1 w-max min-w-full">
                  {featureTabs.map((tab) => (
                    tab.isLink ? (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs px-2 whitespace-nowrap bg-jade/10 text-jade hover:bg-jade/20 border border-jade/30"
                        asChild
                      >
                        <Link to={tab.href}>
                          <tab.icon className="h-3 w-3" />
                          {tab.label}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs px-2 whitespace-nowrap hover:bg-jade-light/50 hover:text-jade"
                        onClick={() => {
                          setShowDetailedView(true);
                          setActiveFeatureTab(tab.id);
                        }}
                      >
                        <tab.icon className="h-3 w-3" />
                        {tab.label}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            )}

            {!showDetailedView ? (
              /* Main Queries View - First Page (No Quick Questions) */
              <div className="flex-1 p-4 space-y-4">

                {/* Bookmarked Questions Section */}
                {bookmarkedQuestions.length > 0 && (
                  <Card className="bg-gradient-to-r from-gold/10 via-card to-jade/10 border-2 border-gold/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookmarkCheck className="h-5 w-5 text-gold" />
                        Your Bookmarked Questions
                        <Badge variant="secondary" className="ml-2 bg-gold/20 text-gold-dark">
                          {bookmarkedQuestions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {bookmarkedQuestions.map((question, idx) => (
                          <div 
                            key={idx} 
                            className="group flex items-center gap-1 bg-card rounded-lg border border-border/60 shadow-sm hover:shadow-md transition-all"
                          >
                            <button
                              onClick={() => handleQAQuestionSelect(question)}
                              className="px-3 py-2 text-xs hover:text-jade transition-colors flex items-center gap-2"
                            >
                              <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 text-jade" />
                              <span className="max-w-[200px] truncate">{question}</span>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 mr-1 opacity-50 hover:opacity-100 hover:text-destructive"
                              onClick={() => toggleBookmark(question)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Click a bookmark to send it to AI • Click ✕ to remove
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* AUTO-CHAIN WORKFLOW CARD */}
                <Card className="bg-gradient-to-r from-jade/20 via-jade/10 to-primary/10 border-2 border-jade/40 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-jade/20">
                          <Sparkles className="h-5 w-5 text-jade" />
                        </div>
                        <div>
                          <span className="text-base font-bold">🔄 Auto-Chain Workflow</span>
                          <p className="text-xs text-muted-foreground font-normal mt-0.5">
                            Symptoms → Diagnosis → Treatment (3 AI calls in sequence)
                          </p>
                        </div>
                      </div>
                      {chainedWorkflow.isActive && (
                        <Badge className="bg-jade text-white animate-pulse">
                          {chainedWorkflow.currentPhase === 'symptoms' && '1/3 Symptoms'}
                          {chainedWorkflow.currentPhase === 'diagnosis' && '2/3 Diagnosis'}
                          {chainedWorkflow.currentPhase === 'treatment' && '3/3 Treatment'}
                          {chainedWorkflow.currentPhase === 'complete' && '✓ Complete'}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Describe patient symptoms (e.g., headache, fatigue, poor appetite, cold hands...)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && input.trim() && !isLoading) {
                            e.preventDefault();
                            runChainedWorkflow(input.trim());
                            setInput('');
                          }
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant={voiceLanguage === 'en-US' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVoiceLanguage('en-US')}
                          className="h-10 px-2 text-xs"
                          disabled={isLoading}
                        >
                          EN
                        </Button>
                        <Button
                          type="button"
                          variant={voiceLanguage === 'he-IL' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVoiceLanguage('he-IL')}
                          className="h-10 px-2 text-xs"
                          disabled={isLoading}
                        >
                          עב
                        </Button>
                        <BrowserVoiceInput
                          onTranscription={(text) => {
                            setInput(prev => prev ? `${prev} ${text}` : text);
                          }}
                          disabled={isLoading}
                          language={voiceLanguage}
                          size="md"
                          variant="outline"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (input.trim() && !isLoading) {
                            runChainedWorkflow(input.trim());
                            setInput('');
                          }
                        }}
                        disabled={!input.trim() || isLoading}
                        className="bg-jade hover:bg-jade-600 text-white gap-2"
                      >
                        {isLoading && chainedWorkflow.isActive ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4" />
                            Run Full Workflow
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Progress indicator */}
                    {chainedWorkflow.isActive && (
                      <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg border">
                        <div className={`h-3 w-3 rounded-full ${chainedWorkflow.currentPhase === 'symptoms' ? 'bg-jade animate-pulse' : chainedWorkflow.symptomsData ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-xs">Symptoms</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div className={`h-3 w-3 rounded-full ${chainedWorkflow.currentPhase === 'diagnosis' ? 'bg-jade animate-pulse' : chainedWorkflow.diagnosisData ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-xs">Diagnosis</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <div className={`h-3 w-3 rounded-full ${chainedWorkflow.currentPhase === 'treatment' ? 'bg-jade animate-pulse' : chainedWorkflow.treatmentData ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-xs">Treatment</span>
                        {chainedWorkflow.currentPhase === 'complete' && (
                          <Badge variant="outline" className="ml-2 text-green-600 border-green-500">
                            ✓ Complete
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Edit Mode Panel - when workflow is loaded for editing */}
                    {chainedWorkflow.currentPhase === 'complete' && workflowEditMode && (
                      <Card className="border-amber-500/40 bg-amber-500/5">
                        <CardHeader className="pb-2 pt-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-600">
                              <FileText className="h-4 w-4" />
                              Edit Loaded Workflow
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setWorkflowEditMode(false);
                                // Apply edited values back to chainedWorkflow
                                setChainedWorkflow(prev => ({
                                  ...prev,
                                  symptomsData: editedWorkflow.symptomsData,
                                  diagnosisData: editedWorkflow.diagnosisData,
                                  treatmentData: editedWorkflow.treatmentData,
                                }));
                                setWorkflowSavedToPatient(false);
                              }}
                              className="h-6 text-xs gap-1"
                            >
                              <X className="h-3 w-3" />
                              Done Editing
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Symptoms</label>
                            <Textarea
                              value={editedWorkflow.symptomsData}
                              onChange={(e) => setEditedWorkflow(prev => ({ ...prev, symptomsData: e.target.value }))}
                              className="mt-1 text-sm min-h-[60px]"
                              placeholder="Edit symptoms..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Diagnosis</label>
                            <Textarea
                              value={editedWorkflow.diagnosisData}
                              onChange={(e) => setEditedWorkflow(prev => ({ ...prev, diagnosisData: e.target.value }))}
                              className="mt-1 text-sm min-h-[80px]"
                              placeholder="Edit diagnosis..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Treatment</label>
                            <Textarea
                              value={editedWorkflow.treatmentData}
                              onChange={(e) => setEditedWorkflow(prev => ({ ...prev, treatmentData: e.target.value }))}
                              className="mt-1 text-sm min-h-[80px]"
                              placeholder="Edit treatment..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Comparison Panel - side by side view */}
                    {comparisonWorkflow && chainedWorkflow.currentPhase === 'complete' && (
                      <Card className="border-primary/40 bg-primary/5">
                        <CardHeader className="pb-2 pt-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary">
                              <History className="h-4 w-4" />
                              Comparison with Previous Visit
                              {comparisonWorkflow.visitDate && (
                                <Badge variant="outline" className="text-[10px]">
                                  {new Date(comparisonWorkflow.visitDate).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setComparisonWorkflow(null)}
                              className="h-6 text-xs gap-1"
                            >
                              <X className="h-3 w-3" />
                              Close
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Current Workflow */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-jade flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Current Workflow
                              </h4>
                              <div className="text-xs space-y-2">
                                <div>
                                  <span className="font-medium text-muted-foreground">Symptoms:</span>
                                  <p className="mt-0.5 line-clamp-3">{workflowEditMode ? editedWorkflow.symptomsData : chainedWorkflow.symptomsData}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Diagnosis:</span>
                                  <p className="mt-0.5 line-clamp-4">{workflowEditMode ? editedWorkflow.diagnosisData : chainedWorkflow.diagnosisData}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Treatment:</span>
                                  <p className="mt-0.5 line-clamp-4">{workflowEditMode ? editedWorkflow.treatmentData : chainedWorkflow.treatmentData}</p>
                                </div>
                              </div>
                            </div>
                            {/* Previous Workflow */}
                            <div className="space-y-2 border-l pl-4">
                              <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                <History className="h-3 w-3" />
                                Previous Visit
                              </h4>
                              <div className="text-xs space-y-2 opacity-80">
                                <div>
                                  <span className="font-medium text-muted-foreground">Symptoms:</span>
                                  <p className="mt-0.5 line-clamp-3">{comparisonWorkflow.symptomsData || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Diagnosis:</span>
                                  <p className="mt-0.5 line-clamp-4">{comparisonWorkflow.diagnosisData || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Treatment:</span>
                                  <p className="mt-0.5 line-clamp-4">{comparisonWorkflow.treatmentData || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Save to Patient Record button - visible when complete and patient selected */}
                    {chainedWorkflow.currentPhase === 'complete' && selectedPatient && (
                      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm flex-1">
                          Save to <strong>{selectedPatient.name}</strong>'s record
                        </span>
                        <Button
                          onClick={() => {
                            // If in edit mode, use edited values
                            if (workflowEditMode) {
                              setChainedWorkflow(prev => ({
                                ...prev,
                                symptomsData: editedWorkflow.symptomsData,
                                diagnosisData: editedWorkflow.diagnosisData,
                                treatmentData: editedWorkflow.treatmentData,
                              }));
                              setWorkflowEditMode(false);
                            }
                            saveWorkflowToPatient();
                          }}
                          disabled={savingToPatient || workflowSavedToPatient}
                          size="sm"
                          variant={workflowSavedToPatient ? 'outline' : 'default'}
                          className="gap-1"
                        >
                          {savingToPatient ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Saving...
                            </>
                          ) : workflowSavedToPatient ? (
                            <>
                              <BookmarkCheck className="h-3 w-3 text-green-600" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3" />
                              {workflowEditMode ? 'Save Edited' : 'Save to CRM'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {chainedWorkflow.currentPhase === 'complete' && !selectedPatient && (
                      <p className="text-xs text-amber-600 text-center">
                        ⚠️ Select a patient to save workflow to their record
                      </p>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground text-center">
                      💡 Enter symptoms once → AI automatically generates diagnosis AND treatment plan
                    </p>
                  </CardContent>
                </Card>

                {/* 3 Main Query Categories - Enhanced Design with Search & Filters */}
                <div className="grid md:grid-cols-3 gap-6">
                  {mainQueryCategories.map((category) => {
                    const allCategories = [...new Set(category.questions.map(q => q.category))].sort();
                    const isExpanded = expandedCategory === category.id;
                    const searchTerm = categorySearches[category.id] || '';
                    const subjectFilter = categoryFilters[category.id] || 'all';
                    const alphabetFilter = alphabetFilters[category.id] || 'all';
                    
                    // Filter questions based on search, subject, and alphabet
                    const filteredQuestions = category.questions.filter(q => {
                      const matchesSearch = searchTerm === '' || 
                        q.question.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesSubject = subjectFilter === 'all' || q.category === subjectFilter;
                      const matchesAlphabet = alphabetFilter === 'all' || 
                        q.question.charAt(0).toUpperCase() === alphabetFilter;
                      return matchesSearch && matchesSubject && matchesAlphabet;
                    });
                    
                    // Get unique first letters for alphabet filter
                    const availableLetters = [...new Set(
                      category.questions.map(q => q.question.charAt(0).toUpperCase())
                    )].sort();
                    
                    return (
                      <Card 
                        key={category.id} 
                        className={`relative overflow-hidden bg-gradient-to-br from-card via-card to-jade/5 
                                   border-2 border-border/60 hover:border-jade/60 
                                   shadow-lg hover:shadow-xl hover:shadow-jade/10
                                   transition-all duration-300 
                                   ${isExpanded ? 'md:col-span-3 ring-2 ring-jade/30' : 'hover:-translate-y-1'}`}
                      >
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-jade/10 to-transparent rounded-bl-full" />
                        
                        {/* Close/Back button when expanded */}
                        {isExpanded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-3 right-3 h-8 gap-1.5 text-xs bg-background/80 hover:bg-background z-10"
                            onClick={() => setExpandedCategory(null)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Back to All Categories
                          </Button>
                        )}
                        
                        <CardHeader className="pb-4 relative">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-jade-light to-jade/20 
                                          flex items-center justify-center shadow-md border border-jade/20
                                          group-hover:scale-105 transition-transform">
                              <category.icon className="h-7 w-7 text-jade" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-display">{category.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
                              <Badge variant="secondary" className="mt-2 text-xs bg-jade/10 text-jade border-jade/20">
                                {filteredQuestions.length} / {category.questions.length} questions
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          {isExpanded ? (
                            <>
                              {/* Search & Filter Bar */}
                              <div className="space-y-3 p-3 bg-jade/5 rounded-xl border border-jade/20">
                                {/* Search Input */}
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search questions..."
                                    value={searchTerm}
                                    onChange={(e) => setCategorySearches(prev => ({ 
                                      ...prev, 
                                      [category.id]: e.target.value 
                                    }))}
                                    className="pl-10 h-9 bg-background border-border/60"
                                  />
                                  {searchTerm && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                      onClick={() => setCategorySearches(prev => ({ 
                                        ...prev, 
                                        [category.id]: '' 
                                      }))}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Filter Row */}
                                <div className="flex flex-wrap gap-2">
                                  {/* Subject Filter */}
                                  <Select
                                    value={subjectFilter}
                                    onValueChange={(value) => setCategoryFilters(prev => ({ 
                                      ...prev, 
                                      [category.id]: value 
                                    }))}
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                                      <Filter className="h-3 w-3 mr-1" />
                                      <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border z-50">
                                      <SelectItem value="all">All Subjects</SelectItem>
                                      {allCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  {/* Alphabet Filter */}
                                  <Select
                                    value={alphabetFilter}
                                    onValueChange={(value) => setAlphabetFilters(prev => ({ 
                                      ...prev, 
                                      [category.id]: value 
                                    }))}
                                  >
                                    <SelectTrigger className="w-[100px] h-8 text-xs bg-background">
                                      <SelectValue placeholder="A-Z" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border z-50 max-h-60">
                                      <SelectItem value="all">All (A-Z)</SelectItem>
                                      {availableLetters.map(letter => (
                                        <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  {/* Clear Filters */}
                                  {(searchTerm || subjectFilter !== 'all' || alphabetFilter !== 'all') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        setCategorySearches(prev => ({ ...prev, [category.id]: '' }));
                                        setCategoryFilters(prev => ({ ...prev, [category.id]: 'all' }));
                                        setAlphabetFilters(prev => ({ ...prev, [category.id]: 'all' }));
                                      }}
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Clear
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Filtered Questions Grid */}
                              <div className="grid md:grid-cols-3 gap-4 p-3 bg-background/50 rounded-xl border border-border/50">
                                {subjectFilter === 'all' ? (
                                  // Group by category when showing all
                                  allCategories.map(cat => {
                                    const catQuestions = filteredQuestions.filter(q => q.category === cat);
                                    if (catQuestions.length === 0) return null;
                                    return (
                                      <div key={cat} className="space-y-2">
                                        <h4 className="text-xs font-semibold text-jade uppercase tracking-wider flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-jade" />
                                          {cat}
                                          <span className="text-muted-foreground font-normal">({catQuestions.length})</span>
                                        </h4>
                                        <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                          {catQuestions
                                            .sort((a, b) => a.question.localeCompare(b.question))
                                            .map(q => (
                                              <div key={q.id} className="flex items-center gap-1">
                                                <button
                                                  onClick={() => handleQAQuestionSelect(q.question)}
                                                  className="flex-1 text-left text-xs p-2.5 rounded-lg 
                                                           bg-card hover:bg-jade/15 hover:pl-5 
                                                           transition-all duration-200 group 
                                                           flex items-center gap-2 
                                                           border border-border/50 hover:border-jade/40
                                                           shadow-sm hover:shadow-md"
                                                >
                                                  <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 text-jade transition-opacity shrink-0" />
                                                  <span className="flex-1">{q.question}</span>
                                                </button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8 shrink-0"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(q.question);
                                                  }}
                                                >
                                                  {isBookmarked(q.question) ? (
                                                    <BookmarkCheck className="h-4 w-4 text-jade" />
                                                  ) : (
                                                    <Bookmark className="h-4 w-4 text-muted-foreground hover:text-jade" />
                                                  )}
                                                </Button>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  // Show flat list when filtered by subject
                                  <div className="md:col-span-3 space-y-1 max-h-64 overflow-y-auto">
                                    {filteredQuestions.length === 0 ? (
                                      <p className="text-center text-muted-foreground py-8 text-sm">
                                        No questions match your filters
                                      </p>
                                    ) : (
                                      filteredQuestions
                                        .sort((a, b) => a.question.localeCompare(b.question))
                                        .map(q => (
                                          <div key={q.id} className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleQAQuestionSelect(q.question)}
                                              className="flex-1 text-left text-xs p-2.5 rounded-lg 
                                                       bg-card hover:bg-jade/15 hover:pl-5 
                                                       transition-all duration-200 group 
                                                       flex items-center gap-2 
                                                       border border-border/50 hover:border-jade/40
                                                       shadow-sm hover:shadow-md"
                                            >
                                              <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 text-jade transition-opacity shrink-0" />
                                              <span className="flex-1">{q.question}</span>
                                              <Badge variant="outline" className="text-[10px] shrink-0">{q.category}</Badge>
                                            </button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 shrink-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark(q.question);
                                              }}
                                            >
                                              {isBookmarked(q.question) ? (
                                                <BookmarkCheck className="h-4 w-4 text-jade" />
                                              ) : (
                                                <Bookmark className="h-4 w-4 text-muted-foreground hover:text-jade" />
                                              )}
                                            </Button>
                                          </div>
                                        ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="space-y-2">
                              {allCategories.slice(0, 3).map(cat => (
                                <Select
                                  key={cat}
                                  onValueChange={(value) => handleQAQuestionSelect(value)}
                                >
                                  <SelectTrigger className="text-left text-sm h-10 bg-background/80 border-border/60 hover:border-jade/50 transition-colors">
                                    <SelectValue placeholder={cat} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border z-50 max-h-60">
                                    {category.questions
                                      .filter(q => q.category === cat)
                                      .sort((a, b) => a.question.localeCompare(b.question))
                                      .map(q => (
                                        <SelectItem key={q.id} value={q.question} className="text-left text-sm cursor-pointer">
                                          <span className="flex items-center gap-2">
                                            <Send className="h-3 w-3 text-jade" />
                                            {q.question}
                                          </span>
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-jade hover:text-jade-dark hover:bg-jade/10 text-xs h-9 mt-2 font-medium"
                            onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          >
                            {isExpanded ? '← Collapse' : `View all ${category.questions.length} questions →`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* AI Response Display - Shows loading animation and organized results */}
                {(isLoading || messages.length > 0) && (
                  <div ref={aiResponseRef}>
                    <AIResponseDisplay
                      isLoading={isLoading}
                      content={messages.filter(m => m.role === 'assistant').pop()?.content || ''}
                      query={currentQuery || messages.filter(m => m.role === 'user').pop()?.content || ''}
                      loadingStartTime={loadingStartTime || undefined}
                      ragMeta={lastRagStats}
                      onViewBodyMap={(points) => {
                        setHighlightedPoints(points);
                        setShowDetailedView(true);
                        setActiveFeatureTab('bodymap');
                      }}
                    />
                  </div>
                )}

                {/* Ask AI/RAG Button with Inline Chat Expansion */}
                <div className="pt-4 space-y-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowInlineChat(!showInlineChat)}
                      className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl 
                                 bg-gradient-to-r from-jade via-jade-600 to-jade
                                 hover:from-jade-600 hover:via-jade-500 hover:to-jade-600
                                 text-white font-medium text-sm shadow-md hover:shadow-lg
                                 transition-all duration-300 hover:scale-[1.02]
                                 border border-jade-400/40 overflow-hidden"
                    >
                      {/* Decorative circuit pattern on right side */}
                      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-l from-jade-400/50 to-transparent" />
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-jade-300/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="12" cy="12" r="3" />
                          <line x1="12" y1="1" x2="12" y2="5" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="1" y1="12" x2="5" y2="12" />
                          <line x1="19" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
                          <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
                          <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
                          <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
                        </svg>
                      </div>
                      
                      <Brain className="h-5 w-5 relative z-10" />
                      <span className="relative z-10 font-semibold tracking-wide">
                        {showInlineChat ? 'Close Chat' : 'Ask AI / RAG'}
                      </span>
                      <Sparkles className="h-4 w-4 relative z-10 text-gold-light group-hover:animate-pulse ml-0.5" />
                    </button>
                  </div>
                  
                  {/* Inline Chat Expansion */}
                  {showInlineChat && (
                    <Card className="max-w-2xl mx-auto border-2 border-jade/30 shadow-lg animate-fade-in-up">
                      <CardContent className="p-4">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!input.trim() || isLoading) return;
                            const message = input.trim();
                            setInput('');
                            streamChat(message);
                          }} 
                          className="flex gap-2"
                        >
                          <div className="flex-1 relative">
                            <Input
                              ref={chatInputRef}
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onFocus={() => setIsInputFocused(true)}
                              onBlur={() => setIsInputFocused(false)}
                              placeholder="Ask any TCM question..."
                              disabled={isLoading}
                              autoFocus
                              className="text-left pr-24 h-12 rounded-xl border-jade/30 focus:border-jade transition-colors"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {/* Language selector */}
                              <Select value={voiceLang} onValueChange={setVoiceLang}>
                                <SelectTrigger className="h-8 w-14 text-xs border-0 bg-transparent px-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="he-IL">🇮🇱 HE</SelectItem>
                                  <SelectItem value="en-US">🇺🇸 EN</SelectItem>
                                  <SelectItem value="ru-RU">🇷🇺 RU</SelectItem>
                                </SelectContent>
                              </Select>
                              {/* Browser Voice Input */}
                              <BrowserVoiceInput
                                onTranscription={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                                language={voiceLang}
                                size="sm"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            className="h-12 px-6 rounded-xl bg-jade hover:bg-jade/90"
                          >
                            {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-5 w-5 mr-2" />
                                Send
                              </>
                            )}
                          </Button>
                        </form>
                        <p className="text-xs text-muted-foreground mt-3 text-center">
                          Ask about herbs, acupuncture points, TCM patterns, and more
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Clear Chat Button */}
                {messages.length > 0 && !isLoading && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMessages([]);
                        setHighlightedPoints([]);
                        setCurrentQuery('');
                      }}
                      className="text-muted-foreground hover:text-destructive text-xs gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear & start new query
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Detailed View - All Topics Tabs (includes Quick Questions) */
              <Tabs value={activeFeatureTab} onValueChange={setActiveFeatureTab} className="flex-1 flex flex-col">
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
                      onClick={() => {
                        setMessages([]);
                        setHighlightedPoints([]);
                      }}
                      className="text-muted-foreground hover:text-destructive text-xs gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear chat
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {messages.length} messages
                    </span>
                  </div>
                )}

                <ScrollArea className="flex-1 pl-4" ref={scrollRef}>
                  <div className="space-y-4 pb-4">
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <div className="absolute inset-0 bg-jade/20 rounded-full animate-pulse-soft" />
                          <div className="absolute inset-2 bg-gradient-to-br from-jade-light to-gold-light rounded-full flex items-center justify-center border-2 border-jade/30">
                            <Brain className="h-10 w-10 text-jade" />
                          </div>
                        </div>
                        <h2 className="font-display text-3xl mb-3 text-center bg-gradient-to-r from-jade to-jade-dark bg-clip-text text-transparent">
                          Welcome to TCM Brain
                        </h2>
                        <p className="text-muted-foreground mb-8 text-center max-w-md mx-auto">
                          Your personal assistant for Traditional Chinese Medicine. Ask any question about herbs, acupuncture points, diagnosis, and more.
                        </p>
                        
                        {/* Quick Questions in detailed view */}
                        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          {quickQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickQuestion(q.text)}
                              className="p-5 bg-gradient-to-br from-card to-card/80 border border-border/80 rounded-xl text-left hover:border-jade hover:shadow-elevated transition-all group relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jade/0 via-jade/50 to-jade/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="w-10 h-10 rounded-lg bg-jade-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <q.icon className="h-5 w-5 text-jade" />
                              </div>
                              <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => {
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
                <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-border/50 bg-background/50 backdrop-blur-sm -mx-4 px-4 -mb-4 pb-4">
                  <div className="flex-1 relative">
                    <Input
                      ref={chatInputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Ask a TCM question..."
                      disabled={isLoading}
                      className="text-left pr-24 h-12 rounded-xl border-border/80 focus:border-jade transition-colors"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {/* Language selector */}
                      <Select value={voiceLang} onValueChange={setVoiceLang}>
                        <SelectTrigger className="h-8 w-14 text-xs border-0 bg-transparent px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="he-IL">🇮🇱 HE</SelectItem>
                          <SelectItem value="en-US">🇺🇸 EN</SelectItem>
                          <SelectItem value="ru-RU">🇷🇺 RU</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Browser Voice Input */}
                      <BrowserVoiceInput
                        onTranscription={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                        language={voiceLang}
                        size="sm"
                        disabled={isLoading}
                      />
                    </div>
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

              {/* Body Map Tab */}
              <TabsContent value="bodymap" className="flex-1 overflow-auto p-4">
                <BodyFigureSelector 
                  highlightedPoints={highlightedPoints} 
                  onGenerateProtocol={(points) => {
                    const prompt = `Generate a detailed TCM treatment protocol for the following acupuncture points: ${points.join(', ')}. 

Include:
1. Treatment principle and therapeutic goal
2. Point combination analysis - why these points work together
3. Needling technique recommendations (depth, angle, stimulation)
4. Order of point insertion
5. Recommended needle retention time
6. Contraindications and precautions
7. Expected therapeutic effects
8. Complementary techniques (moxa, cupping, electroacupuncture if applicable)
9. Treatment frequency and course recommendation`;
                    streamChat(prompt);
                    // Switch to chat tab to see the response
                    setActiveFeatureTab('chat');
                  }}
                />
              </TabsContent>

              {/* Trauma Tab */}
              <TabsContent value="trauma" className="flex-1 overflow-auto">
                {renderQASection(
                  'Trauma & Casualties',
                  traumaQuestions,
                  selectedTraumaQuestion,
                  setSelectedTraumaQuestion
                )}
              </TabsContent>

              {/* Pediatric Tab */}
              <TabsContent value="pediatric" className="flex-1 overflow-auto">
                {renderQASection(
                  'Pediatric Acupuncture',
                  pediatricQuestions,
                  selectedPediatricQuestion,
                  setSelectedPediatricQuestion
                )}
              </TabsContent>

              {/* Crisis Tab */}
              <TabsContent value="crisis" className="flex-1 overflow-auto">
                {renderQASection(
                  'Profound Crisis & Severe Depression',
                  crisisQuestions,
                  selectedCrisisQuestion,
                  setSelectedCrisisQuestion
                )}
              </TabsContent>

              {/* Women's Health Tab */}
              <TabsContent value="womens-health" className="flex-1 overflow-auto">
                {renderQASection(
                  "Women's Health TCM",
                  womensHealthQuestions,
                  selectedWomensHealthQuestion,
                  setSelectedWomensHealthQuestion
                )}
              </TabsContent>

              {/* Immune Resilience Tab */}
              <TabsContent value="immune" className="flex-1 overflow-auto">
                {renderQASection(
                  'Immune Resilience & Wei Qi',
                  immuneResilienceQuestions,
                  selectedImmuneQuestion,
                  setSelectedImmuneQuestion
                )}
              </TabsContent>

              {/* Sport Performance & Recovery Tab */}
              <TabsContent value="sport-recovery" className="flex-1 overflow-auto">
                {renderQASection(
                  'Sport Performance & Recovery',
                  sportPerformanceQuestions,
                  selectedSportRecoveryQuestion,
                  setSelectedSportRecoveryQuestion
                )}
              </TabsContent>

              {/* Work Stress & Burnout Tab */}
              <TabsContent value="work-stress" className="flex-1 overflow-auto">
                {renderQASection(
                  'Work Stress & Burnout',
                  workStressBurnoutQuestions,
                  selectedWorkStressQuestion,
                  setSelectedWorkStressQuestion
                )}
              </TabsContent>

              {/* Skin Disease Tab */}
              <TabsContent value="skin-disease" className="flex-1 overflow-auto">
                {renderQASection(
                  'Skin Disease & Dermatology',
                  skinDiseaseQuestions,
                  selectedSkinDiseaseQuestion,
                  setSelectedSkinDiseaseQuestion
                )}
              </TabsContent>

              {/* Climate & Extreme Weather Tab */}
              <TabsContent value="climate" className="flex-1 overflow-auto">
                {renderQASection(
                  'Extreme Weather & Climate',
                  extremeWeatherQuestions,
                  selectedClimateQuestion,
                  setSelectedClimateQuestion
                )}
              </TabsContent>

              {/* Herbs Tab */}
              <TabsContent value="herbs" className="flex-1 overflow-auto">
                {renderQASection(
                  'Chinese Herbal Medicine',
                  herbsQuestions,
                  selectedHerbsQuestion,
                  setSelectedHerbsQuestion
                )}
              </TabsContent>

              {/* Points Tab */}
              <TabsContent value="points" className="flex-1 overflow-auto">
                {renderQASection(
                  'Acupuncture Points',
                  pointsQuestions,
                  selectedPointsQuestion,
                  setSelectedPointsQuestion
                )}
              </TabsContent>

              {/* Conditions Tab */}
              <TabsContent value="conditions" className="flex-1 overflow-auto">
                {renderQASection(
                  'TCM Conditions & Patterns',
                  conditionsQuestions,
                  selectedConditionsQuestion,
                  setSelectedConditionsQuestion
                )}
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="flex-1 overflow-auto">
                {renderQASection(
                  'TCM Nutrition',
                  nutritionQuestions,
                  selectedNutritionQuestion,
                  setSelectedNutritionQuestion
                )}
              </TabsContent>

              {/* Mental Tab */}
              <TabsContent value="mental" className="flex-1 overflow-auto">
                {renderQASection(
                  'Mental Health in TCM',
                  mentalQuestions,
                  selectedMentalQuestion,
                  setSelectedMentalQuestion
                )}
              </TabsContent>

              {/* Sleep Tab */}
              <TabsContent value="sleep" className="flex-1 overflow-auto">
                {renderQASection(
                  'Sleep Quality in TCM',
                  sleepQuestions,
                  selectedSleepQuestion,
                  setSelectedSleepQuestion
                )}
              </TabsContent>

              {/* Work-Life Tab */}
              <TabsContent value="worklife" className="flex-1 overflow-auto">
                {renderQASection(
                  'Work-Life Balance',
                  worklifeQuestions,
                  selectedWorklifeQuestion,
                  setSelectedWorklifeQuestion
                )}
              </TabsContent>

              {/* Bazi Tab */}
              <TabsContent value="bazi" className="flex-1 overflow-auto">
                {renderQASection(
                  'Bazi - Four Pillars',
                  baziQuestions,
                  selectedBaziQuestion,
                  setSelectedBaziQuestion
                )}
              </TabsContent>

              {/* Wellness Tab */}
              <TabsContent value="wellness" className="flex-1 overflow-auto">
                {renderQASection(
                  'General Wellness',
                  wellnessQuestions,
                  selectedWellnessQuestion,
                  setSelectedWellnessQuestion
                )}
              </TabsContent>

              {/* Sports Tab */}
              <TabsContent value="sports" className="flex-1 overflow-auto">
                {renderQASection(
                  'Chinese Sports Medicine',
                  sportsQuestions,
                  selectedSportsQuestion,
                  setSelectedSportsQuestion
                )}
              </TabsContent>

              {/* Astrology Tab */}
              <TabsContent value="astro" className="flex-1 overflow-auto">
                {renderQASection(
                  'Chinese Astrology',
                  astroQuestions,
                  selectedAstroQuestion,
                  setSelectedAstroQuestion
                )}
              </TabsContent>
              </Tabs>
            )}
          </main>

          {/* Right Sidebar */}
          <aside 
            className={`fixed right-0 top-[52px] bottom-0 w-64 bg-card border-l border-border z-40 transition-transform duration-300 ${
              rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Quick Actions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setRightSidebarOpen(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    chatInputRef.current?.focus();
                    setRightSidebarOpen(false);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    toggleRecording();
                    setRightSidebarOpen(false);
                  }}
                >
                  {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <AnimatedMic size="sm" isRecording={isRecording} />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    const historySection = document.querySelector('[data-section="chat-history-section"]');
                    historySection?.scrollIntoView({ behavior: 'smooth' });
                    setRightSidebarOpen(false);
                  }}
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  asChild
                >
                  <Link to="/feedback">
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </Link>
                </Button>
              </div>

              {/* Highlighted Points in Sidebar */}
              {highlightedPoints.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Recommended Points
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {highlightedPoints.map(point => (
                      <Button
                        key={point}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs bg-jade/10 border-jade/30 text-jade"
                        onClick={() => {
                          setShowDetailedView(true);
                          setRightSidebarOpen(false);
                          setTimeout(() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            const bodyMapTab = tabsList?.querySelector('[value="bodymap"]') as HTMLButtonElement;
                            bodyMapTab?.click();
                          }, 50);
                        }}
                      >
                        {point}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Sidebar Overlay */}
          {rightSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
              onClick={() => setRightSidebarOpen(false)}
            />
          )}
        </div>
      </div>

    </>
  );
}
