import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Compass, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Sparkles,
  Droplets,
  Flame,
  TreeDeciduous,
  Mountain,
  Wind,
  MapPin
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

export default function BaziCalculator() {
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState('');
  const [birthHour, setBirthHour] = useState('12');
  const [birthMinute, setBirthMinute] = useState('0');
  const [result, setResult] = useState<ReturnType<typeof calculateBaZi> | null>(null);
  const [strengths, setStrengths] = useState<Record<string, number> | null>(null);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getAcupunctureRecommendations> | null>(null);

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
            <span className="ml-1">{stem.element} {stem.polarity}</span>
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
            <span className="ml-1">{branch.element}</span>
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">{branch.meridian}</div>
        </div>
        
        {/* Hidden Stems */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Hidden Stems</div>
          <div className="flex justify-center gap-1 flex-wrap">
            {branch.hiddenStems.map((hs, i) => {
              const stem = heavenlyStems.find(s => s.chinese === hs);
              return stem ? (
                <Badge key={i} variant="outline" className={`text-xs ${elementColors[stem.element]}`}>
                  {hs} {stem.pinyin}
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
        <title>BaZi Calculator | Four Pillars of Destiny</title>
        <meta name="description" content="Calculate your BaZi (Four Pillars of Destiny) chart with acupuncture point recommendations based on Chinese metaphysics." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container flex items-center gap-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-display font-semibold">BaZi Calculator</h1>
            </div>
          </div>
        </header>

        <main className="container py-8 space-y-8">
          {/* Input Section */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Birth Information
              </CardTitle>
              <CardDescription>Enter the birth date and time to calculate the Four Pillars</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthHour">Hour (0-23)</Label>
                  <Input
                    id="birthHour"
                    type="number"
                    min="0"
                    max="23"
                    value={birthHour}
                    onChange={(e) => setBirthHour(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthMinute">Minute</Label>
                  <Input
                    id="birthMinute"
                    type="number"
                    min="0"
                    max="59"
                    value={birthMinute}
                    onChange={(e) => setBirthMinute(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCalculate} 
                className="mt-6 w-full md:w-auto"
                disabled={!birthDate}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Calculate BaZi Chart
              </Button>
            </CardContent>
          </Card>

          {result && (
            <>
              {/* Four Pillars */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Four Pillars (四柱)
                </h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <PillarCard title="Hour Pillar (时柱)" stem={result.hour.stem} branch={result.hour.branch} />
                  <PillarCard title="Day Pillar (日柱)" stem={result.day.stem} branch={result.day.branch} />
                  <PillarCard title="Month Pillar (月柱)" stem={result.month.stem} branch={result.month.branch} />
                  <PillarCard title="Year Pillar (年柱)" stem={result.year.stem} branch={result.year.branch} />
                </div>
              </div>

              {/* Element Strengths */}
              {strengths && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Five Element Analysis
                    </CardTitle>
                    <CardDescription>
                      Day Master: {result.day.stem.chinese} {result.day.stem.pinyin} ({result.day.stem.english})
                      {recommendations && (
                        <Badge className="ml-2" variant="outline">
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
                            {element}
                            {element === result.day.stem.element && (
                              <Badge variant="outline" className="text-xs">Day Master</Badge>
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
                      Acupuncture Recommendations
                    </CardTitle>
                    <CardDescription>Points based on BaZi analysis and Zi Wu Liu Zhu timing</CardDescription>
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
