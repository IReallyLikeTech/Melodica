import { PlayerTheme } from '../types';

export function generateThemeFromColor(rgb: string): PlayerTheme {
  // Parse rgb(r, g, b)
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return getDefaultTheme();

  const [r, g, b] = match.slice(1).map(Number);
  
  // Simple luminance check
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isDark = luminance < 0.5;

  // Derive colors
  return {
    primary: rgb,
    onPrimary: isDark ? '#FFFFFF' : '#000000',
    primaryContainer: `rgba(${r}, ${g}, ${b}, 0.2)`,
    onPrimaryContainer: rgb,
    secondary: `rgb(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)})`,
    onSecondary: isDark ? '#FFFFFF' : '#000000',
    secondaryContainer: `rgba(${r}, ${g}, ${b}, 0.1)`,
    onSecondaryContainer: rgb,
    surface: isDark ? '#1C1B1F' : '#FFFBFE',
    onSurface: isDark ? '#E6E1E5' : '#1C1B1F',
    surfaceVariant: `rgba(${r}, ${g}, ${b}, 0.05)`,
    onSurfaceVariant: isDark ? '#CAC4D0' : '#49454F',
    outline: `rgba(${r}, ${g}, ${b}, 0.5)`,
  };
}

function getDefaultTheme(): PlayerTheme {
  return {
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
  };
}
