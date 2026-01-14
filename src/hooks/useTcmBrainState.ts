import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTcmSessionHistory, TcmSession, VoiceNoteData } from '@/hooks/useTcmSessionHistory';
import { VoiceNote } from '@/components/tcm/VoiceNoteRecorder';
import { SessionTemplate } from '@/components/tcm/SessionTemplates';
import { SelectedPatient } from '@/components/crm/PatientSelectorDropdown';
import { ExternalAIProvider } from '@/components/tcm/ExternalAIFallbackCard';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { detectAgeGroup } from '@/utils/ageGroupDetection';
import { toast as uiToast } from '@/hooks/use-toast';
import {
  herbsQuestions,
  conditionsQuestions,
  mentalQuestions,
  sleepQuestions,
  nutritionQuestions,
  pointsQuestions,
  wellnessQuestions,
  sportsQuestions,
} from '@/data/tcmBrainQuestions';

// Silence all pop-up notices ("sonner" toasts) across TCM Brain flow.
// We keep the same API surface but no-op everything.
const toast = new Proxy(
  {},
  {
    get: () => (..._args: unknown[]) => {},
  }
) as unknown as {
  [key: string]: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warning: (...args: unknown[]) => void;
};

const showRenderErrorToast = (details: unknown) => {
  const description =
    details instanceof Error
      ? details.message
      : typeof details === 'string'
        ? details
        : (() => {
            try {
              return JSON.stringify(details);
            } catch {
              return String(details);
            }
          })();

  uiToast({
    variant: 'destructive',
    title: 'Error displaying response',
    description,
  });
};

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagStats {
  chunksFound: number;
  documentsSearched: number;
  searchTerms: string;
  timestamp: Date | null;
  isExternal?: boolean;
  auditLogged?: boolean;
  auditLogId?: string | null;
  auditLoggedAt?: string | null;
  tokensUsed?: number;
}

// Unified Debug Metadata Interface (shared with useRagChat)
export interface DebugMetadata {
  tokenBudget: {
    used: number;
    max: number;
    percentage: number;
  };
  chunks: {
    found: number;
    included: number;
    dropped: number;
    budgetReached: boolean;
  };
  topChunks: Array<{
    index: number;
    sourceName: string;
    ferrariScore: number;
    keywordScore: number;
    questionBoost: boolean;
    included: boolean;
    reason: string;
  }>;
  thresholds: {
    clinicalStandard: number;
    minHighConfidence: number;
  };
}

export interface ChainedWorkflow {
  isActive: boolean;
  currentPhase: 'idle' | 'symptoms' | 'diagnosis' | 'treatment' | 'complete';
  symptomsData: string;
  diagnosisData: string;
  treatmentData: string;
}

export interface SourceAlert {
  visible: boolean;
  type: 'proprietary' | 'external' | 'no-match' | null;
  auditLogId: string | null;
  chunksFound: number;
}

export interface DisclaimerStatus {
  signed: boolean;
  expired: boolean;
}

