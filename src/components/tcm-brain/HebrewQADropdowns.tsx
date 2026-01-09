import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Flame, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Five Elements Q&A in Hebrew
const FIVE_ELEMENTS_QA = [
  {
    id: 'fe1',
    question: 'מהי תיאוריית חמשת האלמנטים ברפואה הסינית?',
    context: 'חמשת האלמנטים (Wu Xing) היא תיאוריה בסיסית המתארת חמישה שלבי שינוי: עץ, אש, אדמה, מתכת ומים. כל אלמנט מקושר לאיברים, עונות, רגשות, צבעים ותופעות טבע, ויוצר מערכת מחוברת.'
  },
  {
    id: 'fe2',
    question: 'אילו עונות מתאימות לכל אלמנט?',
    context: 'עץ: אביב (צמיחה והתחדשות). אש: קיץ (התרחבות ושמחה). אדמה: סוף הקיץ (קציר ושינוי צורה). מתכת: סתיו (התכנסות ושחרור). מים: חורף (אגירה ומנוחה).'
  },
  {
    id: 'fe3',
    question: 'כיצד מרגיעים עודף באלמנט העץ (Wood)?',
    context: 'יש לטהר אש בכבד, להכניע יאנג של הכבד, להניע צ\'י כבד תקוע ולנקז לחות-חמה מכיס המרה. שימוש בצמחים מרים וקרים לטיהור חום.'
  },
  {
    id: 'fe4',
    question: 'מהם התפקודים העיקריים של אלמנט האש?',
    context: 'האש שולטת בתודעה, שמחה, סירקולציה, חום והנפש (Shen). הלב שולט בכלי הדם ומאכלס את התודעה. המעי הדק מפריד בין עיקר לטפל.'
  },
  {
    id: 'fe5',
    question: 'מהו חוסר בצ\'י של הלב (Heart Qi Deficiency)?',
    context: 'חוסר צ\'י בלב מתבטא בדפיקות לב במאמץ, קוצר נשימה, עייפות, הזעה ספונטנית ולשון חיוורת. הלב אינו מצליח להזרים דם כראוי.'
  },
  {
    id: 'fe6',
    question: 'כיצד מרגיעים עודף באלמנט האדמה?',
    context: 'יש לפתור ליחה ולחות, להניע תקיעות מזון, להפחית דאגנות יתר ולעודד טרנספורמציה. שימוש בצמחים ארומטיים ומנקזים.'
  },
  {
    id: 'fe7',
    question: 'מהם התפקודים העיקריים של אלמנט המתכת?',
    context: 'המתכת שולטת בנשימה, הצבת גבולות, סילוק פסולת, הגנה חיסונית (Wei Qi) ושחרור. הריאות שולטות בצ\'י ובנשימה; המעי הגס מסלק פסולת.'
  },
  {
    id: 'fe8',
    question: 'מהי הצטברות ליחה בריאות?',
    context: 'ליחה בריאות גורמת לשיעול עם כיח רב, גודש בחזה, צפצופים, רעשי חרחור בגרון וחיפוי לשון דביק. הטחול מעורב לעיתים קרובות.'
  },
  {
    id: 'fe9',
    question: 'כיצד מרגיעים עודף באלמנט המים?',
    context: 'יש לחמם את היאנג כדי להתמיר מים, לעודד מתן שתן, לפתור בצקות ולהרגיע פחד. שימוש בצמחים מחממים ומנקזים.'
  },
  {
    id: 'fe10',
    question: 'כיצד אלמנט העץ משתלט על האדמה (Wood Overacting on Earth)?',
    context: 'כאשר צ\'י הכבד בעודף או תקוע, הוא תוקף את הטחול, וגורם לבעיות עיכול, עצבנות עם תיאבון ירוד, נפיחות ושלשולים/עצירות לסירוגין.'
  },
  {
    id: 'fe11',
    question: 'כיצד מעבר בין עונות משפיע על איזון האלמנטים?',
    context: 'כל שינוי עונתי דורש התאמה אלמנטלית. האדמה (טחול) חשובה במיוחד במעברים. תמיכה באדמה מונעת מחלות עונתיות.'
  },
  {
    id: 'fe12',
    question: 'כיצד מטפלים בחוסר הרמוניה בין אש לאדמה?',
    context: 'חוסר הרמוניה זה קורה כאשר אש הלב משפיעה על הטחול, וגורמת לחרדה עם עיכול לקוי. יש לטהר את אש הלב ולחזק את הטחול.'
  },
  {
    id: 'fe13',
    question: 'מהו האיזון בין מעגל היצירה למעגל הבקרה?',
    context: 'מעגל היצירה (Sheng) מזין, בעוד שמעגל הבקרה (Ke) מגביל/מווסת. שניהם נחוצים לאיזון. בעיות מתעוררות כאשר מעגל אחד הופך מוגזם או חסר.'
  },
  {
    id: 'fe14',
    question: 'כיצד מתייחסים חמשת האלמנטים לסרטן ברפואה הסינית?',
    context: 'סרטן מערב חוסר איזון במספר אלמנטים, לרוב מתחיל בחוסר אדמה (טחול), תקיעות צ\'י בכבד והצטברות ליחה. הטיפול תומך בחסינות ופותר תקיעות.'
  },
  {
    id: 'fe15',
    question: 'איזו תזונה תומכת באיזון חמשת האלמנטים?',
    context: 'אכילת מזונות במגוון צבעים, איזון חמשת הטעמים, התאמת התזונה לעונה, אכילה לפי הקונסטיטוציה האישית, ובחירת מזונות שמייצרים או מבקרים אלמנטים ספציפיים.'
  },
];

