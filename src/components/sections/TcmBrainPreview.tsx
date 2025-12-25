import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, FileText, ClipboardList, Pill, ArrowLeft, Sparkles } from 'lucide-react';

// Symptom Analysis Questions (50)
const symptomQuestions = [
  { id: 's1', question: 'מהו התסמין העיקרי?', category: 'כללי' },
  { id: 's2', question: 'מתי התחילו התסמינים?', category: 'כללי' },
  { id: 's3', question: 'האם יש כאב? היכן?', category: 'כאב' },
  { id: 's4', question: 'מהו אופי הכאב? (חד, עמום, דוקר)', category: 'כאב' },
  { id: 's5', question: 'האם הכאב קבוע או לסירוגין?', category: 'כאב' },
  { id: 's6', question: 'מה מחמיר את הכאב?', category: 'כאב' },
  { id: 's7', question: 'מה מקל על הכאב?', category: 'כאב' },
  { id: 's8', question: 'האם יש בחילות?', category: 'עיכול' },
  { id: 's9', question: 'מהי תדירות היציאות?', category: 'עיכול' },
  { id: 's10', question: 'האם יש שלשול או עצירות?', category: 'עיכול' },
  { id: 's11', question: 'מהי התיאבון?', category: 'עיכול' },
  { id: 's12', question: 'האם יש צמא מוגבר?', category: 'עיכול' },
  { id: 's13', question: 'מהי איכות השינה?', category: 'שינה' },
  { id: 's14', question: 'האם יש קושי להירדם?', category: 'שינה' },
  { id: 's15', question: 'האם יש התעוררויות בלילה?', category: 'שינה' },
  { id: 's16', question: 'האם יש חלומות מרובים?', category: 'שינה' },
  { id: 's17', question: 'מהי רמת האנרגיה?', category: 'אנרגיה' },
  { id: 's18', question: 'האם יש עייפות כרונית?', category: 'אנרגיה' },
  { id: 's19', question: 'באיזה שעה ביום העייפות גרועה יותר?', category: 'אנרגיה' },
  { id: 's20', question: 'האם יש הזעה מוגברת?', category: 'חום/קור' },
  { id: 's21', question: 'האם יש תחושת קור?', category: 'חום/קור' },
  { id: 's22', question: 'האם יש גפיים קרות?', category: 'חום/קור' },
  { id: 's23', question: 'האם יש חום או חמימות?', category: 'חום/קור' },
  { id: 's24', question: 'מהו צבע השתן?', category: 'שתן' },
  { id: 's25', question: 'מהי תדירות ההשתנה?', category: 'שתן' },
  { id: 's26', question: 'האם יש כאב בהשתנה?', category: 'שתן' },
  { id: 's27', question: 'מהו המצב הרגשי?', category: 'רגשות' },
  { id: 's28', question: 'האם יש חרדה או דאגנות?', category: 'רגשות' },
  { id: 's29', question: 'האם יש עצבנות?', category: 'רגשות' },
  { id: 's30', question: 'האם יש דיכאון?', category: 'רגשות' },
  { id: 's31', question: 'האם יש כאבי ראש?', category: 'ראש' },
  { id: 's32', question: 'היכן ממוקם כאב הראש?', category: 'ראש' },
  { id: 's33', question: 'האם יש סחרחורות?', category: 'ראש' },
  { id: 's34', question: 'האם יש בעיות ראייה?', category: 'ראש' },
  { id: 's35', question: 'האם יש טינטון?', category: 'ראש' },
  { id: 's36', question: 'מהו מצב הלשון? (צבע, ציפוי)', category: 'אבחון' },
  { id: 's37', question: 'מהו הדופק? (מהיר, איטי, חלש)', category: 'אבחון' },
  { id: 's38', question: 'האם יש נפיחות?', category: 'גוף' },
  { id: 's39', question: 'האם יש בעיות עור?', category: 'גוף' },
  { id: 's40', question: 'האם יש כאבי גב?', category: 'גוף' },
  { id: 's41', question: 'האם יש כאבי מפרקים?', category: 'גוף' },
  { id: 's42', question: 'מהו המחזור החודשי? (לנשים)', category: 'נשים' },
  { id: 's43', question: 'האם יש כאבי מחזור?', category: 'נשים' },
  { id: 's44', question: 'האם יש הפרשות?', category: 'נשים' },
  { id: 's45', question: 'מהם הרגלי האכילה?', category: 'אורח חיים' },
  { id: 's46', question: 'האם יש פעילות גופנית?', category: 'אורח חיים' },
  { id: 's47', question: 'מהי רמת הסטרס?', category: 'אורח חיים' },
  { id: 's48', question: 'האם יש שימוש בתרופות?', category: 'רפואי' },
  { id: 's49', question: 'האם יש מחלות רקע?', category: 'רפואי' },
  { id: 's50', question: 'האם יש אלרגיות?', category: 'רפואי' },
];

