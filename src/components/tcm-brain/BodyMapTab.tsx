import { useState } from 'react';
import { BodyFigureSelector } from '@/components/acupuncture/BodyFigureSelector';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Brain } from 'lucide-react';

interface BodyMapTabProps {
  highlightedPoints: string[];
  aiResponseText?: string;
  streamChat: (message: string) => void;
  onTabChange: (tab: string) => void;
}

export function BodyMapTab({ highlightedPoints, aiResponseText = '', streamChat, onTabChange }: BodyMapTabProps) {
  const [viewMode, setViewMode] = useState<'ai' | 'browse'>('ai');

  const handleGenerateProtocol = (points: string[]) => {
    const prompt = `Generate a detailed TCM treatment protocol for the following acupuncture points: ${points.join(', ')}. 

Include:
1. Treatment principle and therapeutic goal
2. Point combination analysis - why these points work together
3. Needling technique recommendations (depth, angle, stimulation)
4. Order of point insertion
5. Recommended needle retention time
6. Contraindications and precautions
7. Expected therapeutic effects
8. Complementary techniques (moxa, cupping, electroacupuncture if applicable)
9. Treatment frequency and course recommendation`;
    
    streamChat(prompt);
    onTabChange('diagnostics');
  };

  const hasAIContent = highlightedPoints.length > 0 || aiResponseText.length > 0;

  return (
    <div className="flex-1 overflow-auto p-4">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'ai' | 'browse')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Suggested
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <MapPin className="h-4 w-4" />
            Browse All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4">
          {hasAIContent ? (
            <RAGBodyFigureDisplay
              pointCodes={highlightedPoints}
              aiResponseText={aiResponseText}
              onGenerateProtocol={handleGenerateProtocol}
              allowSelection={true}
              enableNarration={false}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No AI suggestions yet</p>
              <p className="text-sm">
                Ask TCM Brain about a condition or treatment to see relevant body figures with point markers.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-4">
          <BodyFigureSelector 
            highlightedPoints={highlightedPoints} 
            onGenerateProtocol={handleGenerateProtocol}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
