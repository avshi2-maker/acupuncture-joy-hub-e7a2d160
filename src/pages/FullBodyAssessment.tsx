import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Home,
  RefreshCw,
  Copy,
  Mail,
  Check,
  Heart,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Language = 'he' | 'en' | 'ru';

interface Translations {
  title: string;
  subtitle: string;
  generate: string;
  copy: string;
  email: string;
  copied: string;
  copyPrompt: string;
  back: string;
  restart: string;
  noSymptoms: string;
  protocol: string;
  selectPatient: string;
  guest: string;
}

interface PatientOption {
  id: string;
  name: string;
}

const translations: Record<Language, Translations> = {
  he: {
    title: '🧘 אבחון גוף מלא (15 מדדים)',
    subtitle: 'סמן את כל התופעות שאתה חווה כרגע ליצירת תמונת מצב מלאה',
    generate: '⚡ צור פרוטוקול ושמור בתיק',
    copy: 'העתק',
    email: '📧 שלח במייל',
    copied: 'הועתק!',
    copyPrompt: 'פרוטוקול לשימוש במערכת (העתק/י):',
    back: 'חזרה',
    restart: 'התחל מחדש',
    noSymptoms: 'נא לבחור לפחות סימפטום אחד',
    protocol: 'פרוטוקול טיפולי',
    selectPatient: 'שיוך למטופל:',
    guest: 'אורח (לא לשמור)',
  },
  en: {
    title: '🧘 Full Body Assessment (15 Points)',
    subtitle: 'Select all symptoms you are currently experiencing to create a complete picture',
    generate: '⚡ Generate Protocol & Save',
    copy: 'Copy',
    email: '📧 Send via Email',
    copied: 'Copied!',
    copyPrompt: 'Protocol for use (copy):',
    back: 'Back',
    restart: 'Start Over',
    noSymptoms: 'Please select at least one symptom',
    protocol: 'Treatment Protocol',
    selectPatient: 'Assign to patient:',
    guest: 'Guest (do not save)',
  },
  ru: {
    title: '🧘 Полная оценка тела (15 точек)',
    subtitle: 'Отметьте все симптомы, которые вы испытываете сейчас',
    generate: '⚡ Создать и сохранить протокол',
    copy: 'Копировать',
    email: '📧 Отправить по почте',
    copied: 'Скопировано!',
    copyPrompt: 'Протокол для использования (копировать):',
    back: 'Назад',
    restart: 'Начать сначала',
    noSymptoms: 'Пожалуйста, выберите хотя бы один симптом',
    protocol: 'Протокол лечения',
    selectPatient: 'Назначить пациенту:',
    guest: 'Гость (не сохранять)',
  },
};

// Mock patients - will be replaced with real Supabase data
const mockPatients: PatientOption[] = [
  { id: '1', name: 'ישראל ישראלי' },
  { id: '2', name: 'שרה כהן' },
  { id: '3', name: 'דוד לוי' },
];

interface BodyMetric {
  id: string;
  he: string;
  en: string;
  ru: string;
  category: string;
  points: string;
  formula: string;
}

const bodyMetrics: BodyMetric[] = [
  // Energy & Vitality
  { id: 'fatigue', he: 'עייפות כרונית', en: 'Chronic fatigue', ru: 'Хроническая усталость', category: 'Energy', points: 'ST36, SP6, CV6', formula: 'Bu Zhong Yi Qi Tang' },
  { id: 'lowEnergy', he: 'חוסר אנרגיה בבוקר', en: 'Low morning energy', ru: 'Низкая энергия утром', category: 'Energy', points: 'KI3, GV4, UB23', formula: 'Jin Gui Shen Qi Wan' },
  { id: 'afternoonCrash', he: 'נפילת אנרגיה אחה"צ', en: 'Afternoon energy crash', ru: 'Упадок сил днём', category: 'Energy', points: 'ST36, SP3, CV12', formula: 'Si Jun Zi Tang' },
  
  // Sleep
  { id: 'insomnia', he: 'קושי להירדם', en: 'Difficulty falling asleep', ru: 'Трудности с засыпанием', category: 'Sleep', points: 'HT7, SP6, Anmian', formula: 'Suan Zao Ren Tang' },
  { id: 'waking', he: 'התעוררות בלילה', en: 'Waking during night', ru: 'Пробуждение ночью', category: 'Sleep', points: 'HT7, KI6, Yintang', formula: 'Tian Wang Bu Xin Dan' },
  { id: 'dreams', he: 'חלומות מטרידים', en: 'Disturbing dreams', ru: 'Беспокойные сны', category: 'Sleep', points: 'HT7, PC6, UB15', formula: 'An Shen Ding Zhi Wan' },
  
  // Digestion
  { id: 'bloating', he: 'נפיחות בטן', en: 'Abdominal bloating', ru: 'Вздутие живота', category: 'Digestion', points: 'CV12, ST36, SP6', formula: 'Xiang Sha Liu Jun Zi Tang' },
  { id: 'constipation', he: 'עצירות', en: 'Constipation', ru: 'Запор', category: 'Digestion', points: 'ST25, SJ6, KI6', formula: 'Ma Zi Ren Wan' },
  { id: 'appetite', he: 'חוסר תיאבון', en: 'Lack of appetite', ru: 'Отсутствие аппетита', category: 'Digestion', points: 'CV12, ST36, SP3', formula: 'Liu Jun Zi Tang' },
  
  // Emotional
  { id: 'anxiety', he: 'חרדה ומתח', en: 'Anxiety and tension', ru: 'Тревога и напряжение', category: 'Emotional', points: 'PC6, HT7, Yintang', formula: 'Chai Hu Jia Long Gu Mu Li Tang' },
  { id: 'irritability', he: 'עצבנות מוגברת', en: 'Irritability', ru: 'Раздражительность', category: 'Emotional', points: 'LV3, GB34, LI4', formula: 'Long Dan Xie Gan Tang' },
  { id: 'lowMood', he: 'מצב רוח ירוד', en: 'Low mood', ru: 'Пониженное настроение', category: 'Emotional', points: 'LV3, LI4, Yintang', formula: 'Xiao Yao San' },
  
  // Physical Pain
  { id: 'headache', he: 'כאבי ראש', en: 'Headaches', ru: 'Головные боли', category: 'Pain', points: 'GB20, LI4, Taiyang', formula: 'Chuan Xiong Cha Tiao San' },
  { id: 'backPain', he: 'כאבי גב תחתון', en: 'Lower back pain', ru: 'Боль в пояснице', category: 'Pain', points: 'UB23, UB40, GV4', formula: 'Du Huo Ji Sheng Tang' },
  { id: 'neckTension', he: 'מתח בצוואר וכתפיים', en: 'Neck and shoulder tension', ru: 'Напряжение в шее и плечах', category: 'Pain', points: 'GB21, GB20, LI4', formula: 'Ge Gen Tang' },
];

