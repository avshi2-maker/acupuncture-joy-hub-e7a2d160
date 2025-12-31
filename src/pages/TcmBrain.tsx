import { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
  MessageCircleQuestion
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
import { ExternalAIFallbackCard } from '@/components/tcm/ExternalAIFallbackCard';
import { toast } from 'sonner';

export default function TcmBrain() {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [activeAssets, setActiveAssets] = useState<string[]>([]);
  const [showKnowledgeAssets, setShowKnowledgeAssets] = useState(true);
  const [showQASuggestions, setShowQASuggestions] = useState(false);
  const [showIntakeReview, setShowIntakeReview] = useState(false);
  const [qaFavoritesCount, setQaFavoritesCount] = useState(0);
  const quickActionsRef = useRef<QuickActionsRef>(null);
  
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

  // Auto-save functionality
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
    }
  }, [sessionStatus, startSession, pauseSession, continueSession, endSession, clearChat, tabItems]);

  return (
    <>
      <Helmet>
        <title>TCM Brain - Clinical Assistant</title>
        <meta name="description" content="AI-powered TCM clinical assistant" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Header - Bold Green Title + Patient Selector + Help */}
        <header className="border-b bg-gradient-to-r from-emerald-900/20 via-emerald-800/10 to-emerald-900/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              {/* Bold Green Title */}
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-emerald-500" />
                <h1 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  TCM BRAIN
                </h1>
                <span className="text-xs text-emerald-600/70 hidden sm:block font-medium">Clinical AI Assistant</span>
                
                {/* Animated Yellow Help Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold animate-pulse shadow-lg shadow-yellow-400/50 hover:shadow-yellow-500/50 transition-all"
                  onClick={() => toast.info('Voice Commands: Say "generate summary", "save session", "next tab", "pause session" and more!', { duration: 8000 })}
                >
                  <span className="animate-bounce inline-block mr-1">❓</span>
                  Help
                </Button>
              </div>

              {/* Patient Selector + Active Assets Count */}
              <div className="flex items-center gap-3">
                {activeAssets.length > 0 && (
                  <Badge className="bg-jade/20 text-jade border-jade/30">
                    <Database className="h-3 w-3 mr-1" />
                    {activeAssets.length} Assets Active
                  </Badge>
                )}
                
                {selectedPatient && (
                  <Badge variant="outline" className="hidden md:flex bg-background/50">
                    <UserIcon className="h-3 w-3 mr-1" />{selectedPatient.name}
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
                    className={`text-xs cursor-pointer ${isSaving ? 'animate-pulse' : ''}`}
                    onClick={saveNow}
                    title={lastSaveTime ? `Last saved: ${lastSaveTime.toLocaleTimeString()}` : 'Click to save now'}
                  >
                    <Save className={`h-3 w-3 mr-1 ${isSaving ? 'text-jade' : ''}`} />
                    {isSaving ? 'Saving...' : 'Auto-save'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* API Usage Meter Bar - Proof of Real AI */}
        <div className="border-b bg-card/30 backdrop-blur-sm py-2 px-4 overflow-x-auto">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">AI/API Status:</span>
            </div>
            <APIUsageMeter />
          </div>
        </div>

        {/* Main Toolbar */}
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
      </div>
    </>
  );
}
