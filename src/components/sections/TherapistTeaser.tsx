import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, SkipForward, Volume2, VolumeX, Users, Brain, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const videos = [
  "/videos/promo-1.mp4",
  "/videos/promo-2.mp4",
  "/videos/promo-3.mp4",
  "/videos/promo-4.mp4",
];

const features = [
  { icon: Users, label: "Patient Management" },
  { icon: Brain, label: "AI-Powered TCM Brain" },
  { icon: Calendar, label: "Smart Scheduling" },
  { icon: TrendingUp, label: "ROI Analytics" },
];

const TherapistTeaser = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        const totalDuration = videos.length * video.duration;
        const currentProgress = (currentVideo * video.duration + video.currentTime) / totalDuration;
        setProgress(currentProgress * 100);
      }
    };

    const handleEnded = () => {
      console.log('Video ended, current:', currentVideo);
      if (currentVideo < videos.length - 1) {
        setCurrentVideo(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setShowDialog(true);
        setCurrentVideo(0);
        setProgress(0);
      }
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e, video.error);
      setVideoError(`Video failed to load: ${video.error?.message || 'Unknown error'}`);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      console.log('Video can play:', videos[currentVideo]);
      setIsLoading(false);
      setVideoError(null);
    };

    const handleLoadStart = () => {
      console.log('Video loading:', videos[currentVideo]);
      setIsLoading(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentVideo]);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Play failed:', err);
        setVideoError('Failed to play video. Please try again.');
      });
    }
  }, [currentVideo, isPlaying]);

  const handlePlay = async () => {
    setVideoError(null);
    setIsPlaying(true);
    setCurrentVideo(0);
    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (err) {
        console.error('Play failed:', err);
        setVideoError('Failed to play video. Please try again.');
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = () => {
    if (currentVideo < videos.length - 1) {
      setCurrentVideo(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setShowDialog(true);
      setCurrentVideo(0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            For TCM Practitioners
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Grow Your Practice with AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join practitioners who are using our platform to streamline patient care, 
            leverage TCM knowledge, and grow their clinics.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative rounded-2xl overflow-hidden bg-black border border-border/50 shadow-elevated aspect-video"
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              src={videos[currentVideo]}
              className="w-full h-full object-cover"
              muted={isMuted}
              playsInline
              preload="auto"
            />

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error State */}
            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4">
                <p className="text-red-400 mb-4 text-center">{videoError}</p>
                <Button variant="outline" onClick={() => { setVideoError(null); setCurrentVideo(0); }}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Play Overlay (shown when not playing) */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-jade/40 to-gold/20 cursor-pointer"
                onClick={handlePlay}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">
                  See How It Works
                </h3>
                <p className="text-white/80 text-sm drop-shadow">
                  Watch our platform overview
                </p>
              </div>
            )}

            {/* Video Controls (shown when playing) */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePause}
                    className="text-white hover:text-primary transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={handleSkip}
                    className="text-white hover:text-primary transition-colors"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-primary transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <span className="text-white text-sm ml-auto">
                    Part {currentVideo + 1} of {videos.length}
                  </span>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/therapist-register")}
              className="bg-primary hover:bg-primary/90"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/encyclopedia")}
            >
              Explore Features
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Ready to Transform Your Practice?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature.label}</span>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => { setShowDialog(false); navigate("/therapist-register"); }}>
                Start Free Trial
              </Button>
              <Button variant="ghost" onClick={() => setShowDialog(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TherapistTeaser;
