import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SymptomCheckerForm } from '@/components/symptom-checker/SymptomCheckerForm';
import { SymptomAnalysisResult } from '@/components/symptom-checker/SymptomAnalysisResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Brain, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';

interface AnalysisResult {
  analysis: string;
  sources: Array<{
    fileName: string;
    chunkIndex: number;
    preview: string;
    category: string;
  }>;
  metadata: {
    chunksSearched: number;
    patternsFound: number;
    pointsReferenced: number;
    conditionsChecked: number;
  };
}

export default function SymptomChecker() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (symptoms: string, patientInfo: any) => {
    if (!user) {
      toast.error('Please login to use the Symptom Checker');
      navigate('/gate');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('symptom-checker', {
        body: { symptoms, patientInfo }
      });

      if (error) {
        console.error('Symptom checker error:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI service unavailable. Please try again later.');
        } else {
          toast.error('Failed to analyze symptoms. Please try again.');
        }
        return;
      }

      setResult(data);
      toast.success('Analysis complete!');
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
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
                Please login to access the AI Symptom Checker.
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
        <title>AI Symptom Checker | TCM Pattern Analysis</title>
        <meta 
          name="description" 
          content="AI-powered TCM symptom analysis. Describe symptoms and get TCM pattern suggestions with recommended acupuncture points."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tcm-brain')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to TCM Brain
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jade/10 border border-jade/20 mb-4">
              <Brain className="h-5 w-5 text-jade" />
              <span className="text-jade font-medium">AI Symptom Checker</span>
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">
              TCM Pattern Analysis
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Describe patient symptoms and let AI analyze them using Dr. Sapir's TCM knowledge base
              to identify patterns and suggest relevant acupuncture points.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto">
            {result ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Analysis Results
                  </h2>
                  <Button variant="outline" onClick={handleNewAnalysis}>
                    New Analysis
                  </Button>
                </div>
                <SymptomAnalysisResult
                  analysis={result.analysis}
                  sources={result.sources}
                  metadata={result.metadata}
                />
              </div>
            ) : (
              <SymptomCheckerForm
                onSubmit={handleAnalyze}
                isLoading={isAnalyzing}
              />
            )}
          </div>

          {/* Disclaimer */}
          <div className="max-w-3xl mx-auto mt-8">
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Disclaimer:</strong> This AI tool is for educational and clinical decision support only. 
                  It does not replace professional medical diagnosis. Always verify suggestions with your clinical expertise 
                  and consider each patient's unique presentation.
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
