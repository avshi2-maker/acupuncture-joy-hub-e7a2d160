import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Video, Save, Bell, Shield, Clock, Fingerprint, EyeOff, Smartphone, Palette, Mic, Trash2, FileDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSessionLock } from '@/contexts/SessionLockContext';
import { usePinAuth } from '@/hooks/usePinAuth';
import { clearSafetyLog, getSafetyLog, exportSafetyLogToPDF, SafetyLogEntry } from '@/components/session/SafetyGateModal';

interface TherapistSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ZOOM_LINK_STORAGE_KEY = 'therapist_zoom_link';
export const THERAPIST_NAME_KEY = 'therapist_display_name';
export const AUDIO_ALERTS_ENABLED_KEY = 'therapist_audio_alerts_enabled';
export const BIOMETRIC_ENABLED_KEY = 'therapist_biometric_enabled';
export const LOCK_ON_TAB_SWITCH_KEY = 'therapist_lock_on_tab_switch';
export const LOCK_ON_SCREEN_WAKE_KEY = 'therapist_lock_on_screen_wake';
export const SCREEN_WAKE_GRACE_PERIOD_KEY = 'therapist_screen_wake_grace_period';
export const CLOCK_THEME_KEY = 'therapist_clock_theme';
export const VOICE_WAKE_WORD_KEY = 'therapist_voice_wake_word';
export const VOICE_WAKE_WORD_ENABLED_KEY = 'therapist_voice_wake_word_enabled';

export type ClockTheme = 'gold' | 'silver' | 'jade';

export function getClockTheme(): ClockTheme {
  try {
    const saved = localStorage.getItem(CLOCK_THEME_KEY) as ClockTheme;
    return saved && ['gold', 'silver', 'jade'].includes(saved) ? saved : 'gold';
  } catch {
    return 'gold';
  }
}

