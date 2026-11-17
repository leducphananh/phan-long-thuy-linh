/**
 * 3D Virtual Wedding Hall Types & Constants
 * Phan Long & Thùy Linh
 */

export interface Waypoint {
  id: string;
  name: string;
  shortName: string;
  cameraPosition: [number, number, number];
  targetPosition: [number, number, number];
  icon?: string;
}

export interface PhotoFrameData {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  fullUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}

export interface HallSceneState {
  currentWaypointId: string;
  activePhoto: PhotoFrameData | null;
  isMuted: boolean;
  isLoading: boolean;
}

export interface CameraViewTarget {
  position: [number, number, number];
  target: [number, number, number];
}

export const HALL_WAYPOINTS: Waypoint[] = [
  {
    id: 'wp-entrance',
    name: 'Cổng hoa đón khách',
    shortName: 'Cổng hoa',
    cameraPosition: [0, 1.7, 12],
    targetPosition: [0, 1.8, -10],
  },
  {
    id: 'wp-gallery-left',
    name: 'Triển lãm ảnh 1 · Đầu sảnh',
    shortName: 'Ảnh cưới 1',
    cameraPosition: [-3.2, 1.7, 4.5],
    targetPosition: [-6.8, 1.8, 4.5],
  },
  {
    id: 'wp-gallery-mid',
    name: 'Triển lãm ảnh 2 · Giữa sảnh',
    shortName: 'Ảnh cưới 2',
    cameraPosition: [3.2, 1.7, 0],
    targetPosition: [6.8, 1.8, 0],
  },
  {
    id: 'wp-gallery-stage',
    name: 'Triển lãm ảnh 3 · Cuối sảnh',
    shortName: 'Ảnh cưới 3',
    cameraPosition: [-3.2, 1.7, -4.5],
    targetPosition: [-6.8, 1.8, -4.5],
  },
  {
    id: 'wp-stage',
    name: 'Sân khấu hôn lễ',
    shortName: 'Sân khấu',
    cameraPosition: [0, 1.7, -8],
    targetPosition: [0, 2.2, -13],
  },
];
