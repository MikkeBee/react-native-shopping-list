/**
 * useShoppingLists Hook
 * 
 * Manages shopping lists state with reactive updates.
 * Provides CRUD operations with loading states and error handling.
 */

import * as ShoppingListsService from '@/services/shopping-lists.service';
import { CreateShoppingListDto, ShoppingList } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseShoppingListsResult {
  /** Array of shopping lists */
  lists: ShoppingList[];
  
  /** Whether data is currently loading */
  isLoading: boolean;
  
  /** Error that occurred during operations */
  error: Error | null;
  
  /** Create a new shopping list */
  createList: (dto: CreateShoppingListDto) => Promise<ShoppingList>;
  
  /** Delete a shopping list */
  deleteList: (id: string) => Promise<void>;
  
  /** Refresh the lists */
  refresh: () => Promise<void>;
  
  /** Total count of lists */
  count: number;
}

/**
 * Hook for managing shopping lists
 * 
 * @returns Shopping lists state and operations
 */
export function useShoppingLists(): UseShoppingListsResult {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all lists from database
   */
  const fetchLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedLists = await ShoppingListsService.getAll();
      setLists(fetchedLists);
      
      console.log('[useShoppingLists] Fetched lists:', fetchedLists.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch lists');
      setError(error);
      console.error('[useShoppingLists] Fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new shopping list with optimistic update
   */
  const createList = useCallback(async (dto: CreateShoppingListDto): Promise<ShoppingList> => {
    try {
      setError(null);
      
      // Create in database
      const newList = await ShoppingListsService.create(dto);
      
      // Optimistic update: Add to local state immediately
      setLists(prevLists => [newList, ...prevLists]);
      
      console.log('[useShoppingLists] Created list:', newList.id);
      return newList;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create list');
      setError(error);
      console.error('[useShoppingLists] Create failed:', error);
      throw error;
    }
  }, []);

  /**
   * Delete a shopping list with optimistic update
   */
  const deleteList = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update: Remove from local state immediately
      const previousLists = lists;
      setLists(prevLists => prevLists.filter(list => list.id !== id));
      
      try {
        // Delete from database
        await ShoppingListsService.deleteList(id);
        console.log('[useShoppingLists] Deleted list:', id);
      } catch (err) {
        // Rollback on error
        setLists(previousLists);
        throw err;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete list');
      setError(error);
      console.error('[useShoppingLists] Delete failed:', error);
      throw error;
    }
  }, [lists]);

  /**
   * Refresh lists from database
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchLists();
  }, [fetchLists]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    isLoading,
    error,
    createList,
    deleteList,
    refresh,
    count: lists.length,
  };
}
