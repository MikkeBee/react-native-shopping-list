# Service Contracts: Shopping Lists Manager

**Feature**: Shopping Lists Manager  
**Date**: 2025-11-10  
**Phase**: 1 - Design

## Overview

This document defines the contracts (interfaces) for the service layer that handles all database operations. Since this is a local-only application with no REST API, these contracts represent TypeScript service interfaces rather than HTTP endpoints.

---

## ShoppingListsService Contract

**Responsibility**: Manage CRUD operations for shopping lists

### Interface Definition

```typescript
interface ShoppingListsService {
  /**
   * Retrieve all shopping lists ordered by creation date (newest first)
   * @returns Promise resolving to array of shopping lists
   * @throws DatabaseError if query fails
   */
  getAll(): Promise<ShoppingList[]>;

  /**
   * Retrieve a single shopping list by ID
   * @param id - Shopping list UUID
   * @returns Promise resolving to shopping list or null if not found
   * @throws DatabaseError if query fails
   */
  getById(id: string): Promise<ShoppingList | null>;

  /**
   * Create a new shopping list
   * @param dto - Shopping list creation data
   * @returns Promise resolving to created shopping list
   * @throws ValidationError if name is invalid
   * @throws DatabaseError if insert fails
   */
  create(dto: CreateShoppingListDto): Promise<ShoppingList>;

  /**
   * Update an existing shopping list's name
   * @param id - Shopping list UUID
   * @param dto - Shopping list update data
   * @returns Promise resolving to updated shopping list
   * @throws ValidationError if name is invalid
   * @throws NotFoundError if list doesn't exist
   * @throws DatabaseError if update fails
   */
  update(id: string, dto: UpdateShoppingListDto): Promise<ShoppingList>;

  /**
   * Delete a shopping list and all associated items (cascade)
   * @param id - Shopping list UUID
   * @returns Promise resolving to void
   * @throws NotFoundError if list doesn't exist
   * @throws DatabaseError if delete fails
   */
  delete(id: string): Promise<void>;

  /**
   * Count total number of shopping lists
   * @returns Promise resolving to count
   * @throws DatabaseError if query fails
   */
  count(): Promise<number>;
}
```

### Input DTOs

```typescript
interface CreateShoppingListDto {
  name: string;  // 1-100 characters, trimmed
}

interface UpdateShoppingListDto {
  name: string;  // 1-100 characters, trimmed
}
```

### Validation Rules

**CreateShoppingListDto**:
- `name`: Required, 1-100 characters after trimming whitespace
- If empty after trim, use default "Shopping List"

**UpdateShoppingListDto**:
- `name`: Required, 1-100 characters after trimming whitespace
- Cannot be empty string

### Error Conditions

| Error Type | Condition | HTTP Equivalent |
|------------|-----------|-----------------|
| `ValidationError` | Invalid input (empty name, too long) | 400 Bad Request |
| `NotFoundError` | List ID doesn't exist | 404 Not Found |
| `DatabaseError` | SQLite operation failed | 500 Internal Error |

### Example Usage

```typescript
// Create a shopping list
const newList = await shoppingListsService.create({ 
  name: 'Weekly Groceries' 
});

// Get all lists
const lists = await shoppingListsService.getAll();

// Update list name
const updated = await shoppingListsService.update(
  '123e4567-e89b-12d3-a456-426614174000',
  { name: 'Monthly Groceries' }
);

// Delete list
await shoppingListsService.delete('123e4567-e89b-12d3-a456-426614174000');
```

---

## ShoppingItemsService Contract

**Responsibility**: Manage CRUD operations for shopping items

### Interface Definition