// Yin Yang Q&A in Hebrew
const YIN_YANG_QA = [
  {
    id: 'yy1',
    question: 'מהו העיקרון הבסיסי של יין ויאנג ברפואה הסינית?',
    context: 'יין ויאנג הוא המושג הבסיסי המתאר שני כוחות מנוגדים אך משלימים בטבע ובגוף האדם. איזון בין כוחות אלו חיוני לבריאות ולרווחה.'
  },
  {
    id: 'yy2',
    question: 'אילו איברים נחשבים כאיברי יין (Zang)?',
    context: 'איברי היין כוללים את הכבד, הלב, הטחול, הריאות והכליות. אלו איברים מוצקים האחראים על אגירת חומרים חיוניים כמו צ\'י, דם ותמצית.'
  },
  {
    id: 'yy3',
    question: 'אילו סימנים בפנים מעידים על חוסר יין?',
    context: 'עור יבש, קמטים עדינים, לחיים סמוקות (Malar flush), שפתיים יבשות ומראה עייף מעידים על דפוסי חוסר יין.'
  },
  {
    id: 'yy4',
    question: 'מהו עקרון הטיפול הבסיסי לחוסר יין?',
    context: 'להזין יין, לטהר חום מדומה (חום מחוסר) ולהרגיע את הנפש. שימוש בצמחים מקררים ומלחלחים ובנקודות דיקור מחזקות יין, במיוחד של הכליות והריאות.'
  },
  {
    id: 'yy5',
    question: 'מתי יש לחזק יאנג בראש ובראשונה בטיפול?',
    context: 'יש לחזק יאנג כאשר יש חוסר יאנג עם סימפטומים של קור, עייפות, זרימת דם לקויה, או בטיפול במצבים כרוניים עם קונסטיטוציה חלשה.'
  },
  {
    id: 'yy6',
    question: 'איזו פעילות גופנית מומלצת למצבי חוסר יין?',
    context: 'תרגילים עדינים ומקרקעים כמו יוגה יין, טאי צ\'י, הליכה בטבע ושחייה. יש להימנע מפעילות עצימה או תחרותית יתר על המידה המכלה את היין.'
  },
  {
    id: 'yy7',
    question: 'כיצד מטפלים בנדודי שינה הנובעים מחוסר יין?',
    context: 'יש להזין את היין של הלב והכליות, לטהר חום מחוסר ולהרגיע את הנפש באמצעות נקודות וצמחים מזיני יין.'
  },
  {
    id: 'yy8',
    question: 'כיצד דיכאון קשור ליין ויאנג?',
    context: 'דיכאון יכול לערב חוסר יאנג (חוסר חום ומוטיבציה) או תקיעות צ\'י החוסמת את הטרנספורמציה של היאנג. הטיפול משתנה בהתאם לדפוס.'
  },
  {
    id: 'yy9',
    question: 'מה הקשר בין יין-יאנג לחמשת האלמנטים?',
    context: 'חמשת האלמנטים מייצגים ביטויים שונים של איזון יין-יאנג. מים ועץ נוטים לכיוון היין, אש ומתכת לכיוון היאנג, והאדמה היא האיזון המרכזי.'
  },
  {
    id: 'yy10',
    question: 'כיצד מאזנים את יין ויאנג הכליות?',
    context: 'הכליות הן השורש של היין והיאנג בגוף. הטיפול חייב לאזן בזהירות את שני ההיבטים, שכן חוסר איזון בכליות הוא בסיס למצבים כרוניים רבים.'
  },
  {
    id: 'yy11',
    question: 'מהי עליית יאנג הכבד עקב חוסר יין הכליות?',
    context: 'כאשר יין הכליות בחוסר, הוא אינו יכול להזין את יין הכבד, מה שגורם ליאנג הכבד לעלות בצורה מוגזמת ולהוביל לכאבי ראש, סחרחורות, טינטון ויתר לחץ דם.'
  },
  {
    id: 'yy12',
    question: 'כיצד מטפלים באדם עם טיפוס יאנג מולד?',
    context: 'להזין יין, לטהר חום בעדינות, להמליץ על מזונות מקררים, לעודד פעילויות מרגיעות ולמנוע דלדול יין כתוצאה מפעילות יתר.'
  },
  {
    id: 'yy13',
    question: 'כיצד מאבחנים חוסר איזון יין-יאנג דרך סימפטומים?',
    context: 'הערכת העדפות טמפרטורה, רמות אנרגיה, חום גוף, לשון, דופק, רגשות, שינה, איכות הכאב ומאזן נוזלים כדי לקבוע את דפוס היין-יאנג.'
  },
  {
    id: 'yy14',
    question: 'איזה תפקיד משחק טיפול קונסטיטוציוני (מבנה גוף מולד)?',
    context: 'טיפול קונסטיטוציוני מתייחס לנטייה המולדת של האדם ליין או ליאנג, מונע הישנות של דפוסים ותומך בחוסן הכללי.'
  },
  {
    id: 'yy15',
    question: 'האם ניתן לשלב תיאוריית יין-יאנג עם רפואה מערבית?',
    context: 'כן. האבחנה המערבית מזהה את המחלה; תיאוריית יין-יאנג מזהה את דפוס חוסר האיזון. שניהם יחד יכולים ליצור טיפול מקיף המתייחס לסימפטומים ולשורש הבעיה.'
  },
];

