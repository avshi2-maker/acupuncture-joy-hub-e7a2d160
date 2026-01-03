import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, Zap, ChevronLeft } from 'lucide-react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import roiWidgetBg from '@/assets/roi-widget-bg.png';

const QUERIES_PER_PATIENT = 5;

export const UsageWidget: React.FC = () => {
  const navigate = useNavigate();
  const { usageData, isLoading } = useUsageTracking();

  const currentUsed = usageData?.currentUsed || 0;
  const tierLimit = usageData?.tierLimit || 500;
  const usagePercent = Math.round((currentUsed / tierLimit) * 100);
  const remaining = tierLimit - currentUsed;
  const patientsRemaining = Math.floor(remaining / QUERIES_PER_PATIENT);
  const isLowBalance = usagePercent >= 80;
  const isCritical = usagePercent >= 90;

  const getProgressColor = () => {
    if (isCritical) return 'bg-destructive';
    if (isLowBalance) return 'bg-amber-500';
    return 'bg-jade';
  };

  const getStatusMessage = () => {
    if (isCritical) return 'קרדיטים נמוכים!';
    if (isLowBalance) return 'שימו לב לצריכה';
    return 'מצב תקין';
  };

  const getStatusIcon = () => {
    if (isCritical) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (isLowBalance) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <TrendingUp className="w-4 h-4 text-jade" />;
  };

  return (
    <Card 
      className="relative overflow-hidden border-jade/20 hover:shadow-lg hover:shadow-jade/10 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate('/roi-simulator')}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${roiWidgetBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-white/90">{getStatusMessage()}</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">
                {isLoading ? '...' : currentUsed.toLocaleString()}
              </div>
              <div className="text-xs text-white/60">
                מתוך {tierLimit.toLocaleString()} שאילתות
              </div>
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold text-jade-light">
                ~{patientsRemaining}
              </div>
              <div className="text-xs text-white/60">מטופלים נותרו</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className={`absolute inset-y-0 right-0 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/50">
            <span>{usagePercent}% בשימוש</span>
            <span>{100 - usagePercent}% פנוי</span>
          </div>
        </div>

        {/* Action Button for Low Balance */}
        {isLowBalance && (
          <Button
            size="sm"
            className="w-full gap-2 bg-gradient-to-l from-purple-600 to-jade hover:from-purple-700 hover:to-jade-dark text-white"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/pricing');
            }}
          >
            <Zap className="w-4 h-4" />
            שדרג עכשיו
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageWidget;
