import JSZip from 'jszip';

/**
 * CRM Module Export Utility
 * Downloads all CRM-related files as a ZIP archive
 */

// Define all CRM module files to export
const CRM_MODULE_FILES = {
  // CRM Pages
  'pages/crm/CRMCalendar.tsx': 'src/pages/crm/CRMCalendar.tsx',
  'pages/crm/CRMClinics.tsx': 'src/pages/crm/CRMClinics.tsx',
  'pages/crm/CRMDashboard.tsx': 'src/pages/crm/CRMDashboard.tsx',
  'pages/crm/CRMPatientDetail.tsx': 'src/pages/crm/CRMPatientDetail.tsx',
  'pages/crm/CRMPatientEdit.tsx': 'src/pages/crm/CRMPatientEdit.tsx',
  'pages/crm/CRMPatientNew.tsx': 'src/pages/crm/CRMPatientNew.tsx',
  'pages/crm/CRMPatients.tsx': 'src/pages/crm/CRMPatients.tsx',
  'pages/crm/CRMRooms.tsx': 'src/pages/crm/CRMRooms.tsx',
  'pages/crm/CRMSessionManager.tsx': 'src/pages/crm/CRMSessionManager.tsx',
  'pages/crm/CRMStaff.tsx': 'src/pages/crm/CRMStaff.tsx',
  'pages/crm/PatientConsentForm.tsx': 'src/pages/crm/PatientConsentForm.tsx',
  'pages/CRM.tsx': 'src/pages/CRM.tsx',
  
  // CRM Components
  'components/crm/AllergiesSelect.tsx': 'src/components/crm/AllergiesSelect.tsx',
  'components/crm/AppointmentCalendar.tsx': 'src/components/crm/AppointmentCalendar.tsx',
  'components/crm/CRMBreadcrumb.tsx': 'src/components/crm/CRMBreadcrumb.tsx',
  'components/crm/CRMErrorBoundary.tsx': 'src/components/crm/CRMErrorBoundary.tsx',
  'components/crm/CRMLayout.tsx': 'src/components/crm/CRMLayout.tsx',
  'components/crm/CRMSidebar.tsx': 'src/components/crm/CRMSidebar.tsx',
  'components/crm/ChiefComplaintSelect.tsx': 'src/components/crm/ChiefComplaintSelect.tsx',
  'components/crm/ConstitutionTypeSelect.tsx': 'src/components/crm/ConstitutionTypeSelect.tsx',
  'components/crm/DietNutritionSelect.tsx': 'src/components/crm/DietNutritionSelect.tsx',
  'components/crm/HeaderActions.tsx': 'src/components/crm/HeaderActions.tsx',
  'components/crm/LifestyleQuickSelect.tsx': 'src/components/crm/LifestyleQuickSelect.tsx',
  'components/crm/MedicalDocumentUpload.tsx': 'src/components/crm/MedicalDocumentUpload.tsx',
  'components/crm/MedicationsSupplementsSelect.tsx': 'src/components/crm/MedicationsSupplementsSelect.tsx',
  'components/crm/MobileCalendarView.tsx': 'src/components/crm/MobileCalendarView.tsx',
  'components/crm/PatientIntakeForm.tsx': 'src/components/crm/PatientIntakeForm.tsx',
  'components/crm/PatientQATemplates.tsx': 'src/components/crm/PatientQATemplates.tsx',
  'components/crm/PatientSelectorDropdown.tsx': 'src/components/crm/PatientSelectorDropdown.tsx',
  'components/crm/PregnancyQuestionSelect.tsx': 'src/components/crm/PregnancyQuestionSelect.tsx',
  'components/crm/PulseDiagnosisSelect.tsx': 'src/components/crm/PulseDiagnosisSelect.tsx',
  'components/crm/QuickPatientSearch.tsx': 'src/components/crm/QuickPatientSearch.tsx',
  'components/crm/SessionStartDialog.tsx': 'src/components/crm/SessionStartDialog.tsx',
  'components/crm/SessionTimerWidget.tsx': 'src/components/crm/SessionTimerWidget.tsx',
  'components/crm/SignaturePad.tsx': 'src/components/crm/SignaturePad.tsx',
  'components/crm/SimpleSelect.tsx': 'src/components/crm/SimpleSelect.tsx',
  'components/crm/SwipeableAppointmentCard.tsx': 'src/components/crm/SwipeableAppointmentCard.tsx',
  'components/crm/TongueDiagnosisSelect.tsx': 'src/components/crm/TongueDiagnosisSelect.tsx',
  'components/crm/VisitFormDialog.tsx': 'src/components/crm/VisitFormDialog.tsx',
  'components/crm/VisitStatistics.tsx': 'src/components/crm/VisitStatistics.tsx',
  'components/crm/VoiceInputFields.tsx': 'src/components/crm/VoiceInputFields.tsx',
  'components/crm/WhatsAppReminderButton.tsx': 'src/components/crm/WhatsAppReminderButton.tsx',
  
  // CRM-related Hooks
  'hooks/usePatients.ts': 'src/hooks/usePatients.ts',
  'hooks/usePatientAssessments.ts': 'src/hooks/usePatientAssessments.ts',
  'hooks/useClinicalSession.ts': 'src/hooks/useClinicalSession.ts',
  'hooks/useSessionPersistence.ts': 'src/hooks/useSessionPersistence.ts',
  'hooks/useSessionPhase.ts': 'src/hooks/useSessionPhase.ts',
  'hooks/useSessionWorkflow.ts': 'src/hooks/useSessionWorkflow.ts',
  'hooks/useSessionSummary.ts': 'src/hooks/useSessionSummary.ts',
  'hooks/useSessionBrief.ts': 'src/hooks/useSessionBrief.ts',
  'hooks/useIntakeDraftAutosave.ts': 'src/hooks/useIntakeDraftAutosave.ts',
  
  // CRM-related Utilities
  'utils/israeliIdValidation.ts': 'src/utils/israeliIdValidation.ts',
  'utils/intakeFormsExport.ts': 'src/utils/intakeFormsExport.ts',
  'utils/cafStudiesExport.ts': 'src/utils/cafStudiesExport.ts',
  'utils/localDataStorage.ts': 'src/utils/localDataStorage.ts',
  
  // CRM-related Contexts
  'contexts/SessionTimerContext.tsx': 'src/contexts/SessionTimerContext.tsx',
  'contexts/SessionLockContext.tsx': 'src/contexts/SessionLockContext.tsx',
  'contexts/GlobalSessionContext.tsx': 'src/contexts/GlobalSessionContext.tsx',
};

