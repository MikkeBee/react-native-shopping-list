/**
 * Settings Service
 * 
 * Handles CRUD operations for app settings (theme preferences, custom colors).
 * Settings are stored in a single-row table with id=1.
 */

import {
    AppSettings,
    DatabaseError,
    ThemePresetId,
    UpdateCustomColorsDto,
    UpdateThemeDto
} from '@/types';
import { getDatabase } from './database.service';

/**
 * Get current app settings
 * 
 * @returns Promise resolving to app settings
 * @throws DatabaseError if query fails
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const result = await db.getFirstAsync<{
      id: number;
      theme_id: string;
      custom_colors: string | null;
      created_at: number;
      updated_at: number;
    }>('SELECT * FROM app_settings WHERE id = 1');

    if (!result) {
      throw new DatabaseError('Settings not found. Database may not be initialized properly.');
    }

    const settings: AppSettings = {
      id: result.id,
      themeId: result.theme_id as ThemePresetId,
      customColors: result.custom_colors ? JSON.parse(result.custom_colors) : null,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };

    console.log('[SettingsService] Retrieved settings:', settings.themeId);
    return settings;
  } catch (error) {
    console.error('[SettingsService] getSettings failed:', error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve app settings', error);
  }
}

/**
 * Update the selected theme preset
 * 
 * @param dto - Theme update data
 * @returns Promise resolving to updated settings
 * @throws DatabaseError if update fails
 */
export async function updateTheme(dto: UpdateThemeDto): Promise<AppSettings> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const now = Date.now();

    await db.runAsync(
      'UPDATE app_settings SET theme_id = ?, updated_at = ? WHERE id = 1',
      [dto.themeId, now]
    );

    console.log('[SettingsService] Updated theme to:', dto.themeId);
    return getSettings();
  } catch (error) {
    console.error('[SettingsService] updateTheme failed:', error);
    throw new DatabaseError('Failed to update theme', error);
  }
}

/**
 * Update custom colors
 * 
 * @param dto - Custom colors update data
 * @returns Promise resolving to updated settings
 * @throws DatabaseError if update fails
 */
export async function updateCustomColors(dto: UpdateCustomColorsDto): Promise<AppSettings> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const now = Date.now();
    const customColorsJson = JSON.stringify(dto.customColors);

    await db.runAsync(
      'UPDATE app_settings SET theme_id = ?, custom_colors = ?, updated_at = ? WHERE id = 1',
      ['custom', customColorsJson, now]
    );

    console.log('[SettingsService] Updated custom colors');
    return getSettings();
  } catch (error) {
    console.error('[SettingsService] updateCustomColors failed:', error);
    throw new DatabaseError('Failed to update custom colors', error);
  }
}

/**
 * Reset to default theme
 * 
 * @returns Promise resolving to updated settings
 * @throws DatabaseError if update fails
 */
export async function resetToDefault(): Promise<AppSettings> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const now = Date.now();

    await db.runAsync(
      'UPDATE app_settings SET theme_id = ?, custom_colors = NULL, updated_at = ? WHERE id = 1',
      ['default', now]
    );

    console.log('[SettingsService] Reset to default theme');
    return getSettings();
  } catch (error) {
    console.error('[SettingsService] resetToDefault failed:', error);
    throw new DatabaseError('Failed to reset to default theme', error);
  }
}
