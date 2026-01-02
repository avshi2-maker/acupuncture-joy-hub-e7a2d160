import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Heart, TrendingUp, TrendingDown, Minus, Timer, BarChart3, Save, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';

interface HRVReading {
  id: string;
  timestamp: Date;
  hrv: number; // RMSSD in ms
  heartRate: number;
  note?: string;
}

interface HRVTrackerProps {
  patientId?: string;
  compact?: boolean;
}

const HRV_ZONES = {
  low: { min: 0, max: 30, label: 'Low', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  moderate: { min: 30, max: 50, label: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  good: { min: 50, max: 80, label: 'Good', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  excellent: { min: 80, max: 200, label: 'Excellent', color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

const getHRVZone = (hrv: number) => {
  if (hrv < HRV_ZONES.low.max) return HRV_ZONES.low;
  if (hrv < HRV_ZONES.moderate.max) return HRV_ZONES.moderate;
  if (hrv < HRV_ZONES.good.max) return HRV_ZONES.good;
  return HRV_ZONES.excellent;
};

const getVagalToneInterpretation = (hrv: number) => {
  if (hrv < 20) return { level: 'Very Low', description: 'Significant sympathetic dominance. Consider stress reduction and vagal stimulation protocols.', recommendation: 'Deep breathing, cold exposure, and ear point stimulation recommended.' };
  if (hrv < 35) return { level: 'Low', description: 'Reduced parasympathetic activity. May indicate chronic stress or inflammation.', recommendation: 'Regular breathing exercises and PC6 (Neiguan) stimulation advised.' };
  if (hrv < 50) return { level: 'Moderate', description: 'Balanced autonomic function with room for improvement.', recommendation: 'Continue current practices, consider adding humming or gargling exercises.' };
  if (hrv < 70) return { level: 'Good', description: 'Healthy vagal tone indicating good stress resilience.', recommendation: 'Maintain current lifestyle practices.' };
  return { level: 'Excellent', description: 'Strong parasympathetic dominance. Excellent stress recovery capacity.', recommendation: 'Continue maintaining excellent health practices.' };
};

export const HRVTracker: React.FC<HRVTrackerProps> = ({ patientId, compact = false }) => {
  const [readings, setReadings] = useState<HRVReading[]>([]);
  const [currentHRV, setCurrentHRV] = useState<string>('');
  const [currentHR, setCurrentHR] = useState<string>('');
  const [note, setNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Load saved readings from localStorage
  useEffect(() => {
    const savedReadings = localStorage.getItem(`hrv-readings-${patientId || 'default'}`);
    if (savedReadings) {
      const parsed = JSON.parse(savedReadings).map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }));
      setReadings(parsed);
    }
  }, [patientId]);

  // Breathing exercise timer
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setBreathCount(prev => {
        const newCount = prev + 1;
        // 4-7-8 breathing pattern
        if (newCount <= 4) setBreathPhase('inhale');
        else if (newCount <= 11) setBreathPhase('hold');
        else if (newCount <= 19) setBreathPhase('exhale');
        else return 0;
        return newCount;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const saveReading = useCallback(() => {
    const hrvValue = parseFloat(currentHRV);
    const hrValue = parseFloat(currentHR);

    if (isNaN(hrvValue) || hrvValue <= 0) {
      toast.error('Please enter a valid HRV value');
      return;
    }

    const newReading: HRVReading = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      hrv: hrvValue,
      heartRate: isNaN(hrValue) ? 0 : hrValue,
      note: note || undefined,
    };

    const updatedReadings = [...readings, newReading].slice(-30); // Keep last 30 readings
    setReadings(updatedReadings);
    localStorage.setItem(`hrv-readings-${patientId || 'default'}`, JSON.stringify(updatedReadings));

    setCurrentHRV('');
    setCurrentHR('');
    setNote('');
    toast.success('HRV reading saved');
  }, [currentHRV, currentHR, note, readings, patientId]);

  const latestReading = readings[readings.length - 1];
  const avgHRV = readings.length > 0 
    ? Math.round(readings.reduce((sum, r) => sum + r.hrv, 0) / readings.length) 
    : 0;
  const trend = readings.length >= 2 
    ? readings[readings.length - 1].hrv - readings[readings.length - 2].hrv 
    : 0;

  const chartData = readings.slice(-14).map(r => ({
    date: r.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hrv: r.hrv,
    hr: r.heartRate,
  }));

  const interpretation = latestReading ? getVagalToneInterpretation(latestReading.hrv) : null;
  const zone = latestReading ? getHRVZone(latestReading.hrv) : null;

  if (compact) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-8 w-8 text-rose-600" />
            <div>
              <h3 className="font-semibold text-foreground">HRV Tracker</h3>
              <p className="text-xs text-muted-foreground">Heart Rate Variability</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-background/60 rounded">
              <p className="text-2xl font-bold text-rose-600">{avgHRV || '--'}</p>
              <p className="text-xs text-muted-foreground">Avg HRV (ms)</p>
            </div>
            <div className="p-2 bg-background/60 rounded">
              <p className="text-2xl font-bold text-foreground">{readings.length}</p>
              <p className="text-xs text-muted-foreground">Readings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-rose-600" />
          <div>
            <h2 className="text-xl font-bold text-foreground">HRV Tracker</h2>
            <p className="text-sm text-muted-foreground">Track Vagal Tone via Heart Rate Variability</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Hide' : 'History'}
        </Button>
      </div>

      {/* Current Status Card */}
      {latestReading && zone && interpretation && (
        <Card className={`${zone.bgColor} border-2`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className={`h-6 w-6 ${zone.color}`} />
                <span className="text-lg font-semibold">Latest Reading</span>
              </div>
              <Badge className={zone.bgColor}>
                {interpretation.level}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${zone.color}`}>{latestReading.hrv}</p>
                <p className="text-xs text-muted-foreground">HRV (ms)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{latestReading.heartRate || '--'}</p>
                <p className="text-xs text-muted-foreground">BPM</p>
              </div>
              <div className="text-center flex flex-col items-center">
                {trend > 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                ) : (
                  <Minus className="h-8 w-8 text-muted-foreground" />
                )}
                <p className="text-xs text-muted-foreground">Trend</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-foreground">{interpretation.description}</p>
              <p className="text-sm font-medium text-primary">{interpretation.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breathing Exercise Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            Breathing Exercise (4-7-8)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => setIsRecording(!isRecording)}
              variant={isRecording ? 'destructive' : 'default'}
            >
              {isRecording ? 'Stop' : 'Start'} Exercise
            </Button>
            {isRecording && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{breathPhase}</span>
                  <span className="text-sm text-muted-foreground">{breathCount}s</span>
                </div>
                <Progress 
                  value={
                    breathPhase === 'inhale' ? (breathCount / 4) * 100 :
                    breathPhase === 'hold' ? ((breathCount - 4) / 7) * 100 :
                    ((breathCount - 11) / 8) * 100
                  } 
                  className="h-3"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Inhale for 4s → Hold for 7s → Exhale for 8s. Repeat 3-4 cycles for optimal vagal stimulation.
          </p>
        </CardContent>
      </Card>

      {/* Input New Reading */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Log New Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="hrv">HRV (RMSSD in ms)</Label>
              <Input
                id="hrv"
                type="number"
                placeholder="e.g., 45"
                value={currentHRV}
                onChange={e => setCurrentHRV(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hr">Heart Rate (BPM)</Label>
              <Input
                id="hr"
                type="number"
                placeholder="e.g., 65"
                value={currentHR}
                onChange={e => setCurrentHR(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g., After morning breathing exercise"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <Button onClick={saveReading} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Save Reading
          </Button>
        </CardContent>
      </Card>

      {/* HRV Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">HRV Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hrv" 
                    stroke="#f43f5e" 
                    fill="url(#hrvGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Average: </span>
                <span className="font-semibold">{avgHRV} ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Readings: </span>
                <span className="font-semibold">{readings.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {showHistory && readings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reading History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...readings].reverse().map(r => {
                const rZone = getHRVZone(r.hrv);
                return (
                  <div key={r.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <Heart className={`h-4 w-4 ${rZone.color}`} />
                      <div>
                        <span className="font-medium">{r.hrv} ms</span>
                        {r.heartRate > 0 && <span className="text-muted-foreground ml-2">({r.heartRate} BPM)</span>}
                        {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.timestamp.toLocaleDateString()} {r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HRV Interpretation Guide */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">HRV Interpretation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>&lt;30ms: Low vagal tone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>30-50ms: Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>50-80ms: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>&gt;80ms: Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
