import { useState } from 'react';
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
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTcmBrainState } from '@/hooks/useTcmBrainState';
import { DiagnosticsTab } from '@/components/tcm-brain/DiagnosticsTab';
import { SymptomsTab } from '@/components/tcm-brain/SymptomsTab';
import { TreatmentTab } from '@/components/tcm-brain/TreatmentTab';
import { BodyMapTab } from '@/components/tcm-brain/BodyMapTab';
import { SessionNotesTab } from '@/components/tcm-brain/SessionNotesTab';
import { PatientHistoryTab } from '@/components/tcm-brain/PatientHistoryTab';
import { PatientSelectorDropdown } from '@/components/crm/PatientSelectorDropdown';

export default function TcmBrain() {
  const [activeTab, setActiveTab] = useState('diagnostics');
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

  const tabItems = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope, description: 'P1-P2' },
    { id: 'symptoms', label: 'Symptoms', icon: Brain, description: 'P3' },
    { id: 'treatment', label: 'Treatment', icon: Pill, description: 'P4-P6' },
    { id: 'bodymap', label: 'Body Map', icon: UserIcon, description: 'Points' },
    { id: 'session', label: 'Session', icon: FileText, description: 'Notes' },
    { id: 'history', label: 'History', icon: Clock, description: 'Patient' },
  ];

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

            <div className="bg-card rounded-lg border min-h-[calc(100vh-200px)]">
              <TabsContent value="diagnostics" className="m-0">
                <DiagnosticsTab messages={messages} isLoading={isLoading} onSendMessage={streamChat} onClear={clearChat}
                  selectedPatient={selectedPatient} sessionSeconds={sessionSeconds} questionsAsked={questionsAsked} formatSessionTime={formatSessionTime} />
              </TabsContent>

              <TabsContent value="symptoms" className="m-0">
                <SymptomsTab messages={messages} isLoading={isLoading} onSendMessage={streamChat} onClear={clearChat}
                  selectedPatient={selectedPatient} sessionSeconds={sessionSeconds} questionsAsked={questionsAsked} formatSessionTime={formatSessionTime} />
              </TabsContent>

              <TabsContent value="treatment" className="m-0">
                <TreatmentTab messages={messages} isLoading={isLoading} onSendMessage={streamChat} onClear={clearChat}
                  selectedPatient={selectedPatient} sessionSeconds={sessionSeconds} questionsAsked={questionsAsked} formatSessionTime={formatSessionTime} />
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
      </div>
    </>
  );
}
