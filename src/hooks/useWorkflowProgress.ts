import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'workflow_progress';

export interface WorkflowProgress {
  currentStep: 1 | 2 | 3;
  selectedDate: string | null;
  selectedPatientId: string | null;
  selectedPatientName: string | null;
  lastUpdated: string;
}

const getInitialProgress = (): WorkflowProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if progress is from today
      const savedDate = new Date(parsed.lastUpdated).toDateString();
      const today = new Date().toDateString();
      if (savedDate === today) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading workflow progress:', e);
  }
  return {
    currentStep: 1,
    selectedDate: null,
    selectedPatientId: null,
    selectedPatientName: null,
    lastUpdated: new Date().toISOString(),
  };
};

export function useWorkflowProgress() {
  const [progress, setProgress] = useState<WorkflowProgress>(getInitialProgress);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const setStep = useCallback((step: 1 | 2 | 3) => {
    setProgress(prev => ({
      ...prev,
      currentStep: step,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setSelectedDate = useCallback((date: string | null) => {
    setProgress(prev => ({
      ...prev,
      selectedDate: date,
      currentStep: date ? 2 : 1,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setSelectedPatient = useCallback((patientId: string | null, patientName: string | null) => {
    setProgress(prev => ({
      ...prev,
      selectedPatientId: patientId,
      selectedPatientName: patientName,
      currentStep: patientId ? 3 : prev.currentStep,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const initial: WorkflowProgress = {
      currentStep: 1,
      selectedDate: null,
      selectedPatientId: null,
      selectedPatientName: null,
      lastUpdated: new Date().toISOString(),
    };
    setProgress(initial);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasProgress = progress.selectedDate !== null || progress.selectedPatientId !== null;

  return {
    progress,
    setStep,
    setSelectedDate,
    setSelectedPatient,
    resetProgress,
    hasProgress,
  };
}
