# Data Model: Shopping Lists Manager

**Feature**: Shopping Lists Manager  
**Date**: 2025-11-10  
**Phase**: 1 - Design

## Overview

The shopping lists application uses a simple normalized relational data model with two primary entities: Shopping Lists and Shopping Items. All data is stored locally in SQLite with no remote synchronization.

---

## Entity: ShoppingList

**Description**: Represents a named collection of shopping items. Users can create multiple lists to organize different shopping contexts (e.g., "Weekly Groceries", "Hardware Store").

### TypeScript Interface

```typescript
interface ShoppingList {
  id: string;              // UUID v4 primary key
  name: string;            // User-defined list name
  createdAt: number;       // Unix timestamp (milliseconds)
  updatedAt: number;       // Unix timestamp (milliseconds)
}
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY, NOT NULL | Unique identifier (UUID v4 format) |
| `name` | string | NOT NULL, 1-100 chars | User-defined list name |
| `createdAt` | number | NOT NULL | Creation timestamp (Unix epoch in ms) |
| `updatedAt` | number | NOT NULL | Last modification timestamp (Unix epoch in ms) |

### Validation Rules

- **name**:
  - MUST NOT be empty string
  - MUST be between 1 and 100 characters
  - Trim whitespace before validation
  - If empty after trim, provide default name "Shopping List"
  
- **id**:
  - MUST be valid UUID v4 format
  - Generated automatically on creation
  
- **timestamps**:
  - createdAt set once on creation
  - updatedAt updated on any modification
  - Both stored as `Date.now()` in milliseconds

### Relationships

- **One-to-Many** with ShoppingItem: One list can contain many items
- **Cascade Delete**: When a list is deleted, all associated items are automatically deleted

### Indexes

```sql
CREATE INDEX idx_lists_created ON shopping_lists(created_at DESC);
```

**Purpose**: Optimize retrieval of lists sorted by creation date (newest first)

### State Transitions

```
[New List] 
    ↓ (user creates with name)
[Active List]
    ↓ (user updates name)
[Active List] (updatedAt changes)
    ↓ (user deletes)
[Deleted] (cascade deletes all items)
```

---

## Entity: ShoppingItem

**Description**: Represents an individual item within a shopping list. Items belong to exactly one list and support edit, copy, and delete operations.

### TypeScript Interface

```typescript
interface ShoppingItem {
  id: string;              // UUID v4 primary key
  listId: string;          // Foreign key to ShoppingList
  text: string;            // Item description/name
  createdAt: number;       // Unix timestamp (milliseconds)
  updatedAt: number;       // Unix timestamp (milliseconds)
}
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY, NOT NULL | Unique identifier (UUID v4 format) |
| `listId` | string | FOREIGN KEY, NOT NULL | Reference to parent ShoppingList.id |
| `text` | string | NOT NULL, 1-500 chars | Item description or name |
| `createdAt` | number | NOT NULL | Creation timestamp (Unix epoch in ms) |
| `updatedAt` | number | NOT NULL | Last modification timestamp (Unix epoch in ms) |

### Validation Rules

- **text**:
  - MUST NOT be empty string
  - MUST be between 1 and 500 characters
  - Trim whitespace before validation
  - Prevent empty items (show validation error)
  
- **listId**:
  - MUST reference an existing ShoppingList.id
  - Foreign key constraint enforced at database level
  
- **id**:
  - MUST be valid UUID v4 format
  - Generated automatically on creation
  
- **timestamps**:
  - createdAt set once on creation
  - updatedAt updated on edit operations
  - Copy operation creates new item with new createdAt

### Relationships

- **Many-to-One** with ShoppingList: Many items belong to one list
- **Orphan Prevention**: Cannot create item without valid listId

### Indexes

```sql
CREATE INDEX idx_items_list ON shopping_items(list_id, created_at DESC);
```

**Purpose**: Optimize retrieval of items for a specific list, sorted by creation date

### State Transitions

```
[New Item]
    ↓ (user adds to list)
[Active Item]
    ↓ (user edits text)
[Active Item] (updatedAt changes)
    ↓ (user copies)
[New Item] (duplicate with new id, same text)
    ↓ (user deletes)
[Deleted] (removed from database)
```

---

## Database Schema (SQLite)

### shopping_lists Table

```sql
CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lists_created 
  ON shopping_lists(created_at DESC);
```

### shopping_items Table

```sql
CREATE TABLE IF NOT EXISTS shopping_items (
  id TEXT PRIMARY KEY NOT NULL,
  list_id TEXT NOT NULL,
  text TEXT NOT NULL CHECK(length(text) >= 1 AND length(text) <= 500),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (list_id) 
    REFERENCES shopping_lists(id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_list 
  ON shopping_items(list_id, created_at DESC);
```

