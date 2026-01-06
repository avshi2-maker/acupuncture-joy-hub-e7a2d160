import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingDown, Activity } from 'lucide-react';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ProgressDataPoint {
  date: string;
  distressLevel: number;
  complaint: string;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  language?: 'en' | 'he';
}

const chartConfig: ChartConfig = {
  distressLevel: {
    label: 'Distress Level',
    color: 'hsl(var(--jade))',
  },
};

export function ProgressChart({ data, language = 'en' }: ProgressChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter(d => d.distressLevel !== undefined && d.distressLevel !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        ...d,
        formattedDate: format(new Date(d.date), 'MMM d'),
        fullDate: format(new Date(d.date), 'PPP'),
      }));
  }, [data]);

  const improvement = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].distressLevel;
    const last = chartData[chartData.length - 1].distressLevel;
    const diff = first - last;
    return {
      value: Math.abs(diff),
      improved: diff > 0,
      percentage: Math.round((Math.abs(diff) / first) * 100),
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{language === 'he' ? 'אין נתוני התקדמות עדיין' : 'No progress data yet'}</p>
          <p className="text-sm mt-1">
            {language === 'he' 
              ? 'הוסף רמת מצוקה בעת שמירת פרוטוקול'
              : 'Add a distress level when saving a protocol'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-jade" />
              {language === 'he' ? 'מעקב התקדמות' : 'Progress Tracker'}
            </CardTitle>
            <CardDescription>
              {language === 'he' ? 'רמת מצוקה סובייקטיבית לאורך זמן' : 'Subjective distress level over time'}
            </CardDescription>
          </div>
          {improvement && (
            <div className={`text-right ${improvement.improved ? 'text-green-600' : 'text-orange-600'}`}>
              <div className="flex items-center gap-1">
                {improvement.improved && <TrendingDown className="h-4 w-4" />}
                <span className="text-2xl font-bold">
                  {improvement.improved ? '-' : '+'}{improvement.value}
                </span>
              </div>
              <p className="text-xs">
                {improvement.improved 
                  ? (language === 'he' ? 'שיפור' : 'improvement')
                  : (language === 'he' ? 'עלייה' : 'increase')}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="font-medium">{data.fullDate}</p>
                      <p className="text-sm text-muted-foreground">{data.complaint}</p>
                      <p className="text-lg font-bold text-jade">
                        {language === 'he' ? 'רמה:' : 'Level:'} {data.distressLevel}/10
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={5} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="distressLevel"
              stroke="hsl(var(--jade))"
              strokeWidth={3}
              dot={{ 
                fill: 'hsl(var(--jade))', 
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{ 
                r: 7, 
                fill: 'hsl(var(--jade))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="text-green-600">0-3</span>
            <span>{language === 'he' ? 'נמוך' : 'Low'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-600">4-6</span>
            <span>{language === 'he' ? 'בינוני' : 'Moderate'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-600">7-10</span>
            <span>{language === 'he' ? 'גבוה' : 'High'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
