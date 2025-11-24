/**
 * Shopping Lists Service
 * 
 * Handles CRUD operations for shopping lists.
 * All database operations with validation and error handling.
 */

import {
    CreateShoppingListDto,
    DatabaseError,
    NotFoundError,
    ShoppingList,
    UpdateShoppingListDto,
    ValidationError
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
 * Validate and sanitize list name
 * 
 * @param name - List name to validate
 * @param allowDefault - Whether to use default name if empty
 * @returns Validated and trimmed name
 * @throws ValidationError if invalid
 */
function validateListName(name: string, allowDefault = true): string {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    if (allowDefault) {
      return 'Shopping List';
    }
    throw new ValidationError(
      'List name cannot be empty',
      'name',
      name
    );
  }
  
  if (trimmed.length > 100) {
    throw new ValidationError(
      'List name cannot exceed 100 characters',
      'name',
      name
    );
  }
  
  return trimmed;
}

/**
 * Retrieve all shopping lists ordered by creation date (newest first)
 * 
 * @returns Promise resolving to array of shopping lists
 * @throws DatabaseError if query fails
 */
export async function getAll(): Promise<ShoppingList[]> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const rows = await db.getAllAsync<any>(
      'SELECT * FROM shopping_lists ORDER BY created_at DESC'
    );

    // Map snake_case columns to camelCase
    const lists: ShoppingList[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    console.log(`[ShoppingListsService] Retrieved ${lists.length} lists`);
    return lists;
  } catch (error) {
    console.error('[ShoppingListsService] getAll failed:', error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve shopping lists', error);
  }
}

/**
 * Retrieve a single shopping list by ID
 * 
 * @param id - Shopping list UUID
 * @returns Promise resolving to shopping list or null if not found
 * @throws DatabaseError if query fails
 */
export async function getById(id: string): Promise<ShoppingList | null> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const row = await db.getFirstAsync<any>(
      'SELECT * FROM shopping_lists WHERE id = ?',
      [id]
    );

    if (!row) {
      console.log(`[ShoppingListsService] Retrieved list ${id}: not found`);
      return null;
    }

    // Map snake_case columns to camelCase
    const list: ShoppingList = {
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    console.log(`[ShoppingListsService] Retrieved list ${id}: found`);
    return list;
  } catch (error) {
    console.error('[ShoppingListsService] getById failed:', error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to retrieve shopping list', error);
  }
}

/**
 * Create a new shopping list
 * 
 * @param dto - Shopping list creation data
 * @returns Promise resolving to created shopping list
 * @throws ValidationError if name is invalid
 * @throws DatabaseError if insert fails
 */
export async function create(dto: CreateShoppingListDto): Promise<ShoppingList> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Validate and sanitize name
    const name = validateListName(dto.name, true);
    
    // Generate new list
    const now = Date.now();
    const newList: ShoppingList = {
      id: generateUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into database
    await db.runAsync(
      'INSERT INTO shopping_lists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [newList.id, newList.name, newList.createdAt, newList.updatedAt]
    );

    console.log(`[ShoppingListsService] Created list: ${newList.id} - ${newList.name}`);
    return newList;
  } catch (error) {
    console.error('[ShoppingListsService] create failed:', error);
    if (error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to create shopping list', error);
  }
}

/**
 * Update an existing shopping list's name
 * 
 * @param id - Shopping list UUID
 * @param dto - Shopping list update data
 * @returns Promise resolving to updated shopping list
 * @throws ValidationError if name is invalid
 * @throws NotFoundError if list doesn't exist
 * @throws DatabaseError if update fails
 */
export async function update(id: string, dto: UpdateShoppingListDto): Promise<ShoppingList> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Validate and sanitize name
    const name = validateListName(dto.name, false);
    
    // Check if list exists
    const existing = await getById(id);
    if (!existing) {
      throw new NotFoundError(
        `Shopping list not found: ${id}`,
        'ShoppingList',
        id
      );
    }

    // Update database
    const now = Date.now();
    await db.runAsync(
      'UPDATE shopping_lists SET name = ?, updated_at = ? WHERE id = ?',
      [name, now, id]
    );

    const updatedList: ShoppingList = {
      ...existing,
      name,
      updatedAt: now,
    };

    console.log(`[ShoppingListsService] Updated list: ${id} - ${name}`);
    return updatedList;
  } catch (error) {
    console.error('[ShoppingListsService] update failed:', error);
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to update shopping list', error);
  }
}

/**
 * Delete a shopping list and all associated items (cascade)
 * 
 * @param id - Shopping list UUID
 * @throws NotFoundError if list doesn't exist
 * @throws DatabaseError if delete fails
 */
export async function deleteList(id: string): Promise<void> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    // Check if list exists
    const existing = await getById(id);
    if (!existing) {
      throw new NotFoundError(
        `Shopping list not found: ${id}`,
        'ShoppingList',
        id
      );
    }

    // Delete from database (cascade will remove all items)
    await db.runAsync(
      'DELETE FROM shopping_lists WHERE id = ?',
      [id]
    );

    console.log(`[ShoppingListsService] Deleted list: ${id}`);
  } catch (error) {
    console.error('[ShoppingListsService] delete failed:', error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to delete shopping list', error);
  }
}

/**
 * Count total number of shopping lists
 * 
 * @returns Promise resolving to count
 * @throws DatabaseError if query fails
 */
export async function count(): Promise<number> {
  try {
    const db = getDatabase();
    if (!db) {
      throw new DatabaseError('Database not initialized');
    }

    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM shopping_lists'
    );

    const total = result?.count ?? 0;
    console.log(`[ShoppingListsService] Total lists: ${total}`);
    return total;
  } catch (error) {
    console.error('[ShoppingListsService] count failed:', error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to count shopping lists', error);
  }
}
