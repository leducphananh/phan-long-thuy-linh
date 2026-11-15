export const VIETNAM_PHONE_REGEX = /^(\+?84|0)(?:[\s.-]?\d){8,10}$/;

const URL_OR_CONTACT_REGEX =
  /(https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com\/|[a-z0-9-]+\.(com|net|org|io|xyz|vn)\b)/i;

const EMBEDDED_PHONE_REGEX = /(?:\+?84|0)(?:[\s.-]?\d){8,10}/;

const SUSPICIOUS_REPETITION_REGEX = /(.)\1{6,}/i;

const BLOCKED_SPAM_KEYWORDS = [
  'kiemtien',
  'vaytien',
  'khuyenmai',
  'casino',
  'nhacai',
  'soikeo',
  'telegram',
  'bitcoin',
  'crypto',
  'clickvao',
] as const;

export function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function normalizeForComparison(text: string): string {
  return normalizeSpaces(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '');
}

export function hasSuspiciousRepetition(text: string): boolean {
  return SUSPICIOUS_REPETITION_REGEX.test(text.replace(/\s+/g, ''));
}

export function hasUrlOrContact(text: string): boolean {
  return URL_OR_CONTACT_REGEX.test(text) || EMBEDDED_PHONE_REGEX.test(text);
}

export function hasLikelySpamContent(text: string): boolean {
  const normalized = normalizeForComparison(text);
  return BLOCKED_SPAM_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isValidVietnamPhone(phone: string): boolean {
  return VIETNAM_PHONE_REGEX.test(normalizeSpaces(phone));
}
