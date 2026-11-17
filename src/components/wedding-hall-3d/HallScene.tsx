'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  startTarget: THREE.Vector3;
  endTarget: THREE.Vector3;
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Ensure touch gestures don't trigger page scroll inside canvas
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.outline = 'none';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    // 5. 360° Orbit Look-Around Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Limits vertical tilt angle: prevent camera flipping or going below floor
    controls.minPolarAngle = Math.PI / 3; // ~60°
    controls.maxPolarAngle = Math.PI / 1.85; // ~97.3°
    controls.enableZoom = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 25.0;
    controls.enablePan = false; // Lock translation to preserve tour orientation
    controls.target.set(...initialWaypoint.targetPosition);
    controls.update();

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
      startTarget: new THREE.Vector3(),
      endTarget: new THREE.Vector3(),
      startTime: 0,
      duration: 1200,
    };

    const startCameraTransition = (targetWpId: string): void => {
      const targetWp = HALL_WAYPOINTS.find((w) => w.id === targetWpId);
      if (!targetWp) return;

      waypointsNav.setActiveWaypoint(targetWp.id);

      transition.startPos.copy(camera.position);
      transition.endPos.set(...targetWp.cameraPosition);
      transition.startTarget.copy(controls.target);
      transition.endTarget.set(...targetWp.targetPosition);
      transition.startTime = performance.now();
      transition.duration = 1200; // 1.2s smooth glide
      transition.active = true;

      // Temporarily disable manual orbit dragging during camera glide
      controls.enabled = false;
    };

    triggerTransitionRef.current = startCameraTransition;

    // 8. Raycaster & Interaction Handling (Drag vs Click Discrimination)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;
    let isPointerDown = false;

    const onPointerDown = (e: PointerEvent): void => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = performance.now();
      isPointerDown = true;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent): void => {
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
    };

    const onPointerUp = (e: PointerEvent): void => {
      isPointerDown = false;

      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;
      const distance = Math.hypot(dx, dy);
      const elapsed = performance.now() - pointerStartTime;

      // Threshold: if dragged less than 7px within 600ms, it is a deliberate click/tap
      if (distance < 7 && elapsed < 600) {
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

      renderer.domElement.style.cursor = 'grab';
    };

    const onPointerCancel = (): void => {
      isPointerDown = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const onContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerCancel);
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

      // Camera smooth interpolation
      if (transition.active) {
        const progress = Math.min((now - transition.startTime) / transition.duration, 1.0);
        const t = easeInOutCubic(progress);

        camera.position.lerpVectors(transition.startPos, transition.endPos, t);
        controls.target.lerpVectors(transition.startTarget, transition.endTarget, t);

        if (progress >= 1.0) {
          camera.position.copy(transition.endPos);
          controls.target.copy(transition.endTarget);
          transition.active = false;
          controls.enabled = true; // Re-enable user orbit interaction
        }
      }

      controls.update();

      // Sub-module dynamic updates
      lighting.update?.(elapsed);
      petals.update(delta);
      waypointsNav.update(elapsed);

      renderer.render(scene, camera);
    };

    animate();

    // Notify parent that the 3D scene is initialized and ready
    onLoadedRef.current?.();

    // 11. Cleanup & Disposal on unmount
    return () => {
      isDisposed = true;
      triggerTransitionRef.current = null;
      cancelAnimationFrame(animationFrameId);

      // Remove event listeners
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerCancel);
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

      // Dispose controls & renderer
      controls.dispose();
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
