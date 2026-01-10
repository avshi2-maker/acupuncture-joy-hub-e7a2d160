import { useState, useEffect, memo } from 'react';
import { BodyFigureSelector } from '@/components/acupuncture/BodyFigureSelector';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { AIErrorBoundary } from '@/components/tcm-brain/AIErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Brain, Trash2, Save, FolderOpen, X, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

interface PointPreset {
  id: string;
  name: string;
  points: string[];
  createdAt: string;
}

interface BodyMapTabProps {
  highlightedPoints: string[];
  aiResponseText?: string;
  streamChat: (message: string) => void;
  onTabChange: (tab: string) => void;
  onClearPoints?: () => void;
  onSetPoints?: (points: string[]) => void;
}

const PRESETS_STORAGE_KEY = 'tcm-point-presets';

function loadPresets(): PointPreset[] {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: PointPreset[]) {
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
}

/**
 * BodyMapTab - Phase 7 Final: React.memo for performance + AIErrorBoundary for graceful degradation
 */
export const BodyMapTab = memo(function BodyMapTab({ highlightedPoints, aiResponseText = '', streamChat, onTabChange, onClearPoints, onSetPoints }: BodyMapTabProps) {
  const [viewMode, setViewMode] = useState<'ai' | 'browse'>('browse');
  const [presets, setPresets] = useState<PointPreset[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [presetName, setPresetName] = useState('');
  
  // Load presets on mount
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // Auto-switch to AI tab when points become available
  useEffect(() => {
    if (highlightedPoints.length > 0) {
      setViewMode('ai');
    }
  }, [highlightedPoints.length]);

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

  const handleClearPoints = () => {
    onClearPoints?.();
    toast.success('Points cleared', { duration: 2000 });
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    if (highlightedPoints.length === 0) {
      toast.error('No points to save');
      return;
    }

    const newPreset: PointPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      points: [...highlightedPoints],
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    setPresetName('');
    setShowSaveInput(false);
    toast.success(`Saved "${newPreset.name}" with ${highlightedPoints.length} points`);
  };

  const handleLoadPreset = (preset: PointPreset) => {
    onSetPoints?.(preset.points);
    toast.success(`Loaded "${preset.name}" (${preset.points.length} points)`);
  };

  const handleDeletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    toast.success('Preset deleted');
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Point Summary Header */}
      {highlightedPoints.length > 0 && (
        <div className="mb-4 p-3 bg-jade/10 border border-jade/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-jade" />
              <span className="text-sm font-medium text-jade">
                {highlightedPoints.length} Active Point{highlightedPoints.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Preset */}
              {showSaveInput ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="h-7 w-32 text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleSavePreset}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowSaveInput(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setShowSaveInput(true)}>
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              )}

              {/* Load Preset Dropdown */}
              {presets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                      <FolderOpen className="h-3 w-3" />
                      Load
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Bookmark className="h-3 w-3" />
                      Saved Presets
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {presets.map((preset) => (
                      <DropdownMenuItem
                        key={preset.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleLoadPreset(preset)}
                      >
                        <span className="truncate">{preset.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1">
                            {preset.points.length}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreset(preset.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {/* Point Tags */}
          <div className="flex flex-wrap gap-1.5">
            {highlightedPoints.map((point) => (
              <Badge
                key={point}
                variant="outline"
                className="text-xs bg-background hover:bg-jade/20 cursor-default"
              >
                {point}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'ai' | 'browse')} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
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
          {highlightedPoints.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearPoints}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <TabsContent value="ai" className="mt-4">
          <AIErrorBoundary
            fallbackTitle="שגיאת AI - מצב ידני פעיל"
            fallbackDescription="שירות ה-AI אינו זמין כרגע. ניתן להמשיך לעבוד במצב 'עיון' - גלריית הגוף ומפת הנקודות פועלות כרגיל."
          >
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
          </AIErrorBoundary>
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
});
