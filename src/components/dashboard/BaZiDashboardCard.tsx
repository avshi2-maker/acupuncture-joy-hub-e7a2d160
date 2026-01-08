import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, ExternalLink, Sparkles } from 'lucide-react';

interface BaZiDashboardCardProps {
  animationDelay?: number;
}

export function BaZiDashboardCard({ animationDelay = 0 }: BaZiDashboardCardProps) {
  const handleOpenBaZi = () => {
    window.open('/bazi/', '_blank');
  };

  return (
    <Card 
      className="md:col-span-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20 opacity-0 animate-fade-in overflow-hidden relative"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Decorative Yin-Yang Pattern */}
      <div className="absolute top-2 left-2 w-16 h-16 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="currentColor"/>
          <circle cx="50" cy="26" r="8" fill="currentColor" className="text-background"/>
          <circle cx="50" cy="74" r="8" fill="currentColor"/>
        </svg>
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Ba Zi AI & Clinical Compass
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full font-medium">
                  VIP
                </span>
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-400">
                מצפן קליני ו-Ba Zi
              </CardDescription>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <p className="text-sm text-muted-foreground mb-4">
          ניתוח Ba Zi קליני מתקדם עם המלצות טיפוליות מבוססות TCM, נקודות דיקור, ופורמולות צמחים.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-white/50 dark:bg-white/10 rounded-lg p-2">
            <div className="text-lg font-bold text-amber-600">☯️</div>
            <div className="text-xs text-muted-foreground">Ba Zi</div>
          </div>
          <div className="bg-white/50 dark:bg-white/10 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">🌿</div>
            <div className="text-xs text-muted-foreground">TCM</div>
          </div>
          <div className="bg-white/50 dark:bg-white/10 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">🎯</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
        </div>

        <Button 
          onClick={handleOpenBaZi}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
        >
          <Compass className="h-4 w-4 ml-2" />
          פתח מצפן קליני
          <ExternalLink className="h-4 w-4 mr-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
