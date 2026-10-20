import React, { useState } from 'react';
import { Sparkles, EyeOff, Eye } from 'lucide-react';

export const FloatingPetals: React.FC = () => {
  const [enabled, setEnabled] = useState(true);

  if (!enabled) {
    return (
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setEnabled(true)}
          className="p-2 bg-white/80 backdrop-blur-xs rounded-full border border-stone-200 text-stone-600 hover:text-rose-600 shadow-md transition-all text-xs flex items-center gap-1.5"
          title="Bật hiệu ứng cánh hoa rơi"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline text-[11px] font-medium">Bật hoa rơi</span>
        </button>
      </div>
    );
  }

  // 12 subtle floating petals with varying offsets, durations, and sizes
  const petals = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: `${(i * 8.5 + 4) % 96}%`,
    animationDelay: `${(i * 1.3) % 8}s`,
    animationDuration: `${10 + (i % 5) * 2}s`,
    size: 14 + (i % 4) * 4,
    opacity: 0.35 + (i % 3) * 0.15,
  }));

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {petals.map((p) => (
          <div
            key={p.id}
            className="absolute top-[-40px] animate-petal select-none"
            style={{
              left: p.left,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
              opacity: p.opacity,
            }}
          >
            {/* SVG Rose Petal */}
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#fda4af"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setEnabled(false)}
          className="p-2 bg-white/80 backdrop-blur-xs rounded-full border border-stone-200 text-stone-500 hover:text-stone-800 shadow-md transition-all text-xs flex items-center gap-1.5"
          title="Tắt hiệu ứng cánh hoa rơi"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-medium">Tắt hoa rơi</span>
        </button>
      </div>
    </>
  );
};
