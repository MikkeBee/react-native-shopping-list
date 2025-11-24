/**
 * useShoppingItems Hook
 * 
 * Manages shopping items state for a specific list with reactive updates.
 * Provides CRUD operations with loading states and error handling.
 */

import * as ShoppingItemsService from '@/services/shopping-items.service';
import { CreateShoppingItemDto, ShoppingItem, UpdateShoppingItemDto } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseShoppingItemsResult {
  /** Array of shopping items for the list */
  items: ShoppingItem[];
  
  /** Whether data is currently loading */
  isLoading: boolean;
  
  /** Error that occurred during operations */
  error: Error | null;
  
  /** Create a new shopping item */
  createItem: (dto: CreateShoppingItemDto) => Promise<ShoppingItem>;
  
  /** Update a shopping item */
  updateItem: (id: string, dto: UpdateShoppingItemDto) => Promise<ShoppingItem>;
  
  /** Copy (duplicate) a shopping item */
  copyItem: (id: string) => Promise<ShoppingItem>;
  
  /** Toggle completion status of a shopping item */
  toggleComplete: (id: string) => Promise<ShoppingItem>;
  
  /** Delete a shopping item */
  deleteItem: (id: string) => Promise<void>;
  
  /** Refresh the items */
  refresh: () => Promise<void>;
  
  /** Total count of items */
  count: number;
}

/**
 * Hook for managing shopping items for a specific list
 * 
 * @param listId - Shopping list UUID
 * @returns Shopping items state and operations
 */
export function useShoppingItems(listId: string): UseShoppingItemsResult {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all items for the list from database
   */
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedItems = await ShoppingItemsService.getByListId(listId);
      setItems(fetchedItems);
      
      console.log('[useShoppingItems] Fetched items:', fetchedItems.length, 'for list', listId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch items');
      setError(error);
      console.error('[useShoppingItems] Fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  /**
   * Create a new shopping item with optimistic update
   */
  const createItem = useCallback(async (dto: CreateShoppingItemDto): Promise<ShoppingItem> => {
    try {
      setError(null);
      
      // Create in database
      const newItem = await ShoppingItemsService.create(dto);
      
      // Optimistic update: Add to local state immediately
      setItems(prevItems => [...prevItems, newItem]);
      
      console.log('[useShoppingItems] Created item:', newItem.id);
      return newItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create item');
      setError(error);
      console.error('[useShoppingItems] Create failed:', error);
      throw error;
    }
  }, []);

  /**
   * Update a shopping item with optimistic update
   */
  const updateItem = useCallback(async (id: string, dto: UpdateShoppingItemDto): Promise<ShoppingItem> => {
    try {
      setError(null);
      
      // Store previous state for rollback
      const previousItems = items;
      
      // Optimistic update: Update in local state immediately
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, text: dto.text, updatedAt: Date.now() }
            : item
        )
      );
      
      try {
        // Update in database
        const updatedItem = await ShoppingItemsService.update(id, dto);
        
        // Sync with database result
        setItems(prevItems =>
          prevItems.map(item => item.id === id ? updatedItem : item)
        );
        
        console.log('[useShoppingItems] Updated item:', id);
        return updatedItem;
      } catch (err) {
        // Rollback on error
        setItems(previousItems);
        throw err;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update item');
      setError(error);
      console.error('[useShoppingItems] Update failed:', error);
      throw error;
    }
  }, [items]);

  /**
   * Copy (duplicate) a shopping item with optimistic update
   */
  const copyItem = useCallback(async (id: string): Promise<ShoppingItem> => {
    try {
      setError(null);
      
      // Copy in database
      const copiedItem = await ShoppingItemsService.copy(id);
      
      // Optimistic update: Add to local state immediately after source item
      setItems(prevItems => {
        const sourceIndex = prevItems.findIndex(item => item.id === id);
        if (sourceIndex === -1) return [...prevItems, copiedItem];
        
        const newItems = [...prevItems];
        newItems.splice(sourceIndex + 1, 0, copiedItem);
        return newItems;
      });
      
      console.log('[useShoppingItems] Copied item:', id, '→', copiedItem.id);
      return copiedItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy item');
      setError(error);
      console.error('[useShoppingItems] Copy failed:', error);
      throw error;
    }
  }, []);

  /**
   * Toggle completion status of a shopping item with optimistic update
   */
  const toggleComplete = useCallback(async (id: string): Promise<ShoppingItem> => {
    try {
      setError(null);
      
      // Store previous state for rollback
      const previousItems = items;
      
      // Optimistic update: Toggle in local state immediately
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, completed: !item.completed, updatedAt: Date.now() }
            : item
        )
      );
      
      try {
        // Toggle in database
        const updatedItem = await ShoppingItemsService.toggleComplete(id);
        
        // Sync with database result
        setItems(prevItems =>
          prevItems.map(item => item.id === id ? updatedItem : item)
        );
        
        console.log('[useShoppingItems] Toggled completion:', id);
        return updatedItem;
      } catch (err) {
        // Rollback on error
        setItems(previousItems);
        throw err;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle completion');
      setError(error);
      console.error('[useShoppingItems] Toggle completion failed:', error);
      throw error;
    }
  }, [items]);

  /**
   * Delete a shopping item with optimistic update
   */
  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update: Remove from local state immediately
      const previousItems = items;
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      try {
        // Delete from database
        await ShoppingItemsService.deleteItem(id);
        console.log('[useShoppingItems] Deleted item:', id);
      } catch (err) {
        // Rollback on error
        setItems(previousItems);
        throw err;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete item');
      setError(error);
      console.error('[useShoppingItems] Delete failed:', error);
      throw error;
    }
  }, [items]);

  /**
   * Refresh items from database
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchItems();
  }, [fetchItems]);

  // Initial fetch on mount or when listId changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    copyItem,
    toggleComplete,
    deleteItem,
    refresh,
    count: items.length,
  };
}
