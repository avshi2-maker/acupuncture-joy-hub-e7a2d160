import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, User, Palette, Shield, LogOut, HelpCircle, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'reminder' | 'system';
}

export function HeaderActions() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHebrew = language === 'he';
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  // Mock notifications - in production these would come from database
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: isHebrew ? 'תור קרוב' : 'Upcoming Appointment',
      message: isHebrew ? 'יוסי כהן בעוד 30 דקות' : 'Yossi Cohen in 30 minutes',
      time: '10:30',
      read: false,
      type: 'appointment'
    },
    {
      id: '2',
      title: isHebrew ? 'תזכורת מעקב' : 'Follow-up Reminder',
      message: isHebrew ? 'מרים לוי - שבוע לאחר טיפול' : 'Miriam Levi - 1 week post-treatment',
      time: isHebrew ? 'אתמול' : 'Yesterday',
      read: false,
      type: 'reminder'
    },
    {
      id: '3',
      title: isHebrew ? 'עדכון מערכת' : 'System Update',
      message: isHebrew ? 'תכונות חדשות זמינות' : 'New features available',
      time: isHebrew ? 'לפני יומיים' : '2 days ago',
      read: true,
      type: 'system'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-background border border-border shadow-lg z-50">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>{isHebrew ? 'התראות' : 'Notifications'}</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={markAllAsRead}>
                {isHebrew ? 'סמן הכל כנקרא' : 'Mark all read'}
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {isHebrew ? 'אין התראות' : 'No notifications'}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                <span className="text-xs text-muted-foreground">{notification.message}</span>
                {!notification.read && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary cursor-pointer">
            {isHebrew ? 'צפה בכל ההתראות' : 'View all notifications'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg z-50">
          <DropdownMenuLabel>{isHebrew ? 'הגדרות מהירות' : 'Quick Settings'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate('/crm')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            {isHebrew ? 'פרופיל' : 'Profile'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            {isDark 
              ? (isHebrew ? 'מצב בהיר' : 'Light Mode')
              : (isHebrew ? 'מצב כהה' : 'Dark Mode')
            }
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/crm/clinics')} className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            {isHebrew ? 'הגדרות מרפאה' : 'Clinic Settings'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/therapist-disclaimer')} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            {isHebrew ? 'אבטחה ופרטיות' : 'Security & Privacy'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            {isHebrew ? 'עזרה ותמיכה' : 'Help & Support'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => {
              localStorage.removeItem('userTier');
              navigate('/');
            }} 
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isHebrew ? 'התנתקות' : 'Logout'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
