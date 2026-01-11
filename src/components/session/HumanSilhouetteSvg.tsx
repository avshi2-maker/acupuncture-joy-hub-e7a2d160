import { cn } from '@/lib/utils';

interface HumanSilhouetteSvgProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Phase #001: Clean, Zen-clinical SVG Human Silhouette
 * Minimalist outline for professional medical body mapping
 */
export function HumanSilhouetteSvg({ className, children }: HumanSilhouetteSvgProps) {
  return (
    <svg
      viewBox="0 0 200 400"
      className={cn('w-full h-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle gradient for depth */}
        <linearGradient id="bodyGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.03" />
        </linearGradient>
        
        {/* Soft outer glow */}
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Clean Medical Silhouette - Front View */}
      <g filter="url(#softGlow)">
        {/* Head - Perfect oval */}
        <ellipse
          cx="100"
          cy="38"
          rx="24"
          ry="30"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        
        {/* Neck */}
        <path
          d="M92 65 L92 80 L108 80 L108 65"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        
        {/* Shoulders and Torso - Flowing lines */}
        <path
          d="M92 80
             C80 82 55 88 45 95
             L40 105
             C38 115 38 125 40 145
             L42 170
             C42 180 44 190 50 195
             L60 200
             L75 202
             L80 195
             L80 200
             C80 198 85 200 100 200
             C115 200 120 198 120 200
             L120 195
             L125 202
             L140 200
             L150 195
             C156 190 158 180 158 170
             L160 145
             C162 125 162 115 160 105
             L155 95
             C145 88 120 82 108 80"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        
        {/* Left Arm */}
        <path
          d="M45 95
             C35 100 25 115 20 140
             L15 175
             C12 190 10 200 8 215
             L10 220
             C14 222 18 220 22 215
             L25 195
             L30 160
             C35 135 42 115 50 100"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        
        {/* Right Arm */}
        <path
          d="M155 95
             C165 100 175 115 180 140
             L185 175
             C188 190 190 200 192 215
             L190 220
             C186 222 182 220 178 215
             L175 195
             L170 160
             C165 135 158 115 150 100"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        
        {/* Left Hand */}
        <ellipse
          cx="15"
          cy="222"
          rx="8"
          ry="10"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        
        {/* Right Hand */}
        <ellipse
          cx="185"
          cy="222"
          rx="8"
          ry="10"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        
        {/* Pelvis/Hip area */}
        <path
          d="M75 200
             C70 205 65 210 62 220
             L60 230
             C60 235 65 238 75 240
             L100 242
             L125 240
             C135 238 140 235 140 230
             L138 220
             C135 210 130 205 125 200
             L100 200
             L75 200"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        
        {/* Left Leg */}
        <path
          d="M75 240
             L72 270
             L68 310
             L65 350
             L62 375
             L58 390
             L55 395
             L75 395
             L78 390
             L80 375
             L82 350
             L85 310
             L88 270
             L90 242"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        
        {/* Right Leg */}
        <path
          d="M125 240
             L128 270
             L132 310
             L135 350
             L138 375
             L142 390
             L145 395
             L125 395
             L122 390
             L120 375
             L118 350
             L115 310
             L112 270
             L110 242"
          fill="url(#bodyGradient)"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />

        {/* Center line indicator (subtle) */}
        <line
          x1="100"
          y1="80"
          x2="100"
          y2="200"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="0.5"
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />
      </g>

      {/* Render children (point markers) on top */}
      {children}
    </svg>
  );
}
