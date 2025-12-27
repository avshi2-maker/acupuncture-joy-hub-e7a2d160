import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTier } from '@/hooks/useTier';
import { 
  Compass, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Droplets,
  Flame,
  TreeDeciduous,
  Mountain,
  Wind,
  MapPin,
  LogOut,
  Lock
} from 'lucide-react';
import {
  calculateBaZi,
  calculateElementStrengths,
  getAcupunctureRecommendations,
  heavenlyStems,
  earthlyBranches,
} from '@/data/bazi-data';

const elementIcons: Record<string, React.ReactNode> = {
  Wood: <TreeDeciduous className="h-4 w-4" />,
  Fire: <Flame className="h-4 w-4" />,
  Earth: <Mountain className="h-4 w-4" />,
  Metal: <Wind className="h-4 w-4" />,
  Water: <Droplets className="h-4 w-4" />,
};

const elementColors: Record<string, string> = {
  Wood: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Fire: 'bg-red-500/20 text-red-400 border-red-500/30',
  Earth: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Metal: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  Water: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const chineseHours = [
  { value: '0', emoji: '🐀', key: 'ratHour' },
  { value: '2', emoji: '🐂', key: 'oxHour' },
  { value: '4', emoji: '🐅', key: 'tigerHour' },
  { value: '6', emoji: '🐇', key: 'rabbitHour' },
  { value: '8', emoji: '🐉', key: 'dragonHour' },
  { value: '10', emoji: '🐍', key: 'snakeHour' },
  { value: '12', emoji: '🐴', key: 'horseHour' },
  { value: '14', emoji: '🐐', key: 'goatHour' },
  { value: '16', emoji: '🐵', key: 'monkeyHour' },
  { value: '18', emoji: '🐓', key: 'roosterHour' },
  { value: '20', emoji: '🐕', key: 'dogHour' },
  { value: '22', emoji: '🐖', key: 'pigHour' },
];

// Sample demo data for preview mode
const getSampleBaziResult = () => {
  const sampleDate = new Date(1990, 0, 15);
  return calculateBaZi(sampleDate, 12, 0);
};

export default function BaziCalculator() {
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const { tier } = useTier();
  const [birthDate, setBirthDate] = useState('');
  const [birthHour, setBirthHour] = useState('12');
  const [birthMinute, setBirthMinute] = useState('0');
  const [result, setResult] = useState<ReturnType<typeof calculateBaZi> | null>(null);
  const [strengths, setStrengths] = useState<Record<string, number> | null>(null);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getAcupunctureRecommendations> | null>(null);

  const isRTL = dir === 'rtl';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const isPreviewMode = !tier;

  // Show sample result in preview mode
  useEffect(() => {
    if (isPreviewMode) {
      const sampleResult = getSampleBaziResult();
      const sampleStrengths = calculateElementStrengths(sampleResult);
      const sampleRecs = getAcupunctureRecommendations(sampleResult, sampleStrengths);
      setResult(sampleResult);
      setStrengths(sampleStrengths);
      setRecommendations(sampleRecs);
    }
  }, [isPreviewMode]);

  const translateElement = (element: string): string => {
    const elementMap: Record<string, string> = {
      Wood: t('wood'),
      Fire: t('fire'),
      Earth: t('earth'),
      Metal: t('metal'),
      Water: t('water'),
    };
    return elementMap[element] || element;
  };

  const handleCalculate = () => {
    if (!birthDate) return;
    
    const date = new Date(birthDate);
    const hour = parseInt(birthHour);
    const minute = parseInt(birthMinute);
    
    const bazi = calculateBaZi(date, hour, minute);
    const elementStrengths = calculateElementStrengths(bazi);
    const recs = getAcupunctureRecommendations(bazi, elementStrengths);
    
    setResult(bazi);
    setStrengths(elementStrengths);
    setRecommendations(recs);
  };

  const PillarCard = ({ 
    title, 
    stem, 
    branch 
  }: { 
    title: string; 
    stem: typeof heavenlyStems[0]; 
    branch: typeof earthlyBranches[0];
  }) => (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Heavenly Stem */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{stem.chinese}</div>
          <div className="text-xs text-muted-foreground">{stem.pinyin}</div>
          <Badge className={`mt-1 ${elementColors[stem.element]}`}>
            {elementIcons[stem.element]}
            <span className="mx-1">{translateElement(stem.element)} {stem.polarity}</span>
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">{stem.meridian}</div>
        </div>
        
        <Separator className="bg-border/50" />
        
        {/* Earthly Branch */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{branch.chinese}</div>
          <div className="text-xs text-muted-foreground">{branch.pinyin} ({branch.english})</div>
          <Badge className={`mt-1 ${elementColors[branch.element]}`}>
            {elementIcons[branch.element]}
            <span className="mx-1">{translateElement(branch.element)}</span>
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">{branch.meridian}</div>
        </div>
        
        {/* Hidden Stems */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">{t('hiddenStems')}</div>
          <div className="flex justify-center gap-1 flex-wrap">
            {branch.hiddenStems.map((hs, i) => {
              const foundStem = heavenlyStems.find(s => s.chinese === hs);
              return foundStem ? (
                <Badge key={i} variant="outline" className={`text-xs ${elementColors[foundStem.element]}`}>
                  {hs} {foundStem.pinyin}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const maxStrength = strengths ? Math.max(...Object.values(strengths)) : 100;

  return (
    <>
      <Helmet>
        <title>{t('baziCalculator')} | {t('fourPillarsOfDestiny')}</title>
        <meta name="description" content={t('baziDescription')} />
        <html lang={language} dir={dir} />
      </Helmet>
      
      <div className="min-h-screen bg-background" dir={dir}>
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(tier ? '/dashboard' : '/')} className="gap-2">
                <BackArrow className="h-4 w-4" />
                <span className="hidden sm:inline">{tier ? t('backToDashboard') : t('home') || 'Home'}</span>
              </Button>
              <div className="flex items-center gap-2">
                <Compass className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-display font-semibold">{t('baziCalculator')}</h1>
                {isPreviewMode && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Preview
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {tier && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => window.location.href = '/'}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('endSession')}</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Preview Mode Overlay */}
        {isPreviewMode && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-auto">
              <Card className="max-w-2xl mx-auto bg-card/95 backdrop-blur-lg border-primary/30 shadow-2xl">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-semibold mb-2">
                      🔮 {t('baziCalculator')}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      לצפייה במחשבון בא-זי יש להירשם כמטפל
                    </p>
                    <p className="text-muted-foreground text-sm">
                      To use the full BaZi Calculator, please register as a therapist
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button size="lg" onClick={() => navigate('/gate')}>
                      הרשמה / Register
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/')}>
                      חזרה לדף הבית / Back Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <main className={`container py-8 space-y-8 ${isPreviewMode ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {/* Input Section */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('birthInformation')}
              </CardTitle>
              <CardDescription>{t('enterBirthDetails')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">{t('birthDate')}</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('birthHour')}</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {chineseHours.map((hour) => (
                      <button
                        key={hour.value}
                        type="button"
                        onClick={() => setBirthHour(hour.value)}
                        className={`p-2 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                          birthHour === hour.value 
                            ? 'border-primary bg-primary/20 text-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl">{hour.emoji}</div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {hour.value}:00
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleCalculate} 
                className="mt-6 w-full md:w-auto"
                disabled={!birthDate}
              >
                <Sparkles className="h-4 w-4 mx-2" />
                {t('calculateBaziChart')}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <>
              {/* Four Pillars */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t('fourPillars')} (四柱)
                </h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <PillarCard title={`${t('hourPillar')} (时柱)`} stem={result.hour.stem} branch={result.hour.branch} />
                  <PillarCard title={`${t('dayPillar')} (日柱)`} stem={result.day.stem} branch={result.day.branch} />
                  <PillarCard title={`${t('monthPillar')} (月柱)`} stem={result.month.stem} branch={result.month.branch} />
                  <PillarCard title={`${t('yearPillar')} (年柱)`} stem={result.year.stem} branch={result.year.branch} />
                </div>
              </div>

              {/* Element Strengths */}
              {strengths && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {t('fiveElementAnalysis')}
                    </CardTitle>
                    <CardDescription>
                      {t('dayMaster')}: {result.day.stem.chinese} {result.day.stem.pinyin} ({result.day.stem.english})
                      {recommendations && (
                        <Badge className="mx-2" variant="outline">
                          {recommendations.balance.status}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(strengths).map(([element, strength]) => (
                      <div key={element} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {elementIcons[element]}
                            {translateElement(element)}
                            {element === result.day.stem.element && (
                              <Badge variant="outline" className="text-xs">{t('dayMaster')}</Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground">{strength.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              element === 'Wood' ? 'bg-emerald-500' :
                              element === 'Fire' ? 'bg-red-500' :
                              element === 'Earth' ? 'bg-amber-500' :
                              element === 'Metal' ? 'bg-slate-400' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${(strength / maxStrength) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {recommendations && (
                      <p className="text-sm text-muted-foreground mt-4">
                        {recommendations.balance.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Acupuncture Recommendations */}
              {recommendations && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t('acupunctureRecommendations')}
                    </CardTitle>
                    <CardDescription>{t('pointsBasedOnBazi')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {recommendations.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <MapPin className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium">{rec.point}</div>
                              <div className="text-sm text-muted-foreground">{rec.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}