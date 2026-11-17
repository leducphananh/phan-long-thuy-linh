'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface JoystickMoveEvent {
  /** Normalized X vector in [-1, 1] (negative = left, positive = right) */
  x: number;
  /** Normalized Y/Z vector in [-1, 1] (positive = forward/up, negative = backward/down) */
  y: number;
  /** Angle in radians */
  angle: number;
  /** Intensity/distance from center in [0, 1] */
  intensity: number;
}

export interface VirtualJoystickProps {
  onMove: (event: JoystickMoveEvent) => void;
  onStop: () => void;
  size?: number; // Base diameter in px, default 92
  knobSize?: number; // Knob diameter in px, default 40
  className?: string;
}

/**
 * VirtualJoystick: Luxury Champagne Gold 360° Touch Joystick for Mobile & Web 3D Navigation
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onStop,
  size = 92,
  knobSize = 40,
  className = '',
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState<boolean>(false);

  // Keep callback refs fresh
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;

  const activePointerIdRef = useRef<number | null>(null);
  const maxRadius = (size - knobSize) / 2;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Prevent event bubbling so dragging joystick doesn't rotate 360 scene
      e.stopPropagation();
      e.preventDefault();

      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      activePointerIdRef.current = e.pointerId;
      setIsActive(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);

      const targetX = Math.cos(angle) * clampedDist;
      const targetY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: targetX, y: targetY });

      const normX = clampedDist > 0 ? targetX / maxRadius : 0;
      // Invert Y so up on joystick = positive (forward)
      const normY = clampedDist > 0 ? -targetY / maxRadius : 0;

      onMoveRef.current({
        x: normX,
        y: normY,
        angle,
        intensity: clampedDist / maxRadius,
      });
    },
    [maxRadius]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isActive || activePointerIdRef.current !== e.pointerId || !baseRef.current) return;
      e.stopPropagation();
      e.preventDefault();

      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);

      const targetX = Math.cos(angle) * clampedDist;
      const targetY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: targetX, y: targetY });

      const normX = clampedDist > 0 ? targetX / maxRadius : 0;
      const normY = clampedDist > 0 ? -targetY / maxRadius : 0;

      onMoveRef.current({
        x: normX,
        y: normY,
        angle,
        intensity: clampedDist / maxRadius,
      });
    },
    [isActive, maxRadius]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current === e.pointerId) {
        e.stopPropagation();
        e.preventDefault();
        activePointerIdRef.current = null;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        onStopRef.current();
      }
    },
    []
  );

  // Safety cleanup if unmounted while dragging
  useEffect(() => {
    return () => {
      onStopRef.current();
    };
  }, []);

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative select-none touch-none flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-label="Cần gạt di chuyển 360 độ"
      role="slider"
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={isActive ? knobPos.y : 0}
    >
      {/* Outer Glow Ring */}
      <div
        className={`absolute inset-0 rounded-full border transition-all duration-200 pointer-events-none ${
          isActive
            ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/30'
            : 'border-amber-500/30 bg-stone-950/70 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.6)]'
        }`}
      />

      {/* Direction Guide Crosshairs (Subtle luxury gold accents) */}
      <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent absolute" />
      </div>

      {/* Inner Direction Tick Marks */}
      <div className="absolute top-1 text-[8px] font-bold text-amber-300/60 pointer-events-none uppercase tracking-tighter">
        ▲
      </div>
      <div className="absolute bottom-1 text-[8px] font-bold text-amber-300/60 pointer-events-none uppercase tracking-tighter">
        ▼
      </div>
      <div className="absolute left-1.5 text-[8px] font-bold text-amber-300/60 pointer-events-none uppercase tracking-tighter">
        ◀
      </div>
      <div className="absolute right-1.5 text-[8px] font-bold text-amber-300/60 pointer-events-none uppercase tracking-tighter">
        ▶
      </div>

      {/* Center Anchor Point */}
      <div className="w-2 h-2 rounded-full bg-amber-400/30 pointer-events-none" />

      {/* Draggable Inner Knob */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform will-change-transform flex items-center justify-center"
        style={{
          width: knobSize,
          height: knobSize,
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
          transition: isActive ? 'none' : 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Knob Body */}
        <div
          className={`w-full h-full rounded-full border flex items-center justify-center transition-all ${
            isActive
              ? 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
              : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border-amber-300/70 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* Knob Inner Ring & Diamond Dot */}
          <div className="w-4 h-4 rounded-full border border-amber-900/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-950/70" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