```typescript
interface ShoppingItemsService {
  /**
   * Retrieve all items for a specific shopping list
   * @param listId - Shopping list UUID
   * @returns Promise resolving to array of items ordered by creation date
   * @throws DatabaseError if query fails
   */
  getByListId(listId: string): Promise<ShoppingItem[]>;

  /**
   * Retrieve a single shopping item by ID
   * @param id - Shopping item UUID
   * @returns Promise resolving to shopping item or null if not found
   * @throws DatabaseError if query fails
   */
  getById(id: string): Promise<ShoppingItem | null>;

  /**
   * Create a new shopping item
   * @param dto - Shopping item creation data
   * @returns Promise resolving to created shopping item
   * @throws ValidationError if text is invalid or listId invalid
   * @throws NotFoundError if parent list doesn't exist
   * @throws DatabaseError if insert fails
   */
  create(dto: CreateShoppingItemDto): Promise<ShoppingItem>;

  /**
   * Update an existing shopping item's text
   * @param id - Shopping item UUID
   * @param dto - Shopping item update data
   * @returns Promise resolving to updated shopping item
   * @throws ValidationError if text is invalid
   * @throws NotFoundError if item doesn't exist
   * @throws DatabaseError if update fails
   */
  update(id: string, dto: UpdateShoppingItemDto): Promise<ShoppingItem>;

  /**
   * Copy (duplicate) an existing shopping item
   * Creates a new item with the same text in the same list
   * @param id - Shopping item UUID to copy
   * @returns Promise resolving to newly created item
   * @throws NotFoundError if source item doesn't exist
   * @throws DatabaseError if insert fails
   */
  copy(id: string): Promise<ShoppingItem>;

  /**
   * Delete a shopping item
   * @param id - Shopping item UUID
   * @returns Promise resolving to void
   * @throws NotFoundError if item doesn't exist
   * @throws DatabaseError if delete fails
   */
  delete(id: string): Promise<void>;

  /**
   * Count total number of items in a specific list
   * @param listId - Shopping list UUID
   * @returns Promise resolving to count
   * @throws DatabaseError if query fails
   */
  countByListId(listId: string): Promise<number>;

  /**
   * Delete all items for a specific list
   * Usually called automatically via CASCADE, but provided for manual cleanup
   * @param listId - Shopping list UUID
   * @returns Promise resolving to number of items deleted
   * @throws DatabaseError if delete fails
   */
  deleteByListId(listId: string): Promise<number>;
}
```

### Input DTOs

```typescript
interface CreateShoppingItemDto {
  listId: string;  // Must reference existing shopping list
  text: string;    // 1-500 characters, trimmed
}

interface UpdateShoppingItemDto {
  text: string;    // 1-500 characters, trimmed
}
```

### Validation Rules

**CreateShoppingItemDto**:
- `listId`: Required, must be valid UUID and reference existing list
- `text`: Required, 1-500 characters after trimming whitespace
- Cannot create item with empty text

**UpdateShoppingItemDto**:
- `text`: Required, 1-500 characters after trimming whitespace
- Cannot update to empty string

### Error Conditions

| Error Type | Condition | HTTP Equivalent |
|------------|-----------|-----------------|
| `ValidationError` | Invalid input (empty text, too long, invalid listId) | 400 Bad Request |
| `NotFoundError` | Item or parent list doesn't exist | 404 Not Found |
| `DatabaseError` | SQLite operation failed | 500 Internal Error |

### Example Usage

```typescript
// Create an item
const newItem = await shoppingItemsService.create({
  listId: '123e4567-e89b-12d3-a456-426614174000',
  text: 'Milk'
});

// Get all items for a list
const items = await shoppingItemsService.getByListId(
  '123e4567-e89b-12d3-a456-426614174000'
);

// Update item text
const updated = await shoppingItemsService.update(
  'item-uuid',
  { text: 'Almond Milk' }
);

// Copy item
const duplicate = await shoppingItemsService.copy('item-uuid');

// Delete item
await shoppingItemsService.delete('item-uuid');
```

---

## DatabaseService Contract

**Responsibility**: Manage SQLite database connection, initialization, and migrations

### Interface Definition

```typescript
interface DatabaseService {
  /**
   * Initialize database connection and run migrations
   * Should be called once on app startup
   * @returns Promise resolving when database is ready
   * @throws DatabaseError if connection or migration fails
   */
  initialize(): Promise<void>;

  /**
   * Execute a raw SQL query (SELECT)
   * @param sql - SQL query string
   * @param params - Query parameters (prevents SQL injection)
   * @returns Promise resolving to query results
   * @throws DatabaseError if query fails
   */
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute a raw SQL command (INSERT, UPDATE, DELETE)
   * @param sql - SQL command string
   * @param params - Command parameters
   * @returns Promise resolving to execution result
   * @throws DatabaseError if command fails
   */
  execute(sql: string, params?: unknown[]): Promise<SQLiteExecuteResult>;

  /**
   * Execute multiple SQL commands in a transaction
   * Automatically rollback if any command fails
   * @param commands - Array of SQL commands with parameters
   * @returns Promise resolving when transaction completes
   * @throws DatabaseError if any command fails
   */
  transaction(commands: SQLCommand[]): Promise<void>;

  /**
   * Get current schema version
   * @returns Promise resolving to version number
   * @throws DatabaseError if query fails
   */
  getSchemaVersion(): Promise<number>;

  /**
   * Close database connection
   * Should be called on app shutdown (rarely needed in React Native)
   * @returns Promise resolving when connection is closed
   */
  close(): Promise<void>;
}

interface SQLCommand {
  sql: string;
  params?: unknown[];
}

interface SQLiteExecuteResult {
  insertId?: number;
  rowsAffected: number;
}
```

### Example Usage

