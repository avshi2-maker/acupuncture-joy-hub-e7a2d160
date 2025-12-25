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
