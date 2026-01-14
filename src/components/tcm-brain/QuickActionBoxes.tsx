import { useState, useEffect, useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Stethoscope,
  ClipboardList,
  FileText,
  Pill,
  Activity,
  Brain,
  Settings,
  GripVertical,
  Check,
  Sparkles,
  Heart,
  Zap,
  Shield,
  Target,
  Lightbulb,
  BookOpen,
  Wand2,
  ScrollText,
  ClipboardCheck,
  Plus,
  Trash2,
  Edit2,
  Star,
  Flame,
  Moon,
  Sun,
  Cloud,
  Droplet,
  Wind,
  Leaf,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export interface QuickActionBox {
  id: string;
  name: string;
  nameHe: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  prompt: string;
  description: string;
  isCustom?: boolean;
}

interface CustomActionData {
  id: string;
  name: string;
  nameHe: string;
  iconName: string;
  colorName: string;
  prompt: string;
  description: string;
}

// Icon and color options for custom actions
const ICON_OPTIONS: { name: string; icon: React.ElementType }[] = [
  { name: 'star', icon: Star },
  { name: 'flame', icon: Flame },
  { name: 'heart', icon: Heart },
  { name: 'moon', icon: Moon },
  { name: 'sun', icon: Sun },
  { name: 'cloud', icon: Cloud },
  { name: 'droplet', icon: Droplet },
  { name: 'wind', icon: Wind },
  { name: 'leaf', icon: Leaf },
  { name: 'sparkles', icon: Sparkles },
  { name: 'brain', icon: Brain },
  { name: 'zap', icon: Zap },
];

const COLOR_OPTIONS = [
  { name: 'blue', color: 'text-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { name: 'emerald', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  { name: 'amber', color: 'text-amber-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { name: 'purple', color: 'text-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  { name: 'rose', color: 'text-rose-600', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
  { name: 'cyan', color: 'text-cyan-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  { name: 'orange', color: 'text-orange-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  { name: 'indigo', color: 'text-indigo-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30' },
  { name: 'teal', color: 'text-teal-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30' },
  { name: 'pink', color: 'text-pink-600', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
];

// Built-in action boxes
const BUILTIN_ACTION_BOXES: QuickActionBox[] = [
  {
    id: 'pattern-id',
    name: 'Pattern ID',
    nameHe: 'זיהוי דפוס',
    icon: Wand2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    prompt: 'Based on the patient symptoms and presentation, provide a quick TCM pattern diagnosis with confidence level.',
    description: 'Instant pattern identification'
  },
  {
    id: 'protocol-gen',
    name: 'Protocol Gen',
    nameHe: 'יצירת פרוטוקול',
    icon: ClipboardList,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    prompt: 'Generate a comprehensive TCM treatment plan including acupuncture points, herbal formulas, and lifestyle recommendations.',
    description: 'Full treatment protocol'
  },
  {
    id: 'auto-notes',
    name: 'Auto Notes',
    nameHe: 'הערות אוטו',
    icon: ScrollText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    prompt: 'Generate professional session notes summarizing today\'s consultation, findings, and treatment provided.',
    description: 'Auto-generate clinical notes'
  },
  {
    id: 'herbal-rx',
    name: 'Herbal Rx',
    nameHe: 'מרשם צמחי',
    icon: Pill,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    prompt: 'Recommend appropriate Chinese herbal formulas based on the diagnosed pattern, with dosage and modifications.',
    description: 'Herbal prescription helper'
  },
  {
    id: 'acu-points',
    name: 'Acu Points',
    nameHe: 'נקודות דיקור',
    icon: Target,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    prompt: 'Suggest optimal acupuncture point combinations for the current presentation with needling techniques.',
    description: 'Acupoint recommendations'
  },
  {
    id: 'patient-handout',
    name: 'Patient Handout',
    nameHe: 'דף למטופל',
    icon: Lightbulb,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    prompt: 'Create patient-friendly education materials explaining their condition and self-care recommendations.',
    description: 'Patient education materials'
  },
  {
    id: 'intake-review',
    name: 'Intake Review',
    nameHe: 'סקירת קליטה',
    icon: ClipboardCheck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    prompt: '__INTAKE_REVIEW__',
    description: 'Review intake form with patient'
  },
  {
    id: 'diff-patterns',
    name: 'Diff Patterns',
    nameHe: 'דפוסים מבדילים',
    icon: Brain,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    prompt: 'Provide differential diagnosis considering multiple TCM patterns that could explain the presentation.',
    description: 'Pattern differentiation'
  },
  {
    id: 'next-steps',
    name: 'Next Steps',
    nameHe: 'צעדים הבאים',
    icon: Activity,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    prompt: 'Create a follow-up treatment plan with recommended visit frequency and progression milestones.',
    description: 'Follow-up planning'
  },
  {
    id: 'safety-check',
    name: 'Safety Check',
    nameHe: 'בדיקת בטיחות',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    prompt: 'Assess potential risks, contraindications, and safety considerations for the proposed treatment.',
    description: 'Risk assessment'
  },
  {
    id: 'case-report',
    name: 'Case Report',
    nameHe: 'דוח מקרה',
    icon: BookOpen,
    color: 'text-slate-600',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    prompt: 'Generate a comprehensive case summary suitable for medical records or referral letters.',
    description: 'Documentation export'
  },
  {
    id: 'ai-second-opinion',
    name: 'AI 2nd Opinion',
    nameHe: 'דעה שנייה AI',
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    prompt: 'Provide an AI second opinion on the diagnosis and treatment approach with evidence-based recommendations.',
    description: 'AI consultation'
  },
  {
    id: 'wellness-plan',
    name: 'Wellness Plan',
    nameHe: 'תוכנית בריאות',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    prompt: 'Generate personalized lifestyle, diet, and exercise recommendations based on TCM principles.',
    description: 'Lifestyle guidance'
  },
];

const STORAGE_KEY = 'tcm-brain-quick-action-boxes-v2';
const CUSTOM_ACTIONS_KEY = 'tcm-brain-custom-actions';
const DEFAULT_BOXES = ['pattern-id', 'protocol-gen', 'auto-notes', 'herbal-rx', 'acu-points', 'patient-handout'];

interface QuickActionBoxesProps {
  onActionClick: (prompt: string, actionName: string) => void;
  isLoading?: boolean;
}

// Draggable item component
function DraggableActionBox({ 
  box, 
  isLoading, 
  onActionClick 
}: { 
  box: QuickActionBox; 
  isLoading?: boolean;
  onActionClick: () => void;
}) {
  const Icon = box.icon;
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={box.id}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
      whileDrag={{ scale: 1.05, zIndex: 50 }}
    >
      <div className="relative group">
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute -top-1 -left-1 z-10 w-5 h-5 rounded-full bg-muted/80 border border-border flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Custom badge */}
        {box.isCustom && (
          <div className="absolute -top-1 -right-1 z-10">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          </div>
        )}

        <button
          onClick={onActionClick}
          disabled={isLoading}
          className={cn(
            'w-full flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
            'hover:shadow-lg',
            box.bgColor,
            box.borderColor,
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'bg-background/80 shadow-sm group-hover:shadow-md transition-all'
          )}>
            <Icon className={cn('h-5 w-5', box.color)} />
          </div>
          <div className="text-center">
            <p className={cn('text-xs font-bold leading-tight', box.color)}>
              {box.name}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5" dir="rtl">
              {box.nameHe}
            </p>
          </div>
        </button>
      </div>
    </Reorder.Item>
  );
}

// Custom action form component
function CustomActionForm({ 
  onSave, 
  onCancel,
  editingAction 
}: { 
  onSave: (action: CustomActionData) => void; 
  onCancel: () => void;
  editingAction?: CustomActionData | null;
}) {
  const [name, setName] = useState(editingAction?.name || '');
  const [nameHe, setNameHe] = useState(editingAction?.nameHe || '');
  const [prompt, setPrompt] = useState(editingAction?.prompt || '');
  const [description, setDescription] = useState(editingAction?.description || '');
  const [selectedIcon, setSelectedIcon] = useState(editingAction?.iconName || 'star');
  const [selectedColor, setSelectedColor] = useState(editingAction?.colorName || 'blue');

  const handleSubmit = () => {
    if (!name.trim() || !prompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }
    onSave({
      id: editingAction?.id || `custom-${Date.now()}`,
      name: name.trim(),
      nameHe: nameHe.trim() || name.trim(),
      iconName: selectedIcon,
      colorName: selectedColor,
      prompt: prompt.trim(),
      description: description.trim() || 'Custom action'
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Name (English)</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="My Action"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Name (Hebrew)</Label>
          <Input 
            value={nameHe} 
            onChange={(e) => setNameHe(e.target.value)} 
            placeholder="הפעולה שלי"
            className="h-8 text-sm"
            dir="rtl"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Description</Label>
        <Input 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Short description"
          className="h-8 text-sm"
        />
      </div>

      <div>
        <Label className="text-xs">Prompt</Label>
        <Textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Enter the AI prompt for this action..."
          className="text-sm min-h-[80px]"
        />
      </div>

      <div>
        <Label className="text-xs mb-2 block">Icon</Label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map(({ name: iconName, icon: IconComp }) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setSelectedIcon(iconName)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all',
                selectedIcon === iconName 
                  ? 'border-primary bg-primary/10' 
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <IconComp className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Color</Label>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map((colorOpt) => (
            <button
              key={colorOpt.name}
              type="button"
              onClick={() => setSelectedColor(colorOpt.name)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all',
                colorOpt.bgColor,
                selectedColor === colorOpt.name 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <div className={cn('w-4 h-4 rounded-full', colorOpt.color.replace('text-', 'bg-'))} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} className="flex-1">
          {editingAction ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

// Convert custom action data to QuickActionBox
function customDataToBox(data: CustomActionData): QuickActionBox {
  const iconOption = ICON_OPTIONS.find(i => i.name === data.iconName) || ICON_OPTIONS[0];
  const colorOption = COLOR_OPTIONS.find(c => c.name === data.colorName) || COLOR_OPTIONS[0];
  
  return {
    id: data.id,
    name: data.name,
    nameHe: data.nameHe,
    icon: iconOption.icon,
    color: colorOption.color,
    bgColor: colorOption.bgColor,
    borderColor: colorOption.borderColor,
    prompt: data.prompt,
    description: data.description,
    isCustom: true
  };
}

export function QuickActionBoxes({ onActionClick, isLoading }: QuickActionBoxesProps) {
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_BOXES;
    } catch {
      return DEFAULT_BOXES;
    }
  });
  
  const [customActions, setCustomActions] = useState<CustomActionData[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_ACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAction, setEditingAction] = useState<CustomActionData | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedBoxIds));
  }, [selectedBoxIds]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_ACTIONS_KEY, JSON.stringify(customActions));
  }, [customActions]);

  // Combine builtin and custom actions
  const ALL_ACTION_BOXES: QuickActionBox[] = [
    ...BUILTIN_ACTION_BOXES,
    ...customActions.map(customDataToBox)
  ];

  const selectedBoxes = selectedBoxIds
    .map(id => ALL_ACTION_BOXES.find(b => b.id === id))
    .filter(Boolean) as QuickActionBox[];

  const toggleBox = (id: string) => {
    setSelectedBoxIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(bid => bid !== id);
      }
      if (prev.length >= 6) {
        toast.warning('Maximum 6 boxes allowed. Remove one first.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleBoxClick = useCallback((box: QuickActionBox) => {
    if (isLoading) return;
    onActionClick(box.prompt, box.name);
  }, [isLoading, onActionClick]);

  const handleReorder = useCallback((newOrder: string[]) => {
    setSelectedBoxIds(newOrder);
  }, []);

  const handleSaveCustomAction = (action: CustomActionData) => {
    setCustomActions(prev => {
      const existing = prev.findIndex(a => a.id === action.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = action;
        return updated;
      }
      return [...prev, action];
    });
    setShowCreateForm(false);
    setEditingAction(null);
    toast.success(editingAction ? 'Custom action updated' : 'Custom action created');
  };

  const handleDeleteCustomAction = (id: string) => {
    setCustomActions(prev => prev.filter(a => a.id !== id));
    setSelectedBoxIds(prev => prev.filter(bid => bid !== id));
    toast.success('Custom action deleted');
  };

  return (
    <div className="space-y-3">
      {/* Header with Configure Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-jade" />
          <span className="text-xs font-semibold text-muted-foreground">Quick Actions</span>
          <Badge variant="outline" className="text-[10px]">
            {selectedBoxes.length}/6
          </Badge>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            (drag to reorder)
          </span>
        </div>
        <Dialog open={isConfigOpen} onOpenChange={(open) => {
          setIsConfigOpen(open);
          if (!open) {
            setShowCreateForm(false);
            setEditingAction(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configure Quick Actions
              </DialogTitle>
            </DialogHeader>

            {showCreateForm || editingAction ? (
              <div className="py-2">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {editingAction ? 'Edit Custom Action' : 'Create Custom Action'}
                </h3>
                <CustomActionForm
                  onSave={handleSaveCustomAction}
                  onCancel={() => {
                    setShowCreateForm(false);
                    setEditingAction(null);
                  }}
                  editingAction={editingAction}
                />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Select up to 6 quick actions. Drag boxes to reorder on the main screen.
                </p>

                {/* Selection Preview */}
                {selectedBoxes.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Current Selection</span>
                      <Badge variant="secondary" className="text-[10px]">{selectedBoxes.length}/6</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBoxes.map((box, idx) => {
                        const Icon = box.icon;
                        return (
                          <div
                            key={box.id}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
                              box.bgColor, box.borderColor, 'border'
                            )}
                          >
                            <span className="text-muted-foreground text-[10px]">{idx + 1}.</span>
                            <Icon className={cn('h-3 w-3', box.color)} />
                            <span className={cn('font-medium', box.color)}>{box.name}</span>
                            {box.isCustom && <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />}
                            <button 
                              onClick={() => toggleBox(box.id)}
                              className="ml-0.5 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Actions Section */}
                {customActions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        Your Custom Actions
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {customActions.map(action => {
                        const box = customDataToBox(action);
                        const isSelected = selectedBoxIds.includes(box.id);
                        const Icon = box.icon;
                        return (
                          <div
                            key={box.id}
                            className={cn(
                              'relative flex items-center gap-2 p-2 rounded-lg border-2 transition-all',
                              isSelected 
                                ? `${box.bgColor} ${box.borderColor}` 
                                : 'bg-muted/30 border-transparent hover:border-muted-foreground/20'
                            )}
                          >
                            <button
                              onClick={() => toggleBox(box.id)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center',
                                isSelected ? box.bgColor : 'bg-muted'
                              )}>
                                <Icon className={cn('h-3.5 w-3.5', isSelected ? box.color : 'text-muted-foreground')} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn('text-xs font-semibold', isSelected && box.color)}>
                                  {box.name}
                                </p>
                                <p className="text-[9px] text-muted-foreground truncate">
                                  {box.description}
                                </p>
                              </div>
                            </button>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingAction(action)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Edit2 className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomAction(action.id)}
                                className="p-1 hover:bg-destructive/10 rounded"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                            {isSelected && (
                              <Check className={cn('h-4 w-4 absolute top-1 right-1', box.color)} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Built-in Actions */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Built-in Actions</span>
                  <ScrollArea className="h-[250px] pr-3">
                    <div className="grid grid-cols-2 gap-2">
                      {BUILTIN_ACTION_BOXES.map(box => {
                        const isSelected = selectedBoxIds.includes(box.id);
                        const Icon = box.icon;
                        return (
                          <button
                            key={box.id}
                            onClick={() => toggleBox(box.id)}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left',
                              isSelected 
                                ? `${box.bgColor} ${box.borderColor}` 
                                : 'bg-muted/30 border-transparent hover:border-muted-foreground/20'
                            )}
                          >
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center',
                              isSelected ? box.bgColor : 'bg-muted'
                            )}>
                              <Icon className={cn('h-3.5 w-3.5', isSelected ? box.color : 'text-muted-foreground')} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-xs font-semibold', isSelected && box.color)}>
                                {box.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground truncate">
                                {box.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className={cn('h-4 w-4 flex-shrink-0', box.color)} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBoxIds([...DEFAULT_BOXES]);
                        toast.success('Reset to default actions');
                      }}
                    >
                      Reset to Default
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateForm(true)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Create Custom
                    </Button>
                  </div>
                  <Button size="sm" onClick={() => setIsConfigOpen(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Action Grid with Drag & Drop */}
      <Reorder.Group
        axis="x"
        values={selectedBoxIds}
        onReorder={handleReorder}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2"
      >
        {selectedBoxes.map((box) => (
          <DraggableActionBox
            key={box.id}
            box={box}
            isLoading={isLoading}
            onActionClick={() => handleBoxClick(box)}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
