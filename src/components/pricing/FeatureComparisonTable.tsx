import { Check, X, Minus, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURE_CATEGORIES = [
  {
    category: 'כלי AI',
    features: [
      { name: 'TCM Brain - מאגר ידע', trial: true, standard: true, premium: true },
      { name: 'AI אבחון TCM', trial: true, standard: true, premium: true },
      { name: 'תכנון טיפול אוטומטי', trial: true, standard: true, premium: true },
      { name: 'המלצות צמחים', trial: true, standard: true, premium: true },
      { name: 'ניתוח לשון ודופק', trial: true, standard: true, premium: true },
    ],
  },
  {
    category: 'ניהול קליניקה',
    features: [
      { name: 'יומן תורים', trial: true, standard: true, premium: true },
      { name: 'ניהול מטופלים (CRM)', trial: true, standard: true, premium: true },
      { name: 'מפת גוף אינטראקטיבית', trial: true, standard: true, premium: true },
      { name: 'היסטוריית טיפולים', trial: true, standard: true, premium: true },
      { name: 'ייצוא דוחות PDF', trial: true, standard: true, premium: true },
    ],
  },
  {
    category: 'תקשורת',
    features: [
      { name: 'תזכורות Email למטופלים', trial: false, standard: true, premium: true },
      { name: 'תזכורות WhatsApp', trial: false, standard: true, premium: true },
      { name: 'אישורי תורים אוטומטיים', trial: false, standard: true, premium: true },
      { name: 'פגישות וידאו', trial: false, standard: false, premium: true },
      { name: 'הקלטות וידאו', trial: false, standard: false, premium: true },
    ],
  },
  {
    category: 'תמיכה',
    features: [
      { name: 'גישה לתיעוד', trial: true, standard: true, premium: true },
      { name: 'תמיכה בוואטסאפ', trial: false, standard: true, premium: true },
      { name: 'תמיכה עדיפות', trial: false, standard: false, premium: true },
    ],
  },
];

const TIERS = [
  { 
    name: 'Trial', 
    nameHe: 'ניסיון', 
    price: 'חינם', 
    period: '7 ימים',
    tokens: '50K',
    headerClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-500',
  },
  { 
    name: 'Standard', 
    nameHe: 'סטנדרט', 
    price: '₪40', 
    period: '/חודש',
    tokens: '150K',
    headerClass: 'bg-gold/10 border-gold/30',
    textClass: 'text-gold',
    highlighted: true,
    badge: 'הכי משתלם',
  },
  { 
    name: 'Premium', 
    nameHe: 'פרימיום', 
    price: '₪50', 
    period: '/חודש',
    tokens: '600K',
    headerClass: 'bg-primary/10 border-primary/30',
    textClass: 'text-primary',
  },
];

function FeatureIcon({ included }: { included: boolean | 'partial' }) {
  if (included === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      </div>
    );
  }
  if (included === 'partial') {
    return (
      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
        <Minus className="h-3.5 w-3.5 text-gold" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
    </div>
  );
}

export function FeatureComparisonTable() {
  return (
    <section className="mt-8 space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl md:text-3xl mb-3">השוואת תוכניות מלאה</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          כל הפיצ׳רים במבט אחד - בחרו את התוכנית המתאימה לכם
        </p>
      </div>

      {/* Mobile: Card-based layout */}
      <div className="md:hidden space-y-4">
        {TIERS.map((tier) => (
          <div 
            key={tier.name}
            className={cn(
              "rounded-xl border p-4",
              tier.headerClass,
              tier.highlighted && "ring-2 ring-gold"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className={cn("font-display text-lg font-bold", tier.textClass)}>
                  {tier.nameHe}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{tier.price}</span>
                  <span className="text-xs text-muted-foreground">{tier.period}</span>
                </div>
              </div>
              {tier.badge && (
                <div className="flex items-center gap-1 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full">
                  <Crown className="h-3 w-3" />
                  {tier.badge}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground mb-3">~{tier.tokens} טוקנים</div>
            
            {FEATURE_CATEGORIES.map((category, catIdx) => (
              <div key={catIdx} className="mb-3">
                <div className="text-xs font-semibold text-muted-foreground mb-1.5 border-b border-border/30 pb-1">
                  {category.category}
                </div>
                <div className="space-y-1">
                  {category.features.map((feature, featIdx) => {
                    const included = tier.name === 'Trial' ? feature.trial : 
                                    tier.name === 'Standard' ? feature.standard : feature.premium;
                    return (
                      <div key={featIdx} className="flex items-center gap-2 text-sm">
                        <FeatureIcon included={included} />
                        <span className={cn(!included && "text-muted-foreground/60")}>
                          {feature.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          {/* Header */}
          <thead>
            <tr>
              <th className="text-right p-4 bg-background sticky right-0 z-10 min-w-[200px]">
                <span className="text-sm font-medium text-muted-foreground">פיצ׳רים</span>
              </th>
              {TIERS.map((tier) => (
                <th 
                  key={tier.name}
                  className={cn(
                    "p-4 text-center border rounded-t-xl min-w-[140px] relative",
                    tier.headerClass,
                    tier.highlighted && "ring-2 ring-gold ring-offset-2 ring-offset-background"
                  )}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      <Crown className="h-3 w-3" />
                      {tier.badge}
                    </div>
                  )}
                  <div className={cn("font-display text-lg", tier.textClass)}>
                    {tier.nameHe}
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-xl font-bold">{tier.price}</span>
                    <span className="text-xs text-muted-foreground">{tier.period}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ~{tier.tokens} טוקנים
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {FEATURE_CATEGORIES.map((category, categoryIndex) => (
              <>
                {/* Category Header */}
                <tr key={`category-${categoryIndex}`}>
                  <td 
                    colSpan={4} 
                    className="p-3 bg-muted/30 font-medium text-sm sticky right-0"
                  >
                    {category.category}
                  </td>
                </tr>
                
                {/* Features */}
                {category.features.map((feature, featureIndex) => (
                  <tr 
                    key={`${categoryIndex}-${featureIndex}`}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 text-sm sticky right-0 bg-background">
                      {feature.name}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <FeatureIcon included={feature.trial} />
                      </div>
                    </td>
                    <td className={cn(
                      "p-3 text-center",
                      TIERS[1].highlighted && "bg-gold/5"
                    )}>
                      <div className="flex justify-center">
                        <FeatureIcon included={feature.standard} />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <FeatureIcon included={feature.premium} />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FeatureIcon included={true} />
          <span>כלול</span>
        </div>
        <div className="flex items-center gap-2">
          <FeatureIcon included={false} />
          <span>לא כלול</span>
        </div>
      </div>
    </section>
  );
}
