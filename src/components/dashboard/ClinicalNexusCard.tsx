import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Activity, Zap, GitBranch } from 'lucide-react';
import tongueDiagnosisBg from '@/assets/tongue-diagnosis-bg.png';

interface ClinicalNexusCardProps {
  animationDelay?: number;
}

export function ClinicalNexusCard({ animationDelay = 0 }: ClinicalNexusCardProps) {
  return (
    <Link to="/pulse-gallery" className="block h-full">
      <Card 
        className="h-full overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        {/* Background Image with teal/cyan tint for Nexus theme */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${tongueDiagnosisBg})`,
            filter: 'hue-rotate(160deg) saturate(1.2)',
          }}
        />
        
        {/* Gradient Overlay - Teal/Cyan theme for Nexus */}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/95 via-teal-700/60 to-cyan-600/30 group-hover:from-teal-800/90 group-hover:via-teal-600/50 transition-all duration-300" />
        
        {/* Animated connection lines pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nexusLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.8" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M10,50 Q30,20 50,50 T90,50" 
              fill="none" 
              stroke="url(#nexusLine)" 
              strokeWidth="0.5"
              className="animate-pulse"
            />
            <path 
              d="M20,30 Q50,60 80,30" 
              fill="none" 
              stroke="url(#nexusLine)" 
              strokeWidth="0.3"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </svg>
        </div>
        
        {/* Content */}
        <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between min-h-[180px]">
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <Badge className="bg-cyan-500/30 backdrop-blur-sm text-white gap-1 border border-cyan-400/30">
                <Zap className="h-3 w-3" />
                NEXUS
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white gap-1">
                <Sparkles className="h-3 w-3" />
                AI Analysis
              </Badge>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/30 to-teal-500/30 backdrop-blur-sm flex items-center justify-center group-hover:from-cyan-400/40 group-hover:to-teal-500/40 transition-colors border border-cyan-400/20">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-cyan-300" />
              <h3 className="text-lg font-bold text-white">Clinical NEXUS</h3>
            </div>
            <p className="text-sm text-white/80">
              גלריית אבחון דופק TCM עם סינון לפי דפוסים
            </p>
            <p className="text-xs text-cyan-300/80 mt-1">
              מיפוי דופק → נקודות אקופונקטורה
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
