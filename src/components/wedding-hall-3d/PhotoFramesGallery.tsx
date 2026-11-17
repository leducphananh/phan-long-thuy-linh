import * as THREE from 'three';
import { PhotoFrameData } from '../../types/virtual-hall';
import { galleryPhotos } from '../../data/weddingData';

export interface PhotoFramesGalleryOptions {
  onSelectPhoto?: (photo: PhotoFrameData) => void;
  wallX?: number; // default: 6.8 (hall width is 14m, wall at X = ±7.0m)
  frameY?: number; // default: 1.95m (eye level)
  goldColor?: string | number; // default: '#D4AF37'
  highlightEmissive?: number; // default: 0xd4af37
}

export interface PhotoFramesGalleryResult {
  group: THREE.Group;
  interactiveObjects: THREE.Object3D[];
  handlePointerMove: (raycaster: THREE.Raycaster) => PhotoFrameData | null;
  handleClick: (raycaster: THREE.Raycaster) => PhotoFrameData | null;
  dispose: () => void;
  frames: PhotoFrameData[];
}

/**
 * The 10 curated wedding photos for the 3D gallery
 */
export const SELECTED_PHOTO_FILENAMES = [
  '_DSC1879.jpg', // Left 1 (Z = 6)
  '_DSC2007.jpg', // Left 2 (Z = 3)
  '_DSC2387.jpg', // Left 3 (Z = 0)
  '_DSC2145.jpg', // Left 4 (Z = -3)
  '_DSC2695.jpg', // Left 5 (Z = -6)
  '_DSC2943.jpg', // Right 1 (Z = 6)
  '_DSC3182.jpg', // Right 2 (Z = 3)
  '_DSC3261.jpg', // Right 3 (Z = 0)
  '_DSC3551.jpg', // Right 4 (Z = -3)
  '_DSC3563.jpg', // Right 5 (Z = -6)
] as const;

/**
 * Creates high-resolution canvas texture for museum-grade brass title plaque
 * Safe for SSR (returns null in Node.js environment)
 */
function createTitlePlaqueTexture(
  title: string,
  subtitle?: string
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background: dark bronze plate with metallic sheen
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 128);
  bgGrad.addColorStop(0, '#1c1712');
  bgGrad.addColorStop(0.5, '#2b231c');
  bgGrad.addColorStop(1, '#1a1510');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 128);

  // Decorative double gold border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(11, 11, 490, 106);

  // Tiny corner accents
  ctx.fillStyle = '#D4AF37';
  const cornerSize = 4;
  ctx.fillRect(8, 8, cornerSize, cornerSize);
  ctx.fillRect(500, 8, cornerSize, cornerSize);
  ctx.fillRect(8, 116, cornerSize, cornerSize);
  ctx.fillRect(500, 116, cornerSize, cornerSize);

  // Text: Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFF5E0';
  ctx.font = 'bold 30px "Playfair Display", "Cinzel", "Georgia", serif';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText(title, 256, subtitle ? 48 : 64);

  // Text: Subtitle
  if (subtitle) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'italic 18px "Playfair Display", "Cinzel", "Georgia", serif';
    ctx.fillText(subtitle, 256, 88);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Builds the 3D wedding photo exhibition gallery:
 * - 10 master wedding photos on left & right ballroom walls
 * - Luxury brushed gold 3D frames with ivory passe-partout matting
 * - Wall sconce picture lights and museum title plaques
 * - Hover highlight (emissive gold shimmer) and raycast click handler
 */
