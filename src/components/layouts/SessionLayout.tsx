import { ReactNode } from 'react';

interface SessionLayoutProps {
  children?: ReactNode;
}

/**
 * SessionLayout - The main session mode layout
 * 
 * This layout will eventually hold:
 * - Gemini RAG Search panel (left)
 * - Body Maps / Clinical Tools (right)
 * - Patient context bar (top)
 * - Session timer and controls (bottom)
 * 
 * Currently a shell for future development.
 */
export function SessionLayout({ children }: SessionLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Session Header - Patient Context Bar */}
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4">
        <div className="text-sm text-muted-foreground">
          Session Mode - Ready for Implementation
        </div>
      </header>

      {/* Main Session Content Area */}
      <main className="flex-1 flex">
        {/* Left Panel - RAG Search (placeholder) */}
        <aside className="w-1/2 border-r border-border/30 p-4 bg-muted/5">
          <div className="h-full rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">
              🔍 Gemini RAG Search Panel
            </span>
          </div>
        </aside>

        {/* Right Panel - Body Maps (placeholder) */}
        <section className="w-1/2 p-4 bg-muted/5">
          <div className="h-full rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">
              🧬 Body Maps & Clinical Tools
            </span>
          </div>
        </section>
      </main>

      {/* Session Footer - Timer & Controls */}
      <footer className="h-12 border-t border-border/50 bg-card/50 flex items-center justify-center px-4">
        <div className="text-xs text-muted-foreground">
          Session Timer & Quick Actions
        </div>
      </footer>

      {/* Optional: Render children for additional content */}
      {children}
    </div>
  );
}

export default SessionLayout;
