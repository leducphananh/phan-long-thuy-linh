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
    name: 'Triển lãm ảnh trái',
    shortName: 'Ảnh cưới 1',
    cameraPosition: [-3.2, 1.7, 2],
    targetPosition: [-6.5, 1.8, 2],
  },
  {
    id: 'wp-gallery-right',
    name: 'Triển lãm ảnh phải',
    shortName: 'Ảnh cưới 2',
    cameraPosition: [3.2, 1.7, -2],
    targetPosition: [6.5, 1.8, -2],
  },
  {
    id: 'wp-stage',
    name: 'Sân khấu hôn lễ',
    shortName: 'Sân khấu',
    cameraPosition: [0, 1.7, -7],
    targetPosition: [0, 2.2, -12],
  },
];
