/**
 * Intake Forms Export Utility
 * Downloads therapist and patient intake form templates as CSV
 */

// Therapist Intake Form Fields
export const therapistIntakeFields = [
  // Personal Details
  { section: 'פרטים אישיים', sectionEn: 'Personal Details', field: 'idNumber', labelHe: 'מספר תעודת זהות', labelEn: 'ID Number', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Details', field: 'fullName', labelHe: 'שם מלא', labelEn: 'Full Name', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Details', field: 'email', labelHe: 'כתובת אימייל', labelEn: 'Email Address', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Details', field: 'phone', labelHe: 'מספר טלפון', labelEn: 'Phone Number', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Details', field: 'dateOfBirth', labelHe: 'תאריך לידה', labelEn: 'Date of Birth', required: false },
  { section: 'פרטים אישיים', sectionEn: 'Personal Details', field: 'address', labelHe: 'כתובת', labelEn: 'Address', required: false },
  
  // Professional Details
  { section: 'פרטים מקצועיים', sectionEn: 'Professional Details', field: 'licenseNumber', labelHe: 'מספר רישיון', labelEn: 'License Number', required: true },
  { section: 'פרטים מקצועיים', sectionEn: 'Professional Details', field: 'licenseType', labelHe: 'סוג רישיון', labelEn: 'License Type', required: true },
  { section: 'פרטים מקצועיים', sectionEn: 'Professional Details', field: 'yearsExperience', labelHe: 'שנות ניסיון', labelEn: 'Years of Experience', required: false },
  { section: 'פרטים מקצועיים', sectionEn: 'Professional Details', field: 'specializations', labelHe: 'התמחויות', labelEn: 'Specializations', required: false },
  { section: 'פרטים מקצועיים', sectionEn: 'Professional Details', field: 'education', labelHe: 'השכלה/מוסד לימודים', labelEn: 'Education/Institution', required: false },
  
  // Clinic Details
  { section: 'פרטי קליניקה', sectionEn: 'Clinic Details', field: 'clinicName', labelHe: 'שם הקליניקה', labelEn: 'Clinic Name', required: false },
  { section: 'פרטי קליניקה', sectionEn: 'Clinic Details', field: 'clinicAddress', labelHe: 'כתובת הקליניקה', labelEn: 'Clinic Address', required: false },
  { section: 'פרטי קליניקה', sectionEn: 'Clinic Details', field: 'clinicPhone', labelHe: 'טלפון הקליניקה', labelEn: 'Clinic Phone', required: false },
  
  // Disclaimer Points
  { section: 'הצהרה משפטית', sectionEn: 'Legal Disclaimer', field: 'disclaimer1', labelHe: 'אני מטפל/ת מורשה ברפואה סינית מסורתית עם רישיון תקף', labelEn: 'I am a licensed TCM practitioner with a valid license', required: true },
  { section: 'הצהרה משפטית', sectionEn: 'Legal Disclaimer', field: 'disclaimer2', labelHe: 'מערכת זו היא כלי תמיכה בלבד ואינה מהווה תחליף לשיקול הדעת המקצועי', labelEn: 'This system is a support tool only and not a substitute for professional judgment', required: true },
  { section: 'הצהרה משפטית', sectionEn: 'Legal Disclaimer', field: 'disclaimer3', labelHe: 'המערכת משתמשת בבינה מלאכותית ועלולה להכיל שגיאות', labelEn: 'The system uses AI and may contain errors', required: true },
  { section: 'הצהרה משפטית', sectionEn: 'Legal Disclaimer', field: 'disclaimer4', labelHe: 'אני נושא/ת באחריות בלעדית לאימות כל הנתונים והאבחנות', labelEn: 'I bear sole responsibility for verifying all data and diagnoses', required: true },
  { section: 'הצהרה משפטית', sectionEn: 'Legal Disclaimer', field: 'signature', labelHe: 'חתימה דיגיטלית', labelEn: 'Digital Signature', required: true },
];

