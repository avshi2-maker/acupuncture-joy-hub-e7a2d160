import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Sparkles, 
  Loader2, 
  ClipboardList,
  Stethoscope,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface BianZhengAnalysisProps {
  patientAnswers?: Record<string, string>;
  onClose?: () => void;
}

export function BianZhengAnalysis({ patientAnswers = {}, onClose }: BianZhengAnalysisProps) {
  const [tongueFindings, setTongueFindings] = useState('');
  const [pulseFindings, setPulseFindings] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const streamAnalysis = useCallback(async () => {
    if (Object.keys(patientAnswers).length === 0 && !tongueFindings && !pulseFindings) {
      toast({
        title: "נדרש מידע",
        description: "אנא מלא לפחות ממצאי לשון/דופק או תשובות לשאלון",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bian-zheng-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            patientAnswers,
            tongueFindings,
            pulseFindings,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "הגבלת קצב",
            description: "יותר מדי בקשות. אנא נסה שוב מאוחר יותר.",
            variant: "destructive"
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "נדרש תשלום",
            description: "אנא הוסף קרדיטים לחשבונך.",
            variant: "destructive"
          });
          return;
        }
        throw new Error('Failed to start analysis');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIdx;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAnalysisResult(fullText);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בניתוח. אנא נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [patientAnswers, tongueFindings, pulseFindings]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">ניתוח ביאן ג'ן (辨証)</CardTitle>
              <p className="text-sm text-muted-foreground">אבחון תבניות TCM מתקדם</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-teal-500" />
              ממצאי לשון
            </label>
            <Textarea
              placeholder="לדוגמה: לשון חיוורת, תפוחה עם סימני שיניים, חיפוי לבן ודק..."
              value={tongueFindings}
              onChange={(e) => setTongueFindings(e.target.value)}
              className="min-h-[80px] resize-none"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-rose-500" />
              ממצאי דופק
            </label>
            <Textarea
              placeholder="לדוגמה: דופק חלש ועמוק, במיוחד בעמדת צ'י..."
              value={pulseFindings}
              onChange={(e) => setPulseFindings(e.target.value)}
              className="min-h-[80px] resize-none"
              dir="rtl"
            />
          </div>
        </div>

        {/* Patient Answers Summary */}
        {Object.keys(patientAnswers).length > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                תשובות מהשאלון: {Object.keys(patientAnswers).length} שאלות
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              הנתונים מהשאלון יישלחו לניתוח יחד עם ממצאי הלשון והדופק
            </p>
          </div>
        )}

        {/* Analyze Button */}
        <Button 
          onClick={streamAnalysis} 
          disabled={isAnalyzing}
          className="w-full gap-2"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              מנתח תבניות...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              בצע אבחון ביאן ג'ן
            </>
          )}
        </Button>

        {/* Results Section */}
        {analysisResult && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                תוצאות הניתוח
              </h4>
              <ScrollArea className="h-[400px] rounded-lg border bg-background p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none" dir="rtl">
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
