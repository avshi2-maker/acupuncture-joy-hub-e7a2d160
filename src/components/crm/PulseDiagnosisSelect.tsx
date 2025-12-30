import { useState } from 'react';
import { Check, ChevronsUpDown, Heart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { pulseDiagnosisData, type PulseFinding } from '@/data/pulse-diagnosis-data';

interface PulseDiagnosisSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export function PulseDiagnosisSelect({ 
  value, 
  onChange, 
  maxSelections = 5 
}: PulseDiagnosisSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleSelection = (finding: string) => {
    if (value.includes(finding)) {
      onChange(value.filter(v => v !== finding));
    } else if (value.length < maxSelections) {
      onChange([...value, finding]);
    }
  };

  const removeSelection = (finding: string) => {
    onChange(value.filter(v => v !== finding));
  };

  // Find full data for selected items
  const getSelectedData = (findingName: string): PulseFinding | undefined => {
    for (const category of pulseDiagnosisData) {
      const found = category.findings.find(f => f.finding === findingName);
      if (found) return found;
    }
    return undefined;
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px] h-auto"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4" />
              {value.length > 0 
                ? `${value.length} pulse finding${value.length > 1 ? 's' : ''} selected`
                : 'Select pulse findings...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 z-50" align="start">
          <Command>
            <CommandInput placeholder="Search pulse findings..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No pulse finding found.</CommandEmpty>
              {pulseDiagnosisData.map((category) => (
                <CommandGroup key={category.category} heading={category.category}>
                  {category.findings.map((finding) => (
                    <CommandItem
                      key={finding.finding}
                      value={`${finding.finding} ${finding.chineseName}`}
                      onSelect={() => toggleSelection(finding.finding)}
                      className="flex items-start gap-2 py-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          value.includes(finding.finding) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {finding.finding}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 cursor-help text-muted-foreground hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title={[
                              `Description: ${finding.description}`,
                              `TCM Pattern: ${finding.tcmPattern}`,
                              `Clinical Significance: ${finding.clinicalSignificance}`,
                              `Treatment: ${finding.treatmentPrinciple}`,
                            ].join('\n')}
                            aria-label={`Pulse finding info: ${finding.finding}`}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {finding.chineseName}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((finding) => {
            const data = getSelectedData(finding);
            return (
              <Badge
                key={finding}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => removeSelection(finding)}
                title={
                  data
                    ? [
                        data.chineseName,
                        `Pattern: ${data.tcmPattern}`,
                        `Treatment: ${data.treatmentPrinciple}`,
                        'Click to remove',
                      ].join('\n')
                    : 'Click to remove'
                }
                aria-label={`Remove pulse finding ${finding}`}
              >
                {finding.length > 30 ? finding.substring(0, 30) + '...' : finding}
                <span className="ml-1">×</span>
              </Badge>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select up to {maxSelections} pulse findings. Click a badge to remove.
      </p>
    </div>
  );
}
