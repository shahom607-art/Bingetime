import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function formatDuration(totalSeconds: number): DurationParts {
  const days = Math.floor(totalSeconds / (3600 * 24));
  totalSeconds %= (3600 * 24);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return { days, hours, minutes, seconds };
}

export function formatDurationToString(totalSeconds: number): string {
  const { days, hours, minutes, seconds } = formatDuration(totalSeconds);
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  
  if (days > 0) {
    return `${days}d : ${h}h : ${m}m : ${s}s`;
  }
  return `${h}h : ${m}m : ${s}s`;
}
