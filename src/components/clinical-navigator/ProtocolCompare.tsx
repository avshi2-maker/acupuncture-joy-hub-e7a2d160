import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  GitCompare, 
  X, 
  MapPin, 
  Stethoscope,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProtocolRecord {
  id: string;
  name: string;
  timestamp: string;
  points: string[];
  diagnosis: string;
  module: string;
}

interface ProtocolCompareProps {
  /** Available protocols to compare */
  protocols: ProtocolRecord[];
  /** Currently selected protocols for comparison (max 2) */
  selectedProtocols: ProtocolRecord[];
  /** Called when user selects/deselects a protocol */
  onSelectProtocol: (protocol: ProtocolRecord) => void;
  /** Called when comparison is confirmed */
  onCompare: (protocolA: ProtocolRecord, protocolB: ProtocolRecord) => void;
  /** Language */
  language?: 'en' | 'he';
  className?: string;
}

/**
 * Protocol Comparison Selector
 * Allows selecting two protocols for side-by-side comparison
 */
export function ProtocolCompareSelector({
  protocols,
  selectedProtocols,
  onSelectProtocol,
  onCompare,
  language = 'en',
  className
}: ProtocolCompareProps) {
  const labels = {
    title: language === 'he' ? 'השוואת פרוטוקולים' : 'Compare Protocols',
    selectTwo: language === 'he' ? 'בחר 2 פרוטוקולים להשוואה' : 'Select 2 protocols to compare',
    compare: language === 'he' ? 'השווה עכשיו' : 'Compare Now',
    selected: language === 'he' ? 'נבחר' : 'Selected',
  };

  const canCompare = selectedProtocols.length === 2;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-jade" />
          {labels.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{labels.selectTwo}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {protocols.map((protocol) => {
              const isSelected = selectedProtocols.some(p => p.id === protocol.id);
              return (
                <Button
                  key={protocol.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'w-full justify-start gap-2 h-auto py-2',
                    isSelected && 'bg-jade hover:bg-jade/90'
                  )}
                  onClick={() => onSelectProtocol(protocol)}
                  disabled={!isSelected && selectedProtocols.length >= 2}
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{protocol.name}</div>
                    <div className="text-xs opacity-80">
                      {protocol.module} • {protocol.points.length} points
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4 opacity-50" />
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {selectedProtocols.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedProtocols.map((p, idx) => (
              <Badge 
                key={p.id}
                className={cn(
                  'gap-1',
                  idx === 0 ? 'bg-blue-500' : 'bg-orange-500'
                )}
              >
                {idx === 0 ? 'A' : 'B'}: {p.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:opacity-70" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProtocol(p);
                  }}
                />
              </Badge>
            ))}
          </div>
        )}

        <Button
          className="w-full bg-jade hover:bg-jade/90 gap-2"
          disabled={!canCompare}
          onClick={() => onCompare(selectedProtocols[0], selectedProtocols[1])}
        >
          <GitCompare className="h-4 w-4" />
          {labels.compare}
        </Button>
      </CardContent>
    </Card>
  );
}

interface ComparisonViewProps {
  protocolA: ProtocolRecord;
  protocolB: ProtocolRecord;
  /** Called when user clicks a point */
  onPointClick?: (point: string, source: 'A' | 'B' | 'both') => void;
  /** Called to close comparison */
  onClose: () => void;
  /** Language */
  language?: 'en' | 'he';
}

/**
 * Side-by-side Protocol Comparison View
 * Shows both protocols with color-coded points
 */