export function createPhotoFramesGallery(
  options?: PhotoFramesGalleryOptions
): PhotoFramesGalleryResult {
  const {
    onSelectPhoto,
    wallX = 6.8,
    frameY = 1.95,
    goldColor = '#D4AF37',
    highlightEmissive = 0xd4af37,
  } = options || {};

  const group = new THREE.Group();
  group.name = 'PhotoFramesGallery';

  const interactiveObjects: THREE.Object3D[] = [];
  const allocatedTextures: THREE.Texture[] = [];
  const frameDataList: PhotoFrameData[] = [];

  // 1. Resolve photo metadata from galleryPhotos
  const findPhoto = (filename: string) => {
    return galleryPhotos.find((p) => p.fullUrl.includes(filename));
  };

  // Z-positions for 5 frames on each side (from Z = 6 to Z = -6, spaced 3m apart)
  const zPositions = [6, 3, 0, -3, -6];

  // Map 10 photos to their wall positions
  // Left wall: X = -wallX, facing center (+X direction -> rotation Y = Math.PI / 2)
  // Right wall: X = +wallX, facing center (-X direction -> rotation Y = -Math.PI / 2)
  const frameConfigs: Array<{
    filename: (typeof SELECTED_PHOTO_FILENAMES)[number];
    position: [number, number, number];
    rotation: [number, number, number];
  }> = [
    // Left Wall (5 photos)
    { filename: '_DSC1879.jpg', position: [-wallX, frameY, zPositions[0]], rotation: [0, Math.PI / 2, 0] },
    { filename: '_DSC2007.jpg', position: [-wallX, frameY, zPositions[1]], rotation: [0, Math.PI / 2, 0] },
    { filename: '_DSC2387.jpg', position: [-wallX, frameY, zPositions[2]], rotation: [0, Math.PI / 2, 0] },
    { filename: '_DSC2145.jpg', position: [-wallX, frameY, zPositions[3]], rotation: [0, Math.PI / 2, 0] },
    { filename: '_DSC2695.jpg', position: [-wallX, frameY, zPositions[4]], rotation: [0, Math.PI / 2, 0] },

    // Right Wall (5 photos)
    { filename: '_DSC2943.jpg', position: [wallX, frameY, zPositions[0]], rotation: [0, -Math.PI / 2, 0] },
    { filename: '_DSC3182.jpg', position: [wallX, frameY, zPositions[1]], rotation: [0, -Math.PI / 2, 0] },
    { filename: '_DSC3261.jpg', position: [wallX, frameY, zPositions[2]], rotation: [0, -Math.PI / 2, 0] },
    { filename: '_DSC3551.jpg', position: [wallX, frameY, zPositions[3]], rotation: [0, -Math.PI / 2, 0] },
    { filename: '_DSC3563.jpg', position: [wallX, frameY, zPositions[4]], rotation: [0, -Math.PI / 2, 0] },
  ];

  // TextureLoader for images
  const textureLoader = typeof window !== 'undefined' ? new THREE.TextureLoader() : null;

  // Shared shared materials for efficiency
  const mattingMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaf7f0,
    roughness: 0.9,
    metalness: 0.0,
  });

  const backingMaterial = new THREE.MeshStandardMaterial({
    color: 0x221c17,
    roughness: 0.8,
    metalness: 0.1,
  });

  const pictureLightFixtureMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(goldColor),
    metalness: 0.85,
    roughness: 0.25,
  });

  const pictureLightGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfff4db,
  });

  // Track each frame's interactive materials for hover emission
  interface FrameHighlightData {
    id: string;
    goldMaterials: THREE.MeshStandardMaterial[];
    frameGroup: THREE.Group;
    data: PhotoFrameData;
  }
  const frameHighlightMap = new Map<string, FrameHighlightData>();

  frameConfigs.forEach((cfg, idx) => {
    const rawPhoto = findPhoto(cfg.filename);
    const photoId = rawPhoto?.id || `gallery-frame-${idx + 1}`;
    const title = rawPhoto?.title || 'Khoảnh Khắc Hạnh Phúc';
    const subtitle = rawPhoto?.subtitle || 'Phan Long & Thùy Linh';
    const fullUrl = rawPhoto?.fullUrl || `/images/wedding/optimized/${cfg.filename}`;
    const isLandscape = rawPhoto?.aspectRatio === 'landscape';

    // 3D dimensions (meters)
    const photoWidth = isLandscape ? 1.6 : 1.15;
    const photoHeight = isLandscape ? 1.15 : 1.6;

    const photoData: PhotoFrameData = {
      id: photoId,
      title,
      subtitle,
      imageUrl: fullUrl,
      fullUrl,
      position: cfg.position,
      rotation: cfg.rotation,
      width: photoWidth,
      height: photoHeight,
    };
    frameDataList.push(photoData);

    // Frame assembly root
    const frameGroup = new THREE.Group();
    frameGroup.name = `FrameGroup_${photoId}`;
    frameGroup.position.set(...cfg.position);
    frameGroup.rotation.set(...cfg.rotation);

    // Dedicated gold material instance for this frame so hover emission works per-frame
    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(goldColor),
      roughness: 0.28,
      metalness: 0.85,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });

    const highlightEntry: FrameHighlightData = {
      id: photoId,
      goldMaterials: [goldFrameMat],
      frameGroup,
      data: photoData,
    };
    frameHighlightMap.set(photoId, highlightEntry);

    // 1. Backing Plate (Mounting board behind frame)
    const backWidth = photoWidth + 0.24;
    const backHeight = photoHeight + 0.24;
    const backDepth = 0.03;
    const backGeo = new THREE.BoxGeometry(backWidth, backHeight, backDepth);
    const backMesh = new THREE.Mesh(backGeo, backingMaterial);
    backMesh.position.set(0, 0, -backDepth / 2);
    backMesh.castShadow = true;
    backMesh.receiveShadow = true;
    frameGroup.add(backMesh);

    // 2. Passe-partout / Matting (Ivory board surrounding photo)
    const mattingGeo = new THREE.PlaneGeometry(photoWidth + 0.14, photoHeight + 0.14);
    const mattingMesh = new THREE.Mesh(mattingGeo, mattingMaterial);
    mattingMesh.position.set(0, 0, 0.005);
    mattingMesh.receiveShadow = true;
    frameGroup.add(mattingMesh);

    // 3. Classical 4-Piece Gold Frame Moulding
    const mouldingWidth = 0.08;
    const mouldingDepth = 0.045;

    // Top moulding
    const topMouldingGeo = new THREE.BoxGeometry(photoWidth + mouldingWidth * 2 + 0.14, mouldingWidth, mouldingDepth);
    const topMoulding = new THREE.Mesh(topMouldingGeo, goldFrameMat);
    topMoulding.position.set(0, (photoHeight + 0.14) / 2 + mouldingWidth / 2, mouldingDepth / 2);
    topMoulding.castShadow = true;
    topMoulding.receiveShadow = true;
    frameGroup.add(topMoulding);

    // Bottom moulding
    const bottomMoulding = new THREE.Mesh(topMouldingGeo, goldFrameMat);
    bottomMoulding.position.set(0, -(photoHeight + 0.14) / 2 - mouldingWidth / 2, mouldingDepth / 2);
    bottomMoulding.castShadow = true;
    bottomMoulding.receiveShadow = true;
    frameGroup.add(bottomMoulding);

    // Left moulding
    const sideMouldingGeo = new THREE.BoxGeometry(mouldingWidth, photoHeight + 0.14, mouldingDepth);
    const leftMoulding = new THREE.Mesh(sideMouldingGeo, goldFrameMat);
    leftMoulding.position.set(-(photoWidth + 0.14) / 2 - mouldingWidth / 2, 0, mouldingDepth / 2);
    leftMoulding.castShadow = true;
    leftMoulding.receiveShadow = true;
    frameGroup.add(leftMoulding);

    // Right moulding
    const rightMoulding = new THREE.Mesh(sideMouldingGeo, goldFrameMat);
    rightMoulding.position.set((photoWidth + 0.14) / 2 + mouldingWidth / 2, 0, mouldingDepth / 2);
    rightMoulding.castShadow = true;
    rightMoulding.receiveShadow = true;
    frameGroup.add(rightMoulding);

    // Inner delicate gold bevel trim right around photo edges
    const innerTrimThick = 0.015;
    const innerTrimGeoH = new THREE.BoxGeometry(photoWidth + innerTrimThick * 2, innerTrimThick, 0.015);
    const innerTrimTop = new THREE.Mesh(innerTrimGeoH, goldFrameMat);
    innerTrimTop.position.set(0, photoHeight / 2 + innerTrimThick / 2, 0.01);
    frameGroup.add(innerTrimTop);

    const innerTrimBottom = new THREE.Mesh(innerTrimGeoH, goldFrameMat);
    innerTrimBottom.position.set(0, -photoHeight / 2 - innerTrimThick / 2, 0.01);
    frameGroup.add(innerTrimBottom);

    const innerTrimGeoV = new THREE.BoxGeometry(innerTrimThick, photoHeight, 0.015);
    const innerTrimLeft = new THREE.Mesh(innerTrimGeoV, goldFrameMat);
    innerTrimLeft.position.set(-photoWidth / 2 - innerTrimThick / 2, 0, 0.01);
    frameGroup.add(innerTrimLeft);

    const innerTrimRight = new THREE.Mesh(innerTrimGeoV, goldFrameMat);
    innerTrimRight.position.set(photoWidth / 2 + innerTrimThick / 2, 0, 0.01);
    frameGroup.add(innerTrimRight);

    // 4. Photo Canvas Plane
    let photoTexture: THREE.Texture | null = null;
    if (textureLoader) {
      photoTexture = textureLoader.load(
        photoData.imageUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
        }
      );
      photoTexture.colorSpace = THREE.SRGBColorSpace;
      photoTexture.anisotropy = 8;
      allocatedTextures.push(photoTexture);
    }

    const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);
    const photoMat = new THREE.MeshStandardMaterial({
      map: photoTexture,
      roughness: 0.35,
      metalness: 0.05,
      color: 0xffffff,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.name = `PhotoMesh_${photoId}`;
    photoMesh.position.set(0, 0, 0.015);
    photoMesh.receiveShadow = true;
    photoMesh.userData = {
      isPhotoFrame: true,
      photoData,
      frameId: photoId,
    };
    frameGroup.add(photoMesh);

    // 5. Gallery Wall Sconce Picture Light (Mounted above frame)
    const sconceY = (photoHeight + 0.14) / 2 + mouldingWidth + 0.15;
    const sconceArmGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.16, 8);
    const sconceArm = new THREE.Mesh(sconceArmGeo, pictureLightFixtureMat);
    sconceArm.rotation.x = Math.PI / 2;
    sconceArm.position.set(0, sconceY, 0.08);
    frameGroup.add(sconceArm);

    const lightBarWidth = Math.min(photoWidth * 0.75, 0.85);
    const lightBarGeo = new THREE.CylinderGeometry(0.018, 0.018, lightBarWidth, 12);
    const lightBar = new THREE.Mesh(lightBarGeo, pictureLightFixtureMat);
    lightBar.rotation.z = Math.PI / 2;
    lightBar.position.set(0, sconceY, 0.16);
    frameGroup.add(lightBar);

    // Diffuser glow strip facing downward toward photo
    const diffuserGeo = new THREE.BoxGeometry(lightBarWidth * 0.9, 0.006, 0.018);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, pictureLightGlowMat);
    diffuserMesh.position.set(0, sconceY - 0.015, 0.16);
    frameGroup.add(diffuserMesh);

    // 6. Museum Brass Title Plaque (Mounted below frame)
    const plaqueY = -(photoHeight + 0.14) / 2 - mouldingWidth - 0.14;
    const plaqueW = Math.min(photoWidth * 0.65, 0.6);
    const plaqueH = 0.12;
    const plaqueDepth = 0.015;

    const plaqueGeo = new THREE.BoxGeometry(plaqueW, plaqueH, plaqueDepth);
    const plaqueBase = new THREE.Mesh(plaqueGeo, pictureLightFixtureMat);
    plaqueBase.position.set(0, plaqueY, plaqueDepth / 2);
    frameGroup.add(plaqueBase);

    const plaqueTexture = createTitlePlaqueTexture(title, subtitle);
    if (plaqueTexture) {
      allocatedTextures.push(plaqueTexture);
      const plaqueFaceGeo = new THREE.PlaneGeometry(plaqueW * 0.95, plaqueH * 0.85);
      const plaqueFaceMat = new THREE.MeshStandardMaterial({
        map: plaqueTexture,
        roughness: 0.35,
        metalness: 0.5,
      });
      const plaqueFace = new THREE.Mesh(plaqueFaceGeo, plaqueFaceMat);
      plaqueFace.position.set(0, plaqueY, plaqueDepth + 0.002);
      frameGroup.add(plaqueFace);
    }

    // 7. Raycast Hit Box (Encompasses entire frame assembly for smooth user interaction)
    const hitBoxGeo = new THREE.PlaneGeometry(photoWidth + 0.35, photoHeight + 0.35);
    const hitBoxMat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    hitBox.name = `HitBox_${photoId}`;
    hitBox.position.set(0, 0, 0.035);
    hitBox.userData = {
      isPhotoFrame: true,
      photoData,
      frameId: photoId,
    };
    frameGroup.add(hitBox);

    // Register interactive targets for raycasting
    interactiveObjects.push(photoMesh);
    interactiveObjects.push(hitBox);

    group.add(frameGroup);
  });

  // State tracking for hover interaction
  let currentHoveredId: string | null = null;

  const setFrameHover = (frameId: string | null) => {
    if (currentHoveredId === frameId) return;

    // Reset previous hovered frame
    if (currentHoveredId) {
      const prevEntry = frameHighlightMap.get(currentHoveredId);
      if (prevEntry) {
        prevEntry.goldMaterials.forEach((mat) => {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        });
      }
    }

    // Apply glow to newly hovered frame
    if (frameId) {
      const nextEntry = frameHighlightMap.get(frameId);
      if (nextEntry) {
        nextEntry.goldMaterials.forEach((mat) => {
          mat.emissive.setHex(highlightEmissive);
          mat.emissiveIntensity = 0.55;
        });
      }
    }

    // Update body cursor safely for SSR/Browser
    if (typeof document !== 'undefined') {
      document.body.style.cursor = frameId ? 'pointer' : 'default';
    }

    currentHoveredId = frameId;
  };

  /**
   * Pointer move handler: performs raycasting against interactive frame objects,
   * updates hover emissive highlight, and returns hovered PhotoFrameData
   */
  const handlePointerMove = (raycaster: THREE.Raycaster): PhotoFrameData | null => {
    const intersects = raycaster.intersectObjects(interactiveObjects, false);

    if (intersects.length > 0) {
      for (const hit of intersects) {
        const pData = hit.object.userData?.photoData as PhotoFrameData | undefined;
        if (pData) {
          setFrameHover(pData.id);
          return pData;
        }
      }
    }

    setFrameHover(null);
    return null;
  };

  /**
   * Click handler: detects clicked photo frame and fires onSelectPhoto callback
   */
  const handleClick = (raycaster: THREE.Raycaster): PhotoFrameData | null => {
    const intersects = raycaster.intersectObjects(interactiveObjects, false);

    if (intersects.length > 0) {
      for (const hit of intersects) {
        const pData = hit.object.userData?.photoData as PhotoFrameData | undefined;
        if (pData) {
          onSelectPhoto?.(pData);
          return pData;
        }
      }
    }

    return null;
  };

  /**
   * Cleanly disposes all geometries, materials, and textures
   */
  const dispose = () => {
    // Reset cursor
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'default';
    }

    // Dispose allocated textures
    allocatedTextures.forEach((tex) => tex.dispose());
    allocatedTextures.length = 0;

    // Dispose shared materials
    mattingMaterial.dispose();
    backingMaterial.dispose();
    pictureLightFixtureMat.dispose();
    pictureLightGlowMat.dispose();

    // Traverse group and dispose all meshes & materials
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
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

    interactiveObjects.length = 0;
    frameHighlightMap.clear();
  };

  return {
    group,
    interactiveObjects,
    handlePointerMove,
    handleClick,
    dispose,
    frames: frameDataList,
  };
}

/**
 * Helper to dispose a PhotoFramesGallery group or result
 */
export function disposePhotoFramesGallery(
  target: PhotoFramesGalleryResult | THREE.Group
): void {
  if ('dispose' in target && typeof target.dispose === 'function') {
    target.dispose();
  } else if (target instanceof THREE.Group) {
    target.traverse((child) => {
      if (child instanceof THREE.Mesh) {
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
