import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import newLogo from '@/assets/new-logo.png';
import { 
  Calendar, 
  Users, 
  Video, 
  Brain, 
  Database, 
  ClipboardCheck,
  Home,
  LogOut,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/layout/TierBadge';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const mainNavItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, label: 'ראשי', href: '/' },
  { icon: <Calendar className="h-5 w-5" />, label: 'יומן תורים', href: '/crm/calendar' },
  { icon: <Users className="h-5 w-5" />, label: 'מטופלים', href: '/crm/patients' },
];

const toolsNavItems: NavItem[] = [
  { icon: <Video className="h-5 w-5" />, label: 'פגישת וידאו', href: '/video-session' },
  { icon: <Brain className="h-5 w-5" />, label: 'טיפול AI', href: '/tcm-brain' },
  { icon: <Database className="h-5 w-5" />, label: 'מאגר ידע', href: '/knowledge-registry' },
  { icon: <ClipboardCheck className="h-5 w-5" />, label: 'קליטת מטפל', href: '/therapist-intake' },
];

interface DashboardSidebarProps {
  onLogout: () => void;
  disclaimerSigned?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DashboardSidebar = memo(function DashboardSidebar({ 
  onLogout, 
  disclaimerSigned,
  isOpen = true,
  onClose
}: DashboardSidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed right-0 top-0 h-screen w-72 bg-slate-900 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out",
          // Desktop: always visible
          "lg:translate-x-0 lg:w-64",
          // Mobile: slide in/out
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Logo Section with Close Button on Mobile */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3" onClick={handleNavClick}>
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center overflow-hidden">
                <img src={newLogo} alt="CM Clinic" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-white">CM Clinic</h1>
                <p className="text-xs text-slate-400">קליניקה רפואית</p>
              </div>
            </Link>
            {/* Close button - Mobile only */}
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Tier Badge */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <TierBadge />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ניווט ראשי</p>
          </div>
          <ul className="space-y-1 px-2">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="px-4 mt-6 mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">כלי טיפול</p>
          </div>
          <ul className="space-y-1 px-2">
            {toolsNavItems.map((item) => {
              const href = item.href === '/therapist-intake' && disclaimerSigned 
                ? '/therapist-profile/edit' 
                : item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive(item.href)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.href === '/therapist-intake' && disclaimerSigned && (
                      <span className="mr-auto text-xs text-blue-400">✓</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <Link
            to="/crm/settings"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">הגדרות</span>
          </Link>
          <Link
            to="/help"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">עזרה</span>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              onLogout();
              if (onClose) onClose();
            }}
            className="w-full justify-start gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">יציאה</span>
          </Button>
        </div>
      </aside>
    </>
  );
});