export function ProtocolComparisonView({
  protocolA,
  protocolB,
  onPointClick,
  onClose,
  language = 'en'
}: ComparisonViewProps) {
  // Calculate point overlaps
  const { onlyA, onlyB, overlapping } = useMemo(() => {
    const setA = new Set(protocolA.points.map(p => p.toUpperCase()));
    const setB = new Set(protocolB.points.map(p => p.toUpperCase()));
    
    const overlap = [...setA].filter(p => setB.has(p));
    const aOnly = [...setA].filter(p => !setB.has(p));
    const bOnly = [...setB].filter(p => !setA.has(p));
    
    return {
      onlyA: aOnly,
      onlyB: bOnly,
      overlapping: overlap
    };
  }, [protocolA.points, protocolB.points]);

  const labels = {
    title: language === 'he' ? 'השוואת פרוטוקולים' : 'Protocol Comparison',
    protocolA: language === 'he' ? 'פרוטוקול A' : 'Protocol A',
    protocolB: language === 'he' ? 'פרוטוקול B' : 'Protocol B',
    uniquePoints: language === 'he' ? 'נקודות ייחודיות' : 'Unique Points',
    sharedPoints: language === 'he' ? 'נקודות משותפות' : 'Shared Points',
    diagnosis: language === 'he' ? 'אבחנה' : 'Diagnosis',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-jade" />
          {labels.title}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span className="text-sm">{labels.protocolA} ({onlyA.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span className="text-sm">{labels.protocolB} ({onlyB.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500" />
          <span className="text-sm">{labels.sharedPoints} ({overlapping.length})</span>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protocol A */}
        <Card className="border-blue-500/50 border-2">
          <CardHeader className="pb-2 bg-blue-500/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge className="bg-blue-500">A</Badge>
              {protocolA.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{labels.diagnosis}</p>
              <p className="text-sm line-clamp-3">{protocolA.diagnosis}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                {labels.uniquePoints} ({onlyA.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {onlyA.map(point => (
                  <Badge
                    key={point}
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                    onClick={() => onPointClick?.(point, 'A')}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocol B */}
        <Card className="border-orange-500/50 border-2">
          <CardHeader className="pb-2 bg-orange-500/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge className="bg-orange-500">B</Badge>
              {protocolB.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{labels.diagnosis}</p>
              <p className="text-sm line-clamp-3">{protocolB.diagnosis}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                {labels.uniquePoints} ({onlyB.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {onlyB.map(point => (
                  <Badge
                    key={point}
                    className="cursor-pointer bg-orange-500 hover:bg-orange-600"
                    onClick={() => onPointClick?.(point, 'B')}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overlapping Points */}
      {overlapping.length > 0 && (
        <Card className="border-purple-500/50 border-2">
          <CardHeader className="pb-2 bg-purple-500/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge className="bg-purple-500">{labels.sharedPoints}</Badge>
              <span className="text-muted-foreground font-normal">
                {language === 'he' ? 'נקודות המופיעות בשני הפרוטוקולים' : 'Points appearing in both protocols'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {overlapping.map(point => (
                <motion.div
                  key={point}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Badge
                    className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-sm py-1.5 px-3"
                    onClick={() => onPointClick?.(point, 'both')}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {point}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Get color-coded points for 3D body display from ProtocolRecord objects
 */
export function getComparisonColoredPoints(
  protocolA: ProtocolRecord,
  protocolB: ProtocolRecord
): { point: string; color: 'blue' | 'orange' | 'purple' }[] {
  return getComparisonColoredPointsFromArrays(protocolA.points, protocolB.points);
}

/**
 * Get color-coded points for 3D body display from point arrays
 */
export function getComparisonColoredPointsFromArrays(
  pointsA: string[],
  pointsB: string[]
): { point: string; color: 'blue' | 'orange' | 'purple' }[] {
  const setA = new Set(pointsA.map(p => p.toUpperCase()));
  const setB = new Set(pointsB.map(p => p.toUpperCase()));
  
  const result: { point: string; color: 'blue' | 'orange' | 'purple' }[] = [];
  
  // Add A-only points (blue)
  pointsA.forEach(p => {
    const upper = p.toUpperCase();
    if (!setB.has(upper)) {
      result.push({ point: p, color: 'blue' });
    }
  });
  
  // Add B-only points (orange)
  pointsB.forEach(p => {
    const upper = p.toUpperCase();
    if (!setA.has(upper)) {
      result.push({ point: p, color: 'orange' });
    }
  });
  
  // Add overlapping points (purple)
  pointsA.forEach(p => {
    const upper = p.toUpperCase();
    if (setB.has(upper)) {
      result.push({ point: p, color: 'purple' });
    }
  });
  
  return result;
}
