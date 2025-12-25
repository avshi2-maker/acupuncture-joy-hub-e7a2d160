import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
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
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoSessionPanel } from '@/components/video/VideoSessionPanel';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  href?: string;
}

function FeatureCard({ title, description, icon, available, href }: FeatureCardProps) {
  const content = (
    <Card className={`transition-all duration-300 h-full ${available ? 'hover:shadow-elevated cursor-pointer' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${available ? 'bg-jade-light' : 'bg-muted'}`}>
            {icon}
          </div>
          {!available && <Lock className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg mb-1">{title}</CardTitle>
        <CardDescription className="text-sm">
          {available ? description : 'שדרגו לתוכנית גבוהה יותר'}
        </CardDescription>
      </CardContent>
    </Card>
  );

  if (available && href) {
    return <Link to={href}>{content}</Link>;
  }

  if (!available) {
    return (
      <div onClick={() => toast.info('שדרגו את התוכנית שלכם לגישה לפיצ׳ר זה')}>
        {content}
      </div>
    );
  }

  return content;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tier, hasFeature, daysRemaining } = useTier();
  const [showVideoPanel, setShowVideoPanel] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string; phone?: string } | null>(null);

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

  const features = [
    {
      id: 'tcm_brain',
      title: 'TCM Brain',
      description: 'מאגר ידע מקיף ברפואה סינית',
      icon: <Brain className={`h-6 w-6 ${hasFeature('tcm_brain') ? 'text-jade' : 'text-muted-foreground'}`} />,
      feature: 'tcm_brain' as const,
      href: '/tcm-brain',
    },
    {
      id: 'calendar',
      title: 'יומן תורים',
      description: 'ניהול תורים וזמינות',
      icon: <Calendar className={`h-6 w-6 ${hasFeature('calendar') ? 'text-jade' : 'text-muted-foreground'}`} />,
      feature: 'calendar' as const,
    },
    {
      id: 'crm',
      title: 'ניהול מטופלים',
      description: 'CRM מותאם למטפלים',
      icon: <Users className={`h-6 w-6 ${hasFeature('crm') ? 'text-jade' : 'text-muted-foreground'}`} />,
      feature: 'crm' as const,
      href: '/crm',
    },
    {
      id: 'body_map',
      title: 'מפת גוף',
      description: 'מפה אינטראקטיבית לאבחון',
      icon: <MapPin className={`h-6 w-6 ${hasFeature('body_map') ? 'text-jade' : 'text-muted-foreground'}`} />,
      feature: 'body_map' as const,
    },
    {
      id: 'email_reminders',
      title: 'תזכורות Email / WhatsApp',
      description: 'שליחת תזכורות אוטומטיות',
      icon: <MessageSquare className={`h-6 w-6 ${hasFeature('email_reminders') ? 'text-jade' : 'text-muted-foreground'}`} />,
      feature: 'email_reminders' as const,
    },
  ];

  if (!tier) return null;

  const hasVideoAccess = hasFeature('video_sessions');

  return (
    <>
      <Helmet>
        <title>דשבורד מטפל | TCM Clinic</title>
        <meta name="description" content="דשבורד ניהול למטפלים ברפואה סינית" />
      </Helmet>

      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity" aria-label="דף הבית">
              <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-jade" />
              </div>
              <div>
                <h1 className="font-display text-xl">TCM Clinic</h1>
                <p className="text-sm text-muted-foreground">דשבורד מטפל</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {hasVideoAccess && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowVideoPanel(!showVideoPanel)}
                  className="gap-2"
                >
                  {showVideoPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                  {showVideoPanel ? 'הסתר וידאו' : 'הצג וידאו'}
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/#tcm-brain-preview">דף הבית</Link>
              </Button>
              <TierBadge />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - Split Layout */}
        <div className={`flex ${hasVideoAccess && showVideoPanel ? 'gap-4' : ''}`}>
          {/* Video Panel - 25% */}
          {hasVideoAccess && showVideoPanel && (
            <aside className="w-1/4 min-w-[300px] max-w-[400px] p-4 border-l border-border bg-card/50 min-h-[calc(100vh-73px)]">
              <VideoSessionPanel 
                selectedPatientId={selectedPatient?.id}
                selectedPatientName={selectedPatient?.name}
                selectedPatientPhone={selectedPatient?.phone}
              />
            </aside>
          )}

          {/* Main Content - 75% */}
          <main className={`flex-1 px-4 py-8 ${hasVideoAccess && showVideoPanel ? 'max-w-[75%]' : 'max-w-7xl mx-auto'}`}>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="font-display text-3xl mb-2">שלום וברוכים הבאים!</h2>
              <p className="text-muted-foreground">
                {tier === 'trial' && daysRemaining !== null && (
                  <>נותרו לכם {daysRemaining} ימי ניסיון. <Link to="/pricing" className="text-jade hover:underline">שדרגו עכשיו</Link></>
                )}
                {tier === 'standard' && 'אתם בתוכנית סטנדרט. כל הכלים הבסיסיים זמינים עבורכם.'}
                {tier === 'premium' && 'אתם בתוכנית פרימיום. כל הפיצ׳רים זמינים עבורכם!'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  available={hasFeature(feature.feature)}
                  href={feature.href}
                />
              ))}
              
              {/* Video Sessions Card - Special handling */}
              <div onClick={() => {
                if (hasVideoAccess) {
                  setShowVideoPanel(true);
                } else {
                  toast.info('שדרגו את התוכנית שלכם לגישה לפיצ׳ר זה');
                }
              }}>
                <Card className={`transition-all duration-300 h-full ${hasVideoAccess ? 'hover:shadow-elevated cursor-pointer border-jade/30' : 'opacity-60'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${hasVideoAccess ? 'bg-jade-light' : 'bg-muted'}`}>
                        <Video className={`h-6 w-6 ${hasVideoAccess ? 'text-jade' : 'text-muted-foreground'}`} />
                      </div>
                      {!hasVideoAccess && <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-1">פגישות וידאו</CardTitle>
                    <CardDescription className="text-sm">
                      {hasVideoAccess ? 'טיפולים מרחוק בוידאו עם שאלוני תמיכה' : 'שדרגו לתוכנית גבוהה יותר'}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
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
      </div>
    </>
  );
}