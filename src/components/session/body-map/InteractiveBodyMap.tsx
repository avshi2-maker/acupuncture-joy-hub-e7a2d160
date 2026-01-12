import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

// Body zone definitions with acupuncture points
const BODY_ZONES = {
  head: {
    id: 'head',
    name: 'Head & Face',
    nameHe: 'ראש ופנים',
    path: 'M150,30 C180,30 200,50 200,80 C200,120 180,140 150,150 C120,140 100,120 100,80 C100,50 120,30 150,30',
    center: { x: 150, y: 90 },
    points: [
      { code: 'GV20', name: 'Baihui', location: 'Crown of head', x: 150, y: 35 },
      { code: 'GV24', name: 'Shenting', location: 'Forehead', x: 150, y: 55 },
      { code: 'Yintang', name: 'Hall of Impression', location: 'Between eyebrows', x: 150, y: 70 },
      { code: 'ST8', name: 'Touwei', location: 'Temple', x: 125, y: 55 },
      { code: 'GB20', name: 'Fengchi', location: 'Base of skull', x: 135, y: 130 },
    ]
  },
  chest: {
    id: 'chest',
    name: 'Chest & Upper Back',
    nameHe: 'חזה וגב עליון',
    path: 'M100,150 L200,150 L210,180 L210,250 L90,250 L90,180 Z',
    center: { x: 150, y: 200 },
    points: [
      { code: 'CV17', name: 'Tanzhong', location: 'Center of chest', x: 150, y: 180 },
      { code: 'LU1', name: 'Zhongfu', location: 'Upper chest', x: 115, y: 165 },
      { code: 'PC6', name: 'Neiguan', location: 'Inner forearm (ref)', x: 185, y: 165 },
      { code: 'ST36', name: 'Zusanli', location: 'Below knee (ref)', x: 115, y: 220 },
      { code: 'CV12', name: 'Zhongwan', location: 'Upper abdomen', x: 150, y: 235 },
    ]
  },
  abdomen: {
    id: 'abdomen',
    name: 'Abdomen & Lower Back',
    nameHe: 'בטן וגב תחתון',
    path: 'M90,250 L210,250 L215,320 L200,380 L100,380 L85,320 Z',
    center: { x: 150, y: 315 },
    points: [
      { code: 'CV6', name: 'Qihai', location: 'Sea of Qi', x: 150, y: 280 },
      { code: 'CV4', name: 'Guanyuan', location: 'Gate of Origin', x: 150, y: 310 },
      { code: 'ST25', name: 'Tianshu', location: 'Lateral to navel', x: 125, y: 290 },
      { code: 'SP6', name: 'Sanyinjiao', location: 'Inner leg (ref)', x: 175, y: 290 },
      { code: 'KI3', name: 'Taixi', location: 'Inner ankle (ref)', x: 125, y: 350 },
    ]
  },
  arms: {
    id: 'arms',
    name: 'Arms & Hands',
    nameHe: 'ידיים וכפות',
    path: 'M60,160 L90,180 L90,250 L75,320 L55,320 L40,250 L40,180 Z M210,180 L240,160 L260,180 L260,250 L245,320 L225,320 L210,250 Z',
    center: { x: 65, y: 240 },
    points: [
      { code: 'LI4', name: 'Hegu', location: 'Back of hand', x: 50, y: 310 },
      { code: 'LI11', name: 'Quchi', location: 'Elbow crease', x: 55, y: 220 },
      { code: 'PC6', name: 'Neiguan', location: 'Inner forearm', x: 70, y: 270 },
      { code: 'HT7', name: 'Shenmen', location: 'Wrist crease', x: 65, y: 295 },
      { code: 'LU7', name: 'Lieque', location: 'Above wrist', x: 245, y: 285 },
      { code: 'TE5', name: 'Waiguan', location: 'Outer forearm', x: 250, y: 270 },
    ]
  },
  legs: {
    id: 'legs',
    name: 'Legs & Feet',
    nameHe: 'רגליים וכפות רגל',
    path: 'M100,380 L135,380 L140,480 L145,550 L125,550 L115,480 L100,440 Z M165,380 L200,380 L200,440 L185,480 L175,550 L155,550 L160,480 Z',
    center: { x: 150, y: 465 },
    points: [
      { code: 'ST36', name: 'Zusanli', location: 'Below knee', x: 115, y: 420 },
      { code: 'SP6', name: 'Sanyinjiao', location: 'Inner leg', x: 130, y: 480 },
      { code: 'GB34', name: 'Yanglingquan', location: 'Lateral knee', x: 190, y: 410 },
      { code: 'LV3', name: 'Taichong', location: 'Foot dorsum', x: 135, y: 540 },
      { code: 'KI1', name: 'Yongquan', location: 'Sole of foot', x: 165, y: 545 },
      { code: 'BL60', name: 'Kunlun', location: 'Outer ankle', x: 180, y: 520 },
    ]
  },
};

