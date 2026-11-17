'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HALL_WAYPOINTS, Waypoint, PhotoFrameData } from '../../types/virtual-hall';
import { createHallFloorAndCarpet, disposeHallFloorAndCarpet } from './HallFloorAndCarpet';
import { setupHallLighting, HallLightingResult } from './HallLighting';
import { createStageAndArch, disposeStageAndArch } from './StageAndArch';
import { createPhotoFramesGallery, PhotoFramesGalleryResult } from './PhotoFramesGallery';
import { createFloatingPetals3D, FloatingPetalsResult } from './FloatingPetals3D';
import { createWaypointsNav, WaypointsNavResult } from './WaypointsNav';

export interface HallSceneProps {
  activeWaypointId: string;
  onWaypointChange: (id: string) => void;
  onPhotoClick: (photo: PhotoFrameData) => void;
  className?: string;
  onLoaded?: () => void;
}

interface CameraTransitionState {
  active: boolean;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startYaw: number;
  endYaw: number;
  startPitch: number;
  endPitch: number;
  startTime: number;
  duration: number;
}

/**
 * Smooth cubic ease-in-out easing function
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * HallScene: The core 3D Canvas orchestrator for the Virtual Wedding Hall.
 * Integrates:
 * - WebGLRenderer with ACES Filmic Tone Mapping and soft shadows
 * - 360° Orbit Look-Around with vertical angle constraints
 * - 1.2s smooth camera flight interpolation when switching waypoints
 * - Pointer/Touch raycasting with drag-threshold discrimination
 * - Full memory management and resource cleanup
 */
