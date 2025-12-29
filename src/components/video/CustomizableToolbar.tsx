import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Apple, 
  Heart, 
  Moon, 
  Briefcase, 
  Activity, 
  Dumbbell, 
  Compass, 
  Star, 
  MapPin, 
  Stethoscope,
  GripVertical,
  Settings2,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export type ToolbarItemId = 'herbs' | 'nutrition' | 'mental' | 'sleep' | 'worklife' | 'wellness' | 'sports' | 'bazi' | 'astro' | 'points' | 'diagnosis';

interface ToolbarItem {
  id: ToolbarItemId;
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const allToolbarItems: ToolbarItem[] = [
  { id: 'herbs', icon: Leaf, label: 'Herbs', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'mental', icon: Heart, label: 'Mental', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { id: 'sleep', icon: Moon, label: 'Sleep', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'worklife', icon: Briefcase, label: 'Balance', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  { id: 'wellness', icon: Activity, label: 'Wellness', color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { id: 'sports', icon: Dumbbell, label: 'Sports', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'bazi', icon: Compass, label: 'Bazi', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'astro', icon: Star, label: 'Astrology', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  { id: 'points', icon: MapPin, label: 'Points', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'diagnosis', icon: Stethoscope, label: 'Diagnosis', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
];

const STORAGE_KEY = 'tcm-toolbar-order';
const VISIBLE_KEY = 'tcm-toolbar-visible';

interface CustomizableToolbarProps {
  activeQuery: ToolbarItemId | null;
  onQueryChange: (query: ToolbarItemId | null) => void;
  className?: string;
}

export function CustomizableToolbar({ activeQuery, onQueryChange, className }: CustomizableToolbarProps) {
  const haptic = useHapticFeedback();
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<ToolbarItem[]>(allToolbarItems);
  const [visibleIds, setVisibleIds] = useState<Set<ToolbarItemId>>(new Set(allToolbarItems.map(i => i.id)));
  const [draggedItem, setDraggedItem] = useState<ToolbarItemId | null>(null);

  // Load saved order and visibility
  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    const savedVisible = localStorage.getItem(VISIBLE_KEY);
    
    if (savedOrder) {
      try {
        const order: ToolbarItemId[] = JSON.parse(savedOrder);
        const orderedItems = order
          .map(id => allToolbarItems.find(item => item.id === id))
          .filter(Boolean) as ToolbarItem[];
        // Add any new items not in saved order
        allToolbarItems.forEach(item => {
          if (!order.includes(item.id)) orderedItems.push(item);
        });
        setItems(orderedItems);
      } catch (e) {
        console.error('Failed to parse toolbar order:', e);
      }
    }
    
    if (savedVisible) {
      try {
        const visible: ToolbarItemId[] = JSON.parse(savedVisible);
        setVisibleIds(new Set(visible));
      } catch (e) {
        console.error('Failed to parse toolbar visibility:', e);
      }
    }
  }, []);

  // Save order and visibility
  const saveConfig = (newItems: ToolbarItem[], newVisible: Set<ToolbarItemId>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map(i => i.id)));
    localStorage.setItem(VISIBLE_KEY, JSON.stringify(Array.from(newVisible)));
  };

  const handleDragStart = (id: ToolbarItemId) => {
    setDraggedItem(id);
    haptic.light();
  };

  const handleDragOver = (e: React.DragEvent, targetId: ToolbarItemId) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
    
    const newItems = [...items];
    const draggedIndex = newItems.findIndex(i => i.id === draggedItem);
    const targetIndex = newItems.findIndex(i => i.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      setItems(newItems);
    }
  };

  const handleDragEnd = () => {
    if (draggedItem) {
      saveConfig(items, visibleIds);
      haptic.success();
    }
    setDraggedItem(null);
  };

  const toggleVisibility = (id: ToolbarItemId) => {
    haptic.light();
    const newVisible = new Set(visibleIds);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleIds(newVisible);
    saveConfig(items, newVisible);
  };

  const visibleItems = items.filter(item => visibleIds.has(item.id));

  return (
    <div className={cn("relative", className)}>
      {/* Edit Mode Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-1 -top-1 h-6 w-6 z-10 rounded-full bg-muted/80"
        onClick={() => {
          setIsEditing(!isEditing);
          haptic.light();
        }}
      >
        {isEditing ? <Check className="h-3 w-3" /> : <Settings2 className="h-3 w-3" />}
      </Button>

      {/* Toolbar Items */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap">
        {(isEditing ? items : visibleItems).map((item) => {
          const Icon = item.icon;
          const isActive = activeQuery === item.id;
          const isVisible = visibleIds.has(item.id);
          
          return (
            <div
              key={item.id}
              draggable={isEditing}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative flex-shrink-0",
                draggedItem === item.id && "opacity-50"
              )}
            >
              <Button 
                variant={isActive ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => {
                  if (isEditing) {
                    toggleVisibility(item.id);
                  } else {
                    onQueryChange(isActive ? null : item.id);
                    haptic.light();
                  }
                }}
                className={cn(
                  "gap-1 h-7 text-xs px-2",
                  !isActive && `${item.bgColor} hover:${item.bgColor}/80 ${item.color} ${item.borderColor}`,
                  isEditing && "cursor-grab active:cursor-grabbing",
                  isEditing && !isVisible && "opacity-40"
                )}
              >
                {isEditing && (
                  <GripVertical className="h-3 w-3 mr-0.5" />
                )}
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
              
              {isEditing && (
                <button
                  onClick={() => toggleVisibility(item.id)}
                  className={cn(
                    "absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] flex items-center justify-center",
                    isVisible ? "bg-jade text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isVisible ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {isEditing && (
        <p className="text-[10px] text-muted-foreground mt-1 text-center">
          גרור לשינוי סדר • לחץ להסתרה/הצגה
        </p>
      )}
    </div>
  );
}
