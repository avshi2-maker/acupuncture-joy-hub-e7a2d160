import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Activity,
  Apple,
  Clock,
  FileText,
  Leaf,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { supabase } from '@/integrations/supabase/client';

interface AIResponseDisplayProps {
  isLoading: boolean;
  content: string;
  query: string;
  onViewBodyMap: (points: string[]) => void;
  loadingStartTime?: number;
}

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

interface HerbInfo {
  name_pinyin: string;
  name_english: string;
  name_chinese: string;
  category: string;
  nature: string | null;
  flavor: string[] | null;
  meridians: string[] | null;
  actions: string[] | null;
  indications: string[] | null;
}

function extractBulletsFromSection(text: string, sectionNames: string[]): string[] {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];

  const isHeadingLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Markdown headings or "Title:" style lines
    if (/^#{1,4}\s+/.test(trimmed)) return true;
    if (/^[A-Z][A-Za-z\s/&]{2,30}:\s*$/.test(trimmed)) return true;
    return false;
  };

  const normalizedNames = sectionNames.map((s) => s.toLowerCase());
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const line = raw.trim();

    // Start section
    const lower = line.toLowerCase();
    const sectionHit = normalizedNames.some((name) => {
      // Allow "## Nutrition" or "Nutrition:" etc.
      return lower === name || lower.startsWith(`${name}:`) || lower.startsWith(`${name} -`) || lower.includes(` ${name}`) || lower.startsWith(`# ${name}`) || lower.startsWith(`## ${name}`);
    });

    if (sectionHit) {
      inSection = true;
      // If inline content after colon, capture it
      const inline = line.split(':').slice(1).join(':').trim();
      if (inline) out.push(inline);
      continue;
    }

    // Stop when next heading begins
    if (inSection && isHeadingLine(line)) {
      inSection = false;
    }

    if (!inSection) continue;

    const bulletMatch = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bulletMatch?.[1]) out.push(bulletMatch[1].trim());
  }

  return out;
}

function parseHerbs(text: string): string[] {
  const fromSection = extractBulletsFromSection(text, ['Herbs', 'Herbal', 'Chinese Herbs', 'Herbal Formula', 'Formula']);

  const parsed = fromSection
    .map((line) => {
      // "Huang Qi (黄芪) — ..." -> "Huang Qi"
      const m = line.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})\b/);
      return m?.[1]?.trim();
    })
    .filter(Boolean) as string[];

  if (parsed.length > 0) return [...new Set(parsed)].slice(0, 12);

  // Fallback: known common herbs (legacy)
  const pattern =
    /\b(Huang Qi|Ren Shen|Bai Zhu|Fu Ling|Dang Gui|Bai Shao|Chuan Xiong|Chai Hu|Sheng Jiang|Da Zao|Gan Cao|Ban Xia|Chen Pi|Zhi Shi|Hou Po|Ge Gen|Ju Hua|Bo He|Shi Gao|Zhi Mu|Huang Qin|Huang Lian|Huang Bai|Long Dan Cao|Jin Yin Hua|Lian Qiao|Pu Gong Ying|Sheng Di Huang|Xuan Shen|Mu Dan Pi|Di Gu Pi|Qing Hao|Da Huang|Mang Xiao|Huo Ma Ren|Rou Gui|Fu Zi|Gan Jiang|Wu Zhu Yu)\b/g;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches)].slice(0, 12);
}

function parseNutrition(text: string): string[] {
  const fromSection = extractBulletsFromSection(text, ['Nutrition', 'Diet', 'Dietary', 'Foods']);

  const foodKeywords = /\b(food|foods|diet|eat|avoid|include|drink|tea|soup|broth|warm|warming|cold|cooling|spicy|sweet|dairy|gluten|alcohol|coffee|sugar|ginger|rice|congee|vegetable|fruit|meat|fish)\b/i;

  const cleaned = (fromSection.length ? fromSection : [])
    .map((m) => m.replace(/\s+/g, ' ').trim())
    .filter((m) => m.length >= 8 && m.length <= 180)
    .filter((m) => foodKeywords.test(m))
    .filter((m) => !/\btongue\b/i.test(m));

  return [...new Set(cleaned)].slice(0, 10);
}

