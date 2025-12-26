import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, ChevronDown, HelpCircle, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export interface MessageTemplate {
  id: string;
  label: string;
  labelHe?: string;
  message: string;
  icon?: React.ReactNode;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'booking',
    label: 'Book Appointment',
    labelHe: 'קביעת תור',
    message: 'שלום! אשמח לקבוע תור לטיפול',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'question',
    label: 'General Question',
    labelHe: 'שאלה כללית',
    message: 'שלום! יש לי שאלה לגבי הטיפולים שלכם',
    icon: <HelpCircle className="h-4 w-4" />,
  },
  {
    id: 'pricing',
    label: 'Pricing Inquiry',
    labelHe: 'שאלה על מחירים',
    message: 'שלום! אשמח לשמוע על המחירים והתוכניות',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'urgent',
    label: 'Urgent Matter',
    labelHe: 'עניין דחוף',
    message: 'שלום! יש לי עניין דחוף שאשמח לדבר עליו',
    icon: <AlertCircle className="h-4 w-4" />,
  },
];

interface WhatsAppWithTemplatesProps {
  phoneNumber?: string;
  templates?: MessageTemplate[];
  className?: string;
  buttonText?: string;
  buttonTextHe?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabelsInHebrew?: boolean;
}

export function WhatsAppWithTemplates({
  phoneNumber = '972544634923',
  templates = DEFAULT_TEMPLATES,
  className,
  buttonText = 'Chat on WhatsApp',
  buttonTextHe,
  variant = 'default',
  size = 'default',
  showLabelsInHebrew = true,
}: WhatsAppWithTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTemplateClick = (template: MessageTemplate) => {
    const encodedMessage = encodeURIComponent(template.message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10';
      case 'ghost':
        return 'text-[#25D366] hover:bg-[#25D366]/10';
      default:
        return 'bg-[#25D366] hover:bg-[#20BD5A] text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 text-sm';
      case 'lg':
        return 'h-12 px-6 text-base';
      default:
        return 'h-10 px-4';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 border font-medium transition-all duration-200",
            getVariantClasses(),
            getSizeClasses(),
            className
          )}
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-50" />
            <MessageCircle className="h-5 w-5 fill-current relative" />
          </div>
          <span>{buttonTextHe || buttonText}</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="center" 
        className={cn("w-56 animate-scale-in", showLabelsInHebrew && "text-right")}
      >
        <DropdownMenuLabel className="text-center text-muted-foreground text-xs">
          {showLabelsInHebrew ? 'בחר נושא הודעה' : 'Choose a topic'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="flex items-center gap-3 cursor-pointer py-3 hover:bg-[#25D366]/10 focus:bg-[#25D366]/10"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366]">
              {template.icon || <MessageCircle className="h-4 w-4" />}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                {showLabelsInHebrew ? template.labelHe : template.label}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            const whatsappUrl = `https://wa.me/${phoneNumber}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-2"
        >
          <MessageCircle className="h-3 w-3" />
          {showLabelsInHebrew ? 'כתוב הודעה חופשית' : 'Write custom message'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Registration-specific templates
export const REGISTRATION_TEMPLATES: MessageTemplate[] = [
  {
    id: 'help-signup',
    label: 'Help with Signup',
    labelHe: 'עזרה בהרשמה',
    message: 'שלום! אני צריך/ה עזרה בתהליך ההרשמה למערכת',
    icon: <HelpCircle className="h-4 w-4" />,
  },
  {
    id: 'pricing-question',
    label: 'Pricing Questions',
    labelHe: 'שאלות על מחירים',
    message: 'שלום! יש לי שאלות לגבי התוכניות והמחירים',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'features',
    label: 'Features & Demo',
    labelHe: 'פיצ׳רים והדגמה',
    message: 'שלום! אשמח לשמוע יותר על הפיצ׳רים ולראות הדגמה',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'technical',
    label: 'Technical Issue',
    labelHe: 'בעיה טכנית',
    message: 'שלום! נתקלתי בבעיה טכנית בתהליך ההרשמה',
    icon: <AlertCircle className="h-4 w-4" />,
  },
];
