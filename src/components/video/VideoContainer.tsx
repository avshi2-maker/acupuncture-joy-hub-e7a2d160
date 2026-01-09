import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Video, Phone, PhoneOff, Mic, MicOff, VideoOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type SessionStatus = 'idle' | 'running' | 'paused' | 'ended';

interface VideoContainerProps {
  sessionStatus: SessionStatus;
  sessionDuration: number;
  patientName?: string | null;
  onStartCall?: () => void;
  onEndCall?: () => void;
  className?: string;
}

// Format duration as MM:SS
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VideoContainer({
  sessionStatus,
  sessionDuration,
  patientName,
  onStartCall,
  onEndCall,
  className,
}: VideoContainerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const isActive = sessionStatus === 'running';
  const isPaused = sessionStatus === 'paused';

  return (
    <Card className={cn(
      "overflow-hidden h-full",
      "bg-gradient-to-br from-muted/30 to-muted/10",
      "border-jade/20",
      className
    )}>
      <CardContent className="p-0 h-full relative">
        {/* Video placeholder / SDK container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade/5 via-transparent to-gold/5" />
          
          {/* Video icon placeholder */}
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
              Zoom / Google Meet SDK
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
          </motion.div>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {/* Mute Button */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full w-10 h-10",
              isMuted && "bg-destructive/10 border-destructive text-destructive"
            )}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          {/* Video Toggle */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full w-10 h-10",
              isVideoOff && "bg-destructive/10 border-destructive text-destructive"
            )}
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>

          {/* Call Control */}
          {sessionStatus === 'idle' ? (
            <Button
              className="rounded-full bg-jade hover:bg-jade/90 px-6"
              onClick={onStartCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              התחל שיחה
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="rounded-full px-6"
              onClick={onEndCall}
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              סיים שיחה
            </Button>
          )}
        </div>

        {/* Paused Overlay */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">⏸ מושהה</p>
              <p className="text-muted-foreground mt-2">לחץ להמשך הפגישה</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
