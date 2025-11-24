# Tasks: Shopping Lists Manager

**Input**: Design documents from `/specs/001-shopping-lists/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/service-contracts.md

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification. Focus is on implementation with manual testing per acceptance scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Each phase delivers a functional app state.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install expo-sqlite dependency via `npx expo install expo-sqlite`
- [X] T002 [P] Create types directory structure: `types/shopping-list.ts`, `types/shopping-item.ts`, `types/service-errors.ts`
- [X] T003 [P] Define ShoppingList interface in `types/shopping-list.ts` per data-model.md
- [X] T004 [P] Define ShoppingItem interface in `types/shopping-item.ts` per data-model.md
- [X] T005 [P] Define custom error types (DatabaseError, ValidationError, NotFoundError) in `types/service-errors.ts`
- [X] T006 [P] Create services directory: `services/`
- [X] T007 [P] Create hooks directory: `hooks/`
- [X] T008 [P] Create components/shopping directory structure per plan.md (list-card/, list-item/, list-header/, empty-state/, item-actions/)

**Checkpoint**: Directory structure and type definitions in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Implement DatabaseService in `services/database.service.ts` with initialization and migration logic
- [X] T010 Create SQLite schema (shopping_lists, shopping_items, schema_version tables) in DatabaseService
- [X] T011 Implement foreign key constraints and cascade delete in schema
- [X] T012 Create useDatabase hook in `hooks/use-database.ts` for database initialization on app startup
- [X] T013 Integrate database initialization in app root layout `app/_layout.tsx`
- [X] T014 [P] Create empty-state component in `components/shopping/empty-state/empty-state.tsx` with CSS module
- [X] T015 [P] Create empty-state styles in `components/shopping/empty-state/empty-state.module.css` (light/dark mode support)
- [X] T016 [P] Setup haptic feedback utility using expo-haptics
- [X] T017 [P] Configure theme variables in `constants/theme.ts` for light/dark mode colors

**Checkpoint**: Foundation ready - database initialized, empty states available, theming configured. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Create and Name Shopping Lists (Priority: P1) 🎯 MVP ✅

**Goal**: Users can create multiple shopping lists with custom names and view them in a list overview.

**Independent Test**: Launch app, tap "Create List" button, enter "Test List" as name, confirm creation, verify "Test List" appears in the list overview screen. Create a second list "Groceries" and verify both lists display with their names.

### Quality Gates for User Story 1

- [X] TQ001 [US1] TypeScript compilation passes with no errors
- [X] TQ002 [US1] ESLint passes with zero warnings
- [X] TQ003 [US1] Tested on both iOS and Android simulators
- [X] TQ004 [US1] Performance: List overview screen renders in <300ms
- [X] TQ005 [US1] Performance: Maintains 60fps during list scrolling
- [X] TQ006 [US1] UX: Light and dark mode both display correctly
- [X] TQ007 [US1] UX: Platform-specific patterns used (iOS swipe actions, Android FAB)
- [X] TQ008 [US1] Edge case: Empty name validation works (provides default or shows error)

### Implementation for User Story 1

#### Service Layer

- [X] T018 [P] [US1] Implement ShoppingListsService.create() in `services/shopping-lists.service.ts`
- [X] T019 [P] [US1] Implement ShoppingListsService.getAll() in `services/shopping-lists.service.ts`
- [X] T020 [P] [US1] Implement ShoppingListsService.delete() in `services/shopping-lists.service.ts`
- [X] T021 [P] [US1] Implement ShoppingListsService.count() in `services/shopping-lists.service.ts`
- [X] T022 [US1] Add name validation logic (1-100 chars, trim whitespace, default naming) in ShoppingListsService

#### Hooks Layer

- [X] T023 [US1] Implement useShoppingLists hook in `hooks/use-shopping-lists.ts` (fetch all lists, create, delete)
- [X] T024 [US1] Add loading states and error handling to useShoppingLists hook
- [X] T025 [US1] Implement optimistic updates for create/delete operations in useShoppingLists

#### UI Components

- [X] T026 [P] [US1] Create list-card component in `components/shopping/list-card/list-card.tsx`
- [X] T027 [P] [US1] Create list-card styles in `components/shopping/list-card/list-card.module.css` (card layout, shadows, themes)
- [X] T028 [P] [US1] Add swipe-to-delete gesture to list-card (iOS) with haptic feedback
- [X] T029 [P] [US1] Add long-press delete action to list-card (Android) with haptic feedback
- [X] T030 [US1] Integrate delete confirmation dialog in list-card (prevent accidental deletion per FR-008)

#### Screens

- [X] T031 [US1] Implement shopping lists overview screen in `app/(tabs)/index.tsx`
- [X] T032 [US1] Add FlatList with virtualization (getItemLayout, windowSize=10) to index.tsx
- [X] T033 [US1] Implement create list dialog/modal with name input in index.tsx
- [X] T034 [US1] Add "Create List" floating action button (FAB) to index.tsx
- [X] T035 [US1] Integrate empty-state component when no lists exist
- [X] T036 [US1] Add loading skeleton while fetching lists
- [X] T037 [US1] Add error handling with user-friendly toast messages

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create, view, and delete shopping lists.

---

## Phase 4: User Story 2 - Add and Manage List Items (Priority: P2) ✅

**Goal**: Users can add items to shopping lists and edit, copy, or delete those items.

**Independent Test**: Open any shopping list, tap "Add Item", enter "Milk", verify it appears. Edit "Milk" to "Almond Milk", verify change. Copy "Almond Milk", verify duplicate appears. Delete one item with confirmation, verify it's removed. All operations should work without affecting other items.

### Quality Gates for User Story 2

- [X] TQ009 [US2] TypeScript compilation passes with no errors
- [X] TQ010 [US2] ESLint passes with zero warnings
- [X] TQ011 [US2] Tested on both iOS and Android simulators
- [X] TQ012 [US2] Performance: Item list renders in <300ms
- [X] TQ013 [US2] Performance: Maintains 60fps during item scrolling
- [X] TQ014 [US2] UX: Edit/Copy/Delete actions have appropriate haptic feedback
- [X] TQ015 [US2] UX: Copy operation is visually confirmed (toast or animation)
- [X] TQ016 [US2] Edge case: Empty item text validation works

### Implementation for User Story 2

#### Service Layer

- [X] T038 [P] [US2] Implement ShoppingItemsService.create() in `services/shopping-items.service.ts`
- [X] T039 [P] [US2] Implement ShoppingItemsService.getByListId() in `services/shopping-items.service.ts`
- [X] T040 [P] [US2] Implement ShoppingItemsService.update() in `services/shopping-items.service.ts`
- [X] T041 [P] [US2] Implement ShoppingItemsService.copy() in `services/shopping-items.service.ts`
- [X] T042 [P] [US2] Implement ShoppingItemsService.delete() in `services/shopping-items.service.ts`
- [X] T043 [US2] Add item text validation (1-500 chars, trim whitespace) in ShoppingItemsService

#### Hooks Layer

- [X] T044 [US2] Implement useShoppingItems hook in `hooks/use-shopping-items.ts` (fetch items for list, CRUD operations)
- [X] T045 [US2] Add loading states and error handling to useShoppingItems hook
- [X] T046 [US2] Implement optimistic updates for create/edit/copy/delete operations in useShoppingItems

#### UI Components

- [X] T047 [P] [US2] Create list-item component in `components/shopping/list-item/list-item.tsx`
- [X] T048 [P] [US2] Create list-item styles in `components/shopping/list-item/list-item.module.css` (item layout, checkbox styling)
- [X] T049 [P] [US2] Create item-actions component in `components/shopping/item-actions/item-actions.tsx` (edit, copy, delete buttons)
- [X] T050 [P] [US2] Create item-actions styles in `components/shopping/item-actions/item-actions.module.css` (button layout, icons)
- [X] T051 [US2] Integrate edit mode toggle in list-item (inline editing)
- [X] T052 [US2] Add haptic feedback to copy action in item-actions
- [X] T053 [US2] Add delete confirmation dialog to item-actions (prevent accidental deletion per FR-008)

#### Screens

- [X] T054 [US2] Create list detail screen in `app/list/[id].tsx` (dynamic route for viewing items)
- [X] T055 [US2] Add list-header component in `components/shopping/list-header/list-header.tsx` (displays list name)
- [X] T056 [US2] Add list-header styles in `components/shopping/list-header/list-header.module.css`
- [X] T057 [US2] Implement FlatList with virtualization for items in `app/list/[id].tsx`
- [X] T058 [US2] Add "Add Item" input field or button to list detail screen
- [X] T059 [US2] Integrate empty-state component when list has no items
- [X] T060 [US2] Add loading skeleton while fetching items
- [X] T061 [US2] Add error handling with user-friendly toast messages
- [X] T062 [US2] Integrate item-actions component with each list-item

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can create lists, add items, and manage items with full CRUD operations.

---

## Phase 5: User Story 3 - Navigate Between Lists (Priority: P3) ✅

**Goal**: Users can easily switch between different shopping lists and view the correct items for each list.

**Independent Test**: Create two lists ("Groceries" and "Hardware"). Add different items to each ("Milk" to Groceries, "Hammer" to Hardware). Navigate from Groceries to list overview, then to Hardware. Verify Hardware shows only "Hammer". Navigate back to Groceries, verify only "Milk" shows. Confirm navigation is smooth (<300ms transitions).

### Quality Gates for User Story 3

- [X] TQ017 [US3] TypeScript compilation passes with no errors
- [X] TQ018 [US3] ESLint passes with zero warnings
- [X] TQ019 [US3] Tested on both iOS and Android simulators
- [X] TQ020 [US3] Performance: Screen transitions complete in <300ms
- [X] TQ021 [US3] Performance: Back navigation maintains 60fps
- [X] TQ022 [US3] UX: Platform-specific back navigation works (iOS back button, Android back gesture)
- [X] TQ023 [US3] Correctness: List items are isolated (no cross-contamination)

### Implementation for User Story 3

#### Navigation Integration

- [X] T063 [US3] Configure expo-router navigation stack in `app/_layout.tsx`
- [X] T064 [US3] Implement navigation from list-card to list detail screen (tap to open)
- [X] T065 [US3] Add back navigation from list detail to overview (platform-specific)
- [X] T066 [US3] Enable native animations for transitions (useNativeDriver: true)
- [ ] T067 [US3] Add navigation state persistence (optional - maintain scroll position)

#### Data Isolation

- [X] T068 [US3] Verify ShoppingItemsService.getByListId() filters by listId correctly
- [X] T069 [US3] Add data refresh on screen focus in `app/list/[id].tsx` (ensures correct items shown)
- [X] T070 [US3] Test cascade delete works correctly (deleting list removes all items, no orphans)

#### UI Polish

- [X] T071 [P] [US3] Add screen titles to navigation header (list name in detail screen)
- [X] T072 [P] [US3] Add item count badge to list-card (shows number of items in list)
- [X] T073 [US3] Ensure theme consistency across all screens (light/dark mode)

**Checkpoint**: All user stories should now be independently functional. Users can create multiple lists, manage items within each list, and navigate between lists with correct data isolation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

- [ ] T074 [P] Add TypeScript interface exports to `types/index.ts` for cleaner imports
- [ ] T075 [P] Optimize FlatList performance (removeClippedSubviews, maxToRenderPerBatch)
- [ ] T076 [P] Add error logging for debugging (production error tracking)
- [ ] T077 [P] Verify bundle size is <50MB (run Metro bundler analysis)
- [ ] T078 [P] Test memory usage stays <200MB during normal operation
- [ ] T079 [P] Verify app launch time is <3 seconds on mid-range devices
- [ ] T080 [P] Test accessibility with VoiceOver (iOS) and TalkBack (Android)
- [ ] T081 [P] Add loading animations with useNativeDriver for 60fps
- [ ] T082 Code cleanup: Remove unused imports and console.logs
- [ ] T083 Code cleanup: Ensure all components have proper TypeScript types (no `any`)
- [ ] T084 Run ESLint fix on entire codebase
- [ ] T085 Validate quickstart.md scenarios work end-to-end
- [ ] T086 Create CHANGELOG.md documenting implemented features
- [ ] T087 Update README.md with setup instructions and feature list

**Checkpoint**: Production-ready app with all quality gates passed, performance optimized, and documentation complete.

---

## Phase 7: Bug Fixes & UI Polish ✅

**Purpose**: Address UI/UX issues and improve overall user experience

- [X] T088 [P] Fix tab bar visibility on all screens (should be visible on list detail screen)
- [X] T089 [P] Ensure FAB floats above tab bar on all screens
- [X] T090 [P] Fix z-index layering for tab bar and FAB components
- [X] T091 Verify tab bar navigation works from all screens
- [X] T092 Test tab bar appearance in light and dark modes
- [X] T093 [P] Add safe area padding to tab bar for iOS devices
- [X] T094 [P] Verify tab bar doesn't interfere with scrolling
- [X] T095 Manual testing: Verify all navigation flows work correctly
- [X] T096 Manual testing: Test app on both iOS and Android devices
- [X] T097 Code review: Check for any remaining console warnings

**Checkpoint**: Tab bar visible on all screens, FAB properly positioned, no visual bugs ✅

**Changes**:
- Restructured navigation to use nested Stack inside Home tab
- Moved `list/[id].tsx` from root to `(tabs)/(home)/list/[id].tsx`
- Added `zIndex: 1000` to FAB styles for proper layering above tab bar
- Updated FlatList content padding to prevent items from being hidden behind tab bar
- Updated README.md with Navigation Architecture section documenting the nested navigator pattern

---

## Phase 8: Item Completion Status ✅

**Purpose**: Allow users to mark items as completed/uncompleted

### Quality Gates for Phase 8

- [X] TQ024 [P8] TypeScript compilation passes with no errors
- [X] TQ025 [P8] Item completion state persists after app restart
- [X] TQ026 [P8] Visual distinction is clear between completed and uncompleted items
- [X] TQ027 [P8] Tap/toggle interaction feels responsive with haptic feedback
- [X] TQ028 [P8] Completed items are easily identifiable in both light and dark modes

### Implementation for Phase 8

#### Database Schema Update

- [X] T098 Add `completed` boolean column to shopping_items table
- [X] T099 Create migration function to update existing database schema
- [X] T100 Update ShoppingItem TypeScript interface to include `completed` field
- [X] T101 Test database migration on app with existing data

#### Service Layer

- [X] T102 [P] Update ShoppingItemsService.create() to initialize `completed` as false
- [X] T103 [P] Add ShoppingItemsService.toggleComplete(id) method
- [X] T104 [P] Update ShoppingItemsService.copy() to copy `completed` state
- [X] T105 Update all SQL queries to include `completed` field

#### Hooks Layer

- [X] T106 Add toggleComplete method to useShoppingItems hook
- [X] T107 Implement optimistic update for completion toggle
- [X] T108 Add haptic feedback on completion toggle

#### UI Components

- [X] T109 [P] Update list-item component to display completion state
- [X] T110 [P] Add visual styling for completed items (strikethrough, opacity, or color change)
- [X] T111 [P] Implement tap/press handler for toggling completion
- [X] T112 Add completion checkbox or icon to list-item
- [X] T113 Ensure completed styling works in both light and dark modes
- [X] T114 Add animation transition when toggling completion state

**Checkpoint**: Users can tap items to mark as completed/uncompleted with clear visual feedback and persistence ✅

**Changes**:
- Added `completed` boolean column to shopping_items table via migration V2
- Updated ShoppingItem interface to include `completed: boolean`
- Updated ShoppingItemsService with `toggleComplete()` method
- Added optimistic updates to useShoppingItems hook
- Updated ListItem component with:
  - Circular checkbox with checkmark (✓) when completed
  - Strikethrough text for completed items
  - Reduced opacity (0.6) for completed items
  - Muted color for completed items in both light/dark modes
  - Haptic feedback (lightImpact) on toggle
  - Tap anywhere on item text/checkbox to toggle
- All changes persist across app restarts

---

## Phase 9: Settings & Theme Customization

**Purpose**: Transform explore tab into settings with preset themes and custom color options

### Quality Gates for Phase 9

- [ ] TQ029 [P9] TypeScript compilation passes with no errors
- [ ] TQ030 [P9] Theme changes apply immediately without app restart
- [ ] TQ031 [P9] Custom colors persist after app restart
- [ ] TQ032 [P9] All preset themes meet accessibility contrast requirements
- [ ] TQ033 [P9] Theme settings work correctly in both light and dark system modes

### Implementation for Phase 9

#### Database Schema for Settings

- [X] T115 Create app_settings table for storing user preferences
- [X] T116 Add fields for theme selection and custom colors
- [X] T117 Create migration function for settings table
- [X] T118 Create SettingsService for CRUD operations on settings

#### Theme System Redesign

- [X] T119 [P] Define color palette for Cyberpunk theme (neon colors, dark backgrounds)
- [X] T120 [P] Define color palette for Steampunk theme (bronze, copper, vintage tones)
- [X] T121 [P] Define color palette for Medieval theme (stone, wood, heraldic colors)
- [X] T122 [P] Define color palette for Retro theme (bright pastels, retro colors)
- [X] T123 [P] Define color palette for Art Deco theme (gold, black, geometric elegance)
- [X] T124 Update constants/theme.ts to support multiple theme presets
- [X] T125 Add theme context provider for app-wide theme state
- [ ] T126 Verify all themes meet WCAG accessibility contrast ratios (4.5:1 minimum)

#### Settings Service & Hook

- [X] T127 Implement SettingsService.getSettings() method
- [X] T128 Implement SettingsService.updateTheme(themeId) method
- [X] T129 Implement SettingsService.updateCustomColors(colors) method
- [X] T130 Create useSettings hook for managing settings state
- [X] T131 Add theme persistence on app launch

#### Settings Screen UI

- [X] T132 [P] Rename explore tab to "Settings" in navigation
- [X] T133 [P] Update tab icon to settings gear icon
- [X] T134 Create settings screen layout in `app/(tabs)/explore.tsx`
- [X] T135 [P] Add "Preset Themes" section with theme cards/buttons
- [X] T136 [P] Implement theme selection with visual preview
- [X] T137 [P] Add "Custom Colors" section with collapsible panel (marked as coming soon)
- [ ] T138 [P] Create color picker component for custom colors
- [ ] T139 [P] Add color input for completed item designation color
- [ ] T140 [P] Add color input for button/accent color
- [ ] T141 [P] Add color input for text color
- [ ] T142 [P] Add color input for background color
- [ ] T143 [P] Add color input for card/item color
- [ ] T144 Add reset to default button for custom colors
- [ ] T145 Add theme preview component showing sample list and items
- [ ] T146 Implement color validation (ensure readable contrasts)

#### Integration

- [X] T147 Update all components to use theme context instead of hardcoded Colors
- [X] T148 Update list-card component to use theme colors
- [X] T149 Update list-item component to use theme colors (including completed state)
- [X] T150 Update empty-state component to use theme colors
- [X] T151 Update modal components to use theme colors (using native Alert)
- [X] T152 Apply custom completed color to completed items
- [ ] T153 Test all preset themes across all screens
- [ ] T154 Test custom colors across all screens
- [ ] T155 Verify theme switching performance (should be instant)

**Checkpoint**: Users can choose from 5 preset themes or customize colors, with changes applying immediately and persisting across app restarts

---

## Dependencies & Execution Order (Phases 7-9)

### Phase Dependencies

- **Phase 7 (Bug Fixes)**: Independent - Can start immediately
- **Phase 8 (Item Completion)**: Independent - Can start immediately (requires database migration)
- **Phase 9 (Settings & Themes)**: Should start after Phase 8 (uses completed item color in theme system)

### Recommended Order

1. **Phase 7**: Fix UI bugs first for better development experience
2. **Phase 8**: Add completion feature (foundation for theme customization)
3. **Phase 9**: Build comprehensive theme system with completion colors

### Parallel Opportunities

**Phase 7 & 8** can be worked on in parallel if needed:
- Phase 7 focuses on navigation/layout
- Phase 8 focuses on data model and item state

**Phase 9** should wait for Phase 8 completion to properly implement completed item theming.

---

## Task Summary (Phases 7-9)

**Total New Tasks**: 68 tasks

**Breakdown by Phase**:
- Phase 7 (Bug Fixes & UI Polish): 10 tasks
- Phase 8 (Item Completion): 17 tasks + 5 quality gates
- Phase 9 (Settings & Themes): 41 tasks + 5 quality gates

**Estimated Time**:
- Phase 7: 2-4 hours
- Phase 8: 6-8 hours
- Phase 9: 12-16 hours

**Total Estimated Time**: 20-28 hours for all three phases

---

## Notes

- **Phase 7**: Critical for proper navigation UX
- **Phase 8**: Database migration required - test carefully with existing data
- **Phase 9**: Accessibility testing required for all themes (WCAG 2.1 AA compliance)
- **Color pickers**: Consider using `react-native-color-picker` or similar library
- **Theme preview**: Should show live preview of theme changes before applying
- **Custom colors**: Validate contrast ratios to ensure text readability
- **Settings persistence**: Store in SQLite for offline access

**Commit frequently**: After each phase completion for easy rollback

---

## Complexity Tracking

N/A - All new features are additive and don't violate constitutional constraints.

---

## References

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - No dependencies on User Story 1 (but integrates with list detail screen)
  - User Story 3 (P3): Depends on User Story 1 and 2 being complete (requires lists and items to navigate between)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Can implement and test alone
- **User Story 2 (P2)**: Mostly independent - Shares database foundation but can be tested separately by creating a list first
- **User Story 3 (P3)**: Integrative - Requires both US1 and US2 to be complete for full navigation testing

### Within Each User Story

- Service layer before hooks
- Hooks before components
- Components before screens
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks T002-T008 can run in parallel after T001 completes

**Phase 2 (Foundational)**: 
- T014-T017 can run in parallel after T009-T013 complete

**Phase 3 (User Story 1)**:
- T018-T022 (service methods) can run in parallel
- T026-T030 (UI components) can run in parallel after hooks are ready

**Phase 4 (User Story 2)**:
- T038-T043 (service methods) can run in parallel
- T047-T053 (UI components) can run in parallel after hooks are ready

**Phase 5 (User Story 3)**:
- T071-T073 (UI polish) can run in parallel

**Phase 6 (Polish)**:
- Most tasks (T074-T081) can run in parallel as they touch different aspects

---

## Parallel Example: User Story 1

```bash
# Service layer tasks (different methods, same file but independent):
T018: "Implement ShoppingListsService.create()"
T019: "Implement ShoppingListsService.getAll()"
T020: "Implement ShoppingListsService.delete()"
T021: "Implement ShoppingListsService.count()"