// Diagnosis Questions (30)
const diagnosisQuestions = [
  { id: 'd1', question: 'מהו דפוס האי-איזון העיקרי?', category: 'דפוס' },
  { id: 'd2', question: 'האם יש חוסר או עודף?', category: 'דפוס' },
  { id: 'd3', question: 'האם יש חום או קור?', category: 'דפוס' },
  { id: 'd4', question: 'האם יש לחות או יובש?', category: 'דפוס' },
  { id: 'd5', question: 'איזה איבר מעורב בעיקר?', category: 'איברים' },
  { id: 'd6', question: 'מהו מצב הכבד?', category: 'איברים' },
  { id: 'd7', question: 'מהו מצב הכליות?', category: 'איברים' },
  { id: 'd8', question: 'מהו מצב הטחול?', category: 'איברים' },
  { id: 'd9', question: 'מהו מצב הלב?', category: 'איברים' },
  { id: 'd10', question: 'מהו מצב הריאות?', category: 'איברים' },
  { id: 'd11', question: 'האם יש קיפאון צ\'י?', category: 'צ\'י/דם' },
  { id: 'd12', question: 'האם יש חוסר צ\'י?', category: 'צ\'י/דם' },
  { id: 'd13', question: 'האם יש קיפאון דם?', category: 'צ\'י/דם' },
  { id: 'd14', question: 'האם יש חוסר דם?', category: 'צ\'י/דם' },
  { id: 'd15', question: 'האם יש חוסר יין?', category: 'יין/יאנג' },
  { id: 'd16', question: 'האם יש חוסר יאנג?', category: 'יין/יאנג' },
  { id: 'd17', question: 'האם יש עודף יאנג?', category: 'יין/יאנג' },
  { id: 'd18', question: 'האם יש רוח פתוגנית?', category: 'גורמים' },
  { id: 'd19', question: 'האם יש קור פתוגני?', category: 'גורמים' },
  { id: 'd20', question: 'האם יש חום פתוגני?', category: 'גורמים' },
  { id: 'd21', question: 'האם יש לחות פתוגנית?', category: 'גורמים' },
  { id: 'd22', question: 'האם יש ליחה?', category: 'גורמים' },
  { id: 'd23', question: 'מהו עיקרון הטיפול?', category: 'טיפול' },
  { id: 'd24', question: 'איזה מרידיאן מעורב?', category: 'מרידיאנים' },
  { id: 'd25', question: 'מהי חומרת המצב?', category: 'הערכה' },
  { id: 'd26', question: 'האם המצב חריף או כרוני?', category: 'הערכה' },
  { id: 'd27', question: 'מהי אבחנה מבדלת?', category: 'הערכה' },
  { id: 'd28', question: 'האם יש דפוסים משולבים?', category: 'הערכה' },
  { id: 'd29', question: 'מהו השורש לעומת הענף?', category: 'הערכה' },
  { id: 'd30', question: 'מהי סדר העדיפויות בטיפול?', category: 'הערכה' },
];

