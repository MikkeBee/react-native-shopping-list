/**
 * useDatabase Hook
 * 
 * Manages database initialization on app startup.
 * Returns database ready state and any initialization errors.
 */

import { initializeDatabase } from '@/services/database.service';
import { useEffect, useState } from 'react';

interface UseDatabaseResult {
  /** Whether the database has been initialized successfully */
  isReady: boolean;
  
  /** Error that occurred during initialization, if any */
  error: Error | null;
  
  /** Whether initialization is currently in progress */
  isInitializing: boolean;
}

/**
 * Initialize the database on app startup
 * 
 * @returns Database initialization state
 */
export function useDatabase(): UseDatabaseResult {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        setIsInitializing(true);
        setError(null);
        
        await initializeDatabase();
        
        if (isMounted) {
          setIsReady(true);
          setIsInitializing(false);
          console.log('[useDatabase] Database ready');
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Unknown database error');
          setError(error);
          setIsReady(false);
          setIsInitializing(false);
          console.error('[useDatabase] Database initialization failed:', error);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isReady,
    error,
    isInitializing,
  };
}
