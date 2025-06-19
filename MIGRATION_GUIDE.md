# 🔄 Migration Guide

## Import Changes

### Before (Multiple Sources)
```typescript
import { TNote } from '@/types/notes'
import { TFolder } from '@/modules/folder-management/types'  
import { TNote as RepoNote } from '@/repositories/types'
```

### After (Single Source)
```typescript
import { TNote, TFolder } from '@/domain/entities/workspace'
```

## File Relocations

| Old Location | New Location |
|-------------|-------------|
| `src/modules/folder-management` | `src/application/features/workspace` |
| `src/modules/notes` | `src/application/features/workspace` |
| `src/components/ui` | `src/presentation/components/ui` |
| `src/app/routes` | `src/presentation/views` |
| `src/utilities` | `src/shared/utils` |
| `src/core` | `src/infrastructure` |

## Architecture Benefits

1. **Single Source of Truth** - All types in domain layer
2. **Clear Boundaries** - Each layer has specific responsibilities  
3. **Consistent Patterns** - Unified approach across features
4. **Better Testing** - Clean dependencies enable mocking
5. **Scalability** - New features follow established patterns

## Next Steps

1. Update imports throughout codebase
2. Move files to new locations
3. Remove duplicate/unused files
4. Test all functionality
5. Update documentation
