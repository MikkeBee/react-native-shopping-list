# Quickstart Guide: Shopping Lists Manager

**Feature**: Shopping Lists Manager  
**Branch**: `001-shopping-lists`  
**Date**: 2025-11-10

## Overview

This guide helps developers quickly set up, understand, and start working on the Shopping Lists Manager feature. It covers environment setup, architecture overview, development workflow, and common tasks.

---

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Expo CLI**: Installed globally (`npm install -g expo-cli`)
- **iOS Simulator** (macOS only) or **Android Emulator**
- **Git**: For version control

### Optional but Recommended

- **VS Code** with extensions:
  - ES Lint
  - TypeScript
  - React Native Tools
  - Expo Tools

---

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Navigate to project root
cd speckit-rnative-app

# Install all dependencies
npm install

# Install new dependencies for this feature
npx expo install expo-sqlite
```

### 2. Start Development Server

```bash
# Start Expo development server
npx expo start

# Or use npm script
npm start
```

### 3. Run on Device/Simulator

**iOS (macOS only)**:
```bash
npx expo start --ios
# OR press 'i' in the Expo dev tools
```

**Android**:
```bash
npx expo start --android
# OR press 'a' in the Expo dev tools
```

**Web** (not primary target but works):
```bash
npx expo start --web
```

---

## Project Structure

```
speckit-rnative-app/
├── app/                          # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx             # Lists overview screen (modified)
│   │   └── explore.tsx           # (existing screen)
│   ├── lists/
│   │   └── [id].tsx              # List detail screen (NEW)
│   ├── _layout.tsx               # Root layout
│   └── modal.tsx                 # Shared modal
├── components/
│   ├── shopping/                 # Feature components (NEW)
│   │   ├── list-card.tsx
│   │   ├── list-item.tsx
│   │   ├── list-header.tsx
│   │   ├── empty-state.tsx
│   │   └── item-actions.tsx
│   └── ui/                       # Shared UI components
├── services/                     # Business logic (NEW)
│   ├── database/
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── connection.ts
│   ├── shopping-lists.service.ts
│   └── shopping-items.service.ts
├── types/                        # TypeScript definitions (NEW)
│   ├── shopping-list.ts
│   └── shopping-item.ts
├── hooks/                        # Custom React hooks (NEW)
│   ├── use-shopping-lists.ts
│   └── use-shopping-items.ts
├── constants/
│   ├── theme.ts                  # (existing)
│   └── database.ts               # (NEW)
└── __tests__/                    # Tests (NEW)
    ├── services/
    ├── hooks/
    └── components/
```

---

## Architecture Overview

### Layer Responsibilities

```
┌─────────────────────────────────────┐
│   UI Layer (React Components)      │  ← User interactions
├─────────────────────────────────────┤
│   Hooks Layer (State Management)   │  ← React state + data fetching
├─────────────────────────────────────┤
│   Service Layer (Business Logic)   │  ← CRUD operations + validation
├─────────────────────────────────────┤
│   Database Layer (SQLite)          │  ← Data persistence
└─────────────────────────────────────┘
```

### Data Flow

**Read Flow**:
```
Component → Hook → Service → Database → Service → Hook → Component
```

**Write Flow**:
```
Component → Hook → Service (validate) → Database → Service → Hook → Component (update)
```

### Key Patterns

1. **Services are stateless**: Pure functions that interact with database
2. **Hooks manage state**: React state + useEffect for data fetching
3. **Components are presentational**: Minimal logic, focus on UI
4. **Types everywhere**: TypeScript strict mode enforced

---

## Development Workflow

### 1. Start with Types

Always define TypeScript interfaces first:

```typescript
// types/shopping-list.ts
export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}
```

### 2. Implement Service Layer

Create service with full error handling:

```typescript
// services/shopping-lists.service.ts
export const shoppingListsService = {
  async getAll(): Promise<ShoppingList[]> {
    try {
      const db = await getDatabaseConnection();
      const result = await db.query<ShoppingList>(
        'SELECT * FROM shopping_lists ORDER BY created_at DESC'
      );
      return result;
    } catch (error) {
      console.error('Error fetching lists:', error);
      throw new DatabaseError('Failed to fetch lists', 'FETCH_ERROR', error);
    }
  }
};
```

### 3. Create Custom Hook

Wrap service in React hook:

```typescript
// hooks/use-shopping-lists.ts
export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const data = await shoppingListsService.getAll();
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { lists, loading, error, refresh: loadLists };
}
```

### 4. Build UI Component

Use hook in component:

```typescript
// components/shopping/list-card.tsx
export function ListCard({ list, onPress }: ListCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(list.id);
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView>
        <ThemedText>{list.name}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}
```

### 5. Write Tests

Test each layer independently:

```typescript
// __tests__/services/shopping-lists.test.ts
describe('ShoppingListsService', () => {
  it('should create a new list', async () => {
    const list = await shoppingListsService.create({ name: 'Test' });
    expect(list.name).toBe('Test');
    expect(list.id).toBeDefined();
  });
});
```

---

## Common Development Tasks

### Add a New Screen

```bash
# Create new route in app directory
touch app/lists/[id].tsx
```

```typescript
// app/lists/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items } = useShoppingItems(id);

  return (
    <View>
      <FlatList data={items} renderItem={...} />
    </View>
  );
}
```

### Add a New Component

```bash
# Create component file
touch components/shopping/my-component.tsx
```

```typescript
// components/shopping/my-component.tsx
import { ThemedView } from '@/components/themed-view';

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <ThemedView>
      {/* Component content */}
    </ThemedView>
  );
}
```

### Add Database Migration

```typescript
// services/database/migrations.ts
const migration002: Migration = {
  version: 2,
  async up(db) {
    await db.execute('ALTER TABLE shopping_items ADD COLUMN notes TEXT');
  },
  async down(db) {
    // SQLite doesn't support DROP COLUMN, would need recreation
  }
};

