import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Shield, Database, FileCheck, Upload, Trash2, Pause, Play, RotateCcw, XCircle, ArrowLeft, ShieldAlert, Loader2, Languages, Sparkles, Heart } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { GoldenKnowledgeImport } from '@/components/admin/GoldenKnowledgeImport';
import { format } from 'date-fns';

// Hook to check if user has admin role
function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-admin-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (error) {
        console.error('Admin role check error:', error);
        return false;
      }
      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Simple CSV parser
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

interface KnowledgeDocument {
  id: string;
  file_name: string;
  original_name: string;
  file_hash: string;
  file_size: number | null;
  row_count: number | null;
  category: string | null;
  language: string | null;
  status: string;
  indexed_at: string | null;
  created_at: string;
}

interface LegalReport {
  reportTitle: string;
  generatedAt: string;
  generatedBy?: string;
  reportVersion?: string;
  summary: {
    totalDocuments: number;
    totalIndexedDocuments: number;
    totalKnowledgeEntries: number;
    dataSourcesCertified?: string;
    externalDataSources?: string;
    publicDomainContent?: string;
  };
  lineItemSummary?: string;
  documentManifest: Array<{
    lineNumber?: number;
    fileName: string;
    storedAs?: string;
    fileHash: string;
    fileSize?: number | null;
    category?: string | null;
    language?: string | null;
    rowCount?: number | null;
    chunksIndexed: number;
    status: string;
    uploadedAt?: string;
    indexedAt?: string | null;
  }>;
  technicalCertification?: {
    systemArchitecture?: string;
    aiModel?: string;
    dataIsolation?: string;
    noExternalKnowledge?: boolean;
    sourceTracing?: string;
    behaviorOnMissingData?: string;
  };
  legalDeclaration: {
    declarationText: string;
    signatureBlock?: {
      preparedFor?: string;
      systemOperator?: string;
      reportVersion?: string;
    };
  };
  verificationInstructions?: string;
}

const CATEGORIES = [
  'general_health',
  'tcm_theory',
  'anxiety_mental',
  'pain_ortho',
  'womens_health',
  'wellness_sport',
  'therapist_training',
  'pediatrics',
  'digestive',
  'respiratory',
  'dermatology',
  'other'
];

