/**
 * Theme System for Shopping Lists Manager
 * 
 * Includes default light/dark themes plus 4 preset themes:
 * - Cyberpunk: Neon cyan/magenta, dark backgrounds, high contrast
 * - Steampunk: Bronze, copper, vintage sepia tones
 * - Retro (80s/90s): Hot pink, electric blue, neon yellow, pastels
 * - Art Deco: Gold, black, geometric elegance
 */

import type { ThemePresetId } from '@/types';
import { Platform } from 'react-native';

/**
 * Color scheme definition
 */
export interface ColorScheme {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  cardBackground: string;
  cardBorder: string;
  danger: string;
  success: string;
  warning: string;
  muted: string;
  subtle: string;
  completedColor?: string;
}

/**
 * Theme preset definition
 */
export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  light: ColorScheme;
  dark: ColorScheme;
}

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/**
 * Default theme (original app theme)
 */
export const DefaultTheme: ThemePreset = {
  id: 'default',
  name: 'Default',
  description: 'Clean and minimal design with ocean blues',
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#f9fafb',
    cardBorder: '#e5e7eb',
    danger: '#dc2626',
    success: '#16a34a',
    warning: '#ea580c',
    muted: '#6b7280',
    subtle: '#9ca3af',
    completedColor: '#9ca3af',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1f2937',
    cardBorder: '#374151',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f97316',
    muted: '#9ca3af',
    subtle: '#6b7280',
    completedColor: '#6b7280',
  },
};

/**
 * Cyberpunk theme - Neon dreams and dark nights
 */
export const CyberpunkTheme: ThemePreset = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  description: 'Neon cyan and magenta on dark backgrounds',
  light: {
    text: '#0A0E27',
    background: '#D0D5E8',
    tint: '#00FFFF',
    icon: '#7B2CBF',
    tabIconDefault: '#5A189A',
    tabIconSelected: '#00FFFF',
    cardBackground: '#E8E9F3',
    cardBorder: '#C77DFF',
    danger: '#FF006E',
    success: '#00F5FF',
    warning: '#FFBE0B',
    muted: '#7B2CBF',
    subtle: '#9D4EDD',
    completedColor: '#7B2CBF',
  },
  dark: {
    text: '#00FFFF',
    background: '#0A0E27',
    tint: '#FF00FF',
    icon: '#C77DFF',
    tabIconDefault: '#9D4EDD',
    tabIconSelected: '#FF00FF',
    cardBackground: '#151933',
    cardBorder: '#7B2CBF',
    danger: '#FF006E',
    success: '#00FFFF',
    warning: '#FFBE0B',
    muted: '#9D4EDD',
    subtle: '#7B2CBF',
    completedColor: '#7B2CBF',
  },
};

/**
 * Steampunk theme - Victorian industrial elegance
 */
export const SteampunkTheme: ThemePreset = {
  id: 'steampunk',
  name: 'Steampunk',
  description: 'Bronze, copper, and vintage sepia tones',
  light: {
    text: '#3E2723',
    background: '#F5E6D3',
    tint: '#B87333',
    icon: '#8D6E63',
    tabIconDefault: '#6D4C41',
    tabIconSelected: '#B87333',
    cardBackground: '#FFF8E1',
    cardBorder: '#D7CCC8',
    danger: '#D84315',
    success: '#689F38',
    warning: '#F57C00',
    muted: '#8D6E63',
    subtle: '#A1887F',
    completedColor: '#8D6E63',
  },
  dark: {
    text: '#EFEBE9',
    background: '#3E2723',
    tint: '#FFB74D',
    icon: '#BCAAA4',
    tabIconDefault: '#A1887F',
    tabIconSelected: '#FFB74D',
    cardBackground: '#4E342E',
    cardBorder: '#8D6E63',
    danger: '#FF7043',
    success: '#9CCC65',
    warning: '#FFB74D',
    muted: '#A1887F',
    subtle: '#8D6E63',
    completedColor: '#A1887F',
  },
};

/**
 * Retro (80s/90s) theme - Totally radical vibes
 */
export const RetroTheme: ThemePreset = {
  id: 'retro',
  name: '80s/90s Retro',
  description: 'Hot pink, electric blue, and neon yellow nostalgia',
  light: {
    text: '#1A237E',
    background: '#F3E5F5',
    tint: '#E91E63',
    icon: '#7B1FA2',
    tabIconDefault: '#9C27B0',
    tabIconSelected: '#E91E63',
    cardBackground: '#FFF9C4',
    cardBorder: '#CE93D8',
    danger: '#F50057',
    success: '#00E676',
    warning: '#FFD600',
    muted: '#9C27B0',
    subtle: '#BA68C8',
    completedColor: '#9C27B0',
  },
  dark: {
    text: '#FF4081',
    background: '#1A0033',
    tint: '#00E5FF',
    icon: '#E1BEE7',
    tabIconDefault: '#CE93D8',
    tabIconSelected: '#00E5FF',
    cardBackground: '#3D1A5F',
    cardBorder: '#9C27B0',
    danger: '#FF1744',
    success: '#69F0AE',
    warning: '#FFEA00',
    muted: '#CE93D8',
    subtle: '#BA68C8',
    completedColor: '#CE93D8',
  },
};

/**
 * Art Deco theme - Geometric glamour
 */
export const ArtDecoTheme: ThemePreset = {
  id: 'artdeco',
  name: 'Art Deco',
  description: 'Gold, black, and geometric elegance',
  light: {
    text: '#212121',
    background: '#FAFAFA',
    tint: '#FFD700',
    icon: '#616161',
    tabIconDefault: '#757575',
    tabIconSelected: '#FFD700',
    cardBackground: '#FFFFFF',
    cardBorder: '#E0E0E0',
    danger: '#C62828',
    success: '#2E7D32',
    warning: '#F57F17',
    muted: '#757575',
    subtle: '#9E9E9E',
    completedColor: '#9E9E9E',
  },
  dark: {
    text: '#FFD700',
    background: '#000000',
    tint: '#FFD700',
    icon: '#BDBDBD',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#FFD700',
    cardBackground: '#0D0D0D',
    cardBorder: '#424242',
    danger: '#EF5350',
    success: '#66BB6A',
    warning: '#FBC02D',
    muted: '#9E9E9E',
    subtle: '#757575',
    completedColor: '#9E9E9E',
  },
};

/**
 * All available theme presets
 */
export const ThemePresets: Record<ThemePresetId, ThemePreset> = {
  default: DefaultTheme,
  cyberpunk: CyberpunkTheme,
  steampunk: SteampunkTheme,
  retro: RetroTheme,
  artdeco: ArtDecoTheme,
  custom: DefaultTheme, // Custom theme uses default as base, colors overridden by user
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use ThemePresets.default instead
 */
export const Colors = {
  light: DefaultTheme.light,
  dark: DefaultTheme.dark,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
