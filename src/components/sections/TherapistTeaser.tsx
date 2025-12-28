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
  "כל המידע בקליניקה מבוסס על מאמרים וספרים שכתב ד״ר רוני ספיר. רפואה משלימה עם ניסיון בדיקור וטיפול מקצועי במאות לקוחות לאורך השנים."
];

// Time-synced Hebrew subtitles for each video
// Each video has an array of { start, end, text } objects (seconds)
const timedSubtitles: { start: number; end: number; text: string }[][] = [
  // Video 1 - Welcome / Overview
  [
    { start: 0, end: 4, text: "ברוכים הבאים למערכת ניהול הקליניקה" },
    { start: 4, end: 8, text: "המתקדמת ביותר לרפואה סינית" },
    { start: 8, end: 13, text: "נהלו מטופלים, תורים וטיפולים במקום אחד" },
  ],
  // Video 2 - TCM Brain AI
  [
    { start: 0, end: 4, text: "מוח TCM מופעל בינה מלאכותית" },
    { start: 4, end: 8, text: "תשובות מקצועיות לכל שאלה ברפואה סינית" },
    { start: 8, end: 13, text: "המלצות טיפוליות מדויקות ממאגר ידע עשיר" },
  ],
  // Video 3 - Calendar & Reminders
  [
    { start: 0, end: 4, text: "יומן תורים חכם עם סנכרון זום" },
    { start: 4, end: 8, text: "תזכורות אוטומטיות בוואטסאפ למטופלים" },
    { start: 8, end: 13, text: "חסכו זמן ומנעו ביטולים מיותרים" },
  ],
  // Video 4 - About Knowledge Base
  [
    { start: 0, end: 6, text: "כל המידע בקליניקה מבוסס על מאמרים וספרים שכתב ד״ר רוני ספיר" },
    { start: 6, end: 10, text: "רפואה משלימה עם ניסיון בדיקור וטיפול מקצועי" },
    { start: 10, end: 15, text: "במאות לקוחות לאורך השנים" },
  ],
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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationEnabled, setNarrationEnabled] = useState(false); // Start disabled, enable after user consent
  const [userConsentedNarration, setUserConsentedNarration] = useState(false); // Track if user clicked narration button
  const [narrationVolume, setNarrationVolume] = useState(80); // 0-100
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleSize, setSubtitleSize] = useState(20); // Font size in px (14-32)
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [videoVolume, setVideoVolume] = useState(100); // For ducking
  const [isTransitioning, setIsTransitioning] = useState(false); // For crossfade transitions
  const [videoOpacity, setVideoOpacity] = useState(1); // Control video fade
  const [videoProgressPercent, setVideoProgressPercent] = useState(0); // 0-100 progress for current video
  const originalVolumeRef = useRef(100); // Store original volume before ducking
  const isTransitioningRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Keep a ref so media event listeners can read latest transition state
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

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
    
    // Audio ducking: lower video volume during narration instead of muting
    const video = videoRef.current;
    if (video) {
      originalVolumeRef.current = video.volume * 100;
      video.volume = 0.15; // Duck to 15% volume
      setVideoVolume(15);
      if (video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
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
          // Restore video volume after narration ends
          if (videoRef.current) {
            videoRef.current.volume = originalVolumeRef.current / 100;
            setVideoVolume(originalVolumeRef.current);
          }
        };
        
        audio.onerror = () => {
          console.error('Narration audio error');
          setIsNarrating(false);
          audioRef.current = null;
          // Restore video volume on error
          if (videoRef.current) {
            videoRef.current.volume = originalVolumeRef.current / 100;
            setVideoVolume(originalVolumeRef.current);
          }
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

        // Update video progress percentage for the dot indicator
        const videoPercent = (video.currentTime / video.duration) * 100;
        setVideoProgressPercent(videoPercent);

        // Update time-synced subtitles
        const subs = timedSubtitles[currentVideo] || [];
        const currentTime = video.currentTime;
        const activeSub = subs.find(s => currentTime >= s.start && currentTime < s.end);
        setCurrentSubtitle(activeSub?.text || "");
      }
    };

    const handleEnded = () => {
      // Fade out briefly to avoid harsh cuts, then advance
      setIsTransitioning(true);
      setVideoOpacity(0);
      setVideoProgressPercent(0);

      setTimeout(() => {
        setCurrentVideo((prevVideo) => {
          if (prevVideo < videos.length - 1) {
            return prevVideo + 1;
          }

          setIsPlaying(false);
          setShowDialog(true);
          setProgress(0);
          return 0;
        });
      }, 150);
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
    setVideoProgressPercent(0);

    if (isPlaying) {
      const playVideo = async () => {
        try {
          await video.play();
          // Fade in new video
          setVideoOpacity(1);
          setTimeout(() => setIsTransitioning(false), 200);

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
            setVideoOpacity(1);
            setTimeout(() => setIsTransitioning(false), 200);
            if (userConsentedNarration && narrationEnabled) {
              playNarration(currentVideo);
            }
          } catch (err2) {
            console.error('Muted play also failed:', err2);
            setVideoError('Could not play video. Please try again.');
            setIsTransitioning(false);
            setIsPlaying(false);
          }
        }
      };
      playVideo();
    } else {
      // Reset opacity for non-playing state
      setVideoOpacity(1);
      setIsTransitioning(false);
    }
  }, [currentVideo]);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoError(null);

    // Don't reset to video #1 when resuming
    if (video.readyState < 2) {
      video.load();
    }

    setVideoOpacity(1);
    setIsTransitioning(false);

    try {
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      console.log('Play blocked, trying muted:', err);
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

  const handlePause = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsNarrating(false);
      }
      return;
    }

    try {
      await video.play();
      setIsPlaying(true);
      if (userConsentedNarration && narrationEnabled) {
        playNarration(currentVideo);
      }
    } catch {
      // If browser blocks resume, keep UI paused
      setIsPlaying(false);
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

  const toggleNarration = async () => {
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

    // Ensure the video is playing (user gesture) so browser allows audio playback
    const video = videoRef.current;
    if (video && video.paused) {
      try {
        await video.play();
      } catch (err) {
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
        } catch {
          // Ignore: narration will still try to play and show toast if blocked
        }
      }
    }

    playNarration(currentVideo);
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  return (
    <section id="therapist-teaser" className="py-16 bg-gradient-to-b from-background to-muted/30">
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
            className="relative rounded-2xl overflow-hidden bg-transparent shadow-elevated aspect-video"
          >
            {/* Video Element with transition */}
            <video
              ref={videoRef}
              src={videos[currentVideo]}
              className="w-full h-full object-contain bg-gradient-to-br from-jade/10 to-gold/5 transition-opacity duration-200 ease-in-out"
              style={{ opacity: videoOpacity }}
              muted={isMuted}
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              onLoadedMetadata={() => console.log('Video metadata loaded:', videos[currentVideo])}
            >
              <source src={videos[currentVideo]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Now Playing Badge */}
            {isPlaying && (
              <div 
                className="absolute top-4 right-4 z-10 animate-fade-in"
                style={{ animationDuration: '0.4s' }}
              >
                <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Now playing: {currentVideo + 1}/{videos.length}</span>
                </div>
              </div>
            )}

            {/* Video Progress Indicator Dots */}
            {isPlaying && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                        setIsNarrating(false);
                      }
                      setIsTransitioning(true);
                      setVideoOpacity(0);
                      setVideoProgressPercent(0);
                      setTimeout(() => setCurrentVideo(index), 150);
                    }}
                    className={`relative transition-all duration-300 overflow-hidden ${
                      index === currentVideo 
                        ? 'w-10 h-3 rounded-full' 
                        : 'w-3 h-3 rounded-full hover:scale-110'
                    }`}
                  >
                    {/* Background track */}
                    <span 
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        index === currentVideo 
                          ? 'bg-white/30' 
                          : index < currentVideo 
                            ? 'bg-primary' 
                            : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                    {/* Progress fill for current video */}
                    {index === currentVideo && (
                      <span 
                        className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-lg shadow-primary/50 transition-all duration-100"
                        style={{ width: `${videoProgressPercent}%` }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Hebrew Subtitles Overlay - Time-synced */}
            {isPlaying && showSubtitles && currentSubtitle && (
              <div className="absolute bottom-16 left-0 right-0 flex justify-center px-2 sm:px-4 pointer-events-none">
                <div 
                  className="bg-lime-200/90 text-gray-900 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-center max-w-[90%] sm:max-w-3xl font-subtitle font-light shadow-lg"
                  style={{ fontSize: `${Math.max(12, subtitleSize * 0.85)}px` }}
                  dir="rtl"
                >
                  {currentSubtitle}
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
                  
                  {/* Subtitles Toggle with Size Slider */}
                  <div className="relative flex items-center gap-1">
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
                    
                    {/* Subtitle size slider */}
                    {showSubtitles && (
                      <div className="flex items-center gap-2 bg-black/60 rounded-lg px-2 py-1">
                        <span className="text-white/70 text-xs">A</span>
                        <Slider
                          value={[subtitleSize]}
                          onValueChange={(value) => setSubtitleSize(value[0])}
                          min={14}
                          max={32}
                          step={2}
                          className="w-16"
                        />
                        <span className="text-white/70 text-sm font-bold">A</span>
                      </div>
                    )}
                  </div>
                  
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
