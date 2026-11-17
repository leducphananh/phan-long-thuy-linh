import * as THREE from 'three';

export interface StageAndArchOptions {
  stageZ?: number; // default: -12
  coupleName?: string; // default: 'Phan Long & Thùy Linh'
  weddingDate?: string; // default: '24.12.2026'
  photoUrl?: string; // default: '/images/wedding/optimized/_DSC3551.jpg'
  archZPositions?: number[]; // default: [10, 0, -8]
}

/**
 * Creates a dynamic high-resolution text canvas texture for the couple banner.
 * Uses luxurious gold gradient with soft drop glow.
 * Safe for SSR (returns null when document is undefined).
 */
function createCoupleBannerTexture(
  coupleName: string,
  weddingDate: string
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, 1536, 384);

  // Radiant gold metallic gradient
  const grad = ctx.createLinearGradient(0, 40, 0, 320);
  grad.addColorStop(0, '#FFF6D1');
  grad.addColorStop(0.3, '#F3D270');
  grad.addColorStop(0.65, '#D4AF37');
  grad.addColorStop(1, '#9C7A14');

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Golden glow
  ctx.shadowColor = 'rgba(212, 175, 55, 0.55)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;

  // Couple Name
  ctx.font = 'bold 70px "Playfair Display", "Cinzel", "Georgia", serif';
  ctx.fillStyle = grad;
  ctx.fillText(coupleName, 768, 140);

  // Subtitle Date
  ctx.shadowBlur = 10;
  ctx.font = '500 40px "Playfair Display", "Cinzel", "Georgia", serif';
  ctx.fillText(`✦ ${weddingDate} ✦`, 768, 240);

  // Decorative filigree flourishes
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Left ornamental line
  ctx.moveTo(380, 240);
  ctx.lineTo(540, 240);
  // Right ornamental line
  ctx.moveTo(996, 240);
  ctx.lineTo(1156, 240);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

/**
 * Shared floral materials and geometries factory to ensure 60+ FPS on mobile
 */
function createSharedFloralResources() {
  const materials = {
    gold: new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.22,
    }),
    archFrame: new THREE.MeshStandardMaterial({
      color: 0xfdfaf5,
      metalness: 0.3,
      roughness: 0.35,
    }),
    rosePastel: new THREE.MeshStandardMaterial({
      color: 0xf4c2c2,
      roughness: 0.5,
      metalness: 0.05,
    }),
    roseCoral: new THREE.MeshStandardMaterial({
      color: 0xe8a598,
      roughness: 0.5,
      metalness: 0.05,
    }),
    peonyWhite: new THREE.MeshStandardMaterial({
      color: 0xfffdf8,
      roughness: 0.45,
      metalness: 0.05,
    }),
    peonyCream: new THREE.MeshStandardMaterial({
      color: 0xfaf0e6,
      roughness: 0.45,
      metalness: 0.05,
    }),
    leafSage: new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.6,
      metalness: 0.05,
    }),
    leafForest: new THREE.MeshStandardMaterial({
      color: 0x4f6d44,
      roughness: 0.6,
      metalness: 0.05,
    }),
    fairyLight: new THREE.MeshBasicMaterial({
      color: 0xfff4d0,
    }),
  };

  const geometries = {
    flowerMedium: new THREE.DodecahedronGeometry(0.12, 0),
    flowerLarge: new THREE.DodecahedronGeometry(0.16, 0),
    leaf: new THREE.ConeGeometry(0.06, 0.22, 4),
    fairyLight: new THREE.SphereGeometry(0.025, 6, 6),
    pedestalBase: new THREE.CylinderGeometry(0.24, 0.28, 0.45, 16),
  };

  return { materials, geometries };
}

/**
 * Builds an individual grand floral arch spanning the aisle at coordinate Z
 * (width 3.6m, height 3.5m, framed with pastel roses, peonies, eucalyptus leaves & fairy lights)
 */
