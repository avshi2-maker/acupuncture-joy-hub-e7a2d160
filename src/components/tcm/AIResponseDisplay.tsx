import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Leaf,
  MapPin,
  Apple,
  User,
  FileText,
  Loader2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Pill
} from 'lucide-react';
import { parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';

interface AIResponseDisplayProps {
  isLoading: boolean;
  content: string;
  query: string;
  onViewBodyMap: (points: string[]) => void;
  loadingStartTime?: number;
}

// Parse herbs from AI response
function parseHerbs(text: string): string[] {
  const herbPatterns = [
    /(?:herbs?|formula|prescription)[\s:]*([^.]+)/gi,
    /(?:Huang Qi|Ren Shen|Bai Zhu|Fu Ling|Dang Gui|Shu Di Huang|Bai Shao|Chuan Xiong|Chai Hu|Sheng Jiang|Da Zao|Gan Cao|Ban Xia|Chen Pi|Zhi Shi|Hou Po|Wu Wei Zi|Mai Men Dong|Shi Hu|Gou Qi Zi|Tu Si Zi|Du Zhong|Xu Duan|Ba Ji Tian|Yin Yang Huo|Sha Ren|Bai Dou Kou|Cao Dou Kou|Mu Xiang|Xiang Fu|Qing Pi|Zhi Ke|Yu Jin|Jiang Huang|E Zhu|San Leng|Tao Ren|Hong Hua|Dan Shen|Chi Shao|Niu Xi|Wang Bu Liu Xing|Chuan Shan Jia|Ma Huang|Gui Zhi|Fang Feng|Jing Jie|Qiang Huo|Du Huo|Xi Xin|Cang Er Zi|Xin Yi Hua|Ge Gen|Sheng Ma|Bo He|Sang Ye|Ju Hua|Chan Tui|Mu Zei|Man Jing Zi|Shi Gao|Zhi Mu|Tian Hua Fen|Lu Gen|Zhu Ye|Dan Zhu Ye|Huang Qin|Huang Lian|Huang Bai|Long Dan Cao|Ku Shen|Qin Pi|Bai Xian Pi|Jin Yin Hua|Lian Qiao|Ban Lan Gen|Da Qing Ye|Pu Gong Ying|Zi Hua Di Ding|Yu Xing Cao|Bai Hua She She Cao|Chuan Xin Lian|Tu Fu Ling|Sheng Di Huang|Xuan Shen|Mu Dan Pi|Di Gu Pi|Bai Wei|Yin Chai Hu|Hu Huang Lian|Qing Hao|Di Gu Pi|Da Huang|Mang Xiao|Fan Xie Ye|Huo Ma Ren|Yu Li Ren|Du Huang|Rou Gui|Fu Zi|Gan Jiang|Wu Zhu Yu|Ding Xiang|Xiao Hui Xiang|Gao Liang Jiang|Hua Jiao|Hu Jiao|Bi Ba)/gi
  ];
  
  const herbs: string[] = [];
  herbPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => {
        const cleaned = m.replace(/herbs?|formula|prescription|:/gi, '').trim();
        if (cleaned.length > 2 && cleaned.length < 50) {
          herbs.push(cleaned);
        }
      });
    }
  });
  
  return [...new Set(herbs)].slice(0, 10);
}

// Parse nutrition advice from AI response
function parseNutrition(text: string): string[] {
  const nutritionPatterns = [
    /(?:eat|food|diet|nutrition|avoid eating|include|consume)[\s:]*([^.]+)/gi,
    /(?:warm foods?|cold foods?|cooling foods?|warming foods?|spicy foods?|greasy foods?|raw foods?)/gi
  ];
  
  const nutrition: string[] = [];
  nutritionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => {
        const cleaned = m.trim();
        if (cleaned.length > 5 && cleaned.length < 100) {
          nutrition.push(cleaned);
        }
      });
    }
  });
  
  return [...new Set(nutrition)].slice(0, 8);
}

// Parse lifestyle advice
function parseLifestyle(text: string): string[] {
  const patterns = [
    /(?:lifestyle|exercise|rest|sleep|stress|relax|meditation|avoid|reduce|increase)[\s:]*([^.]+)/gi
  ];
  
  const advice: string[] = [];
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => {
        const cleaned = m.trim();
        if (cleaned.length > 10 && cleaned.length < 150) {
          advice.push(cleaned);
        }
      });
    }
  });
  
  return [...new Set(advice)].slice(0, 6);
}

