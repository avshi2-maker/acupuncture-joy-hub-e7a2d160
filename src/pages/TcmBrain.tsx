import { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Brain, 
  Pill, 
  User as UserIcon, 
  FileText, 
  Clock,
  Save,
  Database,
  ChevronDown,
  ChevronUp,
  MessageCircleQuestion,
  Play,
  Pause,
  Square,
  RotateCcw,
  Printer,
  MessageCircle,
  Mail,
  Leaf,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Heart,
  Mic,
  Baby,
  Sparkles,
  Apple,
  Activity
} from 'lucide-react';
import { APIUsageMeter } from '@/components/tcm-brain/APIUsageMeter';
import { useTcmBrainState } from '@/hooks/useTcmBrainState';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DiagnosticsTab } from '@/components/tcm-brain/DiagnosticsTab';
import { SymptomsTab } from '@/components/tcm-brain/SymptomsTab';
import { TreatmentTab } from '@/components/tcm-brain/TreatmentTab';
import { BodyMapTab } from '@/components/tcm-brain/BodyMapTab';
import { SessionNotesTab } from '@/components/tcm-brain/SessionNotesTab';
import { PatientHistoryTab } from '@/components/tcm-brain/PatientHistoryTab';
import { PatientSelectorDropdown } from '@/components/crm/PatientSelectorDropdown';
import { TcmBrainToolbar, TcmVoiceCommand } from '@/components/tcm-brain/TcmBrainToolbar';
import { KnowledgeAssetTabs, detectActiveAssets } from '@/components/tcm-brain/KnowledgeAssetTabs';
import { QuickActionBoxes } from '@/components/tcm-brain/QuickActionBoxes';
import { IntakeReviewDialog } from '@/components/tcm-brain/IntakeReviewDialog';
import { QuickActionsRef } from '@/components/tcm-brain/QuickActionsBar';
import { QASuggestionsPanel } from '@/components/tcm/QASuggestionsPanel';
import { ExternalAIFallbackCard, ExternalAIProvider } from '@/components/tcm/ExternalAIFallbackCard';
import { SessionHeaderBoxes, SessionHeaderBox, SessionPhaseIndicator } from '@/components/session';
import { useSessionPhase } from '@/hooks/useSessionPhase';
import { CrossPlatformBackButton } from '@/components/ui/CrossPlatformBackButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TierBadge } from '@/components/layout/TierBadge';
import { FloatingHelpGuide } from '@/components/ui/FloatingHelpGuide';
import { PregnancySafetyDialog, ElderlyLifestyleDialog } from '@/components/clinical';
import { SessionBriefPanel } from '@/components/video/SessionBriefPanel';
import { toast } from 'sonner';
import clockImg from '@/assets/clock.png';

