import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  ArrowRight, 
  Baby, 
  Briefcase, 
  Users, 
  Copy, 
  Mail, 
  Check, 
  Home,
  Brain,
  RefreshCw,
  Save,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { useAuth } from '@/hooks/useAuth';
import { usePatientAgeGender, SimplifiedAgeGroup } from '@/hooks/usePatientAgeGender';

type Language = 'he' | 'en' | 'ru';
type AgeGroup = 'pediatric' | 'adult' | 'elderly';

interface Translations {
  title: string;
  subtitle: string;
  selectAge: string;
  selectSymptoms: string;
  generate: string;
  copy: string;
  email: string;
  copied: string;
  copyPrompt: string;
  pediatric: string;
  adult: string;
  elderly: string;
  back: string;
  protocol: string;
  close: string;
  noSymptoms: string;
  restart: string;
}

const translations: Record<Language, Translations> = {
  he: {
    title: '🧠 הערכת בריאות המוח',
    subtitle: 'בחר קבוצת גיל וסמן סימפטומים',
    selectAge: 'בחר קבוצת גיל',
    selectSymptoms: 'בחר סימפטומים:',
    generate: '⚡ צור פרוטוקול',
    copy: 'העתק',
    email: '📧 שלח במייל',
    copied: 'הועתק!',
    copyPrompt: 'העתק לצ\'אט הראשי:',
    pediatric: '🧒 ילדים',
    adult: '💼 מבוגרים',
    elderly: '👴 גיל שלישי',
    back: 'חזרה',
    protocol: 'פרוטוקול טיפולי',
    close: 'סגור',
    noSymptoms: 'נא לבחור לפחות סימפטום אחד',
    restart: 'התחל מחדש',
  },
  en: {
    title: '🧠 Brain Health Assessment',
    subtitle: 'Select age group and mark symptoms',
    selectAge: 'Select age group',
    selectSymptoms: 'Select symptoms:',
    generate: '⚡ Generate Protocol',
    copy: 'Copy',
    email: '📧 Send via Email',
    copied: 'Copied!',
    copyPrompt: 'Copy to main chat:',
    pediatric: '🧒 Pediatric',
    adult: '💼 Adult',
    elderly: '👴 Elderly',
    back: 'Back',
    protocol: 'Treatment Protocol',
    close: 'Close',
    noSymptoms: 'Please select at least one symptom',
    restart: 'Start Over',
  },
  ru: {
    title: '🧠 Оценка здоровья мозга',
    subtitle: 'Выберите возрастную группу и отметьте симптомы',
    selectAge: 'Выберите возрастную группу',
    selectSymptoms: 'Выберите симптомы:',
    generate: '⚡ Создать протокол',
    copy: 'Копировать',
    email: '📧 Отправить по почте',
    copied: 'Скопировано!',
    copyPrompt: 'Скопировать в основной чат:',
    pediatric: '🧒 Дети',
    adult: '💼 Взрослые',
    elderly: '👴 Пожилые',
    back: 'Назад',
    protocol: 'Протокол лечения',
    close: 'Закрыть',
    noSymptoms: 'Пожалуйста, выберите хотя бы один симптом',
    restart: 'Начать сначала',
  },
};

interface Symptom {
  he: string;
  en: string;
  ru: string;
  points: string;
  formula: string;
}

