import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, Stethoscope, Pill, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { chiefComplaintsData, getComplaintById, ChiefComplaint } from '@/data/chief-complaints-data';

interface ChiefComplaintSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const categoryIcons: Record<string, string> = {
  'Pain': '🎯',
  'Digestive': '🍽️',
  'Respiratory': '🫁',
  'Mental-Emotional': '🧠',
  'Fatigue': '😴',
  "Women's Health": '♀️',
  'Skin': '✋',
  'Neurological': '⚡',
  'Cardiovascular': '❤️',
  'Urinary': '💧',
  'Immune/Wellness': '🛡️',
  'Eye/Vision': '👁️',
};

export function ChiefComplaintSelect({ 
  value, 
  onValueChange,
  className 
}: ChiefComplaintSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedComplaint = value ? getComplaintById(value) : undefined;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return chiefComplaintsData;
    
    const q = searchQuery.toLowerCase();
    return chiefComplaintsData
      .map(cat => ({
        ...cat,
        complaints: cat.complaints.filter(c =>
          c.complaint.toLowerCase().includes(q) ||
          c.symptoms.toLowerCase().includes(q) ||
          c.tcmPattern.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.complaints.length > 0);
  }, [searchQuery]);

  const handleSelect = (complaintId: string) => {
    onValueChange(complaintId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal min-h-[40px]"
          >
            {selectedComplaint ? (
              <span className="flex items-center gap-2 truncate">
                <span className="text-base">{categoryIcons[selectedComplaint.category] || '📋'}</span>
                <span className="truncate">{selectedComplaint.complaint}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select chief complaint...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0 z-50 bg-popover" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints, symptoms, or patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <Accordion type="multiple" defaultValue={filteredData.map(c => c.category)} className="w-full">
              {filteredData.map((category) => (
                <AccordionItem key={category.category} value={category.category} className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 text-sm">
                    <span className="flex items-center gap-2">
                      <span>{categoryIcons[category.category] || '📋'}</span>
                      <span className="font-medium">{category.category}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {category.complaints.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-0.5 px-1">
                      {category.complaints.map((complaint) => (
                        <ComplaintItem
                          key={complaint.id}
                          complaint={complaint}
                          isSelected={value === complaint.id}
                          onSelect={() => handleSelect(complaint.id)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredData.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No complaints found matching "{searchQuery}"
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected Complaint Details */}
      {selectedComplaint && (
        <div className="p-3 rounded-lg border bg-muted/30 space-y-2 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{selectedComplaint.category}</Badge>
            <span className="font-medium">{selectedComplaint.complaint}</span>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Pattern: </span>
              {selectedComplaint.tcmPattern}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-jade mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Points: </span>
              {selectedComplaint.acupuncturePoints}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Pill className="h-4 w-4 text-terracotta mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Formula: </span>
              {selectedComplaint.herbalFormula}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ComplaintItemProps {
  complaint: ChiefComplaint;
  isSelected: boolean;
  onSelect: () => void;
}

function ComplaintItem({ complaint, isSelected, onSelect }: ComplaintItemProps) {
  return (
    <HoverCard openDelay={400} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={onSelect}
          className={cn(
            "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors text-sm",
            "hover:bg-accent hover:text-accent-foreground",
            isSelected && "bg-primary/10 border border-primary/30"
          )}
        >
          <div className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
          )}>
            {isSelected && <Check className="h-2.5 w-2.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium">{complaint.complaint}</span>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {complaint.symptoms.slice(0, 50)}...
            </p>
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="right" className="w-80 z-[60]" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold">{complaint.complaint}</h4>
            <Badge variant="outline" className="text-xs">{complaint.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{complaint.symptoms}</p>
          <div className="pt-2 border-t space-y-2">
            <div>
              <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                <Activity className="h-3 w-3" /> TCM Pattern
              </p>
              <p className="text-xs text-muted-foreground">{complaint.tcmPattern}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-jade flex items-center gap-1">
                <Stethoscope className="h-3 w-3" /> Acupuncture Points
              </p>
              <p className="text-xs text-muted-foreground">{complaint.acupuncturePoints}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-terracotta flex items-center gap-1">
                <Pill className="h-3 w-3" /> Herbal Formula
              </p>
              <p className="text-xs text-muted-foreground">{complaint.herbalFormula}</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
