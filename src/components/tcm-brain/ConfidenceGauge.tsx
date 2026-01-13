import { cn } from '@/lib/utils';

interface ConfidenceGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function ConfidenceGauge({ 
  percentage, 
  size = 64, 
  strokeWidth = 6 
}: ConfidenceGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Color coding: >=85% Green, 70-84% Amber, <70% Red
  const strokeColor = percentage >= 85 
    ? 'stroke-emerald-500' 
    : percentage >= 70 
      ? 'stroke-amber-500' 
      : 'stroke-destructive';
  
  const textColor = percentage >= 85 
    ? 'text-emerald-600' 
    : percentage >= 70 
      ? 'text-amber-600' 
      : 'text-destructive';
  
  const label = percentage >= 85 
    ? 'Clinical' 
    : percentage >= 70 
      ? 'Moderate' 
      : 'Low';

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500 ease-out", strokeColor)}
        />
      </svg>
      
      {/* Center text */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className={cn("font-bold text-sm leading-none", textColor)}>
          {percentage}%
        </span>
      </div>
      
      {/* Label below */}
      <span className={cn("text-[9px] font-medium mt-1", textColor)}>
        {label}
      </span>
    </div>
  );
}