function parseLifestyle(text: string): string[] {
  const fromSection = extractBulletsFromSection(text, ['Lifestyle', 'Sleep', 'Exercise', 'Stress', 'Routine']);
  const cleaned = fromSection
    .map((m) => m.replace(/\s+/g, ' ').trim())
    .filter((m) => m.length >= 8 && m.length <= 180);

  if (cleaned.length > 0) return [...new Set(cleaned)].slice(0, 10);

  // Fallback regex
  const pattern =
    /(?:lifestyle|exercise|sleep|stress|relax|meditation|breathing|walk|rest|routine)\b[^.\n]*[.\n]?/gi;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map((m) => m.trim()).filter((m) => m.length >= 10 && m.length <= 160))].slice(0, 8);
}

// Generate brief summary from content
function generateBrief(content: string, points: string[], herbs: string[]): string[] {
  const lines: string[] = [];
  
  // Extract key patterns/diagnosis
  const patternMatch = content.match(/(?:pattern|diagnosis|condition)[:\s]+([^.\n]+)/i);
  if (patternMatch) {
    lines.push(`Dx: ${patternMatch[1].trim().slice(0, 80)}`);
  }
  
  // Treatment principle
  const principleMatch = content.match(/(?:treatment principle|principle)[:\s]+([^.\n]+)/i);
  if (principleMatch) {
    lines.push(`Tx: ${principleMatch[1].trim().slice(0, 80)}`);
  }
  
  // Points summary
  if (points.length > 0) {
    lines.push(`Points: ${points.slice(0, 8).join(', ')}${points.length > 8 ? '...' : ''}`);
  }
  
  // Herbs summary
  if (herbs.length > 0) {
    lines.push(`Herbs: ${herbs.slice(0, 6).join(', ')}${herbs.length > 6 ? '...' : ''}`);
  }
  
  // If no specific matches, extract first meaningful sentence
  if (lines.length < 2) {
    const sentences = content.split(/[.!?]\s+/).filter(s => s.length > 20 && s.length < 150);
    if (sentences[0]) lines.push(sentences[0].slice(0, 100));
    if (sentences[1] && lines.length < 2) lines.push(sentences[1].slice(0, 100));
  }
  
  return lines.slice(0, 4);
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
  const [showBrief, setShowBrief] = useState(false);
  const [pointsData, setPointsData] = useState<Record<string, PointInfo>>({});
  const [herbsData, setHerbsData] = useState<Record<string, HerbInfo>>({});
  const [dataLoading, setDataLoading] = useState(false);
  const [alphabetFilter, setAlphabetFilter] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchedRef = useRef<{ points: Set<string>; herbs: Set<string> }>({ points: new Set(), herbs: new Set() });

  const points = useMemo(() => parsePointReferences(content), [content]);
  const herbs = useMemo(() => parseHerbs(content), [content]);
  const nutrition = useMemo(() => parseNutrition(content), [content]);
  const lifestyle = useMemo(() => parseLifestyle(content), [content]);
  const briefSummary = useMemo(() => generateBrief(content, points, herbs), [content, points, herbs]);

  // Filter points and herbs by alphabet
  const filteredPoints = useMemo(() => {
    if (!alphabetFilter) return points;
    return points.filter(p => p.toUpperCase().startsWith(alphabetFilter));
  }, [points, alphabetFilter]);

  const filteredHerbs = useMemo(() => {
    if (!alphabetFilter) return herbs;
    return herbs.filter(h => h.toUpperCase().startsWith(alphabetFilter));
  }, [herbs, alphabetFilter]);

  // Get available letters for current section
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    if (activeSection === 'points') {
      points.forEach(p => letters.add(p.charAt(0).toUpperCase()));
    } else if (activeSection === 'herbs') {
      herbs.forEach(h => letters.add(h.charAt(0).toUpperCase()));
    }
    return Array.from(letters).sort();
  }, [activeSection, points, herbs]);

  // Alphabet for the search bar
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Batch fetch all points and herbs data when content changes
  useEffect(() => {
    if (!content || isLoading) return;
    
    const fetchData = async () => {
      const newPoints = points.filter(p => !fetchedRef.current.points.has(p));
      const newHerbs = herbs.filter(h => !fetchedRef.current.herbs.has(h));
      
      if (newPoints.length === 0 && newHerbs.length === 0) return;
      
      setDataLoading(true);
      
      try {
        // Batch fetch all points at once
        if (newPoints.length > 0) {
          // Normalize codes for database lookup (database uses LI-4 format)
          const normalizedCodes = newPoints.map(p => {
            // Convert ST36 to ST-36 format for database lookup
            const match = p.match(/^([A-Za-z]+)(\d+)$/);
            if (match) return `${match[1].toUpperCase()}-${match[2]}`;
            return p;
          });
          
          const { data: pointsResult } = await supabase
            .from('acupuncture_points')
            .select('code, name_english, name_chinese, name_pinyin, meridian, location, indications, actions')
            .in('code', [...normalizedCodes, ...newPoints]); // Try both formats
          
          if (pointsResult) {
            const newPointsData: Record<string, PointInfo> = {};
            pointsResult.forEach(p => {
              // Store by both original and normalized code
              const normalized = p.code.replace(/-/g, '');
              newPointsData[p.code] = p;
              newPointsData[normalized] = p;
            });
            setPointsData(prev => ({ ...prev, ...newPointsData }));
            newPoints.forEach(p => fetchedRef.current.points.add(p));
          }
        }
        
        // Batch fetch all herbs at once
        if (newHerbs.length > 0) {
          const { data: herbsResult } = await supabase
            .from('herbs')
            .select('name_pinyin, name_english, name_chinese, category, nature, flavor, meridians, actions, indications')
            .in('name_pinyin', newHerbs);
          
          if (herbsResult) {
            const newHerbsData: Record<string, HerbInfo> = {};
            herbsResult.forEach(h => {
              newHerbsData[h.name_pinyin] = h;
            });
            setHerbsData(prev => ({ ...prev, ...newHerbsData }));
            newHerbs.forEach(h => fetchedRef.current.herbs.add(h));
          }
        }
      } catch (err) {
        console.error('Error batch fetching data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [content, isLoading, points, herbs]);

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

  // Render point with pre-fetched data (no additional queries)
  const renderPoint = (pointCode: string) => {
    const info = pointsData[pointCode] || pointsData[pointCode.replace(/-/g, '')];
    
    return (
      <HoverCard key={pointCode} openDelay={100} closeDelay={50}>
        <HoverCardTrigger asChild>
          <Badge
            variant="outline"
            className="cursor-pointer border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            onClick={() => onViewBodyMap([pointCode])}
          >
            {pointCode}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-80 p-0" side="top">
          {info ? (
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-sm">{info.code}</span>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {info.meridian}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {info.name_pinyin} • {info.name_chinese} • {info.name_english}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <Target className="h-3 w-3" />
                  Location
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                  {info.location}
                </p>
              </div>
              {info.indications && info.indications.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                    <Zap className="h-3 w-3" />
                    Indications
                  </div>
                  <div className="flex flex-wrap gap-1 pl-4">
                    {info.indications.slice(0, 5).map((ind, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5 font-normal">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {info.actions && info.actions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                    <Zap className="h-3 w-3 rotate-45" />
                    Actions
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
                    {info.actions.slice(0, 4).map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {dataLoading ? 'Loading...' : `${pointCode} - data pending`}
              </p>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  };

  // Render herb with pre-fetched data
  const renderHerb = (herbName: string) => {
    const info = herbsData[herbName];
    
    return (
      <HoverCard key={herbName} openDelay={100} closeDelay={50}>
        <HoverCardTrigger asChild>
          <Badge
            variant="outline"
            className="cursor-pointer border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {herbName}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-80 p-0" side="top">
          {info ? (
            <div className="space-y-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{info.name_pinyin}</span>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {info.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {info.name_chinese} • {info.name_english}
                </p>
              </div>
              {(info.nature || info.flavor) && (
                <div className="flex gap-2 text-xs">
                  {info.nature && <Badge variant="outline" className="text-[10px]">{info.nature}</Badge>}
                  {info.flavor?.slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              )}
              {info.meridians && info.meridians.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Meridians: {info.meridians.join(', ')}
                </p>
              )}
              {info.actions && info.actions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium">Actions:</span>
                  <ul className="text-xs text-muted-foreground space-y-0.5 pl-2">
                    {info.actions.slice(0, 3).map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {dataLoading ? 'Loading...' : `${herbName} - not in database`}
              </p>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader className="py-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium truncate max-w-[420px]">{query}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Brief Summary Toggle */}
            {content && (
              <Button
                variant={showBrief ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBrief(!showBrief)}
                disabled={isLoading}
                className="gap-1.5 text-xs"
                aria-disabled={isLoading}
              >
                <FileText className="h-3 w-3" />
                Brief
              </Button>
            )}

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
                <span className="text-xs text-muted-foreground">
                  {showBrief ? 'Brief summary' : 'Full report'}
                </span>
                {isLoading && <span className="text-xs text-muted-foreground">Streaming…</span>}
              </div>

              {showBrief ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Quick Brief</span>
                  </div>
                  {briefSummary.length > 0 ? (
                    <ul className="space-y-2">
                      {briefSummary.map((line, i) => (
                        <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Processing summary...</p>
                  )}
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Click "Brief" again to see full report
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[440px] rounded-md border border-border/60 bg-background/40">
                  <div className="p-4 whitespace-pre-wrap text-sm leading-relaxed text-left">
                    {content}
                    {isLoading && (
                      <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1 align-text-bottom" />
                    )}
                  </div>
                </ScrollArea>
              )}
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

                {assetButtons
                  .filter((asset) => asset.count > 0) // Only show buttons with content
                  .map((asset) => (
                  <Button
                    key={asset.id}
                    variant={activeSection === asset.id ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      setAlphabetFilter(null); // Reset filter when switching sections
                      setActiveSection(activeSection === asset.id ? null : asset.id);
                    }}
                  >
                    <asset.icon className="h-3 w-3" />
                    {asset.label}
                    <Badge variant="secondary" className="h-4 min-w-4 text-[10px] px-1">
                      {asset.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {dataLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading asset data...
                </div>
              )}

              {activeSection === 'points' && (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Recommended points</span>
                    <span className="text-xs text-muted-foreground">
                      ({Object.keys(pointsData).length > 0 ? 'pre-loaded' : 'loading...'})
                    </span>
                  </div>

                  {/* Alphabet filter bar */}
                  {points.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant={alphabetFilter === null ? 'default' : 'ghost'}
                        size="sm"
                        className="h-6 w-6 p-0 text-[10px]"
                        onClick={() => setAlphabetFilter(null)}
                      >
                        All
                      </Button>
                      {alphabet.map(letter => {
                        const isAvailable = availableLetters.includes(letter);
                        return (
                          <Button
                            key={letter}
                            variant={alphabetFilter === letter ? 'default' : 'ghost'}
                            size="sm"
                            className={`h-6 w-6 p-0 text-[10px] ${!isAvailable ? 'opacity-30 cursor-not-allowed' : ''}`}
                            onClick={() => isAvailable && setAlphabetFilter(letter)}
                            disabled={!isAvailable}
                          >
                            {letter}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {filteredPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredPoints.map(renderPoint)}
                    </div>
                  ) : alphabetFilter ? (
                    <p className="text-xs text-muted-foreground">
                      No points starting with "{alphabetFilter}".
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No acupuncture points detected in this report yet.
                    </p>
                  )}
                </div>
              )}

              {activeSection === 'herbs' && (
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Herbs</span>
                    <span className="text-xs text-muted-foreground">
                      ({Object.keys(herbsData).length > 0 ? 'pre-loaded' : herbs.length > 0 ? 'loading...' : ''})
                    </span>
                  </div>

                  {/* Alphabet filter bar */}
                  {herbs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant={alphabetFilter === null ? 'default' : 'ghost'}
                        size="sm"
                        className="h-6 w-6 p-0 text-[10px]"
                        onClick={() => setAlphabetFilter(null)}
                      >
                        All
                      </Button>
                      {alphabet.map(letter => {
                        const isAvailable = availableLetters.includes(letter);
                        return (
                          <Button
                            key={letter}
                            variant={alphabetFilter === letter ? 'default' : 'ghost'}
                            size="sm"
                            className={`h-6 w-6 p-0 text-[10px] ${!isAvailable ? 'opacity-30 cursor-not-allowed' : ''}`}
                            onClick={() => isAvailable && setAlphabetFilter(letter)}
                            disabled={!isAvailable}
                          >
                            {letter}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {filteredHerbs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredHerbs.map(renderHerb)}
                    </div>
                  ) : alphabetFilter ? (
                    <p className="text-xs text-muted-foreground">
                      No herbs starting with "{alphabetFilter}".
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No herbs detected in this report yet.
                    </p>
                  )}
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
