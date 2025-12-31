import { useState } from 'react';
import { useLocation } from 'react-router-dom';
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

export function AccessibilityPanel() {
  const location = useLocation();
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  const [open, setOpen] = useState(false);

  // Hide on TCM Brain page (has its own accessibility controls in toolbar)
  if (location.pathname === '/tcm-brain') {
    return null;
  }

  console.log('AccessibilityPanel - highContrast:', highContrast);

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 left-4 z-50 h-12 w-12 rounded-full shadow-elevated bg-card border-primary/30 hover:bg-primary hover:text-primary-foreground"
          aria-label="Accessibility settings"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="end" 
        className="w-64 p-4 bg-card border-border shadow-elevated"
      >
        <div className="space-y-4">
          <h3 className="font-display text-lg text-foreground">נגישות / Accessibility</h3>
          
          {/* Font Size Controls */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">גודל טקסט / Text Size</label>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseFont}
                disabled={currentIndex === 0}
                className="h-9 w-9"
                aria-label="Decrease font size"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-1 flex-1 justify-center">
                {FONT_SIZES.map((s, i) => (
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
                className="h-9 w-9"
                aria-label="Increase font size"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm text-foreground">ניגודיות גבוהה / High Contrast</label>
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
}
