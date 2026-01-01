import { useState, memo } from 'react';
import { Check, ChevronDown, Info, Stethoscope, Pill, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { constitutionTypes, getConstitutionById, ConstitutionType } from '@/data/constitution-type-data';

interface ConstitutionTypeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const ConstitutionTypeSelect = memo(function ConstitutionTypeSelect({ 
  value, 
  onValueChange,
  className 
}: ConstitutionTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedConstitution = value ? getConstitutionById(value) : undefined;

  const filteredTypes = searchQuery.trim()
    ? constitutionTypes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.chineseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.characteristics.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : constitutionTypes;

  const handleSelect = (constitutionId: string) => {
    onValueChange(constitutionId);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal min-h-[40px]"
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
        <PopoverContent className="w-[450px] p-0 z-50 bg-popover" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search constitution types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-1">
              {filteredTypes.map((constitution) => {
                const isSelected = value === constitution.id;
                
                return (
                  <button
                    key={constitution.id}
                    type="button"
                    onClick={() => handleSelect(constitution.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-md text-left transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-primary/10 border border-primary/30"
                    )}
                    title={`Characteristics: ${constitution.characteristics}\nPoints: ${constitution.acupuncturePoints}\nFormula: ${constitution.herbalFormula}`}
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
                    <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
              {filteredTypes.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No constitution types found matching "{searchQuery}"
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected Constitution Details */}
      {selectedConstitution && (
        <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Selected: {selectedConstitution.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{selectedConstitution.characteristics}</p>
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
});
