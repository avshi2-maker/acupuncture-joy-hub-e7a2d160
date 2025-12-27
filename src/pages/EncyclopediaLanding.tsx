import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  BookOpen, 
  Brain, 
  Search, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  GraduationCap,
  Stethoscope,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  Lock,
  Database,
  Info,
  Building2,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import heroBackground from '@/assets/encyclopedia-hero-bg.jpg';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Encyclopedia Pricing Tiers
const encyclopediaTiers = [
  {
    id: 'student',
    name: 'Student',
    nameHe: 'סטודנט',
    price: '$8',
    priceValue: 8,
    description: 'Perfect for TCM students learning the fundamentals',
    descriptionHe: 'מושלם לסטודנטים הלומדים את היסודות',
    features: [
      { name: 'Basic Encyclopedia Access', nameHe: 'גישה בסיסית לאנציקלופדיה', included: true },
      { name: '500 AI Queries/Month', nameHe: '500 שאילתות AI בחודש', included: true },
      { name: 'Point Location Database', nameHe: 'מאגר מיקומי נקודות', included: true },
      { name: 'Herbal Formulas (Basic)', nameHe: 'נוסחאות צמחים (בסיסי)', included: true },
      { name: 'Advanced Diagnosis Tools', nameHe: 'כלי אבחון מתקדמים', included: false },
      { name: 'Clinical Case Studies', nameHe: 'מקרי מבחן קליניים', included: false },
      { name: 'Research Papers Access', nameHe: 'גישה למאמרים מחקריים', included: false },
      { name: 'Priority Support', nameHe: 'תמיכה בעדיפות', included: false },
    ],
    icon: GraduationCap,
    color: 'jade',
  },
  {
    id: 'practitioner',
    name: 'Practitioner',
    nameHe: 'מטפל',
    price: '$25',
    priceValue: 25,
    description: 'For practicing TCM professionals',
    descriptionHe: 'למטפלי TCM מקצועיים',
    features: [
      { name: 'Full Encyclopedia Access', nameHe: 'גישה מלאה לאנציקלופדיה', included: true },
      { name: '2,000 AI Queries/Month', nameHe: '2,000 שאילתות AI בחודש', included: true },
      { name: 'Point Location Database', nameHe: 'מאגר מיקומי נקודות', included: true },
      { name: 'Herbal Formulas (Complete)', nameHe: 'נוסחאות צמחים (מלא)', included: true },
      { name: 'Advanced Diagnosis Tools', nameHe: 'כלי אבחון מתקדמים', included: true },
      { name: 'Clinical Case Studies', nameHe: 'מקרי מבחן קליניים', included: true },
      { name: 'Research Papers Access', nameHe: 'גישה למאמרים מחקריים', included: false },
      { name: 'Priority Support', nameHe: 'תמיכה בעדיפות', included: false },
    ],
    icon: Stethoscope,
    color: 'gold',
    highlighted: true,
  },
  {
    id: 'researcher',
    name: 'Researcher',
    nameHe: 'חוקר',
    price: '$50',
    priceValue: 50,
    description: 'Complete access for researchers & institutions',
    descriptionHe: 'גישה מלאה לחוקרים ומוסדות',
    features: [
      { name: 'Full Encyclopedia Access', nameHe: 'גישה מלאה לאנציקלופדיה', included: true },
      { name: 'Unlimited AI Queries', nameHe: 'שאילתות AI ללא הגבלה', included: true },
      { name: 'Point Location Database', nameHe: 'מאגר מיקומי נקודות', included: true },
      { name: 'Herbal Formulas (Complete)', nameHe: 'נוסחאות צמחים (מלא)', included: true },
      { name: 'Advanced Diagnosis Tools', nameHe: 'כלי אבחון מתקדמים', included: true },
      { name: 'Clinical Case Studies', nameHe: 'מקרי מבחן קליניים', included: true },
      { name: 'Research Papers Access', nameHe: 'גישה למאמרים מחקריים', included: true },
      { name: 'Priority Support 24/7', nameHe: 'תמיכה בעדיפות 24/7', included: true },
    ],
    icon: BookOpen,
    color: 'crimson',
  },
];

// ROI Data
const roiScenarios = [
  {
    users: 100,
    bestCase: { profit: 1697, margin: '98%' },
    lowCase: { profit: 2314, margin: '98%' },
  },
  {
    users: 500,
    bestCase: { profit: 8758, margin: '98%' },
    lowCase: { profit: 11920, margin: '98%' },
  },
  {
    users: 1000,
    bestCase: { profit: 17606, margin: '98%' },
    lowCase: { profit: 23908, margin: '98%' },
  },
  {
    users: 5000,
    bestCase: { profit: 88030, margin: '97%' },
    lowCase: { profit: 119540, margin: '97%' },
  },
];

