import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(
    address.length - chars
  )}`
}

export function isValidAddress(address: string, networkType: string): boolean {
  // Add validation logic based on network type
  return true
}
