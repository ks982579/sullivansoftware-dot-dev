# TypeScript Configuration

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
// Instead of:
import Component from '../../../components/MyComponent'
import { helper } from '../../lib/utils'

// You can use:
import Component from '@/components/MyComponent'
import { helper } from '@/lib/utils'
```

### Available Aliases

- `@/*` - Root src directory
- `@/components/*` - Components directory
- `@/lib/*` - Utility functions and libraries
- `@/theme/*` - Theme configuration
- `@/app/*` - App directory (pages, layouts)
- `@/content/*` - Content directory (markdown files)

## Strict Type Checking

The project uses strict TypeScript settings for better code quality:

- ✅ `strict: true` - All strict type checking options enabled
- ✅ `noUnusedLocals: true` - Error on unused local variables
- ✅ `noUnusedParameters: true` - Error on unused function parameters
- ✅ `noFallthroughCasesInSwitch: true` - Error on switch fallthrough
- ✅ `forceConsistentCasingInFileNames: true` - Enforce consistent casing
- ✅ `noImplicitOverride: true` - Require override keyword

## Usage Tips

### Importing Components
```typescript
import Button from '@/components/Button'
import { theme } from '@/theme/theme'
import { getAllPosts } from '@/lib/blog'
```

### Type Safety
Always define proper types for:
- Component props
- Function parameters and return values
- State variables
- API responses

### Example Component
```typescript
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({
  children,
  onClick,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  );
}
```

## Scripts

- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run build` - Build includes automatic type checking
- `npm run lint` - ESLint includes TypeScript rules
