import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers according to Indian Rupee numbering format (Lakhs, Crores)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a plain number with Indian thousands commas (e.g., 1,54,820)
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format ISO date string into readable Hindi/English format
 */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Builds standard UPI 2.0 Intent Deep Link string
 * Format: upi://pay?pa={upiId}&pn={nomineeName}&am=50&cu=INR&tn={note}
 */
export function generateUpiLink(params: {
  upiId: string;
  nomineeName: string;
  amount?: number;
  note?: string;
}): string {
  const { upiId, nomineeName, amount = 50, note = 'DPSWT Welfare Support' } = params;
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(nomineeName.trim());
  const cleanNote = encodeURIComponent(note.trim());
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amount}&cu=INR&tn=${cleanNote}`;
}

/**
 * Generates Base64 Data URL for a UPI payment QR Code
 */
export async function generateUpiQrCode(upiLink: string): Promise<string> {
  try {
    return await QRCode.toDataURL(upiLink, {
      width: 320,
      margin: 2,
      color: {
        dark: '#262421',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Trigger celebratory confetti on donation completion
 */
export function triggerCelebrationConfetti(): void {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C85A32', '#437A5B', '#FAF8F5', '#E7E2DA'],
    });
  } catch {
    // Non-blocking fallback
  }
}
