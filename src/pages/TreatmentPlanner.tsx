import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TreatmentPlannerForm } from '@/components/treatment-planner/TreatmentPlannerForm';
import { TreatmentPlanResult } from '@/components/treatment-planner/TreatmentPlanResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ClipboardList, Sparkles, ShieldCheck } from 'lucide-react';

interface PlanResult {
  treatmentPlan: string;
  sources: Array<{
    fileName: string;
    chunkIndex: number;
    preview: string;
    category: string;
  }>;
  patientName: string | null;
  metadata: {
    chunksSearched: number;
    pointsReferenced: number;
    herbsReferenced: number;
    conditionsChecked: number;
    previousVisits: number;
  };
}

export default function TreatmentPlanner() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);

  const handleGenerate = async (diagnosis: string, patientId: string | null, patientContext: any) => {
    if (!user) {
      toast.error('Please login to use the Treatment Planner');
      navigate('/gate');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('treatment-planner', {
        body: { diagnosis, patientId, patientContext }
      });

      if (error) {
        console.error('Treatment planner error:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI service unavailable. Please try again later.');
        } else {
          toast.error('Failed to generate treatment plan. Please try again.');
        }
        return;
      }

      setResult(data);
      toast.success('Treatment plan generated!');
    } catch (err) {
      console.error('Generation error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewPlan = () => {
    setResult(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-jade" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please login to access the AI Treatment Planner.
              </p>
              <Button onClick={() => navigate('/gate')} className="bg-jade hover:bg-jade/90">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Treatment Planner | TCM Protocol Generator</title>
        <meta 
          name="description" 
          content="AI-powered TCM treatment planning. Generate personalized treatment protocols based on diagnosis and patient history."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jade/10 border border-jade/20 mb-4">
              <ClipboardList className="h-5 w-5 text-jade" />
              <span className="text-jade font-medium">AI Treatment Planner</span>
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
              Personalized Treatment Protocols
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter a TCM diagnosis and optionally link to a patient record. 
              The AI will generate a comprehensive treatment protocol using Dr. Sapir's knowledge base 
              and the patient's medical history.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {result ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Generated Treatment Plan
                  </h2>
                  <Button variant="outline" onClick={handleNewPlan}>
                    New Plan
                  </Button>
                </div>
                <TreatmentPlanResult
                  treatmentPlan={result.treatmentPlan}
                  sources={result.sources}
                  metadata={result.metadata}
                  patientName={result.patientName}
                />
              </div>
            ) : (
              <TreatmentPlannerForm
                onSubmit={handleGenerate}
                isLoading={isGenerating}
              />
            )}
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Clinical Disclaimer:</strong> This AI-generated treatment plan is for clinical decision support only. 
                  Always verify recommendations with your professional expertise, consider individual patient presentations, 
                  and ensure all treatments are within your scope of practice and local regulations.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