export default function TcmBrain() {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [activeAssets, setActiveAssets] = useState<string[]>([]);
  const [showKnowledgeAssets, setShowKnowledgeAssets] = useState(true);
  const [showQASuggestions, setShowQASuggestions] = useState(false);
  const [showIntakeReview, setShowIntakeReview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showPregnancyCalc, setShowPregnancyCalc] = useState(false);
  const [showElderlyGuide, setShowElderlyGuide] = useState(false);
  const [showSessionBrief, setShowSessionBrief] = useState(false);
  const [qaFavoritesCount, setQaFavoritesCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const quickActionsRef = useRef<QuickActionsRef>(null);
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  const {
    messages,
    isLoading,
    streamChat,
    clearChat,
    sessionStatus,
    sessionSeconds,
    formatSessionTime,
    startSession,
    pauseSession,
    continueSession,
    endSession,
    patients,
    selectedPatient,
    setSelectedPatient,
    loadingPatients,
    voiceNotes,
    handleAddVoiceNote,
    handleDeleteVoiceNote,
    activeTemplate,
    handleApplyTemplate,
    questionsAsked,
    highlightedPoints,
    patientSessions,
    setChainedWorkflow,
    openGmailWithSession,
    openWhatsAppWithSession,
    externalFallbackQuery,
    dismissExternalFallback,
    runExternalAIFallback,
  } = useTcmBrainState();

  // Session phase with haptic feedback and persistence
  const { currentPhase, setPhase, clearManualPhase, isManualOverride } = useSessionPhase(sessionSeconds);
  const { lastSaveTime, isSaving, saveNow, loadSavedSession, clearSavedSession } = useAutoSave(
    {
      messages,
      questionsAsked,
      sessionSeconds,
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.name,
      activeTemplate,
    },
    sessionStatus === 'running'
  );

  // Check for saved session on mount
  useEffect(() => {
    const saved = loadSavedSession();
    if (saved && saved.messages.length > 0) {
      toast.info(
        `Found auto-saved session from ${saved.patientName || 'Unknown'}. Continue?`,
        {
          duration: 10000,
          action: {
            label: 'Restore',
            onClick: () => {
              toast.success('Session restored');
              clearSavedSession();
            },
          },
        }
      );
    }
  }, []);

  // Detect active knowledge assets from messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const detected = detectActiveAssets(lastMessage.content);
        if (detected.length > 0) {
          setActiveAssets(detected);
        }
      }
    }
  }, [messages]);

  // Track Q&A favorites count from localStorage
  useEffect(() => {
    const updateFavoritesCount = () => {
      try {
        const stored = localStorage.getItem('tcm-qa-favorites');
        if (stored) {
          const favorites = JSON.parse(stored);
          setQaFavoritesCount(Array.isArray(favorites) ? favorites.length : 0);
        } else {
          setQaFavoritesCount(0);
        }
      } catch {
        setQaFavoritesCount(0);
      }
    };
    
    // Initial load
    updateFavoritesCount();
    
    // Listen for storage changes (from QASuggestionsPanel)
    window.addEventListener('storage', updateFavoritesCount);
    
    // Also poll periodically for same-tab updates
    const interval = setInterval(updateFavoritesCount, 2000);
    
    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      clearInterval(interval);
    };
  }, []);

  // Auto-trigger Session Brief when patient is selected
  useEffect(() => {
    if (selectedPatient?.id) {
      setShowSessionBrief(true);
      toast.info('🧠 Generating session brief...', { duration: 2000 });
    } else {
      setShowSessionBrief(false);
    }
  }, [selectedPatient?.id]);

  // Tab navigation
  const tabItems = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope, description: 'P1-P2' },
    { id: 'symptoms', label: 'Symptoms', icon: Brain, description: 'P3' },
    { id: 'treatment', label: 'Treatment', icon: Pill, description: 'P4-P6' },
    { id: 'bodymap', label: 'Body Map', icon: UserIcon, description: 'Points' },
    { id: 'session', label: 'Session', icon: FileText, description: 'Notes' },
    { id: 'history', label: 'History', icon: Clock, description: 'Patient' },
  ];

  // Voice command handler
  const handleVoiceCommand = useCallback((command: TcmVoiceCommand) => {
    console.log('[TcmBrain] Voice command:', command);
    
    switch (command) {
      case 'generate-summary':
        quickActionsRef.current?.generateSummary();
        break;
      case 'save-to-patient':
        quickActionsRef.current?.saveToPatient();
        break;
      case 'export-session':
        quickActionsRef.current?.exportSession();
        break;
      case 'print-report':
        quickActionsRef.current?.printReport();
        break;
      case 'share-whatsapp':
        quickActionsRef.current?.shareWhatsApp();
        break;
      case 'generate-audio':
        quickActionsRef.current?.transcriptToMP3();
        break;
      case 'start-session':
        if (sessionStatus === 'idle') startSession();
        else if (sessionStatus === 'paused') continueSession();
        break;
      case 'pause-session':
        if (sessionStatus === 'running') pauseSession();
        break;
      case 'end-session':
        if (sessionStatus !== 'idle') endSession();
        break;
      case 'clear-chat':
        clearChat();
        break;
      case 'next-tab':
        setActiveTab(prev => {
          const idx = tabItems.findIndex(t => t.id === prev);
          return tabItems[(idx + 1) % tabItems.length].id;
        });
        break;
      case 'previous-tab':
        setActiveTab(prev => {
          const idx = tabItems.findIndex(t => t.id === prev);
          return tabItems[(idx - 1 + tabItems.length) % tabItems.length].id;
        });
        break;
      case 'show-brief':
        setShowSessionBrief(true);
        toast.success('📋 Session Brief opened');
        break;
      case 'hide-brief':
        setShowSessionBrief(false);
        toast.info('Session Brief closed');
        break;
    }
  }, [sessionStatus, startSession, pauseSession, continueSession, endSession, clearChat, tabItems]);

  return (
    <>
      <Helmet>
        <title>CM Brain - Clinical Assistant</title>
        <meta name="description" content="AI-powered Chinese Medicine clinical assistant" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Header - Unified with VideoSession style */}
        <header className="border-b bg-gradient-to-r from-emerald-900/20 via-emerald-800/10 to-emerald-900/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-full mx-auto px-3 md:px-4 py-2 md:py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Back + Logo + Title */}
              <div className="flex items-center gap-2 md:gap-3">
                <CrossPlatformBackButton 
                  fallbackPath="/dashboard" 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden h-9 w-9"
                />
                <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="font-display text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                      CM BRAIN
                    </h1>
                    <p className="text-xs text-muted-foreground">Clinical AI Assistant</p>
                  </div>
                </Link>
                
                {/* Help Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpGuide(true)}
                  className="h-8 px-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold shadow-lg transition-all"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Help</span>
                </Button>
              </div>

              {/* Center: Clock (Desktop) */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
                <div className="relative h-16 w-16 rounded-full shadow-lg overflow-hidden">
                  <img
                    src={clockImg}
                    alt="Session clock"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-sm font-bold text-white font-mono drop-shadow-lg">
                      {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Patient Selector + Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                {activeAssets.length > 0 && (
                  <Badge className="bg-jade/20 text-jade border-jade/30 hidden md:flex">
                    <Database className="h-3 w-3 mr-1" />
                    {activeAssets.length} Active
                  </Badge>
                )}
                
                <PatientSelectorDropdown 
                  patients={patients}
                  selectedPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                  isLoading={loadingPatients}
                />

                {/* Auto-save indicator */}
                {sessionStatus === 'running' && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs cursor-pointer hidden md:flex ${isSaving ? 'animate-pulse' : ''}`}
                    onClick={saveNow}
                    title={lastSaveTime ? `Last saved: ${lastSaveTime.toLocaleTimeString()}` : 'Click to save now'}
                  >
                    <Save className={`h-3 w-3 mr-1 ${isSaving ? 'text-jade' : ''}`} />
                    {isSaving ? 'Saving...' : 'Auto'}
                  </Badge>
                )}
                
                <div className="hidden md:flex items-center gap-2">
                  <LanguageSwitcher variant="outline" isScrolled={true} />
                  <Button asChild variant="outline" size="sm" className="border-jade/30 text-jade hover:bg-jade/10">
                    <Link to="/caf-browser" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      CAF Studies
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard" className="gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <TierBadge />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* API Usage Meter Bar */}
        <div className="border-b bg-card/30 backdrop-blur-sm py-1.5 px-3 overflow-x-auto">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground text-[10px]">AI Status:</span>
            </div>
            <APIUsageMeter />
          </div>
        </div>

        {/* Session Phase Indicator - Unified with VideoSession */}
        <div className="px-3 md:px-6 pt-3 pb-2 border-b bg-gradient-to-r from-jade/5 via-transparent to-jade/5">
          <SessionPhaseIndicator
            currentPhase={currentPhase}
            patientName={selectedPatient?.name}
            isManualOverride={isManualOverride}
            onResetToAuto={clearManualPhase}
            onPhaseClick={(phase) => {
              setPhase(phase);
              // Navigate to relevant tab based on phase
              if (phase === 'opening') setActiveTab('history');
              else if (phase === 'diagnosis') setActiveTab('diagnostics');
              else if (phase === 'treatment') setActiveTab('treatment');
              else if (phase === 'closing') setActiveTab('notes');
            }}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Header Boxes Row - Organized by Category with Separators */}
        <div className="px-3 md:px-4 pt-2 md:pt-3 pb-2 border-b bg-gradient-to-b from-emerald-500/5 to-transparent">
          <SessionHeaderBoxes
            groups={[
              {
                id: 'session-controls',
                boxes: [
                  {
                    id: 'start-session',
                    name: sessionStatus === 'idle' ? 'Start' : sessionStatus === 'running' ? 'Pause' : 'Resume',
                    nameHe: sessionStatus === 'idle' ? 'התחל' : sessionStatus === 'running' ? 'השהה' : 'המשך',
                    icon: sessionStatus === 'running' ? Pause : Play,
                    color: 'text-jade',
                    borderColor: 'border-jade',
                    isActive: sessionStatus === 'running',
                    tooltip: 'Start, pause or resume the session timer',
                    onClick: () => {
                      if (sessionStatus === 'idle') startSession();
                      else if (sessionStatus === 'running') pauseSession();
                      else continueSession();
                    },
                  },
                  {
                    id: 'end-session',
                    name: 'End',
                    nameHe: 'סיום',
                    icon: Square,
                    color: 'text-rose-600',
                    borderColor: 'border-rose-300',
                    tooltip: 'End the current session',
                    onClick: endSession,
                  },
                  {
                    id: 'reset',
                    name: 'Reset',
                    nameHe: 'איפוס',
                    icon: RotateCcw,
                    color: 'text-amber-600',
                    borderColor: 'border-amber-300',
                    tooltip: 'Clear all data and start fresh',
                    onClick: clearChat,
                  },
                ],
              },
              {
                id: 'ai-diagnosis',
                boxes: [
                  {
                    id: 'diagnostics',
                    name: 'Diagnose',
                    nameHe: 'אבחון',
                    icon: Stethoscope,
                    color: 'text-purple-600',
                    borderColor: 'border-purple-300',
                    isActive: activeTab === 'diagnostics',
                    tooltip: 'TCM diagnostics: pulse, tongue, patterns',
                    onClick: () => setActiveTab('diagnostics'),
                  },
                  {
                    id: 'symptoms',
                    name: 'Brain',
                    nameHe: 'מוח AI',
                    icon: Brain,
                    color: 'text-cyan-600',
                    borderColor: 'border-cyan-300',
                    isActive: activeTab === 'symptoms',
                    tooltip: 'AI-powered symptom analysis',
                    onClick: () => setActiveTab('symptoms'),
                  },
                  {
                    id: 'qa',
                    name: 'Q&A',
                    nameHe: 'שאלות',
                    icon: Heart,
                    color: 'text-rose-600',
                    borderColor: 'border-rose-300',
                    isActive: showQASuggestions,
                    badge: qaFavoritesCount > 0 ? qaFavoritesCount : undefined,
                    tooltip: 'Clinical Q&A suggestions and favorites',
                    onClick: () => setShowQASuggestions(!showQASuggestions),
                  },
                  {
                    id: 'knowledge',
                    name: 'Knowledge',
                    nameHe: 'ידע',
                    icon: BookOpen,
                    color: 'text-jade',
                    borderColor: 'border-jade/50',
                    isActive: showKnowledgeAssets,
                    badge: activeAssets.length > 0 ? activeAssets.length : undefined,
                    tooltip: 'Browse TCM knowledge base assets',
                    onClick: () => setShowKnowledgeAssets(!showKnowledgeAssets),
                  },
                  {
                    id: 'pregnancy',
                    name: 'Pregnancy',
                    nameHe: 'הריון',
                    icon: Baby,
                    color: 'text-pink-500',
                    borderColor: 'border-pink-300',
                    isActive: showPregnancyCalc,
                    tooltip: 'Pregnancy safety calculator',
                    onClick: () => setShowPregnancyCalc(true),
                  },
                  {
                    id: 'elderly',
                    name: 'Elderly',
                    nameHe: 'קשישים',
                    icon: Heart,
                    color: 'text-emerald-500',
                    borderColor: 'border-emerald-300',
                    isActive: showElderlyGuide,
                    tooltip: 'Healthy lifestyle guide for adults 70+',
                    onClick: () => setShowElderlyGuide(true),
                  },
                  {
                    id: 'session-brief',
                    name: 'Brief',
                    nameHe: 'תקציר',
                    icon: Sparkles,
                    color: 'text-amber-600',
                    borderColor: 'border-amber-300',
                    isActive: showSessionBrief,
                    tooltip: 'AI Session Brief with patient analysis & visit history',
                    onClick: () => setShowSessionBrief(!showSessionBrief),
                  },
                ],
              },
              {
                id: 'wellness-category',
                boxes: [
                  {
                    id: 'nutrition',
                    name: 'Nutrition',
                    nameHe: 'תזונה',
                    icon: Apple,
                    color: 'text-green-600',
                    borderColor: 'border-green-300',
                    tooltip: 'Diet & nutrition TCM guidance',
                    onClick: () => toast.info('Nutrition guidance available in Knowledge assets'),
                  },
                  {
                    id: 'brain-health',
                    name: 'Brain',
                    nameHe: 'מוח',
                    icon: Activity,
                    color: 'text-violet-600',
                    borderColor: 'border-violet-300',
                    tooltip: 'Pediatric, adult & geriatric brain health protocols',
                    onClick: () => toast.info('Brain health TCM protocols - 100 Q&A for all ages'),
                  },
                ],
              },
              {
                id: 'clinical-tabs',
                boxes: [
                  {
                    id: 'treatment',
                    name: 'Treat',
                    nameHe: 'טיפול',
                    icon: Pill,
                    color: 'text-emerald-600',
                    borderColor: 'border-emerald-300',
                    isActive: activeTab === 'treatment',
                    tooltip: 'Treatment plans, herbs, points',
                    onClick: () => setActiveTab('treatment'),
                  },
                  {
                    id: 'bodymap',
                    name: 'Body Map',
                    nameHe: 'מפת גוף',
                    icon: UserIcon,
                    color: 'text-indigo-600',
                    borderColor: 'border-indigo-300',
                    isActive: activeTab === 'bodymap',
                    tooltip: 'Visual acupuncture point selection',
                    onClick: () => setActiveTab('bodymap'),
                  },
                  {
                    id: 'history',
                    name: 'History',
                    nameHe: 'היסטוריה',
                    icon: Clock,
                    color: 'text-blue-600',
                    borderColor: 'border-blue-300',
                    isActive: activeTab === 'history',
                    tooltip: 'Patient visit history',
                    onClick: () => setActiveTab('history'),
                  },
                ],
              },
              {
                id: 'communication',
                boxes: [
                  {
                    id: 'voice',
                    name: 'Voice',
                    nameHe: 'קולי',
                    icon: Mic,
                    color: 'text-violet-600',
                    borderColor: 'border-violet-300',
                    tooltip: 'Voice commands: "generate summary", "next tab"',
                    onClick: () => toast.info('Voice Commands: Say "generate summary", "save session", "next tab"', { duration: 5000 }),
                  },
                  {
                    id: 'whatsapp',
                    name: 'WhatsApp',
                    nameHe: 'וואטסאפ',
                    icon: MessageCircle,
                    color: 'text-green-600',
                    borderColor: 'border-green-300',
                    tooltip: 'Share session summary via WhatsApp',
                    onClick: () => quickActionsRef.current?.shareWhatsApp(),
                  },
                  {
                    id: 'email',
                    name: 'Email',
                    nameHe: 'אימייל',
                    icon: Mail,
                    color: 'text-blue-600',
                    borderColor: 'border-blue-300',
                    tooltip: 'Email session report',
                    onClick: () => toast.info('Use Session tab to email report'),
                  },
                ],
              },
              {
                id: 'utilities',
                boxes: [
                  {
                    id: 'session',
                    name: 'Notes',
                    nameHe: 'הערות',
                    icon: FileText,
                    color: 'text-amber-600',
                    borderColor: 'border-amber-300',
                    isActive: activeTab === 'session',
                    tooltip: 'Session notes and documentation',
                    onClick: () => setActiveTab('session'),
                  },
                  {
                    id: 'print',
                    name: 'Print',
                    nameHe: 'הדפס',
                    icon: Printer,
                    color: 'text-gray-600',
                    borderColor: 'border-gray-300',
                    tooltip: 'Print session report',
                    onClick: () => quickActionsRef.current?.printReport(),
                  },
                ],
              },
            ]}
            size="sm"
          />
        </div>

        {/* Main Toolbar - Now minimal since boxes handle most actions */}
        <TcmBrainToolbar
          sessionStatus={sessionStatus}
          sessionSeconds={sessionSeconds}
          formatSessionTime={formatSessionTime}
          onStartSession={startSession}
          onPauseSession={pauseSession}
          onContinueSession={continueSession}
          onEndSession={endSession}
          onExport={() => quickActionsRef.current?.exportSession()}
          onPrint={() => quickActionsRef.current?.printReport()}
          onShare={() => quickActionsRef.current?.shareWhatsApp()}
          onVoiceCommand={handleVoiceCommand}
          isSessionActive={sessionStatus === 'running'}
        />

        <main className="flex-1 container mx-auto px-4 py-4">
          {/* Knowledge Assets - Collapsible */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-between py-2 px-3 bg-card/50 border rounded-lg hover:bg-card"
              onClick={() => setShowKnowledgeAssets(!showKnowledgeAssets)}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-jade" />
                <span className="text-xs font-medium">Knowledge Assets</span>
                {activeAssets.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-jade/20 text-jade">
                    {activeAssets.length} Active
                  </Badge>
                )}
              </div>
              {showKnowledgeAssets ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showKnowledgeAssets && (
              <div className="mt-2 bg-card/50 backdrop-blur-sm rounded-lg border shadow-sm">
                <KnowledgeAssetTabs 
                  activeAssets={activeAssets}
                  showLabels={true}
                  onAssetClick={(id) => {
                    toast.info(`${id} knowledge base selected`);
                  }}
                />
              </div>
            )}
          </div>

          {/* Q&A Suggestions Panel - Collapsible */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-between py-2 px-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/50"
              onClick={() => setShowQASuggestions(!showQASuggestions)}
            >
              <div className="flex items-center gap-2">
                <MessageCircleQuestion className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Ready-Made Q&A Suggestions</span>
                <Badge variant="secondary" className="text-[10px] bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300">
                  200+ Questions
                </Badge>
              </div>
              {showQASuggestions ? (
                <ChevronUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              )}
            </Button>
            
            {showQASuggestions && (
              <div className="mt-2 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                <QASuggestionsPanel 
                  onSelectQuestion={(question) => {
                    streamChat(question);
                    setActiveTab('diagnostics');
                  }}
                  sessionSeconds={sessionSeconds}
                />
              </div>
            )}
          </div>

          {/* Quick Action Boxes - 6 Configurable */}
          <div className="mb-4 p-3 bg-card/50 rounded-lg border">
            <QuickActionBoxes 
              onActionClick={(prompt, actionName) => {
                // Handle special actions
                if (prompt === '__INTAKE_REVIEW__') {
                  if (!selectedPatient) {
                    toast.warning('Please select a patient first');
                    return;
                  }
                  setShowIntakeReview(true);
                  return;
                }
                // Regular AI prompt actions
                streamChat(prompt);
                setActiveTab('diagnostics');
              }}
              isLoading={isLoading}
            />
          </div>

          {/* Intake Review Dialog */}
          <IntakeReviewDialog
            open={showIntakeReview}
            onOpenChange={setShowIntakeReview}
            patientId={selectedPatient?.id}
            patientName={selectedPatient?.name}
            onComplete={() => {
              toast.success('Intake verified - continuing session');
            }}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full mb-4">
              {tabItems.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}
                  className="flex flex-col gap-0.5 py-2 data-[state=active]:bg-jade/10 data-[state=active]:text-jade">
                  <tab.icon className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:block">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="bg-card rounded-lg border min-h-[calc(100vh-280px)]">
              <TabsContent value="diagnostics" className="m-0">
                <DiagnosticsTab 
                  messages={messages} 
                  isLoading={isLoading} 
                  onSendMessage={streamChat} 
                  onClear={clearChat}
                  selectedPatient={selectedPatient} 
                  sessionSeconds={sessionSeconds} 
                  questionsAsked={questionsAsked} 
                  formatSessionTime={formatSessionTime}
                  quickActionsRef={quickActionsRef}
                />
              </TabsContent>

              <TabsContent value="symptoms" className="m-0">
                <SymptomsTab 
                  messages={messages} 
                  isLoading={isLoading} 
                  onSendMessage={streamChat} 
                  onClear={clearChat}
                  selectedPatient={selectedPatient} 
                  sessionSeconds={sessionSeconds} 
                  questionsAsked={questionsAsked} 
                  formatSessionTime={formatSessionTime}
                  quickActionsRef={quickActionsRef}
                />
              </TabsContent>

              <TabsContent value="treatment" className="m-0">
                <TreatmentTab 
                  messages={messages} 
                  isLoading={isLoading} 
                  onSendMessage={streamChat} 
                  onClear={clearChat}
                  selectedPatient={selectedPatient} 
                  sessionSeconds={sessionSeconds} 
                  questionsAsked={questionsAsked} 
                  formatSessionTime={formatSessionTime}
                  quickActionsRef={quickActionsRef}
                />
              </TabsContent>

              <TabsContent value="bodymap" className="m-0">
                <BodyMapTab highlightedPoints={highlightedPoints} streamChat={streamChat} onTabChange={setActiveTab} />
              </TabsContent>

              <TabsContent value="session" className="m-0">
                <SessionNotesTab sessionStatus={sessionStatus} sessionSeconds={sessionSeconds} formatSessionTime={formatSessionTime}
                  questionsAsked={questionsAsked} messages={messages} voiceNotes={voiceNotes} activeTemplate={activeTemplate}
                  startSession={startSession} pauseSession={pauseSession} continueSession={continueSession} endSession={endSession}
                  handleAddVoiceNote={handleAddVoiceNote} handleDeleteVoiceNote={handleDeleteVoiceNote} handleApplyTemplate={handleApplyTemplate}
                  openGmailWithSession={openGmailWithSession} openWhatsAppWithSession={openWhatsAppWithSession} />
              </TabsContent>

              <TabsContent value="history" className="m-0">
                <PatientHistoryTab selectedPatient={selectedPatient} patientSessions={patientSessions}
                  onLoadWorkflow={(workflow) => setChainedWorkflow(prev => ({ ...prev, ...workflow }))} />
              </TabsContent>
            </div>
          </Tabs>
        </main>

        {externalFallbackQuery && (
          <ExternalAIFallbackCard
            query={externalFallbackQuery}
            isLoading={isLoading}
            onDismiss={dismissExternalFallback}
            onUseExternalAI={(provider) => runExternalAIFallback(provider)}
          />
        )}

        {/* Floating Q&A Access Button with Favorites Badge */}
        {!showQASuggestions && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => {
                setShowQASuggestions(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all animate-pulse"
              title={`Open Q&A Suggestions${qaFavoritesCount > 0 ? ` (${qaFavoritesCount} favorites)` : ''}`}
            >
              <MessageCircleQuestion className="h-6 w-6" />
            </Button>
            {qaFavoritesCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-6 min-w-6 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold border-2 border-white shadow-md"
              >
                {qaFavoritesCount > 99 ? '99+' : qaFavoritesCount}
              </Badge>
            )}
          </div>
        )}

        {/* Help Guide */}
        <FloatingHelpGuide isOpen={showHelpGuide} onOpenChange={setShowHelpGuide} />
        
        {/* Pregnancy Safety Calculator */}
        <PregnancySafetyDialog 
          open={showPregnancyCalc} 
          onOpenChange={setShowPregnancyCalc}
          patientName={selectedPatient?.name}
        />
        
        {/* Elderly Lifestyle Guide */}
        <ElderlyLifestyleDialog 
          open={showElderlyGuide} 
          onOpenChange={setShowElderlyGuide}
        />
        
        {/* Session Brief Panel */}
        <SessionBriefPanel
          patientId={selectedPatient?.id || null}
          patientName={selectedPatient?.name || null}
          isOpen={showSessionBrief}
          onClose={() => setShowSessionBrief(false)}
          onQuestionUsed={(question) => {
            streamChat(question);
            setActiveTab('diagnostics');
          }}
          onQuestionPinned={(question) => {
            toast.success(`📌 Pinned: "${question.slice(0, 50)}..."`);
          }}
          autoTrigger={true}
        />
      </div>
    </>
  );
}
