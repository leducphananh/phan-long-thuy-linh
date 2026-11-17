import * as THREE from 'three';

export interface HallLightingOptions {
  ambientColor?: string | number; // default: '#fff5ea'
  ambientIntensity?: number; // default: 0.8
  dirLightColor?: string | number; // default: '#ffe8d6'
  dirLightIntensity?: number; // default: 1.0
  chandelierColor?: string | number; // default: '#fff2d6'
  chandelierIntensity?: number; // default: 1.2
  chandelierZPositions?: number[]; // default: [8, 0, -8]
  includeStageSpotlight?: boolean; // default: true
}

export interface HallLightingResult {
  lightsGroup: THREE.Group;
  chandeliersGroup: THREE.Group;
  cleanup: () => void;
  update?: (time: number) => void;
}

/**
 * Builds an individual luxury tiered crystal chandelier:
 * - Ceiling canopy & gold suspension rod
 * - 3 concentric tiered gold rings
 * - Sparkling faceted crystal pendants
 * - Glowing frosted center orb with an embedded warm PointLight
 */
function createChandelier(
  z: number,
  pointColor: string | number,
  pointIntensity: number,
  goldMat: THREE.Material,
  crystalMat: THREE.Material,
  glowMat: THREE.Material
): { fixture: THREE.Group; light: THREE.PointLight } {
  const chandelier = new THREE.Group();
  chandelier.name = `Chandelier_Z${z}`;
  chandelier.position.set(0, 0, z);

  const ceilingY = 7.0;
  const fixtureCenterY = 4.8;

  // 1. Ceiling Canopy (Gold disk)
  const canopyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.08, 24);
  const canopy = new THREE.Mesh(canopyGeo, goldMat);
  canopy.position.set(0, ceilingY - 0.04, 0);
  chandelier.add(canopy);

  // 2. Suspension Rod
  const rodLength = ceilingY - (fixtureCenterY + 0.6);
  const rodGeo = new THREE.CylinderGeometry(0.025, 0.025, rodLength, 12);
  const rod = new THREE.Mesh(rodGeo, goldMat);
  rod.position.set(0, ceilingY - rodLength / 2, 0);
  chandelier.add(rod);

  // 3. Central Gold Spindle
  const spindleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
  const spindle = new THREE.Mesh(spindleGeo, goldMat);
  spindle.position.set(0, fixtureCenterY, 0);
  chandelier.add(spindle);

  // 4. Three Tiered Concentric Gold Rings
  const tiers = [
    { y: fixtureCenterY + 0.4, radius: 0.5, count: 12, dropLength: 0.22 },
    { y: fixtureCenterY + 0.0, radius: 0.85, count: 18, dropLength: 0.3 },
    { y: fixtureCenterY - 0.35, radius: 0.4, count: 10, dropLength: 0.2 },
  ];

  const pendantGeo = new THREE.OctahedronGeometry(0.06, 0);

  tiers.forEach((tier, tierIdx) => {
    // Torus ring
    const ringGeo = new THREE.TorusGeometry(tier.radius, 0.025, 12, 32);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, tier.y, 0);
    chandelier.add(ring);

    // Radiating crystal pendants
    for (let i = 0; i < tier.count; i++) {
      const angle = (i / tier.count) * Math.PI * 2;
      const px = Math.cos(angle) * tier.radius;
      const pz = Math.sin(angle) * tier.radius;

      // Small suspension wire
      const wireGeo = new THREE.CylinderGeometry(0.005, 0.005, tier.dropLength, 6);
      const wire = new THREE.Mesh(wireGeo, goldMat);
      wire.position.set(px, tier.y - tier.dropLength / 2, pz);
      chandelier.add(wire);

      // Faceted crystal droplet
      const crystal = new THREE.Mesh(pendantGeo, crystalMat);
      crystal.position.set(px, tier.y - tier.dropLength, pz);
      crystal.scale.set(1, 1.6, 1);
      chandelier.add(crystal);
    }

    // Radial gold support spokes connecting tier to central spindle
    if (tierIdx < 2) {
      const spokeGeo = new THREE.CylinderGeometry(0.015, 0.015, tier.radius, 8);
      for (let s = 0; s < 4; s++) {
        const spokeAngle = (s / 4) * Math.PI * 2;
        const spoke = new THREE.Mesh(spokeGeo, goldMat);
        spoke.position.set(
          (Math.cos(spokeAngle) * tier.radius) / 2,
          tier.y,
          (Math.sin(spokeAngle) * tier.radius) / 2
        );
        spoke.rotation.z = Math.PI / 2;
        spoke.rotation.y = -spokeAngle;
        chandelier.add(spoke);
      }
    }
  });

  // 5. Bottom Crystal Finial
  const finialGeo = new THREE.ConeGeometry(0.09, 0.28, 8);
  const finial = new THREE.Mesh(finialGeo, crystalMat);
  finial.position.set(0, fixtureCenterY - 0.58, 0);
  finial.rotation.x = Math.PI;
  chandelier.add(finial);

  // 6. Glowing Center Orb
  const glowGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const glowOrb = new THREE.Mesh(glowGeo, glowMat);
  glowOrb.position.set(0, fixtureCenterY, 0);
  chandelier.add(glowOrb);

  // 7. Embedded Warm Point Light
  const pointLight = new THREE.PointLight(
    new THREE.Color(pointColor),
    pointIntensity,
    14,
    1.8
  );
  pointLight.position.set(0, fixtureCenterY, z);
  pointLight.name = `ChandelierPointLight_Z${z}`;

  return { fixture: chandelier, light: pointLight };
}

