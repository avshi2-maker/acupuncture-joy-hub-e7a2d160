import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Activity } from 'lucide-react';
import tongueDiagnosisBg from '@/assets/tongue-diagnosis-bg.png';

interface PulseGalleryCardProps {
  animationDelay?: number;
}

export function PulseGalleryCard({ animationDelay = 0 }: PulseGalleryCardProps) {
  return (
    <Link to="/pulse-gallery" className="block h-full">
      <Card 
        className="h-full overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        {/* Background Image with different gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${tongueDiagnosisBg})`,
            filter: 'hue-rotate(180deg)',
          }}
        />
        
        {/* Gradient Overlay - Purple/Jade tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-jade/90 via-jade/50 to-jade/20 group-hover:from-jade/80 group-hover:via-jade/40 transition-all duration-300" />
        
        {/* Content */}
        <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between min-h-[180px]">
          <div className="flex items-start justify-between">
            <Badge className="bg-white/20 backdrop-blur-sm text-white gap-1">
              <Sparkles className="h-3 w-3" />
              AI Analysis
            </Badge>
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className="text-lg font-bold text-white mb-1">גלריית אבחון דופק</h3>
            <p className="text-sm text-white/80">
              דפוסי דופק TCM עם סינון לפי דפוסים
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