// File structure manifest
const MANIFEST = `# CRM Module Export
# Generated: ${new Date().toISOString()}
# Total Files: ${Object.keys(CRM_MODULE_FILES).length}

## Directory Structure:
- pages/crm/ - CRM page components
- pages/CRM.tsx - Main CRM router
- components/crm/ - Reusable CRM components
- hooks/ - CRM-related React hooks
- utils/ - Utility functions
- contexts/ - React contexts for state management

## Key Files:
- CRMDashboard.tsx - Main dashboard with stats and quick actions
- CRMPatients.tsx - Patient list and management
- CRMPatientDetail.tsx - Individual patient view
- CRMCalendar.tsx - Appointment calendar
- PatientIntakeForm.tsx - Multi-step patient intake form
- CRMLayout.tsx - Layout wrapper for CRM pages
- CRMSidebar.tsx - Navigation sidebar

## Database Tables Required:
- patients
- appointments
- visits
- clinics
- rooms
- clinic_staff
- patient_assessments
- patient_consents
- follow_ups
- video_sessions
- voice_recordings
- session_reports

## Dependencies:
- @tanstack/react-query
- @supabase/supabase-js
- date-fns
- lucide-react
- framer-motion
- react-router-dom
- shadcn/ui components
`;

/**
 * Fetches file content from the project
 * Note: In a real implementation, this would fetch from the server
 * For now, we generate a placeholder structure
 */
