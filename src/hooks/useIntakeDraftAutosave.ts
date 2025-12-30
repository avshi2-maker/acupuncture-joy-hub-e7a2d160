import { useEffect, useCallback, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

const DRAFT_KEY = 'patient_intake_draft';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

interface DraftData {
  formData: Record<string, any>;
  customNotes: Record<string, string>;
  selectedAllergies: string[];
  selectedMedications: string[];
  dietHabits: string[];
  pulseFindings: string[];
  tongueFindings: string[];
  ageSpecificAnswers: Record<string, string>;
  pregnancyAnswers: Record<string, string>;
  currentStep: number;
  savedAt: number;
}

interface UseIntakeDraftAutosaveOptions {
  form: UseFormReturn<any>;
  customNotes: Record<string, string>;
  selectedAllergies: string[];
  selectedMedications: string[];
  dietHabits: string[];
  pulseFindings: string[];
  tongueFindings: string[];
  ageSpecificAnswers: Record<string, string>;
  pregnancyAnswers: Record<string, string>;
  currentStep: number;
  patientId?: string; // If editing, don't use draft
}

export function useIntakeDraftAutosave({
  form,
  customNotes,
  selectedAllergies,
  selectedMedications,
  dietHabits,
  pulseFindings,
  tongueFindings,
  ageSpecificAnswers,
  pregnancyAnswers,
  currentStep,
  patientId,
}: UseIntakeDraftAutosaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if draft exists on mount
  useEffect(() => {
    if (patientId) return; // Don't use draft when editing
    
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft: DraftData = JSON.parse(saved);
        // Check if draft is less than 24 hours old
        const hoursSinceSave = (Date.now() - draft.savedAt) / (1000 * 60 * 60);
        if (hoursSinceSave < 24) {
          setHasDraft(true);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch (e) {
      console.error('Error checking draft:', e);
    }
  }, [patientId]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (patientId) return; // Don't save draft when editing existing patient

    setIsSaving(true);
    try {
      const formData = form.getValues();
      const draft: DraftData = {
        formData,
        customNotes,
        selectedAllergies,
        selectedMedications,
        dietHabits,
        pulseFindings,
        tongueFindings,
        ageSpecificAnswers,
        pregnancyAnswers,
        currentStep,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(new Date());
    } catch (e) {
      console.error('Error saving draft:', e);
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    customNotes,
    selectedAllergies,
    selectedMedications,
    dietHabits,
    pulseFindings,
    tongueFindings,
    ageSpecificAnswers,
    pregnancyAnswers,
    currentStep,
    patientId,
  ]);

  // Debounced autosave on changes
  useEffect(() => {
    if (patientId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    saveDraft,
    patientId,
    customNotes,
    selectedAllergies,
    selectedMedications,
    dietHabits,
    pulseFindings,
    tongueFindings,
    ageSpecificAnswers,
    pregnancyAnswers,
    currentStep,
  ]);

  // Load draft
  const loadDraft = useCallback((): DraftData | null => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return null;
  }, []);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      setLastSaved(null);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  }, []);

  // Restore draft to form
  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (!draft) return false;

    try {
      // Restore form data
      Object.entries(draft.formData).forEach(([key, value]) => {
        form.setValue(key as any, value);
      });

      setHasDraft(false);
      return draft;
    } catch (e) {
      console.error('Error restoring draft:', e);
      return false;
    }
  }, [form, loadDraft]);

  return {
    lastSaved,
    isSaving,
    hasDraft,
    saveDraft,
    loadDraft,
    clearDraft,
    restoreDraft,
  };
}
