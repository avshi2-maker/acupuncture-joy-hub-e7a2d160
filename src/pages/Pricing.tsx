import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TierCard } from '@/components/pricing/TierCard';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { TokenExplainer } from '@/components/pricing/TokenExplainer';
import { TokenCalculator } from '@/components/pricing/TokenCalculator';
import { FeatureComparisonTable } from '@/components/pricing/FeatureComparisonTable';
import { TrustIndicators } from '@/components/pricing/TrustIndicators';
import { BillingToggle } from '@/components/pricing/BillingToggle';
import { ArrowLeft, HelpCircle, Sparkles, CreditCard, MessageCircle } from 'lucide-react';
import newLogo from '@/assets/new-logo.png';
import { Link } from 'react-router-dom';
import { WhatsAppWithTemplates } from '@/components/ui/WhatsAppTemplates';

const PRICING_TEMPLATES = [
  {
    id: 'pricing',
    label: 'Pricing Questions',
    labelHe: 'שאלות על מחירים',
    message: 'שלום! יש לי שאלות לגבי המחירים והתוכניות',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: 'features',
    label: 'Features Info',
    labelHe: 'מידע על פיצ׳רים',
    message: 'שלום! אשמח לשמוע יותר על הפיצ׳רים של כל תוכנית',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'help-choose',
    label: 'Help Me Choose',
    labelHe: 'עזרה בבחירה',
    message: 'שלום! אשמח לעזרה בבחירת התוכנית המתאימה לי',
    icon: <HelpCircle className="h-4 w-4" />,
  },
  {
    id: 'trial',
    label: 'Trial Questions',
    labelHe: 'שאלות על הניסיון',
    message: 'שלום! יש לי שאלות לגבי תקופת הניסיון החינמית',
    icon: <MessageCircle className="h-4 w-4" />,
  },
];

const ANNUAL_DISCOUNT = 17; // 17% discount for annual billing

const getMonthlyTiers = () => [
  {
    name: 'Trial',
    nameHe: 'ניסיון',
    price: 'חינם',
    priceRange: '7 ימים',
    queriesLimit: '500 שאילתות/חודש',
    tokensInfo: '~50K טוקנים',
    tokensTooltip: '50K טוקנים ≈ 100 שאילתות AI טיפוסיות. מספיק לכ-5 מטופלים בשבוע עם 3-4 שאילתות לטיפול (אבחון, נקודות דיקור, המלצות).',
    description: '7 ימי ניסיון חינם לכל הפיצ׳רים הבסיסיים',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'AI אבחון ותכנון טיפול', included: true },
      { name: 'תזכורות Email למטופלים', included: false },
      { name: 'תזכורות WhatsApp', included: false },
      { name: 'פגישות וידאו', included: false },
    ],
  },
  {
    name: 'Standard',
    nameHe: 'סטנדרט',
    price: '₪40',
    priceRange: '/חודש',
    queriesLimit: '1,200 שאילתות/חודש',
    tokensInfo: '~150K טוקנים',
    tokensTooltip: '150K טוקנים ≈ 300 שאילתות AI טיפוסיות. מספיק לכ-15-20 מטופלים בשבוע עם שימוש מלא בכלי AI (אבחון, תכנון טיפול, המלצות צמחים).',
    description: 'כולל תזכורות אוטומטיות למטופלים + מע״מ',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'AI אבחון ותכנון טיפול', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: false },
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    nameHe: 'פרימיום',
    price: '₪50',
    priceRange: '/חודש',
    queriesLimit: '5,000 שאילתות/חודש',
    tokensInfo: '~600K טוקנים',
    tokensTooltip: '600K טוקנים ≈ 1,200 שאילתות AI טיפוסיות. מספיק לקליניקה עמוסה עם 50+ מטופלים בשבוע, כולל שימוש אינטנסיבי בכל כלי AI.',
    description: 'כל הפיצ׳רים כולל פגישות וידאו + מע״מ',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'AI אבחון ותכנון טיפול', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: true },
    ],
  },
];

