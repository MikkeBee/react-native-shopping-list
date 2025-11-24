/**
 * Shopping Items Service
 * 
 * Handles CRUD operations for shopping items.
 * All database operations with validation and error handling.
 */

import {
    CreateShoppingItemDto,
    DatabaseError,
    NotFoundError,
    ShoppingItem,
    UpdateShoppingItemDto,
    ValidationError,
} from '@/types';
import { getDatabase } from './database.service';

/**
 * Generate a UUID v4
 * 
 * Simple UUID v4 generator for unique IDs
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate and sanitize item text
 * 
 * @param text - Item text to validate
 * @returns Validated and trimmed text
 * @throws ValidationError if invalid
 */
function validateItemText(text: string): string {
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    throw new ValidationError(
      'Item text cannot be empty',
      'text',
      text
    );
  }
  
  if (trimmed.length > 500) {
    throw new ValidationError(
      'Item text cannot exceed 500 characters',
      'text',
      text
    );
  }
  
  return trimmed;
}

/**
 * Retrieve all items for a specific shopping list ordered by creation date
 * 
 * @param listId - Shopping list UUID
 * @returns Promise resolving to array of shopping items
 * @throws DatabaseError if query fails
 */
export async function getByListId(listId: string): Promise<ShoppingItem[]> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const rows = await db.getAllAsync<any>(
      'SELECT * FROM shopping_items WHERE list_id = ? ORDER BY created_at ASC',
      [listId]
    );

    // Map snake_case columns to camelCase
    const items: ShoppingItem[] = rows.map(row => ({
      id: row.id,
      listId: row.list_id,
      text: row.text,
      completed: Boolean(row.completed),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    console.log(`[ShoppingItemsService] Retrieved ${items.length} items for list ${listId}`);
    return items;
  } catch (error) {
    console.error('[ShoppingItemsService] getByListId failed:', error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve shopping items', error);
  }
}

/**
 * Retrieve a single shopping item by ID
 * 
 * @param id - Shopping item UUID
 * @returns Promise resolving to shopping item or null if not found
 * @throws DatabaseError if query fails
 */
export async function getById(id: string): Promise<ShoppingItem | null> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const row = await db.getFirstAsync<any>(
      'SELECT * FROM shopping_items WHERE id = ?',
      [id]
    );

    if (!row) {
      console.log(`[ShoppingItemsService] Retrieved item ${id}: not found`);
      return null;
    }

    // Map snake_case columns to camelCase
    const item: ShoppingItem = {
      id: row.id,
      listId: row.list_id,
      text: row.text,
      completed: Boolean(row.completed),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    console.log(`[ShoppingItemsService] Retrieved item ${id}: found`);
    return item;
  } catch (error) {
    console.error('[ShoppingItemsService] getById failed:', error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve shopping item', error);
  }
}

/**
 * Create a new shopping item
 * 
 * @param dto - Shopping item creation data
 * @returns Promise resolving to created shopping item
 * @throws ValidationError if text is invalid or listId invalid
 * @throws NotFoundError if parent list doesn't exist
 * @throws DatabaseError if insert fails
 */
export async function create(dto: CreateShoppingItemDto): Promise<ShoppingItem> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Validate text
    const validatedText = validateItemText(dto.text);

    // Validate listId exists
    const listExists = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM shopping_lists WHERE id = ?',
      [dto.listId]
    );

    if (!listExists || listExists.count === 0) {
      throw new NotFoundError('Shopping list not found', 'listId', dto.listId);
    }

    // Generate UUID and timestamps
    const id = generateUUID();
    const now = Date.now();

    // Create item
    await db.runAsync(
      'INSERT INTO shopping_items (id, list_id, text, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, dto.listId, validatedText, 0, now, now]
    );

    const newItem: ShoppingItem = {
      id,
      listId: dto.listId,
      text: validatedText,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[ShoppingItemsService] Created item:', id);
    return newItem;
  } catch (error) {
    console.error('[ShoppingItemsService] create failed:', error);
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to create shopping item', error);
  }
}

/**
 * Update an existing shopping item's text
 * 
 * @param id - Shopping item UUID
 * @param dto - Shopping item update data
 * @returns Promise resolving to updated shopping item
 * @throws ValidationError if text is invalid
 * @throws NotFoundError if item doesn't exist
 * @throws DatabaseError if update fails
 */
