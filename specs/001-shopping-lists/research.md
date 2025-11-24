# Research: Shopping Lists Manager

**Feature**: Shopping Lists Manager  
**Date**: 2025-11-10  
**Phase**: 0 - Technical Research

## Research Goals

1. Evaluate SQLite integration options for React Native/Expo
2. Determine best practices for offline-first data architecture
3. Research React Native list optimization patterns for large datasets
4. Investigate platform-specific UI patterns for iOS and Android

---

## Decision 1: SQLite Library Selection

**Decision**: Use `expo-sqlite` (official Expo SQLite package)

**Rationale**:
- Official Expo package with guaranteed compatibility with Expo ~54.0
- Provides async/await API for modern JavaScript patterns
- Works on both iOS and Android without additional native configuration
- Actively maintained by Expo team with regular updates
- No ejection from Expo required
- Lightweight (~500KB) with minimal bundle impact

**Alternatives Considered**:
1. **react-native-sqlite-storage**: More features but requires manual native linking, conflicts with Expo managed workflow
2. **WatermelonDB**: Powerful ORM but heavy (~2MB), overkill for simple CRUD operations, violates minimal dependencies requirement
3. **AsyncStorage with JSON**: Not suitable for relational data, poor performance with large datasets, no query capabilities

**Implementation Approach**:
```bash
npx expo install expo-sqlite
```

**References**:
- https://docs.expo.dev/versions/latest/sdk/sqlite/
- Expo SDK 54 compatibility verified

---

## Decision 2: Data Architecture Pattern

**Decision**: Service Layer with Direct SQLite Access

**Rationale**:
- Keeps architecture simple - no complex ORM or abstraction layers
- Services encapsulate all database logic (schema, queries, transactions)
- React hooks provide clean interface between UI and services
- Aligns with "vanilla TypeScript" requirement - minimal abstractions
- Easy to test - services are pure functions with dependency injection
- Follows Single Responsibility Principle

**Alternatives Considered**:
1. **Repository Pattern**: Adds unnecessary abstraction layer for simple CRUD operations
2. **Redux + SQLite**: Over-engineered for local-only data, adds complexity and bundle size
3. **Direct component-level queries**: Violates separation of concerns, difficult to test

**Architecture Layers**:
```
UI Components (React)
      ↓
Custom Hooks (data fetching + state)
      ↓
Service Layer (business logic)
      ↓
SQLite Database (persistence)
```

**Key Principles**:
- Services handle all SQL queries and transactions
- Hooks manage state and provide reactive updates
- Components remain pure and presentation-focused
- Type safety enforced at every layer

---

## Decision 3: List Virtualization Strategy

**Decision**: Use React Native `FlatList` with `getItemLayout` optimization

**Rationale**:
- Built-in to React Native - no additional dependencies
- Excellent performance with proper configuration
- Supports 60fps scrolling for 100+ items
- Native implementation ensures smooth animations
- `getItemLayout` prop enables constant-time scroll calculations
- `windowSize` optimization reduces memory footprint

**Alternatives Considered**:
1. **react-native-virtualized-list**: Duplicate of FlatList functionality
2. **ScrollView**: No virtualization, would load all items causing memory issues
3. **FlashList (Shopify)**: Better performance but adds dependency (~1MB), overkill for 100-item lists

**Implementation Configuration**:
```typescript
<FlatList
  data={items}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  windowSize={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}
  keyExtractor={(item) => item.id}
/>
```

**Performance Targets**:
- 60fps maintained with 100 items
- <200ms render time for list transitions
- <50MB memory usage for 20 lists × 100 items

---

## Decision 4: Platform-Specific UI Patterns

**Decision**: Implement hybrid approach with platform-specific action patterns

**Rationale**:
- Users expect platform conventions on their devices
- React Native Platform module enables conditional rendering
- Minimal code duplication with shared components
- Enhances native feel as required by constitution

**iOS Patterns**:
- Swipe-to-delete with red background reveal
- Native iOS back button in navigation bar
- Pull-to-refresh gesture
- Haptic feedback using `expo-haptics`
- Standard iOS list separators

**Android Patterns**:
- Floating Action Button (FAB) for creating lists
- Material Design ripple effects on touch
- Android back gesture support
- Long-press for item actions menu
- Material elevation shadows

**Implementation**:
```typescript
import { Platform } from 'react-native';

const CreateButton = Platform.select({
  ios: () => <HeaderButton />,
  android: () => <FAB />,
})();
```

**Shared Behavior**:
- Consistent data model across platforms
- Same navigation structure
- Identical business logic
- Unified theming system

---

## Decision 5: State Management Strategy

**Decision**: React hooks with local state + Context for global data

**Rationale**:
- No external state management library needed
- React 19.1.0 has excellent built-in state primitives
- Context API sufficient for sharing lists across screens
- Keeps bundle size minimal
- Aligns with minimal dependencies requirement
- Easy to test with React Testing Library

**Alternatives Considered**:
1. **Redux/Redux Toolkit**: Overkill for local-only app, adds ~100KB to bundle
2. **MobX**: Adds dependency, unnecessary complexity for simple CRUD
3. **Zustand**: Lightweight but still external dependency, not needed

**Pattern**:
```typescript
// Global lists state via Context
const ShoppingListsContext = createContext<ShoppingListsContextType>();

// Local item state per list screen
const [items, setItems] = useState<ShoppingItem[]>([]);

// Custom hooks encapsulate data fetching
function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  
  useEffect(() => {
    shoppingListsService.getAll().then(setLists);
  }, []);
  
  return { lists, createList, updateList, deleteList };
}
```

---

## Decision 6: Database Schema Design

