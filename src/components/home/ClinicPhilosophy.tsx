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
      className="py-14 md:py-20 px-5 md:px-6"
      style={{ backgroundColor: "#fdfbf7" }}
    >
      <div className="max-w-[1200px] mx-auto text-center">
        {/* Section Header */}
        <h2 
          className="text-2xl md:text-[2rem] font-bold mb-2.5"
          style={{ color: "#2c6e49", fontFamily: "'Heebo', sans-serif" }}
        >
          הסטנדרט שלנו: חוכמה, דיוק ומסורת
        </h2>
        <p 
          className="text-base md:text-lg max-w-[600px] mx-auto mb-12 md:mb-[50px]"
          style={{ color: "#666", fontFamily: "'Heebo', sans-serif" }}
        >
          בקליניקה אנו פועלים לפי עקרונות הרפואה הסינית העתיקה, המגובים במערכת ידע מתקדמת, ללא יומרות רפואיות מערביות – אלא כאלטרנטיבה שלמה וממוקדת.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px]">
          {philosophyCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <article
                key={index}
                className="bg-white rounded-[15px] p-10 md:px-[30px] md:py-10 transition-transform duration-300 hover:-translate-y-[5px]"
                style={{ 
                  boxShadow: "0 10px 30px rgba(44, 110, 73, 0.08)",
                  borderTop: "4px solid #c5a059"
                }}
              >
                {/* Icon */}
                <div 
                  className="w-[70px] h-[70px] rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "rgba(44, 110, 73, 0.1)" }}
                >
                  <IconComponent 
                    className="w-8 h-8" 
                    style={{ color: "#2c6e49" }} 
                  />
                </div>

                {/* Title */}
                <h3 
                  className="text-lg md:text-[1.3rem] font-bold mb-4 m-0"
                  style={{ color: "#2c6e49", fontFamily: "'Heebo', sans-serif" }}
                >
                  {card.titleHe}
                </h3>

                {/* Description */}
                <p 
                  className="text-[0.95rem] leading-relaxed m-0"
                  style={{ color: "#555", fontFamily: "'Heebo', sans-serif" }}
                >
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
