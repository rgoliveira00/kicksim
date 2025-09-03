import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Custom color palette for marketplace app
const colors = {
  primary: '#6366F1', // Indigo
  primaryContainer: '#E0E7FF',
  secondary: '#10B981', // Emerald
  secondaryContainer: '#D1FAE5',
  tertiary: '#F59E0B', // Amber
  tertiaryContainer: '#FEF3C7',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  surfaceDisabled: '#F1F5F9',
  background: '#FAFAFA',
  error: '#EF4444',
  errorContainer: '#FEE2E2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E1B4B',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#064E3B',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#92400E',
  onSurface: '#1F2937',
  onSurfaceVariant: '#6B7280',
  onSurfaceDisabled: '#9CA3AF',
  onBackground: '#111827',
  onError: '#FFFFFF',
  onErrorContainer: '#7F1D1D',
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',
  inverseSurface: '#374151',
  inverseOnSurface: '#F9FAFB',
  inversePrimary: '#A5B4FC',
  shadow: '#000000',
  scrim: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  // Custom marketplace colors
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  rating: '#FBBF24',
  price: '#059669',
  discount: '#DC2626',
  neutral: '#6B7280',
};

// Typography configuration
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

// Main theme configuration
export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadow system
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;

