import { useState, useEffect, useRef } from 'react';

const videos = [
  {
    src: '/videos/gate-ancient-roots.mp4',
    title: 'Ancient Roots.',
    subtitle: 'Modern Precision.',
  },
  {
    src: '/videos/gate-unlock-potential.mp4',
    title: 'Unlock Your',
    subtitle: "Body's Potential.",
  },
];

interface CinematicVideoBackgroundProps {
  children: React.ReactNode;
}

export function CinematicVideoBackground({ children }: CinematicVideoBackgroundProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showText, setShowText] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentVideoIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsTransitioning(true);
      setShowText(false);
      
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setIsTransitioning(false);
        setTimeout(() => setShowText(true), 500);
      }, 800);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  // Reset and play video when index changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.load();
    video.play().catch(() => {
      // Autoplay might be blocked, that's okay
    });
  }, [currentVideoIndex]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl">
      {/* Video Container */}
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          key={currentVideo.src}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          autoPlay
          muted
          playsInline
          loop={false}
        >
          <source src={currentVideo.src} type="video/mp4" />
        </video>
        
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* Cinematic Text Overlay - Top */}
      <div 
        className={`absolute top-6 left-0 right-0 z-20 text-center transition-all duration-700 ${
          showText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="inline-block px-8 py-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
          <p className="text-white/90 text-lg md:text-xl font-light tracking-[0.3em] uppercase">
            {currentVideo.title}
          </p>
          <p className="text-gold text-xl md:text-2xl font-semibold tracking-wider mt-1">
            {currentVideo.subtitle}
          </p>
        </div>
      </div>

      {/* Video Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentVideoIndex) {
                setIsTransitioning(true);
                setShowText(false);
                setTimeout(() => {
                  setCurrentVideoIndex(index);
                  setIsTransitioning(false);
                  setTimeout(() => setShowText(true), 500);
                }, 500);
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentVideoIndex 
                ? 'w-8 bg-gold' 
                : 'w-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Video ${index + 1}`}
          />
        ))}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 py-8 px-4">
        {children}
      </div>
    </div>
  );
}