function createFloralArch(
  z: number,
  shared: ReturnType<typeof createSharedFloralResources>
): THREE.Group {
  const archGroup = new THREE.Group();
  archGroup.name = `FloralArch_Z${z}`;
  archGroup.position.set(0, 0, z);

  const { materials, geometries } = shared;
  const archRadius = 1.8; // Spans from X = -1.8 to +1.8
  const pillarHeight = 1.7; // From floor to arch springline
  const tubeRadius = 0.05;

  // 1. ARCH STRUCTURE (Columns & Torus Top)
  // Left column
  const colGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, pillarHeight, 16);
  const leftCol = new THREE.Mesh(colGeo, materials.archFrame);
  leftCol.position.set(-archRadius, pillarHeight / 2, 0);
  leftCol.castShadow = true;
  archGroup.add(leftCol);

  // Right column
  const rightCol = new THREE.Mesh(colGeo, materials.archFrame);
  rightCol.position.set(archRadius, pillarHeight / 2, 0);
  rightCol.castShadow = true;
  archGroup.add(rightCol);

  // Left & Right Fluted Pedestals at Floor
  const leftPedestal = new THREE.Mesh(geometries.pedestalBase, materials.gold);
  leftPedestal.position.set(-archRadius, 0.225, 0);
  leftPedestal.castShadow = true;
  archGroup.add(leftPedestal);

  const rightPedestal = new THREE.Mesh(geometries.pedestalBase, materials.gold);
  rightPedestal.position.set(archRadius, 0.225, 0);
  rightPedestal.castShadow = true;
  archGroup.add(rightPedestal);

  // Upper Curved Arch (Half Torus)
  const archTorusGeo = new THREE.TorusGeometry(archRadius, tubeRadius, 12, 32, Math.PI);
  const archTorus = new THREE.Mesh(archTorusGeo, materials.archFrame);
  archTorus.position.set(0, pillarHeight, 0);
  archTorus.rotation.z = 0;
  archTorus.castShadow = true;
  archGroup.add(archTorus);

  // 2. FLORAL & FOLIAGE CLUSTERS ALONG THE ARCH
  const flowerMats = [
    materials.rosePastel,
    materials.roseCoral,
    materials.peonyWhite,
    materials.peonyCream,
  ];
  const leafMats = [materials.leafSage, materials.leafForest];

  // (a) Flowers along curved arch (Angle from 0 to PI)
  const numArchFlowers = 32;
  for (let i = 0; i <= numArchFlowers; i++) {
    const angle = (i / numArchFlowers) * Math.PI;
    const fx = Math.cos(angle) * archRadius + (Math.random() - 0.5) * 0.12;
    const fy = pillarHeight + Math.sin(angle) * archRadius + (Math.random() - 0.5) * 0.12;
    const fz = (Math.random() - 0.5) * 0.18;

    // Blossom mesh
    const isLarge = i % 3 === 0;
    const fGeo = isLarge ? geometries.flowerLarge : geometries.flowerMedium;
    const fMat = flowerMats[i % flowerMats.length];
    const flower = new THREE.Mesh(fGeo, fMat);
    flower.position.set(fx, fy, fz);
    flower.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    flower.castShadow = true;
    archGroup.add(flower);

    // Complementary foliage leaves
    if (i % 2 === 0) {
      const leaf = new THREE.Mesh(geometries.leaf, leafMats[i % leafMats.length]);
      leaf.position.set(fx + (Math.random() - 0.5) * 0.1, fy - 0.05, fz + (Math.random() - 0.5) * 0.1);
      leaf.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      archGroup.add(leaf);
    }

    // Fairy lights along the arch
    if (i % 4 === 0) {
      const fairy = new THREE.Mesh(geometries.fairyLight, materials.fairyLight);
      fairy.position.set(fx, fy + 0.08, fz + 0.06);
      archGroup.add(fairy);
    }
  }

  // (b) Flowers cascading down the vertical pillars
  const pillarSteps = 6;
  for (let p = 0; p < pillarSteps; p++) {
    const py = 0.45 + (p / pillarSteps) * (pillarHeight - 0.45);

    // Left pillar cluster
    const lFlower = new THREE.Mesh(geometries.flowerMedium, flowerMats[p % flowerMats.length]);
    lFlower.position.set(-archRadius + (Math.random() - 0.5) * 0.14, py, (Math.random() - 0.5) * 0.14);
    lFlower.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    archGroup.add(lFlower);

    // Right pillar cluster
    const rFlower = new THREE.Mesh(
      geometries.flowerMedium,
      flowerMats[(p + 2) % flowerMats.length]
    );
    rFlower.position.set(archRadius + (Math.random() - 0.5) * 0.14, py, (Math.random() - 0.5) * 0.14);
    rFlower.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    archGroup.add(rFlower);
  }

  return archGroup;
}

/**
 * Builds the 2-Tier Velvet Stage at Z = -12
 * - Lower tier: 8.4m x 4.4m x 0.25m
 * - Upper tier: 7.4m x 3.6m x 0.25m (top surface at Y = 0.5m)
 * - Gold border rims along step perimeters
 */
