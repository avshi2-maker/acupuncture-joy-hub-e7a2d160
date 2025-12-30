import { useState } from 'react';
import { Check, ChevronDown, Info, Stethoscope, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { constitutionTypes, getConstitutionById, ConstitutionType } from '@/data/constitution-type-data';

interface ConstitutionTypeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ConstitutionTypeSelect({ 
  value, 
  onValueChange,
  className 
}: ConstitutionTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedConstitution = value ? getConstitutionById(value) : undefined;

  const handleSelect = (constitutionId: string) => {
    onValueChange(constitutionId);
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            {selectedConstitution ? (
              <span className="flex items-center gap-2">
                <span>{selectedConstitution.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedConstitution.chineseName}
                </Badge>
              </span>
            ) : (
              <span className="text-muted-foreground">Select constitution type...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 z-50 bg-popover" align="start">
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-1">
              {constitutionTypes.map((constitution) => (
                <ConstitutionItem
                  key={constitution.id}
                  constitution={constitution}
                  isSelected={value === constitution.id}
                  onSelect={() => handleSelect(constitution.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected Constitution Details */}
      {selectedConstitution && (
        <div className="p-3 rounded-lg border bg-muted/30 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground">{selectedConstitution.characteristics}</p>
          </div>
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-jade mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Points: </span>
              {selectedConstitution.acupuncturePoints}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Pill className="h-4 w-4 text-terracotta mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Formula: </span>
              {selectedConstitution.herbalFormula}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConstitutionItemProps {
  constitution: ConstitutionType;
  isSelected: boolean;
  onSelect: () => void;
}

function ConstitutionItem({ constitution, isSelected, onSelect }: ConstitutionItemProps) {
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={onSelect}
          className={cn(
            "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isSelected && "bg-primary/10 border border-primary/30"
          )}
        >
          <div className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
          )}>
            {isSelected && <Check className="h-3 w-3" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{constitution.name}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                {constitution.chineseName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {constitution.characteristics.slice(0, 60)}...
            </p>
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="right" className="w-80 z-[60]" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{constitution.name}</h4>
            <Badge>{constitution.chineseName}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{constitution.characteristics}</p>
          <div className="pt-2 border-t space-y-2">
            <div>
              <p className="text-xs font-medium text-jade flex items-center gap-1">
                <Stethoscope className="h-3 w-3" /> Acupuncture Points
              </p>
              <p className="text-xs text-muted-foreground">{constitution.acupuncturePoints}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-terracotta flex items-center gap-1">
                <Pill className="h-3 w-3" /> Herbal Formula
              </p>
              <p className="text-xs text-muted-foreground">{constitution.herbalFormula}</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
