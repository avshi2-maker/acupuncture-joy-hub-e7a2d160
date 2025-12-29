import { useState, useEffect, useMemo } from 'react';
import { Search, User, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
  chief_complaint: string | null;
}

interface QuickPatientSearchProps {
  onSelect?: (patient: Patient) => void;
  className?: string;
}

const RECENT_PATIENTS_KEY = 'tcm_recent_patients';
const MAX_RECENT = 5;

export const QuickPatientSearch = ({ onSelect, className }: QuickPatientSearchProps) => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Load recent patients from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_PATIENTS_KEY);
    if (stored) {
      try {
        setRecentPatients(JSON.parse(stored));
      } catch {
        setRecentPatients([]);
      }
    }
  }, []);

  // Search patients
  useEffect(() => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    const searchPatients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, phone, chief_complaint')
          .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,id_number.ilike.%${query}%`)
          .limit(10);

        if (!error && data) {
          setPatients(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const addToRecent = (patient: Patient) => {
    const updated = [patient, ...recentPatients.filter(p => p.id !== patient.id)].slice(0, MAX_RECENT);
    setRecentPatients(updated);
    localStorage.setItem(RECENT_PATIENTS_KEY, JSON.stringify(updated));
  };

  const handleSelect = (patient: Patient) => {
    addToRecent(patient);
    setQuery('');
    setIsFocused(false);
    if (onSelect) {
      onSelect(patient);
    } else {
      navigate(`/crm/patients/${patient.id}`);
    }
  };

  const displayList = useMemo(() => {
    if (query.length >= 2) return patients;
    return recentPatients;
  }, [query, patients, recentPatients]);

  const showDropdown = isFocused && (displayList.length > 0 || query.length >= 2);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search patients..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-9 pr-8 h-10 bg-background/50 border-border/50"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setQuery('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {query.length < 2 && recentPatients.length > 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-1 border-b border-border/50">
              <Clock className="h-3 w-3" />
              Recent
            </div>
          )}
          
          <ScrollArea className="max-h-64">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : displayList.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No patients found
              </div>
            ) : (
              displayList.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="w-full px-3 py-2.5 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left touch-manipulation"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{patient.full_name}</p>
                    {patient.phone && (
                      <p className="text-xs text-muted-foreground truncate">{patient.phone}</p>
                    )}
                    {patient.chief_complaint && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                        {patient.chief_complaint}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