# UI component tasks (different component folders):
T026: "Create list-card component in components/shopping/list-card/list-card.tsx"
T027: "Create list-card styles in components/shopping/list-card/list-card.module.css"
T028: "Add swipe-to-delete gesture to list-card (iOS)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008) → ~1-2 hours
2. Complete Phase 2: Foundational (T009-T017) → ~3-4 hours, CRITICAL blocker
3. Complete Phase 3: User Story 1 (T018-T037) → ~6-8 hours
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create multiple lists with different names
   - Delete lists with swipe/long-press
   - Verify empty state appears when no lists
   - Test on both iOS and Android
5. If validated, you have a working MVP!

### Incremental Delivery

1. **Foundation** (Phase 1+2): ~4-6 hours → Database ready, empty states working
2. **MVP** (Phase 3): ~6-8 hours → Users can create and manage shopping lists
3. **Content Management** (Phase 4): ~8-10 hours → Users can add/edit/delete items
4. **Navigation** (Phase 5): ~4-6 hours → Users can switch between multiple lists
5. **Polish** (Phase 6): ~3-4 hours → Production-ready with performance optimization

**Total Estimated Time**: 25-34 hours for complete implementation

### Parallel Team Strategy

With 2-3 developers after Foundational phase completes:

**Scenario 1 - Sequential (Recommended for small team)**:
- Complete US1 → Validate → Complete US2 → Validate → Complete US3 → Validate