interface InteractiveBodyMapProps {
  onPointSelect?: (point: { code: string; name: string }) => void;
  selectedPoints?: string[];
}

export function InteractiveBodyMap({ onPointSelect, selectedPoints = [] }: InteractiveBodyMapProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const { lightTap, successTap } = useHaptic();

  const handleZoneClick = (zoneId: string) => {
    lightTap();
    setActiveZone(activeZone === zoneId ? null : zoneId);
  };

  const handlePointClick = (point: { code: string; name: string }) => {
    successTap(); // Stronger feedback for point selection
    onPointSelect?.(point);
  };

  const resetView = () => {
    setActiveZone(null);
    setZoom(1);
  };

  const activeZoneData = activeZone ? BODY_ZONES[activeZone as keyof typeof BODY_ZONES] : null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted/20 to-background">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary" className="text-xs">
          {activeZone ? activeZoneData?.name : 'Select a body region'}
        </Badge>
      </div>

      {/* Body Map SVG */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative"
        >
          <svg
            viewBox="0 0 300 580"
            className="w-full max-w-[280px] h-auto"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            {/* Body outline */}
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--jade-500))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--jade-600))" stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Render body zones */}
            {Object.values(BODY_ZONES).map((zone) => (
              <g key={zone.id}>
                <motion.path
                  d={zone.path}
                  fill={
                    activeZone === zone.id
                      ? 'hsl(var(--jade-500) / 0.3)'
                      : hoveredZone === zone.id
                      ? 'hsl(var(--jade-400) / 0.2)'
                      : 'url(#bodyGradient)'
                  }
                  stroke={
                    activeZone === zone.id
                      ? 'hsl(var(--jade-500))'
                      : 'hsl(var(--border))'
                  }
                  strokeWidth={activeZone === zone.id ? 2 : 1}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleZoneClick(zone.id)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  filter={activeZone === zone.id ? 'url(#glow)' : undefined}
                />

                {/* Zone label */}
                {!activeZone && (
                  <text
                    x={zone.center.x}
                    y={zone.center.y}
                    textAnchor="middle"
                    className="text-[10px] fill-muted-foreground pointer-events-none font-medium"
                  >
                    {zone.name}
                  </text>
                )}

                {/* Acupuncture points (show when zone is active) */}
                <AnimatePresence>
                  {activeZone === zone.id && zone.points.map((point) => (
                    <motion.g
                      key={point.code}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r={hoveredPoint === point.code ? 10 : 8}
                        fill={
                          selectedPoints.includes(point.code)
                            ? 'hsl(var(--jade-500))'
                            : hoveredPoint === point.code
                            ? 'hsl(var(--jade-400))'
                            : 'hsl(var(--jade-600) / 0.7)'
                        }
                        stroke="white"
                        strokeWidth={2}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePointClick(point);
                        }}
                        onMouseEnter={() => setHoveredPoint(point.code)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        filter="url(#glow)"
                      />
                      <text
                        x={point.x}
                        y={point.y - 14}
                        textAnchor="middle"
                        className="text-[9px] fill-foreground font-bold pointer-events-none"
                      >
                        {point.code}
                      </text>
                    </motion.g>
                  ))}
                </AnimatePresence>
              </g>
            ))}

            {/* Human figure icon when no zone selected */}
            {!activeZone && (
              <g opacity="0.1">
                <circle cx="150" cy="90" r="30" fill="currentColor" />
                <rect x="120" y="130" width="60" height="100" rx="10" fill="currentColor" />
              </g>
            )}
          </svg>
        </motion.div>
      </div>

      {/* Points Legend (when zone is active) */}
      <AnimatePresence>
        {activeZoneData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/30 overflow-hidden"
          >
            <ScrollArea className="max-h-[160px]">
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Points in {activeZoneData.name}:
                </p>
                {activeZoneData.points.map((point) => (
                  <button
                    key={point.code}
                    onClick={() => handlePointClick(point)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedPoints.includes(point.code)
                        ? "bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={selectedPoints.includes(point.code) ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {point.code}
                      </Badge>
                      <span className="font-medium">{point.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
