import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, Brain, Pill, User as UserIcon, FileText, Clock, Save, 
  Database, ChevronDown, ChevronUp, MessageCircleQuestion, Play, Pause, 
  Square, RotateCcw, Printer, MessageCircle, Mail, ArrowRight, HelpCircle, 
  BookOpen, Heart, Mic, Baby, Sparkles, Apple, Activity, Wind, Leaf, Layers,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import { APIUsageMeter } from '@/components/tcm-brain/APIUsageMeter';
import { AITrustHeader } from '@/components/tcm-brain/AITrustHeader';
import { TcmTurboDashboard, TurboDashboardStatus } from '@/components/tcm/TcmTurboDashboard';
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
import { SessionHeaderBoxes, SessionPhaseIndicator } from '@/components/session';
import { useSessionPhase } from '@/hooks/useSessionPhase';
import { CrossPlatformBackButton } from '@/components/ui/CrossPlatformBackButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TierBadge } from '@/components/layout/TierBadge';
import { FloatingHelpGuide } from '@/components/ui/FloatingHelpGuide';
import { PregnancySafetyDialog, ElderlyLifestyleDialog, PediatricAcupunctureDialog, VagusNerveDialog, VagusStimulationDialog, HRVTrackerDialog } from '@/components/clinical';
import { SessionBriefPanel } from '@/components/video/SessionBriefPanel';
import { EmotionalProcessingPanel } from '@/components/session/EmotionalProcessingPanel';
import { PediatricTCMAssistant } from '@/components/tcm-brain/PediatricTCMAssistant';
import { HerbalMasterWidget } from '@/components/herbal/HerbalMasterWidget';
import { HebrewQADropdowns } from '@/components/tcm-brain/HebrewQADropdowns';
import { HebrewTopicQuestionsDialog } from '@/components/tcm-brain/HebrewTopicQuestionsDialog';
import { ClinicalStackingDialog } from '@/components/tcm-brain/ClinicalStackingDialog';
import { EconomyMonitor } from '@/components/tcm-brain/EconomyMonitor';
import { useClinicalSession } from '@/hooks/useClinicalSession';
import { CustomizableToolbar, ToolbarItemId } from '@/components/video/CustomizableToolbar';
import { AnxietyQADialog } from '@/components/video/AnxietyQADialog';
import { QuickAppointmentDialog } from '@/components/video/QuickAppointmentDialog';
import { FollowUpPlanDialog } from '@/components/video/FollowUpPlanDialog';
import { ZoomInviteDialog } from '@/components/video/ZoomInviteDialog';
import { CalendarInviteDialog } from '@/components/video/CalendarInviteDialog';
import { SessionReportDialog } from '@/components/video/SessionReportDialog';
import { SessionGuideTeleprompter } from '@/components/video/SessionGuideTeleprompter';
import { useSessionHeaderBoxes } from '@/hooks/useSessionHeaderBoxes';
import { ClinicalQuerySelector } from '@/components/tcm-brain/ClinicalQuerySelector';
import { BodyMapSidebar } from '@/components/tcm-brain/BodyMapSidebar';
import { IntelligenceHub } from '@/components/tcm-brain/IntelligenceHub';
import { TherapistTeleprompter } from '@/components/tcm-brain/TherapistTeleprompter';