const DISCLAIMER_STORAGE_KEY = 'tcm_therapist_disclaimer_signed';
const RAG_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tcm-rag-chat`;

export type SearchDepthMode = 'quick' | 'deep';

export function useTcmBrainState() {
  const { session } = useAuth();
  
  // Core chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔒 SUBMISSION LOCK - prevent duplicates
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [highlightedPoints, setHighlightedPoints] = useState<string[]>([]);
  const [searchDepth, setSearchDepth] = useState<SearchDepthMode>('deep');
  
  // Session state
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'running' | 'paused' | 'ended'>('idle');
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // RAG state
  const [lastRagStats, setLastRagStats] = useState<RagStats>({
    chunksFound: 0,
    documentsSearched: 0,
    searchTerms: '',
    timestamp: null,
    isExternal: false,
    auditLogged: false,
    auditLogId: null,
    auditLoggedAt: null,
    tokensUsed: 0,
  });
  
  // Debug metadata for unified algorithm transparency
  const [debugData, setDebugData] = useState<DebugMetadata | null>(null);
  const [searchMethod, setSearchMethod] = useState<string>('hybrid');

  // External AI fallback (only offered when proprietary KB has 0 matches)
  const [externalFallbackQuery, setExternalFallbackQuery] = useState<string | null>(null);
  
  const [sourceAlert, setSourceAlert] = useState<SourceAlert>({
    visible: false,
    type: null,
    auditLogId: null,
    chunksFound: 0,
  });
  
  // Auto-chain workflow
  const [chainedWorkflow, setChainedWorkflow] = useState<ChainedWorkflow>({
    isActive: false,
    currentPhase: 'idle',
    symptomsData: '',
    diagnosisData: '',
    treatmentData: '',
  });
  
  // Edit mode for workflow
  const [workflowEditMode, setWorkflowEditMode] = useState(false);
  const [editedWorkflow, setEditedWorkflow] = useState({
    symptomsData: '',
    diagnosisData: '',
    treatmentData: '',
  });
  const [workflowSavedToPatient, setWorkflowSavedToPatient] = useState(false);
  const [savingToPatient, setSavingToPatient] = useState(false);
  
  // Patient state
  const [patients, setPatients] = useState<Array<{ id: string; full_name: string; email?: string | null; phone?: string | null }>>([]);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  // Disclaimer state
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
  
  // Session history
  const { sessions, saveSession, exportSessionAsPDF, openGmailWithSession, openWhatsAppWithSession } = useTcmSessionHistory();
  
  // Refs
  const chatInputRef = useRef<HTMLInputElement>(null);
  const aiResponseRef = useRef<HTMLDivElement>(null);
  
  // Session timer
  useEffect(() => {
    if (!isSessionRunning) return;
    const timer = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isSessionRunning]);
  
  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!session?.user?.id) return;
      setLoadingPatients(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, email, phone, date_of_birth, age_group')
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
  
  // Parse highlighted points from messages
  useEffect(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      const points = parsePointReferences(lastAssistantMsg.content);
      setHighlightedPoints(points);
    }
  }, [messages]);
  
  // Format session time
  const formatSessionTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Session controls
  const startSession = useCallback(() => {
    setSessionStartTime(new Date());
    setSessionSeconds(0);
    setIsSessionRunning(true);
    setSessionStatus('running');
    setQuestionsAsked([]);
    setMessages([]);
    setVoiceNotes([]);
    setActiveTemplate(null);
    toast.success('Session started');
  }, []);
  
  const pauseSession = useCallback(() => {
    setIsSessionRunning(false);
    setSessionStatus('paused');
    toast.info('Session paused');
  }, []);
  
  const continueSession = useCallback(() => {
    setIsSessionRunning(true);
    setSessionStatus('running');
    toast.success('Session resumed');
  }, []);
  
  const endSession = useCallback(() => {
    setIsSessionRunning(false);
    setSessionStatus('ended');
    
    const voiceNoteData: VoiceNoteData[] = voiceNotes.map(vn => ({
      id: vn.id,
      transcription: vn.transcription,
      duration: vn.duration,
      timestamp: vn.timestamp
    }));
    
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
    
    saveSession(sessionData);
    exportSessionAsPDF(sessionData);
    toast.success('Session ended & saved to history');
    
    setTimeout(() => {
      setSessionStatus('idle');
      setSessionSeconds(0);
      setSessionStartTime(null);
      setVoiceNotes([]);
      setActiveTemplate(null);
    }, 2000);
  }, [voiceNotes, sessionStartTime, sessionSeconds, questionsAsked, messages, selectedPatient, activeTemplate, formatSessionTime, saveSession, exportSessionAsPDF]);
  
  // Chat function with SUBMISSION LOCK to prevent duplicate requests
  const streamChat = useCallback(async (userMessage: string) => {
    // 🔒 SUBMISSION LOCK - Prevent duplicate requests
    if (isSubmitting) {
      console.log('[useTcmBrainState] Request blocked - already submitting');
      return;
    }
    setIsSubmitting(true);
    
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setQuestionsAsked(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setCurrentQuery(userMessage);

    if (!disclaimerStatus.signed) {
      const msg = disclaimerStatus.expired
        ? 'Disclaimer expired — please sign again to use AI.'
        : 'Please sign the disclaimer to use AI.';

      // No popups: show the reason inline as an assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
      setIsLoading(false);
      setLoadingStartTime(null);
      setIsSubmitting(false); // 🔓 RELEASE LOCK on early return
      return;
    }

    if (!session?.access_token) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Please log in to use AI.' }]);
      setIsLoading(false);
      setLoadingStartTime(null);
      setIsSubmitting(false); // 🔓 RELEASE LOCK on early return
      return;
    }

    try {
      // Detect age group from patient data
      const ageGroupInfo = selectedPatient ? detectAgeGroup({
        date_of_birth: selectedPatient.date_of_birth,
        age_group: selectedPatient.age_group
      }) : null;
      
      const response = await fetch(RAG_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: userMessage,
          message: userMessage, // backward compatibility
          stream: true,
          messages: [...messages, userMsg],
          includeChunkDetails: true,
          ageGroup: ageGroupInfo?.group,
          patientContext: selectedPatient
            ? `Patient: ${selectedPatient.name}${ageGroupInfo ? `, Age Group: ${ageGroupInfo.label}` : ''}`
            : undefined,
          searchDepth: searchDepth, // Pass depth mode to backend
        }),
      });

      if (!response.ok) {
        const msg =
          response.status === 401
            ? 'Session expired. Please log in again.'
            : response.status === 429
              ? 'Too many requests. Please try again in a minute.'
              : response.status === 402
                ? 'Credits exhausted. Please add credits.'
                : 'AI service error. Please try again.';

        setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
        setIsLoading(false);
        setLoadingStartTime(null);
        // End engine indicators even on error
        window.dispatchEvent(new CustomEvent('tcm-query-end', { detail: { source: 'rag_internal', score: 0 } }));
        return;
      }

      const contentType = response.headers.get('content-type') ?? '';

      // Non-streaming JSON responses (current backend behavior)
      if (contentType.includes('application/json')) {
        const data = await response.json();

        const md = data?.metadata ?? data ?? {};
        const chunksFound = Number(md.chunksFound ?? md.chunks_found ?? md?.sourceAudit?.chunksFound ?? 0);
        const documentsSearched = Number(md.documentsSearched ?? md.documents_searched ?? md?.sourceAudit?.documentsSearched ?? 0);
        const searchTermsUsed = String(md.searchTermsUsed ?? md.search_terms_used ?? md.searchTerms ?? '');
        const isExternal = Boolean(md.isExternal ?? md.is_external ?? false);
        const confidence =
          typeof md.actualConfidence === 'number'
            ? md.actualConfidence
            : typeof md.confidenceScore === 'number'
              ? md.confidenceScore
              : typeof md?.sourceAudit?.actualConfidence === 'number'
                ? md.sourceAudit.actualConfidence
                : null;

        setLastRagStats({
          chunksFound,
          documentsSearched,
          searchTerms: searchTermsUsed,
          timestamp: new Date(),
          isExternal,
          auditLogged: false,
          auditLogId: null,
          auditLoggedAt: null,
          tokensUsed: 0,
        });

        // Extract debug metadata for algorithm transparency (Ferrari Score, Token Budget)
        if (data?.debug) {
          setDebugData(data.debug);
          setSearchMethod(data.searchMethod || 'hybrid');
        }

        if (!isExternal && chunksFound === 0) {
          setExternalFallbackQuery(userMessage);
        } else {
          setExternalFallbackQuery(null);
        }

        const assistantText =
          (typeof data?.response === 'string' && data.response.trim())
            ? data.response
            : (typeof data?.answer === 'string' && data.answer.trim())
              ? data.answer
              : (typeof data?.message === 'string' && data.message.trim())
                ? data.message
                : 'No response generated.';

        setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);

        const score = confidence === null ? (chunksFound > 0 ? 98 : 0) : Math.round(confidence * 100);
        window.dispatchEvent(
          new CustomEvent('tcm-query-end', {
            detail: { source: isExternal ? 'llm_fallback' : 'rag_internal', score },
          })
        );

        return;
      }

      // Streaming SSE responses (legacy/optional)
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';
      let metadata: any = null;
      let textBuffer = '';
      let renderedFromJsonFallback = false;

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsStreaming(true);

      const renderAssistantNow = (text: string) => {
        assistantContent = text;
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          } else {
            updated.push({ role: 'assistant', content: assistantContent });
          }
          return updated;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Fallback Render: sometimes the backend returns a full JSON object (not SSE)
        // (e.g. headers claim SSE but body is JSON)
        const trimmedWhole = textBuffer.trim();
        if (!renderedFromJsonFallback && trimmedWhole.startsWith('{') && trimmedWhole.endsWith('}')) {
          try {
            const data = JSON.parse(trimmedWhole);
            const fullText =
              (typeof data?.response === 'string' && data.response.trim())
                ? data.response
                : (typeof data?.answer === 'string' && data.answer.trim())
                  ? data.answer
                  : null;

            if (fullText) {
              renderedFromJsonFallback = true;
              renderAssistantNow(fullText);
              try {
                await reader.cancel();
              } catch {
                // ignore
              }
              break;
            }
          } catch {
            // ignore - still streaming/partial
          }
        }

        // Process complete SSE lines
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);

            // Legacy “typed” SSE format
            if (parsed.type === 'metadata') {
              metadata = parsed;
              setLastRagStats({
                chunksFound: parsed.chunksFound || 0,
                documentsSearched: parsed.documentsSearched || 0,
                searchTerms: parsed.searchTermsUsed || '',
                timestamp: new Date(),
                isExternal: !!parsed.isExternal,
                auditLogged: false,
                auditLogId: null,
                auditLoggedAt: null,
                tokensUsed: 0,
              });

              const alertType = parsed.isExternal
                ? 'external'
                : (parsed.chunksFound || 0) > 0
                  ? 'proprietary'
                  : 'no-match';

              if (alertType === 'no-match' && !parsed.isExternal) {
                setExternalFallbackQuery(userMessage);
              } else {
                setExternalFallbackQuery(null);
              }

              setSourceAlert({
                visible: true,
                type: alertType,
                auditLogId: null,
                chunksFound: parsed.chunksFound || 0,
              });

              setTimeout(() => {
                setSourceAlert(prev => ({ ...prev, visible: false }));
              }, 5000);

              if (parsed.isExternal) {
                toast.warning('External AI used — not from proprietary materials');
              } else if ((parsed.chunksFound || 0) > 0) {
                toast.success(`Verified KB: ${parsed.chunksFound} chunks / ${parsed.documentsSearched} docs matched`);
              } else {
                toast.info('0 matches in proprietary knowledge base. External AI option available.');
              }
              continue;
            }

            // OpenAI-compatible streaming format (choices[].delta.content)
            const openAiDelta = parsed?.choices?.[0]?.delta?.content;
            if (typeof openAiDelta === 'string' && openAiDelta) {
              assistantContent += openAiDelta;
              renderAssistantNow(assistantContent);
              continue;
            }

            // Current typed delta format
            if (parsed.type === 'delta' && parsed.content) {
              assistantContent += parsed.content;
              renderAssistantNow(assistantContent);
              continue;
            }

            if (parsed.type === 'done') {
              const totalTokens =
                typeof parsed?.tokenUsage?.totalTokens === 'number'
                  ? parsed.tokenUsage.totalTokens
                  : 0;

              // Update audit + token info
              setLastRagStats(prev =>
                prev
                  ? {
                      ...prev,
                      auditLogged: !!parsed.auditLogId,
                      auditLogId: parsed.auditLogId ?? null,
                      auditLoggedAt: parsed.auditLoggedAt ?? null,
                      tokensUsed: totalTokens,
                    }
                  : null
              );
              setSourceAlert(prev => ({
                ...prev,
                auditLogId: parsed.auditLogId ?? null,
              }));
              continue;
            }

            // If the backend sends a bulk JSON event as a single SSE data frame
            const bulkText =
              (typeof parsed?.response === 'string' && parsed.response.trim())
                ? parsed.response
                : (typeof parsed?.answer === 'string' && parsed.answer.trim())
                  ? parsed.answer
                  : null;
            if (bulkText) {
              renderedFromJsonFallback = true;
              renderAssistantNow(bulkText);
              try {
                await reader.cancel();
              } catch {
                // ignore
              }
              break;
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }

        if (renderedFromJsonFallback) break;
      }

      // Final safety: ensure we don't leave a blank assistant bubble
      if (!assistantContent.trim() && textBuffer.trim()) {
        const trimmed = textBuffer.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const data = JSON.parse(trimmed);
            const fullText =
              (typeof data?.response === 'string' && data.response.trim())
                ? data.response
                : (typeof data?.answer === 'string' && data.answer.trim())
                  ? data.answer
                  : null;
            if (fullText) assistantContent = fullText;
          } catch {
            // ignore
          }
        }
      }

      if (assistantContent.trim()) {
        renderAssistantNow(assistantContent);
      }

    } catch (error) {
      console.error('Chat error:', error);
      showRenderErrorToast(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error displaying response: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setLoadingStartTime(null);
      setIsSubmitting(false); // 🔓 RELEASE LOCK
    }
  }, [disclaimerStatus, session, messages, selectedPatient, isSubmitting]);

  const dismissExternalFallback = useCallback(() => {
    setExternalFallbackQuery(null);
  }, []);

  const runExternalAIFallback = useCallback(async (provider?: ExternalAIProvider) => {
    if (!externalFallbackQuery || isLoading) return;
    
    // Only handle internal providers here - external ones open in new tabs
    if (provider && provider !== 'lovable-gemini') {
      // External provider handled by component (opens in new tab)
      setExternalFallbackQuery(null);
      return;
    }

    if (!disclaimerStatus.signed) {
      toast.error(disclaimerStatus.expired ? 'Disclaimer expired — please sign again' : 'Please sign disclaimer before using AI');
      return;
    }

    if (!session?.access_token) {
      toast.error('Please log in to use TCM Brain');
      return;
    }

    setIsLoading(true);
    setLoadingStartTime(Date.now());

    try {
      const response = await fetch(RAG_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: externalFallbackQuery,
          messages,
          useExternalAI: true,
          includeChunkDetails: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) toast.error('Session expired. Please log in again.');
        else if (response.status === 429) toast.error('Too many requests. Try again in a minute.');
        else if (response.status === 402) toast.error('Credits exhausted. Please add credits.');
        else toast.error('AI service error');
        return;
      }

      const data = await response.json();

      setLastRagStats({
        chunksFound: data.chunksFound || 0,
        documentsSearched: data.documentsSearched || 0,
        searchTerms: data.searchTermsUsed || '',
        timestamp: new Date(),
        isExternal: true,
        auditLogged: !!data.auditLogged,
        auditLogId: data.auditLogId ?? null,
        auditLoggedAt: data.auditLoggedAt ?? null,
      });

      setSourceAlert({
        visible: true,
        type: 'external',
        auditLogId: data.auditLogId ?? null,
        chunksFound: 0,
      });

      setTimeout(() => {
        setSourceAlert(prev => ({ ...prev, visible: false }));
      }, 5000);

      toast.warning('External AI used — not from proprietary materials');

      const assistantContent = data.response || 'No response generated';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);

      // Once used, hide the fallback offer
      setExternalFallbackQuery(null);
    } catch (error) {
      console.error('External AI fallback error:', error);
      toast.error('Chat error');
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  }, [disclaimerStatus, externalFallbackQuery, isLoading, messages, session]);
  
  // Build question context for auto-chain
  const buildQuestionContext = useCallback(() => {
    const symptomQs = [
      ...conditionsQuestions.map(q => `- ${q.question} (${q.category})`),
      ...mentalQuestions.map(q => `- ${q.question} (${q.category})`),
      ...sleepQuestions.map(q => `- ${q.question} (${q.category})`),
      ...nutritionQuestions.map(q => `- ${q.question} (${q.category})`),
    ].join('\n');
    
    const diagnosisQs = [
      ...conditionsQuestions.map(q => `- ${q.question}`),
      ...herbsQuestions.filter(q => ['Blood', 'Heat/Cold', 'Formulas'].includes(q.category)).map(q => `- ${q.question}`),
      ...pointsQuestions.filter(q => ['Meridians', 'Techniques'].includes(q.category)).map(q => `- ${q.question}`),
    ].join('\n');
    
    const treatmentQs = [
      ...herbsQuestions.map(q => `- ${q.question} (${q.category})`),
      ...pointsQuestions.map(q => `- ${q.question} (${q.category})`),
      ...wellnessQuestions.map(q => `- ${q.question} (${q.category})`),
      ...sportsQuestions.filter(q => q.category === 'Treatment').map(q => `- ${q.question}`),
    ].join('\n');
    
    return { symptomQuestions: symptomQs, diagnosisQuestions: diagnosisQs, treatmentQuestions: treatmentQs };
  }, []);
  
  // Run chained workflow
  const runChainedWorkflow = useCallback(async (symptomDescription: string) => {
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
      // Phase 1: Symptoms
      toast.info('🔍 Phase 1/3: Analyzing symptoms...');
      
      const symptomPrompt = `You are analyzing patient symptoms using a comprehensive TCM clinical framework.