**Scenario 2 - Parallel (If team has capacity)**:
- Developer A: User Story 1 (lists management)
- Developer B: User Story 2 (items management) - starts after US1 screen structure exists
- Developer C: Polish & testing across both stories

**Scenario 3 - Full Parallel (3+ developers)**:
- Dev A: User Story 1 services + hooks
- Dev B: User Story 1 UI components
- Dev C: User Story 2 services + hooks (can start after database foundation)
- Stories merge and integrate after independent completion

---

## Task Summary

**Total Tasks**: 87 tasks across 6 phases

**Breakdown by Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 9 tasks
- Phase 3 (User Story 1): 20 tasks + 8 quality gates
- Phase 4 (User Story 2): 25 tasks + 8 quality gates
- Phase 5 (User Story 3): 11 tasks + 7 quality gates
- Phase 6 (Polish): 14 tasks

**Breakdown by User Story**:
- User Story 1 (P1 - MVP): 20 implementation tasks
- User Story 2 (P2): 25 implementation tasks
- User Story 3 (P3): 11 implementation tasks

**Parallel Opportunities**: 35 tasks marked with [P] can potentially run in parallel

**Independent Test Criteria**:
- User Story 1: Can create, view, and delete lists without items
- User Story 2: Can manage items within a list without navigation
- User Story 3: Can navigate between multiple lists with correct data isolation

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = ~37 tasks, delivers list creation and management

---

## Notes

- **[P] tasks**: Different files or independent functions, no dependencies
- **[Story] label**: Maps task to specific user story for traceability
- **Incremental approach**: Each phase leaves app in functional state
- **Quality gates**: Verify each story independently before proceeding
- **Performance**: FlatList virtualization required (research.md Decision 3)
- **Platform patterns**: iOS swipe actions, Android FAB (research.md Decision 4)
- **Styling**: CSS modules per component folder (research.md Decision 7)
- **No tests**: Tests not explicitly requested in spec, focus on manual validation per acceptance scenarios
- **Stop points**: Validate after each user story phase before continuing
- **Commit frequently**: After each task or logical group for easy rollback
