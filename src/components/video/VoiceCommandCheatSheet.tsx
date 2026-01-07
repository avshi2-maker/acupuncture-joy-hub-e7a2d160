import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  Calendar, 
  Users, 
  Video, 
  FileText, 
  Settings, 
  Brain, 
   
  HelpCircle,
  Printer,
  Heart,
  Leaf,
  Activity,
  ThermometerSun,
  Droplets,
  Wind,
  Flame,
  Snowflake,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCommandItem {
  command: string;
  hebrewCommand?: string;
  description: string;
  icon: LucideIcon;
}

interface CommandCategory {
  name: string;
  nameHe: string;
  icon: LucideIcon;
  commands: VoiceCommandItem[];
}

const COMMAND_CATEGORIES: CommandCategory[] = [
  {
    name: 'Session',
    nameHe: 'פגישה',
    icon: Play,
    commands: [
      { command: 'Start', hebrewCommand: 'התחל', description: 'Start session timer', icon: Play },
      { command: 'Stop', hebrewCommand: 'עצור', description: 'End session', icon: Square },
      { command: 'Pause', hebrewCommand: 'השהה', description: 'Pause timer', icon: Pause },
      { command: 'Resume', hebrewCommand: 'המשך', description: 'Resume timer', icon: Play },
      { command: 'Reset', hebrewCommand: 'איפוס', description: 'Reset session', icon: RotateCcw },
      { command: 'Timestamp', hebrewCommand: 'חותמת זמן', description: 'Add time marker', icon: Clock },
      { command: 'Feeling better', hebrewCommand: 'מרגיש טוב', description: 'Add status tag', icon: Heart },
      { command: 'Needs followup', hebrewCommand: 'צריך מעקב', description: 'Mark for follow-up', icon: Calendar },
    ],
  },
  {
    name: 'Navigation',
    nameHe: 'ניווט',
    icon: Calendar,
    commands: [
      { command: 'Calendar', hebrewCommand: 'יומן', description: 'Open appointments', icon: Calendar },
      { command: 'Patient', hebrewCommand: 'מטופל', description: 'Quick patient add', icon: Users },
      { command: 'Zoom', hebrewCommand: 'זום', description: 'Video invite', icon: Video },
      { command: 'Report', hebrewCommand: 'דוח', description: 'Session report', icon: FileText },
      { command: 'Follow up', hebrewCommand: 'מעקב', description: 'Follow-up plan', icon: Calendar },
      { command: 'Settings', hebrewCommand: 'הגדרות', description: 'Open settings', icon: Settings },
      { command: 'Brain', hebrewCommand: 'מוח', description: 'TCM Brain AI', icon: Brain },
      
      { command: 'Help', hebrewCommand: 'עזרה', description: 'Open help', icon: HelpCircle },
      { command: 'Print', hebrewCommand: 'הדפס', description: 'Print report', icon: Printer },
    ],
  },
  {
    name: 'TCM Patterns',
    nameHe: 'דפוסי רפואה סינית',
    icon: Activity,
    commands: [
      { command: 'Qi stagnation', hebrewCommand: 'קי סטגנציה', description: 'Liver Qi stagnation', icon: Activity },
      { command: 'Blood stasis', hebrewCommand: 'סטזיס דם', description: 'Blood stasis pattern', icon: Droplets },
      { command: 'Yin deficiency', hebrewCommand: 'חסר יין', description: 'Yin deficiency', icon: Snowflake },
      { command: 'Yang deficiency', hebrewCommand: 'חסר יאנג', description: 'Yang deficiency', icon: ThermometerSun },
      { command: 'Dampness', hebrewCommand: 'לחות', description: 'Dampness/Phlegm', icon: Droplets },
      { command: 'Heat', hebrewCommand: 'חום', description: 'Heat/Fire pattern', icon: Flame },
      { command: 'Cold', hebrewCommand: 'קור', description: 'Cold pattern', icon: Snowflake },
      { command: 'Wind', hebrewCommand: 'רוח', description: 'Wind pattern', icon: Wind },
    ],
  },
  {
    name: 'Organs',
    nameHe: 'איברים',
    icon: Heart,
    commands: [
      { command: 'Kidney', hebrewCommand: 'כליות', description: 'Kidney involvement', icon: Activity },
      { command: 'Spleen', hebrewCommand: 'טחול', description: 'Spleen Qi deficiency', icon: Activity },
      { command: 'Liver', hebrewCommand: 'כבד', description: 'Liver involvement', icon: Activity },
      { command: 'Heart', hebrewCommand: 'לב', description: 'Heart involvement', icon: Heart },
      { command: 'Lung', hebrewCommand: 'ריאות', description: 'Lung involvement', icon: Wind },
    ],
  },
  {
    name: 'Treatments',
    nameHe: 'טיפולים',
    icon: Leaf,
    commands: [
      { command: 'Acupuncture', hebrewCommand: 'דיקור', description: 'Needling applied', icon: Activity },
      { command: 'Moxa', hebrewCommand: 'מוקסה', description: 'Moxibustion', icon: Flame },
      { command: 'Cupping', hebrewCommand: 'כוסות רוח', description: 'Cupping therapy', icon: Activity },
      { command: 'Tuina', hebrewCommand: 'טואינה', description: 'Massage applied', icon: Activity },
      { command: 'Herbs', hebrewCommand: 'צמחים', description: 'Herbal formula', icon: Leaf },
    ],
  },
  {
    name: 'Diagnosis',
    nameHe: 'אבחון',
    icon: Activity,
    commands: [
      { command: 'Pulse wiry', hebrewCommand: 'דופק מתוח', description: 'Wiry pulse (弦)', icon: Activity },
      { command: 'Pulse slippery', hebrewCommand: 'דופק חלק', description: 'Slippery pulse (滑)', icon: Activity },
      { command: 'Pulse weak', hebrewCommand: 'דופק חלש', description: 'Weak pulse (虚)', icon: Activity },
      { command: 'Tongue pale', hebrewCommand: 'לשון חיוורת', description: 'Pale tongue body', icon: Activity },
      { command: 'Tongue red', hebrewCommand: 'לשון אדומה', description: 'Red tongue (Heat)', icon: Activity },
      { command: 'Thick coating', hebrewCommand: 'ציפוי עבה', description: 'Greasy coating', icon: Activity },
    ],
  },
  {
    name: 'Recording',
    nameHe: 'הקלטה',
    icon: Mic,
    commands: [
      { command: 'Start recording', hebrewCommand: 'התחל הקלטה', description: 'Begin recording', icon: Mic },
      { command: 'Stop recording', hebrewCommand: 'עצור הקלטה', description: 'End recording', icon: Square },
    ],
  },
];

