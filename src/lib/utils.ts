import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ActivationCode } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return '₦'; // Default to Naira
  const symbols: { [key: string]: string } = {
    'NGN': '₦',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'GHS': '₵',
    'KES': 'KSh',
  };
  return symbols[currencyCode.toUpperCase()] || `${currencyCode} `;
}

export function formatCurrency(amount: number, currencyCode?: string): string {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export function calculateNewTrialEndDate(currentEndDateISO?: string, duration?: ActivationCode['duration']): string {
  // If the plan is lifetime, the end date becomes effectively infinite.
  // We represent this by setting a date far in the future.
  if (duration === 'lifetime') {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 100);
    return futureDate.toISOString();
  }
  
  // Determine the starting point for the new trial period.
  // If the current trial is already in the future, extend it. Otherwise, start from today.
  const now = new Date();
  const currentEndDate = currentEndDateISO ? new Date(currentEndDateISO) : now;
  const startDate = currentEndDate > now ? currentEndDate : now;
  
  // If no duration is provided, return a default (e.g., current date or a short extension).
  if (!duration) {
    startDate.setDate(startDate.getDate() + 7); // Default 7 days if duration is missing
    return startDate.toISOString();
  }

  const [valueStr, unit] = duration.split('_');
  const value = parseInt(valueStr, 10);

  if (isNaN(value)) {
    // If the duration format is invalid, return a default extension.
    startDate.setDate(startDate.getDate() + 7);
    return startDate.toISOString();
  }

  // Add the duration to the start date.
  if (unit.startsWith('day')) {
    startDate.setDate(startDate.getDate() + value);
  } else if (unit.startsWith('month')) {
    startDate.setMonth(startDate.getMonth() + value);
  } else if (unit.startsWith('year')) {
    startDate.setFullYear(startDate.getFullYear() + value);
  }

  return startDate.toISOString();
}