// Treatment Questions (50)
const treatmentQuestions = [
  { id: 't1', question: 'מהו עיקרון הטיפול העיקרי?', category: 'עקרונות' },
  { id: 't2', question: 'האם לחזק או לפזר?', category: 'עקרונות' },
  { id: 't3', question: 'האם לחמם או לקרר?', category: 'עקרונות' },
  { id: 't4', question: 'האם ללחלח או לייבש?', category: 'עקרונות' },
  { id: 't5', question: 'איזו נוסחת עשבים מומלצת?', category: 'עשבים' },
  { id: 't6', question: 'מהי המינון המומלץ?', category: 'עשבים' },
  { id: 't7', question: 'כמה זמן לקחת את העשבים?', category: 'עשבים' },
  { id: 't8', question: 'האם יש התוויות נגד?', category: 'עשבים' },
  { id: 't9', question: 'אילו נקודות דיקור מומלצות?', category: 'דיקור' },
  { id: 't10', question: 'באיזו טכניקת דיקור להשתמש?', category: 'דיקור' },
  { id: 't11', question: 'כמה טיפולי דיקור נדרשים?', category: 'דיקור' },
  { id: 't12', question: 'מהי תדירות הטיפולים?', category: 'דיקור' },
  { id: 't13', question: 'האם להשתמש במוקסה?', category: 'טכניקות' },
  { id: 't14', question: 'האם להשתמש בכוסות רוח?', category: 'טכניקות' },
  { id: 't15', question: 'האם להשתמש בגואשה?', category: 'טכניקות' },
  { id: 't16', question: 'האם להשתמש באלקטרו-דיקור?', category: 'טכניקות' },
  { id: 't17', question: 'מהן המלצות התזונה?', category: 'תזונה' },
  { id: 't18', question: 'אילו מזונות להימנע?', category: 'תזונה' },
  { id: 't19', question: 'אילו מזונות להוסיף?', category: 'תזונה' },
  { id: 't20', question: 'האם יש המלצות לתה או מרק?', category: 'תזונה' },
  { id: 't21', question: 'מהן המלצות אורח החיים?', category: 'אורח חיים' },
  { id: 't22', question: 'האם יש המלצות לפעילות גופנית?', category: 'אורח חיים' },
  { id: 't23', question: 'האם יש המלצות לשינה?', category: 'אורח חיים' },
  { id: 't24', question: 'האם יש המלצות לניהול סטרס?', category: 'אורח חיים' },
  { id: 't25', question: 'מהן תרגילי צ\'י גונג מומלצים?', category: 'תרגול' },
  { id: 't26', question: 'האם יש תרגילי נשימה מומלצים?', category: 'תרגול' },
  { id: 't27', question: 'האם יש תרגילי מתיחה מומלצים?', category: 'תרגול' },
  { id: 't28', question: 'האם יש המלצות לטאי צ\'י?', category: 'תרגול' },
  { id: 't29', question: 'מהו משך הטיפול הצפוי?', category: 'תכנון' },
  { id: 't30', question: 'מהם סימני שיפור צפויים?', category: 'תכנון' },
  { id: 't31', question: 'מתי לבצע מעקב?', category: 'תכנון' },
  { id: 't32', question: 'האם יש צורך בבדיקות נוספות?', category: 'תכנון' },
  { id: 't33', question: 'מהן נקודות אוזן מומלצות?', category: 'אוזן' },
  { id: 't34', question: 'האם להשתמש בזרעי אוזן?', category: 'אוזן' },
  { id: 't35', question: 'מהן נקודות קרקפת מומלצות?', category: 'קרקפת' },
  { id: 't36', question: 'האם יש המלצות לרפלקסולוגיה?', category: 'רפלקסולוגיה' },
  { id: 't37', question: 'מהו טיפול עונתי מומלץ?', category: 'עונתי' },
  { id: 't38', question: 'האם יש התייחסות לשעון הביולוגי?', category: 'עונתי' },
  { id: 't39', question: 'מהי גישת 5 האלמנטים?', category: 'אלמנטים' },
  { id: 't40', question: 'איזה אלמנט לחזק?', category: 'אלמנטים' },
  { id: 't41', question: 'איזה אלמנט להרגיע?', category: 'אלמנטים' },
  { id: 't42', question: 'האם יש טיפול רגשי נדרש?', category: 'רגשי' },
  { id: 't43', question: 'מהן המלצות למדיטציה?', category: 'רגשי' },
  { id: 't44', question: 'האם יש שימוש בשמנים אתריים?', category: 'משלים' },
  { id: 't45', question: 'האם יש שימוש בקריסטלים?', category: 'משלים' },
  { id: 't46', question: 'מהן אמצעי זהירות?', category: 'בטיחות' },
  { id: 't47', question: 'מהן תגובות אפשריות?', category: 'בטיחות' },
  { id: 't48', question: 'מתי להפנות לרופא?', category: 'בטיחות' },
  { id: 't49', question: 'מהו הפרוגנוזיס?', category: 'תחזית' },
  { id: 't50', question: 'האם יש טיפול מניעתי?', category: 'מניעה' },
];