**Decision**: Simple normalized schema with two tables

**Rationale**:
- Normalized design prevents data duplication
- Foreign key constraints maintain referential integrity
- Efficient queries with indexed lookups
- Supports cascade delete for cleanup
- Simple enough to maintain without ORM

**Schema**:

**shopping_lists table**:
```sql
CREATE TABLE shopping_lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_lists_created ON shopping_lists(created_at DESC);
```

**shopping_items table**:
```sql
CREATE TABLE shopping_items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);

CREATE INDEX idx_items_list ON shopping_items(list_id, created_at DESC);
```

**Key Design Choices**:
- TEXT primary keys (UUIDs) for easy synchronization if needed later
- INTEGER timestamps (Unix epoch) for efficient sorting
- NOT NULL constraints enforce data integrity
- Cascade delete automatically cleans up items when list deleted
- Indexes optimize common queries (get all lists, get items by list)

---

## Decision 7: Component Organization and Styling

**Decision**: Component-per-folder structure with CSS modules

**Rationale**:
- Each component lives in its own folder with co-located styles
- CSS modules provide scoped styling without global conflicts
- Easy to locate and modify component-specific styles
- Prevents monolithic stylesheet files that are hard to maintain
- Better code organization and ownership boundaries
- Follows separation of concerns principle

**Folder Structure Pattern**:
```
components/shopping/
├── list-card/
│   ├── list-card.tsx
│   └── list-card.module.css
├── list-item/
│   ├── list-item.tsx
│   └── list-item.module.css
```

**Alternatives Considered**:
1. **Inline StyleSheet.create()**: React Native standard but mixes concerns, harder to override, no CSS tooling
2. **Styled Components**: Adds dependency (~50KB), CSS-in-JS overhead, unnecessary complexity
3. **Global CSS file**: Style conflicts, hard to maintain, unclear component ownership
4. **Tailwind CSS**: Adds build complexity, large bundle for React Native, verbose class names

**Implementation Example**:
```typescript
// list-card/list-card.tsx
import styles from './list-card.module.css';

export function ListCard({ list }: ListCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{list.name}</Text>
    </View>
  );
}
```

```css
/* list-card/list-card.module.css */
.container {
  padding: 16px;
  background-color: var(--background);
  border-radius: 8px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
```

**Benefits**:
- Styles scoped to component (no leakage)
- Easy to delete - remove folder, remove styles
- Theme variables work via CSS custom properties
- Can leverage CSS tooling and linters
- Clear file ownership for teams

---

## Decision 8: Error Handling Strategy

**Decision**: Toast notifications with graceful degradation

**Rationale**:
- Non-blocking user feedback
- Consistent with mobile UX best practices
- Clear recovery paths for users
- Logging for debugging without exposing internals

**Error Categories**:

1. **Database Errors**: Retry with exponential backoff, show "Unable to save changes"
2. **Validation Errors**: Inline feedback, prevent invalid operations
3. **Edge Cases**: Empty states guide users to recovery actions

**Implementation**:
- Try/catch blocks around all database operations
- User-friendly error messages (no stack traces)
- Console.error for developer debugging
- Toast library: Consider built-in Alert or minimal toast component

---

## Performance Optimization Checklist

Based on constitution requirements:

✅ **60fps Scrolling**:
- FlatList with getItemLayout
- windowSize optimization
- removeClippedSubviews enabled

✅ **<300ms Transitions**:
- useNativeDriver for all animations
- Avoid layout calculations on JS thread
- Memoize expensive computations

✅ **<50MB Bundle**:
- Only expo-sqlite added (~500KB)
- No additional UI libraries
- Tree-shaking enabled via Metro

✅ **<200MB Memory**:
- Virtualized lists
- No image caching needed (text-only)
- Efficient SQLite queries

✅ **<3s Launch**:
- Lazy load list details
- Defer database init to background
- Optimize startup queries

---

## Testing Strategy

**Unit Tests** (Jest):
- Service layer functions (CRUD operations)
- Custom hooks (data fetching logic)
- Utility functions (ID generation, validation)

**Component Tests** (React Native Testing Library):
- List rendering
- Item actions (edit, copy, delete)
- Empty states
- Error states

**Integration Tests**:
- Complete user flows (create list → add items → edit → delete)
- Database migrations
- Platform-specific behaviors

**Manual Testing**:
- iOS simulator (iPhone 14)
- Android emulator (Pixel 5)
- Real devices for performance validation
- Accessibility testing (VoiceOver/TalkBack)

---

## Dependencies Summary

**New Dependencies to Add**:
- `expo-sqlite`: ~500KB (SQLite database)
- `uuid` or `expo-crypto`: <50KB (ID generation)

**Existing Dependencies Used**:
- `react-native-reanimated`: Animations
- `expo-haptics`: Haptic feedback
- `expo-router`: Navigation
- `react-native`: Core components (includes CSS modules support)

**Total Bundle Impact**: ~550KB (well within <2MB limit)

---

## Risk Assessment

**Low Risk**:
- SQLite is battle-tested, stable API
- Expo's managed workflow simplifies builds
- No network dependencies = no connectivity issues

**Medium Risk**:
- Platform-specific UI differences require careful testing
- Large datasets (1000+ items) need performance validation

**Mitigation**:
- Extensive testing on both platforms
- Performance profiling with React DevTools
- Incremental rollout with P1 story first

---

## Open Questions

None - all technical decisions resolved.

---

## Next Steps

1. Phase 1: Create data-model.md with entity definitions
2. Phase 1: Define contracts (database queries)
3. Phase 1: Write quickstart.md for developers
4. Phase 2: Generate tasks.md for implementation
