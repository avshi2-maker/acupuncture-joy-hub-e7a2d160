import { BodyFigureSelector } from '@/components/acupuncture/BodyFigureSelector';

interface BodyMapTabProps {
  highlightedPoints: string[];
  streamChat: (message: string) => void;
  onTabChange: (tab: string) => void;
}

export function BodyMapTab({ highlightedPoints, streamChat, onTabChange }: BodyMapTabProps) {
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

  return (
    <div className="flex-1 overflow-auto p-4">
      <BodyFigureSelector 
        highlightedPoints={highlightedPoints} 
        onGenerateProtocol={handleGenerateProtocol}
      />
    </div>
  );
}