const queryBoxes = [
  {
    id: 'symptoms',
    icon: FileText,
    title: 'ניתוח סימפטומים',
    titleEn: 'Symptom Analysis',
    description: '50 שאלות מוכנות לניתוח סימפטומים',
    questions: symptomQuestions,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'diagnosis',
    icon: ClipboardList,
    title: 'אבחון CM',
    titleEn: 'CM Diagnosis',
    description: '30 שאלות מוכנות לאבחון',
    questions: diagnosisQuestions,
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    id: 'treatment',
    icon: Pill,
    title: 'תכנית טיפול',
    titleEn: 'Treatment Plan',
    description: '50 שאלות מוכנות לתכנון טיפול',
    questions: treatmentQuestions,
    gradient: 'from-jade/20 to-emerald-500/20',
    borderColor: 'border-jade/30',
    iconBg: 'bg-jade/20',
    iconColor: 'text-jade',
  },
];

export default function TcmBrainPreview() {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, string>>({});

  const handleQuestionSelect = (boxId: string, question: string) => {
    setSelectedQuestions(prev => ({ ...prev, [boxId]: question }));
  };

  const handleSendToAI = (question: string) => {
    // Navigate to TCM Brain with the question as a URL parameter
    const encodedQuestion = encodeURIComponent(question);
    navigate(`/gate?redirect=/tcm-brain&question=${encodedQuestion}`);
  };

  return (
    <section id="tcm-brain-preview" className="py-20 bg-gradient-to-b from-background to-card/50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jade/10 border border-jade/20 mb-6">
            <Brain className="h-5 w-5 text-jade" />
            <span className="text-jade font-medium">CM Brain AI</span>
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl mb-4 bg-gradient-to-l from-jade to-jade-dark bg-clip-text text-transparent">
            שאלו את ה-AI המומחה
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            בחרו שאלה מוכנה מהקטגוריות למטה ושלחו ישירות ל-CM Brain לקבלת תשובה מקצועית
          </p>
        </div>

        {/* Query Boxes Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {queryBoxes.map((box) => {
            const Icon = box.icon;
            const categories = [...new Set(box.questions.map(q => q.category))];
            const selectedQuestion = selectedQuestions[box.id] || '';

            return (
              <Card 
                key={box.id} 
                className={`bg-gradient-to-br ${box.gradient} ${box.borderColor} border-2 hover:shadow-elevated transition-all duration-300`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl ${box.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${box.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{box.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{box.titleEn}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{box.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Dropdowns */}
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                    {categories.map(category => (
                      <div key={category}>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          {category}
                        </label>
                        <Select
                          value={selectedQuestion}
                          onValueChange={(value) => handleQuestionSelect(box.id, value)}
                          dir="rtl"
                        >
                          <SelectTrigger className="text-right bg-background/50 border-border/50" dir="rtl">
                            <SelectValue placeholder="בחרו שאלה..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border z-50 max-h-60" dir="rtl">
                            {box.questions
                              .filter(q => q.category === category)
                              .map(q => (
                                <SelectItem key={q.id} value={q.question} className="text-right">
                                  {q.question}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {/* Selected Question Display & Send Button */}
                  {selectedQuestion && (
                    <div className="pt-3 border-t border-border/30 space-y-3">
                      <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                        <p className="text-sm font-medium">{selectedQuestion}</p>
                      </div>
                      <Button 
                        onClick={() => handleSendToAI(selectedQuestion)}
                        className="w-full bg-jade hover:bg-jade/90 gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        שלח ל-CM Brain
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/gate?redirect=/tcm-brain')}
            className="gap-2 border-jade/30 hover:bg-jade/10"
          >
            <Brain className="h-5 w-5 text-jade" />
            גישה ל-CM Brain המלא
          </Button>
        </div>
      </div>
    </section>
  );
}
