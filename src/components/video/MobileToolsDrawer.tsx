import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Brain, 
  Calendar, 
  FileText, 
  Heart, 
  Leaf,
  Apple,
  Stethoscope,
  ClipboardList,
  Video,
  Settings,
  Sparkles,
  MoreHorizontal,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileToolsDrawerProps {
  onVoiceDictation: () => void;
  onAIQuery: (type: string) => void;
  onAnxietyQA: () => void;
  onFollowUpPlan: () => void;
  onQuickAppointment: () => void;
  onZoomInvite: () => void;
  onSessionReport: () => void;
  onSettings: () => void;
  disabled?: {
    sessionReport?: boolean;
  };
}

export function MobileToolsDrawer({
  onVoiceDictation,
  onAIQuery,
  onAnxietyQA,
  onFollowUpPlan,
  onQuickAppointment,
  onZoomInvite,
  onSessionReport,
  onSettings,
  disabled = {},
}: MobileToolsDrawerProps) {
  const [open, setOpen] = useState(false);
  const haptic = useHapticFeedback();
  const navigate = useNavigate();

  const handleAction = (action: () => void) => {
    haptic.light();
    setOpen(false);
    setTimeout(action, 150); // Small delay for drawer animation
  };

  const toolGroups = [
    {
      title: 'AI & Voice',
      tools: [
        { icon: Mic, label: 'Voice Dictation', color: 'text-amber-600 bg-amber-50', action: onVoiceDictation },
        { icon: Sparkles, label: 'AI Query', color: 'text-jade bg-jade/10', action: () => onAIQuery('nutrition') },
        { icon: Heart, label: 'Anxiety Q&A', color: 'text-rose-600 bg-rose-50', action: onAnxietyQA },
        { icon: Brain, label: 'TCM Brain', color: 'text-purple-600 bg-purple-50', action: () => onAIQuery('diagnosis') },
      ],
    },
    {
      title: 'TCM Topics',
      tools: [
        { icon: BookOpen, label: 'CAF Studies', color: 'text-jade bg-jade/10', action: () => navigate('/caf-browser') },
        { icon: Leaf, label: 'Herbs', color: 'text-amber-700 bg-amber-50', action: () => onAIQuery('herbs') },
        { icon: Apple, label: 'Nutrition', color: 'text-green-600 bg-green-50', action: () => onAIQuery('nutrition') },
        { icon: Stethoscope, label: 'Diagnosis', color: 'text-purple-600 bg-purple-50', action: () => onAIQuery('diagnosis') },
      ],
    },
    {
      title: 'Session Tools',
      tools: [
        { icon: ClipboardList, label: 'Follow-Up Plan', color: 'text-jade bg-jade/10', action: onFollowUpPlan },
        { icon: Calendar, label: 'Appointment', color: 'text-blue-600 bg-blue-50', action: onQuickAppointment },
        { icon: Video, label: 'Zoom Invite', color: 'text-blue-600 bg-blue-50', action: onZoomInvite },
        { icon: FileText, label: 'AI Report', color: 'text-indigo-600 bg-indigo-50', action: onSessionReport, disabled: disabled.sessionReport },
      ],
    },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-12 w-12 rounded-full shadow-lg bg-jade text-white hover:bg-jade/90 border-0 touch-manipulation"
          onClick={() => haptic.medium()}
        >
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg">Quick Tools</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAction(onSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          {toolGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {group.tools.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => handleAction(tool.action)}
                    disabled={tool.disabled}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all
                      ${tool.color}
                      ${tool.disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 hover:opacity-80'}
                      touch-manipulation
                    `}
                  >
                    <tool.icon className="h-6 w-6" />
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Safe area spacer */}
        <div className="h-safe-area-inset-bottom" />
      </DrawerContent>
    </Drawer>
  );
}
