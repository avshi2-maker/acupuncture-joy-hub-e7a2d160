import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ExternalLink, X, ChevronDown, Copy, Check, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export type ExternalAIProvider = 'lovable-gemini' | 'chatgpt' | 'claude' | 'perplexity' | 'gemini';

const PREFERRED_PROVIDER_KEY = 'tcm-preferred-ai-provider';

interface AIProviderOption {
  id: ExternalAIProvider;
  name: string;
  description: string;
  baseUrl: string;
  isInternal: boolean;
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
    id: 'chatgpt', 
    name: 'ChatGPT', 
    description: 'Opens OpenAI ChatGPT',
    baseUrl: 'https://chatgpt.com',
    isInternal: false 
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    description: 'Opens Anthropic Claude',
    baseUrl: 'https://claude.ai/new',
    isInternal: false 
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    description: 'Opens Perplexity AI',
    baseUrl: 'https://www.perplexity.ai',
    isInternal: false 
  },
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    description: 'Opens Google Gemini',
    baseUrl: 'https://gemini.google.com/app',
    isInternal: false 
  },
];

// Audio feedback utilities
const playSound = (type: 'click' | 'success' | 'warning' | 'error') => {
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
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.value = 0.15;
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.value = 659.25; // E5
        }, 100);
        setTimeout(() => {
          oscillator.frequency.value = 783.99; // G5
        }, 200);
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

  // Play warning sound when card appears
  useEffect(() => {
    playSound('warning');
    triggerHaptic('medium');
  }, []);

  // Save preference when changed
  useEffect(() => {
    try {
      localStorage.setItem(PREFERRED_PROVIDER_KEY, selectedProvider.id);
    } catch {}
  }, [selectedProvider]);

  const handleCopyQuestion = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      playSound('success');
      triggerHaptic('success');
      toast.success('Question copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      playSound('error');
      triggerHaptic('error');
      toast.error('Failed to copy');
    }
  };

  const handleProviderSelect = (provider: AIProviderOption) => {
    setSelectedProvider(provider);
    playSound('click');
    triggerHaptic('light');
    toast.info(`Selected: ${provider.name}`);
  };

  const openExternalUrl = useCallback((provider: AIProviderOption) => {
    const encodedQuery = encodeURIComponent(query);
    let targetUrl = provider.baseUrl;
    
    console.log('[ExternalAI] Opening provider:', provider.id, 'Query:', query);
    
    // Build the URL with query parameter where supported
    switch (provider.id) {
      case 'chatgpt':
        // ChatGPT doesn't support query params, just open it
        targetUrl = 'https://chatgpt.com';
        break;
      case 'perplexity':
        targetUrl = `https://www.perplexity.ai/search?q=${encodedQuery}`;
        break;
      case 'gemini':
        targetUrl = 'https://gemini.google.com/app';
        break;
      case 'claude':
        targetUrl = 'https://claude.ai/new';
        break;
    }
    
    console.log('[ExternalAI] Opening URL:', targetUrl);
    
    // Open in new tab
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    
    if (newWindow) {
      playSound('success');
      triggerHaptic('success');
      toast.success(`Opening ${provider.name}... Question copied!`, {
        description: 'Paste the question in the chat'
      });
      
      // Also copy the question to clipboard for easy pasting
      navigator.clipboard.writeText(query).catch(() => {});
    } else {
      playSound('error');
      triggerHaptic('error');
      toast.error('Popup blocked! Please allow popups for this site.', {
        action: {
          label: 'Copy Link',
          onClick: () => {
            navigator.clipboard.writeText(targetUrl);
            toast.success('Link copied!');
          }
        }
      });
    }
  }, [query]);

  const handleUseAI = () => {
    console.log('[ExternalAI] handleUseAI called, provider:', selectedProvider.id, 'isInternal:', selectedProvider.isInternal);
    
    if (selectedProvider.isInternal) {
      playSound('click');
      triggerHaptic('medium');
      onUseExternalAI(selectedProvider.id);
    } else {
      openExternalUrl(selectedProvider);
      onDismiss();
    }
  };

  const handleDismiss = () => {
    playSound('click');
    triggerHaptic('light');
    onDismiss();
  };

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(620px,calc(100vw-2rem))] -translate-x-1/2">
      <Card className="border-2 border-destructive/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-lg animate-in slide-in-from-bottom-4">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">No match in proprietary knowledge base</p>
                  <Badge variant="destructive" className="text-[10px]">External option</Badge>
                  <span title="Audio feedback enabled"><Volume2 className="h-3 w-3 text-muted-foreground" /></span>
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
