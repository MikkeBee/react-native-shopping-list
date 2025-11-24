<<<<<<< HEAD
# Shopping Lists Manager 📝

A mobile-first shopping lists manager built with React Native and Expo. Create multiple shopping lists, manage items with edit/copy/delete capabilities, and navigate seamlessly between lists - all with offline-first local storage.

## Features

### Core Functionality
✅ **Shopping Lists**
- Create named shopping lists
- View all lists in an organized overview
- Delete lists with confirmation
- Long-press to delete (iOS & Android)
- Item count badges on each list

✅ **Shopping Items**
- Add items to any list
- Inline editing of item text
- Copy items within lists
- Delete with confirmation
- Haptic feedback for all actions

✅ **Navigation**
- Smooth transitions between screens
- Dynamic list names in headers
- Platform-specific navigation patterns
- Auto-refresh on screen focus

### Technical Highlights
- 🔒 **TypeScript** strict mode for type safety
- 💾 **SQLite** offline-first local storage
- ⚡ **Optimistic updates** for instant UI feedback
- 🎨 **Light/Dark mode** support
- 📱 **Platform-specific** UI patterns
- 🚀 **Performance optimized** 60fps scrolling

## Get started

### Prerequisites
- Node.js 18+ 
- iOS Simulator (macOS) or Android Emulator
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the app
   ```bash
   npx expo start
   ```

3. Run on your platform
   - **iOS Simulator**: Press `i`
   - **Android Emulator**: Press `a`
   - **Expo Go**: Scan the QR code with the Expo Go app

## Project Structure

```
app/
├── (tabs)/               # Tab navigation
│   ├── (home)/          # Home tab with nested Stack
│   │   ├── index.tsx    # Shopping lists overview
│   │   ├── list/
│   │   │   └── [id].tsx # List detail (dynamic route)
│   │   └── _layout.tsx  # Home Stack layout
│   ├── explore.tsx      # Explore tab
│   └── _layout.tsx      # Tabs layout
└── _layout.tsx          # Root Stack layout

components/shopping/
├── list-card/        # Shopping list card component
├── list-item/        # Shopping item component
└── empty-state/      # Empty state component

services/
├── database.service.ts        # SQLite setup + migrations
├── shopping-lists.service.ts  # Lists CRUD operations
└── shopping-items.service.ts  # Items CRUD operations

hooks/
├── use-shopping-lists.ts      # Lists state management
├── use-shopping-items.ts      # Items state management
└── use-database.ts            # Database initialization

types/
├── index.ts               # Central type exports
├── shopping-list.ts       # ShoppingList interface
├── shopping-item.ts       # ShoppingItem interface
└── service-errors.ts      # Custom error types
```

### Navigation Architecture

The app uses a **nested navigator pattern** to maintain tab bar visibility across all screens:

- **Root Stack**: Wraps the entire app, anchored to the tabs group
- **Tabs Navigator**: Provides bottom tab bar with Home and Explore tabs
- **Home Stack**: Nested Stack inside the Home tab for list navigation
  - Lists Overview (`index.tsx`)
  - List Detail (`list/[id].tsx`) - maintains tab bar visibility

This structure ensures the tab bar remains visible when navigating from the lists overview to a specific list detail, improving navigation consistency and user experience.

## Development Commands

```bash
# Run linter
npm run lint

# Run tests  
npm test

# Run on specific platform
npm run ios
npm run android

# Reset project to clean state
npm run reset-project
```

## Architecture

### Service Layer Pattern
All database operations go through dedicated service files that handle validation, error handling, and data transformation.

### Custom Hooks
React hooks provide reactive state management with optimistic updates for immediate UI feedback.

### Type Safety
Full TypeScript coverage with strict mode enabled. Zero `any` types in the codebase.

### Performance
- FlatList virtualization for efficient rendering
- Optimized re-renders with React.memo
- Native driver animations for 60fps
- Database indexes for fast queries

## Technical Stack

- **Framework**: React Native 0.81.5
- **Runtime**: Expo ~54.0.23
- **Routing**: expo-router ~6.0.14
- **Database**: expo-sqlite ~14.0.6
- **Haptics**: expo-haptics ~13.0.4
- **Language**: TypeScript 5.9.2 (strict mode)

## Platform Support

- **iOS**: 15.0+
- **Android**: 8.0+ (API 26)

## Performance Targets

- ✅ App launch: <3 seconds
- ✅ Screen transitions: <300ms
- ✅ List scrolling: 60fps
- ✅ Memory usage: <200MB
- ✅ Bundle size: <50MB

## Learn more

To learn more about developing with Expo:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals or dive into advanced topics
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Step-by-step tutorial
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/): Database documentation
- [Expo Router](https://docs.expo.dev/router/introduction/): File-based routing

## License

MIT

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.
