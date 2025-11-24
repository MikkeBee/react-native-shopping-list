/**
 * ShoppingList Entity
 * 
 * Represents a named collection of shopping items.
 * Users can create multiple lists to organize different shopping contexts.
 */
export interface ShoppingList {
  /** Unique identifier (UUID v4 format) */
  id: string;
  
  /** User-defined list name (1-100 characters) */
  name: string;
  
  /** Creation timestamp (Unix epoch in milliseconds) */
  createdAt: number;
  
  /** Last modification timestamp (Unix epoch in milliseconds) */
  updatedAt: number;
}

/**
 * DTO for creating a new shopping list
 */
export interface CreateShoppingListDto {
  /** List name (1-100 characters, will be trimmed) */
  name: string;
}

/**
 * DTO for updating an existing shopping list
 */
export interface UpdateShoppingListDto {
  /** New list name (1-100 characters, will be trimmed) */
  name: string;
}
