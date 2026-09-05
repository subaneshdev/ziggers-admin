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

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
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
