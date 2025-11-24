/**
 * useSettings Hook
 * 
 * Provides access to app settings with reactive updates.
 * Wraps the theme context for convenience.
 */

import { useTheme } from '@/contexts/theme-context';
import { CustomColors, ThemePresetId } from '@/types';

interface UseSettingsResult {
  /** Current active theme preset ID */
  themeId: ThemePresetId;
  
  /** Current custom colors (null if using preset) */
  customColors: CustomColors | null;
  
  /** Whether settings are loading */
  isLoading: boolean;
  
  /** Switch to a different theme preset */
  updateTheme: (themeId: ThemePresetId) => Promise<void>;
  
  /** Update custom colors */
  updateCustomColors: (colors: CustomColors) => Promise<void>;
  
  /** Reset to default theme */
  resetToDefault: () => Promise<void>;
}

/**
 * Hook for managing app settings
 * 
 * @returns Settings state and operations
 */
export function useSettings(): UseSettingsResult {
  const {
    themeId,
    customColors,
    isLoading,
    setTheme,
    setCustomColors,
    resetTheme,
  } = useTheme();

  return {
    themeId,
    customColors,
    isLoading,
    updateTheme: setTheme,
    updateCustomColors: setCustomColors,
    resetToDefault: resetTheme,
  };
}
