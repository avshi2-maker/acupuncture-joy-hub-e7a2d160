import { useState } from 'react';
import { Check, ChevronsUpDown, Eye, Info } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { tongueDiagnosisData, type TongueFinding } from '@/data/tongue-diagnosis-data';

interface TongueDiagnosisSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export function TongueDiagnosisSelect({ 
  value, 
  onChange, 
  maxSelections = 5 
}: TongueDiagnosisSelectProps) {
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
  const getSelectedData = (findingName: string): TongueFinding | undefined => {
    for (const category of tongueDiagnosisData) {
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
              <Eye className="h-4 w-4" />
              {value.length > 0 
                ? `${value.length} tongue finding${value.length > 1 ? 's' : ''} selected`
                : 'Select tongue findings...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 z-50" align="start">
          <Command>
            <CommandInput placeholder="Search tongue findings..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No tongue finding found.</CommandEmpty>
              {tongueDiagnosisData.map((category) => (
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[300px] z-[100]">
                                <div className="space-y-1 text-xs">
                                  <p><strong>Description:</strong> {finding.description}</p>
                                  <p><strong>TCM Pattern:</strong> {finding.tcmPattern}</p>
                                  <p><strong>Clinical Significance:</strong> {finding.clinicalSignificance}</p>
                                  <p><strong>Treatment:</strong> {finding.treatmentPrinciple}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
              <TooltipProvider key={finding}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeSelection(finding)}
                    >
                      {finding.length > 30 ? finding.substring(0, 30) + '...' : finding}
                      <span className="ml-1">×</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    {data ? (
                      <div className="space-y-1 text-xs">
                        <p className="font-medium">{data.chineseName}</p>
                        <p><strong>Pattern:</strong> {data.tcmPattern}</p>
                        <p><strong>Treatment:</strong> {data.treatmentPrinciple}</p>
                        <p className="text-muted-foreground italic">Click to remove</p>
                      </div>
                    ) : (
                      <p className="text-xs">Click to remove</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select up to {maxSelections} tongue findings. Click a badge to remove.
      </p>
    </div>
  );
}
