import { useState, useEffect, useCallback } from 'react';

export type TestStatus = 'not_tested' | 'in_progress' | 'passed' | 'failed' | 'blocked';

export interface TestComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  type: 'bug' | 'suggestion' | 'question' | 'note';
}

export interface ModuleTest {
  id: string;
  moduleName: string;
  moduleNameHe: string;
  path: string;
  category: 'core' | 'crm' | 'tools' | 'admin' | 'auth';
  status: TestStatus;
  comments: TestComment[];
  testedBy: string | null;
  testedAt: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  followUpRequired: boolean;
  followUpNotes: string | null;
  followUpDueDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface QASession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  testerName: string;
  modules: ModuleTest[];
  overallStatus: 'in_progress' | 'completed' | 'paused';
}

const DEFAULT_MODULES: Omit<ModuleTest, 'status' | 'comments' | 'testedBy' | 'testedAt' | 'confirmedBy' | 'confirmedAt' | 'followUpRequired' | 'followUpNotes' | 'followUpDueDate'>[] = [
  // Core pages
  { id: 'home', moduleName: 'Home Page', moduleNameHe: 'דף הבית', path: '/', category: 'core', priority: 'high' },
  { id: 'gate', moduleName: 'Gate / Login', moduleNameHe: 'כניסת מטפלים', path: '/gate', category: 'auth', priority: 'critical' },
  { id: 'dashboard', moduleName: 'Dashboard', moduleNameHe: 'לוח בקרה', path: '/dashboard', category: 'core', priority: 'critical' },
  { id: 'therapist-profile', moduleName: 'Therapist Profile', moduleNameHe: 'פרופיל מטפל', path: '/therapist-profile', category: 'core', priority: 'high' },
  { id: 'pricing', moduleName: 'Pricing', moduleNameHe: 'מחירון', path: '/pricing', category: 'core', priority: 'medium' },
  
  // CRM
  { id: 'crm-dashboard', moduleName: 'CRM Dashboard', moduleNameHe: 'לוח בקרה CRM', path: '/crm', category: 'crm', priority: 'critical' },
  { id: 'crm-calendar', moduleName: 'Calendar', moduleNameHe: 'יומן', path: '/crm/calendar', category: 'crm', priority: 'critical' },
  { id: 'crm-patients', moduleName: 'Patients List', moduleNameHe: 'רשימת מטופלים', path: '/crm/patients', category: 'crm', priority: 'critical' },
  { id: 'crm-patient-new', moduleName: 'New Patient', moduleNameHe: 'מטופל חדש', path: '/crm/patients/new', category: 'crm', priority: 'high' },
  { id: 'crm-rooms', moduleName: 'Rooms Management', moduleNameHe: 'ניהול חדרים', path: '/crm/rooms', category: 'crm', priority: 'medium' },
  
  // Tools
  { id: 'tcm-brain', moduleName: 'TCM Brain', moduleNameHe: 'מוח TCM', path: '/tcm-brain', category: 'tools', priority: 'high' },
  { id: 'bazi-calculator', moduleName: 'BaZi Calculator', moduleNameHe: 'מחשבון באזי', path: '/bazi-calculator', category: 'tools', priority: 'medium' },
  { id: 'symptom-checker', moduleName: 'Symptom Checker', moduleNameHe: 'בודק סימפטומים', path: '/symptom-checker', category: 'tools', priority: 'high' },
  { id: 'treatment-planner', moduleName: 'Treatment Planner', moduleNameHe: 'תכנון טיפול', path: '/treatment-planner', category: 'tools', priority: 'high' },
  
  // Admin
  { id: 'admin', moduleName: 'Admin Panel', moduleNameHe: 'ניהול', path: '/admin', category: 'admin', priority: 'high' },
  { id: 'admin-feedback', moduleName: 'Feedback Management', moduleNameHe: 'ניהול משוב', path: '/admin/feedback', category: 'admin', priority: 'medium' },
  { id: 'knowledge-registry', moduleName: 'Knowledge Registry', moduleNameHe: 'רישום ידע', path: '/knowledge-registry', category: 'admin', priority: 'medium' },
  
  // Auth & Misc
  { id: 'therapist-register', moduleName: 'Therapist Registration', moduleNameHe: 'הרשמת מטפל', path: '/therapist-register', category: 'auth', priority: 'high' },
  { id: 'install-app', moduleName: 'Install App (PWA)', moduleNameHe: 'התקנת אפליקציה', path: '/install', category: 'core', priority: 'low' },
];

