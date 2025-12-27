import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "he" | "ru";

interface Translations {
  [key: string]: {
    en: string;
    he: string;
    ru: string;
  };
}

// Common translations
export const translations: Translations = {
  // Navigation
  services: { en: "Services", he: "שירותים", ru: "Услуги" },
  cmBrain: { en: "CM Brain", he: "CM Brain", ru: "CM Brain" },
  about: { en: "About", he: "אודות", ru: "О нас" },
  testimonials: { en: "Testimonials", he: "המלצות", ru: "Отзывы" },
  contact: { en: "Contact", he: "צור קשר", ru: "Контакты" },
  bookSession: { en: "Book Session", he: "קביעת תור", ru: "Записаться" },
  therapistRegister: { en: "Therapist Registration", he: "הרשמה למטפלים", ru: "Регистрация терапевта" },
  therapistLogin: { en: "Therapist Login", he: "כניסת מטפלים", ru: "Вход для терапевтов" },
  dashboard: { en: "Dashboard", he: "לוח בקרה", ru: "Панель управления" },
  
  // Hero
  ancientWisdom: { en: "Ancient Wisdom, Modern Healing", he: "חכמה עתיקה, ריפוי מודרני", ru: "Древняя мудрость, современное исцеление" },
  restoreBalance: { en: "Restore Balance.", he: "שחזר איזון.", ru: "Восстановите баланс." },
  renewLife: { en: "Renew Life.", he: "חדש חיים.", ru: "Обновите жизнь." },
  heroDescription: { 
    en: "Experience the transformative power of Traditional Chinese Medicine. Our certified practitioners combine 5,000 years of wisdom with personalized care to help you achieve optimal health and vitality.",
    he: "חווה את הכוח המשנה של הרפואה הסינית המסורתית. המטפלים המוסמכים שלנו משלבים 5,000 שנות חכמה עם טיפול אישי כדי לעזור לך להשיג בריאות ותנופה אופטימליות.",
    ru: "Испытайте преобразующую силу традиционной китайской медицины. Наши сертифицированные специалисты сочетают 5000 лет мудрости с персонализированным уходом."
  },
  bookYourSession: { en: "Book Your Session", he: "קבע תור", ru: "Записаться на сеанс" },
  exploreTreatments: { en: "Explore Treatments", he: "גלה טיפולים", ru: "Изучить методы лечения" },
  yearsExperience: { en: "Years Experience", he: "שנות ניסיון", ru: "Лет опыта" },
  patientsTreated: { en: "Patients Treated", he: "מטופלים", ru: "Пациентов" },
  countriesServed: { en: "Countries Served", he: "מדינות", ru: "Стран" },
  
  // Contact
  getInTouch: { en: "Get In Touch", he: "צור קשר", ru: "Связаться" },
  readyToStart: { en: "Ready to Start", he: "מוכן להתחיל", ru: "Готовы начать" },
  yourHealing: { en: "Your Healing?", he: "את הריפוי שלך?", ru: "Ваше исцеление?" },
  whatsappOnly: { en: "WhatsApp Only", he: "ווצאפ בלבד", ru: "Только WhatsApp" },
  messagesOnly: { en: "Messages only - No phone calls please", he: "הודעות בלבד - בבקשה לא להתקשר", ru: "Только сообщения - не звоните" },
  emailUs: { en: "Email Us", he: "שלח אימייל", ru: "Напишите нам" },
  location: { en: "Location", he: "מיקום", ru: "Местоположение" },
  businessHours: { en: "Business Hours", he: "שעות פעילות", ru: "Часы работы" },
  sendMessage: { en: "Send Message", he: "שלח הודעה", ru: "Отправить сообщение" },
  fullName: { en: "Full Name", he: "שם מלא", ru: "Полное имя" },
  email: { en: "Email", he: "אימייל", ru: "Эл. почта" },
  phone: { en: "Phone", he: "טלפון", ru: "Телефон" },
  message: { en: "Message", he: "הודעה", ru: "Сообщение" },
  findUs: { en: "Find Us", he: "מצא אותנו", ru: "Найти нас" },
  getDirections: { en: "Get Directions", he: "קבל הוראות הגעה", ru: "Проложить маршрут" },
  
  // Footer
  technicalSupport: { en: "Technical Support", he: "תמיכה טכנית", ru: "Техническая поддержка" },
  allRightsReserved: { en: "All rights reserved", he: "כל הזכויות שמורות", ru: "Все права защищены" },
  
  // Days
  sundayThursday: { en: "Sunday - Thursday", he: "ראשון - חמישי", ru: "Воскресенье - Четверг" },
  friday: { en: "Friday", he: "שישי", ru: "Пятница" },
  saturday: { en: "Saturday", he: "שבת", ru: "Суббота" },
  closed: { en: "Closed", he: "סגור", ru: "Закрыто" },
  
  // BaZi Calculator
  baziCalculator: { en: "BaZi Calculator", he: "מחשבון בא-זי", ru: "Калькулятор БаЦзы" },
  fourPillarsOfDestiny: { en: "Four Pillars of Destiny", he: "ארבעת עמודי הגורל", ru: "Четыре столпа судьбы" },
  baziDescription: { en: "Calculate your BaZi (Four Pillars of Destiny) chart with acupuncture point recommendations based on Chinese metaphysics.", he: "חשב את תרשים הבא-זי שלך (ארבעת עמודי הגורל) עם המלצות לנקודות דיקור בהתבסס על מטאפיזיקה סינית.", ru: "Рассчитайте свою карту БаЦзы с рекомендациями по акупунктурным точкам." },
  backToDashboard: { en: "Back to Dashboard", he: "חזרה ללוח הבקרה", ru: "Назад к панели" },
  endSession: { en: "End Session", he: "סיום", ru: "Завершить" },
  birthInformation: { en: "Birth Information", he: "פרטי לידה", ru: "Информация о рождении" },
  enterBirthDetails: { en: "Enter the birth date and time to calculate the Four Pillars", he: "הזן את תאריך ושעת הלידה לחישוב ארבעת העמודים", ru: "Введите дату и время рождения" },
  birthDate: { en: "Birth Date", he: "תאריך לידה", ru: "Дата рождения" },
  birthHour: { en: "Hour (0-23)", he: "שעה (0-23)", ru: "Час (0-23)" },
  birthMinute: { en: "Minute", he: "דקה", ru: "Минута" },
  calculateBaziChart: { en: "Calculate BaZi Chart", he: "חשב תרשים בא-זי", ru: "Рассчитать карту БаЦзы" },
  fourPillars: { en: "Four Pillars", he: "ארבעת העמודים", ru: "Четыре столпа" },
  hourPillar: { en: "Hour Pillar", he: "עמוד השעה", ru: "Столп часа" },
  dayPillar: { en: "Day Pillar", he: "עמוד היום", ru: "Столп дня" },
  monthPillar: { en: "Month Pillar", he: "עמוד החודש", ru: "Столп месяца" },
  yearPillar: { en: "Year Pillar", he: "עמוד השנה", ru: "Столп года" },
  fiveElementAnalysis: { en: "Five Element Analysis", he: "ניתוח חמשת היסודות", ru: "Анализ пяти элементов" },
  dayMaster: { en: "Day Master", he: "מאסטר היום", ru: "Мастер дня" },
  hiddenStems: { en: "Hidden Stems", he: "גבעולים נסתרים", ru: "Скрытые стволы" },
  acupunctureRecommendations: { en: "Acupuncture Recommendations", he: "המלצות לדיקור", ru: "Рекомендации по акупунктуре" },
  pointsBasedOnBazi: { en: "Points based on BaZi analysis and Zi Wu Liu Zhu timing", he: "נקודות על בסיס ניתוח בא-זי ותזמון זי וו ליו ג'ו", ru: "Точки на основе анализа БаЦзы" },
  clickToTryCalculator: { en: "Click to try BaZi Calculator", he: "לחץ לנסות מחשבון בא-זי", ru: "Нажмите для калькулятора БаЦзы" },
  
  // Elements
  wood: { en: "Wood", he: "עץ", ru: "Дерево" },
  fire: { en: "Fire", he: "אש", ru: "Огонь" },
  earth: { en: "Earth", he: "אדמה", ru: "Земля" },
  metal: { en: "Metal", he: "מתכת", ru: "Металл" },
  water: { en: "Water", he: "מים", ru: "Вода" },
  
  // Chinese Hour Animals
  ratHour: { en: "Rat Hour (23:00-01:00)", he: "שעת החולדה (23:00-01:00)", ru: "Час Крысы (23:00-01:00)" },
  oxHour: { en: "Ox Hour (01:00-03:00)", he: "שעת השור (01:00-03:00)", ru: "Час Быка (01:00-03:00)" },
  tigerHour: { en: "Tiger Hour (03:00-05:00)", he: "שעת הנמר (03:00-05:00)", ru: "Час Тигра (03:00-05:00)" },
  rabbitHour: { en: "Rabbit Hour (05:00-07:00)", he: "שעת הארנב (05:00-07:00)", ru: "Час Кролика (05:00-07:00)" },
  dragonHour: { en: "Dragon Hour (07:00-09:00)", he: "שעת הדרקון (07:00-09:00)", ru: "Час Дракона (07:00-09:00)" },
  snakeHour: { en: "Snake Hour (09:00-11:00)", he: "שעת הנחש (09:00-11:00)", ru: "Час Змеи (09:00-11:00)" },
  horseHour: { en: "Horse Hour (11:00-13:00)", he: "שעת הסוס (11:00-13:00)", ru: "Час Лошади (11:00-13:00)" },
  goatHour: { en: "Goat Hour (13:00-15:00)", he: "שעת העז (13:00-15:00)", ru: "Час Козы (13:00-15:00)" },
  monkeyHour: { en: "Monkey Hour (15:00-17:00)", he: "שעת הקוף (15:00-17:00)", ru: "Час Обезьяны (15:00-17:00)" },
  roosterHour: { en: "Rooster Hour (17:00-19:00)", he: "שעת התרנגול (17:00-19:00)", ru: "Час Петуха (17:00-19:00)" },
  dogHour: { en: "Dog Hour (19:00-21:00)", he: "שעת הכלב (19:00-21:00)", ru: "Час Собаки (19:00-21:00)" },
  pigHour: { en: "Pig Hour (21:00-23:00)", he: "שעת החזיר (21:00-23:00)", ru: "Час Свиньи (21:00-23:00)" },
  unknownHour: { en: "Unknown - Use default (12:00)", he: "לא ידוע - השתמש בברירת מחדל (12:00)", ru: "Неизвестно - по умолчанию (12:00)" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  const dir = language === "he" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
