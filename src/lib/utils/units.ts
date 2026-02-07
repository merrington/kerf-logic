import type { UnitSystem } from '../types';

const MM_PER_INCH = 25.4;

export function toMillimeters(value: number, unit: UnitSystem): number {
  if (unit === 'metric') return value;
  return value * MM_PER_INCH;
}

export function fromMillimeters(value: number, unit: UnitSystem): number {
  if (unit === 'metric') return value;
  return value / MM_PER_INCH;
}

export function formatDimension(value: number, unit: UnitSystem): string {
  if (unit === 'metric') {
    return `${Math.round(value * 10) / 10}mm`;
  }
  
  const inches = value / MM_PER_INCH;
  const whole = Math.floor(inches);
  const fraction = inches - whole;
  
  if (fraction === 0) return `${whole}"`;
  
  const sixteenths = Math.round(fraction * 16);
  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;
  
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(sixteenths, 16);
  
  if (whole === 0) {
    return `${sixteenths / divisor}/${16 / divisor}"`;
  }
  return `${whole} ${sixteenths / divisor}/${16 / divisor}"`;
}

export function parseDimension(input: string, unit: UnitSystem): number | null {
  const trimmed = input.trim();
  
  if (unit === 'metric') {
    const match = trimmed.match(/^([\d.]+)(?:\s*mm)?$/i);
    if (match) return parseFloat(match[1]);
    return null;
  }
  
  const imperialMatch = trimmed.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)"?$/);
  if (imperialMatch) {
    const whole = imperialMatch[1] ? parseInt(imperialMatch[1]) : 0;
    const num = parseInt(imperialMatch[2]);
    const den = parseInt(imperialMatch[3]);
    return toMillimeters(whole + num / den, 'imperial');
  }
  
  const decimalMatch = trimmed.match(/^([\d.]+)"?$/);
  if (decimalMatch) {
    return toMillimeters(parseFloat(decimalMatch[1]), 'imperial');
  }
  
  return null;
}
