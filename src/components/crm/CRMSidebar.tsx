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
  LayoutDashboard,
  Calendar,
  Users,
  DoorOpen,
  UserCog,
  Settings,
  Building2,
  Brain,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { TierBadge } from '@/components/layout/TierBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const mainNavItems = [
  { title: 'Dashboard', url: '/crm', icon: LayoutDashboard },
  { title: 'Session Manager', url: '/crm/session-manager', icon: Zap },
  { title: 'Calendar', url: '/crm/calendar', icon: Calendar },
  { title: 'Patients', url: '/crm/patients', icon: Users },
];

const managementItems = [
  { title: 'Rooms', url: '/crm/rooms', icon: DoorOpen },
  { title: 'Staff', url: '/crm/staff', icon: UserCog },
  { title: 'Clinics', url: '/crm/clinics', icon: Building2 },
];

const toolsItems: { title: string; url: string; icon: any }[] = [
  // Items removed per user request
];

export function CRMSidebar() {
  const navigate = useNavigate();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex flex-col gap-2">
          {/* Animated Back to Dashboard Button */}
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
                <div className="w-8 h-8 rounded-lg bg-jade flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
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
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
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