import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Calculator,
  Activity,
  Pill,
  User,
  CreditCard,
  Stethoscope,
} from 'lucide-react';
import newLogo from '@/assets/new-logo.png';
import { useNavigate, Link } from 'react-router-dom';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Primary navigation - Core CRM features
const primaryNavItems = [
  { title: 'Dashboard', url: '/crm', icon: LayoutDashboard },
  { title: 'Calendar', url: '/crm/calendar', icon: Calendar },
  { title: 'Patients', url: '/crm/patients', icon: Users },
];

// Clinical Toolkit - Collapsible group
const clinicalToolkitItems = [
  { title: 'Encyclopedia', url: '/encyclopedia', icon: BookOpen },
  { title: 'Bazi Calculator', url: '/clinical-tools/bazi', icon: Calculator },
  { title: 'Pulse Gallery', url: '/clinical-tools/pulse-gallery', icon: Activity },
  { title: 'Tongue Gallery', url: '/clinical-tools/tongue-gallery', icon: Activity },
  { title: 'Drug/Herb Interactions', url: '/clinical-tools/symptom-checker', icon: Pill },
];

// Admin items
const adminNavItems = [
  { title: 'Settings', url: '/crm/clinics', icon: Settings },
  { title: 'Profile', url: '/therapist-profile', icon: User },
  { title: 'Subscription', url: '/pricing', icon: CreditCard },
];

export function CRMSidebar() {
  const navigate = useNavigate();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [clinicalToolkitOpen, setClinicalToolkitOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleNewSession = () => {
    navigate('/crm/session-manager');
    handleNavClick();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex flex-col gap-2">
          {/* Back to Dashboard Button */}
          <Link
            to="/dashboard"
            className="group flex items-center gap-2 text-xs font-medium py-1.5 px-2 rounded-lg
                       bg-gradient-to-r from-jade-600/10 to-jade-500/5
                       text-jade-700 dark:text-jade-300
                       hover:from-jade-600/20 hover:to-jade-500/10
                       transition-all duration-300 hover:-translate-x-1"
            onClick={handleNavClick}
          >
            <ArrowLeft className="h-3.5 w-3.5 animate-pulse-arrow" />
            {(!isCollapsed || isMobile) && (
              <>
                <span className="animate-bounce-subtle">🏠</span>
                <span>Dashboard</span>
              </>
            )}
          </Link>
          
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-jade flex items-center justify-center overflow-hidden">
                  <img src={newLogo} alt="CM Clinic Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="font-display font-semibold text-lg">CM Clinic</span>
              </div>
            )}
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpenMobile(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSidebar}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Primary</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/crm'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      activeClassName="bg-jade/10 text-jade font-medium"
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className={isCollapsed && !isMobile ? 'sr-only' : ''}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* New Session Action Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2">
              <Button
                onClick={handleNewSession}
                className="w-full bg-gradient-to-r from-jade-600 to-jade-500 hover:from-jade-700 hover:to-jade-600 text-white shadow-md"
                size={isCollapsed && !isMobile ? "icon" : "default"}
              >
                <Zap className="h-4 w-4" />
                {(!isCollapsed || isMobile) && <span className="ml-2">New Session</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Clinical Toolkit - Collapsible */}
        <SidebarGroup>
          <Collapsible open={clinicalToolkitOpen} onOpenChange={setClinicalToolkitOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-muted/30 rounded-md transition-colors flex items-center justify-between pr-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Clinical Toolkit</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${clinicalToolkitOpen ? 'rotate-180' : ''}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {clinicalToolkitItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-sm"
                          activeClassName="bg-jade/10 text-jade font-medium"
                          onClick={handleNavClick}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className={isCollapsed && !isMobile ? 'sr-only' : ''}>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Admin */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      activeClassName="bg-jade/10 text-jade font-medium"
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className={isCollapsed && !isMobile ? 'sr-only' : ''}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {(!isCollapsed || isMobile) && <TierBadge />}
            <div className="flex items-center gap-1">
              <LanguageSwitcher variant="ghost" isScrolled={true} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
