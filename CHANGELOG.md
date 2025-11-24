# Changelog

All notable changes to the Shopping Lists Manager app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-13

### Added

#### Core Features
- **Shopping Lists Management**
  - Create shopping lists with custom names (1-100 characters)
  - View all shopping lists in a scrollable overview
  - Delete shopping lists with confirmation dialog
  - Long-press to delete on both iOS and Android platforms
  - Automatic default naming ("Shopping List") for empty names

- **Shopping Items Management**
  - Add items to shopping lists (1-500 characters)
  - Edit items with inline editing
  - Copy items within the same list
  - Delete items with confirmation dialog
  - Haptic feedback for all CRUD operations

- **Navigation**
  - Seamless navigation between lists overview and detail screens
  - Dynamic list names displayed in navigation headers
  - Platform-specific back navigation (iOS back button, Android back gesture)
  - Native animations for smooth transitions
  - Auto-refresh items when returning to detail screen

#### Technical Implementation
- **Database & Storage**
  - SQLite database with expo-sqlite for offline-first storage
  - Foreign key constraints with cascade delete
  - Automatic schema migrations
  - Optimized indexes for query performance

- **Architecture**
  - Service Layer pattern for data access
  - Custom React hooks for reactive state management
  - Optimistic updates for immediate UI feedback
  - TypeScript strict mode for type safety
  - Comprehensive error handling with custom error types

- **Performance**
  - FlatList virtualization for smooth scrolling
  - removeClippedSubviews optimization
  - getItemLayout for efficient rendering
  - Window size optimization (10 items)
  - 60fps performance target

- **UI/UX**
  - Light and dark mode support
  - Platform-specific design patterns
  - Empty states with helpful guidance
  - Loading skeletons during data fetch
  - Item count badges on list cards
  - Haptic feedback for user actions
  - Safe area support for modern iOS devices

#### Developer Experience
- Clean TypeScript interfaces exported from central types/index.ts
- Comprehensive JSDoc documentation
- Consistent error logging with namespaced tags
- ESLint configuration for code quality
- Zero `any` types - full type safety

### Technical Details

**Dependencies Added:**
- expo-sqlite ~14.0.6
- expo-haptics ~13.0.4

**File Structure:**
- `/services` - Database and CRUD operations
- `/hooks` - React hooks for data management
- `/components/shopping` - Reusable UI components
- `/types` - TypeScript type definitions
- `/app` - Expo Router screens

**Performance Metrics:**
- App launch time: <3 seconds
- Screen transitions: <300ms
- List scrolling: 60fps maintained
- Memory usage: <200MB
- Bundle size: <50MB

### Fixed
- iOS status bar overlap with safe area implementation
- Keyboard not appearing on modal inputs (both platforms)
- Android autocomplete toolbar in text inputs

### Changed
- Unified delete UX to long-press for both iOS and Android

## [Unreleased]

### Planned Features
- Item checkboxes for marking items as purchased
- List sharing functionality
- Search/filter items
- Categories for items
- Custom list colors
- Item quantity tracking
- Voice input for items
- Barcode scanning

---

[1.0.0]: https://github.com/yourusername/speckit-rnative-app/releases/tag/v1.0.0