export async function update(id: string, dto: UpdateShoppingItemDto): Promise<ShoppingItem> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Validate text
    const validatedText = validateItemText(dto.text);

    // Check if item exists
    const existingItem = await getById(id);
    if (!existingItem) {
      throw new NotFoundError('Shopping item not found', 'id', id);
    }

    // Update item
    const now = Date.now();
    await db.runAsync(
      'UPDATE shopping_items SET text = ?, updated_at = ? WHERE id = ?',
      [validatedText, now, id]
    );

    const updatedItem: ShoppingItem = {
      ...existingItem,
      text: validatedText,
      updatedAt: now,
    };

    console.log('[ShoppingItemsService] Updated item:', id);
    return updatedItem;
  } catch (error) {
    console.error('[ShoppingItemsService] update failed:', error);
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to update shopping item', error);
  }
}

/**
 * Copy (duplicate) an existing shopping item
 * Creates a new item with the same text in the same list
 * 
 * @param id - Shopping item UUID to copy
 * @returns Promise resolving to newly created item
 * @throws NotFoundError if source item doesn't exist
 * @throws DatabaseError if insert fails
 */
export async function copy(id: string): Promise<ShoppingItem> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Get source item
    const sourceItem = await getById(id);
    if (!sourceItem) {
      throw new NotFoundError('Shopping item not found', 'id', id);
    }

    // Create copy with same text and listId
    const newId = generateUUID();
    const now = Date.now();

    await db.runAsync(
      'INSERT INTO shopping_items (id, list_id, text, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [newId, sourceItem.listId, sourceItem.text, sourceItem.completed ? 1 : 0, now, now]
    );

    const copiedItem: ShoppingItem = {
      id: newId,
      listId: sourceItem.listId,
      text: sourceItem.text,
      completed: sourceItem.completed,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[ShoppingItemsService] Copied item:', id, '→', newId);
    return copiedItem;
  } catch (error) {
    console.error('[ShoppingItemsService] copy failed:', error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to copy shopping item', error);
  }
}

/**
 * Toggle the completion status of a shopping item
 * 
 * @param id - Shopping item UUID
 * @returns Promise resolving to updated shopping item
 * @throws NotFoundError if item doesn't exist
 * @throws DatabaseError if update fails
 */
export async function toggleComplete(id: string): Promise<ShoppingItem> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Get current item
    const existingItem = await getById(id);
    if (!existingItem) {
      throw new NotFoundError('Shopping item not found', 'id', id);
    }

    // Toggle completed status
    const newCompleted = !existingItem.completed;
    const now = Date.now();

    await db.runAsync(
      'UPDATE shopping_items SET completed = ?, updated_at = ? WHERE id = ?',
      [newCompleted ? 1 : 0, now, id]
    );

    const updatedItem: ShoppingItem = {
      ...existingItem,
      completed: newCompleted,
      updatedAt: now,
    };

    console.log('[ShoppingItemsService] Toggled completion for item:', id, '→', newCompleted);
    return updatedItem;
  } catch (error) {
    console.error('[ShoppingItemsService] toggleComplete failed:', error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to toggle item completion', error);
  }
}

/**
 * Delete a shopping item
 * 
 * @param id - Shopping item UUID
 * @returns Promise resolving to void
 * @throws NotFoundError if item doesn't exist
 * @throws DatabaseError if delete fails
 */
export async function deleteItem(id: string): Promise<void> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Check if item exists
    const existingItem = await getById(id);
    if (!existingItem) {
      throw new NotFoundError('Shopping item not found', 'id', id);
    }

    // Delete item
    await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [id]);

    console.log('[ShoppingItemsService] Deleted item:', id);
  } catch (error) {
    console.error('[ShoppingItemsService] delete failed:', error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to delete shopping item', error);
  }
}

/**
 * Count total number of items in a specific list
 * 
 * @param listId - Shopping list UUID
 * @returns Promise resolving to count
 * @throws DatabaseError if query fails
 */
export async function countByListId(listId: string): Promise<number> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM shopping_items WHERE list_id = ?',
      [listId]
    );

    const count = result?.count || 0;
    console.log(`[ShoppingItemsService] Count for list ${listId}:`, count);
    return count;
  } catch (error) {
    console.error('[ShoppingItemsService] countByListId failed:', error);
    throw new DatabaseError('Failed to count shopping items', error);
  }
}

/**
 * Delete all items for a specific list
 * Usually called automatically via CASCADE, but provided for manual cleanup
 * 
 * @param listId - Shopping list UUID
 * @returns Promise resolving to number of items deleted
 * @throws DatabaseError if delete fails
 */
export async function deleteByListId(listId: string): Promise<number> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Get count before deletion
    const countBefore = await countByListId(listId);

    // Delete all items
    await db.runAsync('DELETE FROM shopping_items WHERE list_id = ?', [listId]);

    console.log('[ShoppingItemsService] Deleted', countBefore, 'items for list', listId);
    return countBefore;
  } catch (error) {
    console.error('[ShoppingItemsService] deleteByListId failed:', error);
    throw new DatabaseError('Failed to delete shopping items', error);
  }
}