const getAnnualTiers = () => [
  {
    name: 'Trial',
    nameHe: 'ניסיון',
    price: 'חינם',
    priceRange: '7 ימים',
    queriesLimit: '500 שאילתות/חודש',
    tokensInfo: '~50K טוקנים',
    tokensTooltip: '50K טוקנים ≈ 100 שאילתות AI טיפוסיות. מספיק לכ-5 מטופלים בשבוע עם 3-4 שאילתות לטיפול (אבחון, נקודות דיקור, המלצות).',
    description: '7 ימי ניסיון חינם לכל הפיצ׳רים הבסיסיים',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'AI אבחון ותכנון טיפול', included: true },
      { name: 'תזכורות Email למטופלים', included: false },
      { name: 'תזכורות WhatsApp', included: false },
      { name: 'פגישות וידאו', included: false },
    ],
  },
  {
    name: 'Standard',
    nameHe: 'סטנדרט',
    price: '₪399',
    originalPrice: '₪480',
    priceRange: '/שנה',
    queriesLimit: '1,200 שאילתות/חודש',
    tokensInfo: '~150K טוקנים',
    tokensTooltip: '150K טוקנים ≈ 300 שאילתות AI טיפוסיות. מספיק לכ-15-20 מטופלים בשבוע עם שימוש מלא בכלי AI (אבחון, תכנון טיפול, המלצות צמחים).',
    description: 'כולל תזכורות אוטומטיות למטופלים + מע״מ',
    savings: 'חסכון של ₪81 בשנה',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'AI אבחון ותכנון טיפול', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: false },
    ],
    highlighted: true,
    bestValue: true,
  },
  {
    name: 'Premium',
    nameHe: 'פרימיום',
    price: '₪499',
    originalPrice: '₪600',
    priceRange: '/שנה',
    queriesLimit: '5,000 שאילתות/חודש',
    tokensInfo: '~600K טוקנים',
    tokensTooltip: '600K טוקנים ≈ 1,200 שאילתות AI טיפוסיות. מספיק לקליניקה עמוסה עם 50+ מטופלים בשבוע, כולל שימוש אינטנסיבי בכל כלי AI.',
    description: 'כל הפיצ׳רים כולל פגישות וידאו + מע״מ',
    savings: 'חסכון של ₪101 בשנה',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'AI אבחון ותכנון טיפול', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: true },
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  
  const tiers = isAnnual ? getAnnualTiers() : getMonthlyTiers();

  const handleSelectTier = (tierName: string) => {
    if (tierName === 'Trial') {
      navigate('/payment-instructions?tier=trial');
    } else {
      const billingParam = isAnnual ? '&billing=annual' : '&billing=monthly';
      navigate(`/payment-instructions?tier=${tierName.toLowerCase()}${billingParam}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>תמחור | TCM Clinic</title>
        <meta name="description" content="בחרו את התוכנית המתאימה לכם - ניסיון חינם, סטנדרט או פרימיום" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/therapist-register" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה להרשמה
          </Link>

          <div className="text-center mb-12">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <img src={newLogo} alt="TCM Clinic Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">בחרו את התוכנית שלכם</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              התחילו עם 7 ימי ניסיון חינם או בחרו תוכנית מתקדמת יותר
            </p>
          </div>

          {/* Billing Toggle */}
          <BillingToggle 
            isAnnual={isAnnual} 
            onToggle={setIsAnnual} 
            discountPercent={ANNUAL_DISCOUNT} 
          />

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier) => (
              <TierCard
                key={tier.name}
                {...tier}
                onSelect={() => handleSelectTier(tier.name)}
                buttonText={tier.name === 'Trial' ? 'התחל ניסיון' : 'בחר תוכנית'}
              />
            ))}
          </div>

          {/* Trust Indicators */}
          <TrustIndicators />

          {/* Token Calculator Section */}
          <TokenCalculator />

          {/* Token Explainer Section */}
          <TokenExplainer />

          {/* Feature Comparison Table */}
          <FeatureComparisonTable />

          {/* FAQ Section */}
          <PricingFAQ />

          <div className="text-center mt-12 space-y-4">
            <p className="text-sm text-muted-foreground">
              לשאלות נוספות, צרו קשר עם ד״ר רוני ספיר בוואטסאפ
            </p>
            <WhatsAppWithTemplates
              phoneNumber="972505231042"
              templates={PRICING_TEMPLATES}
              buttonTextHe="שאלות? דברו איתנו"
              variant="default"
              size="lg"
              showLabelsInHebrew={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
