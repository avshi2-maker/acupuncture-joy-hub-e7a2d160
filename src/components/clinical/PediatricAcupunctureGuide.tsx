import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Baby, Shield, FileText, Clock, Stethoscope, Hand, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SubjectKey = 'age-methods' | 'techniques' | 'safety' | 'warnings' | 'protocols' | 'sessions' | 'documentation';

const SUBJECTS_EN: { value: SubjectKey; label: string; icon: React.ReactNode }[] = [
  { value: 'age-methods', label: 'Age-Appropriate Methods', icon: <Baby className="h-4 w-4" /> },
  { value: 'techniques', label: 'Techniques (Shonishin & Tuina)', icon: <Hand className="h-4 w-4" /> },
  { value: 'safety', label: 'Safety & Contraindications', icon: <Shield className="h-4 w-4" /> },
  { value: 'warnings', label: 'Critical Safety Warnings', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'protocols', label: 'Treatment Protocols & Points', icon: <Stethoscope className="h-4 w-4" /> },
  { value: 'sessions', label: 'Session Guidelines', icon: <Clock className="h-4 w-4" /> },
  { value: 'documentation', label: 'Documentation & Qualifications', icon: <FileText className="h-4 w-4" /> },
];

const SUBJECTS_HE: { value: SubjectKey; label: string; icon: React.ReactNode }[] = [
  { value: 'age-methods', label: 'שיטות טיפול לפי גיל', icon: <Baby className="h-4 w-4" /> },
  { value: 'techniques', label: 'טכניקות (שוניישין וטואינה)', icon: <Hand className="h-4 w-4" /> },
  { value: 'safety', label: 'בטיחות והתוויות נגד', icon: <Shield className="h-4 w-4" /> },
  { value: 'warnings', label: 'אזהרות בטיחות קריטיות', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'protocols', label: 'פרוטוקולי טיפול ונקודות', icon: <Stethoscope className="h-4 w-4" /> },
  { value: 'sessions', label: 'הנחיות לטיפול', icon: <Clock className="h-4 w-4" /> },
  { value: 'documentation', label: 'תיעוד וכישורים', icon: <FileText className="h-4 w-4" /> },
];

interface PediatricAcupunctureGuideProps {
  className?: string;
  defaultLanguage?: 'en' | 'he';
}

