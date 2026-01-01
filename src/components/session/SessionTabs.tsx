import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface SessionTab {
  id: string;
  label: string;
  labelHe?: string;
  icon: LucideIcon;
  description?: string;
  content: ReactNode;
}

interface SessionTabsProps {
  tabs: SessionTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export function SessionTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
}: SessionTabsProps) {
  const sizeClasses = {
    sm: 'py-1.5 gap-0.5',
    md: 'py-2 gap-1',
    lg: 'py-3 gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={cn(
        'w-full mb-4 bg-muted/50 p-1 rounded-lg',
        tabs.length <= 4 ? 'grid grid-cols-4' : 
        tabs.length <= 6 ? 'grid grid-cols-6' :
        'flex overflow-x-auto'
      )}>
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className={cn(
              'flex flex-col items-center transition-all',
              sizeClasses[size],
              variant === 'pills' && 'rounded-full',
              variant === 'underline' && 'border-b-2 border-transparent data-[state=active]:border-jade',
              'data-[state=active]:bg-jade/10 data-[state=active]:text-jade'
            )}
          >
            <tab.icon className={iconSizes[size]} />
            <span className={cn(
              'font-medium',
              size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm',
              'hidden sm:block'
            )}>
              {tab.label}
            </span>
            {tab.description && (
              <span className="text-[9px] text-muted-foreground hidden md:block">
                {tab.description}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="bg-card rounded-lg border min-h-[calc(100vh-320px)]">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