export default function TcmBrain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [activeAssets, setActiveAssets] = useState<string[]>([]);
  const [showKnowledgeAssets, setShowKnowledgeAssets] = useState(true);
  const [showQASuggestions, setShowQASuggestions] = useState(true);
  const [showIntakeReview, setShowIntakeReview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showPregnancyCalc, setShowPregnancyCalc] = useState(false);
  const [showElderlyGuide, setShowElderlyGuide] = useState(false);
  const [showPediatricGuide, setShowPediatricGuide] = useState(false);
  const [showVagusAssessment, setShowVagusAssessment] = useState(false);
  const [showVagusStimulation, setShowVagusStimulation] = useState(false);
  const [showHRVTracker, setShowHRVTracker] = useState(false);
  const [showSessionBrief, setShowSessionBrief] = useState(false);
  const [showPediatricAssistant, setShowPediatricAssistant] = useState(false);
  const [showHerbEncyclopedia, setShowHerbEncyclopedia] = useState(false);
  const [showHebrewQADropdowns, setShowHebrewQADropdowns] = useState(false);
  const [showHebrewTopicQuestions, setShowHebrewTopicQuestions] = useState(false);
  const [showClinicalStacking, setShowClinicalStacking] = useState(false);
  const [showEmotionalPanel, setShowEmotionalPanel] = useState(false);
  const [emotionalPanelEmotion, setEmotionalPanelEmotion] = useState<'grief' | 'trauma' | 'fear' | 'anger'>('grief');
  const [qaFavoritesCount, setQaFavoritesCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [layoutMode, setLayoutMode] = useState<'classic' | 'three-column'>('three-column');
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const quickActionsRef = useRef<QuickActionsRef>(null);
  
  // Clinical Session Stacking Hook
  const {
    stackedQueries,
    addToStack,
    removeFromStack,
    isInStack,
    clearStack,
    buildCombinedPrompt,
    sessionMetrics,
    updateMetrics,
    isAnalyzing,
    setIsAnalyzing,
    stackCount
  } = useClinicalSession();

  // New states for shared asset boxes
  const [showTcmBrainPanel, setShowTcmBrainPanel] = useState(false);
  const [showAnxietyQA, setShowAnxietyQA] = useState(false);
  const [showSessionGuide, setShowSessionGuide] = useState(false);
  const [showQuickAppointment, setShowQuickAppointment] = useState(false);
  const [showFollowUpPlan, setShowFollowUpPlan] = useState(false);
  const [showZoomInvite, setShowZoomInvite] = useState(false);
  const [showCalendarInvite, setShowCalendarInvite] = useState(false);
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [activeAiQuery, setActiveAiQuery] = useState<ToolbarItemId | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const {
    messages, isLoading, streamChat, clearChat, sessionStatus, sessionSeconds,
    formatSessionTime, startSession, pauseSession, continueSession, endSession,
    patients, selectedPatient, setSelectedPatient, loadingPatients, voiceNotes,
    handleAddVoiceNote, handleDeleteVoiceNote, activeTemplate, handleApplyTemplate,
    questionsAsked, highlightedPoints, setHighlightedPoints, patientSessions, setChainedWorkflow,
    openGmailWithSession, openWhatsAppWithSession, externalFallbackQuery,
    dismissExternalFallback, runExternalAIFallback, lastRagStats, isStreaming,
    searchDepth, setSearchDepth,
  } = useTcmBrainState();

  // Turbo Dashboard status derived from RAG stats
  const turboDashboardStatus: TurboDashboardStatus = useMemo(() => {
    if (isLoading || isStreaming) return 'scanning';
    if (!lastRagStats || lastRagStats.chunksFound === 0) {
      if (messages.length <= 1) return 'standby';
      return lastRagStats?.isExternal ? 'external' : 'fail';
    }
    if (lastRagStats.isExternal) return 'external';
    return lastRagStats.chunksFound > 0 ? 'locked' : 'fail';
  }, [isLoading, isStreaming, lastRagStats, messages.length]);

  const { currentPhase, setPhase, clearManualPhase, isManualOverride } = useSessionPhase(sessionSeconds);
  const { lastSaveTime, isSaving, saveNow, loadSavedSession, clearSavedSession } = useAutoSave(
    { messages, questionsAsked, sessionSeconds, patientId: selectedPatient?.id, patientName: selectedPatient?.name, activeTemplate },
    sessionStatus === 'running'
  );

  useEffect(() => {
    const saved = loadSavedSession();
    if (saved && saved.messages.length > 0) {
      // Silently available for restore without toast
      console.log('Auto-saved session found');
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const detected = detectActiveAssets(lastMessage.content);
        if (detected.length > 0) setActiveAssets(detected);
      }
    }
  }, [messages]);

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
      } catch { setQaFavoritesCount(0); }
    };
    updateFavoritesCount();
    window.addEventListener('storage', updateFavoritesCount);
    const interval = setInterval(updateFavoritesCount, 2000);
    return () => { window.removeEventListener('storage', updateFavoritesCount); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (selectedPatient?.id) { setShowSessionBrief(true); }
    else { setShowSessionBrief(false); }
  }, [selectedPatient?.id]);

  // Shared header boxes from centralized config
  const headerBoxGroups = useSessionHeaderBoxes({
    sessionStatus,
    onStart: startSession,
    onPause: pauseSession,
    onResume: continueSession,
    onEnd: endSession,
    onReset: clearChat,
    showTcmBrainPanel,
    onToggleTcmBrain: () => setShowTcmBrainPanel(!showTcmBrainPanel),
    showAnxietyQA,
    onToggleQA: () => setShowAnxietyQA(!showAnxietyQA),
    showSessionGuide,
    onToggleGuide: () => setShowSessionGuide(!showSessionGuide),
    showPregnancyCalc,
    onOpenPregnancy: () => setShowPregnancyCalc(true),
    showElderlyGuide,
    onOpenElderly: () => setShowElderlyGuide(true),
    showSessionBrief,
    onToggleSessionBrief: () => setShowSessionBrief(!showSessionBrief),
    onOpenPediatric: () => setShowPediatricAssistant(true),
    onOpenHerbs: () => setShowHerbEncyclopedia(true),
    showEmotionalPanel,
    emotionalPanelEmotion,
    onOpenStress: () => { setShowTcmBrainPanel(true); },
    onOpenGrief: () => { setEmotionalPanelEmotion('grief'); setShowEmotionalPanel(true); },
    onOpenTrauma: () => { setEmotionalPanelEmotion('trauma'); setShowEmotionalPanel(true); },
    onOpenFear: () => { setEmotionalPanelEmotion('fear'); setShowEmotionalPanel(true); },
    onOpenAnger: () => { setEmotionalPanelEmotion('anger'); setShowEmotionalPanel(true); },
    onOpenNutrition: () => console.log('Nutrition guidance - use TCM Brain'),
    onOpenCalendar: () => navigate('/crm/calendar'),
    onOpenAppointment: () => setShowQuickAppointment(true),
    onOpenFollowUp: () => setShowFollowUpPlan(true),
    onOpenCalendarInvite: () => setShowCalendarInvite(true),
    onOpenZoom: () => setShowZoomInvite(true),
    onOpenReport: () => setShowSessionReport(true),
    highContrast,
    onToggleAccessibility: () => {
      setHighContrast(!highContrast);
    },
  });

  const tabItems = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope, description: 'P1-P2' },
    { id: 'symptoms', label: 'Symptoms', icon: Brain, description: 'P3' },
    { id: 'treatment', label: 'Treatment', icon: Pill, description: 'P4-P6' },
    { id: 'bodymap', label: 'Body Map', icon: UserIcon, description: 'Points' },
    { id: 'session', label: 'Session', icon: FileText, description: 'Notes' },
    { id: 'history', label: 'History', icon: Clock, description: 'Patient' },
  ];

  const handleVoiceCommand = useCallback((command: TcmVoiceCommand) => {
    console.log('[TcmBrain] Voice command:', command);
    switch (command) {
      case 'generate-summary': quickActionsRef.current?.generateSummary(); break;
      case 'save-to-patient': quickActionsRef.current?.saveToPatient(); break;
      case 'export-session': quickActionsRef.current?.exportSession(); break;
      case 'print-report': quickActionsRef.current?.printReport(); break;
      case 'share-whatsapp': quickActionsRef.current?.shareWhatsApp(); break;
      case 'generate-audio': quickActionsRef.current?.transcriptToMP3(); break;
      case 'start-session': if (sessionStatus === 'idle') startSession(); else if (sessionStatus === 'paused') continueSession(); break;
      case 'pause-session': if (sessionStatus === 'running') pauseSession(); break;
      case 'end-session': if (sessionStatus !== 'idle') endSession(); break;
      case 'clear-chat': clearChat(); break;
      case 'next-tab': setActiveTab(prev => { const idx = tabItems.findIndex(t => t.id === prev); return tabItems[(idx + 1) % tabItems.length].id; }); break;
      case 'previous-tab': setActiveTab(prev => { const idx = tabItems.findIndex(t => t.id === prev); return tabItems[(idx - 1 + tabItems.length) % tabItems.length].id; }); break;
      case 'show-brief': setShowSessionBrief(true); break;
      case 'hide-brief': setShowSessionBrief(false); break;
    }
  }, [sessionStatus, startSession, pauseSession, continueSession, endSession, clearChat, tabItems]);

  // Handler to view points on body map
  const handleViewBodyMap = useCallback((points: string[]) => {
    // Add points to highlighted points (merge with existing)
    setHighlightedPoints(prev => {
      const combined = [...new Set([...prev, ...points])];
      return combined;
    });
    // Switch to body map tab
    setActiveTab('bodymap');
    // Show toast notification
    toast.success(`📍 Viewing ${points.length} point${points.length > 1 ? 's' : ''} on Body Map`, {
      description: points.join(', '),
      duration: 3000,
    });
  }, [setHighlightedPoints]);

  // Handler for stacked clinical analysis
  const handleAnalyzeStackedQueries = useCallback(async () => {
    if (stackedQueries.length === 0) return;
    
    setIsAnalyzing(true);
    const startTime = performance.now();
    
    try {
      const combinedPrompt = buildCombinedPrompt();
      await streamChat(combinedPrompt);
      
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);
      
      // Estimate tokens (rough estimate based on prompt + response length)
      const estimatedTokens = Math.round(combinedPrompt.length / 4);
      updateMetrics(estimatedTokens, timeMs);
      
      toast.success('✨ Unified Analysis Complete', {
        description: `${stackedQueries.length} queries analyzed in ${timeMs}ms`,
      });
      
      clearStack();
      setActiveTab('diagnostics');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [stackedQueries, buildCombinedPrompt, streamChat, updateMetrics, clearStack, setIsAnalyzing]);

  return (
    <>
      <Helmet>
        <title>CM Brain - Commander View</title>
        <meta name="description" content="AI-powered Chinese Medicine clinical assistant" />
      </Helmet>
      
      {/* FULL SCREEN CONTAINER */}
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="border-b bg-gradient-to-r from-emerald-900/20 via-emerald-800/10 to-emerald-900/20 backdrop-blur-sm sticky top-0 z-50 shrink-0">
          <div className="max-w-full mx-auto px-3 md:px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              {/* Branding */}
              <div className="flex items-center gap-2">
                <CrossPlatformBackButton fallbackPath="/dashboard" variant="ghost" size="icon" className="md:hidden h-9 w-9" />
                <Link to="/" className="flex items-center gap-2 hover:opacity-90">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="font-display text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">CM BRAIN</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Commander View</p>
                  </div>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setShowHelpGuide(true)} className="h-8 px-2 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-700 dark:text-yellow-400">
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTeleprompter(true)} 
                  className="h-8 px-2 bg-jade/10 hover:bg-jade/20 text-jade"
                  title="מדריך אינטראקטיבי"
                >
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1 text-xs">מדריך</span>
                </Button>
              </div>

              {/* Central Clock */}
              <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <div className="bg-black/80 text-white px-4 py-1 rounded-full font-mono font-bold shadow-lg border border-white/20">
                  {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Right Tools */}
              <div className="flex items-center gap-2">
                {activeAssets.length > 0 && (
                  <Badge className="bg-jade/20 text-jade border-jade/30 hidden md:flex">
                    <Database className="h-3 w-3 mr-1" /> {activeAssets.length}
                  </Badge>
                )}
                <PatientSelectorDropdown patients={patients} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} isLoading={loadingPatients} />
                {sessionStatus === 'running' && (
                  <Badge variant="outline" className={`text-xs cursor-pointer hidden md:flex ${isSaving ? 'animate-pulse' : ''}`} onClick={saveNow}>
                    <Save className={`h-3 w-3 mr-1 ${isSaving ? 'text-jade' : ''}`} /> {isSaving ? 'Saving...' : 'Auto'}
                  </Badge>
                )}
                <div className="hidden md:flex items-center gap-2">
                  <LanguageSwitcher variant="outline" isScrolled={true} />
                  <TierBadge />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* AI TRUST HEADER */}
        <AITrustHeader />

        {/* TCM TURBO DASHBOARD - True Digital Indicator */}
        <div className="px-4 py-2 border-b bg-gradient-to-r from-slate-900/5 to-transparent shrink-0">
          <TcmTurboDashboard 
            status={turboDashboardStatus}
            isProcessing={isLoading || isStreaming}
            meta={{
              chunksFound: lastRagStats?.chunksFound || 0,
              documentsSearched: lastRagStats?.documentsSearched || 0,
              isExternal: lastRagStats?.isExternal,
              tokensUsed: lastRagStats?.tokensUsed ?? 0,
              scorePercent: lastRagStats?.chunksFound ? Math.min(100, lastRagStats.chunksFound * 20) : 0,
              auditLogId: lastRagStats?.auditLogId,
            }}
            variant="standard"
            enableAudio={false}
            searchDepth={searchDepth}
            onSearchDepthChange={setSearchDepth}
          />
        </div>

        {/* --- MAIN LAYOUT --- */}
        <main className="flex-1 overflow-hidden">
          {/* Layout Mode Toggle */}
          <div className="px-4 py-1 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant={layoutMode === 'three-column' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutMode('three-column')}
                className="h-7 text-xs gap-1"
              >
                <LayoutGrid className="h-3 w-3" />
                3-Column
              </Button>
              <Button
                variant={layoutMode === 'classic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutMode('classic')}
                className="h-7 text-xs gap-1"
              >
                <Stethoscope className="h-3 w-3" />
                Classic
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {stackCount > 0 && (
                <Badge className="bg-violet-600 text-white text-xs">
                  {stackCount} stacked
                </Badge>
              )}
              <PatientSelectorDropdown 
                patients={patients} 
                selectedPatient={selectedPatient} 
                onSelectPatient={setSelectedPatient} 
                isLoading={loadingPatients} 
              />
            </div>
          </div>

          {layoutMode === 'three-column' ? (
            /* === NEW 3-COLUMN GRID LAYOUT === */
            <div 
              className="h-full grid gap-0"
              style={{
                gridTemplateColumns: '25% 50% 25%',
              }}
            >
              {/* COLUMN 1: Body Map Sidebar (LEFT - 25%) */}
              <div className="h-full overflow-hidden shrink-0" style={{ flexShrink: 0 }}>
                <BodyMapSidebar
                  highlightedPoints={highlightedPoints}
                  onClearPoints={() => setHighlightedPoints([])}
                  onGenerateProtocol={(points) => {
                    const prompt = `Generate treatment protocol for points: ${points.join(', ')}`;
                    streamChat(prompt);
                  }}
                />
              </div>

              {/* COLUMN 2: Intelligence Hub (CENTER - 50%) */}
              <div className="h-full overflow-hidden border-x" style={{ flexShrink: 0 }}>
                <IntelligenceHub
                  stackedQueries={stackedQueries}
                  onRemoveFromStack={removeFromStack}
                  onClearStack={clearStack}
                  onExecuteSynthesis={handleAnalyzeStackedQueries}
                  isAnalyzing={isAnalyzing}
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={streamChat}
                  onClear={clearChat}
                  onViewBodyMap={handleViewBodyMap}
                  externalInput={pendingQuestion || undefined}
                  onExternalInputHandled={() => setPendingQuestion(null)}
                />
              </div>

              {/* COLUMN 3: Clinical Query Selector (RIGHT - 25%) */}
              <div className="h-full overflow-hidden shrink-0" style={{ flexShrink: 0 }}>
                <ClinicalQuerySelector
                  stackedQueries={stackedQueries}
                  onAddToStack={addToStack}
                  onRemoveFromStack={removeFromStack}
                  isInStack={isInStack}
                  disabled={isLoading || isAnalyzing}
                />
              </div>
            </div>
          ) : (
            /* === CLASSIC 2-COLUMN LAYOUT === */
            <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* --- LEFT COMMANDER COLUMN (Chat/Tabs) - 66% width --- */}
              <div className="lg:col-span-8 flex flex-col h-full border-r bg-card/30 overflow-hidden">
                
                {/* Phase Indicator */}
                <div className="px-4 py-2 border-b bg-gradient-to-r from-jade/5 to-transparent shrink-0">
                  <SessionPhaseIndicator
                    currentPhase={currentPhase}
                    patientName={selectedPatient?.name}
                    isManualOverride={isManualOverride}
                    onResetToAuto={clearManualPhase}
                    onPhaseClick={(phase) => {
                      setPhase(phase);
                      if (phase === 'opening') setActiveTab('history');
                      else if (phase === 'diagnosis') setActiveTab('diagnostics');
                      else if (phase === 'treatment') setActiveTab('treatment');
                      else if (phase === 'closing') setActiveTab('session');
                    }}
                  />
                </div>

                {/* Action Boxes (Horizontal Scroll) - Using shared config */}
                <div className="px-4 py-2 border-b bg-background/50 shrink-0 overflow-x-auto">
                   <SessionHeaderBoxes
                      groups={headerBoxGroups}
                      size="sm"
                    />
                </div>

                {/* Customizable Toolbar - Same as Video Session */}
                <div className="px-4 py-2 border-b bg-gradient-to-r from-jade/5 to-transparent hidden md:block">
                  <CustomizableToolbar
                    activeQuery={activeAiQuery}
                    onQueryChange={setActiveAiQuery}
                  />
                </div>

                {/* MAIN TABS AREA - Fills remaining height */}
                <div className="flex-1 overflow-hidden flex flex-col p-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="grid grid-cols-6 w-full mb-2 shrink-0">
                      {tabItems.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col gap-0.5 py-2 data-[state=active]:bg-jade/10 data-[state=active]:text-jade relative">
                          <tab.icon className="h-4 w-4" />
                          <span className="text-xs font-medium hidden sm:block">{tab.label}</span>
                          {tab.id === 'bodymap' && highlightedPoints.length > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold">
                              {highlightedPoints.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Scrollable Content Container */}
                    <div className="flex-1 overflow-y-auto bg-card rounded-lg border shadow-sm p-0">
                      <TabsContent value="diagnostics" className="m-0 h-full p-0">
                        <DiagnosticsTab messages={messages} isLoading={isLoading} onSendMessage={streamChat} onClear={clearChat} selectedPatient={selectedPatient} sessionSeconds={sessionSeconds} questionsAsked={questionsAsked} formatSessionTime={formatSessionTime} quickActionsRef={quickActionsRef} externalInput={pendingQuestion || undefined} onExternalInputHandled={() => setPendingQuestion(null)} onViewBodyMap={handleViewBodyMap} />
                      </TabsContent>
                      <TabsContent value="symptoms" className="m-0 h-full p-0">
                        <SymptomsTab messages={messages} isLoading={isLoading} onSendMessage={streamChat} onClear={clearChat} selectedPatient={selectedPatient} sessionSeconds={sessionSeconds} questionsAsked={questionsAsked} formatSessionTime={formatSessionTime} quickActionsRef={quickActionsRef} />
                      </TabsContent>
                      <TabsContent value="treatment" className="m-0 h-full p-0">
                        <TreatmentTab messages={messages} isLoading={isLoading} onSendMessage={streamChat} onClear={clearChat} selectedPatient={selectedPatient} sessionSeconds={sessionSeconds} questionsAsked={questionsAsked} formatSessionTime={formatSessionTime} quickActionsRef={quickActionsRef} />
                      </TabsContent>
                      <TabsContent value="bodymap" className="m-0 h-full p-0">
                        <BodyMapTab highlightedPoints={highlightedPoints} aiResponseText={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || ''} streamChat={streamChat} onTabChange={setActiveTab} onClearPoints={() => setHighlightedPoints([])} onSetPoints={setHighlightedPoints} />
                      </TabsContent>
                      <TabsContent value="session" className="m-0 h-full p-0">
                        <SessionNotesTab sessionStatus={sessionStatus} sessionSeconds={sessionSeconds} formatSessionTime={formatSessionTime} questionsAsked={questionsAsked} messages={messages} voiceNotes={voiceNotes} activeTemplate={activeTemplate} startSession={startSession} pauseSession={pauseSession} continueSession={continueSession} endSession={endSession} handleAddVoiceNote={handleAddVoiceNote} handleDeleteVoiceNote={handleDeleteVoiceNote} handleApplyTemplate={handleApplyTemplate} openGmailWithSession={openGmailWithSession} openWhatsAppWithSession={openWhatsAppWithSession} />
                      </TabsContent>
                      <TabsContent value="history" className="m-0 h-full p-0">
                        <PatientHistoryTab selectedPatient={selectedPatient} patientSessions={patientSessions} onLoadWorkflow={(workflow) => setChainedWorkflow(prev => ({ ...prev, ...workflow }))} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              {/* --- RIGHT SIDECAR COLUMN (Tools/Widgets) - 33% width --- */}
              <div className="lg:col-span-4 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 border-l custom-scrollbar" style={{ flexShrink: 0 }}>
                <div className="space-y-6">
                  
                  {/* Clinical Stacking Button - Multi-Query System */}
                  <Button 
                    onClick={() => setShowClinicalStacking(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 text-base shadow-lg relative"
                  >
                    <Layers className="h-5 w-5 mr-2" />
                    בניית שאילתה מורכבת
                    {stackCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-violet-500 text-white">
                        {stackCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Hebrew Topic Questions Button */}
                  <Button 
                    onClick={() => setShowHebrewTopicQuestions(true)}
                    variant="outline"
                    className="w-full border-violet-400/50 hover:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold py-3 text-base"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    שאלות לפי נושאים (450+)
                  </Button>

                  {/* 1. Quick Actions */}
                  <div className="bg-card rounded-lg border shadow-sm p-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Quick Actions</h3>
                    <QuickActionBoxes 
                      onActionClick={(prompt) => { streamChat(prompt); setActiveTab('diagnostics'); }} 
                      isLoading={isLoading} 
                    />
                  </div>


                  {/* 3. Pediatric Assistant (Collapsible) */}
                  <div className="bg-card rounded-lg border shadow-sm">
                     <Button variant="ghost" className="w-full flex justify-between p-3" onClick={() => setShowPediatricAssistant(!showPediatricAssistant)}>
                        <div className="flex items-center gap-2 font-bold text-green-700">
                          <Baby className="h-5 w-5" /> Pediatric Assistant
                        </div>
                        {showPediatricAssistant ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                     </Button>
                     {showPediatricAssistant && (
                       <div className="p-3 border-t">
                         <PediatricTCMAssistant />
                       </div>
                     )}
                  </div>

                  {/* 4. Herb Encyclopedia (Collapsible) */}
                  <div className="bg-card rounded-lg border shadow-sm">
                     <Button variant="ghost" className="w-full flex justify-between p-3" onClick={() => setShowHerbEncyclopedia(!showHerbEncyclopedia)}>
                        <div className="flex items-center gap-2 font-bold text-jade">
                          <Leaf className="h-5 w-5" /> אנציקלופדיית צמחים
                        </div>
                        {showHerbEncyclopedia ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                     </Button>
                     {showHerbEncyclopedia && (
                       <div className="p-3 border-t">
                         <HerbalMasterWidget className="w-full" />
                       </div>
                     )}
                  </div>

                  {/* 5. Hebrew Q&A (Dropdowns) */}
                  <div className="bg-card rounded-lg border shadow-sm">
                     <Button variant="ghost" className="w-full flex justify-between p-3" onClick={() => setShowHebrewQADropdowns(!showHebrewQADropdowns)}>
                        <div className="flex items-center gap-2 font-bold text-violet-700">
                          <MessageCircleQuestion className="h-5 w-5" /> יין יאנג + חמשת האלמנטים
                        </div>
                        {showHebrewQADropdowns ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                     </Button>
                     {showHebrewQADropdowns && (
                       <div className="p-3 border-t">
                         <HebrewQADropdowns
                           onSelectQuestion={(question) => {
                             setPendingQuestion(question);
                             setActiveTab('diagnostics');
                           }}
                           disabled={isLoading}
                         />
                       </div>
                     )}
                  </div>


                  {/* 5. Q&A Suggestions */}
                  <div className="bg-card rounded-lg border shadow-sm">
                     <Button variant="ghost" className="w-full flex justify-between p-3" onClick={() => setShowQASuggestions(!showQASuggestions)}>
                        <div className="flex items-center gap-2 font-bold text-violet-700">
                          <MessageCircleQuestion className="h-5 w-5" /> Q&A Suggestions
                        </div>
                     </Button>
                       {showQASuggestions && (
                        <div className="p-3 border-t">
                          <QASuggestionsPanel
                            onSelectQuestion={(q) => {
                              setPendingQuestion(q);
                              setActiveTab('diagnostics');
                            }}
                            sessionSeconds={sessionSeconds}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* --- GLOBAL DIALOGS & OVERLAYS --- */}
        {externalFallbackQuery && (
          <ExternalAIFallbackCard query={externalFallbackQuery} isLoading={isLoading} onDismiss={dismissExternalFallback} onUseExternalAI={(provider) => runExternalAIFallback(provider)} />
        )}

        <IntakeReviewDialog open={showIntakeReview} onOpenChange={setShowIntakeReview} patientId={selectedPatient?.id} patientName={selectedPatient?.name} onComplete={() => console.log('Verified')} />
        <FloatingHelpGuide isOpen={showHelpGuide} onOpenChange={setShowHelpGuide} />
        <PregnancySafetyDialog open={showPregnancyCalc} onOpenChange={setShowPregnancyCalc} patientName={selectedPatient?.name} />
        <ElderlyLifestyleDialog open={showElderlyGuide} onOpenChange={setShowElderlyGuide} />
        <PediatricAcupunctureDialog open={showPediatricGuide} onOpenChange={setShowPediatricGuide} defaultLanguage="he" />
        <VagusNerveDialog open={showVagusAssessment} onOpenChange={setShowVagusAssessment} />
        <VagusStimulationDialog open={showVagusStimulation} onOpenChange={setShowVagusStimulation} />
        <HRVTrackerDialog open={showHRVTracker} onOpenChange={setShowHRVTracker} patientId={selectedPatient?.id} />
        
        {/* New shared dialogs */}
        <AnxietyQADialog open={showAnxietyQA} onOpenChange={setShowAnxietyQA} onConversationSave={() => console.log('Q&A saved')} />
        <QuickAppointmentDialog open={showQuickAppointment} onOpenChange={setShowQuickAppointment} />
        <FollowUpPlanDialog open={showFollowUpPlan} onOpenChange={setShowFollowUpPlan} patientId={selectedPatient?.id} patientName={selectedPatient?.name} />
        <ZoomInviteDialog open={showZoomInvite} onOpenChange={setShowZoomInvite} patientName={selectedPatient?.name} />
        <CalendarInviteDialog open={showCalendarInvite} onOpenChange={setShowCalendarInvite} patientName={selectedPatient?.name} />
        <SessionReportDialog open={showSessionReport} onOpenChange={setShowSessionReport} patientName={selectedPatient?.name} patientPhone={selectedPatient?.phone} sessionNotes="" />
        
        <SessionBriefPanel patientId={selectedPatient?.id || null} patientName={selectedPatient?.name || null} isOpen={showSessionBrief} onClose={() => setShowSessionBrief(false)} onQuestionUsed={(q) => { setPendingQuestion(q); setActiveTab('diagnostics'); }} onQuestionPinned={() => console.log('Pinned')} autoTrigger={true} />
        
        <EmotionalProcessingPanel isOpen={showEmotionalPanel} onClose={() => setShowEmotionalPanel(false)} initialEmotion={emotionalPanelEmotion} onAskQuestion={(q) => { streamChat(q); setShowEmotionalPanel(false); setActiveTab('symptoms'); }} />
        
        <HebrewTopicQuestionsDialog 
          open={showHebrewTopicQuestions} 
          onOpenChange={setShowHebrewTopicQuestions}
          onSelectQuestion={(q) => {
            setPendingQuestion(q);
            setActiveTab('diagnostics');
            setShowHebrewTopicQuestions(false);
          }}
        />
        
        {/* Clinical Stacking Dialog */}
        <ClinicalStackingDialog
          open={showClinicalStacking}
          onOpenChange={setShowClinicalStacking}
          stackedQueries={stackedQueries}
          onAddToStack={addToStack}
          onRemoveFromStack={removeFromStack}
          onClearStack={clearStack}
          onAnalyze={handleAnalyzeStackedQueries}
          isAnalyzing={isAnalyzing}
          isInStack={isInStack}
        />
        
        {/* Economy Monitor - Fixed Position */}
        <EconomyMonitor
          metrics={sessionMetrics}
          stackedQueries={stackedQueries}
          isVisible={stackCount > 0 || sessionMetrics.tokensUsed > 0}
        />
        
        {/* Therapist Teleprompter - Guided Tour */}
        <TherapistTeleprompter 
          isOpen={showTeleprompter} 
          onClose={() => setShowTeleprompter(false)} 
        />
      </div>
    </>
  );
}
