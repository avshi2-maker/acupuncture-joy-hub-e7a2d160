import { MessageCircle } from "lucide-react";

interface FloatingWhatsAppProps {
  phoneNumber: string;
  message?: string;
}

export function FloatingWhatsApp({ 
  phoneNumber, 
  message = "שלום! אשמח לשמוע עוד על הטיפולים שלכם (הודעות בלבד - ללא שיחות טלפון)" 
}: FloatingWhatsAppProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-pulse-soft"
      aria-label="WhatsApp - הודעות בלבד"
      title="הודעות בלבד - ללא שיחות טלפון"
    >
      <MessageCircle className="w-7 h-7 fill-current" />
    </a>
  );
}
