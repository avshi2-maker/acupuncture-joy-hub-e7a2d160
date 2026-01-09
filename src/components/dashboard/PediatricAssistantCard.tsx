import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, Stethoscope, Sparkles } from 'lucide-react';

interface PediatricAssistantCardProps {
  animationDelay?: number;
}

export function PediatricAssistantCard({ animationDelay = 0 }: PediatricAssistantCardProps) {
  return (
    <Link to="/pediatric-assistant" className="block h-full">
      <Card 
        className="h-full overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative border-pink-500/30"
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400" />
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 right-6 w-20 h-20 border-2 border-white rounded-full" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-2 border-white rounded-full" />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-300" />
        
        {/* Content */}
        <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between min-h-[180px]">
          <div className="flex items-start justify-between">
            <Badge className="bg-white/20 text-white backdrop-blur-sm gap-1">
              <Sparkles className="h-3 w-3" />
              AI Powered
            </Badge>
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Baby className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="h-5 w-5 text-pink-200" />
              <h3 className="text-lg font-bold text-white">Pediatric TCM Assistant</h3>
            </div>
            <p className="text-sm text-white/80">
              Oncology • Herbs • Needle • Dosing
            </p>
            <p className="text-xs text-white/60 mt-1">
              Weight-based dosing calculations
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
