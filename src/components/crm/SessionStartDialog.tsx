import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePatients } from '@/hooks/usePatients';
import { Search, User, Loader2, Zap, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionStartDialog({ open, onOpenChange }: SessionStartDialogProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients = [], isLoading } = usePatients();

  // Filter patients by search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter(patient => 
      patient.full_name?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const handleSelectPatient = (patientId: string) => {
    onOpenChange(false);
    setSearchQuery('');
    navigate(`/session/${patientId}`);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-jade-500/10 to-jade-600/5 border-b border-jade-200/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-jade-500 text-white shadow-lg shadow-jade-500/25">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Start New Session</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Select a patient to begin the clinical session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus:border-jade-500"
              autoFocus
            />
          </div>
        </div>

        {/* Patient List */}
        <ScrollArea className="h-[350px]">
          <div className="p-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-jade-500" />
                <p className="text-sm">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No patients found</p>
                <p className="text-xs mt-1">
                  {searchQuery ? 'Try a different search term' : 'Add patients in the CRM first'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl text-left",
                      "bg-card hover:bg-jade-50 dark:hover:bg-jade-950/30",
                      "border border-border/50 hover:border-jade-300 dark:hover:border-jade-700",
                      "transition-all duration-200 group"
                    )}
                  >
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-jade-400 to-jade-600 flex items-center justify-center text-white font-semibold text-lg shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                      {patient.full_name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate group-hover:text-jade-700 dark:group-hover:text-jade-300 transition-colors">
                        {patient.full_name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Start Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2 rounded-full bg-jade-500 text-white">
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} available
          </p>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