export const HallScene: React.FC<HallSceneProps> = ({
  activeWaypointId,
  onWaypointChange,
  onPhotoClick,
  className = '',
  onLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep callback refs fresh without triggering full scene re-instantiation
  const onWaypointChangeRef = useRef(onWaypointChange);
  onWaypointChangeRef.current = onWaypointChange;

  const onPhotoClickRef = useRef(onPhotoClick);
  onPhotoClickRef.current = onPhotoClick;

  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  // External function ref to trigger camera transition from prop changes
  const triggerTransitionRef = useRef<((targetId: string) => void) | null>(null);
  const currentWaypointIdRef = useRef(activeWaypointId);

  // Listen to prop changes in activeWaypointId
  useEffect(() => {
    if (currentWaypointIdRef.current !== activeWaypointId) {
      currentWaypointIdRef.current = activeWaypointId;
      triggerTransitionRef.current?.(activeWaypointId);
    }
  }, [activeWaypointId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;
    let hasNotifiedLoaded = false;

    // 1. Initial dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Setup Scene & Atmospheric Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#141018');
    scene.fog = new THREE.FogExp2('#141018', 0.015);

    // 3. Initial Waypoint & Camera
    const initialWaypoint: Waypoint =
      HALL_WAYPOINTS.find((w) => w.id === currentWaypointIdRef.current) || HALL_WAYPOINTS[0];

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(...initialWaypoint.cameraPosition);

    // 4. WebGLRenderer with high-end photographic settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Ensure touch gestures don't trigger page scroll inside canvas
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.outline = 'none';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    // 5. 360° First-Person Panorama Look-Around State
    // Calculate initial orientation towards initial waypoint's look target
    const initCamPos = new THREE.Vector3(...initialWaypoint.cameraPosition);
    const initTargetPos = new THREE.Vector3(...initialWaypoint.targetPosition);
    const initDir = new THREE.Vector3().subVectors(initTargetPos, initCamPos).normalize();

    const initialYaw = Math.atan2(initDir.x, -initDir.z);
    const initialPitch = Math.asin(Math.max(-0.99, Math.min(0.99, initDir.y)));

    let currentYaw = initialYaw;
    let currentPitch = initialPitch;
    let targetYaw = initialYaw;
    let targetPitch = initialPitch;

    // Pitch limits: -55° looking down at floor to +55° looking up at chandeliers
    const maxPitch = Math.PI / 3.25;

    // Smooth FOV zoom (between 38° telephoto and 75° wide-angle)
    let targetFov = 60;
    const minFov = 38;
    const maxFov = 75;

    // 6. Mount Sub-modules
    // A. Floor and Luxury Velvet Carpet
    const floorGroup = createHallFloorAndCarpet();
    scene.add(floorGroup);

    // B. Lighting and Chandeliers
    const lighting: HallLightingResult = setupHallLighting(scene);

    // C. Wedding Stage and Floral Arches
    const stageGroup = createStageAndArch();
    scene.add(stageGroup);

    // D. Interactive Photo Frames Gallery
    const gallery: PhotoFramesGalleryResult = createPhotoFramesGallery({
      onSelectPhoto: (photo) => {
        onPhotoClickRef.current(photo);
      },
    });
    scene.add(gallery.group);

    // E. Floating Rose Petals Particle System
    const petals: FloatingPetalsResult = createFloatingPetals3D({ count: 40 });
    scene.add(petals.mesh);

    // F. Glowing Waypoints Navigation Markers
    const waypointsNav: WaypointsNavResult = createWaypointsNav({
      activeWaypointId: currentWaypointIdRef.current,
      onSelectWaypoint: (selectedId) => {
        if (currentWaypointIdRef.current !== selectedId) {
          currentWaypointIdRef.current = selectedId;
          onWaypointChangeRef.current(selectedId);
          startCameraTransition(selectedId);
        }
      },
    });
    scene.add(waypointsNav.group);

    // 7. Smooth Camera Transition Controller (~1.2s flight)
    const transition: CameraTransitionState = {
      active: false,
      startPos: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      startYaw: initialYaw,
      endYaw: initialYaw,
      startPitch: initialPitch,
      endPitch: initialPitch,
      startTime: 0,
      duration: 1200,
    };

    const startCameraTransition = (targetWpId: string): void => {
      const targetWp = HALL_WAYPOINTS.find((w) => w.id === targetWpId);
      if (!targetWp) return;

      waypointsNav.setActiveWaypoint(targetWp.id);

      transition.startPos.copy(camera.position);
      transition.endPos.set(...targetWp.cameraPosition);

      const targetDir = new THREE.Vector3(...targetWp.targetPosition)
        .sub(new THREE.Vector3(...targetWp.cameraPosition))
        .normalize();

      let targetEndYaw = Math.atan2(targetDir.x, -targetDir.z);
      const targetEndPitch = Math.asin(Math.max(-0.99, Math.min(0.99, targetDir.y)));

      // Shortest circular angle distance
      while (targetEndYaw - currentYaw > Math.PI) targetEndYaw -= Math.PI * 2;
      while (targetEndYaw - currentYaw < -Math.PI) targetEndYaw += Math.PI * 2;

      transition.startYaw = currentYaw;
      transition.endYaw = targetEndYaw;
      transition.startPitch = currentPitch;
      transition.endPitch = targetEndPitch;
      transition.startTime = performance.now();
      transition.duration = 1200; // 1.2s smooth glide
      transition.active = true;
    };

    triggerTransitionRef.current = startCameraTransition;

    // 8. 360° Drag & Click Interaction Handling
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let pointerStartX = 0;
    let pointerStartY = 0;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let pointerStartTime = 0;
    let isPointerDown = false;

    const onPointerDown = (e: PointerEvent): void => {
      if (transition.active) return;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      pointerStartTime = performance.now();
      isPointerDown = true;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (isPointerDown && !transition.active) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;

        // Smooth rotation based on current FOV (turn slower when zoomed in)
        const sensitivity = 0.0035 * (camera.fov / 60);
        targetYaw -= deltaX * sensitivity;
        targetPitch += deltaY * sensitivity;
        targetPitch = Math.max(-maxPitch, Math.min(maxPitch, targetPitch));
      } else {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        // Photo frame hover highlight
        const hoveredPhoto = gallery.handlePointerMove(raycaster);

        // Check waypoint hover
        const wpIntersects = raycaster.intersectObjects(waypointsNav.interactiveObjects, false);

        if (hoveredPhoto || wpIntersects.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
        } else {
          renderer.domElement.style.cursor = isPointerDown ? 'grabbing' : 'grab';
        }
      }
    };

    const onPointerUp = (e: PointerEvent): void => {
      if (!isPointerDown) return;
      isPointerDown = false;
      renderer.domElement.style.cursor = 'grab';

      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;
      const distance = Math.hypot(dx, dy);
      const elapsed = performance.now() - pointerStartTime;

      // Threshold: if dragged less than 8px within 400ms, it is a deliberate tap/click
      if (distance < 8 && elapsed < 400 && !transition.active) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        // 1. Check Waypoint markers first
        const hitWaypointId = waypointsNav.handleClick(raycaster);
        if (hitWaypointId) {
          if (currentWaypointIdRef.current !== hitWaypointId) {
            currentWaypointIdRef.current = hitWaypointId;
            onWaypointChangeRef.current(hitWaypointId);
            startCameraTransition(hitWaypointId);
          }
          return;
        }

        // 2. Check Photo frames
        const hitPhoto = gallery.handleClick(raycaster);
        if (hitPhoto) {
          onPhotoClickRef.current(hitPhoto);
          return;
        }
      }
    };

    const onPointerCancel = (): void => {
      isPointerDown = false;
      renderer.domElement.style.cursor = 'grab';
    };

    // Zoom Handling (Wheel & Touch Pinch)
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const zoomSpeed = 0.035;
      targetFov = Math.max(minFov, Math.min(maxFov, targetFov + e.deltaY * zoomSpeed));
    };

    let isPinching = false;
    let initialPinchDist = 0;
    let initialPinchFov = 60;

    const onTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        isPinching = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialPinchFov = targetFov;
      }
    };

    const onTouchMove = (e: TouchEvent): void => {
      if (isPinching && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (initialPinchDist > 0 && currentDist > 0) {
          const scale = initialPinchDist / currentDist;
          targetFov = Math.max(minFov, Math.min(maxFov, initialPinchFov * scale));
        }
      }
    };

    const onTouchEnd = (e: TouchEvent): void => {
      if (e.touches.length < 2) {
        isPinching = false;
      }
    };

    const onContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerCancel);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    domElement.addEventListener('touchend', onTouchEnd, { passive: true });
    domElement.addEventListener('contextmenu', onContextMenu);

    // 9. Responsive Resize Handler
    const handleResize = (): void => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', handleResize);

    // 10. Animation & Render Loop
    const clock = new THREE.Clock();

    const animate = (): void => {
      if (isDisposed) return;

      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const now = performance.now();

      // 1. Camera Flight Transition
      if (transition.active) {
        const progress = Math.min((now - transition.startTime) / transition.duration, 1.0);
        const t = easeInOutCubic(progress);

        camera.position.lerpVectors(transition.startPos, transition.endPos, t);
        currentYaw = THREE.MathUtils.lerp(transition.startYaw, transition.endYaw, t);
        targetYaw = currentYaw;
        currentPitch = THREE.MathUtils.lerp(transition.startPitch, transition.endPitch, t);
        targetPitch = currentPitch;

        if (progress >= 1.0) {
          camera.position.copy(transition.endPos);
          currentYaw = transition.endYaw;
          targetYaw = transition.endYaw;
          currentPitch = transition.endPitch;
          targetPitch = transition.endPitch;
          transition.active = false;
        }
      } else {
        // 2. Smooth Damping for Look-Around
        currentYaw += (targetYaw - currentYaw) * 0.12;
        currentPitch += (targetPitch - currentPitch) * 0.12;
      }

      // Smooth FOV zoom
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov += (targetFov - camera.fov) * 0.12;
        camera.updateProjectionMatrix();
      }

      // Constrain Pitch Angle
      currentPitch = Math.max(-maxPitch, Math.min(maxPitch, currentPitch));

      // Calculate Look Vector from Camera Position (360° panorama look)
      const cosPitch = Math.cos(currentPitch);
      const lookX = Math.sin(currentYaw) * cosPitch;
      const lookY = Math.sin(currentPitch);
      const lookZ = -Math.cos(currentYaw) * cosPitch;

      camera.lookAt(
        camera.position.x + lookX,
        camera.position.y + lookY,
        camera.position.z + lookZ
      );

      // Strict Interior Safety Bounds: never breach walls under any circumstances
      // Hall width: 14m (X: -7 to +7) -> Clamp inside [-5.5, 5.5] (1.5m clearance)
      // Hall length: 32m (Z: -16 to +16) -> Clamp inside [-13.5, 13.5] (2.5m clearance)
      // Height: Clamp Y inside [1.4, 2.2]
      camera.position.x = Math.max(-5.5, Math.min(5.5, camera.position.x));
      camera.position.z = Math.max(-13.5, Math.min(13.5, camera.position.z));
      camera.position.y = Math.max(1.4, Math.min(2.2, camera.position.y));

      // Sub-module dynamic updates
      lighting.update?.(elapsed);
      petals.update(delta);
      waypointsNav.update(elapsed);

      renderer.render(scene, camera);

      if (!hasNotifiedLoaded) {
        hasNotifiedLoaded = true;
        onLoadedRef.current?.();
      }
    };

    animate();

    // Secondary fallback in case requestAnimationFrame is queued or throttled
    const readyTimer = setTimeout(() => {
      if (!hasNotifiedLoaded) {
        hasNotifiedLoaded = true;
        onLoadedRef.current?.();
      }
    }, 300);

    // 11. Cleanup & Disposal on unmount
    return () => {
      isDisposed = true;
      clearTimeout(readyTimer);
      triggerTransitionRef.current = null;
      cancelAnimationFrame(animationFrameId);

      // Remove event listeners
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerCancel);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);
      domElement.removeEventListener('contextmenu', onContextMenu);

      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      // Dispose sub-modules
      disposeHallFloorAndCarpet(floorGroup);
      lighting.cleanup();
      disposeStageAndArch(stageGroup);
      gallery.dispose();
      petals.dispose();
      waypointsNav.dispose();

      // Dispose renderer
      renderer.dispose();

      if (domElement.parentNode === container) {
        container.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
