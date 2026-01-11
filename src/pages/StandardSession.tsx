import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BodyMapCore } from '@/components/session/BodyMapCore';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Phase #001: Standard Session Page
 * Features:
 * - Centered responsive SVG Human Silhouette
 * - 4 interactive primary points (ST40, SP9, LV3, LI4)
 * - Glow animation on active points
 * - Full RTL (Hebrew) support
 */
export default function StandardSession() {
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  const handlePointSelect = (code: string, isActive: boolean) => {
    setSelectedPoints(prev => 
      isActive 
        ? [...prev, code]
        : prev.filter(p => p !== code)
    );
    
    toast.success(
      isActive 
        ? `נקודה ${code} הופעלה` 
        : `נקודה ${code} הושבתה`,
      { duration: 1500 }
    );
  };

  return (
    <>
      <Helmet>
        <title>טיפול סטנדרטי | מפת גוף אינטראקטיבית</title>
        <meta name="description" content="מפת גוף אינטראקטיבית לדיקור סיני עם נקודות ראשיות" />
      </Helmet>

      <div 
        dir="rtl" 
        className="min-h-screen bg-background"
      >
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">טיפול סטנדרטי</h1>
              </div>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>חזרה</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Instructions */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                מפת נקודות דיקור
              </h2>
              <p className="text-muted-foreground">
                לחצו על הנקודות במפה או על הכפתורים למטה להפעלה
              </p>
            </div>

            {/* Body Map */}
            <BodyMapCore 
              className="shadow-lg"
              onPointSelect={handlePointSelect}
            />

            {/* Selected Points Summary */}
            {selectedPoints.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  נקודות נבחרות:
                </p>
                <p className="text-lg font-bold text-primary">
                  {selectedPoints.join(' • ')}
                </p>
              </div>
            )}

            {/* Phase Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>Phase #001 — Body Map Core</p>
              <p>נקודות ראשיות: ST40, SP9, LV3, LI4</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
