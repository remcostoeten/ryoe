# Development Module

This module provides development tools and utilities for building and testing the application, including database management and a custom component showcase system.

## Overview

The development module consists of two main sub-modules:

1. **Database Management** - Tools for managing database operations, health monitoring, and data operations
2. **Demo Showcase** - A custom Storybook-like implementation for demonstrating UI components

## Features

### Database Management

- **Health Monitoring**: Real-time database connection health tracking
- **Reset Operations**: Soft reset (clear data) and hard reset (drop/recreate tables)
- **Action Confirmations**: Safety confirmations for destructive operations
- **Visual Status Indicators**: Color-coded status badges and real-time updates

### Demo Showcase

- **Component Demonstrations**: Interactive showcases of UI components
- **Multiple States**: Display components in different states and configurations
- **Action Triggers**: Buttons to trigger component actions (e.g., Toast notifications)
- **Code Examples**: Syntax-highlighted code blocks showing usage
- **Search & Filter**: Find components by name, category, or tags
- **Responsive Design**: Works on both desktop and mobile devices

## Usage

### Accessing the Development Module

Navigate to `/development` in your application to access the development tools.

### Adding New Component Demonstrations

1. Create a new demo file in `src/modules/development/demo-showcase/demos/`
2. Use the factory functions to create your demo:

```typescript
import { createComponentDemo } from '../factories'
import { registerDemo } from '../registry'
import { YourComponent } from '@/components/ui/your-component'

const yourDemo = createComponentDemo({
  id: 'your-component-demo',
  title: 'Your Component',
  description: 'Description of your component',
  component: YourComponent,
  code: `import { YourComponent } from '@/components/ui/your-component'

<YourComponent prop="value" />`,
  category: 'UI Components',
  defaultProps: {
    prop: 'default value'
  },
  states: [
    {
      label: 'State Name',
      description: 'Description of this state',
      props: {
        prop: 'state value'
      }
    }
  ],
  actions: [
    {
      label: 'Action Name',
      description: 'What this action does',
      action: () => {
        // Action implementation
      }
    }
  ]
})

registerDemo(yourDemo, 'UI Components', ['tag1', 'tag2'])
```

3. Import your demo in `src/modules/development/demo-showcase/demos/init.ts`

### Toast Demonstrations

Use the special `createToastDemo` factory for Toast components:

```typescript
import { createToastDemo } from '../factories'
import { registerDemo } from '../registry'

const toastDemo = createToastDemo({
  id: 'toast-demo',
  title: 'Toast Notifications',
  description: 'Interactive toast notifications',
  actions: [
    {
      label: 'Success Toast',
      toastType: 'success',
      message: 'Operation completed successfully!',
      duration: 3000
    }
  ]
})

registerDemo(toastDemo, 'UI Components', ['toast', 'notification'])
```

## Architecture

### Registry System

The demo showcase uses a registry pattern to manage component demonstrations:

- `DemoRegistry` - Central store for all demos
- `registerDemo()` - Register new demos
- `getAllDemos()` - Get all registered demos
- `searchDemos()` - Search demos by query

### Factory Pattern

Factory functions provide a consistent way to create demonstrations:

- `createComponentDemo()` - General component demos
- `createToastDemo()` - Specialized Toast demos

### Type System

Comprehensive TypeScript types ensure type safety:

- `ComponentDemo` - Main demo interface
- `DemoState` - Component state definition
- `DemoAction` - Action definition
- `DemoShowcaseProps` - Showcase component props

## Design Principles

### Consistency
All components follow the same design schema used in the onboarding flow, with gradient backgrounds, backdrop blur effects, and consistent spacing.

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Semantic HTML structure

### Performance
- Lazy loading of demos
- Efficient search and filtering
- Minimal re-renders
- Optimized bundle splitting

## Development Guidelines

### Adding New Database Actions

1. Define the action in `DatabaseAction` interface
2. Add the action to the `databaseActions` array in `DatabaseManagement.tsx`
3. Implement the action handler
4. Add appropriate confirmation dialogs for destructive actions

### Extending the Showcase

1. New component types can be added by extending the factory functions
2. Custom render wrappers can be used for specialized display needs
3. Actions can trigger any side effects (API calls, state changes, etc.)

## File Structure

```
src/modules/development/
├── index.ts                    # Main module exports
├── database/                   # Database management sub-module
│   ├── components/
│   │   └── DatabaseManagement.tsx
│   ├── hooks/
│   │   └── index.ts
│   ├── types.ts
│   └── index.ts
├── demo-showcase/              # Demo showcase sub-module
│   ├── components/
│   │   ├── DemoShowcase.tsx
│   │   └── index.ts
│   ├── demos/                  # Individual demo definitions
│   │   ├── init.ts
│   │   ├── toast-demo.ts
│   │   └── button-demo.ts
│   ├── factories/
│   │   ├── createComponentDemo.ts
│   │   └── index.ts
│   ├── registry.ts
│   ├── types.ts
│   └── index.ts
└── README.md                   # This file
```

## Contributing

When adding new development tools:

1. Follow the existing patterns and conventions
2. Add comprehensive TypeScript types
3. Include documentation and examples
4. Test the functionality thoroughly
5. Update this README if needed

## Future Enhancements

Potential improvements for the development module:

- **Props Editor**: Interactive props editing for components
- **Performance Monitoring**: Component render performance tracking
- **Export Functionality**: Export demos as standalone files
- **Theme Testing**: Test components across different themes
- **Accessibility Testing**: Built-in accessibility checks
- **Visual Regression Testing**: Screenshot comparison tools 