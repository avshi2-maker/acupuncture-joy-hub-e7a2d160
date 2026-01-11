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
  Clock,
  Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import newLogo from '@/assets/new-logo.png';

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
  onMenuClick?: () => void;
}

export const DashboardHeader = memo(function DashboardHeader({
  greeting,
  tierMessage,
  onMenuClick
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
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Mobile only */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Mobile Logo */}
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center overflow-hidden">
                <img src={newLogo} alt="CM Clinic" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-display text-lg font-bold text-slate-800 dark:text-white">CM Clinic</span>
            </Link>

            {/* Welcome Text - Desktop only */}
            <div className="hidden lg:block">
              <h2 className="font-display text-2xl text-slate-800 dark:text-white">{greeting} 👋</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tierMessage}</p>
            </div>
          </div>

          {/* Search Bar - Desktop only */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="חיפוש מטופל..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-8 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <Link
                      to={`/crm/patients/${patient.id}`}
                      className="flex items-center gap-3 flex-1"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{patient.full_name}</p>
                        {patient.phone && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{patient.phone}</p>
                        )}
                      </div>
                    </Link>
                    {patient.phone && (
                      <a
                        href={`tel:${patient.phone}`}
                        className="p-2 rounded-full bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-600 dark:text-slate-300"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" dir="rtl">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <h3 className="font-medium text-slate-800 dark:text-white">התראות</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      אין התראות חדשות
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        to={notif.type === 'appointment' ? '/crm/calendar' : '/crm/patients'}
                        className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === 'appointment' ? 'bg-blue-100 dark:bg-blue-600/20' : 'bg-amber-100 dark:bg-amber-600/20'
                        }`}>
                          {notif.type === 'appointment' ? (
                            <Calendar className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{notif.title}</p>
                          {notif.patientName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{notif.patientName}</p>
                          )}
                          {notif.time && (
                            <p className="text-xs text-blue-600 mt-0.5">{notif.time}</p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <div className="hidden sm:block">
              <LanguageSwitcher variant="ghost" isScrolled={true} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
