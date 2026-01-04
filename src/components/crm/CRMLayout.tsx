import { ReactNode, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CRMSidebar } from './CRMSidebar';
import { CRMBreadcrumb } from './CRMBreadcrumb';
import { SessionTimerWidget } from './SessionTimerWidget';
import { SessionTimerProvider } from '@/contexts/SessionTimerContext';
import { ThemedClockWidget } from '@/components/ui/ThemedClockWidget';
import { HeaderActions } from './HeaderActions';
import { FloatingHelpGuide } from '@/components/ui/FloatingHelpGuide';
import { Building2, Menu, Leaf, Home } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

interface CRMLayoutProps {
  children: ReactNode;
}

interface HeaderContentProps {
  onHelpClick: () => void;
}

function MobileHeader({ onHelpClick }: HeaderContentProps) {
  const { toggleSidebar, isMobile } = useSidebar();
  
  if (!isMobile) return null;
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b border-gold/30 bg-gradient-to-r from-jade/90 via-jade/80 to-jade/90 backdrop-blur-sm px-3 md:hidden shadow-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center rounded-full p-2 text-cream/80 hover:bg-cream/10 hover:text-cream transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </button>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
            <Leaf className="h-4 w-4 text-gold" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-cream tracking-tight">CM CLINIC</span>
            <p className="text-[10px] text-cream/60 -mt-0.5">CRM Portal</p>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemedClockWidget className="scale-[0.55] origin-right" />
        <HeaderActions onHelpClick={onHelpClick} />
      </div>
    </header>
  );
}

function DesktopHeader({ onHelpClick }: HeaderContentProps) {
  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b border-gold/30 bg-gradient-to-r from-jade/90 via-jade/80 to-jade/90 backdrop-blur-sm px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group mr-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center group-hover:bg-gold/30 transition-all group-hover:scale-105">
            <Leaf className="h-5 w-5 text-gold" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg text-cream tracking-tight">CM CLINIC</span>
            <p className="text-xs text-cream/60 -mt-0.5">CRM Portal</p>
          </div>
        </Link>
        <div className="h-8 w-px bg-cream/20" />
        <CRMBreadcrumb />
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 text-cream/70 hover:text-cream text-sm transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <ThemedClockWidget className="scale-90" />
        <HeaderActions onHelpClick={onHelpClick} />
      </div>
    </header>
  );
}

export function CRMLayout({ children }: CRMLayoutProps) {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);

  const isPatientIntakePage =
    location.pathname === '/crm/patients/new' ||
    (location.pathname.startsWith('/crm/patients/') && location.pathname.endsWith('/edit'));

  return (
    <SessionTimerProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <CRMSidebar />
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <MobileHeader onHelpClick={() => setHelpOpen(true)} />
            <DesktopHeader onHelpClick={() => setHelpOpen(true)} />
            <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-x-hidden md:overflow-x-auto overflow-y-auto">
              {children}
            </main>
          </SidebarInset>
          {/* Session Timer Widget - Always visible */}
          <SessionTimerWidget
            position="bottom-right"
            className={isPatientIntakePage ? 'bottom-24' : undefined}
          />
          {/* Help Guide - controlled from header */}
          <FloatingHelpGuide isOpen={helpOpen} onOpenChange={setHelpOpen} />
        </div>
      </SidebarProvider>
    </SessionTimerProvider>
  );
}
