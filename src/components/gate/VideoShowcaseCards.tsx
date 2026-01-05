import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const videos = [
  {
    src: '/videos/gate-ancient-roots.mp4',
    title: { en: 'Ancient Roots.', he: 'שורשים עתיקים.' },
    subtitle: { en: 'Modern Precision.', he: 'דיוק מודרני.' },
  },
  {
    src: '/videos/gate-unlock-potential.mp4',
    title: { en: 'Unlock Your', he: 'שחרר את' },
    subtitle: { en: "Body's Potential.", he: 'הפוטנציאל של גופך.' },
  },
];

export function VideoShowcaseCards() {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { language, dir } = useLanguage();

  const handlePlayPause = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (playingIndex === index) {
      video.pause();
      setPlayingIndex(null);
    } else {
      // Pause any playing video
      videoRefs.current.forEach((v, i) => {
        if (v && i !== index) v.pause();
      });
      video.play();
      setPlayingIndex(index);
    }
  };

  const handleVideoEnded = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    }
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto" dir={dir}>
        {videos.map((video, index) => {
          const isPlaying = playingIndex === index;
          const title = video.title[language] || video.title.en;
          const subtitle = video.subtitle[language] || video.subtitle.en;

          return (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-500"
            >
              {/* Video */}
              <div className="aspect-video relative">
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={video.src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  onEnded={() => handleVideoEnded(index)}
                />
                
                {/* Dark gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-50' : 'opacity-100'}`} />
                
                {/* Play/Pause Button */}
                <button
                  onClick={() => handlePlayPause(index)}
                  className="absolute inset-0 flex items-center justify-center group/btn"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full 
                    flex items-center justify-center
                    bg-white/20 backdrop-blur-md border border-white/30
                    transition-all duration-300
                    ${isPlaying 
                      ? 'opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100' 
                      : 'opacity-100 hover:scale-110 hover:bg-white/30'
                    }
                    shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                  `}>
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-white" fill="white" />
                    ) : (
                      <Play className="h-8 w-8 text-white ml-1" fill="white" />
                    )}
                  </div>
                </button>

                {/* Caption Overlay */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 text-center transition-all duration-500 ${
                    isPlaying ? 'translate-y-2 opacity-70' : 'translate-y-0 opacity-100'
                  }`}
                >
                  <p className={`text-white/90 text-sm md:text-base font-light uppercase ${
                    language === 'he' ? 'tracking-normal' : 'tracking-[0.2em]'
                  }`}>
                    {title}
                  </p>
                  <p className={`text-gold text-lg md:text-xl font-semibold mt-0.5 ${
                    language === 'he' ? 'tracking-normal' : 'tracking-wide'
                  }`}>
                    {subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