export function AIResponseDisplay({ 
  isLoading, 
  content, 
  query, 
  onViewBodyMap,
  loadingStartTime 
}: AIResponseDisplayProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for loading state
  useEffect(() => {
    if (isLoading && loadingStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - loadingStartTime) / 1000));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, loadingStartTime]);

  // Parse content for assets
  const points = parsePointReferences(content);
  const herbs = parseHerbs(content);
  const nutrition = parseNutrition(content);
  const lifestyle = parseLifestyle(content);

  // Asset buttons config
  const assetButtons = [
    { id: 'report', icon: FileText, label: 'Full Report', count: content.length > 0 ? 1 : 0, color: 'bg-primary' },
    { id: 'points', icon: MapPin, label: 'Acupoints', count: points.length, color: 'bg-red-500' },
    { id: 'herbs', icon: Leaf, label: 'Herbs', count: herbs.length, color: 'bg-jade' },
    { id: 'nutrition', icon: Apple, label: 'Nutrition', count: nutrition.length, color: 'bg-orange-500' },
    { id: 'lifestyle', icon: Activity, label: 'Lifestyle', count: lifestyle.length, color: 'bg-blue-500' },
    { id: 'bodymap', icon: User, label: 'Body Map', count: points.length > 0 ? 1 : 0, color: 'bg-purple-500' },
  ];

  if (!isLoading && !content) {
    return null;
  }

  return (
    <Card className="border-jade/30 bg-gradient-to-br from-card to-jade-light/5 shadow-lg animate-fade-in">
      {/* Query Header */}
      <CardHeader className="py-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-jade" />
            <span className="text-sm font-medium truncate max-w-[300px]">{query}</span>
          </div>
          {isLoading && (
            <Badge variant="outline" className="bg-jade/10 border-jade/30 text-jade animate-pulse gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <Clock className="h-3 w-3" />
              <span className="font-mono">{elapsedTime}s</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Loading Animation */}
        {isLoading && !content && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-jade/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-jade animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-jade">AI is analyzing your query...</p>
              <p className="text-xs text-muted-foreground">
                Searching herbs, acupoints, nutrition & more
              </p>
            </div>
            <div className="flex gap-2">
              {['Herbs', 'Points', 'Nutrition', 'Diagnosis'].map((item, i) => (
                <Badge 
                  key={item} 
                  variant="outline" 
                  className="animate-pulse text-xs"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Asset Navigation Buttons */}
        {content && (
          <div className="flex flex-wrap gap-2">
            {assetButtons.map((asset) => (
              <Button
                key={asset.id}
                variant={activeSection === asset.id ? 'default' : 'outline'}
                size="sm"
                className={`gap-1.5 text-xs transition-all ${
                  activeSection === asset.id 
                    ? `${asset.color} text-white hover:opacity-90` 
                    : asset.count > 0 
                      ? 'border-jade/30 hover:bg-jade/10' 
                      : 'opacity-50'
                }`}
                onClick={() => {
                  if (asset.id === 'bodymap' && points.length > 0) {
                    onViewBodyMap(points);
                  } else {
                    setActiveSection(activeSection === asset.id ? null : asset.id);
                  }
                }}
                disabled={asset.count === 0}
              >
                <asset.icon className="h-3 w-3" />
                {asset.label}
                {asset.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`h-4 min-w-4 text-[10px] px-1 ${
                      activeSection === asset.id ? 'bg-white/20 text-white' : ''
                    }`}
                  >
                    {asset.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Section Content */}
        {content && activeSection && (
          <Card className="bg-muted/30 border-border/50 animate-scale-in">
            <CardContent className="p-4">
              {activeSection === 'report' && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ScrollArea className="max-h-[400px]">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {content}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {activeSection === 'points' && points.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Recommended Acupuncture Points</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {points.map(point => (
                      <Badge 
                        key={point} 
                        className="bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20 cursor-pointer"
                        onClick={() => onViewBodyMap([point])}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {point}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600 mt-2"
                    onClick={() => onViewBodyMap(points)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View All on Body Map
                  </Button>
                </div>
              )}

              {activeSection === 'herbs' && herbs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-jade" />
                    <span className="font-medium">Herbal Recommendations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {herbs.map((herb, i) => (
                      <Badge key={i} className="bg-jade/10 text-jade border-jade/30">
                        <Leaf className="h-3 w-3 mr-1" />
                        {herb}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'nutrition' && nutrition.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Apple className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Nutrition & Diet</span>
                  </div>
                  <ul className="space-y-2">
                    {nutrition.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Apple className="h-3 w-3 mt-1 text-orange-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSection === 'lifestyle' && lifestyle.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Lifestyle Advice</span>
                  </div>
                  <ul className="space-y-2">
                    {lifestyle.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Activity className="h-3 w-3 mt-1 text-blue-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Streaming Content Preview */}
        {isLoading && content && (
          <div className="relative">
            <ScrollArea className="max-h-[200px]">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {content}
                <span className="inline-block w-2 h-4 bg-jade animate-pulse ml-1" />
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
