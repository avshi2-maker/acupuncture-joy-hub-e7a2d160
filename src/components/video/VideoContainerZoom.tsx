import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Video, Phone, PhoneOff, Mic, MicOff, VideoOff, 
  MonitorUp, Circle, CircleStop, Settings, Volume2, VolumeX,
  Maximize2, Minimize2, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type SessionStatus = 'idle' | 'running' | 'paused' | 'ended';

interface VideoContainerZoomProps {
  sessionStatus: SessionStatus;
  sessionDuration: number;
  patientName?: string | null;
  isTranscribing?: boolean;
  onStartCall?: () => void;
  onEndCall?: () => void;
  onToggleTranscription?: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VideoContainerZoom({
  sessionStatus,
  sessionDuration,
  patientName,
  isTranscribing = false,
  onStartCall,
  onEndCall,
  onToggleTranscription,
  className,
}: VideoContainerZoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = sessionStatus === 'running';
  const isPaused = sessionStatus === 'paused';

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle recording (synced with transcription)
  const handleToggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    onToggleTranscription?.();
  }, [onToggleTranscription]);

  // Simulated Zoom connection
  const handleStartCall = useCallback(async () => {
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    onStartCall?.();
  }, [onStartCall]);

  return (
    <TooltipProvider>
      <Card 
        ref={containerRef}
        className={cn(
          "overflow-hidden relative",
          "bg-gradient-to-br from-muted/30 to-muted/10",
          "border border-jade/20",
          // Level 2: FIXED height - Video Anchor, never collapses
          "h-full w-full",
          className
        )}
      >
        <CardContent className="p-0 h-full relative">
          {/* Zoom SDK Container - This is where the Zoom Web SDK would mount */}
          <div 
            id="zoom-container"
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-jade/5 via-transparent to-gold/5" />
            
            {/* Connection State */}
            {isConnecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center"
              >
                <Loader2 className="h-12 w-12 text-jade animate-spin mb-4" />
                <p className="text-lg font-medium">מתחבר לשיחה...</p>
                <p className="text-sm text-muted-foreground">Connecting to Zoom</p>
              </motion.div>
            )}
            
            {/* Video placeholder / SDK mount point */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className={cn(
                "w-20 h-20 md:w-24 md:h-24 rounded-full",
                "bg-jade/10 border-2 border-jade/30",
                "flex items-center justify-center mb-4",
                isActive && "animate-pulse"
              )}>
                <Video className="h-10 w-10 md:h-12 md:w-12 text-jade/60" />
              </div>
              
              <p className="text-lg md:text-xl font-bold text-foreground/80">
                אזור וידאו
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Zoom Web SDK
              </p>

              {/* Session Status Badge */}
              {sessionStatus !== 'idle' && (
                <Badge 
                  className={cn(
                    "mt-4 text-sm px-4 py-1",
                    isActive && "bg-jade animate-pulse",
                    isPaused && "bg-gold",
                    sessionStatus === 'ended' && "bg-destructive"
                  )}
                >
                  {isActive ? '● בשידור חי' : isPaused ? '⏸ מושהה' : '■ הסתיים'}
                </Badge>
              )}

              {/* Timer Display */}
              <motion.div
                className={cn(
                  "text-4xl md:text-5xl font-mono mt-4 font-bold",
                  isActive ? "text-jade" : "text-muted-foreground"
                )}
                animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatDuration(sessionDuration)}
              </motion.div>

              {/* Patient Name */}
              {patientName && sessionStatus !== 'idle' && (
                <Badge variant="outline" className="mt-3 text-sm px-4">
                  {patientName}
                </Badge>
              )}

              {/* Transcription Status */}
              {isTranscribing && (
                <motion.div 
                  className="mt-3 flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">AI מתמלל בזמן אמת</span>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Floating Action Bar - Bottom of video */}
          <motion.div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-full",
              "bg-background/80 backdrop-blur-md",
              "border border-muted-foreground/20 shadow-lg"
            )}>
              {/* Mic Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10",
                      isMuted && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
              </Tooltip>

              {/* Camera Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10",
                      isVideoOff && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                    onClick={() => setIsVideoOff(!isVideoOff)}
                  >
                    {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isVideoOff ? 'Turn on camera' : 'Turn off camera'}</TooltipContent>
              </Tooltip>

              {/* Speaker Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10",
                      isSpeakerMuted && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                    onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                  >
                    {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}</TooltipContent>
              </Tooltip>

              {/* Divider */}
              <div className="w-px h-6 bg-muted-foreground/20" />

              {/* Screen Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-10 h-10"
                  >
                    <MonitorUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share screen</TooltipContent>
              </Tooltip>

              {/* Recording Toggle (Synced with AI Transcription) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10",
                      isRecording && "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    )}
                    onClick={handleToggleRecording}
                  >
                    {isRecording ? (
                      <CircleStop className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? 'Stop recording & transcription' : 'Start recording & AI transcription'}
                </TooltipContent>
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-10 h-10"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</TooltipContent>
              </Tooltip>

              {/* Divider */}
              <div className="w-px h-6 bg-muted-foreground/20" />

              {/* Call Control */}
              {(sessionStatus === 'idle' || sessionStatus === 'ended') ? (
                <Button
                  className="rounded-full bg-jade hover:bg-jade/90 px-4"
                  onClick={handleStartCall}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      התחל שיחה
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="rounded-full px-4"
                  onClick={onEndCall}
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  סיים שיחה
                </Button>
              )}
            </div>
          </motion.div>

          {/* Paused Overlay */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-auto"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">⏸ מושהה</p>
                  <p className="text-muted-foreground mt-2">לחץ להמשך הפגישה</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording Indicator - Top Left */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>REC</span>
                <span className="font-mono text-xs opacity-80">{formatDuration(sessionDuration)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
