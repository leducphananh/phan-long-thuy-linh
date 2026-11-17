import * as THREE from 'three';

export interface HallFloorOptions {
  hallWidth?: number; // default: 14m
  hallLength?: number; // default: 32m
  carpetWidth?: number; // default: 3.2m
  carpetLength?: number; // default: 24m
  floorColor?: string | number; // default: '#f5ede6'
  carpetColor?: string | number; // default: '#9E1B32'
  goldColor?: string | number; // default: '#D4AF37'
  includeWalls?: boolean; // default: true
}

/**
 * Creates a procedural marble canvas texture for luxury Carrara marble floor tiles.
 * Safe for SSR (returns null when window/document is undefined).
 */
function createMarbleCanvasTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base warm pearl-white marble color
  ctx.fillStyle = '#f5ede6';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft pearlescent cloudy variation
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 80 + Math.random() * 180;
    const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.5, 'rgba(240, 230, 220, 0.2)');
    grad.addColorStop(1, 'rgba(245, 237, 230, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft delicate marble veins
  ctx.lineWidth = 1.5;
  for (let v = 0; v < 8; v++) {
    ctx.strokeStyle = 'rgba(205, 185, 170, 0.25)';
    ctx.beginPath();
    let cx = Math.random() * 1024;
    let cy = Math.random() * 1024;
    ctx.moveTo(cx, cy);
    for (let seg = 0; seg < 6; seg++) {
      cx += (Math.random() - 0.48) * 180;
      cy += (Math.random() - 0.48) * 180;
      ctx.quadraticCurveTo(
        cx + (Math.random() - 0.5) * 60,
        cy + (Math.random() - 0.5) * 60,
        cx,
        cy
      );
    }
    ctx.stroke();
  }

  // Subtle 2m x 2m luxury marble tile joints
  ctx.strokeStyle = 'rgba(210, 195, 180, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 1024, 1024);
  ctx.strokeRect(512, 0, 0, 1024);
  ctx.strokeRect(0, 512, 1024, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 16); // 14m x 32m -> 7 x 16 tile pairs (2m x 2m tiles)
  texture.anisotropy = 8;
  return texture;
}

/**
 * Builds the 3D wedding hall architecture:
 * - Italian marble floor (14m x 32m, color '#f5ede6', roughness 0.2, metalness 0.1)
 * - Regal crimson velvet carpet (3.2m x 24m, color '#9E1B32') with brushed gold border trims ('#D4AF37')
 * - Enclosing ballroom perimeter walls and ceiling with classical gold mouldings
 */