export function getAudioAlertsEnabled(): boolean {
  try {
    const saved = localStorage.getItem(AUDIO_ALERTS_ENABLED_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export function getBiometricEnabled(): boolean {
  try {
    const saved = localStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export function getLockOnTabSwitch(): boolean {
  try {
    const saved = localStorage.getItem(LOCK_ON_TAB_SWITCH_KEY);
    return saved === 'true';
  } catch {
    return false;
  }
}

export function getLockOnScreenWake(): boolean {
  try {
    const saved = localStorage.getItem(LOCK_ON_SCREEN_WAKE_KEY);
    return saved === 'true';
  } catch {
    return false;
  }
}

export function getScreenWakeGracePeriod(): number {
  try {
    const saved = localStorage.getItem(SCREEN_WAKE_GRACE_PERIOD_KEY);
    return saved ? parseInt(saved, 10) : 30; // Default 30 seconds
  } catch {
    return 30;
  }
}

export function getVoiceWakeWord(): string {
  try {
    const saved = localStorage.getItem(VOICE_WAKE_WORD_KEY);
    return saved || 'hey doctor';
  } catch {
    return 'hey doctor';
  }
}

export function getVoiceWakeWordEnabled(): boolean {
  try {
    const saved = localStorage.getItem(VOICE_WAKE_WORD_ENABLED_KEY);
    return saved === 'true';
  } catch {
    return false;
  }
}

const WAKE_WORD_PRESETS = [
  { value: 'hey doctor', label: 'Hey Doctor' },
  { value: 'okay roni', label: 'Okay Roni' },
  { value: 'listen up', label: 'Listen Up' },
  { value: 'היי רוני', label: 'היי רוני' },
  { value: 'בבקשה', label: 'בבקשה' },
];

const TIMEOUT_OPTIONS = [
  { value: '5', label: '5 דקות' },
  { value: '10', label: '10 דקות' },
  { value: '15', label: '15 דקות' },
  { value: '30', label: '30 דקות' },
];

export function TherapistSettingsDialog({
  open,
  onOpenChange,
}: TherapistSettingsDialogProps) {
  const [zoomLink, setZoomLink] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [lockOnTabSwitch, setLockOnTabSwitch] = useState(false);
  const [lockOnScreenWake, setLockOnScreenWake] = useState(false);
  const [screenWakeGracePeriod, setScreenWakeGracePeriod] = useState('30');
  const [clockTheme, setClockTheme] = useState<ClockTheme>('gold');
  const [selectedTimeout, setSelectedTimeout] = useState('15');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [wakeWord, setWakeWord] = useState('hey doctor');
  const [customWakeWord, setCustomWakeWord] = useState('');
  const [showClearLogDialog, setShowClearLogDialog] = useState(false);
  const [logSummary, setLogSummary] = useState<{ total: number; cleared: number; sos: number }>({ total: 0, cleared: 0, sos: 0 });
  
  const { timeoutMinutes, setTimeoutMinutes } = useSessionLock();
  const { hasPin } = usePinAuth();

  // Load saved settings on mount
  useEffect(() => {
    if (open) {
      const savedLink = localStorage.getItem(ZOOM_LINK_STORAGE_KEY) || '';
      const savedName = localStorage.getItem(THERAPIST_NAME_KEY) || '';
      const savedAudioAlerts = getAudioAlertsEnabled();
      const savedBiometric = getBiometricEnabled();
      const savedLockOnTabSwitch = getLockOnTabSwitch();
      const savedLockOnScreenWake = getLockOnScreenWake();
      const savedGracePeriod = getScreenWakeGracePeriod();
      const savedWakeWordEnabled = getVoiceWakeWordEnabled();
      const savedWakeWord = getVoiceWakeWord();
      setZoomLink(savedLink);
      setDisplayName(savedName);
      setAudioAlertsEnabled(savedAudioAlerts);
      setBiometricEnabled(savedBiometric);
      setLockOnTabSwitch(savedLockOnTabSwitch);
      setLockOnScreenWake(savedLockOnScreenWake);
      setScreenWakeGracePeriod(savedGracePeriod.toString());
      setClockTheme(getClockTheme());
      setSelectedTimeout(timeoutMinutes.toString());
      setWakeWordEnabled(savedWakeWordEnabled);
      // Check if saved wake word is a preset or custom
      const isPreset = WAKE_WORD_PRESETS.some(p => p.value === savedWakeWord);
      if (isPreset) {
        setWakeWord(savedWakeWord);
        setCustomWakeWord('');
      } else {
        setWakeWord('custom');
        setCustomWakeWord(savedWakeWord);
      }
    }
  }, [open, timeoutMinutes]);

  const handleSave = () => {
    const finalWakeWord = wakeWord === 'custom' ? customWakeWord : wakeWord;
    localStorage.setItem(ZOOM_LINK_STORAGE_KEY, zoomLink);
    localStorage.setItem(THERAPIST_NAME_KEY, displayName);
    localStorage.setItem(AUDIO_ALERTS_ENABLED_KEY, audioAlertsEnabled.toString());
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, biometricEnabled.toString());
    localStorage.setItem(LOCK_ON_TAB_SWITCH_KEY, lockOnTabSwitch.toString());
    localStorage.setItem(LOCK_ON_SCREEN_WAKE_KEY, lockOnScreenWake.toString());
    localStorage.setItem(SCREEN_WAKE_GRACE_PERIOD_KEY, screenWakeGracePeriod);
    localStorage.setItem(CLOCK_THEME_KEY, clockTheme);
    localStorage.setItem(VOICE_WAKE_WORD_ENABLED_KEY, wakeWordEnabled.toString());
    localStorage.setItem(VOICE_WAKE_WORD_KEY, finalWakeWord);
    setTimeoutMinutes(parseInt(selectedTimeout, 10));
    toast.success('ההגדרות נשמרו בהצלחה');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-jade" />
            הגדרות מטפל
          </DialogTitle>
          <DialogDescription>
            הגדר את פרטי החשבון שלך לשימוש בפגישות וידאו
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">שם להצגה</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="השם שלך"
            />
          </div>

          {/* Zoom Personal Link */}
          <div className="space-y-2">
            <Label htmlFor="zoom-link" className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              קישור Zoom אישי
            </Label>
            <Input
              id="zoom-link"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/your-meeting-id"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              קישור זה ישמש כברירת מחדל בעת שליחת הזמנות לפגישות וידאו
            </p>
          </div>

          {/* Audio Alerts Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <div>
                <Label htmlFor="audio-alerts" className="text-sm font-medium">
                  התראות קוליות
                </Label>
                <p className="text-xs text-muted-foreground">
                  השמע צליל התראה לפני סיום מגבלת Zoom
                </p>
              </div>
            </div>
            <Switch
              id="audio-alerts"
              checked={audioAlertsEnabled}
              onCheckedChange={setAudioAlertsEnabled}
            />
          </div>

          {/* Voice Wake Word Settings */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-jade" />
                <div>
                  <Label htmlFor="wake-word-enabled" className="text-sm font-medium">
                    מילת השכמה לפקודות קול
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    אמור מילת הפעלה לפני פקודה
                  </p>
                </div>
              </div>
              <Switch
                id="wake-word-enabled"
                checked={wakeWordEnabled}
                onCheckedChange={setWakeWordEnabled}
              />
            </div>
            
            {wakeWordEnabled && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label className="text-xs text-muted-foreground">בחר מילת השכמה</Label>
                <Select value={wakeWord} onValueChange={setWakeWord}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר מילת השכמה" />
                  </SelectTrigger>
                  <SelectContent>
                    {WAKE_WORD_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">מותאם אישית...</SelectItem>
                  </SelectContent>
                </Select>
                
                {wakeWord === 'custom' && (
                  <Input
                    value={customWakeWord}
                    onChange={(e) => setCustomWakeWord(e.target.value)}
                    placeholder="הקלד מילת השכמה מותאמת"
                    className="mt-2"
                  />
                )}
                
                <p className="text-xs text-muted-foreground">
                  דוגמה: אמור "{wakeWord === 'custom' ? customWakeWord || 'מילה שלך' : wakeWord}" ואז "start" להתחלת פגישה
                </p>
              </div>
            )}
          </div>

          {/* Clock Theme */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-purple-500" />
              <Label className="text-sm font-medium">ערכת נושא לשעון</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['gold', 'silver', 'jade'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setClockTheme(theme)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    clockTheme === theme
                      ? theme === 'gold'
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                        : theme === 'silver'
                        ? 'border-slate-400 bg-slate-50 dark:bg-slate-900/30'
                        : 'border-jade bg-jade-light dark:bg-jade/10'
                      : 'border-transparent bg-background hover:bg-muted'
                  }`}
                >
                  <div
                    className={`w-6 h-6 mx-auto rounded-full ${
                      theme === 'gold'
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600'
                        : theme === 'silver'
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                        : 'bg-gradient-to-br from-emerald-400 to-jade'
                    }`}
                  />
                  <span className="text-xs mt-1 block text-center">
                    {theme === 'gold' ? 'זהב' : theme === 'silver' ? 'כסף' : 'ירקן'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Session Lock Timeout - only show if PIN is set */}
          {hasPin && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-jade" />
                <Label className="text-sm font-medium">אבטחת מסך</Label>
              </div>
              
              {/* Timeout Setting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">נעילה אוטומטית לאחר</span>
                </div>
                <Select value={selectedTimeout} onValueChange={setSelectedTimeout}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEOUT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Biometric Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm">זיהוי ביומטרי</span>
                    <p className="text-xs text-muted-foreground">
                      טביעת אצבע / Face ID
                    </p>
                  </div>
                </div>
                <Switch
                  checked={biometricEnabled}
                  onCheckedChange={setBiometricEnabled}
                />
              </div>

              {/* Lock on Tab Switch Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm">נעילה במעבר לשונית</span>
                    <p className="text-xs text-muted-foreground">
                      נעל כשהדפדפן ברקע
                    </p>
                  </div>
                </div>
                <Switch
                  checked={lockOnTabSwitch}
                  onCheckedChange={setLockOnTabSwitch}
                />
              </div>

              {/* Lock on Screen Wake (Mobile) */}
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm">נעילה בחזרה מהרקע</span>
                      <p className="text-xs text-muted-foreground">
                        למובייל - נעל כשהמסך נכבה
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={lockOnScreenWake}
                    onCheckedChange={setLockOnScreenWake}
                  />
                </div>
                
                {lockOnScreenWake && (
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs text-muted-foreground">זמן חסד לפני נעילה</span>
                    <Select value={screenWakeGracePeriod} onValueChange={setScreenWakeGracePeriod}>
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">מיידי</SelectItem>
                        <SelectItem value="10">10 שניות</SelectItem>
                        <SelectItem value="30">30 שניות</SelectItem>
                        <SelectItem value="60">דקה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                המסך יינעל אוטומטית לאחר חוסר פעילות
              </p>
            </div>
          )}

          {/* Safety Log Management */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <Label className="text-sm font-medium">יומן בטיחות</Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              נהל את יומן בדיקות הבטיחות של מפגשים
            </p>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => {
                  const log = getSafetyLog();
                  if (log.length === 0) {
                    toast.error('אין רשומות ביומן');
                    return;
                  }
                  exportSafetyLogToPDF();
                  toast.success('יומן הבטיחות יוצא ל-PDF');
                }}
              >
                <FileDown className="h-4 w-4" />
                ייצוא PDF
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  const log = getSafetyLog();
                  if (log.length === 0) {
                    toast.error('אין רשומות למחיקה');
                    return;
                  }
                  const sosCount = log.filter(e => e.status === 'sos').length;
                  const clearedCount = log.filter(e => e.status === 'cleared').length;
                  setLogSummary({ total: log.length, cleared: clearedCount, sos: sosCount });
                  setShowClearLogDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                נקה יומן
              </Button>
            </div>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 טיפ:</strong> השתמש בקישור החדר האישי שלך מ-Zoom כדי שמטופלים יוכלו להצטרף בקלות לכל פגישה.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="gap-2 bg-jade hover:bg-jade/90">
            <Save className="h-4 w-4" />
            שמור הגדרות
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Clear Safety Log Confirmation Dialog */}
      <AlertDialog open={showClearLogDialog} onOpenChange={setShowClearLogDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              מחיקת יומן בטיחות
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>האם אתה בטוח שברצונך למחוק את כל היסטוריית יומן הבטיחות?</p>
                
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  <p className="font-medium text-foreground text-sm">סיכום רשומות למחיקה:</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-background rounded p-2">
                      <p className="text-lg font-bold text-foreground">{logSummary.total}</p>
                      <p className="text-xs text-muted-foreground">סה״כ</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded p-2">
                      <p className="text-lg font-bold text-green-600">{logSummary.cleared}</p>
                      <p className="text-xs text-muted-foreground">אושרו</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 rounded p-2">
                      <p className="text-lg font-bold text-destructive">{logSummary.sos}</p>
                      <p className="text-xs text-muted-foreground">SOS</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-destructive text-sm font-medium">
                  ⚠️ פעולה זו אינה ניתנת לביטול!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                clearSafetyLog();
                toast.success('יומן הבטיחות נמחק');
                setShowClearLogDialog(false);
              }}
            >
              מחק הכל
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
