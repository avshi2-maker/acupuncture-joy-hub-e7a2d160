import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, X, ChevronDown, Copy, Check } from 'lucide-react';
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
  url?: string;
  isInternal: boolean;
}

const AI_PROVIDERS: AIProviderOption[] = [
  { 
    id: 'lovable-gemini', 
    name: 'Lovable AI (Gemini)', 
    description: 'Internal - stays in module',
    isInternal: true 
  },
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    description: 'Opens OpenAI ChatGPT',
    url: 'https://chatgpt.com',
    isInternal: false 
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    description: 'Opens Anthropic Claude',
    url: 'https://claude.ai',
    isInternal: false 
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    description: 'Opens Perplexity AI',
    url: 'https://perplexity.ai',
    isInternal: false 
  },
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    description: 'Opens Google Gemini',
    url: 'https://gemini.google.com',
    isInternal: false 
  },
];

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
      toast.success('Question copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleUseAI = () => {
    if (selectedProvider.isInternal) {
      onUseExternalAI(selectedProvider.id);
    } else if (selectedProvider.url) {
      const encodedQuery = encodeURIComponent(query);
      let targetUrl = selectedProvider.url;
      
      if (selectedProvider.id === 'chatgpt') {
        targetUrl = `https://chatgpt.com/?q=${encodedQuery}`;
      } else if (selectedProvider.id === 'perplexity') {
        targetUrl = `https://perplexity.ai/search?q=${encodedQuery}`;
      } else if (selectedProvider.id === 'gemini') {
        targetUrl = `https://gemini.google.com/app?q=${encodedQuery}`;
      } else if (selectedProvider.id === 'claude') {
        targetUrl = 'https://claude.ai/new';
      }
      
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      onDismiss();
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(620px,calc(100vw-2rem))] -translate-x-1/2">
      <Card className="border-2 border-destructive/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">No match in proprietary knowledge base</p>
                  <Badge variant="destructive" className="text-[10px]">External option</Badge>
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
              onClick={onDismiss}
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
                onClick={onDismiss}
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
                      onClick={() => setSelectedProvider(provider)}
                      className="flex flex-col items-start gap-0.5 cursor-pointer"
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
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {selectedProvider.isInternal ? 'Use AI' : 'Open'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
