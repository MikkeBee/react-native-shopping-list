/**
 * App Settings Types
 * 
 * Defines types for user preferences including theme selection and custom colors.
 */

/**
 * Theme preset identifiers
 */
export type ThemePresetId = 
  | 'default'
  | 'cyberpunk'
  | 'steampunk'
  | 'retro'
  | 'artdeco'
  | 'custom';

/**
 * Custom color configuration
 */
export interface CustomColors {
  /** Color for completed items */
  completedColor?: string;
  
  /** Accent/button color */
  accentColor?: string;
  
  /** Primary text color */
  textColor?: string;
  
  /** Background color */
  backgroundColor?: string;
  
  /** Card/item background color */
  cardColor?: string;
}

/**
 * App settings entity
 */
export interface AppSettings {
  /** Settings ID (always 1, single row table) */
  id: number;
  
  /** Selected theme preset */
  themeId: ThemePresetId;
  
  /** Custom colors (null if using preset) */
  customColors: CustomColors | null;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last modification timestamp */
  updatedAt: number;
}

/**
 * DTO for updating theme
 */
export interface UpdateThemeDto {
  /** Theme preset ID to switch to */
  themeId: ThemePresetId;
}

/**
 * DTO for updating custom colors
 */
export interface UpdateCustomColorsDto {
  /** Custom color configuration */
  customColors: CustomColors;
}
