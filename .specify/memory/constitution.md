<!--
SYNC IMPACT REPORT
==================
Version Change: 0.0.0 → 1.0.0
Modified Principles: Initial constitution ratification
Added Sections:
  - Core Principles (3 principles focused on code quality, UX consistency, performance)
  - Performance Standards
  - Development Workflow
  - Governance
Removed Sections: None (initial version)
Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - User story prioritization supports UX consistency principle
  ✅ tasks-template.md - Task organization supports quality gates
Follow-up TODOs: None
-->

# Speckit React Native App Constitution

## Core Principles

### I. Code Quality & Type Safety (NON-NEGOTIABLE)

TypeScript MUST be used throughout the entire codebase with strict mode enabled. All components, hooks, utilities, and services MUST have explicit type definitions. The `any` type is prohibited except where explicitly justified and documented. ESLint configuration MUST enforce code quality standards with zero tolerance for warnings in production builds.

**Rationale**: Type safety prevents runtime errors, improves developer experience through IDE autocomplete, enables refactoring confidence, and serves as living documentation. In a React Native environment where debugging across platforms is complex, catching errors at compile time is critical.

### II. User Experience Consistency

UI components MUST adhere to platform-specific design guidelines (iOS Human Interface Guidelines, Material Design for Android) while maintaining consistent behavior across platforms. All interactive elements MUST provide appropriate haptic feedback, loading states, and error handling. Theming MUST support both light and dark modes seamlessly using the expo-system-ui configuration.

**Rationale**: Users expect native-feeling experiences on their respective platforms. Consistency in interaction patterns, visual feedback, and theming creates trust and reduces cognitive load. Cross-platform consistency in behavior (while respecting platform conventions) ensures maintainability.

### III. Performance Requirements

App launch time MUST NOT exceed 3 seconds on mid-range devices (2-year-old hardware). Screen transitions MUST maintain 60fps (or 120fps on ProMotion displays). Bundle size MUST remain under 50MB for over-the-air updates. Memory usage MUST NOT exceed 200MB during normal operation. All list rendering MUST use FlatList or optimized virtualization.

**Rationale**: Performance directly impacts user retention and satisfaction. React Native apps compete with fully native apps, requiring strict performance discipline. Expo's OTA updates depend on reasonable bundle sizes, and mobile devices have limited memory compared to desktop environments.

## Performance Standards

### Measurement & Monitoring

- Frame rate monitoring MUST be enabled during development using React DevTools Profiler
- Bundle analysis MUST be performed before each release using Metro bundler's analysis tools
- Memory profiling MUST be conducted for all new features affecting data-heavy screens
- Network request performance MUST be tracked with maximum 2-second timeout for API calls
- Startup performance MUST be measured using Expo's built-in performance monitoring

### Optimization Requirements

- Images MUST use expo-image with appropriate caching and optimization strategies
- Animations MUST use react-native-reanimated for native thread execution
- Heavy computations MUST be offloaded using react-native-worklets when possible
- Navigation transitions MUST use native drivers (useNativeDriver: true)
- Re-renders MUST be minimized using React.memo, useMemo, and useCallback appropriately

## Development Workflow

### Code Organization

- Components MUST be organized by feature, not by type
- Shared UI components MUST reside in the components/ui/ directory
- Custom hooks MUST be placed in the hooks/ directory with descriptive names
- Constants MUST be centralized in the constants/ directory
- Type definitions MUST be co-located with their respective modules

### Quality Gates

- All pull requests MUST pass ESLint checks with zero errors or warnings
- TypeScript compilation MUST succeed with strict mode enabled
- All new components MUST be tested on both iOS and Android before merge
- Breaking changes MUST be documented in CHANGELOG.md with migration guides
- Performance regressions MUST be identified and addressed before merge

### Testing Strategy (when tests are required)

- Unit tests MUST cover utility functions and business logic
- Component tests MUST verify rendering and user interactions
- Integration tests MUST validate navigation flows and data fetching
- Platform-specific features MUST be tested on actual devices, not just simulators
- Accessibility testing MUST verify VoiceOver/TalkBack compatibility

## Governance

This constitution supersedes all other development practices and guidelines. All code reviews, feature implementations, and architectural decisions MUST comply with these principles. When principles conflict with external dependencies or platform limitations, violations MUST be documented with justification in the relevant pull request or architecture decision record.

### Amendment Process

Constitution amendments require:
1. Documented rationale explaining the need for change
2. Impact analysis on existing codebase and templates
3. Migration plan for bringing existing code into compliance
4. Approval from project maintainers
5. Version increment following semantic versioning (see below)

### Versioning Policy

- **MAJOR** version bump: Backward-incompatible governance changes or principle removals
- **MINOR** version bump: New principles added or existing principles materially expanded
- **PATCH** version bump: Clarifications, wording improvements, or non-semantic refinements

### Compliance Reviews

- Monthly reviews of new code against constitution principles
- Automated enforcement through ESLint, TypeScript compiler, and CI/CD pipelines
- Quarterly retrospectives to assess principle effectiveness and identify needed amendments

**Version**: 1.0.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