function createStagePlatform(stageZ: number, goldMat: THREE.Material): THREE.Group {
  const stageGroup = new THREE.Group();
  stageGroup.name = 'StagePlatform';

  const tierMat = new THREE.MeshStandardMaterial({
    color: 0xf7efe8, // Warm pearlescent cream
    roughness: 0.35,
    metalness: 0.08,
  });

  const upperTierMat = new THREE.MeshStandardMaterial({
    color: 0x9e1b32, // Regal red velvet carpet topping for couple area
    roughness: 0.85,
    metalness: 0.05,
  });

  // 1. Lower Tier (Width 8.4m, Depth 4.4m, Height 0.25m)
  const tier1W = 8.4;
  const tier1D = 4.4;
  const tier1H = 0.25;
  const tier1Geo = new THREE.BoxGeometry(tier1W, tier1H, tier1D);
  const tier1Mesh = new THREE.Mesh(tier1Geo, tierMat);
  tier1Mesh.position.set(0, tier1H / 2, stageZ);
  tier1Mesh.receiveShadow = true;
  tier1Mesh.castShadow = true;
  stageGroup.add(tier1Mesh);

  // Gold rim around tier 1
  const trimThick = 0.04;
  const tier1FrontRimGeo = new THREE.BoxGeometry(tier1W, trimThick, 0.06);
  const tier1FrontRim = new THREE.Mesh(tier1FrontRimGeo, goldMat);
  tier1FrontRim.position.set(0, tier1H - trimThick / 2, stageZ + tier1D / 2);
  stageGroup.add(tier1FrontRim);

  // 2. Upper Tier (Width 7.4m, Depth 3.6m, Height 0.25m)
  const tier2W = 7.4;
  const tier2D = 3.6;
  const tier2H = 0.25;
  const tier2Geo = new THREE.BoxGeometry(tier2W, tier2H, tier2D);
  const tier2Mesh = new THREE.Mesh(tier2Geo, upperTierMat);
  tier2Mesh.position.set(0, tier1H + tier2H / 2, stageZ);
  tier2Mesh.receiveShadow = true;
  tier2Mesh.castShadow = true;
  stageGroup.add(tier2Mesh);

  // Gold rim around upper tier
  const tier2FrontRimGeo = new THREE.BoxGeometry(tier2W, trimThick, 0.06);
  const tier2FrontRim = new THREE.Mesh(tier2FrontRimGeo, goldMat);
  tier2FrontRim.position.set(0, tier1H + tier2H - trimThick / 2, stageZ + tier2D / 2);
  stageGroup.add(tier2FrontRim);

  return stageGroup;
}

/**
 * Builds the Wedding Stage Backdrop:
 * - Arched backdrop structure
 * - Main Wedding Photo frame with /images/wedding/optimized/_DSC3551.jpg
 * - Gold glowing dynamic banner: "Phan Long & Thùy Linh · 24.12.2026"
 * - Floral arch crowns framing the backdrop
 */
