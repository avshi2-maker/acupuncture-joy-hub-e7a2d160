import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Settings, User, Palette, Shield, LogOut, HelpCircle, Moon, Sun, Bug, Send, Loader2, RefreshCw, Link2, Home, Accessibility } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AccessibilityPanel } from '@/components/ui/AccessibilityPanel';
import { HeaderUsageBadge } from './HeaderUsageBadge';

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  
  let os = 'Unknown';
  if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  
  let deviceType = 'Desktop';
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = /iPad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }
  
  return { browser, os, deviceType, userAgent: ua.substring(0, 500) };
}

function getPageName(pathname: string): string {
  const routes: Record<string, string> = {
    '/': 'Home', '/dashboard': 'Dashboard', '/crm': 'CRM Dashboard',
    '/crm/dashboard': 'CRM Dashboard', '/crm/calendar': 'Calendar',
    '/crm/patients': 'Patients', '/crm/rooms': 'Rooms', '/crm/staff': 'Staff',
    '/crm/clinics': 'Clinics', '/tcm-brain': 'CM Brain', '/video-session': 'Video Session',
  };
  if (routes[pathname]) return routes[pathname];
  for (const [route, name] of Object.entries(routes)) {
    if (pathname.startsWith(route + '/')) return name;
  }
  return pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' > ') || 'Unknown Page';
}

async function clearServiceWorkersAndCaches() {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'reminder' | 'system';
}

interface HeaderActionsProps {
  onHelpClick?: () => void;
}

export function HeaderActions({ onHelpClick }: HeaderActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [refreshing, setRefreshing] = useState(false);
  
  // Bug report state
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const [bugSubmitting, setBugSubmitting] = useState(false);
  
  const isPatientIntakePage = location.pathname === '/crm/patients/new' || 
    (location.pathname.startsWith('/crm/patients/') && location.pathname.endsWith('/edit'));

  const handleForceRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    toast("Forcing update...", { description: "Clearing cached files and reloading." });
    try {
      await clearServiceWorkersAndCaches();
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(Date.now()));
      window.location.replace(url.toString());
    }
  };

  const handleCopyIntakeLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };
  
  const handleBugSubmit = async () => {
    if (!bugDescription.trim()) {
      toast.error('Please describe the bug');
      return;
    }
    setBugSubmitting(true);
    try {
      const deviceInfo = getDeviceInfo();
      const pageName = getPageName(location.pathname);
      const user = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase.from('bug_reports').insert({
        page_url: window.location.href,
        page_name: pageName,
        description: bugDescription.trim(),
        device_info: deviceInfo,
        user_id: user?.id || null,
      });
      if (error) throw error;
      toast.success('Bug report submitted! Thank you!');
      setBugDescription('');
      setBugDialogOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report');
    } finally {
      setBugSubmitting(false);
    }
  };
  
  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Upcoming Appointment',
      message: 'Yossi Cohen in 30 minutes',
      time: '10:30',
      read: false,
      type: 'appointment'
    },
    {
      id: '2',
      title: 'Follow-up Reminder',
      message: 'Miriam Levi - 1 week post-treatment',
      time: 'Yesterday',
      read: false,
      type: 'reminder'
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New features available',
      time: '2 days ago',
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
    <div className="flex items-center gap-1">
      {/* Usage Badge - shows remaining tokens */}
      <HeaderUsageBadge />

      {/* Home Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/dashboard')}
        className="h-8 w-8"
        title="Home"
      >
        <Home className="h-4 w-4" />
      </Button>

      {/* Accessibility Button */}
      <AccessibilityPanel inline />

      {/* Force Refresh Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleForceRefresh}
        disabled={refreshing}
        className="h-8 w-8"
        title="Force Refresh"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      </Button>

      {/* Copy Intake Link Button - only on intake pages */}
      {isPatientIntakePage && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCopyIntakeLink}
          className="h-8 w-8"
          title="Copy Intake Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      )}

      {/* Bug Report Button */}
      <Dialog open={bugDialogOpen} onOpenChange={setBugDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white h-8 w-8"
            title="Report a Bug"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" />
              Report a Bug
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
              <p><strong>Page:</strong> {getPageName(location.pathname)}</p>
              <p><strong>Device:</strong> {getDeviceInfo().deviceType} • {getDeviceInfo().os} • {getDeviceInfo().browser}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">What went wrong?</label>
              <Textarea
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                placeholder="Describe the bug you encountered..."
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBugDialogOpen(false)} disabled={bugSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleBugSubmit} disabled={bugSubmitting || !bugDescription.trim()} className="bg-destructive hover:bg-destructive/90">
                {bugSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onHelpClick}
        className="bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-900 h-8 w-8"
        title="Help (Alt+?)"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-popover border border-border shadow-lg z-50">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
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
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
          <DropdownMenuLabel>Quick Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate('/crm')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/crm/clinics')} className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            Clinic Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/therapist-disclaimer')} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            Security & Privacy
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onHelpClick} className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
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
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
