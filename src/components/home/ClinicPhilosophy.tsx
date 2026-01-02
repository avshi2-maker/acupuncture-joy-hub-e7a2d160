import { useState } from "react";
import { BookOpen, Sparkles, Leaf, X, ZoomIn } from "lucide-react";
import tcmEncyclopediaImg from "@/assets/tcm-encyclopedia.png";
import healingPathImg from "@/assets/healing-path-infographic.png";

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

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const Lightbox = ({ src, alt, onClose }: LightboxProps) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <img 
        src={src} 
        alt={alt}
        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const ZoomableImage = ({ src, alt, className, style }: ZoomableImageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative group cursor-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={src} 
          alt={alt}
          className={className}
          style={style}
        />
        {/* Zoom overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
            <ZoomIn className="w-6 h-6 text-[#2c6e49]" />
          </div>
        </div>
      </div>
      {isOpen && (
        <Lightbox src={src} alt={alt} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

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

        {/* TCM Encyclopedia Image - Featured */}
        <div className="mb-12 md:mb-16">
          <ZoomableImage 
            src={tcmEncyclopediaImg} 
            alt="TCM Encyclopedia - Ancient wisdom meets modern technology"
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-lg"
            style={{ boxShadow: "0 20px 50px rgba(44, 110, 73, 0.15)" }}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] mb-14 md:mb-20">
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

        {/* Healing Path Infographic */}
        <div className="pt-8 border-t border-[#2c6e49]/10">
          <h3 
            className="text-xl md:text-2xl font-bold mb-6"
            style={{ color: "#2c6e49", fontFamily: "'Heebo', sans-serif" }}
          >
            מסלול הריפוי: בין תיקון זמני לצמיחה מתמשכת
          </h3>
          <ZoomableImage 
            src={healingPathImg} 
            alt="מסלול הריפוי - השוואה בין טיפול סימפטומטי לטיפול בשורש"
            className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg"
            style={{ boxShadow: "0 20px 50px rgba(44, 110, 73, 0.12)" }}
          />
        </div>
      </div>
    </section>
  );
};

export default ClinicPhilosophy;
