import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { toast } from 'sonner';
import { 
  Brain, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare, 
  Video, 
  Lock,
  Leaf,
  LogOut,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import calendarBg from '@/assets/calendar-bg.png';
import deskBg from '@/assets/desk-bg.png';
import brainBg from '@/assets/brain-bg.png';
import knowledgeBg from '@/assets/knowledge-bg.png';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  href?: string;
  highlighted?: boolean;
  backgroundImage?: string;
  animationDelay?: number;
  locked?: boolean;
  lockMessage?: string;
}

function FeatureCard({ title, description, icon, available, href, highlighted, backgroundImage, animationDelay = 0, locked, lockMessage }: FeatureCardProps) {
  const isLocked = locked || !available;
  
  const content = (
    <Card 
      className={`transition-all duration-300 h-full relative overflow-hidden transform opacity-0 animate-fade-in ${!isLocked ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-jade/20 hover:scale-[1.03] cursor-pointer' : 'opacity-60'} ${highlighted && !isLocked ? 'ring-2 ring-jade border-jade hover:ring-jade/80 hover:shadow-jade/30' : ''}`}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
        ...(backgroundImage ? { 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {})
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${backgroundImage ? 'bg-white/20 backdrop-blur-sm' : !isLocked ? 'bg-jade-light' : 'bg-muted'}`}>
            {icon}
          </div>
          {isLocked && <Lock className={`h-5 w-5 ${backgroundImage ? 'text-white/70' : 'text-muted-foreground'}`} />}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className={`text-lg mb-1 ${backgroundImage ? 'text-white' : ''}`}>{title}</CardTitle>
        <CardDescription className={`text-sm ${backgroundImage ? 'text-white/80' : ''}`}>
          {isLocked ? (lockMessage || 'שדרגו לתוכנית גבוהה יותר') : description}
        </CardDescription>
        {locked && (
          <Link 
            to="/crm/calendar" 
            className={`inline-flex items-center gap-1 mt-3 text-sm font-medium transition-colors ${backgroundImage ? 'text-jade-light hover:text-white' : 'text-jade hover:text-jade-dark'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar className="h-4 w-4" />
            עבור ליומן התורים
          </Link>
        )}
      </CardContent>
    </Card>
  );

  if (!isLocked && href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tier, hasFeature, daysRemaining } = useTier();

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    }
  }, [tier, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  // Row 1: Calendar, Patient Management
  const row1Features = [
    {
      id: 'calendar',
      title: 'יומן תורים',
      description: 'ניהול תורים וזמינות',
      icon: <Calendar className="h-6 w-6 text-white" />,
      feature: 'calendar' as const,
      href: '/crm/calendar',
      backgroundImage: calendarBg,
    },
    {
      id: 'crm',
      title: 'ניהול מטופלים',
      description: 'CRM מותאם למטפלים',
      icon: <Users className="h-6 w-6 text-white" />,
      feature: 'crm' as const,
      href: '/crm/patients',
      backgroundImage: calendarBg,
    },
  ];

  // Row 2: Video Session, Standard Session - LOCKED (start from calendar)
  const sessionLockMessage = 'התחל טיפול מיומן התורים לאחר קביעת תור עם מטופל חתום';
  const row2Features = [
    {
      id: 'video_sessions',
      title: 'פגישת וידאו',
      description: 'טיפולים מרחוק בוידאו עם שאלוני תמיכה',
      icon: <Video className="h-6 w-6 text-white" />,
      feature: 'video_sessions' as const,
      href: '/video-session',
      highlighted: true,
      backgroundImage: deskBg,
      locked: true,
      lockMessage: sessionLockMessage,
    },
    {
      id: 'cm_brain',
      title: 'טיפול סטנדרטי',
      description: 'מוח AI ומפות גוף אינטראקטיביות',
      icon: <Brain className="h-6 w-6 text-white" />,
      feature: 'tcm_brain' as const,
      href: '/tcm-brain',
      backgroundImage: brainBg,
      locked: true,
      lockMessage: sessionLockMessage,
    },
  ];

  // Row 3: Knowledge Registry + Treatment Planner
  const row3Features = [
    {
      id: 'knowledge_registry',
      title: 'Knowledge Registry',
      description: 'העלאת וניהול קבצי ידע CSV',
      icon: <Database className="h-6 w-6 text-jade" />,
      href: '/knowledge-registry',
      alwaysAvailable: true,
      backgroundImage: knowledgeBg,
    },
    {
      id: 'treatment_planner',
      title: 'מתכנן טיפולים',
      description: 'תכנון ומעקב אחר טיפולים',
      icon: <Calendar className="h-6 w-6 text-jade" />,
      href: '/treatment-planner',
      alwaysAvailable: true,
      backgroundImage: knowledgeBg,
    },
  ];

  if (!tier) return null;

  return (
    <>
      <Helmet>
        <title>דשבורד מטפל | TCM Clinic</title>
        <meta name="description" content="דשבורד ניהול למטפלים ברפואה סינית" />
      </Helmet>

      <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity" aria-label="דף הבית">
            <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <Leaf className="h-5 w-5 text-jade" />
            </div>
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
              <h1 className="font-display text-xl">TCM Clinic</h1>
              <p className="text-sm text-muted-foreground">דשבורד מטפל</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <TierBadge />
            <LanguageSwitcher variant="ghost" isScrolled={true} />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="font-display text-3xl mb-2 opacity-0 animate-fade-in" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>שלום וברוכים הבאים!</h2>
          <p className="text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
            {tier === 'trial' && daysRemaining !== null && (
              <>נותרו לכם {daysRemaining} ימי ניסיון. <Link to="/pricing" className="text-jade hover:underline">שדרגו עכשיו</Link></>
            )}
            {tier === 'standard' && 'אתם בתוכנית סטנדרט. כל הכלים הבסיסיים זמינים עבורכם.'}
            {tier === 'premium' && 'אתם בתוכנית פרימיום. כל הפיצ׳רים זמינים עבורכם!'}
          </p>
        </div>

        {/* Row 1: Calendar, Patient Management, Reminders */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {row1Features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              available={hasFeature(feature.feature)}
              href={feature.href}
              backgroundImage={feature.backgroundImage}
              animationDelay={index * 100}
            />
          ))}
        </div>

        {/* Row 2: Session cards - LOCKED (start from calendar) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {row2Features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              available={hasFeature(feature.feature)}
              href={feature.href}
              highlighted={feature.highlighted}
              backgroundImage={feature.backgroundImage}
              animationDelay={300 + index * 100}
              locked={feature.locked}
              lockMessage={feature.lockMessage}
            />
          ))}
        </div>

        {/* Row 3: Knowledge Registry */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {row3Features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              available={true}
              href={feature.href}
              backgroundImage={feature.backgroundImage}
              animationDelay={600 + index * 100}
            />
          ))}
        </div>

        {/* Upgrade CTA for non-premium */}
        {tier !== 'premium' && (
          <Card className="mt-8 bg-gradient-to-r from-jade to-jade-dark text-primary-foreground">
            <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl mb-1">רוצים גישה לכל הפיצ׳רים?</h3>
                <p className="opacity-90">שדרגו לתוכנית פרימיום וקבלו גישה מלאה כולל פגישות וידאו</p>
              </div>
              <Button asChild variant="secondary" className="shrink-0">
                <Link to="/pricing">צפו בתוכניות</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
    </>
  );
}