function createStageBackdrop(
  stageZ: number,
  coupleName: string,
  weddingDate: string,
  photoUrl: string,
  shared: ReturnType<typeof createSharedFloralResources>
): THREE.Group {
  const backdropGroup = new THREE.Group();
  backdropGroup.name = 'StageBackdrop';

  const { materials, geometries } = shared;
  const backdropZ = stageZ - 1.6; // Positioned behind the upper tier
  const stageTopY = 0.5;

  // 1. Backboard Panel (Soft blush cream backdrop)
  const panelWidth = 4.8;
  const panelHeight = 4.4;
  const panelThickness = 0.12;
  const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelThickness);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xfaf4ee,
    roughness: 0.6,
    metalness: 0.05,
  });

  const panelMesh = new THREE.Mesh(panelGeo, panelMat);
  panelMesh.position.set(0, stageTopY + panelHeight / 2, backdropZ);
  panelMesh.receiveShadow = true;
  panelMesh.castShadow = true;
  backdropGroup.add(panelMesh);

  // 2. Outer Gold Arch Frame Trimming the Backdrop
  const archOuterGeo = new THREE.TorusGeometry(panelWidth / 2, 0.07, 12, 36, Math.PI);
  const archOuter = new THREE.Mesh(archOuterGeo, materials.gold);
  archOuter.position.set(0, stageTopY + panelHeight, backdropZ + 0.04);
  backdropGroup.add(archOuter);

  // 3. Couple Text Banner ("Phan Long & Thùy Linh · 24.12.2026")
  const bannerTexture = createCoupleBannerTexture(coupleName, weddingDate);
  const bannerGeo = new THREE.PlaneGeometry(3.6, 0.9);
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerTexture,
    transparent: true,
    roughness: 0.25,
    metalness: 0.8,
    emissive: new THREE.Color(0xd4af37),
    emissiveIntensity: 0.35,
  });

  const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
  bannerMesh.name = 'CoupleTextBanner';
  // Positioned above the photo on the backdrop panel
  bannerMesh.position.set(0, stageTopY + 3.8, backdropZ + 0.08);
  backdropGroup.add(bannerMesh);

  // 4. Main Wedding Photo (_DSC3551.jpg) with Ornate Gold Frame
  const photoWidth = 1.6;
  const photoHeight = 2.4; // 2:3 aspect ratio matching the 1280x1920 photo
  const photoY = stageTopY + 1.85;

  // Gold picture frame moulding
  const frameThick = 0.12;
  const frameDepth = 0.06;
  const frameBackGeo = new THREE.BoxGeometry(
    photoWidth + frameThick * 2,
    photoHeight + frameThick * 2,
    frameDepth
  );
  const frameMesh = new THREE.Mesh(frameBackGeo, materials.gold);
  frameMesh.position.set(0, photoY, backdropZ + 0.05);
  frameMesh.castShadow = true;
  backdropGroup.add(frameMesh);

  // Photo Plane with TextureLoader
  let photoTexture: THREE.Texture | null = null;
  if (typeof window !== 'undefined') {
    const loader = new THREE.TextureLoader();
    photoTexture = loader.load(photoUrl);
    photoTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);
  const photoMat = new THREE.MeshStandardMaterial({
    map: photoTexture,
    color: photoTexture ? 0xffffff : 0xede4db,
    roughness: 0.3,
    metalness: 0.05,
  });

  const photoMesh = new THREE.Mesh(photoGeo, photoMat);
  photoMesh.name = 'MainWeddingPhoto';
  photoMesh.position.set(0, photoY, backdropZ + 0.09);
  backdropGroup.add(photoMesh);

  // 5. Crown Floral Garland over the Backdrop Arch
  const garlandRadius = panelWidth / 2;
  const garlandCount = 24;
  const garlandMats = [
    materials.rosePastel,
    materials.roseCoral,
    materials.peonyWhite,
    materials.peonyCream,
  ];

  for (let g = 0; g <= garlandCount; g++) {
    const angle = (g / garlandCount) * Math.PI;
    const gx = Math.cos(angle) * garlandRadius;
    const gy = stageTopY + panelHeight + Math.sin(angle) * 0.7;
    const gz = backdropZ + 0.1 + (Math.random() - 0.5) * 0.1;

    const fGeo = g % 2 === 0 ? geometries.flowerLarge : geometries.flowerMedium;
    const flower = new THREE.Mesh(fGeo, garlandMats[g % garlandMats.length]);
    flower.position.set(gx, gy, gz);
    flower.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    backdropGroup.add(flower);

    // Leaves
    const leaf = new THREE.Mesh(geometries.leaf, materials.leafSage);
    leaf.position.set(gx + (Math.random() - 0.5) * 0.1, gy - 0.08, gz);
    leaf.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    backdropGroup.add(leaf);
  }

  return backdropGroup;
}

/**
 * Creates the complete Stage & Floral Arches for the 3D Wedding Hall:
 * 1. 2-Tier Velvet Wedding Stage at Z = -12
 * 2. Stage Backdrop with gold couple name banner and main wedding photo
 * 3. 3 Floral Arches with pastel roses, peonies & fairy lights at Z = 10, Z = 0, Z = -8
 */
export function createStageAndArch(options?: StageAndArchOptions): THREE.Group {
  const {
    stageZ = -12,
    coupleName = 'Phan Long & Thùy Linh',
    weddingDate = '24.12.2026',
    photoUrl = '/images/wedding/optimized/_DSC3551.jpg',
    archZPositions = [10, 0, -8],
  } = options || {};

  const rootGroup = new THREE.Group();
  rootGroup.name = 'StageAndArchRootGroup';

  const shared = createSharedFloralResources();

  // 1. STAGE PLATFORM
  const stage = createStagePlatform(stageZ, shared.materials.gold);
  rootGroup.add(stage);

  // 2. STAGE BACKDROP & COUPLE WEDDING PHOTO
  const backdrop = createStageBackdrop(
    stageZ,
    coupleName,
    weddingDate,
    photoUrl,
    shared
  );
  rootGroup.add(backdrop);

  // 3. THREE FLORAL ARCHES AT Z = 10, 0, -8
  archZPositions.forEach((z) => {
    const arch = createFloralArch(z, shared);
    rootGroup.add(arch);
  });

  return rootGroup;
}

/**
 * Cleanly disposes all geometries, materials, and textures for the stage and arches.
 */
export function disposeStageAndArch(group: THREE.Group): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }
  });
}
