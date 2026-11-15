'use client';

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Volume2, VolumeX, Disc } from 'lucide-react';

export interface AudioPlayerHandle {
  toggle: () => void;
  play: () => Promise<void>;
  pause: () => void;
}

interface AudioPlayerProps {
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  ({ isPlaying, onPlayStateChange }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const audioSources = [
      '/audio/mot-doi.mp3',
      '/audio/background.mp3',
    ];
    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

    const handleAudioError = () => {
      if (currentSourceIndex < audioSources.length - 1) {
        setCurrentSourceIndex((prev) => prev + 1);
      }
    };

    useImperativeHandle(ref, () => ({
      toggle: () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
          audio.play().catch(console.error);
        } else {
          audio.pause();
        }
      },
      play: async () => {
        const audio = audioRef.current;
        if (!audio) return;
        await audio.play();
      },
      pause: () => {
        audioRef.current?.pause();
      },
    }));

    // Nhạc chỉ phát khi được gọi từ bên ngoài (khi bấm Mở Thiệp Mời hoặc bấm nút phát)
    // Tuyệt đối không gắn listener toàn cục trên window để tránh phát sớm khi người dùng chưa mở thiệp.

    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    };

    return (
      <div className="fixed bottom-5 right-5 z-40">
        <audio
          ref={audioRef}
          src={audioSources[currentSourceIndex]}
          loop
          preload="auto"
          onPlay={() => onPlayStateChange(true)}
          onPause={() => onPlayStateChange(false)}
          onError={handleAudioError}
        />

        <div className="relative group">
          <button
            onClick={handleButtonClick}
            className="relative flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-rose-200 text-stone-800 hover:text-rose-600 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
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
                Một Đời
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
  }
);

AudioPlayer.displayName = 'AudioPlayer';