// Knowledge Stats
const knowledgeStats = [
  { label: 'Documents', labelHe: 'מסמכים', value: '5,000+', icon: BookOpen },
  { label: 'Acupuncture Points', labelHe: 'נקודות דיקור', value: '361+', icon: Zap },
  { label: 'Herbal Formulas', labelHe: 'נוסחאות צמחים', value: '1,200+', icon: Database },
  { label: 'Years of Research', labelHe: 'שנות מחקר', value: '30+', icon: TrendingUp },
];

// Feature Highlights
const featureHighlights = [
  {
    icon: Brain,
    title: 'AI-Powered Search',
    titleHe: 'חיפוש מונע AI',
    description: 'Natural language queries across the entire knowledge base',
    descriptionHe: 'שאילתות בשפה טבעית על כל מאגר הידע',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    titleHe: 'גישה מאובטחת',
    description: 'Multi-tier password protection with RLS security',
    descriptionHe: 'הגנה רב-שכבתית עם אבטחת RLS',
  },
  {
    icon: Globe,
    title: 'Global Access',
    titleHe: 'גישה גלובלית',
    description: 'Access from anywhere - desktop, mobile, tablet',
    descriptionHe: 'גישה מכל מקום - מחשב, נייד, טאבלט',
  },
  {
    icon: Search,
    title: 'Deep Knowledge',
    titleHe: 'ידע מעמיק',
    description: '30 years of TCM expertise digitized and searchable',
    descriptionHe: '30 שנות מומחיות TCM דיגיטליות וניתנות לחיפוש',
  },
];

