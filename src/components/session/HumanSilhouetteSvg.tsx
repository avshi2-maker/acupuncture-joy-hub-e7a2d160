import { cn } from '@/lib/utils';

interface HumanSilhouetteSvgProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Phase #001: Clean SVG Human Silhouette for body mapping
 * Front-facing neutral pose with clear proportions
 */
export function HumanSilhouetteSvg({ className, children }: HumanSilhouetteSvgProps) {
  return (
    <svg
      viewBox="0 0 200 400"
      className={cn('w-full h-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient for depth */}
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.4" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Human Silhouette - Front View */}
      <g filter="url(#softShadow)">
        {/* Head */}
        <ellipse
          cx="100"
          cy="35"
          rx="22"
          ry="28"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Neck */}
        <rect
          x="92"
          y="60"
          width="16"
          height="18"
          rx="4"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Torso */}
        <path
          d="M60 78 
             C60 78 55 85 55 100
             L55 180
             C55 190 60 195 70 195
             L130 195
             C140 195 145 190 145 180
             L145 100
             C145 85 140 78 140 78
             L100 75
             Z"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Left Arm */}
        <path
          d="M55 85 
             C45 90 35 100 30 130
             L25 180
             C23 195 20 200 18 210
             L22 212
             C26 205 30 195 32 180
             L40 130
             C45 105 50 95 55 90"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Right Arm */}
        <path
          d="M145 85 
             C155 90 165 100 170 130
             L175 180
             C177 195 180 200 182 210
             L178 212
             C174 205 170 195 168 180
             L160 130
             C155 105 150 95 145 90"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Left Hand */}
        <ellipse
          cx="20"
          cy="218"
          rx="8"
          ry="12"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Right Hand */}
        <ellipse
          cx="180"
          cy="218"
          rx="8"
          ry="12"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Left Leg */}
        <path
          d="M70 195
             L65 280
             L60 350
             C58 365 55 375 50 390
             L70 390
             C72 380 73 370 75 360
             L85 280
             L90 195"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        
        {/* Right Leg */}
        <path
          d="M130 195
             L135 280
             L140 350
             C142 365 145 375 150 390
             L130 390
             C128 380 127 370 125 360
             L115 280
             L110 195"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
      </g>

      {/* Render children (point markers) on top */}
      {children}
    </svg>
  );
}