PATIENT PRESENTATION:
"${symptomDescription}"

CLINICAL ASSESSMENT FRAMEWORK:
${symptomQuestions}

Provide a thorough TCM symptom analysis:
1. **Chief Complaint** - Primary symptoms identified
2. **Associated Symptoms** - Secondary manifestations
3. **Onset & Duration** - Timeline and progression
4. **Aggravating/Relieving Factors**
5. **Tongue Indicators** - What to look for
6. **Pulse Indicators** - What to palpate
7. **Relevant TCM Patterns**`;

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

      // Phase 2: Diagnosis
      toast.info('🔬 Phase 2/3: Pattern differentiation...');
      setChainedWorkflow(prev => ({ ...prev, currentPhase: 'diagnosis' }));

      const diagnosisPrompt = `You are performing TCM pattern differentiation.

SYMPTOM ANALYSIS FROM PHASE 1:
${symptomsResult}

TCM DIAGNOSTIC FRAMEWORK:
${diagnosisQuestions}

Provide a thorough TCM diagnosis:
1. **Primary Pattern/Syndrome (证)**
2. **Secondary Patterns**
3. **Affected Organs/Meridians**
4. **Qi-Blood-Yin-Yang Analysis**
5. **Root vs Branch (本标)**
6. **Severity Assessment**
7. **Differential Diagnosis**`;

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

      // Phase 3: Treatment
      toast.info('💊 Phase 3/3: Creating treatment plan...');
      setChainedWorkflow(prev => ({ ...prev, currentPhase: 'treatment' }));

      const treatmentPrompt = `You are creating a comprehensive TCM treatment protocol.

