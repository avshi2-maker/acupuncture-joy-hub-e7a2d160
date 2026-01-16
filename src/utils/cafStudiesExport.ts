/**
 * CAF Studies Export Utility
 * Downloads all CAF studies data as a structured CSV file
 */

import { supabase } from '@/integrations/supabase/client';

interface CAFStudy {
  id: number;
  system_category: string;
  western_label: string;
  tcm_pattern: string;
  key_symptoms: string | null;
  pulse_tongue: string | null;
  treatment_principle: string | null;
  acupoints_display: string | null;
  pharmacopeia_formula: string | null;
  deep_thinking_note: string | null;
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 */
function escapeCSVField(field: string | null | undefined): string {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  // If the field contains commas, quotes, or newlines, wrap in quotes and escape existing quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

/**
 * Fetch and download all CAF studies as CSV
 */
export async function downloadCAFStudies(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('caf_master_studies')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching CAF studies:', error);
      return { success: false, count: 0, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, count: 0, error: 'No studies found' };
    }

    const studies = data as CAFStudy[];

    // Create CSV content with BOM for Excel Hebrew support
    const BOM = '\uFEFF';
    const headers = [
      'ID',
      'System Category',
      'קטגוריית מערכת',
      'Western Diagnosis',
      'אבחנה מערבית',
      'TCM Pattern',
      'תבנית רפואה סינית',
      'Key Symptoms',
      'תסמינים עיקריים',
      'Pulse & Tongue',
      'דופק ולשון',
      'Treatment Principle',
      'עקרון טיפולי',
      'Acupoints',
      'נקודות דיקור',
      'Herbal Formula',
      'פורמולת צמחים',
      'Clinical Notes',
      'הערות קליניות'
    ];

    const rows = studies.map((study) => [
      study.id,
      escapeCSVField(study.system_category),
      escapeCSVField(translateSystemCategory(study.system_category)),
      escapeCSVField(study.western_label),
      escapeCSVField(study.western_label), // Could add Hebrew translations if available
      escapeCSVField(study.tcm_pattern),
      escapeCSVField(study.tcm_pattern), // TCM patterns often already in Chinese
      escapeCSVField(study.key_symptoms),
      escapeCSVField(study.key_symptoms),
      escapeCSVField(study.pulse_tongue),
      escapeCSVField(study.pulse_tongue),
      escapeCSVField(study.treatment_principle),
      escapeCSVField(study.treatment_principle),
      escapeCSVField(study.acupoints_display),
      escapeCSVField(study.acupoints_display),
      escapeCSVField(study.pharmacopeia_formula),
      escapeCSVField(study.pharmacopeia_formula),
      escapeCSVField(study.deep_thinking_note),
      escapeCSVField(study.deep_thinking_note)
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caf_studies_complete_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: studies.length };
  } catch (err) {
    console.error('Error exporting CAF studies:', err);
    return { success: false, count: 0, error: 'Export failed' };
  }
}

/**
 * Translate system category to Hebrew
 */
function translateSystemCategory(category: string): string {
  const translations: Record<string, string> = {
    'Respiratory': 'מערכת הנשימה',
    'Digestive': 'מערכת העיכול',
    'Cardiovascular': 'מערכת הלב וכלי הדם',
    'Psychological': 'פסיכולוגי',
    'Musculoskeletal': 'שלד ושרירים',
    'Neurological': 'נוירולוגי',
    'Gynecology': 'גינקולוגיה',
    'Dermatology': 'עור',
    'Mens Health': 'בריאות הגבר',
    'Metabolic': 'מטבולי',
    'Immunology': 'אימונולוגיה',
    'Endocrine': 'אנדוקריני',
    'Eye/Ear': 'עיניים/אוזניים',
    'Pain Management': 'ניהול כאב',
    'Addiction': 'התמכרויות',
    'Pediatrics': 'ילדים',
    'Internal': 'פנימי',
    'Autoimmune': 'אוטואימוני',
    'Geriatrics': 'גריאטריה',
    'Skin': 'עור',
    'Acute': 'חריף',
    'Gastro': 'גסטרו',
    'Energy': 'אנרגיה',
    'Sleep': 'שינה',
  };
  return translations[category] || category;
}