export function PediatricAcupunctureGuide({ className, defaultLanguage = 'he' }: PediatricAcupunctureGuideProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | ''>('');
  const [language, setLanguage] = useState<'en' | 'he'>(defaultLanguage);
  
  const isHebrew = language === 'he';
  const subjects = isHebrew ? SUBJECTS_HE : SUBJECTS_EN;

  return (
    <Card className={className} dir={isHebrew ? 'rtl' : 'ltr'}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(isHebrew ? 'en' : 'he')}
            className="gap-1"
          >
            <Globe className="h-4 w-4" />
            {isHebrew ? 'EN' : 'עב'}
          </Button>
          <CardTitle className="text-xl md:text-2xl text-primary flex items-center justify-center gap-2 flex-1">
            <Baby className="h-5 w-5 md:h-6 md:w-6" />
            {isHebrew ? 'המדריך המלא לדיקור סיני בילדים' : 'Complete Pediatric Acupuncture Guide'}
          </CardTitle>
          <div className="w-16" />
        </div>
        <p className="text-sm text-muted-foreground">
          {isHebrew ? 'בטיחות ושיטות טיפול' : 'Safety & Treatment Methods'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as SubjectKey)}>
            <SelectTrigger className="w-full max-w-md border-2 border-primary/50 hover:bg-primary/5">
              <SelectValue placeholder={isHebrew ? 'בחר נושא לצפייה...' : 'Select a Subject to View...'} />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              {subjects.map((subject) => (
                <SelectItem key={subject.value} value={subject.value} className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    {subject.icon}
                    {subject.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence mode="wait">
          {selectedSubject && (
            <motion.div
              key={selectedSubject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selectedSubject === 'age-methods' && <AgeMethodsSection isHebrew={isHebrew} />}
              {selectedSubject === 'techniques' && <TechniquesSection isHebrew={isHebrew} />}
              {selectedSubject === 'safety' && <SafetySection isHebrew={isHebrew} />}
              {selectedSubject === 'warnings' && <WarningsSection isHebrew={isHebrew} />}
              {selectedSubject === 'protocols' && <ProtocolsSection isHebrew={isHebrew} />}
              {selectedSubject === 'sessions' && <SessionsSection isHebrew={isHebrew} />}
              {selectedSubject === 'documentation' && <DocumentationSection isHebrew={isHebrew} />}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary mb-3 rtl:border-l-0 rtl:border-r-4">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 mb-4 text-foreground">
      {children}
    </h3>
  );
}

function AgeMethodsSection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>שיטות טיפול לפי גיל</SectionTitle>
        <InfoCard>
          <strong>תינוקות (0-2):</strong> שוניישין (ללא מחטים), ליטוף ולחיצות. מחטים דקיקות (46G) רק במידת הצורך.
        </InfoCard>
        <InfoCard>
          <strong>ילדים צעירים (2-8):</strong> דיקור שטחי מאוד והוצאה מהירה. שוניישין יעיל מאוד.
        </InfoCard>
        <InfoCard>
          <strong>מתבגרים (8-18):</strong> השארת מחטים ל-1 עד 15 דקות בהתאם לנוחות.
        </InfoCard>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>Age-Appropriate Treatment Methods</SectionTitle>
      <InfoCard>
        <strong>Infants (0-2 years):</strong> Primarily Shonishin (non-insertive). If needles are used: 46-gauge 0.5-inch needles, immediate in/out technique, depth 0.12-0.25 inches.
      </InfoCard>
      <InfoCard>
        <strong>Young Children (2-8 years):</strong> 44-46 gauge 0.5-inch needles. Shallow insertion (0.12-0.5 inches). Quick in/out or brief retention (10s to minutes). Shonishin highly effective.
      </InfoCard>
      <InfoCard>
        <strong>Older Children & Adolescents (8-18 years):</strong> 42-44 gauge 0.5-1 inch needles. Retention 1-15 minutes based on age/comfort. Depths 0.25-0.5 inches.
      </InfoCard>
    </div>
  );
}

function TechniquesSection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>טכניקות מיוחדות</SectionTitle>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-primary mb-2">שוניישין (ללא דיקור)</h4>
            <InfoCard>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>כלים:</strong> מכשירים מעוגלים (כסף, זהב, אבן) - אנשין, טיישין, זנשין.</li>
                <li><strong>טכניקה:</strong> ליטוף קצבי, שפשוף, הקשה, לחיצה (ללא דיקור).</li>
                <li><strong>משך:</strong> 15-20 דקות. הילד נשאר לבוש.</li>
                <li><strong>תדירות:</strong> מספר פעמים בשבוע עד להחלמה. ההורים יכולים להשתמש בכף כסף בבית.</li>
              </ul>
            </InfoCard>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">טואינה ילדים (עיסוי)</h4>
            <InfoCard>
              לגילאי 0-9. משלבת דיקור לחץ ומניפולציה לשחרור חסימות צ'י ודם. מטפלת בבעיות עיכול, קוליק, מצבי נשימה וחיזוק חיסוני.
            </InfoCard>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>Specialized Techniques</SectionTitle>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-primary mb-2">Shonishin (Non-Invasive)</h4>
          <InfoCard>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Tools:</strong> Rounded instruments (silver, gold, stone, shell) - enshin, teishin, zanshin.</li>
              <li><strong>Technique:</strong> Rhythmic stroking, rubbing, tapping, pressing (no insertion).</li>
              <li><strong>Duration:</strong> 15-20 mins. Child remains clothed/diapered.</li>
              <li><strong>Frequency:</strong> Several times weekly until resolution. Parents can use silver teaspoon for home care.</li>
            </ul>
          </InfoCard>
        </div>
        <div>
          <h4 className="font-semibold text-primary mb-2">Pediatric Tuina (Massage)</h4>
          <InfoCard>
            For ages 0-9. Incorporates acupressure and manipulation to clear Qi/blood blockages. Treats digestive issues, colic, respiratory conditions, and boosts immunity.
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function SafetySection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>בטיחות והתוויות נגד</SectionTitle>
        <InfoCard>
          שיעור תופעות לוואי: <strong>1.55 לכל 100 טיפולים</strong> (אדמומיות קלה/עייפות).
          שיעור תופעות חמורות: <strong>5.36 לכל 10,000</strong>.
          ללא פגיעות קבועות במחקרים של 782 מטופלים.
        </InfoCard>
        
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>התוויות נגד מוחלטות</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>תנועות בלתי נשלטות/בעיות התנהגות חמורות.</li>
              <li>מצבי חירום רפואיים הדורשים טיפול קונבנציונלי.</li>
              <li>זיהומים פעילים באזור, הפרעות דימום חמורות.</li>
              <li><strong>נקודות לא:</strong> פונטנלות (מתחת לגיל 7); נקודות הריון אצל מתבגרות (LI4, SP6, BL60, BL67, סקרל).</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">התוויות נגד יחסיות</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 text-amber-800 dark:text-amber-300">
              <li>גידולים ממאירים (לא להחליף אונקולוגיה).</li>
              <li>מצב מדוכא חיסונית (סיכון זיהום).</li>
              <li>גפיים נפוחות, פחד מחטים, אזורי טראומה/ניתוח אחרונים (להמתין 6-8 שבועות).</li>
              <li>תינוקות מתחת לחודש (להעדיף שוניישין).</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>Safety Profile & Contraindications</SectionTitle>
      <InfoCard>
        Adverse event rate: <strong>1.55 per 100 treatments</strong> (minor redness/sedation). 
        Serious adverse event rate: <strong>5.36 per 10,000</strong>. 
        No permanent injuries in reviewed trials of 782 patients.
      </InfoCard>
      
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>ABSOLUTE CONTRAINDICATIONS</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Uncontrolled movements/severe behavioral issues.</li>
            <li>Medical emergencies requiring conventional care.</li>
            <li>Active infections at site, severe bleeding disorders.</li>
            <li><strong>Avoid Specific Points:</strong> Fontanelles (under 7 yrs); Pregnancy points in adolescents (LI4, SP6, BL60, BL67, Sacral).</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700 dark:text-amber-400">RELATIVE CONTRAINDICATIONS</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-amber-800 dark:text-amber-300">
            <li>Malignant tumors (do not replace oncology).</li>
            <li>Immunocompromised status (infection risk).</li>
            <li>Edematous limbs, needle phobia, recent trauma/surgery sites (wait 6-8 weeks).</li>
            <li>Infants {"<"} 1 month (Prefer Shonishin).</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WarningsSection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>🚨 אזהרות בטיחות קריטיות</SectionTitle>
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>עובי מחט</AlertTitle>
            <AlertDescription>
              בתינוקות השתמשו ב-46G (הדק ביותר). לעולם אל תשתמשו במחטי מבוגרים רגילות!
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>עומק</AlertTitle>
            <AlertDescription>
              אין לעבור עומק של 0.5 אינץ' בילדים מתחת לגיל 12.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>היגיינה</AlertTitle>
            <AlertDescription>
              שימוש במחטים חד-פעמיות וסטריליות בלבד.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>הסכמה</AlertTitle>
            <AlertDescription>
              חובה לקבל הסכמת הורים ונוכחות הורה בחדר.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>🚨 Critical Safety Warnings</SectionTitle>
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Needle Depth</AlertTitle>
          <AlertDescription>
            Never exceed 0.5 inches in children {"<"} 12. Precise depth needed for upper back/chest (pneumothorax risk). Angle away from vital organs.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Needle Gauge</AlertTitle>
          <AlertDescription>
            Never use adult needles (32-36g). Use 46g for babies, 44-46g for toddlers, 42-44g for adolescents.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sterility</AlertTitle>
          <AlertDescription>
            Single-use sterile disposables only. Strict aseptic technique.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Consent</AlertTitle>
          <AlertDescription>
            Informed parental consent required. Parent must be present. Child has right to refuse.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function ProtocolsSection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>נקודות טיפול נפוצות</SectionTitle>
        <div className="space-y-3">
          <InfoCard>
            <strong>עיכול (קוליק/עצירות):</strong> CV 8 (לחיצה בלבד), CV 12, ST 36, SP 6, עיסוי בטן (Tuina).
          </InfoCard>
          <InfoCard>
            <strong>נשימה (אסתמה/הצטננות):</strong> LU 1-2, CV 17, BL 13 (דיקור מינימלי).
          </InfoCard>
          <InfoCard>
            <strong>שינה וחרדה:</strong> HT 7, Yintang (בין הגבות).
          </InfoCard>
          <InfoCard>
            <strong>חיזוק חיסוני:</strong> ST 36 (מעל גיל שנתיים), LI 4.
          </InfoCard>
          <InfoCard>
            <strong>התפתחות:</strong> GV 20, Sishencong, אזורי קרקפת.
          </InfoCard>
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>Recommended Points by Condition</SectionTitle>
      <div className="space-y-3">
        <InfoCard>
          <strong>Digestive (Colic/Constipation):</strong> CV 8 (pressure only), CV 12, ST 36, SP 6, Tuina abdominal massage.
        </InfoCard>
        <InfoCard>
          <strong>Respiratory (Asthma/Colds):</strong> LU 1-2, CV 17, BL 13 (minimal insertion).
        </InfoCard>
        <InfoCard>
          <strong>Sleep & Anxiety:</strong> HT 7, PC 6, Yintang, Anmian.
        </InfoCard>
        <InfoCard>
          <strong>Immune Support:</strong> ST 36 (Primary pediatric point), LI 4 ({">"}2 yrs), LI 11.
        </InfoCard>
        <InfoCard>
          <strong>Developmental:</strong> GV 20, Sishencong, Scalp zones.
        </InfoCard>
      </div>
    </div>
  );
}