export default function EncyclopediaLanding() {
  const navigate = useNavigate();
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  const handleSelectPlan = (tierId: string) => {
    // In the future, this will integrate with Stripe
    navigate(`/payment-instructions?tier=${tierId}&product=encyclopedia`);
  };

  return (
    <>
      <Helmet>
        <title>CM Digital Encyclopedia | Dr. Roni Sapir | 30 Years of Expertise</title>
        <meta name="description" content="Access 30 years of Chinese Medicine knowledge. AI-powered encyclopedia with 5,000+ documents, herbal formulas, and clinical case studies." />
        <meta name="keywords" content="CM, Chinese Medicine, Acupuncture, Herbal Medicine, Encyclopedia, Dr. Roni Sapir" />
      </Helmet>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher variant="outline" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-6 bg-jade/20 text-jade border-jade/30 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            30 Years of CM Expertise
          </Badge>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-jade to-jade-light bg-clip-text text-transparent">
            CM Digital Encyclopedia
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
            The world's most comprehensive Chinese Medicine knowledge base, 
            powered by AI and curated by <strong className="text-gold">Professor Dr. Roni Sapir</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-jade to-jade-dark hover:opacity-90 text-lg px-8 py-6"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gold/50 text-gold hover:bg-gold/10 text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {knowledgeStats.map((stat) => (
              <div key={stat.label} className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                <stat.icon className="h-8 w-8 text-jade mx-auto mb-2" />
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.labelHe}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-8 w-8 text-jade rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered Knowledge
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Why Choose Our Encyclopedia?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining ancient wisdom with modern technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-jade/50 transition-all duration-300 hover:shadow-elevated">
                <CardHeader>
                  <div className="w-12 h-12 bg-jade/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-jade" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-jade/20 text-jade border-jade/30">
              <Lock className="h-4 w-4 mr-2" />
              Secure Subscription Plans
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Choose Your Access Level
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing for students, practitioners, and researchers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {encyclopediaTiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={cn(
                  'relative flex flex-col transition-all duration-300 hover:shadow-elevated',
                  tier.highlighted && 'border-gold shadow-gold scale-105 z-10'
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gold text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={cn(
                    'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
                    tier.highlighted ? 'bg-gold/20' : 'bg-jade/10'
                  )}>
                    <tier.icon className={cn(
                      'h-8 w-8',
                      tier.highlighted ? 'text-gold' : 'text-jade'
                    )} />
                  </div>
                  <CardTitle className="font-display text-2xl">{tier.nameHe}</CardTitle>
                  <CardDescription className="text-sm">{tier.name}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground mr-1">/ month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.descriptionHe}</p>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-jade shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={cn(
                          'text-sm',
                          !feature.included && 'text-muted-foreground/50'
                        )}>
                          {feature.nameHe}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    onClick={() => handleSelectPlan(tier.id)}
                    className={cn(
                      'w-full',
                      tier.highlighted 
                        ? 'bg-gold hover:bg-gold/90 text-primary-foreground' 
                        : 'bg-jade hover:bg-jade/90'
                    )}
                    size="lg"
                  >
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-crimson/20 text-crimson border-crimson/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              Business Intelligence
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Revenue Projections
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sustainable SaaS business model with 97-98% profit margins
            </p>
          </div>

          {/* ROI Table */}
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-4 text-left font-semibold">Subscribers</th>
                  <th className="border border-border p-4 text-left font-semibold text-jade">Best Case (Monthly)</th>
                  <th className="border border-border p-4 text-left font-semibold text-gold">Conservative (Monthly)</th>
                  <th className="border border-border p-4 text-left font-semibold">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {roiScenarios.map((scenario) => (
                  <tr key={scenario.users} className="hover:bg-muted/30 transition-colors">
                    <td className="border border-border p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{scenario.users.toLocaleString()} users</span>
                      </div>
                    </td>
                    <td className="border border-border p-4">
                      <span className="text-jade font-bold text-lg">
                        ${scenario.bestCase.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="border border-border p-4">
                      <span className="text-gold font-bold text-lg">
                        ${scenario.lowCase.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="border border-border p-4">
                      <Badge className="bg-jade/20 text-jade border-jade/30">
                        {scenario.bestCase.margin}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Breakdown */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="bg-jade/5 border-jade/20 cursor-pointer hover:border-jade/50 hover:shadow-lg transition-all duration-300"
              onClick={() => setShowCostBreakdown(true)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-jade" />
                  AI Cost per Query
                  <Info className="h-4 w-4 text-muted-foreground ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-jade">~$0.002</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average cost per AI-powered search query using optimized RAG
                </p>
                <p className="text-xs text-jade mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Click for detailed breakdown
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gold/5 border-gold/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  Break-Even Point
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gold">~15 users</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Covers infrastructure costs with just 15 paying subscribers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-crimson/5 border-crimson/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-crimson" />
                  Annual Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-crimson">$1M+</div>
                <p className="text-sm text-muted-foreground mt-2">
                  With 5,000 subscribers at average $25/month tier
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Clinic CRM Section - For Therapists */}
      <section className="py-20 bg-gradient-to-br from-gold/10 via-background to-jade/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">
              <Building2 className="h-4 w-4 mr-2" />
              Clinic Management System
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              For TCM Therapists & Clinics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete practice management with AI-powered patient care
            </p>
          </div>

          {/* Clinic Tiers */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Trial */}
            <Card className="border-border hover:border-jade/50 transition-all">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-jade" />
                  Trial
                </CardTitle>
                <CardDescription>Try the system free</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-jade mb-4">Free</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-jade" /> 14 days full access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-jade" /> Up to 5 patients
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-jade" /> Basic CRM features
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Standard - Israel Focus */}
            <Card className="border-gold/50 bg-gold/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                Popular in Israel
              </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  Standard
                </CardTitle>
                <CardDescription>For individual practitioners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gold mb-1">₪149<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground mb-4">(~$40/month)</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> Unlimited patients
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> Full CRM + Calendar
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> WhatsApp integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> CM Brain AI (500 queries)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> Hebrew + English
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gold/20">
                  <p className="text-xs text-muted-foreground">
                    <strong>Israel Market:</strong> ~2,500 licensed TCM practitioners
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Premium - Global */}
            <Card className="border-crimson/50 bg-crimson/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Globe className="h-5 w-5 text-crimson" />
                  Premium
                </CardTitle>
                <CardDescription>For clinics & global practitioners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-crimson mb-1">$99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm mt-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> Everything in Standard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> Multi-room management
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> Zoom integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> CM Brain AI (Unlimited)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> Priority support 24/7
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-crimson/20">
                  <p className="text-xs text-muted-foreground">
                    <strong>Global Market:</strong> 450,000+ TCM practitioners worldwide
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clinic ROI Table */}
          <div className="overflow-x-auto mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Clinic CRM ROI Projection</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-4 text-left">Market</th>
                  <th className="border border-border p-4 text-left">Potential Users</th>
                  <th className="border border-border p-4 text-left">Avg. Price</th>
                  <th className="border border-border p-4 text-left">5% Adoption</th>
                  <th className="border border-border p-4 text-left">Monthly Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="border border-border p-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span className="font-medium">Israel</span>
                  </td>
                  <td className="border border-border p-4">~2,500</td>
                  <td className="border border-border p-4">₪149 ($40)</td>
                  <td className="border border-border p-4">125 users</td>
                  <td className="border border-border p-4">
                    <span className="text-gold font-bold">$5,000/mo</span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="border border-border p-4 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-crimson" />
                    <span className="font-medium">Global (1%)</span>
                  </td>
                  <td className="border border-border p-4">~450,000</td>
                  <td className="border border-border p-4">$70 avg</td>
                  <td className="border border-border p-4">4,500 users</td>
                  <td className="border border-border p-4">
                    <span className="text-crimson font-bold">$315,000/mo</span>
                  </td>
                </tr>
                <tr className="bg-jade/5 hover:bg-jade/10 transition-colors">
                  <td className="border border-border p-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-jade" />
                    <span className="font-bold">Combined</span>
                  </td>
                  <td className="border border-border p-4"></td>
                  <td className="border border-border p-4"></td>
                  <td className="border border-border p-4">4,625 users</td>
                  <td className="border border-border p-4">
                    <span className="text-jade font-bold text-lg">$320,000/mo</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            * AI costs for Clinic CRM are included in subscription pricing. 
            Average ~20 AI queries per patient/month at $0.002 = ~$0.04 per patient.
          </p>
        </div>
      </section>

      {/* Cost Breakdown Dialog */}
      <Dialog open={showCostBreakdown} onOpenChange={setShowCostBreakdown}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6 text-jade" />
              AI Cost Breakdown: $0.002 per Query
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of what's included in the per-query cost
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* RAG Cost */}
            <div className="bg-jade/5 border border-jade/20 rounded-lg p-4">
              <h4 className="font-bold text-jade flex items-center gap-2 mb-3">
                <Database className="h-5 w-5" />
                RAG Processing (Local Knowledge Base)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vector embedding lookup:</p>
                  <p className="font-medium">~$0.0001</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Context retrieval:</p>
                  <p className="font-medium">~$0.0002</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LLM response generation:</p>
                  <p className="font-medium">~$0.0015</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Infrastructure overhead:</p>
                  <p className="font-medium">~$0.0002</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-jade/20 flex justify-between">
                <span className="font-bold">RAG Total:</span>
                <span className="font-bold text-jade">$0.002</span>
              </div>
            </div>

            {/* External AI Note */}
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
              <h4 className="font-bold text-gold flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5" />
                External ChatGPT/Claude Traffic
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The $0.002 cost is for <strong>RAG-only queries</strong> that stay within Dr. Sapir's knowledge base. 
                If complex queries require external AI models:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">GPT-4 (if needed):</p>
                  <p className="font-medium text-gold">+$0.03-0.06</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Claude (if needed):</p>
                  <p className="font-medium text-gold">+$0.02-0.04</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Note: 95%+ of queries are handled by RAG alone. External AI is rarely needed.
              </p>
            </div>

            {/* Total ROI */}
            <div className="bg-gradient-to-r from-jade/10 to-gold/10 border border-border rounded-lg p-4">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-jade" />
                Cost vs Revenue (Per User)
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost (115 queries)</p>
                  <p className="font-bold text-lg text-crimson">$0.23</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="font-bold text-lg text-gold">$25.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="font-bold text-lg text-jade">99.1%</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Segments */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-jade/20 text-jade border-jade/30">
              <Users className="h-4 w-4 mr-2" />
              Target Audience
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Who Is This For?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Students */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-jade/10 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-10 w-10 text-jade" />
                </div>
                <CardTitle className="text-xl">TCM Students</CardTitle>
                <CardDescription>
                  Learning fundamentals and preparing for exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-jade" /> ~45 queries/month average
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-jade" /> Point location mastery
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-jade" /> Theory study guides
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Practitioners */}
            <Card className="text-center border-gold">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-10 w-10 text-gold" />
                </div>
                <CardTitle className="text-xl">Practitioners</CardTitle>
                <CardDescription>
                  Active clinicians seeking clinical insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> ~115 queries/month average
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> Differential diagnosis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> Treatment protocols
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Researchers */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-crimson/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-10 w-10 text-crimson" />
                </div>
                <CardTitle className="text-xl">Researchers</CardTitle>
                <CardDescription>
                  Academic and institutional research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> ~230 queries/month average
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> Full research access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-crimson" /> Citation support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-jade/20 via-background to-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Ready to Access 30 Years of TCM Wisdom?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of practitioners and students already using the Encyclopedia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-jade to-jade-dark hover:opacity-90 text-lg px-8 py-6"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Choose Your Plan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            Questions? Contact Dr. Roni Sapir directly
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/50 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TCM Digital Encyclopedia by Dr. Roni Sapir. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
