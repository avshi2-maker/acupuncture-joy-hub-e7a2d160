import React, { useEffect, useState } from 'react';

interface BodyPoint {
  code: string;
  name: string;
  image_file: string;
  x_percent: number;
  y_percent: number;
  tags: string;
}

interface BodyMapProps {
  highlightedPoints: string[]; // e.g. ['LI4', 'ST36']
  className?: string;
}

export const BodyMap: React.FC<BodyMapProps> = ({ highlightedPoints, className }) => {
  const [db, setDb] = useState<BodyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<BodyPoint | null>(null);
  const [imageError, setImageError] = useState(false);

  // 1. Load the Master CSV on mount
  useEffect(() => {
    fetch('/body-maps/tcm_points.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').slice(1); // Skip header
        const points: BodyPoint[] = lines.map(line => {
          const [code, name, pinyin, image_file, x, y, tags] = line.split(',');
          if (!code || !image_file) return null;
          return {
            code: code.trim(),
            name: name?.trim() || '',
            image_file: image_file.trim(),
            x_percent: parseFloat(x) || 50,
            y_percent: parseFloat(y) || 50,
            tags: tags?.trim() || ''
          };
        }).filter(Boolean) as BodyPoint[];

        console.log('✅ TCM CSV Loaded:', points.length, 'points');
        setDb(points);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Failed to load CSV:', err);
        setLoading(false);
      });
  }, []);

  // 2. Watch for highlighted points from the Brain
  useEffect(() => {
    if (highlightedPoints.length > 0 && db.length > 0) {
      // Find the first point in the list that exists in our DB
      const firstMatch = db.find(p => 
        highlightedPoints.some(hp => hp.toUpperCase() === p.code.toUpperCase())
      );
      if (firstMatch) {
        setActiveView(firstMatch);
        setImageError(false);
      }
    } else {
      setActiveView(null); // Reset to default if no query
    }
  }, [highlightedPoints, db]);

  // 3. Render
  if (loading) {
    return (
      <div className={`relative h-full w-full flex items-center justify-center bg-white ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-jade border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading Anatomy...</span>
        </div>
      </div>
    );
  }

  // Default View (No Search) -> Show Front Body
  if (!activeView) {
    return (
      <div className={`relative h-full w-full flex items-center justify-center bg-white ${className}`}>
        <img
          src="/body-maps/body_front.png"
          alt="Body Default"
          className="max-h-full max-w-full object-contain opacity-80"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-500">
          Waiting for Brain Signal...
        </div>
      </div>
    );
  }

  // Active View with Point Highlight
  return (
    <div className={`relative h-full w-full flex items-center justify-center bg-white group ${className}`}>
      {/* The Dynamic Body Part Image */}
      {!imageError ? (
        <img
          src={`/body-maps/${activeView.image_file}`}
          alt={activeView.name}
          className="max-h-full max-w-full object-contain shadow-sm rounded-lg"
          onError={() => {
            console.warn(`Image not found: /body-maps/${activeView.image_file}`);
            setImageError(true);
          }}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <span className="text-4xl">📍</span>
          <span className="text-sm">{activeView.image_file}</span>
        </div>
      )}

      {/* The Red Dot Overlay */}
      <div
        className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-lg z-10"
        style={{
          left: `${activeView.x_percent}%`,
          top: `${activeView.y_percent}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Tooltip on Hover */}
        <div className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
          {activeView.code}: {activeView.name}
        </div>
      </div>

      {/* Caption */}
      <div className="absolute top-2 start-2 bg-white/90 px-2 py-1 rounded border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1">
        <span className="text-red-500">●</span>
        {activeView.code}
      </div>

      {/* All Active Points Badge */}
      {highlightedPoints.length > 1 && (
        <div className="absolute top-2 end-2 flex flex-wrap gap-1 max-w-[120px]">
          {highlightedPoints.slice(0, 5).map(point => (
            <span
              key={point}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                point.toUpperCase() === activeView.code.toUpperCase()
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {point}
            </span>
          ))}
          {highlightedPoints.length > 5 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-500">
              +{highlightedPoints.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