const symptomData: Record<AgeGroup, Symptom[]> = {
  pediatric: [
    { he: 'איחור בהתפתחות הדיבור', en: 'Delayed speech development', ru: 'Задержка речевого развития', points: 'HT5 (Tongli), KI3 (Taixi), DU20 (Baihui)', formula: 'Bu Nao Wan' },
    { he: 'היפראקטיביות', en: 'Hyperactivity', ru: 'Гиперактивность', points: 'LR3 (Taichong), LI4 (Hegu), DU20', formula: 'Kong Sheng Zhen Zhong Dan' },
    { he: 'פחדי לילה', en: 'Night terrors', ru: 'Ночные кошмары', points: 'HT7 (Shenmen), LR2 (Xingjian), Yintang', formula: 'Dao Chi San' },
    { he: 'הרטבת לילה', en: 'Bedwetting', ru: 'Ночное недержание', points: 'UB23 (Shenshu), CV4 (Guanyuan), KI3', formula: 'Sang Piao Xiao San' },
    { he: 'קשיי ריכוז', en: 'Focus difficulties', ru: 'Трудности с концентрацией', points: 'SP6 (Sanyinjiao), HT7, Sishencong', formula: 'Gui Pi Tang' },
    { he: 'חרדת בחינות', en: 'Exam anxiety', ru: 'Экзаменационная тревога', points: 'HT7, GB40 (Qiuxu), PC6 (Neiguan)', formula: 'An Shen Ding Zhi Wan' },
    { he: 'תנודות במצב הרוח', en: 'Mood swings', ru: 'Перепады настроения', points: 'LR3, GB34 (Yanglingquan), PC6', formula: 'Xiao Yao San' },
    { he: 'עייפות כרונית', en: 'Chronic fatigue', ru: 'Хроническая усталость', points: 'SP9 (Yinlingquan), ST40, ST36', formula: 'Shen Ling Bai Zhu San' },
  ],
  adult: [
    { he: 'כאבי ראש מתח', en: 'Tension headaches', ru: 'Головные боли напряжения', points: 'GB20 (Fengchi), LR3, Taiyang', formula: 'Tian Ma Gou Teng Yin' },
    { he: 'שחיקה מקצועית', en: 'Work burnout', ru: 'Профессиональное выгорание', points: 'KI3 (Taixi), HT7, CV4', formula: 'Liu Wei Di Huang Wan' },
    { he: 'ערפול מוחי', en: 'Brain fog', ru: 'Туман в голове', points: 'ST36, SP3 (Taibai), CV12', formula: 'Xiang Sha Liu Jun Zi Tang' },
    { he: 'קושי בקבלת החלטות', en: 'Decision difficulty', ru: 'Трудности с решениями', points: 'GB40, GB34', formula: 'Wen Dan Tang' },
    { he: 'התקפי חרדה', en: 'Panic attacks', ru: 'Панические атаки', points: 'HT7, PC6, CV14 (Juque)', formula: 'Gui Pi Tang + Long Gu' },
    { he: 'נדודי שינה', en: 'Insomnia', ru: 'Бессонница', points: 'HT7, SP6, Anmian', formula: 'Suan Zao Ren Tang' },
    { he: 'עצבנות מוגברת', en: 'Irritability', ru: 'Раздражительность', points: 'LR2 (Xingjian), GB20, GB34', formula: 'Long Dan Xie Gan Tang' },
    { he: 'תחושת תקיעות', en: 'Feeling stuck', ru: 'Ощущение застоя', points: 'LR3, DU20, Yintang', formula: 'Chai Hu Shu Gan San' },
  ],
  elderly: [
    { he: 'ירידה קוגניטיבית', en: 'Cognitive decline', ru: 'Когнитивное снижение', points: 'GB39 (Xuanzhong), KI3, DU20', formula: 'Yi Zhi Yi Qi Tang' },
    { he: 'בלבול בשעות הערב', en: 'Sundowning', ru: 'Вечерняя спутанность', points: 'HT6 (Yinxi), KI6 (Zhaohai), Anmian', formula: 'Tian Wang Bu Xin Dan' },
    { he: 'ירידה בזיכרון', en: 'Memory loss', ru: 'Потеря памяти', points: 'HT7, PC6, Sishencong', formula: 'Gui Pi Tang' },
    { he: 'סחרחורת', en: 'Dizziness', ru: 'Головокружение', points: 'ST40 (Fenglong), GV20, PC6', formula: 'Ban Xia Bai Zhu Tian Ma Tang' },
    { he: 'רעד בידיים', en: 'Hand tremors', ru: 'Тремор рук', points: 'LR3, GB34, SI3 (Houxi)', formula: 'Da Ding Feng Zhu' },
    { he: 'קושי בהליכה', en: 'Walking difficulty', ru: 'Трудности при ходьбе', points: 'GB34, ST31 (Biguan), KI3', formula: 'Du Huo Ji Sheng Tang' },
    { he: 'טנטון', en: 'Tinnitus', ru: 'Шум в ушах', points: 'SJ21 (Ermen), SI19 (Tinggong), KI3', formula: 'Er Long Zuo Ci Wan' },
    { he: 'אי שליטה על שתן', en: 'Incontinence', ru: 'Недержание', points: 'CV4, UB23, CV6 (Qihai)', formula: 'Suo Quan Wan' },
  ],
};

