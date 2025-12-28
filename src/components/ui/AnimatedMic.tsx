import micAnimated from "@/assets/mic-animated.gif";

interface AnimatedMicProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isRecording?: boolean;
}

const sizeMap = {
  sm: { img: "h-5 w-5", container: "w-8 h-8", waves: "w-10 h-10" },
  md: { img: "h-6 w-6", container: "w-10 h-10", waves: "w-14 h-14" },
  lg: { img: "h-8 w-8", container: "w-12 h-12", waves: "w-16 h-16" },
  xl: { img: "h-12 w-12", container: "w-16 h-16", waves: "w-20 h-20" },
};

export function AnimatedMic({ className = "", size = "md", isRecording = false }: AnimatedMicProps) {
  const sizes = sizeMap[size];
  
  if (!isRecording) {
    return (
      <img 
        src={micAnimated} 
        alt="Microphone" 
        className={`${sizes.img} object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${sizes.container}`}>
      {/* Sound wave rings */}
      <div className={`absolute ${sizes.waves} rounded-full border-2 border-red-400/60 animate-ping`} />
      <div 
        className={`absolute ${sizes.waves} rounded-full border-2 border-orange-400/40 animate-ping`}
        style={{ animationDelay: '0.2s' }}
      />
      <div 
        className={`absolute ${sizes.waves} rounded-full border-2 border-amber-400/30 animate-ping`}
        style={{ animationDelay: '0.4s' }}
      />
      
      {/* Pulsing glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 animate-pulse" />
      
      {/* Microphone icon */}
      <img 
        src={micAnimated} 
        alt="Recording" 
        className={`${sizes.img} object-contain relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]`}
      />
      
      {/* Recording indicator dot */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse z-20 shadow-lg shadow-red-500/50" />
    </div>
  );
}
