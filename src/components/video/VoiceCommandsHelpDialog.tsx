import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCommand {
  command: string;
  commandHe?: string;
  description: string;
  category: 'session' | 'navigation' | 'ai' | 'utility';
}

const VOICE_COMMANDS: VoiceCommand[] = [
  // Session controls
  { command: 'Start / התחל', description: 'Start the session timer', category: 'session' },
  { command: 'Stop / עצור', description: 'End the current session', category: 'session' },
  { command: 'Pause / השהה', description: 'Pause the session', category: 'session' },
  { command: 'Resume / המשך', description: 'Resume paused session', category: 'session' },
  { command: 'Reset / איפוס', description: 'Reset and clear session', category: 'session' },
  
  // Navigation
  { command: 'Next / הבא', description: 'Go to next section', category: 'navigation' },
  { command: 'Back / אחורה', description: 'Go to previous section', category: 'navigation' },
  { command: 'Save / שמור', description: 'Save current session', category: 'navigation' },
  { command: 'Calendar / יומן', description: 'Open calendar', category: 'navigation' },
  
  // AI
  { command: 'Diagnose / אבחן', description: 'Open AI diagnosis panel', category: 'ai' },
  { command: 'Summary / סיכום', description: 'Generate session summary', category: 'ai' },
  { command: 'Suggest / הצע', description: 'Get AI suggestions', category: 'ai' },
  { command: 'Brain / מוח', description: 'Open TCM Brain panel', category: 'ai' },
  
  // Utility
  { command: 'Help / עזרה', description: 'Show help guide', category: 'utility' },
  { command: 'Print / הדפס', description: 'Print session report', category: 'utility' },
  { command: 'Share / שתף', description: 'Share via WhatsApp', category: 'utility' },
  { command: 'Music / מוזיקה', description: 'Toggle music player', category: 'utility' },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'S'], description: 'Save session' },
  { keys: ['Ctrl', 'P'], description: 'Print report' },
  { keys: ['Space'], description: 'Play/Pause session' },
  { keys: ['Esc'], description: 'Close dialogs' },
  { keys: ['Ctrl', '1-6'], description: 'Switch tabs' },
];

const categoryColors: Record<string, string> = {
  session: 'bg-jade/20 text-jade border-jade/30',
  navigation: 'bg-blue-500/20 text-blue-600 border-blue-300',
  ai: 'bg-purple-500/20 text-purple-600 border-purple-300',
  utility: 'bg-amber-500/20 text-amber-600 border-amber-300',
};

interface VoiceCommandsHelpDialogProps {
  trigger?: React.ReactNode;
  isListening?: boolean;
  onToggleListening?: () => void;
}

export function VoiceCommandsHelpDialog({ 
  trigger,
  isListening = false,
  onToggleListening,
}: VoiceCommandsHelpDialogProps) {
  const [open, setOpen] = useState(false);

  const groupedCommands = VOICE_COMMANDS.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, VoiceCommand[]>);

  const categoryLabels: Record<string, string> = {
    session: 'Session Controls',
    navigation: 'Navigation',
    ai: 'AI & Diagnosis',
    utility: 'Utilities',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice Commands
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-jade" />
            Voice Commands & Shortcuts
          </DialogTitle>
        </DialogHeader>

        {/* Voice activation toggle */}
        {onToggleListening && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div>
              <p className="font-medium text-sm">Voice Recognition</p>
              <p className="text-xs text-muted-foreground">
                {isListening ? 'Listening for commands...' : 'Click to enable voice commands'}
              </p>
            </div>
            <Button
              variant={isListening ? 'destructive' : 'default'}
              size="sm"
              onClick={onToggleListening}
              className="gap-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        )}

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {/* Voice Commands */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Commands (Hebrew/English)
              </h3>
              <div className="space-y-3">
                {Object.entries(groupedCommands).map(([category, commands]) => (
                  <div key={category}>
                    <Badge variant="outline" className={cn('mb-2', categoryColors[category])}>
                      {categoryLabels[category]}
                    </Badge>
                    <div className="grid gap-1.5">
                      {commands.map((cmd, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                        >
                          <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">
                            "{cmd.command}"
                          </code>
                          <span className="text-xs text-muted-foreground">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </h3>
              <div className="grid gap-1.5">
                {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                  >
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd 
                          key={i}
                          className="px-2 py-0.5 bg-background border rounded text-xs font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <p className="text-xs text-muted-foreground text-center">
          Speak clearly in Hebrew or English. Voice recognition uses Web Speech API.
        </p>
      </DialogContent>
    </Dialog>
  );
}
