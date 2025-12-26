import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TierCard } from '@/components/pricing/TierCard';
import { ArrowLeft, Leaf, HelpCircle, Sparkles, CreditCard, MessageCircle } from 'lucide-react';
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

const tiers = [
  {
    name: 'Trial',
    nameHe: 'ניסיון',
    price: 'חינם',
    description: '7 ימי ניסיון חינם לכל הפיצ׳רים הבסיסיים',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'תזכורות Email למטופלים', included: false },
      { name: 'תזכורות WhatsApp', included: false },
      { name: 'פגישות וידאו', included: false },
    ],
  },
  {
    name: 'Standard',
    nameHe: 'סטנדרט',
    price: '₪40',
    description: 'כולל תזכורות אוטומטיות למטופלים + מע״מ',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
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
    description: 'כל הפיצ׳רים כולל פגישות וידאו + מע״מ',
    features: [
      { name: 'TCM Brain - מאגר ידע', included: true },
      { name: 'יומן תורים', included: true },
      { name: 'ניהול מטופלים (CRM)', included: true },
      { name: 'מפת גוף אינטראקטיבית', included: true },
      { name: 'תזכורות Email למטופלים', included: true },
      { name: 'תזכורות WhatsApp', included: true },
      { name: 'פגישות וידאו', included: true },
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleSelectTier = (tierName: string) => {
    if (tierName === 'Trial') {
      // Trial can proceed directly to gate after approval
      navigate('/payment-instructions?tier=trial');
    } else {
      // Paid tiers go to payment instructions
      navigate(`/payment-instructions?tier=${tierName.toLowerCase()}`);
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
            <div className="mx-auto w-16 h-16 bg-jade-light rounded-full flex items-center justify-center mb-6">
              <Leaf className="h-8 w-8 text-jade" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">בחרו את התוכנית שלכם</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              התחילו עם 7 ימי ניסיון חינם או בחרו תוכנית מתקדמת יותר
            </p>
          </div>

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
