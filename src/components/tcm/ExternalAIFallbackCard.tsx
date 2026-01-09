import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ExternalLink, X, ChevronDown, Copy, Check, Volume2, VolumeX, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export type ExternalAIProvider = 'lovable-gemini' | 'perplexity';

const PREFERRED_PROVIDER_KEY = 'tcm-preferred-ai-provider';
const AUDIO_ENABLED_KEY = 'tcm-audio-feedback-enabled';
const USAGE_HISTORY_KEY = 'tcm-external-ai-usage-history';

interface AIProviderOption {
  id: ExternalAIProvider;
  name: string;
  description: string;
  baseUrl: string;
  isInternal: boolean;
}

interface UsageHistoryEntry {
  provider: string;
  query: string;
  timestamp: string;
}

const AI_PROVIDERS: AIProviderOption[] = [
  { 
    id: 'lovable-gemini', 
    name: 'Lovable AI (Gemini)', 
    description: 'Internal - stays in module',
    baseUrl: '',
    isInternal: true 
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    description: 'Opens in new tab - you stay here',
    baseUrl: 'https://www.perplexity.ai',
    isInternal: false 
  },
];

// Audio feedback utilities
const playSound = (type: 'click' | 'success' | 'warning' | 'error', enabled: boolean) => {
  if (!enabled) return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      case 'success':
        oscillator.frequency.value = 523.25;
        gainNode.gain.value = 0.15;
        oscillator.start();
        setTimeout(() => { oscillator.frequency.value = 659.25; }, 100);
        setTimeout(() => { oscillator.frequency.value = 783.99; }, 200);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'warning':
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.12;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'error':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
    }
  } catch (e) {
    console.debug('Audio not available:', e);
  }
};

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [10, 50, 10],
        error: [50, 100, 50, 100, 50],
      };
      navigator.vibrate(patterns[type]);
    } catch (e) {
      console.debug('Haptic not available:', e);
    }
  }
};

