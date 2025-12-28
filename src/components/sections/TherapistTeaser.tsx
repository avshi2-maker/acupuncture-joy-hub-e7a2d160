import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, Volume2, VolumeX, Users, Brain, Calendar, TrendingUp, CheckCircle, Loader2, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const videos = [
  "/videos/promo-1.mp4",
  "/videos/promo-2.mp4",
  "/videos/promo-3.mp4",
  "/videos/promo-4.mp4",
];

// Hebrew descriptions for each video - will be narrated by TTS
const videoDescriptions = [
  "ברוכים הבאים למערכת ניהול הקליניקה המתקדמת ביותר לרפואה סינית. המערכת שלנו מאפשרת לכם לנהל את המטופלים, התורים והטיפולים במקום אחד.",
  "מוח ה-TCM המופעל על ידי בינה מלאכותית מספק תשובות מקצועיות לכל שאלה ברפואה סינית. בעזרת מאגר הידע העשיר שלנו, תקבלו המלצות טיפוליות מדויקות.",
  "ניהול יומן תורים חכם שמסנכרן עם זום ומזכיר למטופלים על התורים שלהם בוואטסאפ. חסכו זמן ומנעו ביטולים מיותרים.",
  "עקבו אחר ההחזר על ההשקעה שלכם עם אנליטיקה מתקדמת. צפו בצמיחה של הקליניקה והבינו אילו טיפולים הכי רווחיים."
];