TCM DIAGNOSIS FROM PHASE 2:
${diagnosisResult}

TREATMENT PROTOCOL FRAMEWORK:
${treatmentQuestions}

Provide a complete treatment protocol:
1. **Treatment Principle (治則)**
2. **Acupuncture Protocol**
3. **Herbal Formula**
4. **Auxiliary Techniques**
5. **Lifestyle Prescriptions**
6. **Treatment Course**
7. **Safety & Contraindications**`;

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

      toast.success('✅ Complete workflow finished!');
      setWorkflowSavedToPatient(false);
      setQuestionsAsked(prev => [...prev, `[AUTO-CHAIN] ${symptomDescription}`]);

    } catch (error) {
      console.error('Chained workflow error:', error);
      toast.error('Workflow failed. Please try individual queries.');
      setChainedWorkflow(prev => ({ ...prev, isActive: false, currentPhase: 'idle' }));
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  }, [session, disclaimerStatus, buildQuestionContext]);
  
  // Save workflow to patient
  const saveWorkflowToPatient = useCallback(async () => {
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
      const visitData = {
        patient_id: selectedPatient.id,
        therapist_id: session.user.id,
        visit_date: new Date().toISOString().split('T')[0],
        chief_complaint: chainedWorkflow.symptomsData.substring(0, 500),
        tcm_pattern: chainedWorkflow.diagnosisData.substring(0, 500),
        notes: `## Symptoms\n${chainedWorkflow.symptomsData}\n\n## Diagnosis\n${chainedWorkflow.diagnosisData}\n\n## Treatment\n${chainedWorkflow.treatmentData}`,
      };

      const { error } = await supabase.from('visits').insert(visitData);
      
      if (error) throw error;
      
      setWorkflowSavedToPatient(true);
      toast.success(`Workflow saved to ${selectedPatient.name}'s record`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSavingToPatient(false);
    }
  }, [session, selectedPatient, chainedWorkflow]);
  
  // Voice note handlers
  const handleAddVoiceNote = useCallback((note: VoiceNote) => {
    setVoiceNotes(prev => [...prev, note]);
  }, []);
  
  const handleDeleteVoiceNote = useCallback((id: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Template handler
  const handleApplyTemplate = useCallback((template: SessionTemplate) => {
    setActiveTemplate(template.name);
    setQuestionsAsked(prev => [...new Set([...prev, ...template.questions])]);
    toast.success(`Template "${template.name}" applied`);
  }, []);
  
  // Patient sessions
  const patientSessions = useMemo(() => {
    if (!selectedPatient?.name) return [];
    return sessions.filter(s => s.patientName === selectedPatient.name).slice(0, 5);
  }, [sessions, selectedPatient?.name]);
  
  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setHighlightedPoints([]);
    setCurrentQuery('');
  }, []);

  return {
    // Chat state
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    isStreaming,
    loadingStartTime,
    currentQuery,
    highlightedPoints,
    setHighlightedPoints,
    
    // Session state
    sessionSeconds,
    isSessionRunning,
    sessionStartTime,
    sessionStatus,
    questionsAsked,
    voiceNotes,
    activeTemplate,
    lastAutoSave,
    setLastAutoSave,
    
    // RAG state
    lastRagStats,
    sourceAlert,
    externalFallbackQuery,
    dismissExternalFallback,
    runExternalAIFallback,
    
    // Workflow state
    chainedWorkflow,
    setChainedWorkflow,
    workflowEditMode,
    setWorkflowEditMode,
    editedWorkflow,
    setEditedWorkflow,
    workflowSavedToPatient,
    savingToPatient,
    
    // Patient state
    patients,
    selectedPatient,
    setSelectedPatient,
    loadingPatients,
    patientSessions,
    
    // Disclaimer
    disclaimerStatus,
    
    // Session history
    sessions,
    openGmailWithSession,
    openWhatsAppWithSession,
    
    // Refs
    chatInputRef,
    aiResponseRef,
    
    // Functions
    formatSessionTime,
    startSession,
    pauseSession,
    continueSession,
    endSession,
    streamChat,
    runChainedWorkflow,
    saveWorkflowToPatient,
    handleAddVoiceNote,
    handleDeleteVoiceNote,
    handleApplyTemplate,
    clearChat,
    
    // Search depth mode
    searchDepth,
    setSearchDepth,
    
    // Debug data for algorithm transparency (unified with useRagChat)
    debugData,
    searchMethod,
  };
}