/**
 * Sets up the complete romantic lighting system for the 3D Wedding Hall:
 * 1. Warm Ambient Light (#fff5ea, intensity 0.8)
 * 2. Soft-shadowed Directional Light (#ffe8d6, intensity 1.0)
 * 3. 3 Grand Crystal Chandeliers with warm PointLights at Z = 8, 0, -8
 * 4. Stage accent spotlight focusing on the couple's wedding arch & backdrop
 */
export function setupHallLighting(
  scene: THREE.Scene,
  options?: HallLightingOptions
): HallLightingResult {
  const {
    ambientColor = '#fff5ea',
    ambientIntensity = 0.8,
    dirLightColor = '#ffe8d6',
    dirLightIntensity = 1.0,
    chandelierColor = '#fff2d6',
    chandelierIntensity = 1.2,
    chandelierZPositions = [8, 0, -8],
    includeStageSpotlight = true,
  } = options || {};

  const lightsGroup = new THREE.Group();
  lightsGroup.name = 'HallLightsGroup';

  const chandeliersGroup = new THREE.Group();
  chandeliersGroup.name = 'HallChandeliersGroup';

  // 1. AMBIENT LIGHT
  const ambientLight = new THREE.AmbientLight(
    new THREE.Color(ambientColor),
    ambientIntensity
  );
  ambientLight.name = 'HallAmbientLight';
  lightsGroup.add(ambientLight);

  // 2. DIRECTIONAL LIGHT (Warm sunlight / key light with soft shadow)
  const dirLight = new THREE.DirectionalLight(
    new THREE.Color(dirLightColor),
    dirLightIntensity
  );
  dirLight.name = 'HallDirectionalLight';
  dirLight.position.set(6, 13, 8);
  dirLight.castShadow = true;

  // Shadow frustum and quality
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 1.0;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 18;
  dirLight.shadow.camera.bottom = -18;
  dirLight.shadow.bias = -0.0004;

  const dirTarget = new THREE.Object3D();
  dirTarget.position.set(0, 1.0, -2);
  scene.add(dirTarget);
  dirLight.target = dirTarget;
  lightsGroup.add(dirLight);

  // 3. STAGE ACCENT SPOTLIGHT (Highlights stage, wedding arch & couple backdrop)
  let stageSpotlight: THREE.SpotLight | null = null;
  let stageSpotTarget: THREE.Object3D | null = null;

  if (includeStageSpotlight) {
    stageSpotlight = new THREE.SpotLight(0xfffaec, 0.9, 22, Math.PI / 4.5, 0.65, 1.5);
    stageSpotlight.name = 'StageAccentSpotlight';
    stageSpotlight.position.set(0, 6.2, -5);

    stageSpotTarget = new THREE.Object3D();
    stageSpotTarget.position.set(0, 2.0, -12);
    scene.add(stageSpotTarget);
    stageSpotlight.target = stageSpotTarget;
    lightsGroup.add(stageSpotlight);
  }

  // 4. THREE GRAND CRYSTAL CHANDELIERS AT Z = 8, 0, -8
  // Shared materials for optimal performance (minimal draw calls)
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.25,
  });

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.1,
    emissive: new THREE.Color(0xfff1da),
    emissiveIntensity: 0.3,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xfff6dc,
  });

  const chandelierLightRefs: THREE.PointLight[] = [];

  chandelierZPositions.forEach((z) => {
    const { fixture, light } = createChandelier(
      z,
      chandelierColor,
      chandelierIntensity,
      goldMat,
      crystalMat,
      glowMat
    );
    chandeliersGroup.add(fixture);
    lightsGroup.add(light);
    chandelierLightRefs.push(light);
  });

  // Attach groups to scene
  scene.add(lightsGroup);
  scene.add(chandeliersGroup);

  // Gentle chandelier shimmer update function
  const update = (time: number) => {
    // Subtle breathing pulse on chandelier lights (romantic candlelight shimmer)
    chandelierLightRefs.forEach((light, i) => {
      const shimmer = Math.sin(time * 2.0 + i * 1.8) * 0.08;
      light.intensity = chandelierIntensity + shimmer;
    });
  };

  // Cleanup handler
  const cleanup = () => {
    // Remove lights & chandeliers from scene
    scene.remove(lightsGroup);
    scene.remove(chandeliersGroup);

    if (dirTarget.parent) scene.remove(dirTarget);
    if (stageSpotTarget && stageSpotTarget.parent) scene.remove(stageSpotTarget);

    // Dispose shared materials
    goldMat.dispose();
    crystalMat.dispose();
    glowMat.dispose();

    // Traverse and dispose geometries and materials
    [lightsGroup, chandeliersGroup].forEach((grp) => {
      grp.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
        if (
          child instanceof THREE.DirectionalLight ||
          child instanceof THREE.SpotLight ||
          child instanceof THREE.PointLight
        ) {
          if (child.shadow?.map) {
            child.shadow.map.dispose();
          }
        }
      });
    });
  };

  return {
    lightsGroup,
    chandeliersGroup,
    cleanup,
    update,
  };
}
