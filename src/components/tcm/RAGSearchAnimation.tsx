import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, Search, CheckCircle2, AlertTriangle, ExternalLink, XCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface RAGSearchAnimationProps {
  isSearching: boolean;
  phase: 'idle' | 'searching-rag' | 'rag-found' | 'rag-not-found' | 'external-consent' | 'external-search' | 'complete';
  ragResults?: {
    chunksFound: number;
    documentsSearched: number;
    sources: string[];
  };
  onUseExternalAI?: () => void;
  onCancelExternalAI?: () => void;
}

// Expected RAG knowledge files
const RAG_ASSETS = [
  'tongue-diagnosis.csv',
  'pulse-diagnosis.csv',
  'diet-nutrition-intake.csv',
  'chronic-pain-management.csv',
  'digestive-disorders.csv',
  'immune-resilience.csv',
  'mental-health-tcm.csv',
  'pediatric-acupuncture.csv',
  'sport-performance-recovery.csv',
  'womens-health-tcm.csv',
  'work-stress-burnout.csv',
  'extreme-weather-climate.csv',
];

export function RAGSearchAnimation({ 
  isSearching, 
  phase, 
  ragResults,
  onUseExternalAI,
  onCancelExternalAI 
}: RAGSearchAnimationProps) {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);

  // Animate through assets during search
  useEffect(() => {
    if (phase === 'searching-rag') {
      const interval = setInterval(() => {
        setCurrentAssetIndex((prev) => (prev + 1) % RAG_ASSETS.length);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <>
      {/* Phase 1: Searching RAG Animation */}
      <AnimatePresence>
        {(phase === 'searching-rag' || phase === 'rag-found' || phase === 'rag-not-found') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Animated Shield Icon */}
                  <div className="relative">
                    <motion.div
                      animate={phase === 'searching-rag' ? { 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 0.5, repeat: phase === 'searching-rag' ? Infinity : 0 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        phase === 'rag-found' ? 'bg-green-500/20' : 
                        phase === 'rag-not-found' ? 'bg-amber-500/20' : 
                        'bg-primary/20'
                      }`}
                    >
                      {phase === 'searching-rag' && <Search className="w-6 h-6 text-primary animate-pulse" />}
                      {phase === 'rag-found' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                      {phase === 'rag-not-found' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                    </motion.div>
                    {phase === 'searching-rag' && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">
                        {phase === 'searching-rag' && 'Phase 1: Searching Proprietary Knowledge Base'}
                        {phase === 'rag-found' && 'Phase 1 Complete: Found in Knowledge Base'}
                        {phase === 'rag-not-found' && 'Phase 1 Complete: Not Found in Knowledge Base'}
                      </span>
                    </div>

                    {/* Attribution */}
                    <p className="text-xs text-muted-foreground mb-3">
                      Closed-data hub developed by <strong>Dr. Roni Sapir</strong> • CM Clinical Knowledge
                    </p>

                    {/* Searching Animation */}
                    {phase === 'searching-rag' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Database className="w-3 h-3" />
                          <span>Scanning: </span>
                          <motion.span
                            key={currentAssetIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-mono text-primary"
                          >
                            {RAG_ASSETS[currentAssetIndex]}
                          </motion.span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {RAG_ASSETS.map((asset, i) => (
                            <Badge 
                              key={asset} 
                              variant={i <= currentAssetIndex ? "default" : "outline"}
                              className={`text-[10px] transition-all ${
                                i === currentAssetIndex ? 'ring-2 ring-primary ring-offset-1' : ''
                              }`}
                            >
                              <FileText className="w-2 h-2 mr-1" />
                              {asset.replace('.csv', '').replace(/-/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Found Results */}
                    {phase === 'rag-found' && ragResults && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            {ragResults.chunksFound} matches found
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            from {ragResults.documentsSearched} documents
                          </span>
                        </div>
                        {ragResults.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ragResults.sources.slice(0, 5).map((source, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                <FileText className="w-2 h-2 mr-1" />
                                {source}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Not Found Message */}
                    {phase === 'rag-not-found' && (
                      <div className="space-y-2">
                        <p className="text-sm text-amber-600">
                          We could not find this symptom/topic in our proprietary knowledge assets.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Our closed-data hub searched all {RAG_ASSETS.length} knowledge files but found no relevant matches.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: External AI Consent Dialog */}
      <AlertDialog open={phase === 'external-consent'}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              External AI Required
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Your query could not be answered from <strong>Dr. Roni Sapir's proprietary knowledge base</strong>.
              </p>
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-sm font-medium text-amber-700">
                  Would you like to use external AI (ChatGPT/Gemini)?
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  External AI responses are NOT from Dr. Sapir's verified materials.
                </p>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                <Checkbox 
                  id="liability"
                  checked={liabilityAccepted}
                  onCheckedChange={(checked) => setLiabilityAccepted(!!checked)}
                  className="mt-0.5"
                />
                <label htmlFor="liability" className="text-xs text-muted-foreground cursor-pointer">
                  I understand that external AI responses are <strong>NOT covered by Dr. Sapir's liability</strong> and I take full responsibility for any clinical decisions based on external AI content.
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={onCancelExternalAI}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Stay in Knowledge Base
            </Button>
            <Button 
              onClick={onUseExternalAI}
              disabled={!liabilityAccepted}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Use External AI
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* External AI Search Indicator */}
      <AnimatePresence>
        {phase === 'external-search' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-amber-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-sm text-amber-700">Phase 2: Using External AI</span>
                    </div>
                    <p className="text-xs text-amber-600">
                      ⚠️ NOT from Dr. Sapir's verified materials • Liability waived
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact verification status for TCM Brain header
export function RAGVerificationStatus() {
  const [status, setStatus] = useState<{
    indexed: number;
    expected: number;
    isLoading: boolean;
  }>({ indexed: 0, expected: RAG_ASSETS.length, isLoading: true });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { count } = await supabase
          .from('knowledge_documents')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'indexed');
        setStatus({
          indexed: count || 0,
          expected: RAG_ASSETS.length,
          isLoading: false,
        });
      } catch {
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };
    checkStatus();
  }, []);

  if (status.isLoading) {
    return (
      <Badge variant="outline" className="text-xs">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Checking...
      </Badge>
    );
  }

  const allIndexed = status.indexed >= status.expected;

  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${allIndexed ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'}`}
    >
      {allIndexed ? (
        <>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          RAG: {status.indexed}/{status.expected}
        </>
      ) : (
        <>
          <AlertTriangle className="w-3 h-3 mr-1" />
          RAG: {status.indexed}/{status.expected}
        </>
      )}
    </Badge>
  );
}
