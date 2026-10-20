import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, onToggle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  // Reliable romantic wedding track (Canon in D / Romantic Piano Melody)
  const trackUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-piano-112191.mp3';

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Autoplay restricted or user gesture needed:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <audio
        ref={audioRef}
        src={trackUrl}
        loop
        preload="auto"
        onError={() => setAudioError(true)}
      />

      <div className="relative group">
        <button
          onClick={onToggle}
          className="relative flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-rose-200 text-stone-800 hover:text-rose-600 transition-all transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        >
          {/* Vinyl rotating icon */}
          <div className="relative w-7 h-7 flex items-center justify-center">
            <Disc
              className={`w-7 h-7 text-rose-500 transition-all ${
                isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'opacity-70'
              }`}
            />
            <div className="absolute w-2 h-2 rounded-full bg-stone-900 border border-white" />
          </div>

          <div className="hidden sm:flex flex-col text-left pr-2">
            <span className="text-[11px] font-bold text-stone-900 leading-none">
              Nhạc Cưới
            </span>
            <span className="text-[9px] text-stone-500 mt-0.5 leading-none">
              {isPlaying ? 'Đang phát...' : 'Nhấn để nghe'}
            </span>
          </div>

          <div className="p-1 rounded-full bg-rose-50 text-rose-600">
            {isPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
          </div>
        </button>
      </div>
    </div>
  );
};
