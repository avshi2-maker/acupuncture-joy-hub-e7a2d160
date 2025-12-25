import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Loader2, MapPin, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PointInfo {
  code: string;
  name_english: string;
  name_chinese: string;
  name_pinyin: string;
  meridian: string;
  location: string;
  indications: string[] | null;
  actions: string[] | null;
}

interface PointInfoCardProps {
  pointCode: string;
  onViewBodyMap?: (point: string) => void;
}

export function PointInfoCard({ pointCode, onViewBodyMap }: PointInfoCardProps) {
  const [pointInfo, setPointInfo] = useState<PointInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchPointInfo = async () => {
    if (fetched || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('acupuncture_points')
        .select('code, name_english, name_chinese, name_pinyin, meridian, location, indications, actions')
        .eq('code', pointCode)
        .maybeSingle();

      if (!error && data) {
        setPointInfo(data);
      }
    } catch (err) {
      console.error('Error fetching point info:', err);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  return (
    <HoverCard openDelay={200} closeDelay={100} onOpenChange={(open) => open && fetchPointInfo()}>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className="cursor-pointer border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          onClick={() => onViewBodyMap?.(pointCode)}
        >
          {pointCode}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 p-0" side="top">
        {loading && (
          <div className="flex items-center justify-center p-4 gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading…</span>
          </div>
        )}

        {!loading && !pointInfo && fetched && (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">No info available for {pointCode}</p>
          </div>
        )}

        {!loading && pointInfo && (
          <div className="space-y-3 p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-sm">{pointInfo.code}</span>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {pointInfo.meridian}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pointInfo.name_pinyin} • {pointInfo.name_chinese} • {pointInfo.name_english}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                <Target className="h-3 w-3" />
                Location
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                {pointInfo.location}
              </p>
            </div>

            {/* Indications */}
            {pointInfo.indications && pointInfo.indications.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <Zap className="h-3 w-3" />
                  Indications
                </div>
                <div className="flex flex-wrap gap-1 pl-4">
                  {pointInfo.indications.slice(0, 5).map((ind, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] h-5 font-normal">
                      {ind}
                    </Badge>
                  ))}
                  {pointInfo.indications.length > 5 && (
                    <Badge variant="outline" className="text-[10px] h-5 font-normal text-muted-foreground">
                      +{pointInfo.indications.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {pointInfo.actions && pointInfo.actions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <Zap className="h-3 w-3 rotate-45" />
                  Actions
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
                  {pointInfo.actions.slice(0, 4).map((action, i) => (
                    <li key={i}>• {action}</li>
                  ))}
                  {pointInfo.actions.length > 4 && (
                    <li className="text-muted-foreground/60">… and {pointInfo.actions.length - 4} more</li>
                  )}
                </ul>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/50">
              Click to view on body map
            </p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
