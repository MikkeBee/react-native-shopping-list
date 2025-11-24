# Implementation Plan: Shopping Lists Manager

**Branch**: `001-shopping-lists` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-shopping-lists/spec.md`

**Note**: This plan follows the `/speckit.plan` workflow with incremental development approach.

## Summary

A mobile-first shopping lists manager built with React Native/Expo that allows users to create named shopping lists, manage items with edit/copy/delete capabilities, and navigate between lists. The app uses SQLite for offline-first local storage with a Service Layer architecture, ensuring type safety with TypeScript strict mode and maintaining 60fps performance through FlatList virtualization. Each task will deliver a functional app state to enable validation and iterative refinement.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict mode enabled  
**Primary Dependencies**: React Native 0.81.5, Expo ~54.0.23, expo-router ~6.0.14, expo-sqlite (to be added)  
**Storage**: SQLite via expo-sqlite (local, offline-first)  
**Testing**: Jest + React Native Testing Library  
**Target Platform**: iOS 15+, Android 8+ (mobile only, no web)  
**Project Type**: Mobile (React Native with Expo managed workflow)  
**Performance Goals**: 60fps scrolling, <300ms screen transitions, <3s app launch  
**Constraints**: <50MB bundle size, <200MB memory usage, offline-capable, no external APIs  
**Scale/Scope**: Single-user, estimated 50-100 shopping lists, 1000-2000 items total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality & Type Safety
- [x] TypeScript strict mode enabled (`tsconfig.json` has `"strict": true`)
- [x] No usage of `any` type (enforced through ESLint rules)
- [x] ESLint configuration enforces project standards (`eslint.config.js` present)
- [x] All components have explicit type definitions (enforced in implementation)

### II. User Experience Consistency
- [x] Platform-specific design patterns identified (Decision 4: iOS/Android native components)
- [x] Haptic feedback strategy defined for interactions (expo-haptics for delete confirmations)
- [x] Loading states and error handling designed (See data-model.md state transitions)
- [x] Light/dark mode support planned (expo-system-ui with theme.ts)

### III. Performance Requirements
- [x] Bundle size impact estimated and within limits (Only expo-sqlite ~500KB added, total <2MB impact)
- [x] List virtualization strategy planned (Decision 3: FlatList with getItemLayout, windowSize=10)
- [x] Animation performance considerations documented (Decision 4: useNativeDriver for all animations)
- [x] Memory usage profiling planned for data-heavy features (Research phase complete, see research.md)

**Justification for any violations**: N/A - All gates pass

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (tabs)/
│   ├── index.tsx              # Shopping Lists screen (home)
│   └── _layout.tsx            # Tab navigation
├── list/
│   └── [id].tsx               # List Detail screen (dynamic route)
└── _layout.tsx                # Root layout

components/shopping/
├── list-card/
│   ├── list-card.tsx
│   └── list-card.module.css
├── list-item/
│   ├── list-item.tsx
│   └── list-item.module.css
├── list-header/
│   ├── list-header.tsx
│   └── list-header.module.css
├── empty-state/
│   ├── empty-state.tsx
│   └── empty-state.module.css
└── item-actions/
    ├── item-actions.tsx
    └── item-actions.module.css

services/
├── database.service.ts        # SQLite setup + migrations
├── shopping-lists.service.ts  # List CRUD operations
└── shopping-items.service.ts  # Item CRUD operations

hooks/
├── use-shopping-lists.ts      # Fetch all lists + create/delete
├── use-shopping-items.ts      # Fetch items for list + CRUD
└── use-database.ts            # Database initialization

types/
├── shopping-list.ts           # ShoppingList interface
├── shopping-item.ts           # ShoppingItem interface
└── service-errors.ts          # Custom error types

tests/
├── services/
│   ├── database.service.test.ts
│   ├── shopping-lists.service.test.ts
│   └── shopping-items.service.test.ts
├── hooks/
│   ├── use-shopping-lists.test.ts
│   └── use-shopping-items.test.ts
└── components/
    └── shopping/
        ├── list-card.test.tsx
        └── list-item.test.tsx
```

**Structure Decision**: 

React Native mobile app using Expo's file-based routing (expo-router). Components are organized by feature (shopping/) with each component in its own folder containing the component file and CSS module for styling. This structure provides:

- **Easy Management**: Each component is self-contained in its own folder, making it simple to locate, modify, or delete components without affecting others
- **No Style Conflicts**: CSS modules provide scoped styling, preventing accidental style leaks between components
- **Better Maintainability**: Co-located styles make it clear which styles belong to which component
- **Clear Ownership**: Folder-per-component pattern establishes clear boundaries and responsibilities
- **No Large CSS Files**: Each component has its own small CSS module instead of monolithic stylesheets

Services layer handles all SQLite operations, hooks provide reactive data access to UI, and types ensure end-to-end type safety.

---

## Phase Outputs

### Phase 0: Research & Technical Decisions ✅

**Status**: Complete  
**Artifacts**:
- [research.md](./research.md) - 8 technical decisions documented with rationale

**Key Decisions**:
1. SQLite library: expo-sqlite (official, ~500KB)
2. Architecture: Service Layer with direct SQLite access
3. List virtualization: FlatList with getItemLayout
4. Platform UI: Native components (iOS/Android specific)
5. State management: Custom hooks + React Context (no Redux)
6. Database schema: 3 tables with foreign key constraints
7. Component organization: Folder-per-component with CSS modules
8. Error handling: Custom error types + user-friendly messages

### Phase 1: Data Model & Contracts ✅

**Status**: Complete  
**Artifacts**:
- [data-model.md](./data-model.md) - Entity definitions and database schema
- [contracts/service-contracts.md](./contracts/service-contracts.md) - Service interfaces
- [quickstart.md](./quickstart.md) - Developer onboarding guide

**Deliverables**:
- 2 core entities: ShoppingList, ShoppingItem
- 3 database tables: shopping_lists, shopping_items, schema_version
- 3 services: DatabaseService, ShoppingListsService, ShoppingItemsService
- 19 service methods with full TypeScript signatures
- 10 common query patterns documented

### Phase 2: Implementation Tasks ⏳

**Next Command**: `/speckit.tasks`  
**Output**: [tasks.md](./tasks.md) - Detailed implementation checklist

**Incremental Development Approach**:
All tasks will be structured to maintain a **functional app state** after each completion. This enables:
- ✅ Continuous validation and testing
- ✅ Early detection of integration issues
- ✅ Opportunity for minor course corrections
- ✅ Demonstrable progress at every checkpoint

Each task will:
1. Build upon the previous working state
2. Add one complete vertical slice (database → service → hook → UI)
3. Be independently testable
4. Leave the app in a runnable state

---

## Complexity Tracking

N/A - No constitution violations to justify. All requirements met within constitutional constraints.

---

## References

- **Feature Spec**: [spec.md](./spec.md)
- **Research Decisions**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Service Contracts**: [contracts/service-contracts.md](./contracts/service-contracts.md)
- **Developer Guide**: [quickstart.md](./quickstart.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **Expo SQLite Docs**: https://docs.expo.dev/versions/latest/sdk/sqlite/
- **React Native Performance**: https://reactnative.dev/docs/performance
