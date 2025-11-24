/**
 * ShoppingItem Entity
 * 
 * Represents an individual item within a shopping list.
 * Items belong to exactly one list and support edit, copy, and delete operations.
 */
export interface ShoppingItem {
  /** Unique identifier (UUID v4 format) */
  id: string;
  
  /** Foreign key to parent ShoppingList */
  listId: string;
  
  /** Item description or name (1-500 characters) */
  text: string;
  
  /** Completion status (true if item is marked as completed) */
  completed: boolean;
  
  /** Creation timestamp (Unix epoch in milliseconds) */
  createdAt: number;
  
  /** Last modification timestamp (Unix epoch in milliseconds) */
  updatedAt: number;
}

/**
 * DTO for creating a new shopping item
 */
export interface CreateShoppingItemDto {
  /** Parent list ID */
  listId: string;
  
  /** Item text (1-500 characters, will be trimmed) */
  text: string;
}

/**
 * DTO for updating an existing shopping item
 */
export interface UpdateShoppingItemDto {
  /** Updated item text (1-500 characters, will be trimmed) */
  text: string;
}