// Patient Intake Form Fields
export const patientIntakeFields = [
  // Step 1: Personal Info
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'id_number', labelHe: 'מספר תעודת זהות', labelEn: 'ID Number', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'full_name', labelHe: 'שם מלא', labelEn: 'Full Name', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'email', labelHe: 'כתובת אימייל', labelEn: 'Email Address', required: false },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'phone', labelHe: 'מספר טלפון', labelEn: 'Phone Number', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'date_of_birth', labelHe: 'תאריך לידה', labelEn: 'Date of Birth', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'gender', labelHe: 'מגדר', labelEn: 'Gender', required: true },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'address', labelHe: 'כתובת', labelEn: 'Address', required: false },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'occupation', labelHe: 'מקצוע', labelEn: 'Occupation', required: false },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'emergency_contact', labelHe: 'איש קשר לחירום', labelEn: 'Emergency Contact', required: false },
  { section: 'פרטים אישיים', sectionEn: 'Personal Info', step: 1, field: 'emergency_phone', labelHe: 'טלפון לחירום', labelEn: 'Emergency Phone', required: false },
  
  // Step 2: Medical History
  { section: 'היסטוריה רפואית', sectionEn: 'Medical History', step: 2, field: 'chief_complaint', labelHe: 'תלונה עיקרית', labelEn: 'Chief Complaint', required: true },
  { section: 'היסטוריה רפואית', sectionEn: 'Medical History', step: 2, field: 'medical_history', labelHe: 'היסטוריה רפואית', labelEn: 'Medical History', required: false },
  { section: 'היסטוריה רפואית', sectionEn: 'Medical History', step: 2, field: 'allergies', labelHe: 'אלרגיות', labelEn: 'Allergies', required: false },
  { section: 'היסטוריה רפואית', sectionEn: 'Medical History', step: 2, field: 'medications', labelHe: 'תרופות נוכחיות', labelEn: 'Current Medications', required: false },
  
  // Step 3: Lifestyle
  { section: 'אורח חיים', sectionEn: 'Lifestyle', step: 3, field: 'diet_notes', labelHe: 'הערות תזונה', labelEn: 'Diet Notes', required: false },
  { section: 'אורח חיים', sectionEn: 'Lifestyle', step: 3, field: 'sleep_quality', labelHe: 'איכות שינה', labelEn: 'Sleep Quality', required: false },
  { section: 'אורח חיים', sectionEn: 'Lifestyle', step: 3, field: 'stress_level', labelHe: 'רמת מתח', labelEn: 'Stress Level', required: false },
  { section: 'אורח חיים', sectionEn: 'Lifestyle', step: 3, field: 'exercise_frequency', labelHe: 'תדירות פעילות גופנית', labelEn: 'Exercise Frequency', required: false },
  { section: 'אורח חיים', sectionEn: 'Lifestyle', step: 3, field: 'lifestyle_notes', labelHe: 'הערות אורח חיים', labelEn: 'Lifestyle Notes', required: false },
  
  // TCM Assessment
  { section: 'הערכת רפואה סינית', sectionEn: 'TCM Assessment', step: 3, field: 'constitution_type', labelHe: 'סוג חוקה', labelEn: 'Constitution Type', required: false },
  { section: 'הערכת רפואה סינית', sectionEn: 'TCM Assessment', step: 3, field: 'tongue_notes', labelHe: 'אבחון לשון', labelEn: 'Tongue Diagnosis', required: false },
  { section: 'הערכת רפואה סינית', sectionEn: 'TCM Assessment', step: 3, field: 'pulse_notes', labelHe: 'אבחון דופק', labelEn: 'Pulse Diagnosis', required: false },
  
  // Pregnancy (Conditional)
  { section: 'הריון', sectionEn: 'Pregnancy', step: 3, field: 'is_pregnant', labelHe: 'האם בהריון?', labelEn: 'Is Pregnant?', required: false },
  { section: 'הריון', sectionEn: 'Pregnancy', step: 3, field: 'pregnancy_weeks', labelHe: 'שבוע הריון', labelEn: 'Pregnancy Weeks', required: false },
  { section: 'הריון', sectionEn: 'Pregnancy', step: 3, field: 'due_date', labelHe: 'תאריך לידה משוער', labelEn: 'Due Date', required: false },
  { section: 'הריון', sectionEn: 'Pregnancy', step: 3, field: 'pregnancy_notes', labelHe: 'הערות הריון', labelEn: 'Pregnancy Notes', required: false },
  { section: 'הריון', sectionEn: 'Pregnancy', step: 3, field: 'obstetric_history', labelHe: 'היסטוריה מיילדותית', labelEn: 'Obstetric History', required: false },
  
  // Age-specific questions - Child
  { section: 'שאלות לפי גיל - ילדים', sectionEn: 'Age-Specific - Children', step: 2, field: 'birth_history', labelHe: 'היסטוריית לידה', labelEn: 'Birth History', required: false },
  { section: 'שאלות לפי גיל - ילדים', sectionEn: 'Age-Specific - Children', step: 2, field: 'vaccinations', labelHe: 'מצב חיסונים', labelEn: 'Vaccination Status', required: false },
  { section: 'שאלות לפי גיל - ילדים', sectionEn: 'Age-Specific - Children', step: 2, field: 'developmental', labelHe: 'אבני דרך התפתחותיות', labelEn: 'Developmental Milestones', required: false },
  { section: 'שאלות לפי גיל - ילדים', sectionEn: 'Age-Specific - Children', step: 2, field: 'school_performance', labelHe: 'ביצועים בבית ספר', labelEn: 'School Performance', required: false },
  
  // Age-specific questions - Teen
  { section: 'שאלות לפי גיל - נוער', sectionEn: 'Age-Specific - Teens', step: 2, field: 'puberty', labelHe: 'מצב התבגרות', labelEn: 'Puberty Status', required: false },
  { section: 'שאלות לפי גיל - נוער', sectionEn: 'Age-Specific - Teens', step: 2, field: 'mental_health', labelHe: 'בריאות נפשית', labelEn: 'Mental Health', required: false },
  { section: 'שאלות לפי גיל - נוער', sectionEn: 'Age-Specific - Teens', step: 2, field: 'social', labelHe: 'חיים חברתיים', labelEn: 'Social Life', required: false },
  { section: 'שאלות לפי גיל - נוער', sectionEn: 'Age-Specific - Teens', step: 2, field: 'sports', labelHe: 'ספורט/פעילויות', labelEn: 'Sports/Activities', required: false },
  
  // Age-specific questions - Adult
  { section: 'שאלות לפי גיל - מבוגרים', sectionEn: 'Age-Specific - Adults', step: 2, field: 'work_stress', labelHe: 'לחץ בעבודה', labelEn: 'Work-Related Stress', required: false },
  { section: 'שאלות לפי גיל - מבוגרים', sectionEn: 'Age-Specific - Adults', step: 2, field: 'family_history', labelHe: 'היסטוריה משפחתית', labelEn: 'Family Medical History', required: false },
  { section: 'שאלות לפי גיל - מבוגרים', sectionEn: 'Age-Specific - Adults', step: 2, field: 'reproductive', labelHe: 'בריאות רבייה', labelEn: 'Reproductive Health', required: false },
  
  // Age-specific questions - Senior
  { section: 'שאלות לפי גיל - קשישים', sectionEn: 'Age-Specific - Seniors', step: 2, field: 'mobility', labelHe: 'ניידות ושיווי משקל', labelEn: 'Mobility & Balance', required: false },
  { section: 'שאלות לפי גיל - קשישים', sectionEn: 'Age-Specific - Seniors', step: 2, field: 'cognitive', labelHe: 'בריאות קוגניטיבית', labelEn: 'Cognitive Health', required: false },
  { section: 'שאלות לפי גיל - קשישים', sectionEn: 'Age-Specific - Seniors', step: 2, field: 'chronic_conditions', labelHe: 'מצבים כרוניים', labelEn: 'Chronic Conditions', required: false },
  { section: 'שאלות לפי גיל - קשישים', sectionEn: 'Age-Specific - Seniors', step: 2, field: 'bone_health', labelHe: 'בריאות עצמות', labelEn: 'Bone Health', required: false },
  { section: 'שאלות לפי גיל - קשישים', sectionEn: 'Age-Specific - Seniors', step: 2, field: 'vision_hearing', labelHe: 'ראייה ושמיעה', labelEn: 'Vision & Hearing', required: false },
  
  // Consent
  { section: 'הסכמה', sectionEn: 'Consent', step: 5, field: 'consent_signed', labelHe: 'חתימה על הסכמה', labelEn: 'Consent Signature', required: true },
];