function SessionsSection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>הנחיות לטיפול</SectionTitle>
        <InfoCard>
          <strong>הכנה:</strong> חדר חם, צעצועים להסחה. שפה פשוטה. אפשרו לילד לגעת במחט נקייה (אם מתאים).
        </InfoCard>
        <InfoCard>
          <strong>במהלך:</strong> מינימום מחטים (4-8 מקסימום). דיקור מהיר. עצרו מיד אם הילד במצוקה. לעולם אל תכפו טיפול.
        </InfoCard>
        <InfoCard>
          <strong>תדירות:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>חריף: 2-3 פעמים בשבוע ל-2-4 שבועות</li>
            <li>כרוני: פעם בשבוע ל-8-12 שבועות</li>
            <li>תחזוקה: חודשי</li>
          </ul>
        </InfoCard>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>Treatment Session Guidelines</SectionTitle>
      <InfoCard>
        <strong>Preparation:</strong> Warm room, toys/distractions. Use simple language. Allow child to touch clean needle (if appropriate).
      </InfoCard>
      <InfoCard>
        <strong>During:</strong> Min. needles (4-8 max). Quick insertion. Stop immediately if child is distressed. Never force treatment.
      </InfoCard>
      <InfoCard>
        <strong>Frequency:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Acute: 2-3x/week for 2-4 weeks</li>
          <li>Chronic: 1x/week for 8-12 weeks</li>
          <li>Maintenance: Monthly</li>
        </ul>
      </InfoCard>
    </div>
  );
}

