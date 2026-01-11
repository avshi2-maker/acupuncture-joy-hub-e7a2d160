import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  X, 
  Bell, 
  Sun, 
  Moon, 
  Users,
  Phone,
  Calendar,
  Clock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'follow_up' | 'appointment';
  title: string;
  time?: string;
  patientName?: string;
}

interface SearchResult {
  id: string;
  full_name: string;
  phone: string | null;
}

interface DashboardHeaderProps {
  greeting: string;
  tierMessage: string;
}

export const DashboardHeader = memo(function DashboardHeader({
  greeting,
  tierMessage
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(new Date(today).setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999)).toISOString();

        const { data: followUps } = await supabase
          .from('follow_ups')
          .select('id, scheduled_date, reason, patients(full_name)')
          .eq('status', 'pending')
          .lte('scheduled_date', today.toISOString().split('T')[0])
          .limit(10);

        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, start_time, title, patients(full_name)')
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
          .order('start_time', { ascending: true })
          .limit(10);

        const notifs: Notification[] = [];

        followUps?.forEach((fu: any) => {
          notifs.push({
            id: fu.id,
            type: 'follow_up',
            title: fu.reason || 'מעקב',
            patientName: fu.patients?.full_name,
          });
        });

        appointments?.forEach((apt: any) => {
          notifs.push({
            id: apt.id,
            type: 'appointment',
            title: apt.title,
            time: new Date(apt.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
            patientName: apt.patients?.full_name,
          });
        });

        setNotifications(notifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('patients')
          .select('id, full_name, phone')
          .or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
          .limit(5);

        setSearchResults(data || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchPatients, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Welcome Text */}
          <div className="flex-1">
            <h2 className="font-display text-2xl text-foreground">{greeting} 👋</h2>
            <p className="text-sm text-muted-foreground">{tierMessage}</p>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="חיפוש מטופל..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-8 bg-slate-50 dark:bg-muted/50 border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                  >
                    <Link
                      to={`/crm/patients/${patient.id}`}
                      className="flex items-center gap-3 flex-1"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <Users className="h-4 w-4 text-jade" />
                      <div>
                        <p className="font-medium text-sm">{patient.full_name}</p>
                        {patient.phone && (
                          <p className="text-xs text-muted-foreground">{patient.phone}</p>
                        )}
                      </div>
                    </Link>
                    {patient.phone && (
                      <a
                        href={`tel:${patient.phone}`}
                        className="p-2 rounded-full bg-jade/10 hover:bg-jade/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-4 w-4 text-jade" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0" dir="rtl">
                <div className="p-3 border-b border-border bg-slate-50 dark:bg-muted/50">
                  <h3 className="font-medium">התראות</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      אין התראות חדשות
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        to={notif.type === 'appointment' ? '/crm/calendar' : '/crm/patients'}
                        className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === 'appointment' ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-amber-100 dark:bg-amber-500/20'
                        }`}>
                          {notif.type === 'appointment' ? (
                            <Calendar className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          {notif.patientName && (
                            <p className="text-xs text-muted-foreground truncate">{notif.patientName}</p>
                          )}
                          {notif.time && (
                            <p className="text-xs text-jade mt-0.5">{notif.time}</p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <LanguageSwitcher variant="ghost" isScrolled={true} />
          </div>
        </div>
      </div>
    </header>
  );
});
