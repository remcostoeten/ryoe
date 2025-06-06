# Performance Optimizations

This document outlines the performance optimizations implemented in the Ryoe application to ensure fast loading times and smooth user experience.

## Bundle Size Optimizations

### Code Splitting Strategy

The application uses strategic code splitting to reduce initial bundle sizes:

```typescript
// Lazy load heavy components
const BlockNoteEditor = lazy(() => import('./BlockNoteEditor'))
const FolderTree = lazy(() => import('@/modules/folder-management/components/folder-tree'))
const NoteList = lazy(() => import('@/modules/notes/components/note-list'))
```

### Manual Chunk Configuration

Vite is configured with manual chunks to optimize vendor code splitting:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['framer-motion', 'lucide-react'],
        'query-vendor': ['@tanstack/react-query'],
        'editor-vendor': ['@blocknote/core', '@blocknote/react'],
        'db-vendor': ['@libsql/client', 'drizzle-orm'],
        'tauri-vendor': ['@tauri-apps/api', '@tauri-apps/plugin-store'],
        'three-vendor': ['three', '@react-three/fiber'],
        'mdx-vendor': ['@mdx-js/react', 'rehype-highlight', 'remark-gfm']
      }
    }
  }
}
```

## Bundle Size Results

### Before Optimization:
- **notes page**: 766.85 kB (231.68 kB gzipped)

### After Optimization:
- **notes page**: 14.59 kB (4.31 kB gzipped) - **98% reduction**
- **editor-vendor**: 950.28 kB (291.35 kB gzipped) - *lazy loaded*

## Component Optimizations

### Dual Editor Mode

The note editor supports both lightweight and rich text modes:

```typescript
// Simple text editor (default) - no heavy dependencies
<textarea 
  value={content} 
  onChange={onChange}
  className="w-full h-full min-h-[400px] p-4"
/>

// Rich text editor (lazy loaded) - BlockNote editor
<Suspense fallback={<LoadingSpinner />}>
  <BlockNoteEditor 
    initialContent={content}
    onChange={onChange}
  />
</Suspense>
```

### Memoization

Critical components are memoized to prevent unnecessary re-renders:

```typescript
export const NoteEditor = memo(function NoteEditor({ ... }) {
  // Component implementation
})
```

### Loading States

Proper loading states ensure smooth user experience:

```typescript
<Suspense fallback={
  <div className="animate-pulse space-y-2">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
}>
  <HeavyComponent />
</Suspense>
```

## Best Practices

1. **Lazy Load Heavy Dependencies**: Only load rich text editor when needed
2. **Strategic Code Splitting**: Separate vendor chunks by functionality
3. **Component Memoization**: Prevent unnecessary re-renders
4. **Progressive Enhancement**: Start with lightweight components, upgrade when needed
5. **Loading States**: Always provide feedback during async operations

## Monitoring

Use the build output to monitor chunk sizes:

```bash
bun run build
# Check for chunks larger than 500kB
# Consider further splitting if needed
```

## Future Optimizations

- [ ] Implement virtual scrolling for large note lists
- [ ] Add service worker for caching
- [ ] Optimize image loading with lazy loading
- [ ] Consider using Web Workers for heavy computations
