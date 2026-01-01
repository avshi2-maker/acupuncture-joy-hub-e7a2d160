import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTier } from '@/hooks/useTier';

interface OnboardingStep {
  id: string;
  title: string;
  titleEn: string;
  completed: boolean;
  href?: string;
  current?: boolean;
}

const DISCLAIMER_STORAGE_KEY = 'tcm_therapist_disclaimer_signed';

export function OnboardingProgress() {
  const { tier } = useTier();
  
  // Check completion status from localStorage
  const tierSelected = !!tier;
  const disclaimerSigned = (() => {
    try {
      const stored = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return !!data.signedAt;
      }
    } catch {
      return false;
    }
    return false;
  })();
  const profileCompleted = !!localStorage.getItem('therapist_profile');

  const steps: OnboardingStep[] = [
    {
      id: 'tier',
      title: 'בחירת תוכנית',
      titleEn: 'Select Plan',
      completed: tierSelected,
      href: '/gate',
    },
    {
      id: 'disclaimer',
      title: 'חתימה על הצהרה',
      titleEn: 'Sign Disclaimer',
      completed: disclaimerSigned,
      href: '/therapist-disclaimer',
      current: tierSelected && !disclaimerSigned,
    },
    {
      id: 'profile',
      title: 'הגדרת פרופיל',
      titleEn: 'Setup Profile',
      completed: profileCompleted,
      href: '/therapist-profile',
      current: tierSelected && disclaimerSigned && !profileCompleted,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;
  const allComplete = completedCount === steps.length;

  // Don't show if all steps are complete
  if (allComplete) {
    return null;
  }

  return (
    <Card className="border-jade/20 bg-gradient-to-br from-jade/5 to-gold/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            השלם את ההרשמה
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length} שלבים
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              step.completed 
                ? 'bg-jade/10 text-jade-dark' 
                : step.current 
                  ? 'bg-gold/10 border border-gold/30' 
                  : 'bg-muted/30 text-muted-foreground'
            }`}
          >
            <div className="flex-shrink-0">
              {step.completed ? (
                <CheckCircle2 className="h-6 w-6 text-jade" />
              ) : (
                <Circle className={`h-6 w-6 ${step.current ? 'text-gold' : 'text-muted-foreground/50'}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${step.completed ? 'line-through opacity-70' : ''}`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {step.titleEn}
              </p>
            </div>
            {!step.completed && step.href && (
              <Button 
                asChild 
                size="sm" 
                variant={step.current ? 'default' : 'ghost'}
                className={step.current ? 'bg-gold hover:bg-gold/90 text-white' : ''}
              >
                <Link to={step.href}>
                  {step.current ? 'המשך' : 'התחל'}
                  <ChevronRight className="h-4 w-4 mr-1" />
                </Link>
              </Button>
            )}
            {step.completed && (
              <span className="text-xs text-jade font-medium">✓ הושלם</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
