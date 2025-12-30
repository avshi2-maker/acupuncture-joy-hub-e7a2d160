import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bug, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const pixelRatio = window.devicePixelRatio;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  
  // Detect device type
  let deviceType = 'Desktop';
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = /iPad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }
  
  return {
    browser,
    os,
    deviceType,
    platform,
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,
    pixelRatio,
    isStandalone,
    userAgent: ua.substring(0, 500), // Truncate for storage
  };
}

function getPageName(pathname: string): string {
  const routes: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/crm': 'CRM Dashboard',
    '/crm/dashboard': 'CRM Dashboard',
    '/crm/calendar': 'Calendar',
    '/crm/patients': 'Patients',
    '/crm/rooms': 'Rooms',
    '/crm/staff': 'Staff',
    '/crm/clinics': 'Clinics',
    '/tcm-brain': 'CM Brain',
    '/video-session': 'Video Session',
    '/symptom-checker': 'Symptom Checker',
    '/treatment-planner': 'Treatment Planner',
    '/bazi-calculator': 'Bazi Calculator',
    '/encyclopedia': 'Encyclopedia',
    '/pricing': 'Pricing',
    '/contact': 'Contact',
    '/install': 'Install App',
  };
  
  // Check exact match first
  if (routes[pathname]) return routes[pathname];
  
  // Check prefix matches
  for (const [route, name] of Object.entries(routes)) {
    if (pathname.startsWith(route + '/')) return name;
  }
  
  // Default: capitalize path segments
  return pathname.split('/').filter(Boolean).map(s => 
    s.charAt(0).toUpperCase() + s.slice(1)
  ).join(' > ') || 'Unknown Page';
}

export function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  
  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please describe the bug');
      return;
    }
    
    setSubmitting(true);
    try {
      const deviceInfo = getDeviceInfo();
      const pageName = getPageName(location.pathname);
      const user = (await supabase.auth.getUser()).data.user;
      
      const { error } = await supabase.from('bug_reports').insert({
        page_url: window.location.href,
        page_name: pageName,
        description: description.trim(),
        device_info: deviceInfo,
        user_id: user?.id || null,
      });
      
      if (error) throw error;
      
      toast.success('Bug report submitted! Thank you for helping improve the app.');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full",
            "bg-destructive/10 text-destructive hover:bg-destructive/20",
            "shadow-lg backdrop-blur-sm border border-destructive/20",
            "transition-all hover:scale-110"
          )}
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
          {/* Auto-detected info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
            <p><strong>Page:</strong> {getPageName(location.pathname)}</p>
            <p><strong>Device:</strong> {getDeviceInfo().deviceType} • {getDeviceInfo().os} • {getDeviceInfo().browser}</p>
            <p><strong>Screen:</strong> {window.innerWidth}×{window.innerHeight}</p>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What went wrong?</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the bug you encountered... What were you trying to do? What happened instead?"
              rows={4}
              className="resize-none"
            />
          </div>
          
          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !description.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
