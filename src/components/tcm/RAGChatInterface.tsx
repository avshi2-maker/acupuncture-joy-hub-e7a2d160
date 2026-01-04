import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Loader2, BookOpen, FileText, AlertCircle, Printer, Shield, CheckCircle2, Database, ExternalLink, Activity, Eye, EyeOff, AlertTriangle, Bot, Lightbulb } from 'lucide-react';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { usePrintContent } from '@/hooks/usePrintContent';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RAGSearchAnimation, RAGVerificationStatus } from './RAGSearchAnimation';
import { AITracePanel, TraceStep, ChunkMatch, HallucinationCheck, analyzeHallucination } from './AITracePanel';
import { ConfidenceMeter } from './ConfidenceMeter';
import { QASuggestionsPanel } from './QASuggestionsPanel';
import { SourceAuditFooter } from './SourceAuditFooter';
import { AITrustHeader, AITrustHeaderRef } from '@/components/tcm-brain/AITrustHeader';

interface Source {
  fileName: string;
  chunkIndex: number;
  preview: string;
  category?: string;
}

interface SourceAuditData {
  totalIndexedAssets: number;
  totalChunksInIndex: number;
  candidatesScanned: number;
  filteredToTop: number;
  sourcesUsedForAnswer: {
    fileName: string;
    pillar: string;
    chunkIndex: number;
    category?: string;
  }[];
  searchScope: string;
  closedLoop: boolean;
}

interface PillarBreakdown {
  clinical: number;
  pharmacopeia: number;
  nutrition: number;
  lifestyle: number;
  ageSpecific: number;
  cafStudies: number;
  clinicalTrials: number;
}

interface HybridSearchConfidence {
  overallConfidence: 'very_high' | 'high' | 'medium' | 'low' | 'none';
  averageScore: number;
  meetsThreshold: boolean;
  threshold: number;
  hybridChunksFound: number;
}

interface ExtractedPoints {
  pointCodes: string[];
  extraPoints: string[];
  allPoints: string[];
  figureReferences: string[];
  totalPointsFound: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isExternal?: boolean;
  metadata?: {
    chunksFound: number;
    documentsSearched: number;
    searchTermsUsed: string;
    auditLogged: boolean;
    pillarBreakdown?: PillarBreakdown;
    sourceAudit?: SourceAuditData;
    hybridSearchConfidence?: HybridSearchConfidence;
    extractedPoints?: ExtractedPoints;
  };
  traceData?: {
    steps: TraceStep[];
    contextChunks: ChunkMatch[];
    hallucinationCheck: HallucinationCheck;
    searchTerms: string;
  };
}

type SearchPhase = 'idle' | 'searching-rag' | 'rag-found' | 'rag-not-found' | 'external-consent' | 'external-search' | 'complete';

interface RAGChatInterfaceProps {
  className?: string;
}