export const migrations = [migration001, migration002];
```

### Add a Service Method

```typescript
// services/shopping-lists.service.ts
async search(query: string): Promise<ShoppingList[]> {
  const db = await getDatabaseConnection();
  return db.query<ShoppingList>(
    'SELECT * FROM shopping_lists WHERE name LIKE ? ORDER BY created_at DESC',
    [`%${query}%`]
  );
}
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- shopping-lists.test.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Test Coverage

```bash
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test light mode
- [ ] Test dark mode
- [ ] Test with empty state (no lists)
- [ ] Test with 100+ items in a list
- [ ] Test offline (already offline-only)
- [ ] Test VoiceOver (iOS)
- [ ] Test TalkBack (Android)

---

## Debugging

### View Database Contents

```typescript
// Temporary debugging code
import * as SQLite from 'expo-sqlite';

async function debugDatabase() {
  const db = await SQLite.openDatabaseAsync('shopping.db');
  const lists = await db.getAllAsync('SELECT * FROM shopping_lists');
  console.log('All lists:', lists);
}
```

### View React Component Tree

Use React DevTools:
```bash
npx react-devtools
```

### View Performance

Enable performance monitoring:
```typescript
// In app/_layout.tsx
if (__DEV__) {
  require('react-devtools');
}
```

### Debug SQLite Queries

Add logging to service layer:
```typescript
async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  console.log('[SQL]', sql, params);
  const result = await this.db.getAllAsync(sql, params);
  console.log('[RESULT]', result.length, 'rows');
  return result as T[];
}
```

---

## Performance Optimization

### FlatList Optimization

```typescript
<FlatList
  data={items}
  // Critical for performance
  getItemLayout={(data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  })}
  // Reduce memory usage
  windowSize={10}
  maxToRenderPerBatch={10}
  // Improve scrolling
  removeClippedSubviews={true}
  // Unique keys
  keyExtractor={(item) => item.id}
/>
```

### Memoization

```typescript
// Expensive calculations
const sortedLists = useMemo(() => {
  return lists.sort((a, b) => b.createdAt - a.createdAt);
}, [lists]);

// Callbacks
const handlePress = useCallback((id: string) => {
  router.push(`/lists/${id}`);
}, []);
```

### Database Query Optimization

```typescript
// Use indexes
'SELECT * FROM shopping_items WHERE list_id = ? ORDER BY created_at DESC'
// ✅ Uses idx_items_list index

// Limit results
'SELECT * FROM shopping_lists ORDER BY created_at DESC LIMIT 50'
```

---

## Troubleshooting

### Database Not Found

**Problem**: `Error: Database not found`

**Solution**:
```typescript
// Ensure database is initialized before queries
await databaseService.initialize();
```

### TypeScript Errors

**Problem**: `Property 'X' does not exist on type 'Y'`

**Solution**: Check type definitions in `types/` directory, ensure interfaces match

### Expo Build Errors

**Problem**: Build fails with native module error

**Solution**:
```bash
# Clear cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Slow Performance

**Problem**: List scrolling is laggy

**Solution**:
- Check FlatList optimization props
- Verify `getItemLayout` is implemented
- Reduce `windowSize` if memory is constrained
- Profile with React DevTools

---

## Code Style Guidelines

### Component Structure

```typescript
// 1. Imports
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

// 2. Types
interface ComponentProps {
  title: string;
}

// 3. Component
export function Component({ title }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState();
  
  // 3b. Effects
  useEffect(() => {}, []);
  
  // 3c. Handlers
  const handlePress = () => {};
  
  // 3d. Render
  return <View>{/* JSX */}</View>;
}

// 4. Styles (if needed)
const styles = StyleSheet.create({});
```

### Naming Conventions

- **Components**: PascalCase (`ListCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useShoppingLists.ts`)
- **Services**: camelCase with `.service.ts` suffix
- **Types**: PascalCase interfaces (`ShoppingList`)
- **Constants**: UPPER_SNAKE_CASE

### Commit Messages

```
feat: add shopping list creation screen
fix: resolve item deletion bug
test: add tests for shopping lists service
refactor: extract list card component
docs: update quickstart guide
```

---

## Resources

### Documentation

- **Expo**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **Expo SQLite**: https://docs.expo.dev/versions/latest/sdk/sqlite/
- **TypeScript**: https://www.typescriptlang.org/docs/

### Related Files

- **Feature Spec**: `specs/001-shopping-lists/spec.md`
- **Implementation Plan**: `specs/001-shopping-lists/plan.md`
- **Data Model**: `specs/001-shopping-lists/data-model.md`
- **Contracts**: `specs/001-shopping-lists/contracts/service-contracts.md`
- **Constitution**: `.specify/memory/constitution.md`

### Getting Help

1. Check existing documentation in `specs/001-shopping-lists/`
2. Review constitution for architectural decisions
3. Consult Expo/React Native docs for API questions
4. Ask team members in code reviews

---

## Next Steps

1. Review the [Feature Spec](./spec.md) to understand requirements
2. Review the [Data Model](./data-model.md) to understand entities
3. Review the [Service Contracts](./contracts/service-contracts.md) for API
4. Start implementing Phase 1 (P1) user story: Create and Name Lists
5. Follow TDD: Write tests → See them fail → Implement → Pass

**Ready to start?** Run `npm start` and begin building! 🚀
