/**
 * Wedding Invitation Types & Data Models
 */

export interface WeddingCouple {
  groom: {
    name: string;
    fullName: string;
    title: string;
    fatherName: string;
    motherName: string;
    address: string;
    phone: string;
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      qrCodeUrl: string;
    };
  };
  bride: {
    name: string;
    fullName: string;
    title: string;
    fatherName: string;
    motherName: string;
    address: string;
    phone: string;
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      qrCodeUrl: string;
    };
  };
  weddingDate: string; // ISO date string, e.g. "2026-11-28T18:00:00+07:00"
  lunarDate: string;   // e.g. "Ngày 19 tháng 10 năm Bính Ngọ"
}

export interface StoryMilestone {
  id: string;
  year: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  location?: string;
}

export interface WeddingStory {
  title: string;
  subtitle: string;
  quote: string;
  paragraphs: string[];
  signature: string;
  featuredImages: {
    url: string;
    alt: string;
    caption?: string;
  }[];
}

export interface WeddingEvent {
  id: string;
  type: 'ceremony' | 'reception' | 'engagement';
  title: string;
  subtitle: string;
  date: string;
  time: string;
  lunarTime: string;
  venueName: string;
  address: string;
  mapEmbedUrl: string;
  mapDirectUrl: string;
  calendarEvent: {
    title: string;
    details: string;
    location: string;
    startTime: string; // YYYYMMDDTHHmmssZ
    endTime: string;
  };
}

export interface GalleryPhoto {
  id: string;
  title: string;
  subtitle?: string;
  category: 'all' | 'bride' | 'groom' | 'couple';
  thumbnailUrl: string;
  fullUrl: string;
  aspectRatio: 'square' | 'portrait' | 'landscape';
}

export interface RSVPFormData {
  name: string;
  phone: string;
  attending: boolean;
  guestsCount: number;
  side: 'groom' | 'bride' | 'both';
  message?: string;
  dietaryRequirements?: string;
}

export interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  relationship?: string;
  avatar_color?: string;
  likes_count?: number;
}