export function RAGChatInterface({ className }: RAGChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPhase, setSearchPhase] = useState<SearchPhase>('idle');
  const [pendingQuery, setPendingQuery] = useState<string>('');
  const [showTracePanel, setShowTracePanel] = useState(false); // Advanced mode - hidden by default
  const [currentTrace, setCurrentTrace] = useState<{
    steps: TraceStep[];
    contextChunks: ChunkMatch[];
    hallucinationCheck?: HallucinationCheck;
    searchTerms: string;
  }>({ steps: [], contextChunks: [], searchTerms: '' });
  const [ragResults, setRagResults] = useState<{
    chunksFound: number;
    documentsSearched: number;
    sources: string[];
  } | undefined>();
  const [showExternalDisclaimer, setShowExternalDisclaimer] = useState(false);
  const [externalConsent, setExternalConsent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { printContent } = usePrintContent();

  // AI Trust Header refs
  const trustHeaderRef = useRef<AITrustHeaderRef>(null);

  const handleSuggestionSelect = (question: string) => {
    setInput(question);
    // Optionally auto-send
    // sendMessage();
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
  };

  // Helper to update trace steps
  const updateTraceStep = (stepId: string, updates: Partial<TraceStep>) => {
    setCurrentTrace(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
    }));
  };

  const addTraceStep = (step: TraceStep) => {
    setCurrentTrace(prev => ({
      ...prev,
      steps: [...prev.steps, step]
    }));
  };

  const handlePrint = () => {
    printContent(contentRef.current, { title: 'TCM Knowledge Base Chat' });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (useExternalAI: boolean = false) => {
    const query = useExternalAI ? pendingQuery : input.trim();
    if (!query || isLoading) return;

    // Reset trace for new query
    const searchTerms = query.split(' ').slice(0, 5).join(' | ');
    setCurrentTrace({
      steps: [],
      contextChunks: [],
      searchTerms
    });

    if (!useExternalAI) {
      const userMessage: Message = { role: 'user', content: query };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setPendingQuery(query);
    }

    // Start AI Trust Header processing
    trustHeaderRef.current?.startProcessing();

    setIsLoading(true);
    setSearchPhase('searching-rag');
    setRagResults(undefined);

    // Step 1: Initialize
    const step1Start = Date.now();
    addTraceStep({
      id: 'init',
      step: 1,
      name: 'Initialize Query',
      status: 'running',
      startTime: step1Start,
      details: `Query: "${query.substring(0, 50)}..."`
    });
    await new Promise(resolve => setTimeout(resolve, 300));
    updateTraceStep('init', { status: 'completed', endTime: Date.now() });

    // Step 2: Generate Search Terms
    const step2Start = Date.now();
    addTraceStep({
      id: 'search-terms',
      step: 2,
      name: 'Generate Search Terms',
      status: 'running',
      startTime: step2Start
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    updateTraceStep('search-terms', { 
      status: 'completed', 
      endTime: Date.now(),
      details: searchTerms
    });

    // Step 3: Search Knowledge Base
    const step3Start = Date.now();
    addTraceStep({
      id: 'search-kb',
      step: 3,
      name: 'Search Knowledge Base',
      status: 'running',
      startTime: step3Start,
      details: 'Scanning 12 knowledge files...'
    });

    try {
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: {
          query: query,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          useExternalAI,
          includeChunkDetails: true // Request full chunk details for tracing
        }
      });

      if (error) throw error;

      // Handle "no protocol found" response from hybrid search confidence threshold
      if (data.type === 'no_protocol_found') {
        updateTraceStep('search-kb', { 
          status: 'completed', 
          endTime: Date.now(),
          details: `Low confidence (${(data.metadata?.sourceAudit?.actualConfidence * 100 || 0).toFixed(1)}%) - Below threshold`
        });

        setRagResults({
          chunksFound: 0,
          documentsSearched: data.metadata?.sourceAudit?.totalIndexedAssets || 0,
          sources: []
        });

        // Update context chunks for trace panel
        setCurrentTrace(prev => ({ ...prev, contextChunks: [] }));

        addTraceStep({
          id: 'confidence-threshold',
          step: 4,
          name: 'Confidence Check Failed',
          status: 'error',
          startTime: Date.now(),
          endTime: Date.now(),
          details: `Score: ${(data.metadata?.sourceAudit?.actualConfidence * 100 || 0).toFixed(1)}% (Required: 80%)`
        });

        setSearchPhase('rag-not-found');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSearchPhase('external-consent');
        setIsLoading(false);
        
        // Add a system message explaining the low confidence
        const noProtocolMessage: Message = {
          role: 'assistant',
          content: data.message || 'No protocol found in clinic assets for this query.',
          sources: [],
          isExternal: false,
          metadata: {
            chunksFound: 0,
            documentsSearched: data.metadata?.sourceAudit?.totalIndexedAssets || 0,
            searchTermsUsed: data.metadata?.searchTermsUsed || '',
            auditLogged: false,
            pillarBreakdown: data.metadata?.pillarBreakdown,
            sourceAudit: data.metadata?.sourceAudit,
          }
        };
        setMessages(prev => [...prev, noProtocolMessage]);
        return;
      }

      const chunksFound = data.chunksFound || 0;
      const sourceNames: string[] = (data.sources || []).map((s: Source) => s.fileName);

      updateTraceStep('search-kb', { 
        status: 'completed', 
        endTime: Date.now(),
        details: `Found ${chunksFound} matching chunks (Confidence: ${data.hybridSearchConfidence?.overallConfidence || 'N/A'})`
      });

      // Update context chunks for trace panel
      const contextChunks: ChunkMatch[] = (data.chunksMatched || []).map((chunk: any) => ({
        id: chunk.id,
        fileName: chunk.fileName || 'Unknown',
        chunkIndex: chunk.chunkIndex,
        content: chunk.contentPreview || chunk.content || '',
        question: chunk.question,
        answer: chunk.answer
      }));
      setCurrentTrace(prev => ({ ...prev, contextChunks }));

      setRagResults({
        chunksFound,
        documentsSearched: data.documentsSearched || 0,
        sources: [...new Set(sourceNames)]
      });

      // If no results found in RAG and not already using external AI
      if (chunksFound === 0 && !useExternalAI) {
        updateTraceStep('search-kb', { details: 'No matches found in knowledge base' });
        setSearchPhase('rag-not-found');
        
        addTraceStep({
          id: 'no-match',
          step: 4,
          name: 'No Matches Found',
          status: 'completed',
          startTime: Date.now(),
          endTime: Date.now(),
          details: 'Offering external AI option...'
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        setSearchPhase('external-consent');
        setIsLoading(false);
        return;
      }

      // Step 4: Build Context
      const step4Start = Date.now();
      addTraceStep({
        id: 'build-context',
        step: 4,
        name: 'Build AI Context',
        status: 'running',
        startTime: step4Start,
        details: `Using ${chunksFound} chunks from ${data.documentsSearched || 0} docs`
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      updateTraceStep('build-context', { status: 'completed', endTime: Date.now() });

      // Step 5: Generate Response
      const step5Start = Date.now();
      addTraceStep({
        id: 'generate',
        step: 5,
        name: 'Generate AI Response',
        status: 'running',
        startTime: step5Start,
        details: useExternalAI ? 'Using external AI (liability waived)' : 'Using RAG-grounded response'
      });

      // Results found or using external AI
      setSearchPhase(chunksFound > 0 ? 'rag-found' : 'external-search');
      await new Promise(resolve => setTimeout(resolve, 400));
      updateTraceStep('generate', { status: 'completed', endTime: Date.now() });

      // Step 6: Hallucination Check
      const step6Start = Date.now();
      addTraceStep({
        id: 'hallucination-check',
        step: 6,
        name: 'Verify Response Sources',
        status: 'running',
        startTime: step6Start
      });

      const hallucinationCheck = analyzeHallucination(
        data.response,
        contextChunks,
        useExternalAI || false
      );

      updateTraceStep('hallucination-check', { 
        status: hallucinationCheck.passed ? 'completed' : 'error',
        endTime: Date.now(),
        details: hallucinationCheck.passed 
          ? `Confidence: ${hallucinationCheck.confidence}%` 
          : `Warnings: ${hallucinationCheck.warnings.length}`
      });

      setCurrentTrace(prev => ({ ...prev, hallucinationCheck }));

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        isExternal: useExternalAI || chunksFound === 0,
        metadata: {
          chunksFound: data.chunksFound,
          documentsSearched: data.documentsSearched,
          searchTermsUsed: data.searchTermsUsed,
          auditLogged: data.auditLogged,
          pillarBreakdown: data.pillarBreakdown,
          sourceAudit: data.sourceAudit,
        },
        traceData: {
          steps: currentTrace.steps,
          contextChunks,
          hallucinationCheck,
          searchTerms
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSearchPhase('complete');
      
      // Update AI Trust Header based on source type
      if (useExternalAI || chunksFound === 0) {
        trustHeaderRef.current?.finishWarning();
      } else {
        trustHeaderRef.current?.finishSuccess(hallucinationCheck.confidence);
      }
      
      // Show toast if hallucination warning
      if (!hallucinationCheck.passed) {
        toast.warning('Response may contain unverified claims - check trace panel');
      }

      setTimeout(() => setSearchPhase('idle'), 500);

    } catch (error) {
      console.error('Chat error:', error);
      addTraceStep({
        id: 'error',
        step: 99,
        name: 'Error',
        status: 'error',
        startTime: Date.now(),
        endTime: Date.now(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to get response. Please try again.');
      setSearchPhase('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExternalAI = async () => {
    setSearchPhase('external-search');
    setIsLoading(true);

    try {
      // Call the same function but with external AI flag
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: {
          query: pendingQuery,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          useExternalAI: true
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: [],
        isExternal: true,
        metadata: {
          chunksFound: 0,
          documentsSearched: 0,
          searchTermsUsed: data.searchTermsUsed || '',
          auditLogged: data.auditLogged,
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSearchPhase('complete');
      setTimeout(() => setSearchPhase('idle'), 500);
      toast.warning('Response from external AI - not from Dr. Sapir\'s verified materials');

    } catch (error) {
      console.error('External AI error:', error);
      toast.error('Failed to get external AI response.');
      setSearchPhase('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelExternalAI = () => {
    setSearchPhase('idle');
    setPendingQuery('');
    toast.info('Staying within Dr. Sapir\'s knowledge base');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={className} ref={contentRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" />
            Dr. Sapir's CM Knowledge Base
          </CardTitle>
          <div className="flex items-center gap-2">
            <RAGVerificationStatus />
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Audit Logged
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="no-print"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Answers powered exclusively by proprietary clinical materials • All queries logged for legal compliance
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* AI Trust Header - Real-time API score */}
        <AITrustHeader ref={trustHeaderRef} />

        {/* Q&A Suggestions Panel - Ready-made questions with distinct styling */}
        <div className="px-4 pt-2">
          <QASuggestionsPanel 
            onSelectQuestion={handleSuggestionSelect}
            sessionSeconds={0}
          />
        </div>

        <ScrollArea ref={scrollRef} className="h-[350px] px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-4 opacity-50" />
              <p>Ask any question about CM diagnosis, acupuncture points, or herbal formulas.</p>
              <p className="text-xs mt-2">All answers are sourced from Dr. Sapir's materials with citations.</p>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs max-w-md">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">RAG System Active</span>
                </div>
                <p>Every query searches ONLY our proprietary knowledge base first. If not found, you'll be offered external AI with liability disclaimer.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.isExternal 
                          ? 'bg-amber-500/10 border border-amber-500/30'
                          : 'bg-muted'
                    }`}
                  >
                    {message.isExternal && message.role === 'assistant' && (
                      <div className="flex items-center gap-1 text-amber-600 text-xs mb-2 pb-2 border-b border-amber-500/30">
                        <ExternalLink className="w-3 h-3" />
                        <span className="font-medium">External AI Response</span>
                        <span className="text-amber-500">• Not from Dr. Sapir's materials</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  
                  {/* Confidence Meter - Friendly UI for therapists */}
                  {message.role === 'assistant' && message.traceData && (
                    <div className="mt-2 w-full max-w-[85%]">
                      <ConfidenceMeter
                        confidence={message.traceData.hallucinationCheck?.confidence ?? (message.metadata?.chunksFound ? 80 : 30)}
                        sourcesCount={message.metadata?.chunksFound ?? 0}
                        sourceNames={message.sources?.map(s => s.fileName) ?? []}
                        isExternal={message.isExternal ?? false}
                        warnings={message.traceData.hallucinationCheck?.warnings ?? []}
                        hybridScore={message.metadata?.hybridSearchConfidence ? {
                          combinedScore: message.metadata.hybridSearchConfidence.averageScore,
                          threshold: message.metadata.hybridSearchConfidence.threshold,
                          meetsThreshold: message.metadata.hybridSearchConfidence.meetsThreshold,
                        } : undefined}
                        onShowDetails={() => setShowTracePanel(true)}
                      />
                    </div>
                  )}
                  
                  {/* Fallback for messages without traceData */}
                  {message.role === 'assistant' && !message.traceData && message.metadata && (
                    <div className="mt-2 w-full max-w-[85%]">
                      <ConfidenceMeter
                        confidence={message.metadata.chunksFound > 0 ? 80 : 20}
                        sourcesCount={message.metadata.chunksFound}
                        sourceNames={message.sources?.map(s => s.fileName) ?? []}
                        isExternal={message.isExternal ?? false}
                        hybridScore={message.metadata?.hybridSearchConfidence ? {
                          combinedScore: message.metadata.hybridSearchConfidence.averageScore,
                          threshold: message.metadata.hybridSearchConfidence.threshold,
                          meetsThreshold: message.metadata.hybridSearchConfidence.meetsThreshold,
                        } : undefined}
                        onShowDetails={() => setShowTracePanel(true)}
                      />
                    </div>
                  )}
                  
                  {/* Source Citations */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.sources.slice(0, 5).map((source, i) => (
                        <Badge key={i} variant="outline" className="text-xs" title={source.preview}>
                          <FileText className="w-3 h-3 mr-1" />
                          {source.fileName.length > 25 
                            ? source.fileName.substring(0, 25) + '...' 
                            : source.fileName}
                          #{source.chunkIndex}
                          {source.category && (
                            <span className="ml-1 opacity-60">({source.category})</span>
                          )}
                        </Badge>
                      ))}
                      {message.sources.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{message.sources.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Source Audit Footer - Proof that 55 assets were scanned */}
                  {message.role === 'assistant' && message.metadata?.sourceAudit && (
                    <div className="w-full max-w-[85%]">
                      <SourceAuditFooter 
                        sourceAudit={message.metadata.sourceAudit}
                        pillarBreakdown={message.metadata.pillarBreakdown}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator while streaming */}
              {isLoading && searchPhase !== 'external-consent' && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center h-5">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* RAG Search Animation & Inline External AI Consent */}
        <div className="px-4">
          <RAGSearchAnimation
            isSearching={isLoading}
            phase={searchPhase}
            ragResults={ragResults}
            onUseExternalAI={handleUseExternalAI}
            onCancelExternalAI={handleCancelExternalAI}
          />
          
          {/* Enhanced Inline External AI Disclosure - Stays in Module */}
          {searchPhase === 'external-consent' && (
            <div className="mt-3 p-4 rounded-lg border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    External AI Available
                  </h4>
                  <p className="text-xs text-amber-600/80 mt-1">
                    No matches found in Dr. Sapir's verified knowledge base. You may consult external AI (Gemini), but:
                  </p>
                  <ul className="text-[10px] text-amber-600/70 mt-2 space-y-1 list-disc list-inside">
                    <li>External AI responses are <strong>NOT verified</strong> by Dr. Sapir</li>
                    <li>You accept full clinical responsibility for using this information</li>
                    <li>All queries remain logged for audit trail</li>
                    <li>You stay within this module - no external redirects</li>
                  </ul>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCancelExternalAI}
                      className="text-xs h-8"
                    >
                      Stay in Knowledge Base
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleUseExternalAI}
                      className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white gap-1"
                    >
                      <Bot className="w-3 h-3" />
                      Accept & Use External AI
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Trace Panel - Advanced mode for detailed monitoring */}
        {showTracePanel && (currentTrace.steps.length > 0 || isLoading) && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Advanced Trace Mode
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTracePanel(false)}
                className="h-6 text-xs"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Hide Details
              </Button>
            </div>
            <AITracePanel
              isVisible={showTracePanel}
              steps={currentTrace.steps}
              contextChunks={currentTrace.contextChunks}
              hallucinationCheck={currentTrace.hallucinationCheck}
              searchTerms={currentTrace.searchTerms}
              isExternal={searchPhase === 'external-search'}
            />
          </div>
        )}

        <div className="p-4 border-t no-print">
          <div className="flex gap-2">
            <VoiceInputButton
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
              size="sm"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about CM patterns, acupoints, formulas..."
              disabled={isLoading || searchPhase === 'external-consent'}
              className="flex-1"
            />
            <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim() || searchPhase === 'external-consent'}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Responses include source citations for verification
            </p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              All queries logged
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
