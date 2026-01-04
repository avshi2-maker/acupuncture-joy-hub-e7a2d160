import { Shield, CreditCard, Clock, RefreshCcw } from 'lucide-react';

const TRUST_INDICATORS = [
  {
    icon: <RefreshCcw className="h-5 w-5" />,
    title: 'ביטול בכל עת',
    description: 'החודש הנוכחי יחויב',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'תשלום מאובטח',
    description: 'הצפנת SSL מלאה',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: 'ללא התחייבות',
    description: 'ללא עמלות נסתרות',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: '7 ימי ניסיון',
    description: 'התחילו בחינם לגמרי',
  },
];

export function TrustIndicators() {
  return (
    <div className="mt-10 py-6 border-y border-border/30">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {TRUST_INDICATORS.map((indicator) => (
          <div 
            key={indicator.title}
            className="flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {indicator.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{indicator.title}</div>
              <div className="text-xs text-muted-foreground">{indicator.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
