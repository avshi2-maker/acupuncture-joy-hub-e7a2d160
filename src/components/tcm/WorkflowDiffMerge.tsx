import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Check, 
  X, 
  Merge, 
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';

interface WorkflowDiffMergeProps {
  currentText: string;
  previousText: string;
  sectionName: string;
  onMergeComplete: (mergedText: string) => void;
  onCancel: () => void;
}

// Split text into sentences
const splitIntoSentences = (text: string): string[] => {
  if (!text) return [];
  // Split by sentence endings, keeping the punctuation
  return text
    .split(/(?<=[.!?。！？])\s+|(?<=\n)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

// Compute word-level diff between two strings
const computeWordDiff = (oldText: string, newText: string): { type: 'same' | 'added' | 'removed'; text: string }[] => {
  const oldWords = oldText.split(/\s+/).filter(w => w);
  const newWords = newText.split(/\s+/).filter(w => w);
  
  const result: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
  
  // Simple LCS-based diff
  const lcs = (a: string[], b: string[]): string[] => {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    const common: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        common.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return common;
  };
  
  const common = lcs(oldWords, newWords);
  let oldIdx = 0, newIdx = 0, commonIdx = 0;
  
  while (oldIdx < oldWords.length || newIdx < newWords.length) {
    if (commonIdx < common.length) {
      // Add removed words (in old but not in common at this position)
      while (oldIdx < oldWords.length && oldWords[oldIdx] !== common[commonIdx]) {
        result.push({ type: 'removed', text: oldWords[oldIdx] });
        oldIdx++;
      }
      // Add added words (in new but not in common at this position)
      while (newIdx < newWords.length && newWords[newIdx] !== common[commonIdx]) {
        result.push({ type: 'added', text: newWords[newIdx] });
        newIdx++;
      }
      // Add common word
      if (oldIdx < oldWords.length && newIdx < newWords.length) {
        result.push({ type: 'same', text: common[commonIdx] });
        oldIdx++;
        newIdx++;
        commonIdx++;
      }
    } else {
      // Handle remaining words
      while (oldIdx < oldWords.length) {
        result.push({ type: 'removed', text: oldWords[oldIdx] });
        oldIdx++;
      }
      while (newIdx < newWords.length) {
        result.push({ type: 'added', text: newWords[newIdx] });
        newIdx++;
      }
    }
  }
  
  return result;
};

// Word diff display component
export function WordDiffDisplay({ 
  currentText, 
  previousText,
  showDiff = true 
}: { 
  currentText: string; 
  previousText: string;
  showDiff?: boolean;
}) {
  const diff = useMemo(() => {
    if (!showDiff || !previousText) return null;
    return computeWordDiff(previousText, currentText);
  }, [currentText, previousText, showDiff]);

  if (!showDiff || !diff) {
    return <span>{currentText}</span>;
  }

  return (
    <span className="leading-relaxed">
      {diff.map((part, idx) => {
        if (part.type === 'same') {
          return <span key={idx}>{part.text} </span>;
        }
        if (part.type === 'added') {
          return (
            <span 
              key={idx} 
              className="bg-green-500/20 text-green-700 dark:text-green-400 px-0.5 rounded"
            >
              {part.text}{' '}
            </span>
          );
        }
        if (part.type === 'removed') {
          return (
            <span 
              key={idx} 
              className="bg-red-500/20 text-red-600 dark:text-red-400 line-through px-0.5 rounded opacity-60"
            >
              {part.text}{' '}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
}

// Sentence merge component
export function SentenceMergeMode({
  currentText,
  previousText,
  sectionName,
  onMergeComplete,
  onCancel,
}: WorkflowDiffMergeProps) {
  const currentSentences = useMemo(() => splitIntoSentences(currentText), [currentText]);
  const previousSentences = useMemo(() => splitIntoSentences(previousText), [previousText]);
  
  const [selectedCurrent, setSelectedCurrent] = useState<Set<number>>(
    new Set(currentSentences.map((_, i) => i))
  );
  const [selectedPrevious, setSelectedPrevious] = useState<Set<number>>(new Set());

  const toggleCurrent = (idx: number) => {
    const newSet = new Set(selectedCurrent);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedCurrent(newSet);
  };

  const togglePrevious = (idx: number) => {
    const newSet = new Set(selectedPrevious);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedPrevious(newSet);
  };

  const mergedText = useMemo(() => {
    const currentSelected = currentSentences.filter((_, i) => selectedCurrent.has(i));
    const previousSelected = previousSentences.filter((_, i) => selectedPrevious.has(i));
    return [...currentSelected, ...previousSelected].join(' ');
  }, [currentSentences, previousSentences, selectedCurrent, selectedPrevious]);

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Merge className="h-4 w-4 text-primary" />
            Merge {sectionName}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px]">
              {selectedCurrent.size + selectedPrevious.size} selected
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          {/* Current sentences */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-jade flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Current ({selectedCurrent.size}/{currentSentences.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCurrent(new Set(currentSentences.map((_, i) => i)))}
                className="h-5 text-[10px] px-1.5"
              >
                Select All
              </Button>
            </div>
            <ScrollArea className="h-32 border rounded-lg p-2 bg-green-500/5">
              {currentSentences.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No content</p>
              ) : (
                <div className="space-y-1.5">
                  {currentSentences.map((sentence, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                        selectedCurrent.has(idx) 
                          ? 'bg-green-500/20 border border-green-500/40' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedCurrent.has(idx)}
                        onCheckedChange={() => toggleCurrent(idx)}
                        className="mt-0.5"
                      />
                      <span className="flex-1">{sentence}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Previous sentences */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <Minus className="h-3 w-3" />
                Previous ({selectedPrevious.size}/{previousSentences.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPrevious(new Set(previousSentences.map((_, i) => i)))}
                className="h-5 text-[10px] px-1.5"
              >
                Select All
              </Button>
            </div>
            <ScrollArea className="h-32 border rounded-lg p-2 bg-muted/20">
              {previousSentences.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No content</p>
              ) : (
                <div className="space-y-1.5">
                  {previousSentences.map((sentence, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                        selectedPrevious.has(idx) 
                          ? 'bg-primary/20 border border-primary/40' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedPrevious.has(idx)}
                        onCheckedChange={() => togglePrevious(idx)}
                        className="mt-0.5"
                      />
                      <span className="flex-1">{sentence}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Preview:</span>
          <div className="p-2 rounded border bg-background text-xs min-h-[40px] max-h-24 overflow-y-auto">
            {mergedText || <span className="text-muted-foreground italic">Select sentences to merge...</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1">
            <X className="h-3 w-3" />
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={() => onMergeComplete(mergedText)}
            disabled={!mergedText}
            className="gap-1"
          >
            <Check className="h-3 w-3" />
            Apply Merge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
