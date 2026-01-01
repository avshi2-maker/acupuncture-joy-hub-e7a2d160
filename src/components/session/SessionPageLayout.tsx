import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Leaf, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CrossPlatformBackButton } from '@/components/ui/CrossPlatformBackButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TierBadge } from '@/components/layout/TierBadge';
import clockImg from '@/assets/clock.png';

interface SessionPageLayoutProps {
  children: ReactNode;
  title: string;
  titleHe: string;
  metaDescription: string;
  pageColor: 'jade' | 'emerald' | 'violet';
  icon: ReactNode;
  currentTime?: Date;
  showHelpGuide?: boolean;
  onHelpClick?: () => void;
  apiMeter?: ReactNode;
  headerBoxes?: ReactNode;
  workflowIndicator?: ReactNode;
  patientSelector?: ReactNode;
  activeAssetsBadge?: ReactNode;
  extraHeaderActions?: ReactNode;
  dir?: 'rtl' | 'ltr';
}

const colorMap = {
  jade: {
    gradient: 'from-jade/20 via-jade/10 to-jade/20',
    text: 'text-jade',
    iconBg: 'bg-jade-light',
  },
  emerald: {
    gradient: 'from-emerald-900/20 via-emerald-800/10 to-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  violet: {
    gradient: 'from-violet-900/20 via-violet-800/10 to-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
  },
};

export function SessionPageLayout({
  children,
  title,
  titleHe,
  metaDescription,
  pageColor,
  icon,
  currentTime,
  showHelpGuide,
  onHelpClick,
  apiMeter,
  headerBoxes,
  workflowIndicator,
  patientSelector,
  activeAssetsBadge,
  extraHeaderActions,
  dir = 'ltr',
}: SessionPageLayoutProps) {
  const colors = colorMap[pageColor];
  const displayTime = currentTime || new Date();

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col" dir={dir}>
        {/* Header */}
        <header className={cn(
          'border-b backdrop-blur-sm sticky top-0 z-50',
          `bg-gradient-to-r ${colors.gradient}`
        )}>
          <div className="max-w-full mx-auto px-3 md:px-4 py-2 md:py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Back + Logo + Title */}
              <div className="flex items-center gap-2 md:gap-3">
                <CrossPlatformBackButton 
                  fallbackPath="/dashboard" 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden h-9 w-9"
                />
                <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <div className={cn('w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center', colors.iconBg)}>
                    {icon}
                  </div>
                  <div className="hidden sm:block">
                    <h1 className={cn('font-display text-lg md:text-xl font-extrabold tracking-tight', colors.text)}>
                      {title.split(' - ')[0].toUpperCase()}
                    </h1>
                    <p className="text-xs text-muted-foreground">{titleHe}</p>
                  </div>
                </Link>
                
                {/* Help Button - Always visible */}
                {onHelpClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHelpClick}
                    className={cn(
                      'h-8 px-3 font-bold shadow-lg transition-all',
                      'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
                      showHelpGuide && 'ring-2 ring-yellow-500/40'
                    )}
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Help</span>
                  </Button>
                )}
              </div>

              {/* Center: Clock (Desktop) */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
                <div className="relative h-16 w-16 rounded-full shadow-lg overflow-hidden">
                  <img
                    src={clockImg}
                    alt="Session clock"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-sm font-bold text-white font-mono drop-shadow-lg">
                      {displayTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Patient Selector + Actions */}
              <div className="flex items-center gap-2 md:gap-3">
                {activeAssetsBadge}
                {patientSelector}
                {extraHeaderActions}
                
                <div className="hidden md:flex items-center gap-2">
                  <LanguageSwitcher variant="outline" isScrolled={true} />
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard" className="gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <TierBadge />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* API Usage Meter Bar */}
        {apiMeter && (
          <div className="border-b bg-card/30 backdrop-blur-sm py-1.5 px-3 overflow-x-auto">
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground text-[10px]">AI Status:</span>
              </div>
              {apiMeter}
            </div>
          </div>
        )}

        {/* Workflow Indicator */}
        {workflowIndicator && (
          <div className="px-3 md:px-4 pt-2 md:pt-3">
            {workflowIndicator}
          </div>
        )}

        {/* Header Boxes Row */}
        {headerBoxes && (
          <div className="px-3 md:px-4 pt-2 md:pt-3 pb-2 border-b bg-gradient-to-b from-jade/5 to-transparent">
            {headerBoxes}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