### Migration Strategy

**Initial Migration (v1)**:
- Create both tables
- Create indexes
- No seed data required

**Future Migrations**:
- Version number stored in separate `schema_version` table
- Migrations run sequentially on app startup
- ALTER TABLE for schema changes
- Data migration scripts for existing records

---

## Data Access Patterns

### Common Queries

**1. Get All Lists (sorted by creation date)**
```sql
SELECT * FROM shopping_lists 
ORDER BY created_at DESC;
```

**2. Get List by ID**
```sql
SELECT * FROM shopping_lists 
WHERE id = ?;
```

**3. Get Items for List (sorted by creation date)**
```sql
SELECT * FROM shopping_items 
WHERE list_id = ? 
ORDER BY created_at DESC;
```

**4. Create List**
```sql
INSERT INTO shopping_lists (id, name, created_at, updated_at) 
VALUES (?, ?, ?, ?);
```

**5. Create Item**
```sql
INSERT INTO shopping_items (id, list_id, text, created_at, updated_at) 
VALUES (?, ?, ?, ?, ?);
```

**6. Update List Name**
```sql
UPDATE shopping_lists 
SET name = ?, updated_at = ? 
WHERE id = ?;
```

**7. Update Item Text**
```sql
UPDATE shopping_items 
SET text = ?, updated_at = ? 
WHERE id = ?;
```

**8. Copy Item (create duplicate)**
```sql
INSERT INTO shopping_items (id, list_id, text, created_at, updated_at)
SELECT ?, list_id, text, ?, ?
FROM shopping_items
WHERE id = ?;
```

**9. Delete List (cascade deletes items)**
```sql
DELETE FROM shopping_lists 
WHERE id = ?;
```

**10. Delete Item**
```sql
DELETE FROM shopping_items 
WHERE id = ?;
```

### Performance Characteristics

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Get all lists | <50ms | Indexed by created_at |
| Get items for list | <50ms | Indexed by list_id + created_at |
| Create list/item | <20ms | Single INSERT |
| Update list/item | <20ms | Single UPDATE with WHERE |
| Delete list | <100ms | CASCADE deletes items |
| Delete item | <20ms | Single DELETE |

**Assumptions**:
- Up to 20 lists
- Up to 100 items per list
- Total ~2000 items maximum

---

## Data Integrity Rules

### Referential Integrity

1. **Foreign Key Constraint**: listId in shopping_items MUST reference valid shopping_lists.id
2. **Cascade Delete**: Deleting a list automatically deletes all associated items
3. **No Orphans**: Cannot create item without valid parent list

### Business Rules

1. **Unique IDs**: All IDs are UUID v4, globally unique
2. **Non-Empty Names**: Lists and items cannot have empty text after trimming
3. **Timestamp Consistency**: updatedAt >= createdAt always true
4. **List Ownership**: Items belong to exactly one list (no sharing)

### Constraint Enforcement

- **Database Level**: CHECK constraints for text length, FOREIGN KEY for relationships
- **Application Level**: TypeScript validation before database operations
- **UI Level**: Form validation prevents invalid input

---

## Data Migration & Versioning

### Schema Version Tracking

```sql
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at INTEGER NOT NULL
);

INSERT INTO schema_version (version, applied_at) 
VALUES (1, ?);
```

### Migration Process

1. Check current schema version on app startup
2. Run pending migrations sequentially
3. Update schema_version table after each migration
4. Rollback on failure (transaction-based)

### Example Future Migration (v2)

**Scenario**: Add optional notes field to items

```sql
-- Migration v2
ALTER TABLE shopping_items 
ADD COLUMN notes TEXT DEFAULT NULL;

UPDATE schema_version 
SET version = 2, applied_at = ?;
```

---

## Type Definitions (TypeScript)

### Core Types

```typescript
// types/shopping-list.ts
export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateShoppingListDto {
  name: string;
}

export interface UpdateShoppingListDto {
  name: string;
}

// types/shopping-item.ts
export interface ShoppingItem {
  id: string;
  listId: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateShoppingItemDto {
  listId: string;
  text: string;
}

export interface UpdateShoppingItemDto {
  text: string;
}
```

### Service Response Types

```typescript
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface DatabaseError {
  code: string;
  message: string;
  originalError?: unknown;
}
```

---

## Summary

**Total Entities**: 2 (ShoppingList, ShoppingItem)  
**Total Tables**: 3 (shopping_lists, shopping_items, schema_version)  
**Total Indexes**: 2 (creation date optimizations)  
**Relationships**: 1 one-to-many with cascade delete  
**Constraints**: Foreign keys, CHECK constraints, NOT NULL  
**Storage**: Local SQLite (offline-first, no sync)