function DocumentationSection({ isHebrew }: { isHebrew: boolean }) {
  if (isHebrew) {
    return (
      <div>
        <SectionTitle>תיעוד ודגלים אדומים</SectionTitle>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>עצרו טיפול והפנו אם:</AlertTitle>
          <AlertDescription>
            חום לאחר טיפול, דימום מוגזם, סימני זיהום, כאב חמור, תסמינים נוירולוגיים, תגובה אלרגית, או שהמצב מחמיר לאחר 4-6 טיפולים.
          </AlertDescription>
        </Alert>
        <InfoCard>
          <strong>תיעוד:</strong> רשמו גיל, משקל, מצב התפתחותי, עובי מחט/עומק/זמן השארה, תגובת הילד ותופעות לוואי.
        </InfoCard>
        <InfoCard>
          <strong>כישורים:</strong> אנשי מקצוע - הטיפול יבוצע רק ע"י מטפל מוסמך עם התמחות בילדים.
        </InfoCard>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>Documentation & Red Flags</SectionTitle>
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>STOP Treatment & Refer If:</AlertTitle>
        <AlertDescription>
          Fever post-treatment, excessive bleeding, signs of infection, severe pain, neurological symptoms, allergic reaction, or condition worsens after 4-6 treatments.
        </AlertDescription>
      </Alert>
      <InfoCard>
        <strong>Documentation:</strong> Record age, weight, developmental status, needle gauge/depth/retention, child's response, and adverse reactions.
      </InfoCard>
      <InfoCard>
        <strong>Qualifications:</strong> Licensed acupuncturist with pediatric specialization/Shonishin training, pediatric CPR cert, and appropriate malpractice coverage.
      </InfoCard>
    </div>
  );
}

export default PediatricAcupunctureGuide;
