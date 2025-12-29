import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTier } from '@/hooks/useTier';

interface Patient {
  id: string;
  full_name: string;
  consent_signed: boolean | null;
}

interface Appointment {
  id: string;
  patient_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface SessionWorkflowState {
  isLoading: boolean;
  canStartSession: boolean;
  sessionType: 'standard' | 'video' | null;
  blockReason: string | null;
  isTrialExpired: boolean;
  todayAppointments: (Appointment & { patient?: Patient })[];
}

export function useSessionWorkflow() {
  const { tier, daysRemaining } = useTier();
  const [state, setState] = useState<SessionWorkflowState>({
    isLoading: true,
    canStartSession: false,
    sessionType: null,
    blockReason: null,
    isTrialExpired: false,
    todayAppointments: [],
  });

  const fetchTodayAppointments = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Fetch patient data for appointments with patient_id
    const patientIds = appointments?.filter(a => a.patient_id).map(a => a.patient_id) || [];
    let patients: Patient[] = [];
    
    if (patientIds.length > 0) {
      const { data: patientData } = await supabase
        .from('patients')
        .select('id, full_name, consent_signed')
        .in('id', patientIds);
      
      patients = patientData || [];
    }

    // Combine appointments with patient data
    const appointmentsWithPatients = appointments?.map(apt => ({
      ...apt,
      patient: patients.find(p => p.id === apt.patient_id),
    })) || [];

    setState(prev => ({
      ...prev,
      isLoading: false,
      todayAppointments: appointmentsWithPatients,
    }));
  }, []);

  // Check if trial is expired
  useEffect(() => {
    if (tier === 'trial' && daysRemaining !== null && daysRemaining <= 0) {
      setState(prev => ({
        ...prev,
        isTrialExpired: true,
        canStartSession: false,
        blockReason: 'תקופת הניסיון הסתיימה. תודה שניסיתם את המערכת!',
      }));
    }
  }, [tier, daysRemaining]);

  // Determine session type based on tier
  useEffect(() => {
    if (!tier) return;

    let sessionType: 'standard' | 'video' | null = null;
    
    if (tier === 'trial') {
      sessionType = 'video'; // Trial gets Video Session
    } else if (tier === 'standard') {
      sessionType = 'standard'; // Standard gets Standard Session
    } else if (tier === 'premium') {
      sessionType = 'video'; // Premium gets Video Session
    }

    setState(prev => ({ ...prev, sessionType }));
  }, [tier]);

  // Fetch appointments on mount
  useEffect(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);

  // Check if a specific appointment can start a session
  const canStartSessionForAppointment = useCallback((appointmentId: string): { 
    canStart: boolean; 
    reason: string | null;
    sessionPath: string | null;
  } => {
    const appointment = state.todayAppointments.find(a => a.id === appointmentId);
    
    if (!appointment) {
      return { canStart: false, reason: 'תור לא נמצא', sessionPath: null };
    }

    if (state.isTrialExpired) {
      return { canStart: false, reason: 'תקופת הניסיון הסתיימה', sessionPath: null };
    }

    if (!appointment.patient_id) {
      return { canStart: false, reason: 'יש לבחור מטופל לתור', sessionPath: null };
    }

    if (!appointment.patient?.consent_signed) {
      return { canStart: false, reason: 'המטופל לא חתם על הסכמה מודעת', sessionPath: null };
    }

    // Determine session path based on tier
    const sessionPath = state.sessionType === 'video' 
      ? `/video-session?appointmentId=${appointmentId}&patientId=${appointment.patient_id}`
      : `/tcm-brain?appointmentId=${appointmentId}&patientId=${appointment.patient_id}`;

    return { canStart: true, reason: null, sessionPath };
  }, [state.todayAppointments, state.isTrialExpired, state.sessionType]);

  return {
    ...state,
    fetchTodayAppointments,
    canStartSessionForAppointment,
  };
}