async function fetchFileContent(filePath: string): Promise<string> {
  // Since we can't directly access file system from browser,
  // we'll create a manifest-based export that documents the structure
  return `// File: ${filePath}
// This file is part of the CRM Module
// Please copy the actual content from your project

// Source path: ${filePath}
// Export generated: ${new Date().toISOString()}

export {};
`;
}

/**
 * Downloads the complete CRM module as a ZIP file
 */
export async function downloadCRMModule(): Promise<void> {
  const zip = new JSZip();
  
  // Add manifest
  zip.file('README.md', MANIFEST);
  
  // Add file structure documentation
  const fileList = Object.entries(CRM_MODULE_FILES)
    .map(([zipPath, srcPath]) => `${zipPath} <- ${srcPath}`)
    .join('\n');
  
  zip.file('FILE_LIST.txt', `CRM Module Files\n${'='.repeat(50)}\n\n${fileList}`);
  
  // Add placeholder files with path information
  for (const [zipPath, srcPath] of Object.entries(CRM_MODULE_FILES)) {
    const content = await fetchFileContent(srcPath);
    zip.file(zipPath, content);
  }
  
  // Add database schema documentation
  const schemaDoc = `# CRM Database Schema

## patients
- id: UUID (PK)
- therapist_id: UUID (FK to auth.users)
- clinic_id: UUID (FK to clinics)
- full_name: TEXT
- phone: TEXT
- email: TEXT
- date_of_birth: DATE
- gender: TEXT
- id_number: TEXT
- medical_history: TEXT
- allergies: TEXT
- medications: TEXT
- chief_complaint: TEXT
- tongue_notes: TEXT
- pulse_notes: TEXT
- constitution_type: TEXT
- consent_signed: BOOLEAN
- consent_signed_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

## appointments
- id: UUID (PK)
- therapist_id: UUID (FK)
- patient_id: UUID (FK)
- clinic_id: UUID (FK)
- room_id: UUID (FK)
- title: TEXT
- start_time: TIMESTAMP
- end_time: TIMESTAMP
- status: TEXT
- notes: TEXT
- is_recurring: BOOLEAN
- recurrence_rule: TEXT
- color: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

## visits
- id: UUID (PK)
- patient_id: UUID (FK)
- therapist_id: UUID (FK)
- visit_date: TIMESTAMP
- chief_complaint: TEXT
- pulse_diagnosis: TEXT
- tongue_diagnosis: TEXT
- tcm_pattern: TEXT
- treatment_principle: TEXT
- points_used: TEXT[]
- herbs_prescribed: TEXT
- moxa: BOOLEAN
- cupping: BOOLEAN
- other_techniques: TEXT
- notes: TEXT
- follow_up_recommended: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

## clinics
- id: UUID (PK)
- owner_id: UUID (FK)
- name: TEXT
- address: TEXT
- phone: TEXT
- email: TEXT
- timezone: TEXT
- reminder_enabled: BOOLEAN
- reminder_timing: TEXT[]
- reminder_channel: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

## rooms
- id: UUID (PK)
- clinic_id: UUID (FK)
- name: TEXT
- description: TEXT
- capacity: INTEGER
- color: TEXT
- is_active: BOOLEAN
- special_instructions: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
`;

  zip.file('DATABASE_SCHEMA.md', schemaDoc);
  
  // Generate ZIP and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `crm-module-${format(new Date(), 'yyyy-MM-dd')}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import format from date-fns
import { format } from 'date-fns';

/**
 * Get the count of files in the CRM module
 */
export function getCRMModuleFileCount(): number {
  return Object.keys(CRM_MODULE_FILES).length;
}

/**
 * Get the list of CRM module categories
 */
export function getCRMModuleCategories(): { name: string; count: number }[] {
  const categories: Record<string, number> = {};
  
  for (const zipPath of Object.keys(CRM_MODULE_FILES)) {
    const category = zipPath.split('/')[0];
    categories[category] = (categories[category] || 0) + 1;
  }
  
  return Object.entries(categories).map(([name, count]) => ({ name, count }));
}
