import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, MapPin, ArrowRight } from 'lucide-react';
import { usePointCoordinates } from '@/hooks/usePointCoordinates';

interface PointSearchPanelProps {
  onPointSelect?: (pointCode: string, figureFilename: string) => void;
  onFigureChange?: (filename: string) => void;
  className?: string;
}

export function PointSearchPanel({ 
  onPointSelect, 
  onFigureChange,
  className = '' 
}: PointSearchPanelProps) {
  const [query, setQuery] = useState('');
  const { searchPoints, getFiguresForPoint, allPointCodes, isLoading } = usePointCoordinates();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchPoints(query).slice(0, 20); // Limit results
  }, [query, searchPoints]);

  // Group results by point code
  const groupedResults = useMemo(() => {
    const groups = new Map<string, string[]>();
    searchResults.forEach(result => {
      if (!groups.has(result.point_code)) {
        groups.set(result.point_code, []);
      }
      groups.get(result.point_code)!.push(result.figure_filename);
    });
    return Array.from(groups.entries());
  }, [searchResults]);

  const handlePointClick = (pointCode: string, filename: string) => {
    onPointSelect?.(pointCode, filename);
    onFigureChange?.(filename);
  };

  // Popular points for quick access
  const popularPoints = ['ST36', 'LI4', 'SP6', 'CV4', 'GV20', 'PC6', 'LR3', 'BL23'];

  return (
    <Card className={className}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4 text-jade" />
          Point Search
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ST36, Zusanli, Stomach..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Access Points */}
        {!query && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Popular Points:</span>
            <div className="flex flex-wrap gap-1">
              {popularPoints.map(code => {
                const figures = getFiguresForPoint(code);
                return (
                  <Badge 
                    key={code}
                    variant="outline"
                    className="cursor-pointer hover:bg-jade/10 hover:border-jade transition-colors text-xs"
                    onClick={() => figures[0] && handlePointClick(code, figures[0])}
                  >
                    {code}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <ScrollArea className="h-[200px]">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Loading...
              </div>
            ) : groupedResults.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                No points found for "{query}"
              </div>
            ) : (
              <div className="space-y-2">
                {groupedResults.map(([pointCode, figures]) => (
                  <div key={pointCode} className="border rounded-lg p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-jade">{pointCode}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {figures.length} view{figures.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {figures.map(filename => (
                        <Button
                          key={filename}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2 hover:bg-jade/10"
                          onClick={() => handlePointClick(pointCode, filename)}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {filename.replace('.png', '').replace(/_/g, ' ')}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Total Points Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {allPointCodes.length} points mapped across all body figures
        </div>
      </CardContent>
    </Card>
  );
}
