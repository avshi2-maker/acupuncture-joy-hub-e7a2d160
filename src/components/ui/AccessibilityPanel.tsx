import { useState, forwardRef } from 'react';
import { Accessibility, Plus, Minus, Eye } from 'lucide-react';
import { Button } from './button';
import { Switch } from './switch';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

const FONT_SIZES = [
  { value: 'small', label: 'A', size: 'text-sm' },
  { value: 'medium', label: 'A', size: 'text-base' },
  { value: 'large', label: 'A', size: 'text-lg' },
  { value: 'xlarge', label: 'A', size: 'text-xl' },
] as const;

interface AccessibilityPanelProps {
  /** If true, renders inline (for headers). Otherwise hidden (no floating button) */
  inline?: boolean;
}

export const AccessibilityPanel = forwardRef<HTMLDivElement, AccessibilityPanelProps>(
  function AccessibilityPanel({ inline = false }, ref) {
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  const [open, setOpen] = useState(false);

  const currentIndex = FONT_SIZES.findIndex(s => s.value === fontSize);

  const decreaseFont = () => {
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1].value);
    }
  };

  const increaseFont = () => {
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1].value);
    }
  };

  // If not inline mode, don't render the floating button anymore
  if (!inline) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Accessibility settings"
          title="Accessibility"
        >
          <Accessibility className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="end" 
        className="w-64 p-4 bg-popover border-border shadow-elevated z-50"
      >
        <div className="space-y-4">
          <h3 className="font-display text-sm font-medium">Accessibility</h3>
          
          {/* Font Size Controls */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Text Size</label>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseFont}
                disabled={currentIndex === 0}
                className="h-8 w-8"
                aria-label="Decrease font size"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <div className="flex gap-1 flex-1 justify-center">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFontSize(s.value)}
                    className={`px-2 py-1 rounded transition-colors ${s.size} ${
                      fontSize === s.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                    aria-label={`Set font size to ${s.value}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={increaseFont}
                disabled={currentIndex === FONT_SIZES.length - 1}
                className="h-8 w-8"
                aria-label="Increase font size"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm">High Contrast</label>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

AccessibilityPanel.displayName = 'AccessibilityPanel';
