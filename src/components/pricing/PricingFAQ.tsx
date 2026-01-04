import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'מה זה טוקנים ואיך הם עובדים?',
    answer: 'טוקנים הם יחידות עיבוד AI. כל שאילתה שאתם שולחים ל-TCM Brain צורכת טוקנים בהתאם לאורך השאלה והתשובה. שאילתה טיפוסית (למשל "מהן נקודות הדיקור המומלצות לכאבי ראש?") צורכת בממוצע 400-600 טוקנים.',
  },
  {
    question: 'כמה טוקנים אני צריך לקליניקה שלי?',
    answer: 'זה תלוי בכמות המטופלים ובשימוש שלכם ב-AI. בממוצע, טיפול אחד דורש 3-4 שאילתות (אבחון, נקודות דיקור, המלצות צמחים). לדוגמה: 10 מטופלים בשבוע × 4 שאילתות = 40 שאילתות בשבוע ≈ 160 שאילתות בחודש ≈ 80K טוקנים.',
  },
  {
    question: 'מה קורה אם אני מגיע למגבלת הטוקנים?',
    answer: 'תקבלו התראה כשתגיעו ל-80% מהמכסה. אם תגיעו למגבלה, תוכלו לשדרג תוכנית או לחכות לחידוש החודשי. פעולות בסיסיות כמו צפייה במטופלים ויומן תורים ממשיכות לעבוד ללא הגבלה.',
  },
  {
    question: 'האם שאילתות במאגר הידע צורכות טוקנים?',
    answer: 'כן, כל שאילתה ל-TCM Brain (מאגר הידע) צורכת טוקנים. עם זאת, חיפוש בסיסי במאגר נקודות הדיקור והצמחים לא צורך טוקנים - רק שאילתות AI מורכבות.',
  },
  {
    question: 'מתי מתחדשת מכסת הטוקנים שלי?',
    answer: 'המכסה מתחדשת בתחילת כל חודש קלנדרי (ב-1 לחודש). טוקנים שלא נוצלו לא עוברים לחודש הבא.',
  },
  {
    question: 'האם אני יכול לראות כמה טוקנים נשארו לי?',
    answer: 'כן! בלוח הבקרה תוכלו לראות מד שימוש המציג את כמות הטוקנים שנוצלו והנותרים לחודש הנוכחי.',
  },
];

export function PricingFAQ() {
  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 mb-4">
          <HelpCircle className="h-5 w-5 text-jade" />
          <span className="text-sm font-medium">שאלות נפוצות</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl">שאלות על טוקנים ושימוש</h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-right hover:no-underline">
              <span className="text-base font-medium">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
