import { ReactNode, useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CRMSidebar } from './CRMSidebar';
import { CRMBreadcrumb } from './CRMBreadcrumb';
import { SessionTimerWidget } from './SessionTimerWidget';
import { SessionTimerProvider } from '@/contexts/SessionTimerContext';
import { ThemedClockWidget } from '@/components/ui/ThemedClockWidget';
import { HeaderActions } from './HeaderActions';
import { FloatingHelpGuide } from '@/components/ui/FloatingHelpGuide';
import { Building2, Menu } from 'lucide-react';
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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-jade flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display font-semibold text-sm">CM Clinic</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <ThemedClockWidget className="scale-[0.6] origin-right" />
        <HeaderActions onHelpClick={onHelpClick} />
      </div>
    </header>
  );
}

function DesktopHeader({ onHelpClick }: HeaderContentProps) {
  return (
    <header className="hidden md:flex h-14 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <CRMBreadcrumb />
      <div className="flex items-center gap-4">
        <ThemedClockWidget className="scale-90" />
        <HeaderActions onHelpClick={onHelpClick} />
      </div>
    </header>
  );
}

export function CRMLayout({ children }: CRMLayoutProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  
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
          <SessionTimerWidget position="bottom-right" />
          {/* Help Guide - controlled from header */}
          <FloatingHelpGuide isOpen={helpOpen} onOpenChange={setHelpOpen} />
        </div>
      </SidebarProvider>
    </SessionTimerProvider>
  );
}