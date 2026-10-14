import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
    return `${formatted} IST`;
  } catch {
    return String(dateString);
  }
}

export function formatISTTimestamp(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
    return `${formatted} IST`;
  } catch {
    return String(dateString);
  }
}

export function getISTClockString(date: Date = new Date()): string {
  try {
    const timeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
    return `IST ${timeStr.toUpperCase()}`;
  } catch {
    return 'IST';
  }
}

export function getISTDateKey(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

export function getISTStartOfTodayMs(now: Date = new Date()): number {
  const istDateStr = getISTDateKey(now); // YYYY-MM-DD in Asia/Kolkata
  if (!istDateStr) return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return new Date(`${istDateStr}T00:00:00.000+05:30`).getTime();
}

export function getISTHour(dateInput: string | number | Date): number {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 0;
    const hourStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hourCycle: 'h23',
    }).format(d);
    const parsed = parseInt(hourStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

export function getISTTimeString(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d).toUpperCase() + ' IST'
    );
  } catch {
    return 'N/A';
  }
}


// ==========================================
// 1. Pricing, Fees & Escrow Funding Logics
// ==========================================

export function calculateWorkerTotalPayout(payoutPerWorker: number, workersRequired: number = 1): number {
  return payoutPerWorker * workersRequired;
}

export function calculatePlatformFee(totalWorkerPayout: number, feeWaiverRemaining: number = 0): number {
  if (feeWaiverRemaining > 0) return 0;
  return Number((totalWorkerPayout * 0.075).toFixed(2));
}

export function calculateTotalEmployerPayment(totalWorkerPayout: number, feeWaiverRemaining: number = 0): number {
  const platformFee = calculatePlatformFee(totalWorkerPayout, feeWaiverRemaining);
  return totalWorkerPayout + platformFee;
}

export function calculateAmountInPaise(totalRupeeAmount: number): number {
  return Math.round(totalRupeeAmount * 100);
}

// ==========================================
// 2. Geofencing & Distance Radius Logics
// ==========================================

export function calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2)); // Distance in km
}

export function isGeofenceBreached(lat1: number, lng1: number, lat2: number, lng2: number, thresholdMeters: number = 500): boolean {
  const distKm = calculateHaversineDistance(lat1, lng1, lat2, lng2);
  const distMeters = distKm * 1000;
  return distMeters > thresholdMeters;
}

// ==========================================
// 3. User Rating & Trust Score Logics
// ==========================================

export function calculateAverageRating(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 5.0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Number((sum / ratings.length).toFixed(1));
}

export function calculateCompletionRate(completedZigs: number, totalAssignedZigs: number): number {
  if (totalAssignedZigs === 0) return 0;
  return Number(((completedZigs / totalAssignedZigs) * 100).toFixed(1));
}

// ==========================================
// 4. Referral Waiver Logics
// ==========================================

export function calculateReferrerWaiverSlots(existingSlots: number = 0): number {
  return existingSlots + 3;
}

export const INITIAL_REFEREE_WAIVER_SLOTS = 3;

// ==========================================
// 5. Wallet Ledger & Net Settlement Logics
// ==========================================

export function calculateNetWorkerSettlement(agreedPayout: number) {
  const platformFee = Number((agreedPayout * 0.075).toFixed(2));
  return {
    workerWalletAddition: agreedPayout,
    platformRevenueRetained: platformFee,
  };
}

export function calculateNewWalletBalance(previousBalance: number, amount: number, type: 'CREDIT' | 'DEBIT'): number {
  return type === 'CREDIT' ? previousBalance + amount : previousBalance - amount;
}

// ==========================================
// 6. Duration & Rate Logics
// ==========================================

export function calculateEstimatedHours(startTimeIsoOrEpoch: string | number, endTimeIsoOrEpoch: string | number): number {
  const startMs = typeof startTimeIsoOrEpoch === 'number' ? startTimeIsoOrEpoch * 1000 : new Date(startTimeIsoOrEpoch).getTime();
  const endMs = typeof endTimeIsoOrEpoch === 'number' ? endTimeIsoOrEpoch * 1000 : new Date(endTimeIsoOrEpoch).getTime();
  const diffSec = Math.max(0, (endMs - startMs) / 1000);
  return Number((diffSec / 3600).toFixed(2));
}

export function calculateHourlyPayRate(payout: number, estimatedHours: number): number {
  if (estimatedHours <= 0) return payout;
  return Number((payout / estimatedHours).toFixed(2));
}

// ==========================================
// 7. KYC & Aadhaar Extraction Helpers
// ==========================================

export function cleanAadhaarDigits(value?: string | null): string {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 12);
}

export function formatAadhaarNumber(value?: string | null): string {
  const digits = cleanAadhaarDigits(value);
  if (!digits) return '';
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function isValidAadhaarNumber(value?: string | null): boolean {
  return cleanAadhaarDigits(value).length === 12;
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  
  // Ignore verification reference tokens that are not images
  if (trimmed.startsWith('MC_DL:') || trimmed.startsWith('MC_EKYC_') || trimmed.startsWith('MC_') || trimmed.startsWith('REF:')) {
    return '';
  }
  
  // Standard URLs and Data URIs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  
  // Raw base64 JPEG
  if (trimmed.startsWith('/9j/') || trimmed.startsWith('/9j')) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  
  // Raw base64 PNG
  if (trimmed.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${trimmed}`;
  }
  
  // Raw base64 WebP
  if (trimmed.startsWith('UklGR')) {
    return `data:image/webp;base64,${trimmed}`;
  }

  return trimmed;
}