export default function BrainHealthAssessment() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('he');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [ageGroupAutoDetected, setAgeGroupAutoDetected] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<number>>(new Set());
  const [generatedProtocol, setGeneratedProtocol] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const { user } = useAuth();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const createAssessment = useCreateAssessment();

  // Find selected patient data
  const selectedPatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  // Auto-detect age group and gender from patient data
  const patientAgeGender = usePatientAgeGender(selectedPatient);

  // Auto-set age group when patient is selected (only if not manually overridden)
  useEffect(() => {
    if (selectedPatient && patientAgeGender.isAutoDetected) {
      setAgeGroup(patientAgeGender.ageGroup);
      setAgeGroupAutoDetected(true);
      setSelectedSymptoms(new Set());
      setGeneratedProtocol('');
      
      // Notify user of auto-detection
      const ageLabel = language === 'he' ? patientAgeGender.ageGroupLabelHe : patientAgeGender.ageGroupLabel;
      toast.info(
        language === 'he' 
          ? `קבוצת גיל זוהתה אוטומטית: ${ageLabel}` 
          : `Age group auto-detected: ${ageLabel}`
      );
    }
  }, [selectedPatientId, patientAgeGender.isAutoDetected, patientAgeGender.ageGroup]);

  const t = translations[language];
  const isRTL = language === 'he';

  const toggleSymptom = useCallback((index: number) => {
    setSelectedSymptoms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const generateProtocol = useCallback(async () => {
    if (!ageGroup || selectedSymptoms.size === 0) {
      toast.error(t.noSymptoms);
      return;
    }

    const symptoms = symptomData[ageGroup];
    const selected = Array.from(selectedSymptoms).map(i => symptoms[i]);

    // Build the protocol text
    const ageLabels = { pediatric: 'Pediatric', adult: 'Adult', elderly: 'Elderly' };
    
    let protocol = `TCM Brain Health Protocol\n`;
    protocol += `Age Group: ${ageLabels[ageGroup]}\n`;
    protocol += `Selected Symptoms:\n\n`;

    selected.forEach((s, idx) => {
      protocol += `${idx + 1}. ${s.en}\n`;
      protocol += `   Points: ${s.points}\n`;
      protocol += `   Formula: ${s.formula}\n\n`;
    });

    // Collect unique points and formulas
    const allPoints = [...new Set(selected.flatMap(s => s.points.split(', ')))];
    const allFormulas = [...new Set(selected.map(s => s.formula))];

    protocol += `\n--- Summary ---\n`;
    protocol += `Recommended Points: ${allPoints.join(', ')}\n`;
    protocol += `Formulas: ${allFormulas.join(', ')}\n`;

    setGeneratedProtocol(protocol);

    // Save to patient record if patient is selected and user is logged in
    if (selectedPatientId && user) {
      const score = Math.round((selectedSymptoms.size / symptoms.length) * 100);
      try {
        await createAssessment.mutateAsync({
          patient_id: selectedPatientId,
          assessment_type: 'brain',
          score,
          summary: `${ageLabels[ageGroup]} - ${selectedSymptoms.size} symptoms`,
          details: {
            ageGroup,
            selectedSymptoms: selected.map(s => s.en),
            points: allPoints,
            formulas: allFormulas,
            protocol,
          },
          status: 'saved',
        });
      } catch (error) {
        console.error('Failed to save assessment:', error);
      }
    }
  }, [ageGroup, selectedSymptoms, t, selectedPatientId, user, createAssessment]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedProtocol);
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [generatedProtocol, t]);

  const sendEmail = useCallback(() => {
    const subject = encodeURIComponent('Brain Health TCM Protocol');
    const body = encodeURIComponent(generatedProtocol);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [generatedProtocol]);

  const restart = useCallback(() => {
    setAgeGroup(null);
    setSelectedSymptoms(new Set());
    setGeneratedProtocol('');
  }, []);

  const currentSymptoms = ageGroup ? symptomData[ageGroup] : [];

  return (
    <>
      <Helmet>
        <title>{t.title}</title>
        <meta name="description" content="Brain health assessment tool with TCM protocols" />
      </Helmet>

      <div 
        className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-4xl mx-auto">
          {/* Language Bar */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              {isRTL ? 'חזרה לדשבורד' : 'Back to Dashboard'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant={language === 'he' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('he')}
              >
                🇮🇱 HE
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                🇺🇸 EN
              </Button>
              <Button
                variant={language === 'ru' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('ru')}
              >
                🇷🇺 RU
              </Button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Patient Selector */}
          {user && patients.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{isRTL ? 'שייך למטופל:' : 'Link to patient:'}</span>
                  {patientsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder={isRTL ? 'בחר מטופל (אופציונלי)...' : 'Select patient (optional)...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{isRTL ? 'ללא שיוך' : 'No patient'}</SelectItem>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedPatientId && selectedPatientId !== 'none' && (
                    <Badge variant="secondary" className="gap-1">
                      <Save className="h-3 w-3" />
                      {isRTL ? 'יישמר בתיק' : 'Will save to record'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Age Group Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {(['pediatric', 'adult', 'elderly'] as AgeGroup[]).map((group) => {
              const icons = {
                pediatric: Baby,
                adult: Briefcase,
                elderly: Users,
              };
              const Icon = icons[group];
              const colors = {
                pediatric: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/50 text-emerald-600',
                adult: 'from-blue-500/20 to-blue-500/5 border-blue-500/50 text-blue-600',
                elderly: 'from-orange-500/20 to-orange-500/5 border-orange-500/50 text-orange-600',
              };

              return (
                <motion.button
                  key={group}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAgeGroup(group);
                    setAgeGroupAutoDetected(false); // Manual selection overrides auto-detection
                    setSelectedSymptoms(new Set());
                    setGeneratedProtocol('');
                  }}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-300 relative
                    bg-gradient-to-br ${colors[group]}
                    ${ageGroup === group ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : 'hover:shadow-md'}
                  `}
                >
                  {ageGroup === group && ageGroupAutoDetected && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Sparkles className="h-3 w-3" />
                        {isRTL ? 'אוטו' : 'Auto'}
                      </Badge>
                    </div>
                  )}
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <span className="font-semibold">{t[group]}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Symptoms Section */}
          <AnimatePresence mode="wait">
            {ageGroup && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">{t.selectSymptoms}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentSymptoms.map((symptom, index) => (
                        <label
                          key={index}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                            transition-all duration-200
                            ${selectedSymptoms.has(index) 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-card hover:bg-muted/50 border-border'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSymptoms.has(index)}
                            onChange={() => toggleSymptom(index)}
                            className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                          />
                          <span className="text-sm">
                            {symptom[language]}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3 flex-wrap">
                      <Button
                        onClick={generateProtocol}
                        className="gap-2"
                        disabled={selectedSymptoms.size === 0}
                      >
                        ⚡ {t.generate}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={restart}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t.restart}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Area */}
          <AnimatePresence>
            {generatedProtocol && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-slate-900 text-slate-100">
                  <CardContent className="pt-6">
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? t.copied : t.copy}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={sendEmail}
                        className="gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {t.email}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{t.copyPrompt}</p>
                    <pre className="bg-slate-800/50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                      {generatedProtocol}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