```typescript
// Initialize on app startup
await databaseService.initialize();

// Execute query
const lists = await databaseService.query<ShoppingList>(
  'SELECT * FROM shopping_lists ORDER BY created_at DESC'
);

// Execute command
await databaseService.execute(
  'INSERT INTO shopping_lists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
  [id, name, now, now]
);

// Transaction
await databaseService.transaction([
  { sql: 'DELETE FROM shopping_items WHERE list_id = ?', params: [listId] },
  { sql: 'DELETE FROM shopping_lists WHERE id = ?', params: [listId] }
]);
```

---

## Error Handling Contract

### Custom Error Types

```typescript
class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(
    public entityType: 'ShoppingList' | 'ShoppingItem',
    public id: string
  ) {
    super(`${entityType} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

### Error Handling Pattern

```typescript
try {
  const list = await shoppingListsService.create({ name: 'Test' });
} catch (error) {
  if (error instanceof ValidationError) {
    // Show user-friendly validation message
    showToast(`Invalid ${error.field}: ${error.message}`);
  } else if (error instanceof NotFoundError) {
    // Handle missing entity
    showToast('List not found');
  } else if (error instanceof DatabaseError) {
    // Log for debugging, show generic error to user
    console.error('Database error:', error.originalError);
    showToast('Unable to save changes. Please try again.');
  } else {
    // Unknown error
    console.error('Unexpected error:', error);
    showToast('An unexpected error occurred');
  }
}
```

---

## Service Implementation Requirements

### All Services Must:

1. **Validate Input**: Check DTOs before database operations
2. **Use Transactions**: For multi-step operations (delete list + items)
3. **Log Errors**: Console.error for debugging with sanitized messages
4. **Return Typed Results**: All operations return strongly-typed promises
5. **Handle Timestamps**: Auto-generate createdAt/updatedAt timestamps
6. **Generate IDs**: Auto-generate UUIDs for new entities
7. **Sanitize Input**: Trim whitespace, validate lengths
8. **Throw Typed Errors**: Use custom error classes for better handling

### Performance Requirements

| Operation | Max Latency | Notes |
|-----------|-------------|-------|
| `getAll()` | <50ms | Indexed query |
| `getById()` | <20ms | Primary key lookup |
| `create()` | <30ms | Single INSERT with validation |
| `update()` | <30ms | Single UPDATE with validation |
| `delete()` | <100ms | CASCADE delete may affect multiple items |
| `copy()` | <30ms | Single INSERT |

---

## Migration Contract

### Migration Interface

```typescript
interface Migration {
  version: number;
  up(db: DatabaseService): Promise<void>;
  down(db: DatabaseService): Promise<void>;
}
```

### Example Migration

```typescript
const migration001: Migration = {
  version: 1,
  
  async up(db: DatabaseService) {
    await db.transaction([
      {
        sql: `
          CREATE TABLE IF NOT EXISTS shopping_lists (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          )
        `
      },
      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_lists_created 
          ON shopping_lists(created_at DESC)
        `
      },
      {
        sql: `
          CREATE TABLE IF NOT EXISTS shopping_items (
            id TEXT PRIMARY KEY NOT NULL,
            list_id TEXT NOT NULL,
            text TEXT NOT NULL CHECK(length(text) >= 1 AND length(text) <= 500),
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
          )
        `
      },
      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_items_list 
          ON shopping_items(list_id, created_at DESC)
        `
      }
    ]);
  },
  
  async down(db: DatabaseService) {
    await db.transaction([
      { sql: 'DROP INDEX IF EXISTS idx_items_list' },
      { sql: 'DROP TABLE IF EXISTS shopping_items' },
      { sql: 'DROP INDEX IF EXISTS idx_lists_created' },
      { sql: 'DROP TABLE IF EXISTS shopping_lists' }
    ]);
  }
};
```

---

## Testing Contracts

### Mock Service Interfaces

```typescript
// For unit testing components without database
interface MockShoppingListsService extends ShoppingListsService {
  __mockData: ShoppingList[];
  __resetMocks(): void;
}

interface MockShoppingItemsService extends ShoppingItemsService {
  __mockData: ShoppingItem[];
  __resetMocks(): void;
}
```

### Test Helpers

```typescript
// Create test data factories
function createMockList(overrides?: Partial<ShoppingList>): ShoppingList {
  return {
    id: crypto.randomUUID(),
    name: 'Test List',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  };
}

function createMockItem(overrides?: Partial<ShoppingItem>): ShoppingItem {
  return {
    id: crypto.randomUUID(),
    listId: 'test-list-id',
    text: 'Test Item',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  };
}
```

---

## Summary

**Total Contracts**: 3 (ShoppingListsService, ShoppingItemsService, DatabaseService)  
**Total Operations**: 19 methods across all services  
**Error Types**: 3 (DatabaseError, ValidationError, NotFoundError)  
**Migration Contract**: Versioned up/down migrations  
**Testing Support**: Mock interfaces and data factories

All contracts are TypeScript interfaces with full type safety, detailed documentation, and error handling specifications.
