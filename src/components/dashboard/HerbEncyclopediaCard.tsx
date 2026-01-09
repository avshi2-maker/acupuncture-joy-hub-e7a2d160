import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Leaf, Sparkles } from 'lucide-react';

interface HerbEncyclopediaCardProps {
  animationDelay?: number;
}

export function HerbEncyclopediaCard({ animationDelay = 0 }: HerbEncyclopediaCardProps) {
  return (
    <Link to="/encyclopedia" className="block h-full">
      <Card 
        className="h-full overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative border-emerald-500/30"
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-teal-700 to-green-900" />
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-white rounded-full" />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-300" />
        
        {/* Content */}
        <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between min-h-[180px]">
          <div className="flex items-start justify-between">
            <Badge className="bg-amber-500/90 text-white gap-1">
              <Sparkles className="h-3 w-3" />
              Evidence Based
            </Badge>
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Leaf className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-amber-300" />
              <h3 className="text-lg font-bold text-white">אנציקלופדיית צמחים</h3>
            </div>
            <p className="text-sm text-white/80">
              Herbal Master v8 • 22 Formulas
            </p>
            <p className="text-xs text-white/60 mt-1">
              Includes: Zhi Bai, Jin Gui, Shi Hui
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