const STORAGE_KEY = 'qa_testing_session';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function initializeModules(): ModuleTest[] {
  return DEFAULT_MODULES.map(m => ({
    ...m,
    status: 'not_tested',
    comments: [],
    testedBy: null,
    testedAt: null,
    confirmedBy: null,
    confirmedAt: null,
    followUpRequired: false,
    followUpNotes: null,
    followUpDueDate: null,
  }));
}

export function useQATesting() {
  const [session, setSession] = useState<QASession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse QA session:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  const startSession = useCallback((testerName: string) => {
    const newSession: QASession = {
      id: generateId(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      testerName,
      modules: initializeModules(),
      overallStatus: 'in_progress',
    };
    setSession(newSession);
    return newSession;
  }, []);

  const endSession = useCallback(() => {
    if (!session) return;
    setSession({
      ...session,
      endedAt: new Date().toISOString(),
      overallStatus: 'completed',
    });
  }, [session]);

  const pauseSession = useCallback(() => {
    if (!session) return;
    setSession({
      ...session,
      overallStatus: 'paused',
    });
  }, [session]);

  const resumeSession = useCallback(() => {
    if (!session) return;
    setSession({
      ...session,
      overallStatus: 'in_progress',
    });
  }, [session]);

  const updateModuleStatus = useCallback((moduleId: string, status: TestStatus, testerName?: string) => {
    if (!session) return;
    setSession({
      ...session,
      modules: session.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              status,
              testedBy: testerName || m.testedBy,
              testedAt: new Date().toISOString(),
            }
          : m
      ),
    });
  }, [session]);

  const confirmModule = useCallback((moduleId: string, confirmerName: string) => {
    if (!session) return;
    setSession({
      ...session,
      modules: session.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              confirmedBy: confirmerName,
              confirmedAt: new Date().toISOString(),
            }
          : m
      ),
    });
  }, [session]);

  const addComment = useCallback((moduleId: string, comment: Omit<TestComment, 'id' | 'createdAt'>) => {
    if (!session) return;
    const newComment: TestComment = {
      ...comment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSession({
      ...session,
      modules: session.modules.map(m =>
        m.id === moduleId
          ? { ...m, comments: [...m.comments, newComment] }
          : m
      ),
    });
  }, [session]);

  const removeComment = useCallback((moduleId: string, commentId: string) => {
    if (!session) return;
    setSession({
      ...session,
      modules: session.modules.map(m =>
        m.id === moduleId
          ? { ...m, comments: m.comments.filter(c => c.id !== commentId) }
          : m
      ),
    });
  }, [session]);

  const setFollowUp = useCallback((
    moduleId: string,
    required: boolean,
    notes?: string,
    dueDate?: string
  ) => {
    if (!session) return;
    setSession({
      ...session,
      modules: session.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              followUpRequired: required,
              followUpNotes: notes || null,
              followUpDueDate: dueDate || null,
            }
          : m
      ),
    });
  }, [session]);

  const resetSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const getModuleById = useCallback((moduleId: string) => {
    return session?.modules.find(m => m.id === moduleId) || null;
  }, [session]);

  const getProgress = useCallback(() => {
    if (!session) return { total: 0, tested: 0, passed: 0, failed: 0, blocked: 0, percentage: 0 };
    const total = session.modules.length;
    const tested = session.modules.filter(m => m.status !== 'not_tested' && m.status !== 'in_progress').length;
    const passed = session.modules.filter(m => m.status === 'passed').length;
    const failed = session.modules.filter(m => m.status === 'failed').length;
    const blocked = session.modules.filter(m => m.status === 'blocked').length;
    const percentage = total > 0 ? Math.round((tested / total) * 100) : 0;
    return { total, tested, passed, failed, blocked, percentage };
  }, [session]);

  const canProceedToNext = useCallback((moduleId: string) => {
    if (!session) return false;
    const module = session.modules.find(m => m.id === moduleId);
    if (!module) return false;
    // Can proceed only if confirmed (passed) or explicitly marked as blocked/failed with confirmation
    return module.confirmedAt !== null;
  }, [session]);

  const getNextUntestedModule = useCallback(() => {
    if (!session) return null;
    return session.modules.find(m => m.status === 'not_tested') || null;
  }, [session]);

  return {
    session,
    isLoading,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateModuleStatus,
    confirmModule,
    addComment,
    removeComment,
    setFollowUp,
    resetSession,
    getModuleById,
    getProgress,
    canProceedToNext,
    getNextUntestedModule,
  };
}