/**
 * Download therapist intake form template as CSV
 */
export function downloadTherapistIntakeForm() {
  const BOM = '\uFEFF';
  const headers = ['מספר', 'קטגוריה', 'Category', 'שם שדה', 'Field Name', 'תיאור בעברית', 'Description in English', 'חובה?', 'Required?'];
  
  const rows = therapistIntakeFields.map((field, idx) => [
    idx + 1,
    `"${field.section}"`,
    `"${field.sectionEn}"`,
    field.field,
    field.field,
    `"${field.labelHe}"`,
    `"${field.labelEn}"`,
    field.required ? 'כן' : 'לא',
    field.required ? 'Yes' : 'No',
  ]);
  
  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `therapist_intake_form_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download patient intake form template as CSV
 */
export function downloadPatientIntakeForm() {
  const BOM = '\uFEFF';
  const headers = ['מספר', 'שלב', 'Step', 'קטגוריה', 'Category', 'שם שדה', 'Field Name', 'תיאור בעברית', 'Description in English', 'חובה?', 'Required?'];
  
  const rows = patientIntakeFields.map((field, idx) => [
    idx + 1,
    field.step,
    field.step,
    `"${field.section}"`,
    `"${field.sectionEn}"`,
    field.field,
    field.field,
    `"${field.labelHe}"`,
    `"${field.labelEn}"`,
    field.required ? 'כן' : 'לא',
    field.required ? 'Yes' : 'No',
  ]);
  
  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `patient_intake_form_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get counts for display
 */
export function getTherapistIntakeFieldCount() {
  return therapistIntakeFields.length;
}

export function getPatientIntakeFieldCount() {
  return patientIntakeFields.length;
}
