/**
 * Custom error types for the shopping lists application
 */

/**
 * DatabaseError
 * 
 * Thrown when a database operation fails (e.g., connection error, query failure).
 */
export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * ValidationError
 * 
 * Thrown when input validation fails (e.g., empty name, text too long).
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * NotFoundError
 * 
 * Thrown when a requested resource does not exist (e.g., list or item ID not found).
 */
export class NotFoundError extends Error {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}
