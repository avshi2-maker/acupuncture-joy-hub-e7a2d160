import { BookOpen, Sparkles, Leaf } from "lucide-react";

const philosophyCards = [
  {
    icon: BookOpen,
    titleHe: "אנציקלופדיה של ידע",
    descriptionHe: `כל תוכנית טיפול מתבססת על מאגר הידע הייחודי שפותח במשך 30 שנה ע״י ד״ר רוני ספיר (PhD ברפואה משלימה). אנו לא מנחשים – אנו משתמשים בבינה מלאכותית להצליב מקורות עתיקים ולדייק את האבחנה האנרגטית.`,
  },
  {
    icon: Sparkles,
    titleHe: "אסתטיקה וניקיון מוקפד",
    descriptionHe: `אנו מקפידים על סביבה טיפולית טהורה וסטרילית. שימוש במחטים חד-פעמיות איכותיות וכלים מסורתיים העוברים טיהור, כדי להבטיח את השקט הנפשי והביטחון המלא שלכם במהלך הטיפול.`,
  },
  {
    icon: Leaf,
    titleHe: "טיפול בשורש, לא רק בסימפטום",
    descriptionHe: `בניגוד לגישות המסתפקות בפתרון מהיר, אנו מתמקדים ב"מסלול בניית היסודות". המטרה אינה רק להעלים את הכאב הרגעי, אלא להשיב לגוף את האיזון הטבעי והחיוניות לטווח הארוך.`,
  },
];

export const ClinicPhilosophy = () => {
  return (
    <section 
      dir="rtl" 
      className="py-16 md:py-20 px-4 md:px-6"
      style={{ backgroundColor: "hsl(40 33% 97%)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
            הסטנדרט שלנו: חוכמה, דיוק ומסורת
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            בקליניקה אנו פועלים לפי עקרונות הרפואה הסינית העתיקה, המגובים במערכת ידע מתקדמת, ללא יומרות רפואיות מערביות – אלא כאלטרנטיבה שלמה וממוקדת.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {philosophyCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <article
                key={index}
                className="bg-card rounded-2xl p-8 md:p-10 shadow-[0_10px_30px_rgba(44,110,73,0.08)] border-t-4 border-accent transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-16 h-16 md:w-18 md:h-18 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-primary mb-4 text-center">
                  {card.titleHe}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-center">
                  {card.descriptionHe}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClinicPhilosophy;
