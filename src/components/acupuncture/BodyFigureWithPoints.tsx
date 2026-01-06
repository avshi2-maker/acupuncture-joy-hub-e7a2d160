import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InteractivePointMarker } from './InteractivePointMarker';
import { MapPin, ZoomIn, ZoomOut, Info, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPointsForFigure, normalizePointCode } from '@/data/point-figure-mapping';
import { usePointCoordinates } from '@/hooks/usePointCoordinates';

// Import all body figure images
import abdomenImg from '@/assets/body-figures/abdomen.png';
import shoulderSideImg from '@/assets/body-figures/shoulder_side.png';
import neckPosteriorImg from '@/assets/body-figures/neck_posterior.png';
import handDorsumImg from '@/assets/body-figures/hand_dorsum.png';
import scalpTopImg from '@/assets/body-figures/scalp_top.png';
import faceFrontImg from '@/assets/body-figures/face_front.png';
import kneeFrontImg from '@/assets/body-figures/knee_front.png';
import ankleImg from '@/assets/body-figures/ankle.png';
import sacrumBackImg from '@/assets/body-figures/sacrum_back.png';
import neckFrontImg from '@/assets/body-figures/neck_front.png';
import shoulderAnteriorImg from '@/assets/body-figures/shoulder_anterior.png';
import ankleMedialImg from '@/assets/body-figures/ankle_medial.png';
import kneeLateralImg from '@/assets/body-figures/knee_lateral.png';
import kneeMedialImg from '@/assets/body-figures/knee_medial.png';
import kneeBackImg from '@/assets/body-figures/knee_back.png';
import headLateralImg from '@/assets/body-figures/head_lateral.png';
import earImg from '@/assets/body-figures/ear.png';
import tongueImg from '@/assets/body-figures/tongue.png';
import chestImg from '@/assets/body-figures/chest.png';
import upperBackImg from '@/assets/body-figures/upper_back.png';
import lowerBackImg from '@/assets/body-figures/lower_back.png';
import armFullImg from '@/assets/body-figures/arm_full.png';
import elbowInnerImg from '@/assets/body-figures/elbow_inner.png';
import wristImg from '@/assets/body-figures/wrist.png';
import thighHipImg from '@/assets/body-figures/thigh_hip.png';
import lowerLegImg from '@/assets/body-figures/lower_leg.png';
import footTopImg from '@/assets/body-figures/foot_top.png';
import footSoleImg from '@/assets/body-figures/foot_sole.png';
import childFrontImg from '@/assets/body-figures/child_front.png';
import childBackImg from '@/assets/body-figures/child_back.png';
import abdomenZoomedImg from '@/assets/body-figures/abdomen_zoomed.png';
import ankleSideImg from '@/assets/body-figures/ankle_side.png';
import handImg from '@/assets/body-figures/hand.png';
import footImg from '@/assets/body-figures/foot.png';
import legsPosteriorImg from '@/assets/body-figures/legs_posterior.png';
import sacrumImg from '@/assets/body-figures/sacrum.png';
import abdomenFemaleImg from '@/assets/body-figures/abdomen_female.png';

const imageMap: Record<string, string> = {
  'abdomen.png': abdomenImg,
  'shoulder_side.png': shoulderSideImg,
  'neck_posterior.png': neckPosteriorImg,
  'hand_dorsum.png': handDorsumImg,
  'scalp_top.png': scalpTopImg,
  'face_front.png': faceFrontImg,
  'knee_front.png': kneeFrontImg,
  'ankle.png': ankleImg,
  'sacrum_back.png': sacrumBackImg,
  'neck_front.png': neckFrontImg,
  'shoulder_anterior.png': shoulderAnteriorImg,
  'ankle_medial.png': ankleMedialImg,
  'knee_lateral.png': kneeLateralImg,
  'knee_medial.png': kneeMedialImg,
  'knee_back.png': kneeBackImg,
  'head_lateral.png': headLateralImg,
  'ear.png': earImg,
  'tongue.png': tongueImg,
  'chest.png': chestImg,
  'upper_back.png': upperBackImg,
  'lower_back.png': lowerBackImg,
  'arm_full.png': armFullImg,
  'elbow_inner.png': elbowInnerImg,
  'wrist.png': wristImg,
  'thigh_hip.png': thighHipImg,
  'lower_leg.png': lowerLegImg,
  'foot_top.png': footTopImg,
  'foot_sole.png': footSoleImg,
  'child_front.png': childFrontImg,
  'child_back.png': childBackImg,
  'abdomen_zoomed.png': abdomenZoomedImg,
  'ankle_side.png': ankleSideImg,
  'hand.png': handImg,
  'foot.png': footImg,
  'legs_posterior.png': legsPosteriorImg,
  'sacrum.png': sacrumImg,
  'abdomen_female.png': abdomenFemaleImg,
};

