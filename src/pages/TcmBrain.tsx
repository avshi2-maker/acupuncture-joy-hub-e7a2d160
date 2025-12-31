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
  ArrowLeft,
  Settings,
  Save,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTcmBrainState } from '@/hooks/useTcmBrainState';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DiagnosticsTab } from '@/components/tcm-brain/DiagnosticsTab';
import { SymptomsTab } from '@/components/tcm-brain/SymptomsTab';
import { TreatmentTab } from '@/components/tcm-brain/TreatmentTab';
import { BodyMapTab } from '@/components/tcm-brain/BodyMapTab';
import { SessionNotesTab } from '@/components/tcm-brain/SessionNotesTab';
import { PatientHistoryTab } from '@/components/tcm-brain/PatientHistoryTab';
import { PatientSelectorDropdown } from '@/components/crm/PatientSelectorDropdown';
import { TcmBrainVoiceCommands, TcmVoiceCommand } from '@/components/tcm-brain/TcmBrainVoiceCommands';
import { KnowledgeAssetTabs, detectActiveAssets } from '@/components/tcm-brain/KnowledgeAssetTabs';
import { QuickActionsRef } from '@/components/tcm-brain/QuickActionsBar';
import { toast } from 'sonner';

export default function TcmBrain() {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [activeAssets, setActiveAssets] = useState<string[]>([]);
  const [showKnowledgeAssets, setShowKnowledgeAssets] = useState(true);
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
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">TCM Brain</h1>
                  <p className="text-xs text-muted-foreground">Clinical Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                {sessionStatus !== 'idle' && (
                  <Badge variant={sessionStatus === 'running' ? 'default' : 'secondary'}
                    className={sessionStatus === 'running' ? 'bg-jade animate-pulse' : ''}>
                    <Clock className="h-3 w-3 mr-1" />{formatSessionTime(sessionSeconds)}
                  </Badge>
                )}
                {selectedPatient && (
                  <Badge variant="outline" className="hidden sm:flex">
                    <UserIcon className="h-3 w-3 mr-1" />{selectedPatient.name}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <PatientSelectorDropdown 
                  patients={patients}
                  selectedPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                  isLoading={loadingPatients}
                />
                <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-4">
          {/* Knowledge Assets Bar */}
          {showKnowledgeAssets && (
            <div className="mb-4 bg-card/50 backdrop-blur-sm rounded-lg border shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-jade" />
                  <span className="text-xs font-medium">Knowledge Assets</span>
                  {activeAssets.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] bg-jade/20 text-jade">
                      {activeAssets.length} Active
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setShowKnowledgeAssets(false)}
                >
                  Hide
                </Button>
              </div>
              <KnowledgeAssetTabs 
                activeAssets={activeAssets}
                onAssetClick={(id) => {
                  toast.info(`${id} knowledge base selected`);
                }}
              />
            </div>
          )}

          {!showKnowledgeAssets && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4 text-xs"
              onClick={() => setShowKnowledgeAssets(true)}
            >
              <Database className="h-3 w-3 mr-1" />
              Show Knowledge Assets ({activeAssets.length} active)
            </Button>
          )}

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

        {/* Voice Commands */}
        <TcmBrainVoiceCommands 
          onCommand={handleVoiceCommand}
          isSessionActive={sessionStatus === 'running'}
        />
      </div>
    </>
  );
}
