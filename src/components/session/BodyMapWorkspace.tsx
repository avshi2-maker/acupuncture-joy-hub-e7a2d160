import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Activity, 
  FileText, 
  Pill, 
  Bookmark,
  Plus,
  MapPin
} from 'lucide-react';

interface BodyMapWorkspaceProps {
  patientId: string;
  patientName?: string;
}

export function BodyMapWorkspace({ patientId, patientName }: BodyMapWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('bodymap');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Patient Header Bar */}
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-jade-500/10 to-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-jade-400 to-jade-600 flex items-center justify-center text-white font-semibold shadow-md">
              {patientName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {patientName || 'Patient Session'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Session in progress • ID: {patientId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Session Notes
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b border-border/30">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="bodymap" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" />
              Body Map
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5" />
              Points
            </TabsTrigger>
            <TabsTrigger value="herbs" className="gap-1.5 text-xs">
              <Pill className="h-3.5 w-3.5" />
              Herbs
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="bodymap" className="h-full m-0 p-4">
            <div className="h-full rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-jade-100 to-emerald-100 dark:from-jade-950 dark:to-emerald-950 mb-4">
                <User className="h-12 w-12 text-jade-600 dark:text-jade-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Interactive Body Map</h4>
              <p className="text-sm text-muted-foreground text-center max-w-[300px] mb-4">
                Click on body regions to explore acupuncture points and meridians
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>3D visualization coming soon</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="points" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* Selected Points */}
                <div className="p-4 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-jade-600" />
                      Selected Points
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {selectedPoints.length} points
                    </span>
                  </div>
                  {selectedPoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No points selected yet. Use the Body Map or search to add points.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedPoints.map((point) => (
                        <span
                          key={point}
                          className="px-3 py-1.5 rounded-full bg-jade-100 dark:bg-jade-900 text-jade-700 dark:text-jade-300 text-sm font-medium"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Add Common Points */}
                <div className="p-4 rounded-xl border border-border/50 bg-card">
                  <h4 className="font-medium mb-3">Quick Add Common Points</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['LI4', 'ST36', 'SP6', 'LV3', 'PC6', 'GB34', 'KI3', 'LU7', 'HT7'].map((point) => (
                      <Button
                        key={point}
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setSelectedPoints(prev => 
                          prev.includes(point) ? prev.filter(p => p !== point) : [...prev, point]
                        )}
                      >
                        <Plus className="h-3 w-3" />
                        {point}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="herbs" className="h-full m-0 p-4">
            <div className="h-full rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 mb-4">
                <Pill className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Herbal Prescriptions</h4>
              <p className="text-sm text-muted-foreground text-center max-w-[300px]">
                Search and prescribe herbal formulas based on pattern diagnosis
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="h-full m-0 p-4">
            <div className="h-full rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 mb-4">
                <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Session Notes</h4>
              <p className="text-sm text-muted-foreground text-center max-w-[300px]">
                Document observations, diagnosis, and treatment plan
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