// Hebrew subtitles for each video (shorter version for display)
const videoSubtitles = [
  "ברוכים הבאים למערכת ניהול הקליניקה המתקדמת ביותר לרפואה סינית",
  "מוח TCM מופעל בינה מלאכותית - תשובות מקצועיות לכל שאלה",
  "יומן תורים חכם עם סנכרון זום ותזכורות וואטסאפ",
  "אנליטיקה מתקדמת - עקבו אחר הצמיחה וההחזר על ההשקעה"
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
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationEnabled, setNarrationEnabled] = useState(false); // Start disabled, enable after user consent
  const [userConsentedNarration, setUserConsentedNarration] = useState(false); // Track if user clicked narration button
  const [narrationVolume, setNarrationVolume] = useState(80); // 0-100
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update audio volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = narrationVolume / 100;
    }
  }, [narrationVolume]);

  // Play Hebrew narration for current video
  const playNarration = async (videoIndex: number) => {
    if (!narrationEnabled) return;
    
    // Stop any existing narration
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const description = videoDescriptions[videoIndex];
    if (!description) return;

    setIsNarrating(true);
    
    // Keep video muted while narration plays so the voice is audible
    const video = videoRef.current;
    if (video && !video.muted) {
      video.muted = true;
      setIsMuted(true);
    }
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: description,
            voice: 'nova',
            language: 'he'
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error('Narration failed:', response.status, errText);
        toast({
          variant: "destructive",
          title: "לא ניתן להפעיל קריינות",
          description: "נסו שוב מאוחר יותר.",
        });
        setIsNarrating(false);
        return;
      }

      const data = await response.json();
      
      if (data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        audio.volume = narrationVolume / 100;
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsNarrating(false);
          audioRef.current = null;
        };
        
        audio.onerror = () => {
          console.error('Narration audio error');
          setIsNarrating(false);
          audioRef.current = null;
        };
        
        try {
          await audio.play();
        } catch (e) {
          console.error('Narration audio play blocked:', e);
          toast({
            variant: "destructive",
            title: "השמעת אודיו נחסמה",
            description: "לחצו שוב על כפתור הקריינות.",
          });
          setIsNarrating(false);
          audioRef.current = null;
        }
      }
    } catch (error) {
      console.error('Narration error:', error);
      setIsNarrating(false);
    }
  };

  // Stop narration when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load video when component mounts or video source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
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
      const mediaError = video.error;
      let errorMessage = 'Video failed to load';
      
      if (mediaError) {
        switch (mediaError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Video format not supported';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video source not found or not supported';
            break;
        }
      }
      
      console.error('Video error:', errorMessage, mediaError);
      setVideoError(errorMessage);
      setIsLoading(false);
      setIsVideoReady(false);
    };

    const handleCanPlay = () => {
      console.log('Video can play:', videos[currentVideo]);
      setIsLoading(false);
      setVideoError(null);
      setIsVideoReady(true);
    };

    const handleLoadStart = () => {
      console.log('Video loading:', videos[currentVideo]);
      setIsLoading(true);
      setIsVideoReady(false);
    };

    const handleLoadedData = () => {
      console.log('Video data loaded:', videos[currentVideo]);
      setIsVideoReady(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [currentVideo]);

  // When video index changes, reload and play if already playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reload video source
    video.load();

    if (isPlaying) {
      const playVideo = async () => {
        try {
          await video.play();
          // Auto-narration for subsequent videos if user consented
          if (userConsentedNarration && narrationEnabled) {
            playNarration(currentVideo);
          }
        } catch (err) {
          console.error('Auto-play on video change failed:', err);
          video.muted = true;
          setIsMuted(true);
          try {
            await video.play();
            if (userConsentedNarration && narrationEnabled) {
              playNarration(currentVideo);
            }
          } catch (err2) {
            console.error('Muted play also failed:', err2);
            setVideoError('Could not play video. Please try again.');
          }
        }
      };
      playVideo();
    }
  }, [currentVideo]);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoError(null);
    setCurrentVideo(0);
    video.load();
    
    try {
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      console.log('Initial play blocked, trying muted:', err);
      video.muted = true;
      setIsMuted(true);
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err2) {
        console.error('Even muted play failed:', err2);
        setVideoError('Could not play video. Please click to try again.');
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
          setIsNarrating(false);
        }
      } else {
        videoRef.current.play();
        if (userConsentedNarration && narrationEnabled) {
          playNarration(currentVideo);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsNarrating(false);
    }
    
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

  const toggleNarration = () => {
    // If currently narrating, stop
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsNarrating(false);
      setNarrationEnabled(false);
      return;
    }

    // Enable and mark consent, then start
    setUserConsentedNarration(true);
    setNarrationEnabled(true);
    playNarration(currentVideo);
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
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
              crossOrigin="anonymous"
              onLoadedMetadata={() => console.log('Video metadata loaded:', videos[currentVideo])}
            >
              <source src={videos[currentVideo]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Hebrew Subtitles Overlay */}
            {isPlaying && showSubtitles && (
              <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4 pointer-events-none">
                <div className="bg-black/70 text-white text-lg md:text-xl px-6 py-3 rounded-lg text-center max-w-3xl" dir="rtl">
                  {videoSubtitles[currentVideo]}
                </div>
              </div>
            )}

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
                <div className="flex items-center gap-3 flex-wrap">
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
                    title="Video audio"
                  >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  
                  {/* Subtitles Toggle */}
                  <button
                    onClick={toggleSubtitles}
                    className={`px-2 py-1 rounded text-sm transition-colors ${
                      showSubtitles 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-white/60'
                    }`}
                    title={showSubtitles ? "Hide subtitles" : "Show subtitles"}
                  >
                    CC
                  </button>
                  
                  {/* Hebrew Narration Toggle with Volume */}
                  <div className="relative flex items-center gap-1">
                    <button
                      onClick={toggleNarration}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                        narrationEnabled 
                          ? 'bg-primary/80 text-white' 
                          : 'bg-white/20 text-white/60'
                      }`}
                      title={narrationEnabled ? "Hebrew narration ON" : "Hebrew narration OFF"}
                    >
                      {isNarrating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                      <span>עברית</span>
                    </button>
                    
                    {/* Volume slider toggle for narration */}
                    {narrationEnabled && (
                      <button
                        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                        className="text-white/80 hover:text-white p-1"
                        title="Adjust narration volume"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Narration Volume Slider */}
                    {showVolumeSlider && narrationEnabled && (
                      <div className="absolute bottom-full left-0 mb-2 bg-black/90 rounded-lg p-3 min-w-[120px]">
                        <p className="text-white text-xs mb-2 text-center">עוצמת קריינות</p>
                        <Slider
                          value={[narrationVolume]}
                          onValueChange={(val) => setNarrationVolume(val[0])}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs text-center mt-1">{narrationVolume}%</p>
                      </div>
                    )}
                  </div>
                  
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
              {[
                "AI-powered TCM knowledge assistant",
                "Integrated patient management",
                "Smart appointment scheduling",
                "ROI tracking & analytics",
                "WhatsApp & Zoom integration"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => { setShowDialog(false); navigate("/therapist-register"); }}>
                Start 14-Day Free Trial
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); navigate("/pricing"); }}>
                View Pricing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TherapistTeaser;