interface HebrewQADropdownsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
  className?: string;
}

export function HebrewQADropdowns({
  onSelectQuestion,
  disabled = false,
  className,
}: HebrewQADropdownsProps) {
  const [openFiveElements, setOpenFiveElements] = useState(false);
  const [openYinYang, setOpenYinYang] = useState(false);

  const handleSelect = (question: string) => {
    onSelectQuestion(question);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)} dir="rtl">
      {/* Five Elements Dropdown */}
            <DropdownMenu open={openFiveElements} onOpenChange={setOpenFiveElements}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5 justify-between bg-gradient-to-r from-green-500/10 to-amber-500/10 border-green-500/30 hover:from-green-500/20 hover:to-amber-500/20"
                  disabled={disabled}
                >
                  <ChevronDown className="h-3 w-3" />
                  <div className="flex items-center gap-1.5">
                    <span>חמשת האלמנטים</span>
                    <Flame className="h-3 w-3 text-amber-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 max-h-80 overflow-hidden z-50 bg-background border shadow-lg"
                align="end"
              >
                <ScrollArea className="h-72">
                  <div className="p-1" dir="rtl">
                    {FIVE_ELEMENTS_QA.map((qa) => (
                      <DropdownMenuItem
                        key={qa.id}
                        onClick={() => handleSelect(qa.question)}
                        className="flex flex-col items-start gap-1 py-2 px-3 cursor-pointer focus:bg-green-500/10"
                      >
                        <span className="text-sm font-medium text-foreground leading-relaxed">
                          {qa.question}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {qa.context}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Yin Yang Dropdown */}
            <DropdownMenu open={openYinYang} onOpenChange={setOpenYinYang}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-1.5 justify-between bg-gradient-to-r from-slate-500/10 to-white/10 border-slate-500/30 hover:from-slate-500/20 hover:to-white/20"
                  disabled={disabled}
                >
                  <ChevronDown className="h-3 w-3" />
                  <div className="flex items-center gap-1.5">
                    <span>יין ויאנג</span>
                    <Circle className="h-3 w-3" style={{ background: 'linear-gradient(90deg, #000 50%, #fff 50%)', borderRadius: '50%' }} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 max-h-80 overflow-hidden z-50 bg-background border shadow-lg"
                align="end"
              >
                <ScrollArea className="h-72">
                  <div className="p-1" dir="rtl">
                    {YIN_YANG_QA.map((qa) => (
                      <DropdownMenuItem
                        key={qa.id}
                        onClick={() => handleSelect(qa.question)}
                        className="flex flex-col items-start gap-1 py-2 px-3 cursor-pointer focus:bg-slate-500/10"
                      >
                        <span className="text-sm font-medium text-foreground leading-relaxed">
                          {qa.question}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {qa.context}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
    </div>
  );
}