const BUILTIN_ASSETS = [
  {
    id: 'tongue-diagnosis',
    label: 'tongue-diagnosis.csv',
    path: '/knowledge-assets/tongue-diagnosis.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'diet-nutrition-intake',
    label: 'diet-nutrition-intake.csv',
    path: '/knowledge-assets/diet-nutrition-intake.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'pulse-diagnosis',
    label: 'pulse-diagnosis.csv',
    path: '/knowledge-assets/pulse-diagnosis.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'chronic-pain-management',
    label: 'chronic-pain-management.csv',
    path: '/knowledge-assets/chronic-pain-management.csv',
    defaultCategory: 'pain_ortho',
    defaultLanguage: 'en',
  },
  {
    id: 'digestive-disorders',
    label: 'digestive-disorders.csv',
    path: '/knowledge-assets/digestive-disorders.csv',
    defaultCategory: 'digestive',
    defaultLanguage: 'en',
  },
  {
    id: 'immune-resilience',
    label: 'immune-resilience.csv',
    path: '/knowledge-assets/immune-resilience.csv',
    defaultCategory: 'wellness_sport',
    defaultLanguage: 'en',
  },
  {
    id: 'mental-health-tcm',
    label: 'mental-health-tcm.csv',
    path: '/knowledge-assets/mental-health-tcm.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'pediatric-acupuncture',
    label: 'pediatric-acupuncture.csv',
    path: '/knowledge-assets/pediatric-acupuncture.csv',
    defaultCategory: 'pediatrics',
    defaultLanguage: 'en',
  },
  {
    id: 'sport-performance-recovery',
    label: 'sport-performance-recovery.csv',
    path: '/knowledge-assets/sport-performance-recovery.csv',
    defaultCategory: 'wellness_sport',
    defaultLanguage: 'en',
  },
  {
    id: 'womens-health-tcm',
    label: 'Women\'s Health TCM (Gynecology, Fertility, Pregnancy)',
    path: '/knowledge-assets/womens-health-tcm.csv',
    defaultCategory: 'womens_health',
    defaultLanguage: 'en',
  },
  {
    id: 'fertility-protocols',
    label: 'Fertility Protocols (IVF, Male Factor, Recurrent Loss)',
    path: '/knowledge-assets/fertility-protocols.csv',
    defaultCategory: 'womens_health',
    defaultLanguage: 'en',
  },
  {
    id: 'pregnancy-trimester-guide',
    label: 'Pregnancy Trimester Guide (Safe Points, Labor, Postpartum)',
    path: '/knowledge-assets/pregnancy-trimester-guide.csv',
    defaultCategory: 'womens_health',
    defaultLanguage: 'en',
  },
  {
    id: 'pattern-differentiation-protocols',
    label: 'Pattern Differentiation Protocols (16 Syndromes + Herbal Formulas)',
    path: '/knowledge-assets/pattern-differentiation-protocols.csv',
    defaultCategory: 'tcm_diagnosis',
    defaultLanguage: 'en',
  },
  {
    id: 'msk-protocols',
    label: 'MSK Protocols (Frozen Shoulder, Sciatica, Low Back Pain, etc.)',
    path: '/knowledge-assets/msk-protocols.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  {
    id: 'musculoskeletal-orthopedic',
    label: 'Orthopedic MSK Protocols (25 Conditions + Acute vs Chronic)',
    path: '/knowledge-assets/musculoskeletal-orthopedic.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  {
    id: 'acupoints-master',
    label: 'Acupoints Master (361 Standard Points - Complete)',
    path: '/knowledge-assets/acupoints_master.csv',
    defaultCategory: 'acupuncture_points',
    defaultLanguage: 'en',
  },
  {
    id: 'acupoint-reference-50',
    label: 'Acupoint Reference (50 Essential Points with Locations & Actions)',
    path: '/knowledge-assets/acupoint-reference-50.csv',
    defaultCategory: 'acupuncture_points',
    defaultLanguage: 'en',
  },
  {
    id: 'clinical-scenarios-100',
    label: 'Clinical Scenarios (100 Patient Concerns + Treatment Strategies)',
    path: '/knowledge-assets/clinical-scenarios-100.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  {
    id: 'work-stress-burnout',
    label: 'work-stress-burnout.csv',
    path: '/knowledge-assets/work-stress-burnout.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'extreme-weather-climate',
    label: 'extreme-weather-climate.csv',
    path: '/knowledge-assets/extreme-weather-climate.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'nine-constitutions-qa',
    label: 'nine-constitutions-qa.csv',
    path: '/knowledge-assets/nine-constitutions-qa.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'chief-complaints-tcm',
    label: 'chief-complaints-tcm.csv',
    path: '/knowledge-assets/chief-complaints-tcm.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'diagnostics-professional',
    label: 'diagnostics-professional.csv (Corrected 4-Column)',
    path: '/knowledge-assets/diagnostics-professional.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'qa-professional-corrected',
    label: 'QA_Professional_Corrected_4Columns.csv',
    path: '/knowledge-assets/QA_Professional_Corrected_4Columns.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  {
    id: 'treatment-planning-protocols',
    label: 'Treatment_Planning_Protocols_Professional_100plus.csv',
    path: '/knowledge-assets/Treatment_Planning_Protocols_Professional_100plus.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  // Age-Group Specific Knowledge Assets
  {
    id: 'tcm-newborn-qa',
    label: 'TCM Newborn Q&A (0-1 year)',
    path: '/knowledge-assets/tcm-newborn-qa.csv',
    defaultCategory: 'pediatrics',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-children-7-13-qa',
    label: 'TCM Children Q&A (7-13 years)',
    path: '/knowledge-assets/tcm-children-7-13-qa.csv',
    defaultCategory: 'pediatrics',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-adults-18-50-qa',
    label: 'TCM Adults Q&A (18-50 years)',
    path: '/knowledge-assets/tcm-adults-18-50-qa.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-elderly-70-120-qa',
    label: 'TCM Elderly Q&A (70-120 years)',
    path: '/knowledge-assets/tcm-elderly-70-120-qa.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'age-prompts-adults-18-50',
    label: 'Age Prompts Adults (18-50)',
    path: '/knowledge-assets/age-prompts-adults-18-50.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'age-prompts-adults-50-70',
    label: 'Age Prompts Adults (50-70)',
    path: '/knowledge-assets/age-prompts-adults-50-70.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'elderly-lifestyle-recommendations',
    label: 'Elderly Lifestyle Recommendations',
    path: '/knowledge-assets/elderly-lifestyle-recommendations.csv',
    defaultCategory: 'general_health',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-teenage-mental-health-qa',
    label: 'TCM Teenage Mental Health Q&A (13-18 years)',
    path: '/knowledge-assets/tcm-teenage-mental-health-qa.csv',
    defaultCategory: 'mental_health',
    defaultLanguage: 'en',
  },
  {
    id: 'four-examinations-qa',
    label: 'Four Examinations (Si Zhen) - 40 Diagnostic Signs',
    path: '/knowledge-assets/four-examinations-qa.csv',
    defaultCategory: 'tcm_diagnosis',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-pattern-differentiation-100qa',
    label: 'TCM Pattern Differentiation (100 Q&A with Points & Formulas)',
    path: '/knowledge-assets/tcm-pattern-differentiation-100qa.csv',
    defaultCategory: 'tcm_diagnosis',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-skin-renewal-100qa',
    label: 'TCM Skin Renewal & Anti-Aging (100 Q&A - Dermatology/Cosmetic)',
    path: '/knowledge-assets/tcm-skin-renewal-100qa.csv',
    defaultCategory: 'dermatology',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-dermatology-comprehensive',
    label: 'TCM Dermatology Comprehensive (50 Skin Conditions)',
    path: '/knowledge-assets/tcm-dermatology-comprehensive.csv',
    defaultCategory: 'dermatology',
    defaultLanguage: 'en',
  },
  {
    id: 'comprehensive-caf-studies',
    label: '🏎️ CAF Master Studies (50 Clinical Frameworks - "Ferrari" Engine)',
    path: '/knowledge-assets/comprehensive_caf_studies.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  {
    id: 'ibs-sibo-protocols',
    label: '🦠 IBS/SIBO Protocols (25 Gut-Brain Q&A - Deep Thinking)',
    path: '/knowledge-assets/ibs-sibo-protocols.csv',
    defaultCategory: 'digestive',
    defaultLanguage: 'en',
  },
  {
    id: 'liver-gallbladder-tcm',
    label: '🟢 Liver/Gallbladder TCM (25 Hepatobiliary Q&A - Deep Thinking)',
    path: '/knowledge-assets/liver-gallbladder-tcm.csv',
    defaultCategory: 'hepatology',
    defaultLanguage: 'en',
  },
  {
    id: 'gastric-conditions',
    label: '🍽️ Gastric Conditions (30 Stomach/Esophagus Q&A - Deep Thinking)',
    path: '/knowledge-assets/gastric-conditions.csv',
    defaultCategory: 'digestive',
    defaultLanguage: 'en',
  },
  {
    id: 'vagus-nerve-100qa',
    label: '🧠 Vagus Nerve Q&A (100 Symptoms, Mechanisms, Points & Formulas)',
    path: '/knowledge-assets/vagus_nerve_100_qa.csv',
    defaultCategory: 'neurology',
    defaultLanguage: 'en',
  },
  {
    id: 'neuro-degenerative-tcm-100',
    label: '🧠 Neurodegenerative TCM (Alzheimer\'s/Parkinson\'s - 100 Q&A)',
    path: '/knowledge-assets/neuro-degenerative-tcm-100.csv',
    defaultCategory: 'neurology',
    defaultLanguage: 'en',
  },
  // Dr. Zanfu Clinical Syndromes - Priority #1 for RAG/AI search
  {
    id: 'dr-zanfu-clinic-syndromes',
    label: '🔬 Dr. Zanfu Clinic Syndromes (Trigger Points & Pharmacopeia)',
    path: '/knowledge-assets/dr-zanfu-clinic-syndromes.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  {
    id: 'dr-zanfu-syndromes-qa',
    label: '🔬 Dr. Zanfu Syndromes Q&A (54 Clinical Patterns)',
    path: '/knowledge-assets/dr-zanfu-syndromes-qa.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  // Pulse & Tongue Diagnosis - Priority #2 for RAG/AI search
  {
    id: 'tcm-pulse-tongue-diagnosis-qa',
    label: '🩺 TCM Pulse & Tongue Diagnosis Q&A (86 Diagnostic Patterns)',
    path: '/knowledge-assets/tcm_pulse_tongue_diagnosis_qa.csv',
    defaultCategory: 'tcm_diagnosis',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-stress-biofeedback',
    label: '🧘 TCM Stress & Biofeedback (75 Q&A - Points & Formulas)',
    path: '/knowledge/tcm_stress_biofeedback_75qa.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  // Retreat Assessment - Patient Conversion Tool
  {
    id: 'retreat-assessment-50qa',
    label: '🏕️ Retreat Assessment (50 Q&A - Physical/Emotional/Willingness)',
    path: '/knowledge-assets/retreat-assessment-50qa.csv',
    defaultCategory: 'wellness_sport',
    defaultLanguage: 'en',
  },
  // TCM Herbal Formulas Comprehensive - Updated with 4-Column Format
  {
    id: 'tcm-herbal-formulas-comprehensive',
    label: '🌿 TCM Herbal Formulas Comprehensive (91 Formulas + Q&A + Acupoints + Pharmacopeia)',
    path: '/knowledge-assets/TCM_Herbal_Formulas_Comprehensive.csv',
    defaultCategory: 'tcm_theory',
    defaultLanguage: 'en',
  },
  // Brain Health Across Life Stages
  {
    id: 'brain-health-tcm',
    label: '🧠 Brain Health TCM (100 Q&A - Pediatric/Adult/Geriatric Cognition)',
    path: '/knowledge-assets/brain-health-tcm.csv',
    defaultCategory: 'neurology',
    defaultLanguage: 'en',
  },
  // Oncology - TCM Supportive Care - Updated with 4-Column Format
  {
    id: 'tcm-oncology-comprehensive',
    label: '🎗️ TCM Oncology Comprehensive (52 Formulas + Q&A + Acupoints + Pharmacopeia)',
    path: '/knowledge-assets/TCM_Oncology_Comprehensive_All_Ages.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  // Pediatric Acupuncture Safety Guide
  {
    id: 'pediatric-acupuncture-safety',
    label: '👶 Pediatric Acupuncture Safety Guide (18 Points + Age Recommendations + Warnings)',
    path: '/knowledge-assets/Pediatric_Acupuncture_Points_Safety_Guide.csv',
    defaultCategory: 'clinical_protocols',
    defaultLanguage: 'en',
  },
  // TCM Emotional Processing Q&A
  {
    id: 'tcm-grief-qa',
    label: '💔 TCM Grief Q&A (21 Q&A + Acupoints + Pharmacopeia)',
    path: '/knowledge-assets/tcm-grief-qa.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-grief-symptom-mapping',
    label: '💔 TCM Grief Symptom-Tongue-Pulse Mapping (33 Symptoms + Patterns)',
    path: '/knowledge-assets/TCM_Grief_Symptom_Tongue_Pulse_Mapping.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-western-symptom-translation',
    label: '🔄 TCM Western-to-TCM Symptom Translation Guide (30 Translations + Chinese Terms)',
    path: '/knowledge-assets/TCM_Western_Symptom_Translation_Guide.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-trauma-qa',
    label: '🛡️ TCM Trauma Q&A (22 Q&A - Kidney-Heart, Zhi, Po, Formulas)',
    path: '/knowledge-assets/tcm-trauma-qa.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-fear-qa',
    label: '😰 TCM Fear Q&A (22 Q&A - Kidney, Zhi, Water Element, Formulas)',
    path: '/knowledge-assets/tcm-fear-qa.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
  {
    id: 'tcm-anger-qa',
    label: '🔥 TCM Anger Q&A (22 Q&A - Liver, Hun, Wood Element, Formulas)',
    path: '/knowledge-assets/tcm-anger-qa.csv',
    defaultCategory: 'anxiety_mental',
    defaultLanguage: 'en',
  },
] as const;

// Emotional wellness assets for bulk import
const EMOTIONAL_WELLNESS_ASSETS = [
  'tcm-grief-qa',
  'tcm-trauma-qa', 
  'tcm-fear-qa',
  'tcm-anger-qa',
] as const;

type QueueItemStatus = 'pending' | 'importing' | 'done' | 'error';

interface QueueItem {
  id: string;
  file: File;
  category: string;
  language: string;
  parsed?: { headers: string[]; rows: Record<string, string>[] };
  status: QueueItemStatus;
  error?: string;
  chunksCreated?: number;
  alreadyIndexed?: boolean;
  existingDocument?: {
    id: string;
    original_name: string;
    created_at: string;
    indexed_at: string | null;
    status: string;
    row_count: number | null;
  };
}

export default function KnowledgeRegistry() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<LegalReport | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{ translated: number; total: number; errors?: string[] } | null>(null);
  const [translatingDocId, setTranslatingDocId] = useState<string | null>(null);
  const [docTranslationProgress, setDocTranslationProgress] = useState<Record<string, { translated: number; status: 'idle' | 'translating' | 'done' | 'error' }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Built-in asset import (one file at a time)
  const [builtInAssetId, setBuiltInAssetId] = useState<(typeof BUILTIN_ASSETS)[number]['id']>('tongue-diagnosis');
  const [builtInCategory, setBuiltInCategory] = useState<string>(BUILTIN_ASSETS[0].defaultCategory);
  const [builtInLanguage, setBuiltInLanguage] = useState<string>(BUILTIN_ASSETS[0].defaultLanguage);
  const [isImportingBuiltIn, setIsImportingBuiltIn] = useState(false);

  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const queueRef = useRef<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Embedding generation state
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [embeddingProgress, setEmbeddingProgress] = useState<{ processed: number; remaining: number; errors: number } | null>(null);
  const [generatingEmbeddingsDocId, setGeneratingEmbeddingsDocId] = useState<string | null>(null);
  const [docEmbeddingProgress, setDocEmbeddingProgress] = useState<Record<string, { status: 'idle' | 'generating' | 'done' | 'error'; processed?: number }>>({});

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Data fetching hooks
  const { data: documents, isLoading } = useQuery({
    queryKey: ['knowledge-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as KnowledgeDocument[];
    },
    enabled: !!isAdmin, // Only fetch when admin
  });

  const { data: chunkStats, refetch: refetchChunkStats } = useQuery({
    queryKey: ['knowledge-chunks-stats'],
    queryFn: async () => {
      // Get total chunks
      const { count: totalChunks, error: countError } = await supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;
      
      // Get chunks with embeddings
      const { count: chunksWithEmbeddings, error: embError } = await supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true })
        .not('embedding', 'is', null);
      if (embError) throw embError;
      
      return { 
        totalChunks: totalChunks || 0,
        chunksWithEmbeddings: chunksWithEmbeddings || 0,
        chunksWithoutEmbeddings: (totalChunks || 0) - (chunksWithEmbeddings || 0)
      };
    },
    enabled: !!isAdmin,
  });

  // Keep latest queue in a ref so async processing never uses stale state
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Sync isPaused to ref for use in async loop
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // If auth session is missing/expired, route to Auth (admin login)
  useEffect(() => {
    if (!authLoading && !user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?redirect=${redirect}`, { replace: true });
    }
  }, [user, authLoading, navigate, location.pathname, location.search]);

  // ALL CALLBACKS MUST BE BEFORE CONDITIONAL RETURNS
  const updateQueueItem = useCallback((id: string, updates: Partial<QueueItem>) => {
    setQueue(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  // Process one queued file at a time
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (isPausedRef.current) return;

    const pendingItem = queueRef.current.find(item => item.status === 'pending');
    if (!pendingItem) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    updateQueueItem(pendingItem.id, { status: 'importing' });

    try {
      const docPayload = {
        fileName: pendingItem.file.name,
        category: pendingItem.category,
        language: pendingItem.language,
        rows: pendingItem.parsed?.rows || [],
      };

      const { data, error } = await supabase.functions.invoke('import-knowledge', {
        body: { documents: [docPayload] },
      });

      if (error) throw error;

      const result = data?.results?.[0];
      if (result?.success) {
        const alreadyIndexed = Boolean(result?.alreadyIndexed);
        updateQueueItem(pendingItem.id, {
          status: 'done',
          chunksCreated: result.chunksCreated,
          alreadyIndexed,
          existingDocument: result.existingDocument,
        });

        if (alreadyIndexed) {
          toast.info(`Already indexed: ${result.existingDocument?.original_name || pendingItem.file.name}`);
        }
      } else {
        updateQueueItem(pendingItem.id, { status: 'error', error: result?.error || 'Unknown error' });
      }
    } catch (err: any) {
      updateQueueItem(pendingItem.id, { status: 'error', error: err?.message || 'Import failed' });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
    }
  }, [queryClient, updateQueueItem]);

  const importBuiltInAsset = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      toast.error('Please sign in to import knowledge.');
      navigate('/auth');
      return;
    }

    const asset = BUILTIN_ASSETS.find(a => a.id === builtInAssetId);
    if (!asset) {
      toast.error('Unknown built-in file');
      return;
    }

    setIsImportingBuiltIn(true);
    try {
      const res = await fetch(asset.path, { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error(`Failed to load ${asset.label}`);
      }

      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.rows.length === 0) {
        throw new Error('CSV has no data rows');
      }

      const file = new File([text], asset.label, { type: 'text/csv' });
      const item: QueueItem = {
        id: crypto.randomUUID(),
        file,
        category: builtInCategory || asset.defaultCategory,
        language: builtInLanguage || asset.defaultLanguage,
        parsed,
        status: 'pending',
      };

      isProcessingRef.current = false;
      setIsProcessing(false);
      isPausedRef.current = false;
      setIsPaused(false);
      queueRef.current = [item];
      setQueue([item]);

      setTimeout(() => processQueue(), 0);
      toast.success(`Import started: ${asset.label}`);
    } catch (err: any) {
      console.error('Built-in import error:', err);
      toast.error(err?.message || 'Failed to import built-in file');
    } finally {
      setIsImportingBuiltIn(false);
    }
  }, [authLoading, user, navigate, builtInAssetId, builtInCategory, builtInLanguage, processQueue]);

  // Bulk import all emotional wellness assets
  const [isImportingEmotional, setIsImportingEmotional] = useState(false);
  
  const importEmotionalWellnessAssets = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      toast.error('Please sign in to import knowledge.');
      navigate('/auth');
      return;
    }

    setIsImportingEmotional(true);
    const emotionalAssets = BUILTIN_ASSETS.filter(a => EMOTIONAL_WELLNESS_ASSETS.includes(a.id as any));
    
    if (emotionalAssets.length === 0) {
      toast.error('No emotional wellness assets found');
      setIsImportingEmotional(false);
      return;
    }

    try {
      const queueItems: QueueItem[] = [];
      
      for (const asset of emotionalAssets) {
        const res = await fetch(asset.path, { cache: 'no-cache' });
        if (!res.ok) {
          console.error(`Failed to load ${asset.label}`);
          continue;
        }

        const text = await res.text();
        const parsed = parseCSV(text);
        if (parsed.rows.length === 0) {
          console.error(`CSV ${asset.label} has no data rows`);
          continue;
        }

        const file = new File([text], asset.label, { type: 'text/csv' });
        queueItems.push({
          id: crypto.randomUUID(),
          file,
          category: asset.defaultCategory,
          language: asset.defaultLanguage,
          parsed,
          status: 'pending',
        });
      }

      if (queueItems.length === 0) {
        toast.error('Failed to load emotional wellness assets');
        return;
      }

      isProcessingRef.current = false;
      setIsProcessing(false);
      isPausedRef.current = false;
      setIsPaused(false);
      queueRef.current = queueItems;
      setQueue(queueItems);

      setTimeout(() => processQueue(), 0);
      toast.success(`Bulk import started: ${queueItems.length} emotional wellness assets (Grief, Trauma, Fear, Anger)`);
    } catch (err: any) {
      console.error('Bulk import error:', err);
      toast.error(err?.message || 'Failed to import emotional wellness assets');
    } finally {
      setIsImportingEmotional(false);
    }
  }, [authLoading, user, navigate, processQueue]);

  // Effect to keep processing when queue changes and not paused
  useEffect(() => {
    if (!isProcessing && !isPaused && queue.some(item => item.status === 'pending')) {
      processQueue();
    }
  }, [queue, isProcessing, isPaused, processQueue]);

  // Admin access check - show loading while checking, or access denied if not admin
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              This page is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-legal-report');
      if (error) throw error;
      setReport(data);
      toast.success('Legal report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
    setGeneratingReport(false);
    }
  };

  const translateAllToHebrew = async () => {
    setIsTranslating(true);
    setTranslationProgress(null);
    
    try {
      // Get all unique document IDs
      const docIds = documents?.map(d => d.id) || [];
      
      if (docIds.length === 0) {
        toast.error('No documents to translate');
        setIsTranslating(false);
        return;
      }

      let totalTranslated = 0;
      let totalToTranslate = 0;
      const allErrors: string[] = [];

      // Process each document
      for (const docId of docIds) {
        toast.info(`Translating document ${docIds.indexOf(docId) + 1}/${docIds.length}...`);
        
        const { data, error } = await supabase.functions.invoke('translate-knowledge', {
          body: { targetLanguage: 'he', documentId: docId },
        });

        if (error) {
          console.error(`Error translating document ${docId}:`, error);
          allErrors.push(`Document ${docId}: ${error.message}`);
          continue;
        }

        totalTranslated += data?.translated || 0;
        totalToTranslate += data?.total || 0;
        if (data?.errors) {
          allErrors.push(...data.errors);
        }

        setTranslationProgress({
          translated: totalTranslated,
          total: totalToTranslate,
          errors: allErrors.length > 0 ? allErrors : undefined,
        });
      }

      if (totalTranslated > 0) {
        toast.success(`Translated ${totalTranslated} chunks to Hebrew`);
      } else {
        toast.info('No new chunks to translate (all already have Hebrew versions)');
      }
      
      queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate documents');
    } finally {
      setIsTranslating(false);
    }
  };

  // Per-document translation
  const translateSingleDocument = async (docId: string, docName: string, force: boolean = false) => {
    if (translatingDocId) {
      toast.error('A translation is already in progress');
      return;
    }

    setTranslatingDocId(docId);
    setDocTranslationProgress(prev => ({
      ...prev,
      [docId]: { translated: 0, status: 'translating' }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('translate-knowledge', {
        body: { targetLanguage: 'he', documentId: docId, force },
      });

      if (error) {
        console.error(`Error translating document ${docId}:`, error);
        setDocTranslationProgress(prev => ({
          ...prev,
          [docId]: { translated: 0, status: 'error' }
        }));
        toast.error(`Failed to translate ${docName}: ${error.message}`);
        return;
      }

      const translated = data?.translated || 0;
      setDocTranslationProgress(prev => ({
        ...prev,
        [docId]: { translated, status: 'done' }
      }));

      if (translated > 0) {
        toast.success(`${force ? 'Re-translated' : 'Translated'} ${translated} chunks from "${docName}" to Hebrew`);
      } else {
        toast.info(`No new chunks to translate in "${docName}" (already translated)`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['knowledge-chunks-stats'] });
    } catch (error) {
      console.error('Translation error:', error);
      setDocTranslationProgress(prev => ({
        ...prev,
        [docId]: { translated: 0, status: 'error' }
      }));
      toast.error(`Failed to translate ${docName}`);
    } finally {
      setTranslatingDocId(null);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const reportText = `
${report.reportTitle}
${'='.repeat(80)}
Report Version: ${report.reportVersion || '1.0'}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Generated By: ${report.generatedBy}

SUMMARY
-------
Total Documents: ${report.summary.totalDocuments}
Indexed Documents: ${report.summary.totalIndexedDocuments}
Total Knowledge Entries: ${report.summary.totalKnowledgeEntries}
Data Sources: ${report.summary.dataSourcesCertified}
External Sources: ${report.summary.externalDataSources}
Public Domain: ${report.summary.publicDomainContent}

${report.lineItemSummary || ''}

DETAILED DOCUMENT MANIFEST
--------------------------
${report.documentManifest.map((doc: any) => `
#${String(doc.lineNumber || 0).padStart(2, '0')} ${doc.fileName}
    Category: ${doc.category || 'N/A'}
    Language: ${doc.language || 'N/A'}
    Rows: ${doc.rowCount || 0}
    Chunks Indexed: ${doc.chunksIndexed}
    File Hash: ${doc.fileHash}
    Status: ${doc.status}
    Uploaded: ${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A'}
    Indexed: ${doc.indexedAt ? new Date(doc.indexedAt).toLocaleString() : 'N/A'}
`).join('\n')}

TECHNICAL CERTIFICATION
-----------------------
System: ${report.technicalCertification?.systemArchitecture || 'RAG System'}
AI Model: ${report.technicalCertification?.aiModel || 'N/A'}
Data Isolation: ${report.technicalCertification?.dataIsolation || 'N/A'}
Source Tracing: ${report.technicalCertification?.sourceTracing || 'N/A'}

LEGAL DECLARATION
-----------------
${report.legalDeclaration.declarationText}

${report.verificationInstructions || ''}
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TCM_Knowledge_Base_Legal_Report_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 1) {
      toast.error('Please import 1 CSV file at a time.');
    }

    const file = files[0];

    if (isProcessingRef.current) {
      toast.error('An import is already running. Please wait for it to finish.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast.error(`${file.name} is not a CSV file`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const text = await file.text();
    const parsed = parseCSV(text);

    if (parsed.rows.length === 0) {
      toast.error(`${file.name} has no data rows`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Auto-detect category
    let category = 'other';
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('anxiety') || lowerName.includes('mental') || lowerName.includes('nervousness')) {
      category = 'anxiety_mental';
    } else if (lowerName.includes('wellness') || lowerName.includes('sport')) {
      category = 'wellness_sport';
    } else if (lowerName.includes('tcm')) {
      category = 'tcm_theory';
    } else if (lowerName.includes('therapist')) {
      category = 'therapist_training';
    } else if (lowerName.includes('general') || lowerName.includes('health')) {
      category = 'general_health';
    } else if (lowerName.includes('pain') || lowerName.includes('ortho')) {
      category = 'pain_ortho';
    } else if (lowerName.includes('women') || lowerName.includes('pregnan') || lowerName.includes('fertility')) {
      category = 'womens_health';
    } else if (lowerName.includes('pediatric') || lowerName.includes('child')) {
      category = 'pediatrics';
    } else if (lowerName.includes('digest') || lowerName.includes('stomach') || lowerName.includes('ibs')) {
      category = 'digestive';
    }

    let language = 'en';
    if (lowerName.includes('hebrew') || lowerName.includes('_he')) {
      language = 'he';
    }

    const newItem: QueueItem = {
      id: crypto.randomUUID(),
      file,
      category,
      language,
      parsed,
      status: 'pending',
    };

    // Enforce one-at-a-time: replace the queue with this single file
    isProcessingRef.current = false;
    setIsProcessing(false);
    isPausedRef.current = false;
    setIsPaused(false);
    queueRef.current = [newItem];
    setQueue([newItem]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeQueueItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    isProcessingRef.current = false;
    setQueue([]);
    setIsProcessing(false);
    setIsPaused(false);
  };

  const retryFailed = () => {
    setQueue(prev => prev.map(item => item.status === 'error' ? { ...item, status: 'pending' as QueueItemStatus, error: undefined } : item));
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
    } else {
      // Pause
      setIsPaused(true);
    }
  };

  const startImport = () => {
    if (queue.length === 0) return;
    setIsPaused(false);
    processQueue();
  };

  // Generate embeddings for all chunks that don't have them
  const generateEmbeddings = async (documentId?: string) => {
    setIsGeneratingEmbeddings(true);
    setEmbeddingProgress(null);
    
    try {
      let totalProcessed = 0;
      let totalErrors = 0;
      let remaining = 1; // Start with 1 to enter the loop
      
      // Process in batches until no more chunks remain
      while (remaining > 0) {
        const { data, error } = await supabase.functions.invoke('generate-embeddings', {
          body: { 
            batchSize: 50,
            documentId: documentId || undefined
          }
        });
        
        if (error) {
          console.error('Embedding generation error:', error);
          toast.error(`Error generating embeddings: ${error.message}`);
          totalErrors++;
          break;
        }
        
        if (data) {
          totalProcessed += data.processed || 0;
          totalErrors += data.errors || 0;
          remaining = data.remaining || 0;
          
          setEmbeddingProgress({
            processed: totalProcessed,
            remaining: remaining,
            errors: totalErrors
          });
          
          // If no chunks were processed and none remain, we're done
          if (data.processed === 0 && remaining === 0) {
            break;
          }
        }
      }
      
      toast.success(`Embeddings generated: ${totalProcessed} chunks processed`);
      refetchChunkStats();
      
    } catch (err) {
      console.error('Embedding generation failed:', err);
      toast.error('Failed to generate embeddings');
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  // Generate embeddings for a single document
  const generateSingleDocEmbeddings = async (docId: string, docName: string) => {
    if (generatingEmbeddingsDocId) {
      toast.error('Embedding generation already in progress');
      return;
    }

    setGeneratingEmbeddingsDocId(docId);
    setDocEmbeddingProgress(prev => ({
      ...prev,
      [docId]: { status: 'generating', processed: 0 }
    }));

    try {
      let totalProcessed = 0;
      let remaining = 1;

      while (remaining > 0) {
        const { data, error } = await supabase.functions.invoke('generate-embeddings', {
          body: { 
            batchSize: 50,
            documentId: docId
          }
        });

        if (error) {
          console.error(`Embedding error for ${docId}:`, error);
          setDocEmbeddingProgress(prev => ({
            ...prev,
            [docId]: { status: 'error', processed: totalProcessed }
          }));
          toast.error(`Failed to generate embeddings for ${docName}`);
          return;
        }

        if (data) {
          totalProcessed += data.processed || 0;
          remaining = data.remaining || 0;

          setDocEmbeddingProgress(prev => ({
            ...prev,
            [docId]: { status: 'generating', processed: totalProcessed }
          }));

          if (data.processed === 0 && remaining === 0) {
            break;
          }
        }
      }

      setDocEmbeddingProgress(prev => ({
        ...prev,
        [docId]: { status: 'done', processed: totalProcessed }
      }));

      if (totalProcessed > 0) {
        toast.success(`Generated ${totalProcessed} embeddings for "${docName}"`);
      } else {
        toast.info(`All chunks in "${docName}" already have embeddings`);
      }

      refetchChunkStats();
    } catch (err) {
      console.error('Embedding generation failed:', err);
      setDocEmbeddingProgress(prev => ({
        ...prev,
        [docId]: { status: 'error' }
      }));
      toast.error(`Failed to generate embeddings for ${docName}`);
    } finally {
      setGeneratingEmbeddingsDocId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Indexed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQueueStatusBadge = (item: QueueItem) => {
    switch (item.status) {
      case 'done':
        if (item.alreadyIndexed) {
          return (
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" /> Already indexed
            </Badge>
          );
        }
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Done ({item.chunksCreated} chunks)
          </Badge>
        );
      case 'importing':
        return <Badge className="bg-blue-500 animate-pulse"><Upload className="w-3 h-3 mr-1" /> Importing...</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {item.error?.slice(0, 30)}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const indexedCount = documents?.filter(d => d.status === 'indexed').length || 0;
  const totalDocs = documents?.length || 0;
  const queueDone = queue.filter(q => q.status === 'done').length;
  const queueTotal = queue.length;
  const queueProgress = queueTotal > 0 ? Math.round((queueDone / queueTotal) * 100) : 0;
  const hasPending = queue.some(q => q.status === 'pending');
  const hasErrors = queue.some(q => q.status === 'error');

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header with Navigation and Language Switcher */}
      <div className="flex items-center justify-between mb-4">
        {/* Animated Back to Dashboard */}
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 text-sm font-medium py-1.5 px-3 rounded-lg
                     bg-gradient-to-r from-jade-600/10 to-jade-500/5
                     text-jade-700 dark:text-jade-300
                     hover:from-jade-600/20 hover:to-jade-500/10
                     transition-all duration-300 hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4 animate-pulse-arrow" />
          <span className="animate-bounce-subtle">🏠</span>
          Dashboard
        </Link>
        <LanguageSwitcher variant="ghost" isScrolled={true} />
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="w-8 h-8" />
          Knowledge Document Registry
        </h1>
        <p className="text-muted-foreground">
          Track and verify all proprietary materials in Dr. Sapir's TCM Knowledge Base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Indexed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{indexedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{chunkStats?.totalChunks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Embeddings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-jade-600">
              {chunkStats?.chunksWithEmbeddings || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {chunkStats?.totalChunks || 0}
              </span>
            </div>
            {(chunkStats?.chunksWithoutEmbeddings || 0) > 0 && (
              <div className="text-xs text-amber-600 mt-1">
                {chunkStats?.chunksWithoutEmbeddings} pending
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">Dr. Sapir ONLY</div>
          </CardContent>
        </Card>
      </div>

      {/* Embedding Generation Section */}
      {(chunkStats?.chunksWithoutEmbeddings || 0) > 0 && (
        <Card className="mb-8 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              Embeddings Required for RAG Search
            </CardTitle>
            <CardDescription>
              {chunkStats?.chunksWithoutEmbeddings} knowledge entries need embeddings generated for semantic search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => generateEmbeddings()}
                disabled={isGeneratingEmbeddings}
                className="bg-jade-600 hover:bg-jade-700"
              >
                {isGeneratingEmbeddings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate All Embeddings
                  </>
                )}
              </Button>
              {embeddingProgress && (
                <div className="text-sm text-muted-foreground">
                  Processed: {embeddingProgress.processed} | Remaining: {embeddingProgress.remaining}
                  {embeddingProgress.errors > 0 && (
                    <span className="text-red-500 ml-2">Errors: {embeddingProgress.errors}</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Golden Knowledge Base Import - For pre-processed ZIP files */}
      <div className="mb-8">
        <GoldenKnowledgeImport />
      </div>

      {/* Import Queue Section */}
      <Card className="mb-8 border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Queue
          </CardTitle>
          <CardDescription>
            Add CSV files to the queue. Files are imported one at a time with pause/resume support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium mb-3">Built-in knowledge files (import 1 at a time)</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
                <div className="md:col-span-2">
                  <Select
                    value={builtInAssetId}
                    onValueChange={(v) => {
                      const asset = BUILTIN_ASSETS.find(a => a.id === v);
                      setBuiltInAssetId(v as (typeof BUILTIN_ASSETS)[number]['id']);
                      if (asset) {
                        setBuiltInCategory(asset.defaultCategory);
                        setBuiltInLanguage(asset.defaultLanguage);
                      }
                    }}
                    disabled={isProcessing || isImportingBuiltIn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a built-in file" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILTIN_ASSETS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={builtInCategory}
                    onValueChange={setBuiltInCategory}
                    disabled={isProcessing || isImportingBuiltIn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={builtInLanguage}
                    onValueChange={setBuiltInLanguage}
                    disabled={isProcessing || isImportingBuiltIn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">EN</SelectItem>
                      <SelectItem value="he">HE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <Button
                  onClick={importEmotionalWellnessAssets}
                  disabled={isProcessing || isImportingBuiltIn || isImportingEmotional}
                  variant="outline"
                  className="gap-1 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                >
                  <Heart className="w-4 h-4" />
                  {isImportingEmotional ? 'Importing…' : 'Bulk Import Emotional Q&A (4)'}
                </Button>
                <Button
                  onClick={importBuiltInAsset}
                  disabled={isProcessing || isImportingBuiltIn || isImportingEmotional}
                  className="gap-1"
                >
                  <Upload className="w-4 h-4" />
                  {isImportingBuiltIn ? 'Importing…' : 'Import Selected'}
                </Button>
              </div>
            </div>

            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Select 1 CSV file. It will be queued and processed immediately.
              </p>
            </div>

            {queue.length > 0 && (
              <div className="space-y-3">
                {/* Queue Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium">Queue: {queueDone}/{queueTotal} files</span>
                  <Progress value={queueProgress} className="w-48" />
                  <div className="flex gap-2 ml-auto">
                    {!isProcessing && hasPending && (
                      <Button onClick={startImport} size="sm" className="gap-1">
                        <Play className="w-4 h-4" /> Start
                      </Button>
                    )}
                    {isProcessing && (
                      <Button onClick={togglePause} size="sm" variant={isPaused ? 'default' : 'secondary'} className="gap-1">
                        {isPaused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
                      </Button>
                    )}
                    {hasErrors && (
                      <Button onClick={retryFailed} size="sm" variant="outline" className="gap-1">
                        <RotateCcw className="w-4 h-4" /> Retry Failed
                      </Button>
                    )}
                    <Button onClick={clearQueue} size="sm" variant="ghost" className="gap-1">
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </div>
                </div>

                {/* Queue Items */}
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {queue.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.parsed?.rows.length || 0} rows
                        </p>
                      </div>
                      <Select
                        value={item.category}
                        onValueChange={(v) => updateQueueItem(item.id, { category: v })}
                        disabled={item.status !== 'pending'}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={item.language}
                        onValueChange={(v) => updateQueueItem(item.id, { language: v })}
                        disabled={item.status !== 'pending'}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">EN</SelectItem>
                          <SelectItem value="he">HE</SelectItem>
                        </SelectContent>
                      </Select>
                      {getQueueStatusBadge(item)}
                      {item.status === 'pending' && (
                        <Button variant="ghost" size="icon" onClick={() => removeQueueItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Assets Export Section */}
      <Card className="mb-8 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            Knowledge Assets Table Export
          </CardTitle>
          <CardDescription>
            Export complete list of all {BUILTIN_ASSETS.length} knowledge assets for documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                // Define which CSVs have trigger points (based on point-figure-mapping.ts analysis)
                const triggerPointAssets = new Set([
                  'acupoints_master.csv', 'acupoint-reference-50.csv', 'msk-protocols.csv', 
                  'musculoskeletal-orthopedic.csv', 'pattern-differentiation-protocols.csv',
                  'chronic-pain-management.csv', 'womens-health-tcm.csv', 'fertility-protocols.csv',
                  'pregnancy-trimester-guide.csv', 'clinical-scenarios-100.csv', 'pulse-diagnosis.csv',
                  'tongue-diagnosis.csv', 'mental-health-tcm.csv', 'work-stress-burnout.csv',
                  'sport-performance-recovery.csv', 'pediatric-acupuncture.csv', 'digestive-disorders.csv',
                  'immune-resilience.csv', 'nine-constitutions-qa.csv', 'chief-complaints-tcm.csv',
                  'diagnostics-professional.csv', 'QA_Professional_Corrected_4Columns.csv',
                  'Treatment_Planning_Protocols_Professional_100plus.csv', 'tcm-newborn-qa.csv',
                  'tcm-children-7-13-qa.csv', 'tcm-adults-18-50-qa.csv', 'tcm-elderly-70-120-qa.csv',
                  'age-prompts-adults-18-50.csv', 'age-prompts-adults-50-70.csv', 'elderly-lifestyle-recommendations.csv',
                  'tcm-teenage-mental-health-qa.csv', 'four-examinations-qa.csv', 'tcm-pattern-differentiation-100qa.csv',
                  'tcm-skin-renewal-100qa.csv', 'tcm-dermatology-comprehensive.csv', 'comprehensive_caf_studies.csv',
                  'ibs-sibo-protocols.csv', 'liver-gallbladder-tcm.csv', 'gastric-conditions.csv',
                  'vagus_nerve_100_qa.csv', 'neuro-degenerative-tcm-100.csv', 'dr-zanfu-clinic-syndromes.csv',
                  'dr-zanfu-syndromes-qa.csv', 'tcm_pulse_tongue_diagnosis_qa.csv', 'tcm_stress_biofeedback_75qa.csv'
                ]);

                // Build CSV rows
                const csvRows = [
                  ['#', 'Category', 'Label', 'CSV Filename', 'Has Trigger Points', 'RAG Priority'].join(',')
                ];

                BUILTIN_ASSETS.forEach((asset, idx) => {
                  const filename = asset.path.split('/').pop() || '';
                  const hasTrigger = triggerPointAssets.has(filename) ? 'Yes' : 'No';
                  let priority = '-';
                  if (asset.id.includes('dr-zanfu')) priority = '#1 (Dr. Zanfu)';
                  else if (asset.id === 'tcm-pulse-tongue-diagnosis-qa') priority = '#2 (Pulse/Tongue)';
                  
                  // Escape fields with commas
                  const escapeField = (field: string) => field.includes(',') ? `"${field}"` : field;
                  
                  csvRows.push([
                    String(idx + 1),
                    escapeField(asset.defaultCategory.replace(/_/g, ' ')),
                    escapeField(asset.label),
                    escapeField(filename),
                    hasTrigger,
                    priority
                  ].join(','));
                });

                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `knowledge-assets-table-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success('Knowledge assets table exported successfully!');
              }}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Export Assets Table (CSV)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Includes: Category, Label, Filename, Trigger Points status, RAG Priority
          </p>
        </CardContent>
      </Card>

      {/* Legal Report Section */}
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Legal Compliance Report
          </CardTitle>
          <CardDescription>
            Generate a certified report for legal verification of data provenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={generateReport}
              disabled={generatingReport}
              className="flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {generatingReport ? 'Generating...' : 'Generate Legal Report'}
            </Button>

            {report && (
              <Button variant="outline" onClick={downloadReport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            )}
          </div>

          {report && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Report Preview</h4>
              <div className="text-sm space-y-2">
                <p><strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
                <p><strong>Documents Certified:</strong> {report.summary.totalDocuments}</p>
                <p><strong>Knowledge Entries:</strong> {report.summary.totalKnowledgeEntries}</p>
                <p className="text-green-600 font-medium">✓ No external/public domain data sources</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation Section */}
      <Card className="mb-8 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-600" />
            Hebrew Translation
          </CardTitle>
          <CardDescription>
            Translate all English knowledge chunks to Hebrew for native Hebrew RAG search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Button
                onClick={translateAllToHebrew}
                disabled={isTranslating || !documents || documents.length === 0}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Languages className="w-4 h-4" />
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  'Translate All to Hebrew'
                )}
              </Button>
              {isTranslating && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  This may take several minutes...
                </span>
              )}
            </div>

            {translationProgress && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    Translated <strong>{translationProgress.translated}</strong> of{' '}
                    <strong>{translationProgress.total}</strong> chunks
                  </span>
                </div>
                <Progress 
                  value={translationProgress.total > 0 
                    ? (translationProgress.translated / translationProgress.total) * 100 
                    : 0
                  } 
                  className="h-2"
                />
                {translationProgress.errors && translationProgress.errors.length > 0 && (
                  <div className="mt-2 text-sm text-destructive">
                    <p className="font-medium">Errors ({translationProgress.errors.length}):</p>
                    <ul className="list-disc list-inside max-h-24 overflow-y-auto">
                      {translationProgress.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {translationProgress.errors.length > 5 && (
                        <li>...and {translationProgress.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Manifest
          </CardTitle>
          <CardDescription>
            All proprietary documents with cryptographic verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents indexed yet. Upload your knowledge base files to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Hash (SHA-256)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Indexed At</TableHead>
                  <TableHead>Embeddings</TableHead>
                  <TableHead>Translate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.map((doc) => {
                  const docTransStatus = docTranslationProgress[doc.id];
                  const isTranslatingThis = translatingDocId === doc.id;
                  const isEnglishDoc = doc.language === 'en' || !doc.language;
                  
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.original_name}</TableCell>
                      <TableCell>{doc.category || '-'}</TableCell>
                      <TableCell>{doc.language?.toUpperCase() || '-'}</TableCell>
                      <TableCell>{doc.row_count || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {doc.file_hash.substring(0, 16)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        {doc.indexed_at ? format(new Date(doc.indexed_at), 'MMM d, yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const docEmbStatus = docEmbeddingProgress[doc.id];
                          const isGeneratingThis = generatingEmbeddingsDocId === doc.id;
                          
                          return (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateSingleDocEmbeddings(doc.id, doc.original_name)}
                                disabled={!!generatingEmbeddingsDocId || isGeneratingEmbeddings}
                                className="gap-1 h-8"
                                title="Generate embeddings for this document"
                              >
                                {isGeneratingThis ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span className="text-xs">
                                      {docEmbStatus?.processed || 0}...
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-xs">Embed</span>
                                  </>
                                )}
                              </Button>
                              {docEmbStatus?.status === 'done' && (
                                <Badge variant="secondary" className="text-xs bg-jade-100 text-jade-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {docEmbStatus.processed}
                                </Badge>
                              )}
                              {docEmbStatus?.status === 'error' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {isEnglishDoc ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => translateSingleDocument(doc.id, doc.original_name, false)}
                              disabled={!!translatingDocId || isTranslating}
                              className="gap-1 h-8"
                              title="Translate new chunks to Hebrew"
                            >
                              {isTranslatingThis ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-xs">Translating...</span>
                                </>
                              ) : (
                                <>
                                  <Languages className="w-3 h-3" />
                                  <span className="text-xs">→ HE</span>
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => translateSingleDocument(doc.id, doc.original_name, true)}
                              disabled={!!translatingDocId || isTranslating}
                              className="gap-1 h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Delete existing Hebrew translations and re-translate"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span className="text-xs">Reset</span>
                            </Button>
                            {docTransStatus?.status === 'done' && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {docTransStatus.translated}
                              </Badge>
                            )}
                            {docTransStatus?.status === 'error' && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
