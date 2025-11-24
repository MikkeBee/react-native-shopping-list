/**
 * Type definitions for Shopping Lists Manager
 * 
 * Centralized export of all types, interfaces, and custom errors.
 */

// Entity types
export type { AppSettings, CustomColors, ThemePresetId, UpdateCustomColorsDto, UpdateThemeDto } from './settings';
export type { CreateShoppingItemDto, ShoppingItem, UpdateShoppingItemDto } from './shopping-item';
export type { CreateShoppingListDto, ShoppingList, UpdateShoppingListDto } from './shopping-list';

// Custom errors
export { DatabaseError, NotFoundError, ValidationError } from './service-errors';

