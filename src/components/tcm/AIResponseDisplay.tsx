import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Activity,
  AlertTriangle,
  Apple,
  Brain,
  Calendar,
  Clock,
  Compass,
  Dumbbell,
  FileText,
  Heart,
  Leaf,
  Loader2,
  MapPin,
  Moon,
  Printer,
  Scale,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { supabase } from '@/integrations/supabase/client';
// Audio buttons removed from this module
import { usePrintContent } from '@/hooks/usePrintContent';

interface AIResponseDisplayProps {
  isLoading: boolean;
  content: string;
  query: string;
  onViewBodyMap: (points: string[]) => void;
  loadingStartTime?: number;
  language?: 'he' | 'en' | 'ru';
  ragMeta?: {
    chunksFound: number;
    documentsSearched: number;
    isExternal?: boolean;
    auditLogged?: boolean;
    auditLogId?: string | null;
    auditLoggedAt?: string | null;
  };
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

// TCM-CAF: TCM Clinical Asset Framework - Full 15 Asset Categories with emojis
const SECTION_CONFIG = {
  diagnosis: {
    headings: ['Pattern', 'Diagnosis', 'Pattern / Diagnosis', 'Dx'],
    icon: Stethoscope,
    label: 'Diagnosis',
    emoji: '🩺',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  principle: {
    headings: ['Treatment Principle', 'Principle', 'Tx Principle'],
    icon: Target,
    label: 'Treatment',
    emoji: '🎯',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  points: {
    headings: ['Acupuncture Points', 'Points', 'Acupuncture'],
    icon: MapPin,
    label: 'Points',
    emoji: '📍',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
  },
  herbs: {
    headings: ['Herbal Formula', 'Herbs', 'Chinese Herbs', 'Formula'],
    icon: Leaf,
    label: 'Herbal Formula',
    emoji: '🌿',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  nutrition: {
    headings: ['Nutrition', 'Nutrition Recommendations', 'Diet', 'Dietary', 'Foods'],
    icon: Apple,
    label: 'Nutrition',
    emoji: '🍎',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  lifestyle: {
    headings: ['Lifestyle', 'Lifestyle & Wellness'],
    icon: Activity,
    label: 'Lifestyle',
    emoji: '💪',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  exercise: {
    headings: ['Exercise', 'Exercise & Movement', 'Movement', 'Sport'],
    icon: Dumbbell,
    label: 'Exercise',
    emoji: '🏃',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  wellness: {
    headings: ['Wellness', 'Wellness Practices', 'Self-Care'],
    icon: Heart,
    label: 'Wellness',
    emoji: '💖',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  safety: {
    headings: ['Safety', 'Safety & Contraindications', 'Contraindications', 'Precautions'],
    icon: AlertTriangle,
    label: 'Safety',
    emoji: '⚠️',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  mental: {
    headings: ['Mental', 'Mental & Emotional', 'Emotional', 'Shen', 'Mind'],
    icon: Brain,
    label: 'Mental & Emotional',
    emoji: '🧠',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  sleep: {
    headings: ['Sleep', 'Sleep Optimization', 'Rest', 'Sleep Quality'],
    icon: Moon,
    label: 'Sleep',
    emoji: '🌙',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
  condition: {
    headings: ['Condition', 'Condition Management', 'Management', 'Prognosis'],
    icon: TrendingUp,
    label: 'Condition Mgmt',
    emoji: '📈',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
  },
  constitution: {
    headings: ['Constitutional', 'Constitutional Balance', 'Constitution', 'Body Type'],
    icon: Scale,
    label: 'Constitution',
    emoji: '⚖️',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  astrology: {
    headings: ['Chinese Astrology', 'Astrology', 'Celestial', 'Timing'],
    icon: Star,
    label: 'Astrology',
    emoji: '⭐',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  bazi: {
    headings: ['BaZi', 'BaZi Considerations', 'Four Pillars', 'Birth Chart'],
    icon: Compass,
    label: 'BaZi',
    emoji: '🧭',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
};

type SectionKey = keyof typeof SECTION_CONFIG;

function extractSectionContent(text: string, sectionNames: string[]): string[] {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  const normalizedNames = sectionNames.map((s) => s.toLowerCase());
  let inSection = false;

  const isHeadingLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^#{1,4}\s+/.test(trimmed)) return true;
    if (/^[A-Z][A-Za-z\s/&]{2,40}:\s*$/.test(trimmed)) return true;
    if (/^\*\*[A-Z][A-Za-z\s/&]{2,40}\*\*/.test(trimmed)) return true;
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const line = raw.trim();
    const lower = line.toLowerCase().replace(/[#*]/g, '').trim();

    // Check if this line starts our target section
    const sectionHit = normalizedNames.some((name) => {
      return lower === name || 
             lower.startsWith(`${name}:`) || 
             lower.startsWith(`${name} -`) ||
             lower === name.replace(/\s+/g, '') ||
             lower.includes(name);
    });

    if (sectionHit && !inSection) {
      inSection = true;
      // Capture inline content after colon
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const inline = line.slice(colonIdx + 1).trim();
        if (inline) out.push(inline);
      }
      continue;
    }

    // Stop when next heading begins
    if (inSection && isHeadingLine(line) && !sectionHit) {
      inSection = false;
      continue;
    }

    if (!inSection) continue;

    // Skip empty lines
    if (!line) continue;

    // Extract bullet content
    const bulletMatch = line.match(/^(?:[-*•]|\d+\.)\s*(.*)$/);
    if (bulletMatch?.[1]) {
      out.push(bulletMatch[1].trim());
    } else if (line.length > 10 && !isHeadingLine(line)) {
      // Non-bullet content that's substantial
      out.push(line);
    }
  }

  return out.filter(item => item.length > 5);
}

function parseHerbs(text: string): string[] {
  const fromSection = extractSectionContent(text, SECTION_CONFIG.herbs.headings);

  const parsed = fromSection
    .map((line) => {
      // "Huang Qi (黄芪) 9g" -> "Huang Qi"
      const m = line.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,3})\b/);
      return m?.[1]?.trim();
    })
    .filter(Boolean) as string[];

  if (parsed.length > 0) return [...new Set(parsed)].slice(0, 15);

  // Fallback: known common herbs
  const pattern =
    /\b(Huang Qi|Ren Shen|Bai Zhu|Fu Ling|Dang Gui|Bai Shao|Chuan Xiong|Chai Hu|Sheng Jiang|Da Zao|Gan Cao|Ban Xia|Chen Pi|Zhi Shi|Hou Po|Ge Gen|Ju Hua|Bo He|Shi Gao|Zhi Mu|Huang Qin|Huang Lian|Huang Bai|Long Dan Cao|Jin Yin Hua|Lian Qiao|Pu Gong Ying|Sheng Di Huang|Xuan Shen|Mu Dan Pi|Di Gu Pi|Qing Hao|Da Huang|Mang Xiao|Huo Ma Ren|Rou Gui|Fu Zi|Gan Jiang|Wu Zhu Yu|Suan Zao Ren|Yuan Zhi|He Huan Pi|Long Gu|Mu Li)\b/g;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches)].slice(0, 15);
}

// Generate brief summary
function generateBrief(content: string, sections: Record<SectionKey, string[]>, points: string[], herbs: string[]): string[] {
  const lines: string[] = [];

  // Diagnosis
  if (sections.diagnosis.length > 0) {
    lines.push(`Dx: ${sections.diagnosis[0].slice(0, 100)}`);
  }

  // Treatment Principle
  if (sections.principle.length > 0) {
    lines.push(`Tx: ${sections.principle[0].slice(0, 100)}`);
  }

  // Points summary
  if (points.length > 0) {
    lines.push(`Points: ${points.slice(0, 8).join(', ')}${points.length > 8 ? '...' : ''}`);
  }

  // Herbs summary
  if (herbs.length > 0) {
    lines.push(`Herbs: ${herbs.slice(0, 6).join(', ')}${herbs.length > 6 ? '...' : ''}`);
  }

  return lines.slice(0, 5);
}

export function AIResponseDisplay({
  isLoading,
  content,
  query,
  onViewBodyMap,
  loadingStartTime,
  language = 'he',
  ragMeta,
}: AIResponseDisplayProps) {
  const { printContent } = usePrintContent();
  const printRef = useRef<HTMLDivElement>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showBrief, setShowBrief] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [pointsData, setPointsData] = useState<Record<string, PointInfo>>({});
  const [herbsData, setHerbsData] = useState<Record<string, HerbInfo>>({});
  const [dataLoading, setDataLoading] = useState(false);
  const [alphabetFilter, setAlphabetFilter] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchedRef = useRef<{ points: Set<string>; herbs: Set<string> }>({ points: new Set(), herbs: new Set() });

  // Parse all TCM-CAF sections (15 assets)
  const sections = useMemo(() => {
    const result: Record<SectionKey, string[]> = {
      diagnosis: [],
      principle: [],
      points: [],
      herbs: [],
      nutrition: [],
      lifestyle: [],
      exercise: [],
      wellness: [],
      safety: [],
      mental: [],
      sleep: [],
      condition: [],
      constitution: [],
      astrology: [],
      bazi: [],
    };

    Object.keys(SECTION_CONFIG).forEach((key) => {
      const config = SECTION_CONFIG[key as SectionKey];
      result[key as SectionKey] = extractSectionContent(content, config.headings);
    });

    return result;
  }, [content]);

  const points = useMemo(() => parsePointReferences(content), [content]);
  const herbs = useMemo(() => parseHerbs(content), [content]);
  const briefSummary = useMemo(() => generateBrief(content, sections, points, herbs), [content, sections, points, herbs]);

  // Filter points and herbs by alphabet
  const filteredPoints = useMemo(() => {
    if (!alphabetFilter) return points;
    return points.filter(p => p.toUpperCase().startsWith(alphabetFilter));
  }, [points, alphabetFilter]);

  const filteredHerbs = useMemo(() => {
    if (!alphabetFilter) return herbs;
    return herbs.filter(h => h.toUpperCase().startsWith(alphabetFilter));
  }, [herbs, alphabetFilter]);

  // Get available letters
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    if (expandedSection === 'points') {
      points.forEach(p => letters.add(p.charAt(0).toUpperCase()));
    } else if (expandedSection === 'herbs') {
      herbs.forEach(h => letters.add(h.charAt(0).toUpperCase()));
    }
    return Array.from(letters).sort();
  }, [expandedSection, points, herbs]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Batch fetch points and herbs data
  useEffect(() => {
    if (!content || isLoading) return;

    const fetchData = async () => {
      const newPoints = points.filter(p => !fetchedRef.current.points.has(p));
      const newHerbs = herbs.filter(h => !fetchedRef.current.herbs.has(h));

      if (newPoints.length === 0 && newHerbs.length === 0) return;

      setDataLoading(true);

      try {
        if (newPoints.length > 0) {
          const normalizedCodes = newPoints.map(p => {
            const match = p.match(/^([A-Za-z]+)(\d+)$/);
            if (match) return `${match[1].toUpperCase()}-${match[2]}`;
            return p;
          });

          const { data: pointsResult } = await supabase
            .from('acupuncture_points')
            .select('code, name_english, name_chinese, name_pinyin, meridian, location, indications, actions')
            .in('code', [...normalizedCodes, ...newPoints]);

          if (pointsResult) {
            const newPointsData: Record<string, PointInfo> = {};
            pointsResult.forEach(p => {
              const normalized = p.code.replace(/-/g, '');
              newPointsData[p.code] = p;
              newPointsData[normalized] = p;
            });
            setPointsData(prev => ({ ...prev, ...newPointsData }));
            newPoints.forEach(p => fetchedRef.current.points.add(p));
          }
        }

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

  if (!isLoading && !content) return null;

  // Get sections that have content
  const activeSections = (Object.keys(SECTION_CONFIG) as SectionKey[]).filter(
    key => sections[key].length > 0 || (key === 'points' && points.length > 0) || (key === 'herbs' && herbs.length > 0)
  );

  // Render point with hover card
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
                    <Badge variant="secondary" className="text-[10px] h-5">{info.meridian}</Badge>
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
                <p className="text-xs text-muted-foreground leading-relaxed pl-4">{info.location}</p>
              </div>
              {info.indications && info.indications.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                    <Zap className="h-3 w-3" />
                    Indications
                  </div>
                  <div className="flex flex-wrap gap-1 pl-4">
                    {info.indications.slice(0, 5).map((ind, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5 font-normal">{ind}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{dataLoading ? 'Loading...' : `${pointCode} - data pending`}</p>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  };

  // Render herb with hover card
  const renderHerb = (herbName: string) => {
    const info = herbsData[herbName];

    return (
      <HoverCard key={herbName} openDelay={100} closeDelay={50}>
        <HoverCardTrigger asChild>
          <Badge variant="outline" className="cursor-pointer border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
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
                  <Badge variant="secondary" className="text-[10px] h-5">{info.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{info.name_chinese} • {info.name_english}</p>
              </div>
              {(info.nature || info.flavor) && (
                <div className="flex gap-2 text-xs">
                  {info.nature && <Badge variant="outline" className="text-[10px]">{info.nature}</Badge>}
                  {info.flavor?.slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
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
              <p className="text-xs text-muted-foreground">{dataLoading ? 'Loading...' : `${herbName} - not in database`}</p>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  };

  // Render a section box
  const renderSectionBox = (key: SectionKey) => {
    const config = SECTION_CONFIG[key];
    const Icon = config.icon;
    const sectionItems = sections[key];
    const isExpanded = expandedSection === key;
    const hasSpecialContent = key === 'points' || key === 'herbs';

    // Determine item count
    const itemCount = key === 'points' ? points.length : key === 'herbs' ? herbs.length : sectionItems.length;
    if (itemCount === 0) return null;

    return (
      <div
        key={key}
        className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3 transition-all cursor-pointer hover:shadow-md ${
          isExpanded ? 'col-span-full' : ''
        }`}
        onClick={() => {
          setExpandedSection(isExpanded ? null : key);
          setAlphabetFilter(null);
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{config.emoji}</span>
            <span className="text-sm font-medium">{config.label}</span>
            <Badge variant="secondary" className="h-5 text-[10px] px-1.5">{itemCount}</Badge>
          </div>
          {!isExpanded && (
            <span className="text-xs text-muted-foreground">Click to expand</span>
          )}
        </div>

        {isExpanded ? (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* Alphabet filter for points/herbs */}
            {hasSpecialContent && (
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

            {/* Points content */}
            {key === 'points' && (
              <div className="flex flex-wrap gap-2">
                {filteredPoints.map(renderPoint)}
                {filteredPoints.length === 0 && alphabetFilter && (
                  <p className="text-xs text-muted-foreground">No points starting with "{alphabetFilter}"</p>
                )}
              </div>
            )}

            {/* Herbs content */}
            {key === 'herbs' && (
              <div className="flex flex-wrap gap-2">
                {filteredHerbs.map(renderHerb)}
                {filteredHerbs.length === 0 && alphabetFilter && (
                  <p className="text-xs text-muted-foreground">No herbs starting with "{alphabetFilter}"</p>
                )}
              </div>
            )}

            {/* Regular section content */}
            {!hasSpecialContent && (
              <ul className="space-y-2">
                {sectionItems.map((item, idx) => (
                  <li key={idx} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className={`${config.color} font-bold mt-0.5`}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground truncate">
            {key === 'points' && points.length > 0 && points.slice(0, 5).join(', ')}
            {key === 'herbs' && herbs.length > 0 && herbs.slice(0, 5).join(', ')}
            {!hasSpecialContent && sectionItems[0]?.slice(0, 80)}
            {((key === 'points' && points.length > 5) || (key === 'herbs' && herbs.length > 5) || (!hasSpecialContent && sectionItems.length > 1)) && '...'}
          </div>
        )}
      </div>
    );
  };

  // Determine text direction based on language
  const isRtl = language === 'he';
  const textAlign = isRtl ? 'text-right' : 'text-left';

  return (
    <Card className="border-border/60 bg-card shadow-sm" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="py-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium truncate max-w-[420px]">{query}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Brief Summary Toggle */}
            {content && (
              <>
                <Button
                  variant={showBrief ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setShowBrief(!showBrief); setShowFullReport(false); }}
                  disabled={isLoading}
                  className="gap-1.5 text-xs"
                >
                  <FileText className="h-3 w-3" />
                  Brief
                </Button>
                <Button
                  variant={showFullReport ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setShowFullReport(!showFullReport); setShowBrief(false); }}
                  disabled={isLoading}
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  Full Report
                </Button>
              </>
            )}

            {/* Body Map Button */}
            {points.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => onViewBodyMap(points)}
              >
                <User className="h-3 w-3" />
                Body Map
                <Badge variant="secondary" className="h-4 min-w-4 text-[10px] px-1">{points.length}</Badge>
              </Button>
            )}

            {/* Audio buttons removed - no TTS/MP3 generation in this module */}

            {/* Print Button */}
            {content && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => printContent(printRef.current, { title: 'TCM AI Report' })}
              >
                <Printer className="h-3 w-3" />
                Print
              </Button>
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
         {/* Evidence / liability meter (based on last backend query stats) */}
         {ragMeta && !isLoading && (
           <div className="mb-3 flex flex-wrap items-center gap-2">
             <Badge
               variant="outline"
               className={ragMeta.isExternal ? 'border-amber-500/30 text-amber-700 bg-amber-500/10' : 'border-green-500/30 text-green-700 bg-green-500/10'}
             >
               {ragMeta.isExternal
                 ? 'External AI (0% proprietary)'
                 : ragMeta.chunksFound > 0
                   ? 'Proprietary KB (100% proprietary)'
                   : 'No KB matches (0% proprietary)'}
             </Badge>

             <Badge variant="outline" className="text-xs">
               Evidence: {ragMeta.chunksFound} chunks • {ragMeta.documentsSearched} docs matched
             </Badge>

             {ragMeta.auditLogged && ragMeta.auditLogId && (
               <Badge variant="outline" className="text-xs">
                 Audit log: {ragMeta.auditLogId}
               </Badge>
             )}
            </div>
          )}

          {isLoading && !content && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">TCM-CAF Report Loading…</p>
              <p className="text-xs text-muted-foreground">Building all 15 clinical assets: Dx, Tx, Points, Herbs, Nutrition, Lifestyle, Exercise, Wellness, Safety, Mental, Sleep, Condition, Constitution, Astrology, BaZi</p>
            </div>
          </div>
        )}

         {content && (
           <div ref={printRef} className={`space-y-4 ${textAlign}`}>
             {/* Active asset tabs (animated) */}
             {!showBrief && !showFullReport && activeSections.length > 0 && (
               <div className="-mt-1">
                 <div className="flex gap-2 overflow-x-auto pb-2">
                   {(() => {
                     const priority: SectionKey[] = ['herbs', 'diagnosis', 'points', 'safety'];
                     const ordered = [
                       ...priority.filter(k => activeSections.includes(k)),
                       ...activeSections.filter(k => !priority.includes(k)),
                     ];

                     return ordered.map((key, idx) => {
                       const cfg = SECTION_CONFIG[key];
                       const itemCount = key === 'points' ? points.length : key === 'herbs' ? herbs.length : sections[key].length;
                       const active = expandedSection === key;

                       return (
                         <motion.button
                           key={key}
                           type="button"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: Math.min(0.2, idx * 0.02) }}
                           onClick={() => {
                             setExpandedSection(active ? null : key);
                             setAlphabetFilter(null);
                           }}
                           className={`shrink-0 rounded-full border px-3 py-1 text-xs flex items-center gap-2 ${cfg.borderColor} ${cfg.bgColor} hover:opacity-90 transition-all ${active ? 'ring-2 ring-primary/30' : ''}`}
                           title={`Open ${cfg.label}`}
                         >
                           <span className="text-sm leading-none">{cfg.emoji}</span>
                           <span className="whitespace-nowrap">{cfg.label}</span>
                           <Badge variant="secondary" className="h-5 text-[10px] px-1.5">{itemCount}</Badge>
                         </motion.button>
                       );
                     });
                   })()}
                 </div>
               </div>
             )}

            {/* Brief View */}
            {showBrief && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
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
              </div>
            )}

            {/* Full Report View */}
            {/* Full Report View */}
            {showFullReport && (
              <ScrollArea className="h-[500px] rounded-md border border-border/60 bg-background/40">
                <div className={`p-4 whitespace-pre-wrap text-sm leading-relaxed ${textAlign}`}>
                  {content}
                  {isLoading && (
                    <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1 align-text-bottom" />
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Asset Boxes Grid - Main View */}
            {!showBrief && !showFullReport && (
              <>
                {dataLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading clinical data from database...
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {activeSections.map(renderSectionBox)}
                </div>

                {activeSections.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Processing response...</p>
                    <p className="text-xs mt-1">Asset sections will appear here once detected</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
