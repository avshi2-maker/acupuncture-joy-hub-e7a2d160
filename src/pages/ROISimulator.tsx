import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { SmartROISimulator } from '@/components/roi/SmartROISimulator';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home } from 'lucide-react';

const ROISimulator: React.FC = () => {
  const navigate = useNavigate();
  const { usageData, isLoading } = useUsageTracking();

  return (
    <>
      <Helmet>
        <title>סימולטור ROI חכם | Smart ROI Simulator</title>
        <meta name="description" content="סימולטור צמיחה אינטראקטיבי לקליניקה - חשב את החזר ההשקעה שלך" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">לוח בקרה</span>
            </Button>
            
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-xl">📊</span>
              סימולטור ROI חכם
            </h1>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : usageData ? (
            <SmartROISimulator
              currentUsed={usageData.currentUsed}
              tierLimit={usageData.tierLimit}
            />
          ) : (
            <SmartROISimulator />
          )}

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate('/pricing')}
              className="gap-2"
            >
              צפה בחבילות
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>הסימולטור הזה מספק הערכות בלבד. התוצאות בפועל עשויות להשתנות.</p>
        </footer>
      </div>
    </>
  );
};

export default ROISimulator;
