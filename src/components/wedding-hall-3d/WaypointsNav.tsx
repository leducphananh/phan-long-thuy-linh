import * as THREE from 'three';
import { Waypoint, HALL_WAYPOINTS } from '../../types/virtual-hall';

export interface WaypointsNavOptions {
  activeWaypointId?: string;
  onSelectWaypoint?: (id: string) => void;
  waypoints?: Waypoint[];
  goldColor?: string | number;
  activeColor?: string | number;
}

export interface WaypointsNavResult {
  group: THREE.Group;
  interactiveObjects: THREE.Object3D[];
  setActiveWaypoint: (id: string) => void;
  update: (time: number) => void;
  handleClick: (raycaster: THREE.Raycaster) => string | null;
  dispose: () => void;
}

interface WaypointMarkerElements {
  id: string;
  group: THREE.Group;
  innerDisc: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  coreRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  pulseRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  dashedRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  beacon: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  badgeSprite: THREE.Sprite;
  activeTexture: THREE.CanvasTexture | null;
  inactiveTexture: THREE.CanvasTexture | null;
  hitbox: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
}

/**
 * Draws a rounded rectangle path on canvas (compatible across all environments)
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Procedural radial gradient texture for the inner glowing disk on the floor.
 * Safe for SSR.
 */
function createRadialGlowTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 248, 235, 0.95)');
  grad.addColorStop(0.35, 'rgba(212, 175, 55, 0.65)');
  grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
  grad.addColorStop(1, 'rgba(212, 175, 55, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural canvas texture for stylish waypoint text badges.
 * Displays short name with gold borders, refined typography, and active/inactive state indicators.
 * Safe for SSR.
 */
function createWaypointBadgeTexture(
  shortName: string,
  isActive: boolean
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 160);

  const padX = 24;
  const padY = 16;
  const badgeW = 512 - padX * 2;
  const badgeH = 160 - padY * 2;

  // Outer subtle drop glow
  ctx.save();
  ctx.shadowColor = isActive ? 'rgba(255, 245, 234, 0.65)' : 'rgba(212, 175, 55, 0.4)';
  ctx.shadowBlur = isActive ? 16 : 8;
  ctx.shadowOffsetY = 2;

  // Background pill / rounded rect
  drawRoundedRect(ctx, padX, padY, badgeW, badgeH, 24);
  const bgGrad = ctx.createLinearGradient(0, padY, 0, padY + badgeH);
  if (isActive) {
    bgGrad.addColorStop(0, 'rgba(40, 28, 18, 0.94)');
    bgGrad.addColorStop(0.5, 'rgba(56, 38, 22, 0.96)');
    bgGrad.addColorStop(1, 'rgba(32, 22, 14, 0.94)');
  } else {
    bgGrad.addColorStop(0, 'rgba(22, 16, 12, 0.88)');
    bgGrad.addColorStop(0.5, 'rgba(32, 24, 18, 0.90)');
    bgGrad.addColorStop(1, 'rgba(18, 12, 10, 0.88)');
  }
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Border
  ctx.strokeStyle = isActive ? '#FFF5EA' : '#D4AF37';
  ctx.lineWidth = isActive ? 3 : 2;
  ctx.stroke();
  ctx.restore();

  // Subtle inner accent line
  ctx.save();
  drawRoundedRect(ctx, padX + 5, padY + 5, badgeW - 10, badgeH - 10, 20);
  ctx.strokeStyle = isActive ? 'rgba(255, 245, 234, 0.35)' : 'rgba(212, 175, 55, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Text: Short Name
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isActive ? '#FFFFFF' : '#FFF5EA';
  ctx.font = 'bold 36px "Playfair Display", "Cinzel", "Georgia", serif';
  ctx.shadowColor = isActive ? 'rgba(255, 245, 234, 0.7)' : 'rgba(212, 175, 55, 0.5)';
  ctx.shadowBlur = 8;
  const titleY = padY + 44;
  ctx.fillText(isActive ? `✦ ${shortName} ✦` : shortName, 256, titleY);

  // Subtitle / Action hint
  ctx.shadowBlur = 0;
  ctx.font = 'italic 18px "Playfair Display", "Cinzel", "Georgia", serif';
  ctx.fillStyle = isActive ? '#F5D77F' : '#D4AF37';
  const subY = padY + 88;
  ctx.fillText(isActive ? '• Vị trí hiện tại •' : 'Nhấn để di chuyển', 256, subY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Creates the 3D Waypoint Navigation system:
 * - 4 glowing ring markers on the floor
 * - Gentle pulsing ripple animations
 * - Floating text badges ("Cổng hoa", "Ảnh cưới 1", "Ảnh cưới 2", "Sân khấu")
 * - Raycaster click detection to trigger waypoint selection
 */
export function createWaypointsNav(options: WaypointsNavOptions = {}): WaypointsNavResult {
  const {
    activeWaypointId = HALL_WAYPOINTS[0].id,
    onSelectWaypoint,
    waypoints = HALL_WAYPOINTS,
    goldColor = 0xd4af37,
    activeColor = 0xfff5ea,
  } = options;

  const group = new THREE.Group();
  group.name = 'WaypointsNavGroup';

  const interactiveObjects: THREE.Object3D[] = [];
  const markers: WaypointMarkerElements[] = [];
  const allocatedTextures: THREE.CanvasTexture[] = [];

  let currentActiveId = activeWaypointId;

  // Shared radial texture for floor disc
  const radialTexture = createRadialGlowTexture();
  if (radialTexture) allocatedTextures.push(radialTexture);

  // Geometries for ring markers
  const discGeo = new THREE.CircleGeometry(0.5, 32);
  const coreRingGeo = new THREE.RingGeometry(0.5, 0.58, 48);
  const pulseRingGeo = new THREE.RingGeometry(0.72, 0.8, 48);
  const dashedRingGeo = new THREE.RingGeometry(0.92, 0.95, 48);
  const beaconGeo = new THREE.CylinderGeometry(0.42, 0.52, 0.85, 24, 1, true);
  const hitGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.9, 16);

  waypoints.forEach((wp) => {
    const isActive = wp.id === currentActiveId;
    const markerGroup = new THREE.Group();
    markerGroup.name = `Waypoint_${wp.id}`;

    // Place marker on floor at waypoint camera position's X and Z
    // Floor is Y = 0, carpet is Y = 0.015. Place marker at Y = 0.035 to prevent z-fighting.
    const markerX = wp.cameraPosition[0];
    const markerY = 0.035;
    const markerZ = wp.cameraPosition[2];
    markerGroup.position.set(markerX, markerY, markerZ);

    // 1. Inner soft glowing disc
    const innerDiscMat = new THREE.MeshBasicMaterial({
      map: radialTexture ?? undefined,
      color: isActive ? activeColor : goldColor,
      transparent: true,
      opacity: isActive ? 0.85 : 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const innerDisc = new THREE.Mesh(discGeo, innerDiscMat);
    innerDisc.rotation.x = -Math.PI / 2;
    markerGroup.add(innerDisc);

    // 2. Core solid gold ring
    const coreRingMat = new THREE.MeshBasicMaterial({
      color: isActive ? activeColor : goldColor,
      transparent: true,
      opacity: isActive ? 0.95 : 0.8,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.rotation.x = -Math.PI / 2;
    markerGroup.add(coreRing);

    // 3. Outer pulsing ripple ring
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: isActive ? activeColor : goldColor,
      transparent: true,
      opacity: isActive ? 0.6 : 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.x = -Math.PI / 2;
    markerGroup.add(pulseRing);

    // 4. Dashed celestial dial ring
    const dashedRingMat = new THREE.MeshBasicMaterial({
      color: goldColor,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const dashedRing = new THREE.Mesh(dashedRingGeo, dashedRingMat);
    dashedRing.rotation.x = -Math.PI / 2;
    markerGroup.add(dashedRing);

    // 5. Subtle vertical light beam / beacon
    const beaconMat = new THREE.MeshBasicMaterial({
      color: isActive ? activeColor : goldColor,
      transparent: true,
      opacity: isActive ? 0.28 : 0.14,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.425, 0);
    markerGroup.add(beacon);

    // 6. Pre-generate active and inactive text badge textures
    const activeTexture = createWaypointBadgeTexture(wp.shortName, true);
    const inactiveTexture = createWaypointBadgeTexture(wp.shortName, false);
    if (activeTexture) allocatedTextures.push(activeTexture);
    if (inactiveTexture) allocatedTextures.push(inactiveTexture);

    const initialTexture = isActive ? activeTexture : inactiveTexture;
    const spriteMat = new THREE.SpriteMaterial({
      map: initialTexture ?? undefined,
      transparent: true,
      opacity: 0.95,
      depthTest: true,
      depthWrite: false,
    });
    const badgeSprite = new THREE.Sprite(spriteMat);
    badgeSprite.scale.set(1.2, 0.38, 1.0);
    badgeSprite.position.set(0, 0.72, 0);
    badgeSprite.userData = { waypointId: wp.id, isWaypoint: true };
    markerGroup.add(badgeSprite);

    // 7. Transparent hit cylinder for reliable pointer/touch detection
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hitbox = new THREE.Mesh(hitGeo, hitMat);
    hitbox.position.set(0, 0.45, 0);
    hitbox.userData = { waypointId: wp.id, isWaypoint: true };
    markerGroup.add(hitbox);

    // Register interactive raycasting targets
    interactiveObjects.push(hitbox);
    interactiveObjects.push(badgeSprite);

    group.add(markerGroup);

    markers.push({
      id: wp.id,
      group: markerGroup,
      innerDisc,
      coreRing,
      pulseRing,
      dashedRing,
      beacon,
      badgeSprite,
      activeTexture,
      inactiveTexture,
      hitbox,
    });
  });

  /**
   * Sets the active waypoint, updating visuals and badges accordingly
   */
  const setActiveWaypoint = (newId: string): void => {
    currentActiveId = newId;

    markers.forEach((item) => {
      const isNowActive = item.id === newId;

      // Update badge texture
      const targetTexture = isNowActive ? item.activeTexture : item.inactiveTexture;
      if (targetTexture && item.badgeSprite.material.map !== targetTexture) {
        item.badgeSprite.material.map = targetTexture;
        item.badgeSprite.material.needsUpdate = true;
      }

      // Update colors & opacities
      const col = isNowActive ? activeColor : goldColor;
      item.innerDisc.material.color.set(col);
      item.innerDisc.material.opacity = isNowActive ? 0.85 : 0.5;

      item.coreRing.material.color.set(col);
      item.coreRing.material.opacity = isNowActive ? 0.95 : 0.8;

      item.pulseRing.material.color.set(col);
      item.pulseRing.material.opacity = isNowActive ? 0.6 : 0.35;

      item.beacon.material.color.set(col);
      item.beacon.material.opacity = isNowActive ? 0.28 : 0.14;
    });
  };

  /**
   * Updates marker animations: pulsing rings, rotating dials, floating badges
   */
  const update = (time: number): void => {
    markers.forEach((item, index) => {
      const isItemActive = item.id === currentActiveId;
      const phase = time * 2.6 + index * 1.3;

      // Outer pulse ring scaling and opacity
      const pulse = Math.sin(phase);
      const scaleVal = 1.0 + (isItemActive ? 0.16 : 0.1) * pulse;
      item.pulseRing.scale.set(scaleVal, scaleVal, 1);
      item.pulseRing.material.opacity = (isItemActive ? 0.5 : 0.3) + 0.2 * pulse;

      // Rotate dashed celestial dial
      const rotSpeed = (index % 2 === 0 ? 0.15 : -0.15);
      item.dashedRing.rotation.z = time * rotSpeed;

      // Floating bobbing motion for text badge
      const bob = Math.sin(time * 2.0 + index * 1.1) * 0.035;
      item.badgeSprite.position.y = 0.72 + bob;

      // Beacon subtle shimmer and slow rotation
      item.beacon.rotation.y = time * 0.2;
      const shimmer = Math.sin(time * 3.2 + index);
      item.beacon.material.opacity = (isItemActive ? 0.26 : 0.12) + 0.05 * shimmer;
    });
  };

  /**
   * Raycaster click detection: returns waypoint id if intersected, and invokes onSelectWaypoint callback
   */
  const handleClick = (raycaster: THREE.Raycaster): string | null => {
    const intersects = raycaster.intersectObjects(interactiveObjects, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const hitWpId = hit.userData?.waypointId as string | undefined;
      if (hitWpId) {
        if (onSelectWaypoint) {
          onSelectWaypoint(hitWpId);
        }
        return hitWpId;
      }
    }
    return null;
  };

  /**
   * Disposes all geometries, materials, and textures
   */
  const dispose = (): void => {
    allocatedTextures.forEach((tex) => tex.dispose());
    allocatedTextures.length = 0;

    discGeo.dispose();
    coreRingGeo.dispose();
    pulseRingGeo.dispose();
    dashedRingGeo.dispose();
    beaconGeo.dispose();
    hitGeo.dispose();

    group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
    });

    interactiveObjects.length = 0;
    markers.length = 0;
  };

  return {
    group,
    interactiveObjects,
    setActiveWaypoint,
    update,
    handleClick,
    dispose,
  };
}

/**
 * Helper to cleanly dispose a WaypointsNav instance or group
 */
export function disposeWaypointsNav(
  target: WaypointsNavResult | THREE.Group
): void {
  if ('dispose' in target && typeof target.dispose === 'function') {
    target.dispose();
  } else if (target instanceof THREE.Group) {
    target.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
    });
  }
}
