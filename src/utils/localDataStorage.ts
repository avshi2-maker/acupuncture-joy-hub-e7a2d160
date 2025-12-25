// Local storage utility for patient data and session reports
// Data is stored locally on device, never on server

const PATIENT_DATA_KEY = 'tcm_patient_data_backup';
const SESSION_REPORTS_KEY = 'tcm_session_reports';

export interface LocalPatientData {
  id: string;
  full_name: string;
  id_number: string;
  phone: string;
  email?: string;
  chief_complaint: string;
  savedAt: string;
}

export interface LocalSessionReport {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  chiefComplaint?: string;
  tongueDiagnosis?: string;
  pulseDiagnosis?: string;
  tcmPattern?: string;
  treatmentPrinciple?: string;
  pointsUsed?: string[];
  herbsPrescribed?: string;
  cupping: boolean;
  moxa: boolean;
  otherTechniques?: string;
  notes?: string;
  followUpRecommended?: string;
  savedAt: string;
}

// Save patient data to local storage
export const savePatientLocally = (patient: LocalPatientData): void => {
  try {
    const existing = getLocalPatients();
    const index = existing.findIndex(p => p.id === patient.id);
    
    if (index >= 0) {
      existing[index] = { ...patient, savedAt: new Date().toISOString() };
    } else {
      existing.push({ ...patient, savedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(PATIENT_DATA_KEY, JSON.stringify(existing));
    console.log('Patient data saved locally:', patient.full_name);
  } catch (error) {
    console.error('Failed to save patient locally:', error);
  }
};

// Get all locally saved patients
export const getLocalPatients = (): LocalPatientData[] => {
  try {
    const data = localStorage.getItem(PATIENT_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save session report locally
export const saveSessionReport = (report: Omit<LocalSessionReport, 'id' | 'savedAt'>): LocalSessionReport => {
  const fullReport: LocalSessionReport = {
    ...report,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    savedAt: new Date().toISOString(),
  };
  
  try {
    const existing = getLocalSessionReports();
    existing.push(fullReport);
    localStorage.setItem(SESSION_REPORTS_KEY, JSON.stringify(existing));
    console.log('Session report saved locally:', fullReport.id);
  } catch (error) {
    console.error('Failed to save session report locally:', error);
  }
  
  return fullReport;
};

// Get all locally saved session reports
export const getLocalSessionReports = (): LocalSessionReport[] => {
  try {
    const data = localStorage.getItem(SESSION_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Get session reports for a specific patient
export const getPatientSessionReports = (patientId: string): LocalSessionReport[] => {
  return getLocalSessionReports().filter(r => r.patientId === patientId);
};

// Generate printable report HTML
export const generateReportHTML = (report: LocalSessionReport): string => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <title>דוח טיפול - ${report.patientName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h1 { color: #2d5a27; border-bottom: 2px solid #2d5a27; padding-bottom: 10px; }
        .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; }
        .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>דוח טיפול - TCM Clinic</h1>
      <div class="section">
        <div class="label">שם מטופל:</div>
        <div class="value">${report.patientName}</div>
      </div>
      <div class="section">
        <div class="label">תאריך טיפול:</div>
        <div class="value">${new Date(report.visitDate).toLocaleDateString('he-IL')}</div>
      </div>
      ${report.chiefComplaint ? `
      <div class="section">
        <div class="label">תלונה עיקרית:</div>
        <div class="value">${report.chiefComplaint}</div>
      </div>` : ''}
      ${report.tongueDiagnosis ? `
      <div class="section">
        <div class="label">אבחון לשון:</div>
        <div class="value">${report.tongueDiagnosis}</div>
      </div>` : ''}
      ${report.pulseDiagnosis ? `
      <div class="section">
        <div class="label">אבחון דופק:</div>
        <div class="value">${report.pulseDiagnosis}</div>
      </div>` : ''}
      ${report.tcmPattern ? `
      <div class="section">
        <div class="label">דפוס TCM:</div>
        <div class="value">${report.tcmPattern}</div>
      </div>` : ''}
      ${report.treatmentPrinciple ? `
      <div class="section">
        <div class="label">עקרון טיפול:</div>
        <div class="value">${report.treatmentPrinciple}</div>
      </div>` : ''}
      ${report.pointsUsed?.length ? `
      <div class="section">
        <div class="label">נקודות דיקור:</div>
        <div class="value">${report.pointsUsed.join(', ')}</div>
      </div>` : ''}
      ${report.herbsPrescribed ? `
      <div class="section">
        <div class="label">צמחים שנרשמו:</div>
        <div class="value">${report.herbsPrescribed}</div>
      </div>` : ''}
      <div class="section">
        <div class="label">טכניקות נוספות:</div>
        <div class="value">
          ${report.cupping ? '✓ כוסות רוח' : ''} 
          ${report.moxa ? '✓ מוקסה' : ''}
          ${report.otherTechniques ? `✓ ${report.otherTechniques}` : ''}
        </div>
      </div>
      ${report.notes ? `
      <div class="section">
        <div class="label">הערות:</div>
        <div class="value">${report.notes}</div>
      </div>` : ''}
      ${report.followUpRecommended ? `
      <div class="section">
        <div class="label">המלצות להמשך:</div>
        <div class="value">${report.followUpRecommended}</div>
      </div>` : ''}
      <div class="footer">
        נשמר מקומית בתאריך: ${new Date(report.savedAt).toLocaleString('he-IL')}<br/>
        TCM Clinic - מרפאת רפואה סינית
      </div>
    </body>
    </html>
  `;
};

// Print report
export const printReport = (report: LocalSessionReport): void => {
  const html = generateReportHTML(report);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

// Clear all local data (for testing/privacy)
export const clearLocalData = (): void => {
  localStorage.removeItem(PATIENT_DATA_KEY);
  localStorage.removeItem(SESSION_REPORTS_KEY);
  console.log('All local TCM data cleared');
};
