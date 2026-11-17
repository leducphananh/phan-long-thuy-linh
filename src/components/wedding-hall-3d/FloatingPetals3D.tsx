import * as THREE from 'three';

export interface FloatingPetalsOptions {
  count?: number; // default: 40 petals
  minY?: number; // default: 0.05m (floor level)
  maxY?: number; // default: 6.5m (near ceiling)
  areaWidth?: number; // default: 11m (hall width is 14m, petal spread: -5.5m to 5.5m)
  areaLength?: number; // default: 26m (carpet is 24m, petal spread: -13m to 13m)
}

export interface FloatingPetalsResult {
  mesh: THREE.InstancedMesh;
  update: (delta: number) => void;
  dispose: () => void;
}

/**
 * Creates an organic curved rose petal geometry.
 * Deforms a quad into a delicate convex/concave bowl with tapered base.
 */
function createCurvedPetalGeometry(): THREE.BufferGeometry {
  const width = 0.14;
  const height = 0.18;
  const segments = 4;
  const geo = new THREE.PlaneGeometry(width, height, segments, segments);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    // Normalized coordinates (-1 to +1)
    const nx = x / (width / 2);
    const ny = y / (height / 2);

    // Organic cup curve in Z: center hollows back, edges cup gently forward
    const z = nx * nx * 0.022 - ny * 0.012;

    // Slight lateral petal taper toward stem base (ny < 0)
    let finalX = x;
    if (ny < 0) {
      const taper = 1.0 + ny * 0.35;
      finalX = x * taper;
    }

    pos.setXYZ(i, finalX, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Romantic rose petal color palette:
 * Variations of velvet crimson, ruby, warm coral, and blush rose.
 */
const ROSE_PALETTE: readonly string[] = [
  '#C9184A', // Deep rich ruby
  '#E63946', // Classic wedding red
  '#9E1B32', // Velvet royal crimson
  '#FF4D6D', // Romantic coral rose
  '#FF758F', // Soft blush petal pink
  '#D90429', // Vivid rose scarlet
  '#F72585', // Radiant magenta rose
];

interface PetalState {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseZ: number;
  scale: number;
  fallSpeed: number; // m/s
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  swayFreqX: number;
  swayFreqZ: number;
  swayAmpX: number;
  swayAmpZ: number;
  phase: number;
}

/**
 * Builds the 3D floating rose petal particle system:
 * - 40 delicate curved rose petals rendered with a single THREE.InstancedMesh
 * - Per-instance romantic wedding color palette
 * - Realistic aerodynamic flutter, wind sway, and tumble falling from ceiling (6.5m) to floor (0m)
 * - Seamless looping: resets to top when reaching the floor
 * - 0 GC allocation in update loop
 */
export function createFloatingPetals3D(
  options?: FloatingPetalsOptions
): FloatingPetalsResult {
  const {
    count = 40,
    minY = 0.05,
    maxY = 6.5,
    areaWidth = 11,
    areaLength = 26,
  } = options || {};

  const petalGeo = createCurvedPetalGeometry();

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Tinted per-instance by instanceColor
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  });

  const instancedMesh = new THREE.InstancedMesh(petalGeo, petalMat, count);
  instancedMesh.name = 'FloatingPetals3D';
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = false;

  // Initialize per-instance colors and particle physical states
  const particles: PetalState[] = [];
  const dummy = new THREE.Object3D();
  const tempColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // Pick petal color from palette
    const colorHex = ROSE_PALETTE[i % ROSE_PALETTE.length];
    tempColor.set(colorHex);
    instancedMesh.setColorAt(i, tempColor);

    // Initial position: pre-scatter across full vertical height (minY to maxY)
    // so petals are already floating when scene opens
    const initialY = minY + Math.random() * (maxY - minY);
    const initialBaseX = (Math.random() - 0.5) * areaWidth;
    const initialBaseZ = (Math.random() - 0.5) * areaLength;
    const scale = 0.75 + Math.random() * 0.5;

    const rotX = Math.random() * Math.PI * 2;
    const rotY = Math.random() * Math.PI * 2;
    const rotZ = Math.random() * Math.PI * 2;

    const state: PetalState = {
      x: initialBaseX,
      y: initialY,
      z: initialBaseZ,
      baseX: initialBaseX,
      baseZ: initialBaseZ,
      scale,
      fallSpeed: 0.35 + Math.random() * 0.4, // 0.35 - 0.75 m/s slow romantic descent
      rotX,
      rotY,
      rotZ,
      rotSpeedX: (Math.random() - 0.5) * 1.6,
      rotSpeedY: (Math.random() - 0.5) * 1.4,
      rotSpeedZ: (Math.random() - 0.5) * 1.5,
      swayFreqX: 1.1 + Math.random() * 1.2,
      swayFreqZ: 0.8 + Math.random() * 0.9,
      swayAmpX: 0.25 + Math.random() * 0.35,
      swayAmpZ: 0.18 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    };
    particles.push(state);

    // Set initial transform
    dummy.position.set(state.x, state.y, state.z);
    dummy.rotation.set(state.rotX, state.rotY, state.rotZ);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  }

  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true;
  }
  instancedMesh.instanceMatrix.needsUpdate = true;

  let elapsedTime = 0;

  /**
   * Updates petal positions and tumbling in the render loop.
   * Clamps delta to avoid huge jumps on frame drops.
   */
  const update = (delta: number) => {
    // Clamp delta (e.g. 0 to 0.1s) to prevent simulation explosions
    const safeDelta = Math.min(Math.max(delta, 0), 0.1);
    elapsedTime += safeDelta;

    for (let i = 0; i < count; i++) {
      const p = particles[i];

      // 1. Vertical descent
      p.y -= p.fallSpeed * safeDelta;

      // 2. Loop reset when hitting floor
      if (p.y <= minY) {
        p.y = maxY + Math.random() * 0.5;
        p.baseX = (Math.random() - 0.5) * areaWidth;
        p.baseZ = (Math.random() - 0.5) * areaLength;
        p.phase = Math.random() * Math.PI * 2;
        p.rotX = Math.random() * Math.PI * 2;
        p.rotY = Math.random() * Math.PI * 2;
        p.rotZ = Math.random() * Math.PI * 2;
      }

      // 3. Fluid sinusoidal wind sway
      const swayX =
        Math.sin(elapsedTime * p.swayFreqX + p.phase) * p.swayAmpX +
        Math.sin(elapsedTime * 0.45) * 0.12;
      const swayZ =
        Math.cos(elapsedTime * p.swayFreqZ + p.phase) * p.swayAmpZ;

      p.x = p.baseX + swayX;
      p.z = p.baseZ + swayZ;

      // 4. Gentle tumbling rotations
      p.rotX += p.rotSpeedX * safeDelta + Math.sin(elapsedTime + p.phase) * 0.015;
      p.rotY += p.rotSpeedY * safeDelta;
      p.rotZ += p.rotSpeedZ * safeDelta + Math.cos(elapsedTime * 1.2 + p.phase) * 0.015;

      // 5. Update instanced matrix
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
  };

  /**
   * Disposes geometries and materials to avoid WebGL memory leaks
   */
  const dispose = () => {
    petalGeo.dispose();
    petalMat.dispose();
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor = null;
    }
    particles.length = 0;
  };

  return {
    mesh: instancedMesh,
    update,
    dispose,
  };
}

/**
 * Standalone disposal helper for FloatingPetals3D
 */
export function disposeFloatingPetals3D(
  target: FloatingPetalsResult | THREE.InstancedMesh
): void {
  if ('dispose' in target && typeof target.dispose === 'function') {
    target.dispose();
  } else if (target instanceof THREE.InstancedMesh) {
    if (target.geometry) target.geometry.dispose();
    if (target.material) {
      if (Array.isArray(target.material)) {
        target.material.forEach((m) => m.dispose());
      } else {
        target.material.dispose();
      }
    }
  }
}
