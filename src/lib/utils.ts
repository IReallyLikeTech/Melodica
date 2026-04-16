import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    h > 0 ? h : null,
    m.toString().padStart(h > 0 ? 2 : 1, '0'),
    s.toString().padStart(2, '0'),
  ].filter(Boolean).join(':');
}

export function getTonalRange(hex: string) {
  // Simple approximation of Material You tonal range
  // In a real app, we'd use @material/material-color-utilities
  // For this version, we'll use CSS custom properties handled by the theme provider
  return hex;
}