// Usage history utilities
const getUsageHistory = (): UsageHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(USAGE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addUsageHistory = (provider: string, query: string) => {
  try {
    const history = getUsageHistory();
    history.unshift({
      provider,
      query: query.substring(0, 100),
      timestamp: new Date().toISOString(),
    });
    // Keep only last 50 entries
    localStorage.setItem(USAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {}
};

const clearUsageHistory = () => {
  try {
    localStorage.removeItem(USAGE_HISTORY_KEY);
  } catch {}
};

interface ExternalAIFallbackCardProps {
  query: string;
  isLoading?: boolean;
  onUseExternalAI: (provider: ExternalAIProvider) => void;
  onDismiss: () => void;
}

export function ExternalAIFallbackCard({
  query,
  isLoading,
  onUseExternalAI,
  onDismiss,
}: ExternalAIFallbackCardProps) {
  const [copied, setCopied] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIO_ENABLED_KEY);
      return saved !== 'false'; // Default to true
    } catch {
      return true;
    }
  });
  const [usageHistory, setUsageHistory] = useState<UsageHistoryEntry[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderOption>(() => {
    try {
      const saved = localStorage.getItem(PREFERRED_PROVIDER_KEY);
      if (saved) {
        const found = AI_PROVIDERS.find(p => p.id === saved);
        if (found) return found;
      }
    } catch {}
    return AI_PROVIDERS[0];
  });

  // Load usage history
  useEffect(() => {
    setUsageHistory(getUsageHistory());
  }, []);

  // Play warning sound when card appears
  useEffect(() => {
    playSound('warning', audioEnabled);
    triggerHaptic('medium');
  }, [audioEnabled]);

  // Save audio preference
  useEffect(() => {
    try {
      localStorage.setItem(AUDIO_ENABLED_KEY, String(audioEnabled));
    } catch {}
  }, [audioEnabled]);

  // Save provider preference
  useEffect(() => {
    try {
      localStorage.setItem(PREFERRED_PROVIDER_KEY, selectedProvider.id);
    } catch {}
  }, [selectedProvider]);

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      playSound('success', audioEnabled);
      triggerHaptic('success');
      toast.success('Question copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      playSound('error', audioEnabled);
      triggerHaptic('error');
      toast.error('Failed to copy');
    }
  };

  const handleProviderSelect = (provider: AIProviderOption) => {
    setSelectedProvider(provider);
    playSound('click', audioEnabled);
    triggerHaptic('light');
    toast.info(`Selected: ${provider.name}`);
  };

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
    toast.info(audioEnabled ? 'Audio feedback disabled' : 'Audio feedback enabled');
  };

  const handleClearHistory = () => {
    clearUsageHistory();
    setUsageHistory([]);
    toast.success('Usage history cleared');
  };

  const openExternalUrl = useCallback((provider: AIProviderOption) => {
    const encodedQuery = encodeURIComponent(query);
    const targetUrl = `https://www.perplexity.ai/search?q=${encodedQuery}`;
    
    console.log('[ExternalAI] Opening Perplexity URL:', targetUrl);
    
    // Copy question to clipboard first
    navigator.clipboard.writeText(query).catch(() => {});
    
    // Track usage
    addUsageHistory(provider.name, query);
    setUsageHistory(getUsageHistory());
    
    playSound('success', audioEnabled);
    triggerHaptic('success');
    
    // Use window.location for more reliable navigation (no popup blocker issues)
    // Open in new tab using an anchor element click
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [query, audioEnabled]);

  const handleUseAI = () => {
    console.log('[ExternalAI] handleUseAI called, provider:', selectedProvider.id, 'isInternal:', selectedProvider.isInternal);
    
    if (selectedProvider.isInternal) {
      playSound('click', audioEnabled);
      triggerHaptic('medium');
      addUsageHistory(selectedProvider.name, query);
      setUsageHistory(getUsageHistory());
      onUseExternalAI(selectedProvider.id);
    } else {
      openExternalUrl(selectedProvider);
      onDismiss();
    }
  };

  const handleDismiss = () => {
    playSound('click', audioEnabled);
    triggerHaptic('light');
    onDismiss();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('he-IL', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(680px,calc(100vw-2rem))] -translate-x-1/2">
      <Card className="border-2 border-destructive/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-lg animate-in slide-in-from-bottom-4">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">No match in proprietary knowledge base</p>
                  <Badge variant="destructive" className="text-[10px]">External option</Badge>
                  
                  {/* Audio Toggle */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleAudio}
                    className="h-6 w-6 p-0"
                    title={audioEnabled ? 'Disable audio feedback' : 'Enable audio feedback'}
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Usage History */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 gap-1"
                        title="View usage history"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span className="text-[10px]">{usageHistory.length}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-2" align="start">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">External AI Usage History</h4>
                        {usageHistory.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearHistory}
                            className="h-6 text-xs text-destructive"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      
                      {usageHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          No external AI usage recorded yet
                        </p>
                      ) : (
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {usageHistory.map((entry, idx) => (
                              <div 
                                key={idx} 
                                className="p-2 rounded bg-muted/50 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-[9px]">
                                    {entry.provider}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTime(entry.timestamp)}
                                  </span>
                                </div>
                                <p className="text-muted-foreground truncate">
                                  {entry.query}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-xs text-muted-foreground">
                  We couldn't find this in Dr. Sapir's verified materials. You can optionally ask an external AI.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Disclosure:</span> External AI is not verified and requires therapist discretion.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {/* Question with Copy button */}
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                <span className="font-medium text-foreground">{query}</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyQuestion}
                className="h-7 px-2 gap-1 text-xs shrink-0"
                title="Copy question to clipboard"
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                disabled={isLoading}
              >
                Stay in KB only
              </Button>

              {/* AI Provider Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 min-w-[140px] justify-between"
                    disabled={isLoading}
                  >
                    <span className="truncate">{selectedProvider.name}</span>
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {AI_PROVIDERS.map((provider) => (
                    <DropdownMenuItem
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider)}
                      className={`flex flex-col items-start gap-0.5 cursor-pointer ${
                        selectedProvider.id === provider.id ? 'bg-accent' : ''
                      }`}
                    >
                      <span className="font-medium">{provider.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {provider.description}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Audio feedback</span>
                    <Switch 
                      checked={audioEnabled} 
                      onCheckedChange={setAudioEnabled}
                      className="scale-75"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                size="sm"
                onClick={handleUseAI}
                disabled={isLoading}
                className="gap-2 bg-jade hover:bg-jade-600"
              >
                <ExternalLink className="h-4 w-4" />
                {selectedProvider.isInternal ? 'Use AI' : `Open ${selectedProvider.name}`}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