interface AcuPoint {
  id: string;
  code: string;
  name_english: string;
  name_chinese: string;
  name_pinyin: string;
  meridian: string;
  location: string;
  indications: string[];
  actions: string[];
}

interface BodyFigureWithPointsProps {
  filename: string;
  highlightedPoints?: string[];
  selectedPoints?: string[];
  onPointClick?: (point: AcuPoint) => void;
  onPointSelect?: (code: string) => void;
  showAllPoints?: boolean;
  compact?: boolean;
  className?: string;
  showSearch?: boolean;
}

export function BodyFigureWithPoints({
  filename,
  highlightedPoints = [],
  selectedPoints = [],
  onPointClick,
  onPointSelect,
  showAllPoints = true,
  compact = false,
  className = '',
  showSearch = false
}: BodyFigureWithPointsProps) {
  const [zoom, setZoom] = useState(1);
  const [acuPoints, setAcuPoints] = useState<AcuPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  // Load precise coordinates from CSV
  const { getCoordinatesForFigure, getPointCoordinate, isLoading: coordsLoading } = usePointCoordinates();

  // Get the points that should be shown on this figure from mapping
  const figurePointCodes = useMemo(() => getPointsForFigure(filename), [filename]);
  
  // Get precise coordinates for this figure from CSV
  const figureCoordinates = useMemo(() => {
    return getCoordinatesForFigure(filename);
  }, [filename, getCoordinatesForFigure]);

  // Fetch point details from database
  useEffect(() => {
    const fetchPoints = async () => {
      if (figurePointCodes.length === 0 && figureCoordinates.length === 0) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('acupuncture_points')
        .select('*');
      
      if (!error && data) {
        // Combine points from both mapping and CSV coordinates
        const allCodes = new Set([
          ...figurePointCodes.map(normalizePointCode),
          ...figureCoordinates.map(c => normalizePointCode(c.point_code))
        ]);
        
        const filtered = data.filter(p => 
          allCodes.has(normalizePointCode(p.code))
        );
        
        setAcuPoints(filtered.map(p => ({
          id: p.id,
          code: p.code,
          name_english: p.name_english,
          name_chinese: p.name_chinese,
          name_pinyin: p.name_pinyin,
          meridian: p.meridian,
          location: p.location,
          indications: p.indications || [],
          actions: p.actions || [],
        })));
      }
      setLoading(false);
    };
    fetchPoints();
  }, [figurePointCodes, figureCoordinates]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toUpperCase();
      const matches = acuPoints
        .filter(p => 
          p.code.toUpperCase().includes(query) ||
          p.name_english.toUpperCase().includes(query) ||
          p.meridian.toUpperCase().includes(query)
        )
        .map(p => p.code);
      setSearchResults(matches);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, acuPoints]);

  // Points to display
  const displayPoints = useMemo(() => {
    if (searchResults.length > 0) {
      // Show only search results
      return acuPoints.filter(p => 
        searchResults.some(code => normalizePointCode(code) === normalizePointCode(p.code))
      );
    }
    if (showAllPoints) return acuPoints;
    
    // Only show highlighted or selected points
    const visibleCodes = [...new Set([...highlightedPoints, ...selectedPoints])];
    return acuPoints.filter(p => 
      visibleCodes.some(code => normalizePointCode(code) === normalizePointCode(p.code))
    );
  }, [acuPoints, highlightedPoints, selectedPoints, showAllPoints, searchResults]);

  // Get point position - prefer CSV coordinates, fallback to grid
  // Clamp coordinates to ensure points stay within the visible body figure (5-95%)
  const clampCoordinate = (value: number): number => Math.max(5, Math.min(95, value));
  
  const getPointPosition = (pointCode: string): { x: number; y: number } | null => {
    const coord = getPointCoordinate(filename, pointCode);
    if (coord) {
      return { 
        x: clampCoordinate(coord.x_percent), 
        y: clampCoordinate(coord.y_percent) 
      };
    }
    
    // Fallback: generate a grid position for points not in CSV
    const normalizedCode = normalizePointCode(pointCode);
    const allCodes = acuPoints.map(p => normalizePointCode(p.code));
    const index = allCodes.indexOf(normalizedCode);
    if (index === -1) return null;
    
    const total = allCodes.length;
    const cols = Math.ceil(Math.sqrt(total));
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Ensure fallback positions stay within visible bounds (15-85%)
    return {
      x: 15 + (col / (cols - 1 || 1)) * 70,
      y: 15 + (row / (Math.ceil(total / cols) - 1 || 1)) * 70
    };
  };

  const handlePointClick = (point: AcuPoint) => {
    onPointClick?.(point);
    onPointSelect?.(point.code);
  };

  const getFigureName = (file: string) => {
    return file
      .replace('.png', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const imageSrc = imageMap[filename];
  if (!imageSrc) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          Image not found: {filename}
        </CardContent>
      </Card>
    );
  }

  const isHighlighted = (code: string) => 
    highlightedPoints.some(h => normalizePointCode(h) === normalizePointCode(code));
  
  const isSelected = (code: string) => 
    selectedPoints.some(s => normalizePointCode(s) === normalizePointCode(code));
  
  const isSearchMatch = (code: string) =>
    searchResults.some(s => normalizePointCode(s) === normalizePointCode(code));

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div 
          className="relative"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <img
            src={imageSrc}
            alt={getFigureName(filename)}
            className="max-w-full h-auto"
          />
          {displayPoints.map(point => {
            const pos = getPointPosition(point.code);
            if (!pos) return null;
            
            return (
              <InteractivePointMarker
                key={point.id}
                point={point}
                x={pos.x}
                y={pos.y}
                isHighlighted={isHighlighted(point.code) || isSearchMatch(point.code)}
                isSelected={isSelected(point.code)}
                onClick={() => handlePointClick(point)}
                size="sm"
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="py-2 px-3 space-y-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-jade" />
            {getFigureName(filename)}
            {displayPoints.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs">
                {displayPoints.length} pts
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-[10px] text-muted-foreground w-8 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search points (e.g., ST36, Zusanli)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 pr-7 text-xs"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        
        {/* Search Results Count */}
        {searchResults.length > 0 && (
          <div className="text-xs text-jade">
            Found {searchResults.length} matching point{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-2">
        <ScrollArea className="h-[350px]">
          <div 
            className="relative inline-block"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            <img
              src={imageSrc}
              alt={getFigureName(filename)}
              className="max-w-none"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            {(loading || coordsLoading) ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <span className="text-sm text-muted-foreground">Loading points...</span>
              </div>
            ) : (
              displayPoints.map(point => {
                const pos = getPointPosition(point.code);
                if (!pos) return null;
                
                return (
                  <InteractivePointMarker
                    key={point.id}
                    point={point}
                    x={pos.x}
                    y={pos.y}
                    isHighlighted={isHighlighted(point.code) || isSearchMatch(point.code)}
                    isSelected={isSelected(point.code)}
                    onClick={() => handlePointClick(point)}
                    size="md"
                    showLabel
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
        
        {highlightedPoints.length > 0 && (
          <div className="mt-2 p-2 bg-jade/10 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-jade mb-1">
              <Info className="h-3 w-3" />
              <span className="font-medium">AI Suggested Points</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {highlightedPoints.map(code => (
                <Badge 
                  key={code} 
                  className="bg-jade text-xs cursor-pointer hover:bg-jade/80 transition-colors"
                  onClick={() => {
                    const point = acuPoints.find(p => normalizePointCode(p.code) === normalizePointCode(code));
                    if (point) handlePointClick(point);
                  }}
                >
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
