import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { User, Loader2, Search, X, Check, Phone, Mail, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickPatientDialog } from '@/components/video/QuickPatientDialog';

export interface PatientOption {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
}

export interface SelectedPatient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface PatientSelectorDropdownProps {
  patients: PatientOption[];
  selectedPatient: SelectedPatient | null;
  onSelectPatient: (patient: SelectedPatient | null) => void;
  isLoading?: boolean;
  className?: string;
  showOnMobile?: boolean;
  onPatientAdded?: () => void;
}

export function PatientSelectorDropdown({
  patients,
  selectedPatient,
  onSelectPatient,
  isLoading = false,
  className,
  showOnMobile = true,
  onPatientAdded,
}: PatientSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const query = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(query) ||
        p.phone?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
    );
  }, [patients, search]);

  const handleSelect = (patient: PatientOption | null) => {
    if (patient) {
      onSelectPatient({
        id: patient.id,
        name: patient.full_name,
        email: patient.email || undefined,
        phone: patient.phone || undefined,
      });
    } else {
      onSelectPatient(null);
    }
    setOpen(false);
    setSearch('');
  };

  const handlePatientCreated = (patientId: string, patientName: string) => {
    // Select the newly created patient
    onSelectPatient({
      id: patientId,
      name: patientName,
    });
    setOpen(false);
    // Notify parent to refresh patients list
    onPatientAdded?.();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-7 gap-1.5 text-xs max-w-[160px]',
              !showOnMobile && 'hidden sm:flex',
              selectedPatient && 'border-jade/50 bg-jade/5',
              className
            )}
            title="Link session to patient"
          >
            <User className={cn('h-3.5 w-3.5 shrink-0', selectedPatient && 'text-jade')} />
            <span className="truncate">
              {selectedPatient ? selectedPatient.name : 'Select Patient'}
            </span>
            {selectedPatient && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-jade/20 text-jade shrink-0">
                CRM
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0 bg-card border-border z-50" 
          align="start"
          sideOffset={4}
        >
          {/* Search Header */}
          <div className="p-2 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-8 text-sm"
                autoFocus
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Patient List */}
          <ScrollArea className="max-h-64">
            <div className="p-1">
              {/* Quick Add Patient Button */}
              <button
                onClick={() => {
                  setOpen(false);
                  setQuickAddOpen(true);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-jade/10 text-jade border border-dashed border-jade/30 mb-1'
                )}
              >
                <UserPlus className="h-4 w-4" />
                <span className="flex-1 text-left font-medium">Quick Add Patient</span>
              </button>

              {/* No Patient Option */}
              <button
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-muted/50',
                  !selectedPatient && 'bg-muted/30'
                )}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left">No Patient (Anonymous)</span>
                {!selectedPatient && <Check className="h-4 w-4 text-jade" />}
              </button>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading patients...</span>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && patients.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No patients in your CRM yet
                </div>
              )}

              {/* No Results */}
              {!isLoading && patients.length > 0 && filteredPatients.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No patients match "{search}"
                </div>
              )}

              {/* Patient Items */}
              {!isLoading &&
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelect(patient)}
                    className={cn(
                      'w-full flex items-start gap-2 px-2 py-2 rounded-md text-sm transition-colors',
                      'hover:bg-muted/50',
                      selectedPatient?.id === patient.id && 'bg-jade/10 border border-jade/20'
                    )}
                  >
                    <User className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      selectedPatient?.id === patient.id ? 'text-jade' : 'text-muted-foreground'
                    )} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium truncate">{patient.full_name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {patient.phone && (
                          <span className="flex items-center gap-0.5 truncate">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="flex items-center gap-0.5 truncate">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPatient?.id === patient.id && (
                      <Check className="h-4 w-4 text-jade shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
            </div>
          </ScrollArea>

          {/* Footer with count */}
          <div className="px-2 py-1.5 border-t border-border/50 text-xs text-muted-foreground">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} in CRM
            {search && filteredPatients.length !== patients.length && (
              <span> • {filteredPatients.length} shown</span>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Add Patient Dialog */}
      <QuickPatientDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onPatientCreated={handlePatientCreated}
      />
    </>
  );
}
