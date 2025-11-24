/**
 * Theme Context
 * 
 * Provides theme state management across the app.
 * Supports preset themes, custom colors, and system color scheme detection.
 */

import { ColorScheme, ThemePresets } from '@/constants/theme';
import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';
import * as SettingsService from '@/services/settings.service';
import { CustomColors, ThemePresetId } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  /** Current active theme preset ID */
  themeId: ThemePresetId;
  
  /** Current custom colors (null if using preset) */
  customColors: CustomColors | null;
  
  /** Resolved color scheme based on theme and system preference */
  colors: ColorScheme;
  
  /** Whether theme is loading */
  isLoading: boolean;
  
  /** Switch to a different theme preset */
  setTheme: (themeId: ThemePresetId) => Promise<void>;
  
  /** Update custom colors */
  setCustomColors: (colors: CustomColors) => Promise<void>;
  
  /** Reset to default theme */
  resetTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useSystemColorScheme();
  const [themeId, setThemeId] = useState<ThemePresetId>('default');
  const [customColors, setCustomColorsState] = useState<CustomColors | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Get resolved color scheme based on current theme and system preference
   */
  const getResolvedColors = useCallback((): ColorScheme => {
    const preset = ThemePresets[themeId];
    const baseColors = systemColorScheme === 'dark' ? preset.dark : preset.light;

    // If using custom theme, merge custom colors with base
    if (themeId === 'custom' && customColors) {
      return {
        ...baseColors,
        ...(customColors.backgroundColor && { background: customColors.backgroundColor }),
        ...(customColors.textColor && { text: customColors.textColor }),
        ...(customColors.accentColor && { tint: customColors.accentColor, tabIconSelected: customColors.accentColor }),
        ...(customColors.cardColor && { cardBackground: customColors.cardColor }),
        ...(customColors.completedColor && { completedColor: customColors.completedColor }),
      };
    }

    return baseColors;
  }, [themeId, customColors, systemColorScheme]);

  /**
   * Load theme settings from database on mount
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await SettingsService.getSettings();
        setThemeId(settings.themeId);
        setCustomColorsState(settings.customColors);
      } catch (error) {
        console.error('[ThemeContext] Failed to load settings:', error);
        // Fallback to default theme
        setThemeId('default');
        setCustomColorsState(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * Switch to a different theme preset
   */
  const setTheme = useCallback(async (newThemeId: ThemePresetId) => {
    try {
      await SettingsService.updateTheme({ themeId: newThemeId });
      setThemeId(newThemeId);
      
      // Clear custom colors when switching to a preset
      if (newThemeId !== 'custom') {
        setCustomColorsState(null);
      }
    } catch (error) {
      console.error('[ThemeContext] Failed to update theme:', error);
      throw error;
    }
  }, []);

  /**
   * Update custom colors
   */
  const setCustomColors = useCallback(async (colors: CustomColors) => {
    try {
      await SettingsService.updateCustomColors({ customColors: colors });
      setThemeId('custom');
      setCustomColorsState(colors);
    } catch (error) {
      console.error('[ThemeContext] Failed to update custom colors:', error);
      throw error;
    }
  }, []);

  /**
   * Reset to default theme
   */
  const resetTheme = useCallback(async () => {
    try {
      await SettingsService.resetToDefault();
      setThemeId('default');
      setCustomColorsState(null);
    } catch (error) {
      console.error('[ThemeContext] Failed to reset theme:', error);
      throw error;
    }
  }, []);

  const value: ThemeContextValue = {
    themeId,
    customColors,
    colors: getResolvedColors(),
    isLoading,
    setTheme,
    setCustomColors,
    resetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
