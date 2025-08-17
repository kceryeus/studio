import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates and formats phone numbers for Mozambique
 * Accepts simple 9-digit numbers starting with 8 or 9
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's 9 digits starting with 8 or 9, format it
  if (cleaned.length === 9 && /^[89]/.test(cleaned)) {
    return cleaned;
  }
  
  // Return as is if no pattern matches
  return phone;
}

/**
 * Validates if a phone number is in a valid Mozambique format
 */
export function isValidMozambiquePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's exactly 9 digits starting with 8 or 9
  const phoneRegex = /^[89]\d{8}$/;
  
  return phoneRegex.test(cleaned);
}

/**
 * Generates a unique client ID based on provider ID and phone number
 * This will be used for future synchronization
 */
export function generateClientSyncId(providerId: string, phone: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  return `${providerId}_${formattedPhone}`;
}

/**
 * Extracts the phone number from a sync ID
 */
export function extractPhoneFromSyncId(syncId: string): string | null {
  const parts = syncId.split('_');
  if (parts.length >= 2) {
    const phone = parts.slice(1).join('_');
    return phone;
  }
  return null;
}

/**
 * Checks if a client is linked to a user account
 */
export function isClientLinked(client: { userId: string | null }): boolean {
  return client.userId !== null;
}

/**
 * Formats currency for Mozambique (MT - Meticais)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculates total route distance and estimated duration
 */
export function calculateRouteMetrics(points: { coordinates: { lat: number; lng: number } }[]): {
  totalDistance: number;
  estimatedDuration: number;
} {
  if (points.length < 2) {
    return { totalDistance: 0, estimatedDuration: 0 };
  }

  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    totalDistance += calculateDistance(
      current.coordinates.lat,
      current.coordinates.lng,
      next.coordinates.lat,
      next.coordinates.lng
    );
  }

  // Estimate duration: 5 minutes per stop + 2 minutes per km
  const estimatedDuration = points.length * 5 + totalDistance * 2;

  return {
    totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
    estimatedDuration: Math.round(estimatedDuration)
  };
}

/**
 * Generates a random color for route visualization
 */
export function generateRouteColor(): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Formats duration in minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats distance in kilometers
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Validates if coordinates are within reasonable bounds for Mozambique
 */
export function isValidMozambiqueCoordinates(lat: number, lng: number): boolean {
  // Mozambique bounds: approximately -26.8 to -10.4 lat, 30.2 to 40.8 lng
  return lat >= -27 && lat <= -10 && lng >= 30 && lng <= 41;
}
