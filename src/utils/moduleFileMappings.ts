/**
 * Comprehensive file mappings for each module
 * Maps module IDs to their actual source file paths
 */

export interface ModuleFileMapping {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  category: string;
  files: {
    pages: string[];
    components: string[];
    hooks: string[];
    utils: string[];
    contexts: string[];
    data: string[];
    config: string[];
  };
  databaseTables: string[];
  dependencies: string[];
}

export const MODULE_FILE_MAPPINGS: ModuleFileMapping[] = [
  {
    id: 'whole-gate',
    name: 'Whole Gate Module',
    nameHe: 'מודול שער מלא',
    description: 'Complete gate entry and navigation module',
    category: 'core',
    files: {
      pages: ['src/pages/Gate.tsx', 'src/pages/Index.tsx'],
      components: ['src/components/gate/GateHeader.tsx', 'src/components/ui/SplashScreen.tsx'],
      hooks: ['src/hooks/useAuth.ts', 'src/hooks/useTier.ts'],
      utils: [],
      contexts: ['src/contexts/LanguageContext.tsx'],
      data: [],
      config: []
    },
    databaseTables: ['access_passwords', 'access_logs'],
    dependencies: ['react-router-dom', 'framer-motion']
  },
  {
    id: 'pulse-gallery',
    name: 'Pulse Gallery',
    nameHe: 'גלריית דופק',
    description: 'Pulse diagnosis image gallery and references',
    category: 'clinical',
    files: {
      pages: ['src/pages/PulseGallery.tsx'],
      components: [
        'src/components/pulse/PulseGalleryModule.tsx',
        'src/components/pulse/PulseGallerySheet.tsx',
        'src/components/pulse/PulseQuickReference.tsx'
      ],
      hooks: ['src/hooks/useClinicalNexus.ts'],
      utils: [],
      contexts: [],
      data: ['src/data/pulse-diagnosis-data.ts'],
      config: []
    },
    databaseTables: [],
    dependencies: ['framer-motion', 'lucide-react']
  },
  {
    id: 'video-session',
    name: 'Video Session',
    nameHe: 'פגישת וידאו',
    description: 'Video session recording and management',
    category: 'crm',
    files: {
      pages: ['src/pages/VideoSession.tsx'],
      components: [
        'src/components/video/VideoSessionPanel.tsx',
        'src/components/video/VideoSessionHeaderBoxes.tsx',
        'src/components/video/VideoRecorder.tsx',
        'src/components/video/SessionTimer.tsx'
      ],
      hooks: [
        'src/hooks/useClinicalSession.ts',
        'src/hooks/useSessionPersistence.ts',
        'src/hooks/useSessionPhase.ts',
        'src/hooks/useSessionWorkflow.ts',
        'src/hooks/useSessionSummary.ts',
        'src/hooks/useSessionBrief.ts'
      ],
      utils: [],
      contexts: [
        'src/contexts/SessionTimerContext.tsx',
        'src/contexts/SessionLockContext.tsx',
        'src/contexts/GlobalSessionContext.tsx'
      ],
      data: [],
      config: ['src/config/sessionAssets.ts']
    },
    databaseTables: ['video_sessions', 'voice_recordings', 'session_reports'],
    dependencies: ['@elevenlabs/react', 'framer-motion']
  },
  {
    id: 'contact',
    name: 'Contact Module',
    nameHe: 'מודול יצירת קשר',
    description: 'Contact forms and communication',
    category: 'core',
    files: {
      pages: ['src/pages/Contact.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['page_feedback'],
    dependencies: ['react-hook-form', 'zod']
  },
  {
    id: 'retreat-quiz',
    name: 'Retreat Quiz',
    nameHe: 'שאלון ריטריט',
    description: 'Retreat assessment questionnaire',
    category: 'assessment',
    files: {
      pages: ['src/pages/RetreatQuiz.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['retreat_quiz_results'],
    dependencies: ['framer-motion']
  },
  {
    id: 'invite',
    name: 'Professional Invite',
    nameHe: 'הזמנה מקצועית',
    description: 'Professional invitation system',
    category: 'core',
    files: {
      pages: ['src/pages/ProfessionalInvite.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['therapist_registrations'],
    dependencies: ['qrcode.react']
  },
  {
    id: 'caf-clinical-browser',
    name: 'CAF Clinical Browser',
    nameHe: 'דפדפן קליני CAF',
    description: 'Clinical assessment framework browser',
    category: 'clinical',
    files: {
      pages: ['src/pages/CAFBrowser.tsx'],
      components: [
        'src/components/caf/CAFStudyCard.tsx',
        'src/components/caf/CAFFilters.tsx'
      ],
      hooks: [],
      utils: ['src/utils/cafStudiesExport.ts'],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['caf_master_studies', 'caf_study_acupoints'],
    dependencies: ['@tanstack/react-query']
  },
  {
    id: 'vitality-longevity',
    name: 'Vitality & Longevity Assessment',
    nameHe: 'הערכת חיוניות ואריכות ימים',
    description: 'Comprehensive vitality assessment questionnaire',
    category: 'assessment',
    files: {
      pages: ['src/pages/VitalityLongevityQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'patient-questionnaire',
    name: 'Patient Questionnaire',
    nameHe: 'שאלון מטופל',
    description: 'General patient intake questionnaire',
    category: 'assessment',
    files: {
      pages: ['src/pages/PatientQuestionnaire.tsx', 'src/pages/QuestionnaireHub.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments', 'patients'],
    dependencies: ['react-hook-form']
  },
  {
    id: 'admin',
    name: 'Admin Module',
    nameHe: 'מודול ניהול',
    description: 'Administration and management tools',
    category: 'admin',
    files: {
      pages: [
        'src/pages/Admin.tsx',
        'src/pages/AdminFeedback.tsx',
        'src/pages/AdminDisclaimers.tsx',
        'src/pages/AdminLegalAudit.tsx',
        'src/pages/AdminPasswordGenerator.tsx'
      ],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['user_roles', 'therapist_disclaimers', 'access_passwords', 'bug_reports'],
    dependencies: ['@tanstack/react-query']
  },
  {
    id: 'encyclopedia',
    name: 'Encyclopedia',
    nameHe: 'אנציקלופדיה',
    description: 'TCM knowledge encyclopedia',
    category: 'knowledge',
    files: {
      pages: ['src/pages/EncyclopediaLanding.tsx'],
      components: [
        'src/components/encyclopedia/EncyclopediaSearch.tsx',
        'src/components/encyclopedia/EncyclopediaCategories.tsx'
      ],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['acupuncture_points', 'herbs', 'conditions'],
    dependencies: ['@tanstack/react-query', 'lucide-react']
  },
  {
    id: 'internal-climate',
    name: 'Internal Climate Control',
    nameHe: 'שליטה באקלים פנימי',
    description: 'Internal climate assessment questionnaire',
    category: 'assessment',
    files: {
      pages: ['src/pages/InternalClimateQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'balance-strengthening',
    name: 'Balance & Strengthening',
    nameHe: 'איזון וחיזוק',
    description: 'Balance and strengthening assessment',
    category: 'assessment',
    files: {
      pages: ['src/pages/BalanceStrengthAdultQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'golden-age-vitality',
    name: 'Golden Age Vitality',
    nameHe: 'חיוניות גיל הזהב',
    description: 'Senior vitality assessment questionnaire',
    category: 'assessment',
    files: {
      pages: ['src/pages/GoldenAgeVitalityQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'longevity-dignity',
    name: 'Longevity & Dignity',
    nameHe: 'אריכות ימים וכבוד',
    description: 'Longevity and quality of life assessment',
    category: 'assessment',
    files: {
      pages: ['src/pages/LongevityDignityQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'nourishing-life',
    name: 'Nourishing Life',
    nameHe: 'הזנת חיים',
    description: 'Yang Sheng lifestyle assessment',
    category: 'assessment',
    files: {
      pages: ['src/pages/NourishingLifeQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'mental-clarity',
    name: 'Mental Clarity',
    nameHe: 'בהירות מנטלית',
    description: 'Cognitive and mental clarity assessment',
    category: 'assessment',
    files: {
      pages: ['src/pages/MentalClarityQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'pain-rehabilitation',
    name: 'Pain Rehabilitation',
    nameHe: 'שיקום כאב',
    description: 'Pain management and rehabilitation',
    category: 'assessment',
    files: {
      pages: ['src/pages/PainRehabilitationQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'immune-shield',
    name: 'Immune Shield',
    nameHe: 'מגן חיסוני',
    description: 'Immune system assessment',
    category: 'assessment',
    files: {
      pages: ['src/pages/ImmuneShieldQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'zang-fu-syndromes',
    name: 'Zang Fu Syndromes',
    nameHe: 'תסמונות זאנג פו',
    description: 'Organ syndrome differentiation',
    category: 'clinical',
    files: {
      pages: ['src/pages/ZangFuSyndromesQuestionnaire.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'pulse-tongue-diagnosis',
    name: 'Pulse & Tongue Diagnosis',
    nameHe: 'אבחון דופק ולשון',
    description: 'Comprehensive pulse and tongue diagnosis',
    category: 'clinical',
    files: {
      pages: [
        'src/pages/PulseTongueDiagnosisQuestionnaire.tsx',
        'src/pages/TongueGallery.tsx',
        'src/pages/CombinedDiagnosis.tsx'
      ],
      components: [
        'src/components/tongue/TongueGalleryModule.tsx',
        'src/components/pulse/PulseGalleryModule.tsx'
      ],
      hooks: ['src/hooks/useClinicalNexus.ts'],
      utils: [],
      contexts: [],
      data: [
        'src/data/pulse-diagnosis-data.ts',
        'src/data/tongue-diagnosis-data.ts'
      ],
      config: []
    },
    databaseTables: ['patient_assessments'],
    dependencies: ['framer-motion']
  },
  {
    id: 'acupuncture-points',
    name: 'Acupuncture Points',
    nameHe: 'נקודות דיקור',
    description: 'Acupuncture point reference and selection',
    category: 'clinical',
    files: {
      pages: ['src/pages/AcupuncturePointsQuestionnaire.tsx'],
      components: [
        'src/components/body-map/BodyMapCanvas.tsx',
        'src/components/body-map/PointMarker.tsx',
        'src/components/body-map/MeridianLine.tsx'
      ],
      hooks: ['src/hooks/useBodyMapPoints.ts'],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['acupuncture_points'],
    dependencies: ['framer-motion', 'lucide-react']
  },
  {
    id: 'roi-simulator',
    name: 'ROI Simulator',
    nameHe: 'סימולטור החזר השקעה',
    description: 'Return on investment calculator',
    category: 'business',
    files: {
      pages: ['src/pages/ROISimulator.tsx'],
      components: [
        'src/components/roi/ClinicROICalculator.tsx',
        'src/components/roi/SmartROISimulator.tsx'
      ],
      hooks: ['src/hooks/useUsageTracking.ts'],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['roi_scenarios'],
    dependencies: ['recharts']
  },
  {
    id: 'therapist-roi',
    name: 'Therapist ROI',
    nameHe: 'החזר השקעה למטפל',
    description: 'Therapist-specific ROI calculations',
    category: 'business',
    files: {
      pages: ['src/pages/TherapistROICalculator.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['roi_scenarios'],
    dependencies: ['recharts']
  },
  {
    id: 'simulation-calculators',
    name: 'Simulation Calculators',
    nameHe: 'מחשבוני סימולציה',
    description: 'Various business simulation tools',
    category: 'business',
    files: {
      pages: ['src/pages/SimulationCalculators.tsx', 'src/pages/ScenariosDashboard.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['roi_scenarios'],
    dependencies: ['recharts']
  },
  {
    id: 'ui-smoke-test',
    name: 'UI Smoke Test',
    nameHe: 'בדיקת עשן ממשק',
    description: 'UI component testing module',
    category: 'dev',
    files: {
      pages: ['src/pages/UISmokeTest.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: [],
    dependencies: ['vitest', '@testing-library/react']
  },
  {
    id: 'music-test',
    name: 'Music Test',
    nameHe: 'בדיקת מוזיקה',
    description: 'Audio and music player testing',
    category: 'dev',
    files: {
      pages: ['src/pages/MusicPlayerTest.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: [],
    dependencies: []
  },
  {
    id: 'private-developer',
    name: 'Private Developer',
    nameHe: 'מפתח פרטי',
    description: 'Developer tools and utilities',
    category: 'dev',
    files: {
      pages: ['src/pages/PrivateDeveloper.tsx', 'src/pages/Developers.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: [],
    dependencies: []
  },
  {
    id: 'auth',
    name: 'Authentication',
    nameHe: 'אימות',
    description: 'User authentication and authorization',
    category: 'core',
    files: {
      pages: ['src/pages/Auth.tsx'],
      components: [
        'src/components/auth/LoginForm.tsx',
        'src/components/auth/SignupForm.tsx',
        'src/components/auth/RequireTier.tsx'
      ],
      hooks: ['src/hooks/useAuth.ts', 'src/hooks/useTier.ts'],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['user_roles', 'therapist_registrations'],
    dependencies: ['@supabase/supabase-js']
  },
  {
    id: 'install',
    name: 'Install App',
    nameHe: 'התקנת אפליקציה',
    description: 'PWA installation module',
    category: 'core',
    files: {
      pages: ['src/pages/InstallApp.tsx'],
      components: [],
      hooks: ['src/hooks/usePWAInstall.ts'],
      utils: [],
      contexts: [],
      data: [],
      config: ['vite.config.ts']
    },
    databaseTables: [],
    dependencies: ['vite-plugin-pwa']
  },
  {
    id: 'crm',
    name: 'CRM Module',
    nameHe: 'מודול CRM',
    description: 'Complete patient and clinic management system',
    category: 'crm',
    files: {
      pages: [
        'src/pages/crm/CRMDashboard.tsx',
        'src/pages/crm/CRMCalendar.tsx',
        'src/pages/crm/CRMPatients.tsx',
        'src/pages/crm/CRMPatientNew.tsx',
        'src/pages/crm/CRMPatientDetail.tsx',
        'src/pages/crm/CRMPatientEdit.tsx',
        'src/pages/crm/CRMRooms.tsx',
        'src/pages/crm/CRMStaff.tsx',
        'src/pages/crm/CRMClinics.tsx',
        'src/pages/crm/CRMSessionManager.tsx',
        'src/pages/crm/PatientConsentForm.tsx'
      ],
      components: [
        'src/components/crm/CRMLayout.tsx',
        'src/components/crm/CRMSidebar.tsx',
        'src/components/crm/CRMBreadcrumb.tsx',
        'src/components/crm/AppointmentCalendar.tsx',
        'src/components/crm/PatientIntakeForm.tsx',
        'src/components/crm/VisitFormDialog.tsx',
        'src/components/crm/QuickPatientSearch.tsx',
        'src/components/crm/SessionStartDialog.tsx',
        'src/components/crm/SessionTimerWidget.tsx',
        'src/components/crm/SignaturePad.tsx'
      ],
      hooks: [
        'src/hooks/usePatients.ts',
        'src/hooks/usePatientAssessments.ts',
        'src/hooks/useClinicalSession.ts',
        'src/hooks/useIntakeDraftAutosave.ts'
      ],
      utils: [
        'src/utils/israeliIdValidation.ts',
        'src/utils/intakeFormsExport.ts',
        'src/utils/crmModuleExport.ts'
      ],
      contexts: [
        'src/contexts/SessionTimerContext.tsx',
        'src/contexts/SessionLockContext.tsx',
        'src/contexts/GlobalSessionContext.tsx'
      ],
      data: [],
      config: []
    },
    databaseTables: [
      'patients', 'appointments', 'visits', 'clinics', 'rooms',
      'clinic_staff', 'patient_assessments', 'patient_consents',
      'follow_ups', 'video_sessions', 'voice_recordings', 'session_reports'
    ],
    dependencies: ['@tanstack/react-query', 'date-fns', 'react-day-picker']
  },
  {
    id: 'knowledge-registry',
    name: 'Knowledge Registry',
    nameHe: 'רישום ידע',
    description: 'RAG knowledge base management',
    category: 'knowledge',
    files: {
      pages: ['src/pages/KnowledgeRegistry.tsx', 'src/pages/AssetInventory.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['knowledge_documents', 'knowledge_chunks', 'rag_query_logs'],
    dependencies: ['@tanstack/react-query', 'jspdf', 'jspdf-autotable']
  },
  {
    id: 'tcm-brain',
    name: 'TCM Brain AI',
    nameHe: 'מוח TCM',
    description: 'AI-powered clinical assistant',
    category: 'clinical',
    files: {
      pages: ['src/pages/TcmBrain.tsx', 'src/pages/CMBrainQuestions.tsx'],
      components: [
        'src/components/chat/ChatMessage.tsx',
        'src/components/chat/ChatInput.tsx'
      ],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['chat_feedback', 'rag_query_logs'],
    dependencies: ['react-markdown']
  },
  {
    id: 'clinical-trials',
    name: 'Clinical Trials Browser',
    nameHe: 'דפדפן ניסויים קליניים',
    description: 'Browse and search clinical trials',
    category: 'clinical',
    files: {
      pages: ['src/pages/ClinicalTrialsBrowser.tsx'],
      components: [],
      hooks: [],
      utils: [],
      contexts: [],
      data: [],
      config: []
    },
    databaseTables: ['clinical_trials'],
    dependencies: ['@tanstack/react-query']
  }
];

/**
 * Get total file count for a module
 */
export function getModuleFileCount(module: ModuleFileMapping): number {
  return Object.values(module.files).reduce((sum, arr) => sum + arr.length, 0);
}

/**
 * Get all file paths for a module as a flat array
 */
export function getModuleFilePaths(module: ModuleFileMapping): string[] {
  return Object.values(module.files).flat();
}

/**
 * Get module by ID
 */
export function getModuleById(id: string): ModuleFileMapping | undefined {
  return MODULE_FILE_MAPPINGS.find(m => m.id === id);
}