interface VoiceCommandCheatSheetProps {
  isListening?: boolean;
  onToggleVoice?: () => void;
  className?: string;
}

export function VoiceCommandCheatSheet({ 
  isListening = false, 
  onToggleVoice,
  className 
}: VoiceCommandCheatSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-2", className)}
        >
          <Mic className={cn("h-4 w-4", isListening && "text-green-500 animate-pulse")} />
          <span className="hidden sm:inline">Voice Commands</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0">
        <SheetHeader className="p-4 border-b bg-muted/50">
          <SheetTitle className="flex items-center gap-2">
            <Mic className={cn("h-5 w-5", isListening && "text-green-500 animate-pulse")} />
            Voice Command Cheat Sheet
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Say any command to control the session
          </p>
          {onToggleVoice && (
            <Button 
              onClick={onToggleVoice}
              variant={isListening ? "destructive" : "default"}
              size="sm"
              className="mt-2"
            >
              {isListening ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          )}
        </SheetHeader>
        
        <Tabs defaultValue="Session" className="h-[calc(100vh-180px)]">
          <TabsList className="w-full justify-start overflow-x-auto px-4 pt-2 h-auto flex-wrap gap-1">
            {COMMAND_CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category.name} 
                value={category.name}
                className="text-xs px-2 py-1"
              >
                <category.icon className="h-3 w-3 mr-1" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="h-full">
            {COMMAND_CATEGORIES.map((category) => (
              <TabsContent 
                key={category.name} 
                value={category.name} 
                className="p-4 space-y-2 mt-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">{category.nameHe}</Badge>
                </div>
                
                <div className="space-y-2">
                  {category.commands.map((cmd) => (
                    <div 
                      key={cmd.command}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <cmd.icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            "{cmd.command}"
                          </Badge>
                          {cmd.hebrewCommand && (
                            <Badge variant="secondary" className="font-mono text-xs" dir="rtl">
                              "{cmd.hebrewCommand}"
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cmd.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
