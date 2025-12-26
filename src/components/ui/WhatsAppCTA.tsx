import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

interface WhatsAppCTAProps {
  phoneNumber?: string;
  message?: string;
  variant?: 'button' | 'floating' | 'inline' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

export function WhatsAppCTA({ 
  phoneNumber = '972000000000', // Default placeholder
  message = 'Hello! I would like to learn more about your TCM services.',
  variant = 'button',
  className,
  children
}: WhatsAppCTAProps) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed bottom-24 right-4 z-50",
          "flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "bg-[#25D366] hover:bg-[#20BD5A]",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "group",
          className
        )}
        aria-label="Contact us on WhatsApp"
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-40" />
        
        {/* Icon with bounce animation */}
        <div className="relative z-10 animate-bounce-subtle">
          <MessageCircle className="h-7 w-7 text-white fill-white" />
        </div>
        
        {/* Hover tooltip */}
        <span className="absolute right-full mr-3 px-3 py-2 rounded-lg bg-card shadow-lg border text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Chat with us!
        </span>
      </a>
    );
  }

  if (variant === 'minimal') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 text-[#25D366] hover:text-[#20BD5A] transition-colors",
          className
        )}
      >
        <div className="relative">
          <MessageCircle className="h-5 w-5 fill-current animate-pulse-subtle" />
        </div>
        {children || 'WhatsApp'}
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-[#25D366]/10 hover:bg-[#25D366]/20",
          "text-[#25D366] font-medium text-sm",
          "transition-all duration-200 group",
          className
        )}
      >
        <div className="relative">
          <MessageCircle className="h-4 w-4 fill-current group-hover:animate-wiggle" />
        </div>
        {children || 'Chat on WhatsApp'}
      </a>
    );
  }

  // Default button variant
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl",
        "bg-[#25D366] hover:bg-[#20BD5A]",
        "text-white font-semibold",
        "shadow-lg hover:shadow-xl hover:shadow-[#25D366]/25",
        "transition-all duration-300",
        "group",
        className
      )}
    >
      {/* Animated icon container */}
      <div className="relative">
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
        <MessageCircle className="relative h-6 w-6 fill-white group-hover:animate-wiggle" />
      </div>
      
      <span>{children || 'Chat on WhatsApp'}</span>
      
      {/* Arrow indicator */}
      <svg 
        className="w-4 h-4 transition-transform group-hover:translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
