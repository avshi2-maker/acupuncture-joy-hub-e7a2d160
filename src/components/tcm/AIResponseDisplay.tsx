import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Activity,
  Apple,
  Clock,
  Leaf,
  Loader2,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { PointInfoCard } from '@/components/tcm/PointInfoCard';

interface AIResponseDisplayProps {
  isLoading: boolean;
  content: string;
  query: string;
  onViewBodyMap: (points: string[]) => void;
  loadingStartTime?: number;
}

function parseHerbs(text: string): string[] {
  const pattern =
    /\b(Huang Qi|Ren Shen|Bai Zhu|Fu Ling|Dang Gui|Bai Shao|Chuan Xiong|Chai Hu|Sheng Jiang|Da Zao|Gan Cao|Ban Xia|Chen Pi|Zhi Shi|Hou Po|Ge Gen|Ju Hua|Bo He|Shi Gao|Zhi Mu|Huang Qin|Huang Lian|Huang Bai|Long Dan Cao|Jin Yin Hua|Lian Qiao|Pu Gong Ying|Sheng Di Huang|Xuan Shen|Mu Dan Pi|Di Gu Pi|Qing Hao|Da Huang|Mang Xiao|Huo Ma Ren|Rou Gui|Fu Zi|Gan Jiang|Wu Zhu Yu)\b/g;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches)].slice(0, 12);
}

function parseNutrition(text: string): string[] {
  const pattern =
    /(?:diet|nutrition|foods? to (?:eat|avoid)|avoid|include|consume|warm foods?|cold foods?|cooling foods?|warming foods?)\b[^.\n]*[.\n]?/gi;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map((m) => m.trim()).filter((m) => m.length >= 10 && m.length <= 140))].slice(0, 8);
}

function parseLifestyle(text: string): string[] {
  const pattern =
    /(?:lifestyle|exercise|sleep|stress|relax|meditation|breathing|walk|rest|routine)\b[^.\n]*[.\n]?/gi;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map((m) => m.trim()).filter((m) => m.length >= 10 && m.length <= 160))].slice(0, 8);
}

export function AIResponseDisplay({
  isLoading,
  content,
  query,
  onViewBodyMap,
  loadingStartTime,
}: AIResponseDisplayProps) {
  const [activeSection, setActiveSection] = useState<'points' | 'herbs' | 'nutrition' | 'lifestyle' | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const points = useMemo(() => parsePointReferences(content), [content]);
  const herbs = useMemo(() => parseHerbs(content), [content]);
  const nutrition = useMemo(() => parseNutrition(content), [content]);
  const lifestyle = useMemo(() => parseLifestyle(content), [content]);

  const quickTopics = useMemo(() => {
    const topics: string[] = [];
    if (points.length) topics.push(`Points: ${points.slice(0, 6).join(', ')}${points.length > 6 ? '…' : ''}`);
    if (herbs.length) topics.push(`Herbs: ${herbs.slice(0, 6).join(', ')}${herbs.length > 6 ? '…' : ''}`);
    if (nutrition.length) topics.push(`Nutrition: ${nutrition.slice(0, 2).join(' • ')}${nutrition.length > 2 ? '…' : ''}`);
    if (lifestyle.length) topics.push(`Lifestyle: ${lifestyle.slice(0, 2).join(' • ')}${lifestyle.length > 2 ? '…' : ''}`);
    if (!topics.length && content) topics.push('Report received. Use the asset buttons to open quick sections.');
    if (!content && isLoading) topics.push('AI is analyzing your query…');
    return topics.slice(0, 6);
  }, [content, herbs, lifestyle, nutrition, points, isLoading]);

  useEffect(() => {
    if (isLoading && loadingStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - loadingStartTime) / 1000));
      }, 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, loadingStartTime]);

  useEffect(() => {
    if (!content || isLoading) return;
    setActiveSection((prev) =>
      prev ?? (points.length ? 'points' : herbs.length ? 'herbs' : nutrition.length ? 'nutrition' : lifestyle.length ? 'lifestyle' : null)
    );
  }, [content, isLoading, points.length, herbs.length, nutrition.length, lifestyle.length]);

  if (!isLoading && !content) return null;

  const assetButtons = [
    { id: 'points' as const, icon: MapPin, label: 'Points', count: points.length },
    { id: 'herbs' as const, icon: Leaf, label: 'Herbs', count: herbs.length },
    { id: 'nutrition' as const, icon: Apple, label: 'Nutrition', count: nutrition.length },
    { id: 'lifestyle' as const, icon: Activity, label: 'Lifestyle', count: lifestyle.length },
  ];

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader className="py-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium truncate max-w-[420px]">{query}</span>
          </div>

          <div className="flex items-center gap-2">
            {(isLoading || content) && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Sparkles className="h-4 w-4" />
                    <span className="sr-only">Session quick view</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="max-w-sm">
                  <div className="text-xs font-medium mb-1">Session quick view</div>
                  <ul className="text-xs space-y-1">
                    {quickTopics.map((t) => (
                      <li key={t} className="text-muted-foreground">
                        • {t}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}

            {isLoading && (
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <Clock className="h-3 w-3" />
                <span className="font-mono">{elapsedTime}s</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading && !content && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">AI is working…</p>
              <p className="text-xs text-muted-foreground">Building a report with points, herbs, nutrition and lifestyle guidance</p>
            </div>
          </div>
        )}

        {content && (
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">English report</span>
                {isLoading && <span className="text-xs text-muted-foreground">Streaming…</span>}
              </div>

              <ScrollArea className="h-[440px] rounded-md border border-border/60 bg-background/40">
                <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed text-left">
                  {content}
                  {isLoading && (
                    <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1 align-text-bottom" />
                  )}
                </div>
              </ScrollArea>
            </section>

            <aside className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => onViewBodyMap(points)}
                >
                  <User className="h-3 w-3" />
                  Body map
                  {points.length > 0 && (
                    <Badge variant="secondary" className="h-4 min-w-4 text-[10px] px-1">
                      {points.length}
                    </Badge>
                  )}
                </Button>

                {assetButtons.map((asset) => (
                  <Button
                    key={asset.id}
                    variant={activeSection === asset.id ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setActiveSection(activeSection === asset.id ? null : asset.id)}
                  >
                    <asset.icon className="h-3 w-3" />
                    {asset.label}
                    {asset.count > 0 && (
                      <Badge variant="secondary" className="h-4 min-w-4 text-[10px] px-1">
                        {asset.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {activeSection === 'points' && (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Recommended points</span>
                  </div>

                  {points.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {points.map((point) => (
                        <PointInfoCard
                          key={point}
                          pointCode={point}
                          onViewBodyMap={(p) => onViewBodyMap([p])}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No acupuncture points detected in this report yet.
                    </p>
                  )}
                </div>
              )}

              {activeSection === 'herbs' && herbs.length > 0 && (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Herbs</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {herbs.map((herb) => (
                      <Badge key={herb} variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        {herb}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'nutrition' && nutrition.length > 0 && (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Apple className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Nutrition</span>
                  </div>
                  <ul className="space-y-2">
                    {nutrition.map((item) => (
                      <li key={item} className="text-sm text-foreground/90">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection === 'lifestyle' && lifestyle.length > 0 && (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Lifestyle</span>
                  </div>
                  <ul className="space-y-2">
                    {lifestyle.map((item) => (
                      <li key={item} className="text-sm text-foreground/90">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
