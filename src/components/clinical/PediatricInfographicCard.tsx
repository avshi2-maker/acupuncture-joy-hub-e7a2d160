import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Baby, ExternalLink } from 'lucide-react';
import { PediatricAcupunctureDialog } from './PediatricAcupunctureDialog';
import pediatricInfographic from '@/assets/pediatric-infographic.jpg';

interface PediatricInfographicCardProps {
  className?: string;
  animationDelay?: number;
}

export function PediatricInfographicCard({ className, animationDelay = 0 }: PediatricInfographicCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] opacity-0 animate-fade-in ${className}`}
        style={{ 
          animationDelay: `${animationDelay}ms`, 
          animationFillMode: 'forwards' 
        }}
        onClick={() => setDialogOpen(true)}
      >
        <CardContent className="p-0 relative">
          {/* Infographic Image */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <img 
              src={pediatricInfographic} 
              alt="מדריך דיקור סיני בילדים" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Baby className="h-5 w-5" />
                <h3 className="font-bold text-lg">מדריך דיקור ילדים</h3>
              </div>
              <p className="text-sm text-white/80">בטיחות ושיטות טיפול לפי גיל</p>
            </div>

            {/* Open indicator */}
            <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              לחצו לפתיחה
            </div>
          </div>
        </CardContent>
      </Card>

      <PediatricAcupunctureDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        defaultLanguage="he"
      />
    </>
  );
}

export default PediatricInfographicCard;