export function createHallFloorAndCarpet(options?: HallFloorOptions): THREE.Group {
  const {
    hallWidth = 14,
    hallLength = 32,
    carpetWidth = 3.2,
    carpetLength = 24,
    floorColor = '#f5ede6',
    carpetColor = '#9E1B32',
    goldColor = '#D4AF37',
    includeWalls = true,
  } = options || {};

  const group = new THREE.Group();
  group.name = 'HallFloorAndCarpetGroup';

  // 1. MARBLE FLOOR
  const marbleTexture = createMarbleCanvasTexture();
  const floorGeo = new THREE.BoxGeometry(hallWidth, 0.2, hallLength);
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(floorColor),
    roughness: 0.2,
    metalness: 0.1,
    map: marbleTexture,
  });

  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.name = 'MarbleFloor';
  floorMesh.position.set(0, -0.1, 0); // Top surface sits exactly at Y = 0
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. RED VELVET CARPET
  // Starts from entrance (Z = 14) to stage approach (Z = -10), length = 24m, center Z = 2
  const carpetCenterZ = 2;
  const carpetGeo = new THREE.BoxGeometry(carpetWidth, 0.02, carpetLength);
  const carpetMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(carpetColor),
    roughness: 0.85,
    metalness: 0.05,
  });

  const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
  carpetMesh.name = 'RedVelvetCarpet';
  carpetMesh.position.set(0, 0.01, carpetCenterZ);
  carpetMesh.receiveShadow = true;
  group.add(carpetMesh);

  // 3. GOLD BORDER TRIMS ALONG CARPET
  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(goldColor),
    metalness: 0.85,
    roughness: 0.25,
  });

  const borderWidth = 0.09;
  const borderHeight = 0.025;
  const sideBorderGeo = new THREE.BoxGeometry(borderWidth, borderHeight, carpetLength);

  // Left gold border
  const leftBorderX = -carpetWidth / 2 + borderWidth / 2;
  const leftBorder = new THREE.Mesh(sideBorderGeo, goldMat);
  leftBorder.name = 'CarpetGoldBorderLeft';
  leftBorder.position.set(leftBorderX, 0.012, carpetCenterZ);
  leftBorder.receiveShadow = true;
  group.add(leftBorder);

  // Right gold border
  const rightBorderX = carpetWidth / 2 - borderWidth / 2;
  const rightBorder = new THREE.Mesh(sideBorderGeo, goldMat);
  rightBorder.name = 'CarpetGoldBorderRight';
  rightBorder.position.set(rightBorderX, 0.012, carpetCenterZ);
  rightBorder.receiveShadow = true;
  group.add(rightBorder);

  // End cap gold borders (Entrance end at Z = 14, Stage end at Z = -10)
  const capBorderGeo = new THREE.BoxGeometry(carpetWidth, borderHeight, borderWidth);
  const entranceCap = new THREE.Mesh(capBorderGeo, goldMat);
  entranceCap.name = 'CarpetGoldCapEntrance';
  entranceCap.position.set(0, 0.012, carpetCenterZ + carpetLength / 2 - borderWidth / 2);
  entranceCap.receiveShadow = true;
  group.add(entranceCap);

  const stageCap = new THREE.Mesh(capBorderGeo, goldMat);
  stageCap.name = 'CarpetGoldCapStage';
  stageCap.position.set(0, 0.012, carpetCenterZ - carpetLength / 2 + borderWidth / 2);
  stageCap.receiveShadow = true;
  group.add(stageCap);

  // 4. BALLROOM ENCLOSURE (Walls, Mouldings & Ceiling)
  if (includeWalls) {
    const wallHeight = 7.0;
    const wallThickness = 0.3;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xfcf8f2, // Warm cream white
      roughness: 0.75,
      metalness: 0.05,
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xfdfaf5,
      roughness: 0.9,
      metalness: 0.02,
    });

    // Left Wall (X = -7)
    const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, hallLength);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.name = 'WallLeft';
    leftWall.position.set(-hallWidth / 2 - wallThickness / 2, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right Wall (X = +7)
    const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
    rightWall.name = 'WallRight';
    rightWall.position.set(hallWidth / 2 + wallThickness / 2, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // Back Wall behind stage (Z = -16)
    const backWallGeo = new THREE.BoxGeometry(hallWidth + wallThickness * 2, wallHeight, wallThickness);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.name = 'WallBack';
    backWall.position.set(0, wallHeight / 2, -hallLength / 2 - wallThickness / 2);
    backWall.receiveShadow = true;
    group.add(backWall);

    // Front Wall at entrance (Z = +16) with opening for entrance
    const frontWall = new THREE.Mesh(backWallGeo, wallMat);
    frontWall.name = 'WallFront';
    frontWall.position.set(0, wallHeight / 2, hallLength / 2 + wallThickness / 2);
    frontWall.receiveShadow = true;
    group.add(frontWall);

    // Ceiling at Y = 7.0
    const ceilingGeo = new THREE.BoxGeometry(hallWidth, wallThickness, hallLength);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.name = 'Ceiling';
    ceiling.position.set(0, wallHeight + wallThickness / 2, 0);
    ceiling.receiveShadow = true;
    group.add(ceiling);

    // Decorative Gold Moulding Strips along side walls (Chair rails at Y = 1.1m and Crown mouldings at Y = 6.9m)
    const mouldingGeo = new THREE.BoxGeometry(0.06, 0.1, hallLength);
    const crownGeo = new THREE.BoxGeometry(0.12, 0.18, hallLength);

    // Left wall trims
    const leftRail = new THREE.Mesh(mouldingGeo, goldMat);
    leftRail.position.set(-hallWidth / 2 + 0.03, 1.1, 0);
    group.add(leftRail);

    const leftCrown = new THREE.Mesh(crownGeo, goldMat);
    leftCrown.position.set(-hallWidth / 2 + 0.06, wallHeight - 0.09, 0);
    group.add(leftCrown);

    // Right wall trims
    const rightRail = new THREE.Mesh(mouldingGeo, goldMat);
    rightRail.position.set(hallWidth / 2 - 0.03, 1.1, 0);
    group.add(rightRail);

    const rightCrown = new THREE.Mesh(crownGeo, goldMat);
    rightCrown.position.set(hallWidth / 2 - 0.06, wallHeight - 0.09, 0);
    group.add(rightCrown);
  }

  return group;
}

/**
 * Cleanly disposes all geometries, materials, and textures attached to the floor and carpet group.
 * Prevents WebGL memory leaks when unmounting the 3D scene.
 */
export function disposeHallFloorAndCarpet(group: THREE.Group): void {
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