export default function FullBodyAssessment() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('he');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [generatedProtocol, setGeneratedProtocol] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('guest');

  const t = translations[language];
  const isRTL = language === 'he';
  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);

  const toggleSymptom = useCallback((id: string) => {
    setSelectedSymptoms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const generateProtocol = useCallback(() => {
    if (selectedSymptoms.size === 0) {
      toast.error(t.noSymptoms);
      return;
    }

    const selected = bodyMetrics.filter(m => selectedSymptoms.has(m.id));
    
    // Build protocol with patient info
    let protocol = `TCM Full Body Assessment Protocol\n`;
    if (selectedPatient) {
      protocol += `PATIENT_ID: ${selectedPatient.name}\n`;
    } else if (selectedPatientId !== 'guest') {
      protocol += `PATIENT_ID: Unknown\n`;
    }
    protocol += `Total Indicators: ${selected.length} / ${bodyMetrics.length}\n\n`;
    protocol += `Selected Symptoms:\n`;

    // Group by category
    const categories = [...new Set(selected.map(s => s.category))];
    
    categories.forEach(category => {
      const categorySymptoms = selected.filter(s => s.category === category);
      protocol += `\n📌 ${category}:\n`;
      categorySymptoms.forEach(s => {
        protocol += `  • ${s.en}\n`;
        protocol += `    Points: ${s.points}\n`;
        protocol += `    Formula: ${s.formula}\n`;
      });
    });

    // Summary
    const allPoints = [...new Set(selected.flatMap(s => s.points.split(', ')))];
    const allFormulas = [...new Set(selected.map(s => s.formula))];

    protocol += `\n--- Summary ---\n`;
    protocol += `Recommended Points: ${allPoints.join(', ')}\n`;
    protocol += `Formulas: ${allFormulas.join(', ')}\n`;

    setGeneratedProtocol(protocol);
  }, [selectedSymptoms, t]);

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
    const subject = encodeURIComponent('Full Body TCM Protocol');
    const body = encodeURIComponent(generatedProtocol);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [generatedProtocol]);

  const restart = useCallback(() => {
    setSelectedSymptoms(new Set());
    setGeneratedProtocol('');
  }, []);

  // Group symptoms by category for display
  const categories = [...new Set(bodyMetrics.map(m => m.category))];

  return (
    <>
      <Helmet>
        <title>{t.title}</title>
        <meta name="description" content="Full body holistic assessment tool with TCM protocols - 15 key health indicators" />
      </Helmet>

      <div 
        className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-500/5 py-8 px-4"
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

          {/* Patient Selector */}
          <Card className="mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4 flex-wrap">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium">{t.selectPatient}</span>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">{t.guest}</SelectItem>
                    {mockPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <Heart className="h-8 w-8 text-emerald-500" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
            
            {/* Progress indicator */}
            <div className="mt-4 inline-flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                {selectedSymptoms.size} / {bodyMetrics.length}
              </span>
              <span className="text-xs text-muted-foreground">selected</span>
            </div>
          </div>

          {/* Symptoms by Category */}
          <div className="space-y-6 mb-8">
            {categories.map(category => (
              <Card key={category} className="overflow-hidden">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bodyMetrics
                      .filter(m => m.category === category)
                      .map(metric => (
                        <label
                          key={metric.id}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                            transition-all duration-200
                            ${selectedSymptoms.has(metric.id) 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : 'bg-card hover:bg-muted/50 border-border'
                            }
                          `}
                        >
                          <Checkbox
                            checked={selectedSymptoms.has(metric.id)}
                            onCheckedChange={() => toggleSymptom(metric.id)}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm block truncate">
                              {metric[language]}
                            </span>
                          </div>
                        </label>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap justify-center mb-8">
            <Button
              onClick={generateProtocol}
              size="lg"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={selectedSymptoms.size === 0}
            >
              ⚡ {t.generate}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={restart}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t.restart}
            </Button>
          </div>

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
                    <pre className="bg-slate-800/50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto max-h-96">
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
